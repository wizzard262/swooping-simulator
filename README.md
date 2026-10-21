# Swooping Simulator

A Flappy Bird style game where you fly an Australian magpie over an Aussie suburb.

**Play:** https://wizzard262.github.io/swooping-simulator/

## Controls

- Arrow keys or W A S D: up to flap, down to dive, left and right to fly; up and down tilt the magpie 30 degrees
- Hold Space to swoop: very fast flight with afterburner flames and a motion blur, steered 30 degrees up or down with the arrows. The charge bar empties in 3 seconds and refills in 10
- Land on the Hills Hoist (half a lap from the BOTTLE-O) and it spins, carrying you round and turning you with it; press up to fly off
- A kangaroo in a cork hat hops along the lawn: land on his back to ride him; swoop into him or poop on him and he falls over (doiiinggg!) and sees stars for 5 seconds
- A big gum tree to perch on, with a koala climbing the trunk and a kookaburra on top: swoop into the kookaburra or poop on him and he tumbles down, sees stars, then flies back up laughing
- A bloke at his barbie flipping burgers: land on the hot plate and you smoke, go red and get flung off with a sizzle
- The postie rides his motorbike along the front street, stopping at letterboxes; an Aussie flag flaps in one front yard; now and then a shark fin cruises across the harbour
- On the ground the magpie carols every 10 to 20 seconds, head up and beak working
- B for a corkscrew barrel roll, L for a loop-the-loop
- M (or the speaker icon) turns the sound on and off
- Poops fade away after 10 seconds
- The game fills the browser's width (a black bar below it in tall windows)
- Poop during a swoop for a pop-art SWOOP-AND-POOP! above the magpie, or loop during one for SWOOP-AND-LOOP!
- Press P to poop: a white teardrop that sploshes on the lawn. It takes a full poop bar, which refills in 5 seconds
- Fly through the BOTTLE-O (in through one side, out the other): bottles and cans of Foster's and Johnnie Walker tumble out, he does a barrel roll, and for 10 seconds he flies erratically with bubbles and glowing red eyes. You can also land on its roof; the BOTTLE-O sign on posts above it is just scenery
- The magpie drifts down slowly under gravity, lands softly on the lawn and walks along it
- Touch screens: hold where you want the magpie to go; tap quickly to start or stop a swoop; tap with a second finger to poop

### Game controller

Standard layout (Xbox, PlayStation and similar). Press any button once after plugging it in so the browser sees it.

| Control | Does |
|---|---|
| Left stick or D-pad | Fly |
| A / Cross | Flap |
| Right trigger or right bumper (hold) | Swoop |
| X / Square | Poop |
| B / Circle | Barrel roll |
| Y / Triangle | Loop-the-loop |
| Back / Select | Sound on or off |

## How it's made

- One HTML page, plain JavaScript and the 2D canvas (no WebGL)
- Sound made in code with Web Audio: the swoop's afterburner roar, poop plop and splosh, clanging cans, hiccups, the magpie's carol, a sizzle, a kookaburra laugh, doiiinggg, and a background of breeze, cicadas and a didgeridoo
- The scenery is pixel art drawn in code at 180 pixels high and scaled up; the magpie is drawn smoothly at about 3/4 of a scenery pixel (a little pixelated), and the sun is a photo of the Sun King emblem (supplied with the prompts), cut out of its background and embedded in the page
- The level is 6 screens wide and loops round, with 8 parallax layers: lawn, the front street, 3 back streets that tier off into the distance, hills (Sydney Harbour Bridge, Opera House, Uluru) and billowy clouds. The sun moves slowest of all
- [screenshots/](screenshots/): numbered screenshots of the game as it was built, shown in order on `screenshots.html` (linked in the game, top right)
- [PROMPTS.md](PROMPTS.md): every prompt used to make the game (also linked in the game, top right)
