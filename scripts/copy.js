const fs = require("fs");
const { copyRecursiveSync } = require("./utils");

if (process.platform !== "win32") {
  throw new Error("other platforms than win not currently suported. Copy new version manualy");
}

const source = ".\\src";
const target = "C:\\wamp64\\www\\gamecon\\web\\soubory\\blackarrow\\_komponenty";

fs.rmdirSync(target, {recursive: true});

copyRecursiveSync(source, target);
