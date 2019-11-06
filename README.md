# Grapefruit
A simple pipeline runner.

Takes a config with a set of promise-encapsulated functions, runs through a
pipeline selecting entries from state to determine the next "step". Also an option
to save the state history and review for debugging. 

I originally started this as a sort of code kata years ago, and found that it
was quite useful for simple static site generation or (more frequently) for
producing assets for tabletop games. I've since got frustrated by it breaking
all the time, and rewritten it into this.

An example of how to use can be found here: [grapefruit
example](https://github.com/leakypixel/grapefruit-example).
