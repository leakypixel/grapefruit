const minify = require("html-minifier").minify;

module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    input.currentJob.files = input.currentJob.files.map(file => ({
      ...file,
      content: minify(file.content, {
        removeAttributeQuotes: true,
        minifyCSS: true,
        minifyJS: true,
        collapseWhitespace: true,
      }),
    }));
    resolve(input);
  });
};
