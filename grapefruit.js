const Grapefruit = config => {
  let history = [];
  const funcs = config.funcs;
  const curryFunc = (config, func) => {
    return item => func(config, item);
  };

  const runStep = (state, step) => {
    return new Promise((resolve, reject) => {
      const selectors = {
        selectAll: () => state,
        selectMany: filter => state.filter(filter),
        selectByTag: tag =>
          state.filter(item => item.tags && item.tags.includes(tag)),
        selectOne: filter => state.find(filter)
      };

      Promise.all(
        step.reduce((actions, func) => {
          if (!funcs[func.name]) {
            throw new Error(`Named function does not exist: ${func.name}`);
          }

          const stepConfig = Object.assign(
            {},
            func.config,
            func.getConfig && func.getConfig(selectors)
          );
          const curriedFunc = curryFunc(stepConfig, funcs[func.name]);

          if (func.selector) {
            const selectedState = [].concat(func.selector(selectors));
            return actions.concat(selectedState.map(item => curriedFunc(item)));
          } else {
            console.log(
              `Function ${
                func.name
              } has no selector, running as single instance.`
            );
            return actions.concat(curriedFunc(func.item));
          }
        }, [])
      )
        .then(result => {
          console.log("Result:", result);
          resolve(result.flat());
        })
        .catch(e => reject(e));
    });
  };

  const runPipeline = pipeline => {
    return new Promise(resolve => {
      const doStep = (state, steps) => {
        if (config.keepHistory) {
          history.push(state);
        }

        const step = runStep(state, steps[0]);
        step
          .then(newState => {
            if (steps.length > 1) {
              doStep(newState, steps.slice(1));
            } else {
              if (config.keepHistory) {
                history.push(newState);
              }
              resolve(newState);
            }
          })
          .catch(e => console.log("Error caught:", e));
      };

      if (pipeline.getInitialState) {
        doStep(pipeline.getInitialState(pipeline), pipeline.steps);
      } else {
        doStep(pipeline.initialState || [], pipeline.steps);
      }
    });
  };

  return {
    config,
    runPipeline,
    history
  };
};

module.exports = Grapefruit;
