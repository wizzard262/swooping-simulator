# Swooping Simulator

A Flappy Bird style game where you fly an Australian magpie over an Aussie suburb.

**Play:** https://wizzard262.github.io/swooping-simulator/

## Controls

- Arrow keys or W A S D: up to flap, down to dive, left and right to fly; up and down tilt the magpie 30 degrees
- Hold Space to swoop: very fast flight with afterburner flames and a motion blur, steered 30 degrees up or down with the arrows. The charge bar empties in 3 seconds and refills in 10
- Press P to poop: a white teardrop that splooshes on the lawn. It takes a full poop bar, which refills in 20 seconds
- The magpie drifts down slowly under gravity, lands softly on the lawn and walks along it
- Touch screens: hold where you want the magpie to go; tap quickly to start or stop a swoop; tap with a second finger to poop

## How it's made

- One HTML page, plain JavaScript and the 2D canvas (no WebGL)
- The scenery is pixel art drawn in code at 180 pixels high and scaled up; the magpie and the Sun King sun are drawn smoothly at full screen resolution
- The level is 6 screens wide and loops round, with 4 parallax layers: lawn, suburb, hills (Sydney Harbour Bridge, Opera House, Uluru). Billowy clouds are pinned to the sky, and the sun moves slowest of all
- [screenshots/](screenshots/): numbered screenshots of the game as it was built
- [PROMPTS.md](PROMPTS.md): every prompt used to make the game (also linked in the game, top right)
