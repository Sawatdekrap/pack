# What is this?

This is an app that takes a collection of items and tries to pack them "optimally" into boxes, and show you how.

Originally this was a script for a talk at work about box packing problems and different solutions and the optimality of their results. You can see the original Python script I used in `assets/pack.py`, and you can see my MIP (Mixed Integer Programming) implementation in `assets/mip.py` (Which can be extended to multi-box)

# Why?

Box packing is a very interesting problem, and there's actually a really large amount of research into how to do it better - specifically more-optimal packing. Really this makes sense because shipping and storage costs for delivered products are quite high relative to the cost of the items being shipped/stored themselves!

I've seen a few solutions for packing boxes in the logistics industry - some being very _very_ lackluster and _very_ limited. It seems very few people are doing anything too interesting, in this space, so I thought I would ask around and mock up some demos.

Also I just wanted to try out some React again. It's by no means clean, so stop judging me.

# Why not?

Ultimately, this sort of thing tends to not be used very extensively for a few reasons. First, the exact dimensions of products is not often known, and when known, can be updated frequently by new stock or product variants. Second, annecdotally human packers would often ignore generated packing suggestions and just do what they felt was best - often due to the third point: quite often stores are not delivering more than 1-2 items per order. In one dataset I was looking at, 90% of orders were a single item, and the next 8-9% were 2 items.

# How?

You can look at the source files for this project to see what's happening (although I think the Python files linked above are much easier to read).

At a high-level this is the flow:

- Sort boxes by descending "unweildy-ness"
  - This is super vague because there's a few things you can sort by
  - I ended up using the measure l^2 \* h^2 \* d^2
  - This dealt nicely-enough with both large volumes and single large dimensions
- Group items into "concurrency groups" (items with the same dimensions with rotation)
  - For super complex packing that leaves lots of empty space around, this can be helped a little by allowing items slightly smaller to be grouped
- Find a suitable empty space to use
  - Existing empty space is searched by volume ascending, and must be able to fit at least one item in the congruency group in at least one orientation
  - In the beginning there is no empty space available
  - When there's no empty space, use a new box as the empty space
  - There's a few ways to choose the right box here. I'm very lazy and choose something slightly larger than could minimally hold all the remaining items' volume
- Generate the ways the congruency group could be packed into the selected space
  - Try all possible orientations and pack as much as possible
- Generate all the remaining space that would be left over using the generated packings
  - Packing one box into another, the remaining space can be split into 3 boxes of space
- Select the best packing and remaining space combo
  - This is based on total packable items, and if tied, the packing that gives the largest box of remaining space
- Add our new space to our collection of usable space, and continue
  - If not all items in the congruency group could be packed, continue until they are
  - Otherwise, move to the next congruency group
- When all congruency groups have been packed, for items packed in the same box, try to find smaller boxes that fit the bounding dimensions of the packed items
  - The items may have been packed in a larger box than necessary, especially with no backtracking, etc.
  - If a smaller box is found that fits the bounding dims of the packed items (including with rotation), assign to that box instead
- Finished

# FAQ

## Will this always pack my boxes optimally?

Definitely not - but it does a decent enough job that most of the time the most-optimal solution will either be the same, or close enough that it doesn't matter. There's a lot of heuristics this uses to do a better job, but it isn't at all exhasutive or even backtrack.

## I found a bug/my page broke

I spent very little time accouting for edge cases or ways to break the site, but congratulations! Here's a list of some bugs you may experience:

- Too many packed boxes fail to render the preview (although lots of items should be ok!)
- 3D preview glitches
- CSV import fails
- Buggy UI behaviour
- _Your bug here ✨_

## Will you fix/change/update anything?

Maybe

## What was used to build the site?

- Web framework: [React](https://react.dev/)
- Component Library: [Mantine](https://mantine.dev/)
- 3D: [React Three Fiber](https://r3f.docs.pmnd.rs/)
- Other: [jotai (state)](https://jotai.org/), [Papaparse (CSVs)](https://www.papaparse.com/)
- Hosting: [React Github Pages](https://github.com/gitname/react-gh-pages)

## Do things like this already exist?

Definitely. There's lots of open source libraries as well as commercial solutions that do similar things. You can find them just by typing "box packing API" in Google.

Here's a few I've seen, some more interesting than others:

- [3d bin container packing](https://github.com/skjolber/3d-bin-container-packing)
- [boxpacker.io](https://boxpacker.io/en/stable/)
- [Interactive 3D visualisation](https://xserver2-dashboard.cloud.ptvgroup.com/dashboard/Content/Showcases/LoadingOptimization/InteractiveVisualization/index.htm)
- [paccurate.io](https://docs.paccurate.io/)
- [3dpack.ing](https://3dpack.ing/)

Note I don't vouch for any of these, I"m just saving you a google search.

## References

There were a few related resources I used to get me up to speed for my work talk

- [(Paper) A MIP Approach for some Practical Packing Problems: Balancing Constraints and Tetris-like Items](https://www.researchgate.net/publication/220340260_A_MIP_approach_for_some_practical_packing_problems_Balancing_constraints_and_tetris-like_items)
- [(Paper) A New Heuristic Algorithm for the 3D Bin Packing Problem](https://www.researchgate.net/publication/226249396_A_New_Heuristic_Algorithm_for_the_3D_Bin_Packing_Problem)
- [Python MIP](https://www.python-mip.com/)

# Todo eventually... maybe

- [ ] Highligh list items being packed on step
- [ ] CSV export / local save
- [ ] Show packed items list in fullscreen view
- [ ] Smaller separate files
