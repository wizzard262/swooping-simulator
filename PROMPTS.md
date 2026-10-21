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
- Decision: the screenshots go on GitHub too, beside this file

## 6. A smooth sun, billowy clouds, a smooth magpie

- Make the sun much more like the picture: not pixel art at all, just a good-quality full render
- Make the sun half the height
- Make the clouds much more billowy, not just big blobs, like the picture I gave (towering pixel-art cumulus)
- Keep a folder of all the art I supply with my prompts (the sun, this cloud picture, anything else)
  - Decision: `prompt-art/` stays on this PC only, not on GitHub, as the pictures come from the web (the sun is a watermarked stock photo)
- Use this magpie: again not pixel art, standing like the picture; make him fly too, and let him walk along the ground

## 7. Hills with Australian icons

- Behind the houses, add another scrolling layer of hills with some Australian icons: the Sydney Harbour Bridge, Uluru and the Opera House

## 8. Swooping

- The space bar makes him swoop (go fast for 3 seconds)
- If you press up or down while swooping, the bird dives or climbs at about 30 degrees, and is drawn tilted that way
- In fact, up and down always tilt the bird 30 degrees up or down
- Swooping has a charge bar that takes about 10 seconds to fill; holding Space empties it in about 3 seconds from full

## 9. Photo-real sun and magpie, a faster swoop

- Make the sun and the magpie much more like the art I gave: full photo-real, no pixelation at all
  - Decision: the sun uses my Sun King picture, cut out of its white background
  - Decision: the magpie uses my picture and keeps its look and feel, but flaps its wings, walks with its legs, and pulls its wings back to swoop
- Make the swoop faster and blur the screen while he swoops
- Give the swoop afterburner-style flames out the back
- Clouds: decision to pin them to the sky (they don't scroll); it doesn't matter if the sun goes behind them

## 10. Session log

- Record the length of each session we spend on this at the bottom of this file

## 11. Pooping

- Under the swoop bar, add a poop bar; it also fills, but at half the speed
- Pressing P drops a white teardrop that turns into a splosh when it hits the ground (or other things, like people, that we might add)
  - Decision: one drop uses the whole bar, so one drop every 20 seconds

## 12. The prompts page

- Make sure the session table on the prompts page isn't squashed, and make the whole page about 50% wider

## 13. The sun

- I really want the sun to look exactly like the photo I gave you

## 14. Distant hills

- The background hills that aren't Uluru need to be smaller and greyed out a bit, to show they're in the distance

## 15. A deep suburb

- Make the houses tier off a little, 3–4 rows deep into the distance, like a very deep suburb

## 16. No purple trees

- I don't like the purple trees: make them a lighter green

## 17. A clear view of the harbour

- Remove the suburb's back buildings when we get to the bridge and the Opera House

## 18. The BOTTLE-O

- At ground level, a Dan Murphy's style bottle shop (picture in `prompt-art/04-dan-murphys-shop.png`)
  - A big sign says BOTTLE-O, but the colours and style are obviously Dan Murphy's, with the face in pixel art
  - A glass front; the bird can fly through it fairly easily from either direction, and we can see him do it. The glass is typical pixel-art glass: a few little highlight pixels, and tinted
- When the bird flies through, as he leaves, a few bottles and cans of Foster's and Johnnie Walker fall out of the door, then fade and disappear in about 4 seconds
- He does a 360 about his own axis (a barrel roll, not a loop the loop)
- For 10 seconds his flying is erratic, small bubbles rise off him, and his eyes are bright red with a flare around them

## 19. Pictures and screenshots

- Do you need me to send the Sun King and magpie pictures again? (Yes: pictures pasted now are saved as files, the earlier ones weren't)
- Under the prompts link, add a **screenshots** link: a page listing the screenshots in order, top to bottom, as the game evolves

## 20. Shop tweaks

- Make the shop glass bluer with more of those little highlight pixels
- Make the bottles and cans bigger, and more obviously Foster's and Johnnie Walker Red Label

## 21. A smaller shop with a pole sign

- Make the BOTTLE-O name and face into a sign on a post on top of the building, which the bird doesn't interact with
- Make the bottle shop half the length

## 22. The sun, again

- I really, really want the sun not to be pixel art at all, but photo-real like the picture I gave (sent again: a Shutterstock preview, with its watermark)

## Sessions

| # | Date | Length | What we did |
|---|------|--------|-------------|
| 1 | 2026-10-21 | about 80 min so far | Prompts 1–22: the first build, then the smooth sun and magpie, billowy clouds, hills with Aussie icons, the swoop bar, blur and afterburner, the poop bar, distant hills, a deep suburb with a clear view of the harbour, the BOTTLE-O, the screenshots page |
