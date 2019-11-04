const fsN = require("fs");
const path = require("path");

module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    fsN.readdir(input.currentJob.files, function(err, filenames) {
      if (err) {
        reject(err);
      }
      input.currentJob.files = filenames.map(filename =>
        path.join(input.currentJob.files, filename)
      );
      resolve(input);
    });
  });
};
