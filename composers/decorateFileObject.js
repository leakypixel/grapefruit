const path = require("path");

module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    input.currentJob.files = input.currentJob.files.map(
      file =>
        typeof file === "string"
          ? options.decorator(
            {
              path: file,
              ...path.parse(file),
              jobName: input.currentJob.name,
            },
            { path: file }
          )
          : options.decorator(
            {
              path: file.path,
              ...path.parse(file.path),
              jobName: input.currentJob.name,
            },
            file
          )
    );
    resolve(input);
  });
};
