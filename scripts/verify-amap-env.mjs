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
    const normalizedValue = rawValue.replace(/^['"]|['"]$/g, "");
    process.env[key] = normalizedValue;
  }
}

for (const file of envFiles) {
  loadEnvFile(path.join(cwd, file));
}

const mapKey = process.env.NEXT_PUBLIC_AMAP_KEY?.trim();
const securityCode = process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE?.trim();
const serviceHost = process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST?.trim();
const weatherKey = process.env.AMAP_WEATHER_KEY?.trim();
const dashscopeApiKey = process.env.DASHSCOPE_API_KEY?.trim();

const missing = [];

if (!mapKey) {
  missing.push("NEXT_PUBLIC_AMAP_KEY");
}

if (!securityCode && !serviceHost) {
  missing.push(
    "NEXT_PUBLIC_AMAP_SECURITY_JS_CODE \u6216 NEXT_PUBLIC_AMAP_SERVICE_HOST",
  );
}

if (!weatherKey) {
  missing.push("AMAP_WEATHER_KEY");
}

if (!dashscopeApiKey) {
  missing.push("DASHSCOPE_API_KEY");
}

if (missing.length > 0) {
  console.error(
    `\u7f3a\u5c11\u5fc5\u8981\u73af\u5883\u53d8\u91cf\uff1a${missing.join("\u3001")}`,
  );
  process.exit(1);
}

console.log(
  "\u5730\u56fe\u3001\u5929\u6c14\u548c\u89c2\u9e1f\u6307\u6570\u670d\u52a1\u7684\u73af\u5883\u53d8\u91cf\u5747\u5df2\u914d\u7f6e\u3002",
);
