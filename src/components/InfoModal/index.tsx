import { Anchor, Modal, Stack, Text, Title } from "@mantine/core";

interface InfoModalProps {
  opened: boolean;
  onClose: () => void;
}

const InfoModal = ({ opened, onClose }: InfoModalProps) => {
  return (
    <Modal title="Information" opened={opened} onClose={onClose} size={"lg"}>
      <Stack gap={"xs"}>
        <Title order={2}>What is this?</Title>
        <Text>
          This is an app that takes a collection of items and tries to pack them
          "optimally" into boxes, and show you how.
        </Text>
        <Text>
          Originally this was a script for a talk at work about box packing
          problems and different solutions and the optimality of their results.
          You can see the original Python script I used{" "}
          <Anchor href="/pack.py">HERE</Anchor>, and you can see my MIP (Mixed
          Integer Programming) implementation{" "}
          <Anchor href="/mip.py">HERE</Anchor> (Which can be extended to
          multi-box)
        </Text>

        <Title order={2}>Why?</Title>
        <Text>
          Box packing is a very interesting problem, and there's actually a
          really large amount of research into how to do it better -
          specifically more-optimal packing. Really this makes sense because
          shipping and storage costs for delivered products are quite high
          relative to the cost of the items being shipped/stored themselves!
        </Text>
        <Text>
          I've seen a few solutions for packing boxes in the logistics industry
          - some being very <i>very</i> lackluster and <i>very</i> limited. It
          seems very few people are doing anything too interesting, in this
          space, so I thought I would ask around and mock up some demos.
        </Text>
        <Text>
          Also I just wanted to try out some React again. It's by no means
          clean, so stop judging me.
        </Text>

        <Title order={2}>Why not?</Title>
        <Text>
          Ultimately, this sort of thing tends to not be used very extensively
          for a few reasons. First, the exact dimensions of products is not
          often known, and when known, can be updated frequently by new stock or
          product variants. Second, annecdotally human packers would often
          ignore generated packing suggestions and just do what they felt was
          best - often due to the third point: quite often stores are not
          delivering more than 1-2 items per order. In one dataset I was looking
          at, 90% of orders were a single item, and the next 8-9% were 2 items.
        </Text>

        <Title order={2}>How?</Title>
        <Text>
          You can look at the source files for this project to see what's
          happening (although I think the Python files linked above are much
          easier to read).
        </Text>
        <Text>
          At a high-level this is the flow:
          <ul>
            <li>
              Sort boxes by descending "unweildy-ness"
              <ul>
                <li>
                  This is super vague because there's a few things you can sort
                  by
                </li>
                <li>I ended up using the measure l^2 * h^2 * d^2</li>
                <li>
                  This dealt nicely-enough with both large volumes and single
                  large dimensions
                </li>
              </ul>
            </li>
            <li>
              Group items into "concurrency groups" (items with the same
              dimensions with rotation)
              <ul>
                <li>
                  For super complex packing that leaves lots of empty space
                  around, this can be helped a little by allowing items slightly
                  smaller to be grouped
                </li>
              </ul>
            </li>
            <li>
              Find a suitable empty space to use
              <ul>
                <li>
                  Existing empty space is searched by volume ascending, and must
                  be able to fit at least one item in the congruency group in at
                  least one orientation
                </li>
                <li>In the beginning there is no empty space available</li>
                <li>
                  When there's no empty space, use a new box as the empty space
                </li>
                <li>
                  There's a few ways to choose the right box here. I'm very lazy
                  and choose something slightly larger than could minimally hold
                  all the remaining items' volume
                </li>
              </ul>
            </li>
            <li>
              Generate the ways the congruency group could be packed into the
              selected space
              <ul>
                <li>
                  Try all possible orientations and pack as much as possible
                </li>
              </ul>
            </li>
            <li>
              Generate all the remaining space that would be left over using the
              generated packings
              <ul>
                <li>
                  Packing one box into another, the remaining space can be split
                  into 3 boxes of space
                </li>
              </ul>
            </li>
            <li>
              Select the best packing and remaining space combo
              <ul>
                <li>
                  This is based on total packable items, and if tied, the
                  packing that gives the largest box of remaining space
                </li>
              </ul>
            </li>
            <li>
              Add our new space to our collection of usable space, and continue
              <ul>
                <li>
                  If not all items in the congruency group could be packed,
                  continue until they are
                </li>
                <li>Otherwise, move to the next congruency group</li>
              </ul>
            </li>
            <li>Finished</li>
          </ul>
        </Text>

        <Title order={2}>FAQ</Title>
        <Title order={5}>Will this always pack my boxes optimally?</Title>
        <Text>
          Definitely not - but it does a decent enough job that most of the time
          the most-optimal solution will either be the same, or close enough
          that it doesn't matter. There's a lot of heuristics this uses to do a
          better job, but it isn't at all exhasutive or even backtrack.
        </Text>

        <Title order={5}>I found a bug/my page broke</Title>
        <Text>
          I spent very little time accouting for edge cases or ways to break the
          site, but congratulations! Here's a list of some bugs you may
          experience:
          <ul>
            <li>
              Too many packed boxes fail to render the preview (although lots of
              items should be ok!)
            </li>
            <li>3D preview glitches</li>
            <li>CSV import fails</li>
            <li>Buggy UI behaviour</li>
            <li>
              <i>Your bug here ✨</i>
            </li>
          </ul>
        </Text>

        <Title order={5}>Will you fix/change/update anything?</Title>
        <Text>Maybe</Text>

        <Title order={5}>What was used to build the site?</Title>
        <Text>
          <ul>
            <li>
              Web framework: <Anchor href="https://react.dev/">React</Anchor>
            </li>
            <li>
              Component Library:{" "}
              <Anchor href="https://mantine.dev/">Mantine</Anchor>
            </li>
            <li>
              3D:{" "}
              <Anchor href="https://r3f.docs.pmnd.rs/">
                React Three Fiber
              </Anchor>
            </li>
            <li>
              Other: <Anchor href="https://jotai.org/">jotai (state)</Anchor>,{" "}
              <Anchor href="https://www.papaparse.com/">
                Papaparse (CSVs)
              </Anchor>
            </li>
          </ul>
        </Text>

        <Title order={5}>Do things like this already exist?</Title>
        <Text>
          Definitely. There's lots of open source libraries as well as
          commercial solutions that do similar things. You can find them just by
          typing "box packing API" in Google.
        </Text>
        <Text>
          Here's a few I've seen, some more interesting than others:
          <ul>
            <li>
              <Anchor href="https://github.com/skjolber/3d-bin-container-packing">
                3d bin container packing
              </Anchor>
            </li>
            <li>
              <Anchor href="https://boxpacker.io/en/stable/">
                boxpacker.io
              </Anchor>
            </li>
            <li>
              <Anchor href="https://xserver2-dashboard.cloud.ptvgroup.com/dashboard/Content/Showcases/LoadingOptimization/InteractiveVisualization/index.htm">
                Interactive 3D visualisation
              </Anchor>
            </li>
            <li>
              <Anchor href="https://docs.paccurate.io/">paccurate.io</Anchor>
            </li>
            <li>
              <Anchor href="https://3dpack.ing/">3dpack.ing</Anchor>
            </li>
          </ul>
          Note I don't vouch for any of these, I"m just saving you a google
          search.
        </Text>

        <Title order={2}>References</Title>
        <Text>
          There were a few related resources I used to get me up to speed for my
          work talk
        </Text>
        <Text>
          <ul>
            <li>
              <Anchor href="https://www.researchgate.net/publication/220340260_A_MIP_approach_for_some_practical_packing_problems_Balancing_constraints_and_tetris-like_items">
                (Paper) A MIP Approach for some Practical Packing Problems:
                Balancing Constraints and Tetris-like Items
              </Anchor>
            </li>
            <li>
              <Anchor href="https://www.python-mip.com/">Python MIP</Anchor>
            </li>
          </ul>
        </Text>
      </Stack>
    </Modal>
  );
};

export default InfoModal;
