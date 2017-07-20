var Grapefruit = (function() {
  Grapefruit.composers = {};
  Grapefruit.globals = {};

  function Grapefruit(descriptor) {
    this.name = descriptor.name;
    this.data = descriptor.data;
    this.jobs = descriptor.jobs;
    this.buffers = {};
  }

  function selectJobs(batch, criteria) {
    let results = [];
    let filter = function(item) {
      let keys = Object.keys(criteria);
      for (let x = 0; x < keys.length; x++) {
        let key = keys[x];
        if (item[key].indexOf(criteria[key]) > -1) {
          return true;
        }
        break;
      };
      return false;
    }

    Object.keys(batch).forEach(function(key) {
      if (Array.isArray(batch[key])) {
        results = results.concat(batch[key].filter(filter));
      } else {
        if (filter(batch[key])) {
          results = results.concat(batch[key]);
        }
      }
    });
    
    return results;
  }

  Grapefruit.prototype.series = function(criteriaArr) {
    return new Promise((resolve, reject) => {
      let recurse = (criteriaArr) => {
        this.compose(criteriaArr.shift()).then(() => {
          if (criteriaArr.length) {
            recurse(criteriaArr);
          } else {
            resolve();
          }
        })
      };
      recurse(criteriaArr);
    });
  }

  Grapefruit.prototype.runComposer = function(job, composerNames) {
    return new Promise(function(resolve, reject) {
      let index = 0;
      let runJobIfNeeded = function(composer) {
        return new Promise(function(resolve, reject) {
          if (!composerNames || composerNames.indexOf(composer) > -1) {
            console.log("running composer:\n", composer);
            Grapefruit.composers[composer](job).then((job) => resolve(job));
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
          buffers: _SELF.buffers,
          globals: Grapefruit.globals
        },
        criteria.composers
      )
    };
    return Promise.all(jobs.map(jobRunner));
  };

  return Grapefruit;
})();

module.exports = Grapefruit;
