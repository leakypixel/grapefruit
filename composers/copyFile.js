const fsN = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");

module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    Promise.all(
      input.currentJob.files.map(file => {
        return new Promise(function(resolve, reject) {
          const outputPath = path.join(options.outputDir, file.outputPath);
          mkdirp(path.dirname(outputPath), function(err) {
            if (err) {
              reject(err);
            }
            fsN.copyFile(file.path, outputPath, function(err) {
              if (err) {
                reject(err);
              }
              resolve(file);
            });
          });
        });
      })
    )
      .then(res => resolve(input))
      .catch(err => reject(err));
  });
};
