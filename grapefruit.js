const applyConfigToFunc = (config, func) => {
  return item => func(config, item);
};

function Grapefruit(config) {
  const _self = this;
  this.funcs = config.funcs;

  this.emitter = config.emitter ? config.emitter : () => null;

  this.runStep = (state, step) => {
    return new Promise((resolve, reject) => {
      const selectors = {
        selectAll: () => state,
        selectMany: filter => state.filter(filter),
        selectByTag: tag =>
          state.filter(item => item.tags && item.tags.includes(tag)),
        selectOne: filter => state.find(filter) || []
      };

      Promise.all(
        step.reduce((actions, action) => {
          const id = Math.round(Math.random() * 1000000);

          const actionFunction = _self.funcs[action.func];
          if (!actionFunction) {
            reject({
              message: `Named function ${
                action.func
              } does not exist on action ${action.name ? action.name : id}.`,
              action: action,
              id
            });
          }

          const actionConfig = Object.assign(
            {},
            action.config,
            action.getConfig && action.getConfig(selectors)
          );
          const actionWithConfig = applyConfigToFunc(
            actionConfig,
            actionFunction
          );
          _self.emitter({
            eventType: "actionConfigured",
            action,
            actionConfig,
            id
          });

          const selectedState = [].concat(
            action.selector ? action.selector(selectors) : action.item
          );
          _self.emitter({
            eventType: "stateSelected",
            action,
            selectedState,
            id
          });

          return actions.concat(
            selectedState.map(item => {
              return new Promise((resolve, reject) => {
                _self.emitter({
                  eventType: "actionRunning",
                  action,
                  item,
                  actionConfig,
                  id
                });
                const actionRunner = actionWithConfig(item);
                actionRunner
                  .then(result => {
                    _self.emitter({
                      eventType: "actionComplete",
                      action,
                      item,
                      result,
                      id
                    });
                    resolve(result);
                  })
                  .catch(e => {
                    const error = {
                      action,
                      item,
                      id,
                      ...e
                    };
                    _self.emitter(error);
                    reject(error);
                  });
              });
            })
          );
        }, [])
      )
        .then(result => {
          _self.emitter({ eventType: "stepActionsComplete", step, result });
          resolve(result.flat());
        })
        .catch(e => {
          reject(e);
        });
    });
  };

  this.runPipeline = pipeline => {
    return new Promise((resolve, reject) => {
      const doStep = (state, steps) => {
        _self.emitter({ eventType: "newState", state: state });

        const step = this.runStep(state, steps[0]);
        step
          .then(newState => {
            _self.emitter({
              eventType: "stepComplete",
              step: steps[0],
              result: newState
            });
            if (steps.length > 1) {
              doStep(newState, steps.slice(1));
            } else {
              _self.emitter({ eventType: "newState", state: newState });
              _self.emitter({ eventType: "pipelineComplete", state: newState });
              resolve(newState);
            }
          })
          .catch(e => {
            const error = { eventType: "error", ...e, step: steps[0] };
            _self.emitter(error);
            reject(error);
          });
      };

      const initialState = Object.assign(
        [],
        pipeline.initialState,
        pipeline.getInitialState && pipeline.getInitialState(selectors)
      );
      doStep(initialState, pipeline.steps);
    });
  };
}

Grapefruit.History = function History() {
  let timeline = [];
  this.get = () => timeline;
  this.push = item => timeline.push(item);
  this.flush = () => (timeline = []);
};

module.exports = Grapefruit;
