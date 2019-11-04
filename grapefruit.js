var Grapefruit = (function() {
  const NOT_FOUND = -1;
  Grapefruit.composers = {};
  Grapefruit.globals = {};

  function Grapefruit(descriptor) {
    this.name = descriptor.name;
    this.data = descriptor.data || {};
    this.jobs = descriptor.jobs;
  }

  function selectJobs(set, criteria) {
    let keys = Object.keys(criteria);
    return set.filter(obj => {
      return keys.reduce((flag, key) => {
        return criteria[key].reduce((flag, val) => {
          if (obj[key].indexOf(val) > NOT_FOUND) {
            flag = true;
          }
          return flag;
        }, false);
      }, false);
    });
  }

  Grapefruit.prototype.series = function(criteriaArr) {
    return new Promise((resolve, reject) => {
      let recurse = criteriaArr => {
        this.compose(criteriaArr.shift()).then(() => {
          if (criteriaArr.length) {
            recurse(criteriaArr);
          } else {
            resolve();
          }
        });
      };
      recurse(criteriaArr);
    });
  };

  Grapefruit.prototype.runComposer = function(job, composerNames) {
    return new Promise(function(resolve, reject) {
      let index = 0;
      let runJobIfNeeded = function(composer) {
        return new Promise(function(resolve, reject) {
          if (!composerNames || composerNames.indexOf(composer) > -1) {
            console.log(
              Date.now().toString(),
              "Running composer:",
              composer,
              "on job:",
              job.currentJob.name
            );
            const options =
              (job.currentJob.options && job.currentJob.options[composer]) ||
              {};
            Grapefruit.composers[composer](job, options)
              .then(job => {
                console.log(
                  Date.now().toString(),
                  "Composer finished:",
                  composer
                );
                resolve(job);
              })
              .catch(e => console.log("caught:", e));
          } else {
            resolve(job);
          }
        });
      };

      let recurse = function(job, done) {
        runJobIfNeeded(job.currentJob.composers[index]).then(function(job) {
          if (index < job.currentJob.composers.length) {
            index++;
            recurse(job, done);
          } else {
            done(job);
          }
        });
      };

      recurse(job, resolve);
    });
  };

  Grapefruit.prototype.compose = function(criteria) {
    let _SELF = this;
    let jobs = selectJobs(this.jobs, criteria);
    let jobRunner = function(job) {
      return _SELF.runComposer(
        {
          currentJob: job,
          name: _SELF.name,
          data: _SELF.data,
          jobs: _SELF.jobs,
          globals: Grapefruit.globals,
        },
        criteria.composers
      );
    };
    return Promise.all(jobs.map(jobRunner));
  };

  return Grapefruit;
})();

module.exports = Grapefruit;
