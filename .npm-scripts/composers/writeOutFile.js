const fs = require("careless-fs");
module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    Promise.all(
      input.currentJob.files.map(file => {
        return fs.write({
          path: `${options.outputDir}/${file.outputPath}${
            file.outputExtension
          }`,
          content: file.content
        });
      })
    )
      .then(function() {
        resolve(input);
      })
      .catch(function(err) {
        reject(err);
      });
    resolve(input);
  });
};
