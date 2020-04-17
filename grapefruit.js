class SearchableState extends Array {
  constructor(state) {
    if (state.length) {
      super(...state);
    } else {
      super();
    }
  }
  selectAll() {
    return this;
  }
  selectMany(filter) {
    //console.log("selectmany filtering", filter, this);
    return this.filter(filter);
  }
  selectByTag(tag) {
    // console.log("selectbytag filtering", tag, this);
    return this.filter(item => item.tags && item.tags.includes(tag));
  }
  selectOne(filter) {
    return this.find(filter) || [];
  }
  mostMatchingTags(tagList) {
    //console.log("mostmatchingtags filtering", tagList, this);
    const sorted = this.sort(
      (item1, item2) =>
        item2.tags.filter(tag => tagList.includes(tag)).length -
        item1.tags.filter(tag => tagList.includes(tag)).length
    );
    return sorted[0];
  }

  matchingAnyTag(tagList) {
    return this.filter(item => item.tags.some(tag => tagList.includes(tag)));
  }

  matchingAllTags(tagList) {
    return this.filter(item => tagList.every(tag => item.tags.includes(tag)));
  }

  not(excludeState) {
    return this.filter(item => !excludeState.includes(item));
  }
  and(additionalState) {
    return this.concat(additionalState);
  }
}

const applyConfigToFunc = (config, func) => {
  if (func.withConfig && typeof func.withConfig === "function") {
    return func.withConfig(config);
  }
  return item => func(config, item);
};

function Grapefruit(config) {
  const _self = this;
  this.funcs = config.funcs;
  this.emitter = config.emitter ? config.emitter : () => null;

  this.runInstance = (configuredAction, item, actionId) => {
    const instanceId = Math.round(Math.random() * 1000000);
    return new Promise((resolve, reject) => {
      _self.emitter({
        eventType: "instanceRunning",
        item,
        configuredAction,
        actionId,
        instanceId
      });
      const actionRunner = configuredAction(item);
      actionRunner
        .then(result => {
          _self.emitter({
            eventType: "instanceComplete",
            configuredAction,
            item,
            actionId,
            instanceId
          });
          resolve(result);
        })
        .catch(e => {
          const error = {
            message: e.toString(),
            ...e,
            item,
            instanceId,
            actionId
          };
          _self.emitter(error);
          reject(error);
        });
    });
  };

  this.runStep = (state, step) => {
    return new Promise((resolve, reject) => {
      const stepId = Math.round(Math.random() * 1000000);
      const selectors = new SearchableState(state);
      Promise.all(
        step.reduce((actions, action) => {
          const actionId = Math.round(Math.random() * 1000000);

          const actionFunction = _self.funcs[action.func];
          if (!actionFunction) {
            reject({
              message: `Named function ${
                action.func
              } does not exist on action ${
                action.name ? action.name : actionId
              }.`,
              action: action,
              actionId
            });
          }

          const selectedState = (() => {
            try {
              return [].concat(
                action.selector ? action.selector(selectors) : action.item
              );
            } catch (e) {
              reject({ message: e.toString(), ...e, actionId, action });
            }
          })();
          if (selectedState.length || action.allowEmpty) {
            _self.emitter({
              eventType: "stateSelected",
              selectedState,
              actionId
            });
          } else {
            reject({
              message: `Selected no state on action ${
                action.name ? action.name : actionId
              }.`,
              action: action,
              actionId,
              selector: action.selector,
              item: action.item
            });
          }

          if (action.deferConfig) {
            return actions.concat(
              selectedState.map(item => {
                const actionConfig = (() => {
                  try {
                    return Object.assign(
                      {},
                      action.config,
                      action.getConfig && action.getConfig(selectors, item)
                    );
                  } catch (e) {
                    reject({ message: e.toString(), ...e, actionId, action });
                  }
                })();
                _self.emitter({
                  eventType: "actionConfigured",
                  actionConfig,
                  actionId
                });
                const configuredAction = applyConfigToFunc(
                  actionConfig,
                  actionFunction
                );
                return this.runInstance(configuredAction, item, actionId);
              })
            );
          }
          const actionConfig = (() => {
            try {
              return Object.assign(
                {},
                action.config,
                action.getConfig && action.getConfig(selectors, action)
              );
            } catch (e) {
              reject({ message: e.toString(), ...e, actionId, action });
            }
          })();
          _self.emitter({
            eventType: "actionConfigured",
            actionConfig,
            actionId
          });
          const configuredAction = applyConfigToFunc(
            actionConfig,
            actionFunction
          );
          return actions.concat(
            selectedState.map(item => {
              return this.runInstance(configuredAction, item, actionId);
            })
          );
        }, [])
      )
        .then(result => {
          _self.emitter({ eventType: "stepComplete", result, stepId });
          resolve(result.flat());
        })
        .catch(e => {
          reject({ message: e.toString(), ...e, stepId });
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
            if (steps.length > 1) {
              doStep(newState, steps.slice(1));
            } else {
              _self.emitter({ eventType: "newState", state: newState });
              _self.emitter({ eventType: "pipelineComplete" });
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
