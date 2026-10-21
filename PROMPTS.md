# Swooping Simulator: the prompts

> **Note for Claude:** every time a prompt is given to work on this game, add a short summary of it here (spelling and typos fixed), newest at the bottom. Include any decisions made in reply to your questions. Keep summarising as much as possible: this file is the history of how the game was made, and the game links to it (top right, **prompts**).

## 1. Make the game (2026-10-21)

- Make a new GitHub repo, `swooping-simulator`, in my GitHub repo folder, published to GitHub Pages
- A Flappy Bird clone, but:
  - Arrow keys move the bird up, down, left and right, instead of always flying right and tapping to stop it dropping
  - The bird still falls slowly under gravity
- The level is about 6 screens wide, with a parallax background
- Clouds like the ones in the Harrier Carrier game
- JavaScript and one HTML page, no acceleration such as WebGL
- No obstacles for now
- The bird is an Australian magpie

## 2. Decisions (answered as multiple choice)

- Come back to me with any decisions as a multiple-choice question
- Clouds: new pixel-art clouds drawn in code, in the same style as Harrier Carrier's
- Art style: pixel art
- End of the level: the level loops round
- Ground: the magpie lands softly and can take off again

## 3. Three layers and the sun

- Three scrolling layers:
  1. Ground: grass
  2. Suburb: Australian-style houses, bushes and trees; pixel-art houses, one storey, shallow roofs, brick
  3. Clouds and sky
- Put a sun in the sky, drawn like the gold Sun King image I gave (a face in curly hair, straight and wavy rays, a fleur-de-lis sceptre and a hand of justice)
  - It parallaxes even slower than every other layer: you can loop the full level about 3 times before it goes off the left of the screen and comes back on the right (and the other way round)

## 4. This file

- Keep an MD file in the root of the repo summarising all my prompts for the game, with this note telling Claude to keep doing it
- Put a tiny link to it in the top right of the screen that opens in a new browser tab
- Show the MD file in a wrapper page that renders it properly, rather than linking straight to the raw file
- Fix all my spelling mistakes and typos in the summaries

## 5. Screenshots as we go

- Keep a series of numbered screenshots in a local folder as the game develops (`screenshots/`), and take one now
