module.exports = function(input, options) {
  return new Promise(function(resolve, reject) {
    try {
      input.currentJob.files = input.currentJob.files.map(file => {
        return {
          ...file,
          content: JSON.parse(file.content),
        };
      });
      resolve(input);
    } catch (e) {
      console.log("caught", e, input.currentJob.files);
      reject(e);
    }
  });
};
