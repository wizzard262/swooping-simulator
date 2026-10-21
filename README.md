# Swooping Simulator

A Flappy Bird style game where you fly an Australian magpie over an Aussie suburb.

**Play:** https://wizzard262.github.io/swooping-simulator/

## Controls

- Arrow keys or W A S D: up to flap, down to dive, left and right to fly; up and down tilt the magpie 30 degrees
- Hold Space to swoop: very fast flight with afterburner flames and a motion blur, steered 30 degrees up or down with the arrows. The charge bar empties in 3 seconds and refills in 10
- Land on the Hills Hoist on the lawn and it spins, carrying you round and turning you with it; press up to fly off. Swoop past it and it whirls round fast, the washing flung outwards. Fly up under it and he grabs hold and rides round underneath, either hanging by his wings with his legs kicking or upside down by his feet; press down to let go
- A kangaroo in a cork hat hops along the lawn: land on his back to ride him; swoop into him or poop on him and he falls over (doiiinggg!) and sees stars for 5 seconds
- A big gum tree to perch on, with a koala climbing the trunk and central branch up into the canopy and a kookaburra on top: swoop into the kookaburra or poop on him and he tumbles down, sees stars, then flies back up laughing (he also laughs every minute or two, only while you can see him)
- A bloke at his barbie flipping burgers (poop on the hot plate and it sizzles): land on the hot plate and you smoke, go red and get flung off with a sizzle and a scream, tumbling over and over to land on your back with your legs waving. Swoop while you're tumbling for a flashing WHIPPER SNIPPER! that travels along above you
- The postie rides his motorbike along the front street, stopping at letterboxes: poop on him and he's knocked off sideways, picks his bike up and rides off the other way; an Aussie flag flaps in one front yard; a green-and-cream ferry crosses the harbour back and forth, and now and then a shark fin cruises past
- A cyclist rides along the lawn with 4 cable ties on his helmet: poop him and he wobbles, shakes his fist, rings his bell and shouts "Oi!"; swoop him and the cable ties spike you
- Hang about under the big gum for 3 seconds and a drop bear drops on you, then climbs back into the leaves
- Land on the postie or the ferry and ride along with them
- A possum is out on the power line between two houses about a third of the time, scurrying back and forth and stopping for a rest; a screeching flock of cockatoos wheels across the sky; tiny bridge climbers cross the Harbour Bridge (poop on them and they jump up and down swearing: #!$?)
- Every few minutes a summer storm rolls in: dark sky, rain, lightning and thunder, then a rainbow
- Score points for knocking things over, poops on target, stunts and rides; quick ones in a row build a combo (up to x5); your high score is remembered. You lose 100 points (a red minus) for swooping the cyclist, landing on the barbecue or getting drop-beared, and the score can go below zero
- On the ground the magpie carols every 10 to 20 seconds, head up and beak working
- B for a corkscrew barrel roll, L for a loop-the-loop
- M (or the speaker icon) turns the sound on and off
- Poops fade away after 10 seconds
- The game fills the browser's width (a black bar below it in tall windows)
- Poop during a swoop for a pop-art SWOOP-AND-POOP! above the magpie, loop during one for SWOOP-AND-LOOP!, or barrel roll during one for BARREL SWOOP!
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
- Sound made in code with Web Audio: the swoop's afterburner roar, poop plop and splosh, clanging cans, hiccups, the magpie's carol, a sizzle, a kookaburra laugh, doiiinggg, a bike bell and an "Oi!", a drop bear's growl, screeching cockatoos, rain and thunder, and a background of breeze, cicadas and a didgeridoo
- The scenery is pixel art drawn in code at 180 pixels high and scaled up; the magpie is drawn smoothly at about 3/4 of a scenery pixel (a little pixelated), and the sun is a photo of the Sun King emblem (supplied with the prompts), cut out of its background and embedded in the page
- The level is 6 screens wide and loops round, with 8 parallax layers: lawn, the front street, 3 back streets that tier off into the distance, hills (Sydney Harbour Bridge, Opera House, Uluru) and billowy clouds. The sun moves slowest of all
- [screenshots/](screenshots/): numbered screenshots of the game as it was built, shown in order on `screenshots.html` (linked in the game, top right)
- [PROMPTS.md](PROMPTS.md): every prompt used to make the game (also linked in the game, top right)
- The version number under the links (top right) counts the updates published, one per commit
- Performance: about 2 to 3 ms a frame (of the 16.7 ms a 60 fps frame allows), even with a storm, cockatoos and a blurred swoop; still about 56 to 60 fps with the CPU slowed 4 times
