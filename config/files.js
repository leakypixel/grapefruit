function meta(metaData, file) {
  return {
    ...file,
    path: metaData.path,
    outputPath: `${metaData.name}.html`,
    name: metaData.name,
  };
}
function blogMeta(metaData, file) {
  return {
    ...file,
    path: metaData.path,
    outputPath: `/blog/${metaData.name}.html`,
    name: metaData.name,
    niceName: metaData.name.replace(/-/g, " "),
  };
}
module.exports = {
  files: [
    {
      name: "example",
      data: {
        test: "success",
      },
      jobs: [
        {
          name: "blog",
          composers: [
            "listDirectory",
            "decorateFileObject",
            "readInFile",
            "markdownToHtml",
            "renderTemplate",
            "writeOutFile",
          ],
          options: {
            renderTemplate: {
              templateJobName: "template",
              templateName: "blog-entryz",
            },
            writeOutFile: {
              outputDir: "./output",
            },
            decorateFileObject: {
              decorator: blogMeta,
            },
          },
          files: "./markdown/blog",
        },
        {
          name: "template",
          composers: ["decorateFileObject", "readInFile", "compileTemplates"],
          options: {
            decorateFileObject: {
              decorator: meta,
            },
          },
          files: [
            {
              path: "./templates/blog-entry.html",
            },
            {
              path: "./templates/listing.html",
            },
            {
              path: "./templates/index.html",
            },
          ],
        },
        {
          name: "index",
          options: {
            renderTemplate: {
              templateJobName: "template",
              templateName: "index",
            },
            writeOutFile: {
              outputDir: "./output",
            },
            decorateFileObject: {
              decorator: meta,
            },
          },
          composers: [
            "readInFile",
            "markdownToHtml",
            "decorateFileObject",
            "renderTemplate",
            "writeOutFile",
          ],
          files: ["./markdown/intro.md"],
        },
      ],
    },
  ],
};
