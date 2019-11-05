const Grapefruit = config => {
  let history = [];
  const funcs = config.funcs;

  const runStep = (state, step) => {
    const selectors = {
      selectMany: filter => state.filter(filter),
      selectByTag: tag =>
        state.filter(item => item.tags && item.tags.includes(tag)),
      selectOne: filter => state.find(filter)
    };

    return step.reduce((acc, func) => {
      if (!funcs[func.name]) {
        throw new Error(`Named function does not exist: ${func.name}`);
      }

      const stepConfig = Object.assign(
        {},
        func.config,
        func.getConfig && func.getConfig(selectors)
      );

      if (func.selector) {
        const selectedState = [].concat(func.selector(selectors));
        return acc.concat(
          selectedState.map(item => funcs[func.name](stepConfig, item))
        );
      } else {
        console.log(
          `Function ${func.name} has no selector, running as single instance.`
        );
        return acc.concat(funcs[func.name](stepConfig));
      }
    }, []);
  };

  const runPipeline = pipeline => {
    return new Promise(resolve => {
      const doStep = (state, steps) => {
        if (config.keepHistory) {
          history.push(state);
        }

        const step = runStep(state, steps[0]);

        Promise.all(step.flat())
          .then(res => {
            const newState = res.flat();
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
    registerFunc,
    config,
    runPipeline,
    history
  };
};

module.exports = Grapefruit;
