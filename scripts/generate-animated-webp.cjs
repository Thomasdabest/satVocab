#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const IMAGES_DIR = path.join(ROOT, "images");
const PART_FILES = [
  path.join(ROOT, "sat_vocab_part1.csv"),
  path.join(ROOT, "sat_vocab_part2.csv"),
];

const DEFAULTS = {
  model: process.env.GEMINI_IMAGE_MODEL || "imagen-4.0-generate-001",
  imageSize: process.env.GEMINI_IMAGE_SIZE || "2K",
  aspectRatio: process.env.GEMINI_IMAGE_ASPECT || "16:9",
  personGeneration: process.env.GEMINI_IMAGE_PERSON || "allow_adult",
  outputWidth: Number(process.env.IMAGE_OUTPUT_WIDTH || 1205),
  outputHeight: Number(process.env.IMAGE_OUTPUT_HEIGHT || 280),
  frameCount: Number(process.env.IMAGE_FRAME_COUNT || 12),
  frameDelay: Number(process.env.IMAGE_FRAME_DELAY_MS || 70),
  zoom: Number(process.env.IMAGE_ZOOM || 0.12),
  limit: Number.POSITIVE_INFINITY,
  start: 0,
  delay: Number(process.env.GEMINI_IMAGE_DELAY_MS || 0),
  overwrite: false,
  dryRun: false,
  endpoint: process.env.GEMINI_IMAGE_ENDPOINT || "",
};

const parseArgs = (argv) => {
  const options = { ...DEFAULTS };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--limit") {
      options.limit = Number(argv[++i]);
    } else if (arg === "--start") {
      options.start = Number(argv[++i]);
    } else if (arg === "--model") {
      options.model = argv[++i];
    } else if (arg === "--image-size") {
      options.imageSize = argv[++i];
    } else if (arg === "--aspect-ratio") {
      options.aspectRatio = argv[++i];
    } else if (arg === "--person-generation") {
      options.personGeneration = argv[++i];
    } else if (arg === "--width") {
      options.outputWidth = Number(argv[++i]);
    } else if (arg === "--height") {
      options.outputHeight = Number(argv[++i]);
    } else if (arg === "--frame-count") {
      options.frameCount = Number(argv[++i]);
    } else if (arg === "--frame-delay") {
      options.frameDelay = Number(argv[++i]);
    } else if (arg === "--zoom") {
      options.zoom = Number(argv[++i]);
    } else if (arg === "--delay") {
      options.delay = Number(argv[++i]);
    } else if (arg === "--overwrite") {
      options.overwrite = true;
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else if (arg === "--endpoint") {
      options.endpoint = argv[++i];
    }
  }
  return options;
};

const loadEnv = () => {
  if (!fs.existsSync(ENV_PATH)) return;
  const raw = fs.readFileSync(ENV_PATH, "utf8");
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) return;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
};

const parseCsvLine = (line) => {
  const fields = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      fields.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields.map((field) => field.trim());
};

const loadVocab = () => {
  const entries = [];
  for (const file of PART_FILES) {
    if (!fs.existsSync(file)) continue;
    const raw = fs.readFileSync(file, "utf8");
    const lines = raw.split(/\r?\n/).filter(Boolean);
    if (!lines.length) continue;
    const header = parseCsvLine(lines[0]);
    const wordIndex = header.indexOf("word");
    const meaningIndex = header.indexOf("meaning");
    for (let i = 1; i < lines.length; i += 1) {
      const fields = parseCsvLine(lines[i]);
      const word = fields[wordIndex] || fields[0];
      if (!word) continue;
      entries.push({
        word,
        meaning: meaningIndex >= 0 ? fields[meaningIndex] || "" : "",
      });
    }
  }
  const seen = new Set();
  const deduped = [];
  for (const entry of entries) {
    const key = entry.word.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }
  return deduped;
};

const slugifyWord = (word) =>
  word
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildPrompt = (entry) => {
  const definition = entry.meaning ? `Meaning: ${entry.meaning}.` : "";
  return [
    `Create a friendly, vivid 2D cartoon illustration representing the word "${entry.word}".`,
    definition,
    "Ultra-wide banner composition with the main subject centered and extra horizontal space.",
    "No text or letters.",
    "Clean outlines, bright colors, simple shapes, educational style.",
  ]
    .filter(Boolean)
    .join(" ");
};

const requestImage = async (options, prompt) => {
  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        imageSize: options.imageSize,
        aspectRatio: options.aspectRatio,
        personGeneration: options.personGeneration,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const prediction = data?.predictions?.[0] || data?.predictions?.[0]?.content;
  const imageB64 =
    prediction?.bytesBase64Encoded ||
    prediction?.image?.bytesBase64Encoded ||
    prediction?.imageBytes ||
    prediction?.image?.imageBytes ||
    data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data ||
    data?.candidates?.[0]?.content?.parts?.[0]?.inline_data?.data;

  if (!imageB64) {
    throw new Error("Gemini response missing image data.");
  }

  return imageB64;
};

const requestWithRetry = async (options, prompt, retries = 3) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestImage(options, prompt);
    } catch (error) {
      lastError = error;
      const delay = 700 * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  throw lastError;
};

const createAnimatedWebp = async (buffer, options) => {
  const sharp = require("sharp");
  const GIF = require("sharp-gif2");

  const targetWidth = options.outputWidth;
  const targetHeight = options.outputHeight;
  const zoom = Math.max(0, options.zoom || 0);
  const baseWidth = Math.round(targetWidth * (1 + zoom));
  const baseHeight = Math.round(targetHeight * (1 + zoom));

  const baseBuffer = await sharp(buffer)
    .resize(baseWidth, baseHeight, { fit: "cover" })
    .toBuffer();

  const leftMax = Math.max(baseWidth - targetWidth, 0);
  const topMax = Math.max(baseHeight - targetHeight, 0);
  const topFixed = Math.round(topMax / 2);

  const frames = [];
  const frameCount = Math.max(2, options.frameCount || 12);
  for (let i = 0; i < frameCount; i += 1) {
    const t = frameCount === 1 ? 0 : i / (frameCount - 1);
    const pan = 0.5 - 0.5 * Math.cos(2 * Math.PI * t);
    const left = Math.round(leftMax * pan);
    const frameBuffer = await sharp(baseBuffer)
      .extract({
        left,
        top: topFixed,
        width: targetWidth,
        height: targetHeight,
      })
      .toBuffer();
    frames.push(sharp(frameBuffer));
  }

  const animation = GIF.createGif({
    width: targetWidth,
    height: targetHeight,
    delay: options.frameDelay,
    repeat: 0,
  });

  frames.forEach((frame) => animation.addFrame(frame));
  return animation.toSharp();
};

const main = async () => {
  loadEnv();
  const options = parseArgs(process.argv);
  if (!options.endpoint) {
    options.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${options.model}:predict`;
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("Missing GEMINI_API_KEY. Add it to .env or export it.");
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const vocab = loadVocab();
  const total = vocab.length;

  if (!Number.isFinite(options.limit)) {
    options.limit = total;
  }

  let processed = 0;
  for (let index = options.start; index < total; index += 1) {
    if (processed >= options.limit) break;
    const entry = vocab[index];
    const slug = slugifyWord(entry.word);
    const fileName = `${slug}.webp`;
    const outputPath = path.join(IMAGES_DIR, fileName);

    if (!options.overwrite && fs.existsSync(outputPath)) {
      process.stdout.write(`Skipping ${entry.word} (exists)\n`);
      processed += 1;
      continue;
    }

    const prompt = buildPrompt(entry);
    process.stdout.write(
      `Generating ${entry.word} (${index + 1}/${total}) -> ${fileName}\n`
    );

    if (options.dryRun) {
      processed += 1;
      continue;
    }

    try {
      const b64 = await requestWithRetry(options, prompt);
      const buffer = Buffer.from(b64, "base64");
      const animated = await createAnimatedWebp(buffer, options);
      await animated.webp({
        quality: 80,
        effort: 4,
        loop: 0,
        delay: options.frameDelay,
        animated: true,
      });
      await animated.toFile(outputPath);
    } catch (error) {
      console.error(`Failed ${entry.word}: ${error.message}`);
    }

    processed += 1;
    if (options.delay > 0) {
      await sleep(options.delay);
    }
  }

  process.stdout.write("Done.\n");
};

main();
