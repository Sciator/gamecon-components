const fs = require("fs");
const path = require("path");
const { copyRecursiveSync } = require("./utils");
const BUILD_PATH = path.resolve(__dirname, "../build");
const SRC_PATH = path.resolve(__dirname, "../src");

fs.rmdirSync(BUILD_PATH, { recursive: true });

copyRecursiveSync(SRC_PATH, BUILD_PATH, [".css"]);
