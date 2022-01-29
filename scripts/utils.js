const fs = require("fs");
const path = require("path");

/**
 * @param {string} src  The path to the thing to copy.
 * @param {string} dest The path to the new copy.
 * @param {string[]} [ext] extension filter
 * @source modified - https://stackoverflow.com/a/22185855
 */
const copyRecursiveSync = function (src, dest, ext = undefined) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest))
      fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function (childItemName) {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName),
        ext
      );
    });
  } else {
    if (!ext || ext.some(x => path.extname(dest) === x))
      fs.copyFileSync(src, dest);
  }
};

module.exports = {
  copyRecursiveSync
};
