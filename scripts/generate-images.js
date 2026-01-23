#!/usr/bin/env node
import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const ENV_PATH = path.join(ROOT, ".env");
const IMAGES_DIR = path.join(ROOT, "images");
const PART_FILES = [
  path.join(ROOT, "sat_vocab_part1.csv"),
  path.join(ROOT, "sat_vocab_part2.csv"),
];

const DEFAULTS = {
  model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini",
  size: process.env.OPENAI_IMAGE_SIZE || "1024x1024",
  quality: process.env.OPENAI_IMAGE_QUALITY || "low",
  format: process.env.OPENAI_IMAGE_FORMAT || "jpeg",
  compression: Number(process.env.OPENAI_IMAGE_COMPRESSION || 80),
  limit: Number.POSITIVE_INFINITY,
  start: 0,
  delay: Number(process.env.OPENAI_IMAGE_DELAY_MS || 0),
  overwrite: false,
  dryRun: false,
  endpoint: "https://api.openai.com/v1/images/generations",
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
    } else if (arg === "--size") {
      options.size = argv[++i];
    } else if (arg === "--quality") {
      options.quality = argv[++i];
    } else if (arg === "--format") {
      options.format = argv[++i];
    } else if (arg === "--compression") {
      options.compression = Number(argv[++i]);
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

const extensionFor = (format) => {
  if (format === "jpeg" || format === "jpg") return "jpg";
  if (format === "png") return "png";
  if (format === "webp") return "webp";
  return format;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildPrompt = (entry) => {
  const definition = entry.meaning ? `Meaning: ${entry.meaning}.` : "";
  return [
    `Create a vivid, single-scene cartoon illustration that represents the word \"${entry.word}\".`,
    definition,
    "No text or letters.",
    "Clear subject, simple shapes, clean outlines, bright colors, friendly educational style.",
    "High-quality 2D cartoon illustration.",
  ]
    .filter(Boolean)
    .join(" ");
};

const requestImage = async (options, prompt) => {
  const response = await fetch(options.endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: options.model,
      prompt,
      size: options.size,
      quality: options.quality,
      n: 1,
      output_format: options.format,
      output_compression: options.compression,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  const image = data?.data?.[0]?.b64_json;
  if (!image) {
    throw new Error("OpenAI response missing image data.");
  }
  return image;
};

const requestWithRetry = async (options, prompt, retries = 3) => {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestImage(options, prompt);
    } catch (error) {
      lastError = error;
      const delay = 500 * Math.pow(2, attempt);
      await sleep(delay);
    }
  }
  throw lastError;
};

const main = async () => {
  loadEnv();
  const options = parseArgs(process.argv);

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY. Add it to .env or export it.");
    process.exit(1);
  }

  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }

  const vocab = loadVocab();
  const total = vocab.length;
  const extension = extensionFor(options.format);

  if (!Number.isFinite(options.limit)) {
    options.limit = total;
  }

  let processed = 0;
  for (let index = options.start; index < total; index += 1) {
    if (processed >= options.limit) break;
    const entry = vocab[index];
    const slug = slugifyWord(entry.word);
    const fileName = `${slug}.${extension}`;
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
      fs.writeFileSync(outputPath, buffer);
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
