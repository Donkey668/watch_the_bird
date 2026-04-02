import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const envFiles = [
  ".env.local",
  ".env.development.local",
  ".env",
  ".env.development",
];

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const content = fs.readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) {
      continue;
    }

    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, "");
  }
}

for (const file of envFiles) {
  loadEnvFile(path.join(cwd, file));
}

const dashscopeApiKey = process.env.DASHSCOPE_API_KEY?.trim();

if (!dashscopeApiKey) {
  console.error("缺少必要环境变量：DASHSCOPE_API_KEY");
  process.exit(1);
}

console.log("鸟影识别所需的环境变量均已配置。");
