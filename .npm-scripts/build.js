const Grapefruit = require("./grapefruit");

const config = require("../config/files");

function done(file) {
  console.log("Done!");
}

Grapefruit.composers = {
  listDirectory: require("./composers/listDirectory.js"),
  decorateFileObject: require("./composers/decorateFileObject.js"),
  readInFile: require("./composers/readInFile.js"),
  writeOutFile: require("./composers/writeOutFile.js"),
  compileTemplates: require("./composers/compileTemplates.js"),
  renderTemplate: require("./composers/renderTemplate.js"),
  markdownToHtml: require("./composers/markdownToHtml.js"),
  parseJson: require("./composers/parseJson.js")
};

config.files.forEach(file => {
  let pipeline = new Grapefruit(file);
  pipeline
    .series([
      { composers: ["listDirectory"] },
      { composers: ["readInFile", "parseJson"] },
      { composers: ["markdownToHtml", "compileTemplates"] },
      { composers: ["decorateFileObject"] },
      { composers: ["renderTemplate"] },
      { composers: ["writeOutFile"] }
    ])
    .then(function() {
      done(file);
    })
    .catch(function(err) {
      console.log("ERROR:", err);
    });
});
