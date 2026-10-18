const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const svgPath = path.join(__dirname, "..", "public", "icon.svg");
const svgBuffer = fs.readFileSync(svgPath);

const targets = [
  { file: path.join(__dirname, "..", "public", "icon-48.png"), size: 48 },
  { file: path.join(__dirname, "..", "public", "icon-96.png"), size: 96 },
  { file: path.join(__dirname, "..", "public", "icon-144.png"), size: 144 },
  { file: path.join(__dirname, "..", "public", "icon-192.png"), size: 192 },
  { file: path.join(__dirname, "..", "public", "icon-512.png"), size: 512 },
  { file: path.join(__dirname, "..", "public", "logo.png"), size: 512 },
  { file: path.join(__dirname, "..", "public", "apple-touch-icon.png"), size: 180 },
  { file: path.join(__dirname, "..", "public", "favicon.ico"), size: 32 },
  { file: path.join(__dirname, "..", "src", "app", "icon.png"), size: 32 },
  { file: path.join(__dirname, "..", "src", "app", "apple-icon.png"), size: 180 },
  { file: path.join(__dirname, "..", "src", "app", "favicon.ico"), size: 32 },
];

async function generate() {
  for (const target of targets) {
    const dir = path.dirname(target.file);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    await sharp(svgBuffer)
      .resize(target.size, target.size)
      .png()
      .toFile(target.file);

    console.log(`Generated: ${target.file} (${target.size}x${target.size})`);
  }
  console.log("All icons successfully generated!");
}

generate().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
