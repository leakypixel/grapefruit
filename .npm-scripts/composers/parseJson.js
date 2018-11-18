module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    input.currentJob.files = input.currentJob.files.map(file => {
      return {
        ...file,
        content: JSON.parse(file.content),
      };
    });
    resolve(input);
  });
};
