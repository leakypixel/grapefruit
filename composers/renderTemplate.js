function toObject(arr) {
  let rv = {};
  let i;
  for (i = 0; i < arr.length; ++i) rv[arr[i].name] = arr[i];
  return rv;
}
module.exports = function(input, options) {
  return new Promise(function(resolve) {
    input.currentJob.files = input.currentJob.files.map(file => {
      let templateJob = input.jobs.find(
        obj => obj.name === options.templateJobName
      );
      let template = templateJob.files.find(
        obj => obj.name === options.templateName
      );

      return {
        ...file,
        content: template.content({
          ...file,
          data: input.data,
          meta: { ...input, jobs: toObject(input.jobs) },
        }),
      };
    });
    resolve(input);
  });
};
