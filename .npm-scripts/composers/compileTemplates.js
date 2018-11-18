const Handlebars = require("handlebars");
const handlebarsCompiler = Handlebars.compile;

module.exports = function(input, options) {
  return new Promise(function(resolve) {
    input.currentJob.files = input.currentJob.files.map(buffer => ({
      ...buffer,
      content: handlebarsCompiler(buffer.content),
    }));
    resolve(input);
  });
};
