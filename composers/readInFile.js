const fs = require("careless-fs");

module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    fs.read(input.currentJob.files)
      .then(function(data) {
        input.currentJob.files = data;
        resolve(input);
      })
      .catch(function(err) {
        reject(err);
      });
  });
};
