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
              templateName: "example",
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
              path: "./templates/example.html",
            },
            {
              path: "./templates/example2.html",
            },
          ],
        },
        {
          name: "listing",
          options: {
            renderTemplate: {
              templateJobName: "template",
              templateName: "example2",
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
          files: ["./markdown/test.md"],
        },
      ],
    },
  ],
};
