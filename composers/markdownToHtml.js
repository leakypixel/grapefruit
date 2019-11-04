const markdown = require("markdown").markdown;

module.exports = function(input, options) {
  return new Promise(function(resolve) {
    input.currentJob.files = input.currentJob.files.map(buffer => {
      console.log(buffer);
      return {
        ...buffer,
        content: markdown.toHTML(buffer.content),
      };
    });
    resolve(input);
  });
};
