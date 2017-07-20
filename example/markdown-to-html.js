const handlebarsCompiler = require("handlebars").compile;
const fs = require("careless-fs");
const markdown = require( "markdown" ).markdown;
const Grapefruit = require("grapefruit");

const config = require("./config/files.json");

function done(file) {
  console.log("done! \n",JSON.stringify(file, " ", "  "));
}

Grapefruit.composers = {
  readInFile: 
    function(input) {
      console.log(input);
      return new Promise(function(resolve, reject) {
        fs.read(input.currentJob.files).then(function(data) {
          input.buffers[input.currentJob.bufferName] = data;
          resolve(input);
        })
        .catch(function(err) {
          console.log("ERROR:", err);
        });
      });
    },
  writeOutHtml: 
    function(input) {
      return new Promise(function(resolve, reject) {
        let file = {
          path: input.currentJob.files.path,
          data: input.buffers.html
        };
        fs.write(file).then(function(data) {
          resolve(input);
        })
        .catch(function(err) {
          console.log("ERROR:", err);
        });
      });
    },
  handleBarsToHtml:
    function(input) {
      return new Promise(function(resolve, reject) {
        input.buffers.html = input.buffers[input.currentJob.bufferName].map(content => handlebarsCompiler(content)(input));
        resolve(input);
      });
    },
  markdownToHtml:
    function(input) {
      return new Promise(function(resolve, reject) {
        input.buffers.renderedMarkdown = markdown.toHTML(input.buffers.markdown);
        resolve(input);
      });
    }
};

for (var x = 0; x < config.files.length; x++) {
  let file = new Grapefruit(config.files[x]);
  file.series([
    {"composers": "readInFile"}, 
    {"composers": "markdownToHtml"}, 
    {"composers": "handleBarsToHtml"},
    {"composers": "writeOutHtml"}
  ])
    .then(function() {
      done(file);
    })
    .catch(function(err) {
      console.log("ERROR:", err);
    });
}
