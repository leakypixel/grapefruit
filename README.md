# Grapefruit
A simple pipeline runner.

Takes a config with a set of promise-encapsulated functions, runs through a
pipeline selecting entries from state to determine the next "step". Also an option
to save the state history and review for debugging. 

I originally started this as a sort of code kata years ago, and found that it
was quite useful for simple static site generation or (more frequently) for
producing assets for tabletop games. I've since got frustrated by it breaking
all the time, and rewritten it into this.

## Usage
```
const Grapefruit = require("grapefruit");

let runner = Grapefruit({ keepHistory: true }); // defaults to false

// Register some functions with names - they must return a promise even if they
// resolve immediately.
runner.registerFunc(
  "incrementNumber",
  (config, item) =>
    new Promise((resolve, reject) => {
      resolve({ ...item, numb: item.numb + config.num });
    })
);

runner.registerFunc(
  "applyLabel",
  (config, item) =>
    new Promise((resolve, reject) => {
      resolve({ ...item, label: config.label });
    })
);

runner
  .runPipeline({
    // Set our initial state - not required and getInitialState can also be used for dynamic values. 
    initialState: [{ numb: 2, tags: ["red"] }, { numb: 6 }],
    steps: [
      // Each step is an array of actions to perform
      [
        {
        // The name of the registered function to call
        name: "incrementNumber",
        // Select which items from state to work on (one function will be called per selection).
        // Alternatively, omit this key and the action will be performed once.
        selector: ({ selectMany }) => selectMany(elm => true),
        // Config to pass to the registered function
        config: { num: 2 } 
        },
        {
        name: "applyLabel",
        // There are selectOne, selectMany and selectByTag at the moment -
        // convenience methods for array.filter and array.find
         selector: ({ selectOne }) => selectOne(elm => elm.numb > 4),
          config: { label: "label1" }
        }
      ],
      [
        {
          name: "applyLabel",
          selector: ({ selectByTag }) => selectByTag("red"),
          // getConfig works the same as the other selectors (getInitialState
          // and selector), useful for values dependent on state.
          getConfig: select => ({
            label: "label2"
          })
        }
      ]
    ]
  })
  .then(result => {
    // As we enabled our history, we can now see the steps taken before the
    // final result.
    console.log("History:", JSON.stringify(runner.history, null, 2));
    console.log("Result:", result);
  });

    
History: [
  [
    {
      "numb": 2,
      "tags": [
        "red"
      ]
    },
    {
      "numb": 6
    }
  ],
  [
    {
      "numb": 4,
      "tags": [
        "red"
      ]
    },
    {
      "numb": 8
    },
    {
      "numb": 6,
      "label": "label1"
    }
  ],
  [
    {
      "numb": 4,
      "tags": [
        "red"
      ],
      "label": "label2"
    }
  ]
]
Result: [ { numb: 4, tags: [ 'red' ], label: 'label2' } ]

```


Please note:
* May or may not work
* No tests
* No documentation
* No support
* Works on my machine
