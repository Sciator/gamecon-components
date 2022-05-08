const fs = require("fs");
const path = require("path");

if (process.platform !== "win32") {
  throw new Error("other platforms than win not currently suported. Copy new version manualy");
}

const source = "./src";
const target = "C:\\wamp64\\www\\gamecon\\web\\soubory\\blackarrow\\_komponenty";

/**
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 * @source modified - https://stackoverflow.com/a/22185855
 */
var copyRecursiveSync = function (src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest))
      fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
        path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
};

fs.rmdirSync(target, {recursive: true});
copyRecursiveSync(source, target);


