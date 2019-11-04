function meta(metaData, file) {
  return {
    ...file,
    path: metaData.path,
    outputPath: `${metaData.name}`,
    outputExtension: ".html",
    name: metaData.name,
  };
}
function blogMeta(metaData, file) {
  const introStart = file.content.indexOf("<p>") + 3;
  const blurb = file.content.substring(
    introStart,
    file.content.indexOf("</p>")
  );
  return {
    ...file,
    path: metaData.path,
    outputPath: `/blog/${metaData.name}`,
    outputExtension: ".html",
    name: metaData.name,
    niceName: metaData.name.replace(/-/g, " "),
    blurb: blurb,
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
            "minifyHtml",
            "writeOutFile",
          ],
          options: {
            renderTemplate: {
              templateJobName: "template",
              templateName: "blog-entry",
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
              templateName: "listing",
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
