# Grapefruit
I originally started this as a sort of code kata years ago, and found that it
was quite useful for simple static site generation or (more frequently) for
producing assets for tabletop games. I've since got frustrated by it breaking
all the time, and rewritten it into this.

I'm still hacking around on this here and there - there's huge
improvements that can be made, removing a lot of the promise wrappers around
other promises being the main one, but that's not work that's very much fun so I
am unlikely to do it in any real hurry.

## What it does
It takes a config, which contains a list of steps to run, along with the required
functions, and initial state and a few other optional things like a log handler
and a state provider. It then selects from state based on a function provided in
the step description, configures (through partial application) the step's named
function (referred to as an action), and then
runs it against each element selected from state. Once each part of a step has
been run, the result is used as the new state passed to the next step and the
cycle runs again.

## What's it for?
There are many better ways of doing whatever you would use grapefruit for - [Hugo](https://gohugo.io/)
or [Jekyll](https://jekyllrb.com/) for a static site, spreadsheets or scripts for transforming data - but
that's not the point. I didn't build grapefruit with the intention of producing
a quality solution for a specific problem, I built it simply for fun. I do use
it to generate my personal site and also for various board or table-top game related
things, something which it works _fine_ for, but that's mostly just because I
wanted to throw a problem at the solution and see how well it worked.

PRs welcome!

[Blog post](https://leakypixel.net/blog/i-dont-know-what-ive-built)
