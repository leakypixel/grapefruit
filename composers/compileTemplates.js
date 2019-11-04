const Handlebars = require("handlebars");
const handlebarsCompiler = Handlebars.compile;

Handlebars.registerHelper("grouped_each", function(every, context, options) {
  var out = "",
    subcontext = [],
    i;
  if (context && context.length > 0) {
    for (i = 0; i < context.length; i++) {
      if (i > 0 && i % every === 0) {
        out += options.fn(subcontext);
        subcontext = [];
      }
      subcontext.push(context[i]);
    }
    out += options.fn(subcontext);
  }
  return out;
});

module.exports = function(input, options) {
  return new Promise(function(resolve) {
    input.currentJob.files = input.currentJob.files.map(buffer => ({
      ...buffer,
      content: handlebarsCompiler(buffer.content),
    }));
    resolve(input);
  });
};
