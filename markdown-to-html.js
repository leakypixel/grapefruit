const handlebarsCompiler = require("handlebars").compile;
const fs = require("careless-fs");
const markdown = require("markdown").markdown;
const Grapefruit = require("./grapefruit");

const config = require("./config/files.json");

function done() {
  console.log("Done!");
}

Grapefruit.composers = {
  readInFile: function(input) {
    return new Promise(function(resolve, reject) {
      fs
        .read(input.currentJob.files)
        .then(function(data) {
          input.buffers[input.currentJob.bufferName] = data;
          resolve(input);
        })
        .catch(function(err) {
          reject(err);
        });
    });
  },
  writeOutHtml: function(input) {
    return new Promise(function(resolve, reject) {
      Promise.all(
        input.buffers.renderedHtml.map(file => {
          return fs.write({
            path: file.outputPath,
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
  },
  handleBarsToHtml: function(input) {
    return new Promise(function(resolve) {
      input.buffers.html = input.buffers[input.currentJob.bufferName].map(
        buffer => ({
          ...buffer,
          content: handlebarsCompiler(buffer.content)(input)
        })
      );
      resolve(input);
    });
  },
  compileTemplates: function(input) {
    return new Promise(function(resolve) {
      input.buffers.compiledTemplates = input.buffers[
        input.currentJob.bufferName
      ].map(buffer => ({
        ...buffer,
        content: handlebarsCompiler(buffer.content)
      }));
      resolve(input);
    });
  },
  renderTemplate: function(input) {
    return new Promise(function(resolve) {
      input.buffers.renderedHtml = input.currentJob.files.map(file => {
        let markdown = input.buffers.renderedMarkdown.find(
          obj => obj.name === file.markdown
        );
        let template = input.buffers.compiledTemplates.find(
          obj => obj.name === file.template
        );

        return {
          ...file,
          content: template.content({ ...markdown, data: input.data })
        };
      });
      resolve(input);
    });
  },
  markdownToHtml: function(input) {
    return new Promise(function(resolve) {
      input.buffers.renderedMarkdown = input.buffers.markdown.map(buffer => ({
        ...buffer,
        content: markdown.toHTML(buffer.content)
      }));
      resolve(input);
    });
  }
};

config.files.forEach(file => {
  let pipeline = new Grapefruit(file);
  pipeline
    .series([
      { composers: ["readInFile"] },
      { composers: ["markdownToHtml", "compileTemplates"] },
      { composers: ["renderTemplate"] },
      { composers: ["writeOutHtml"] }
    ])
    .then(function() {
      done(file);
    })
    .catch(function(err) {
      console.log("ERROR:", err);
    });
});
