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

## 23. Bottles back as they were, and on the shelves

- The bottles coming out of the BOTTLE-O before were perfect: put them back as they were
  - Decision: back to the first small ones (the plain Foster's can and black-label bottle)
- Fill the shop's shelves with those same pictures at half the size

## 24. The sun picture

- Use `C:\Users\jones\Desktop\sun.png` for the sun, cut out from its background

## 25. Key hints

- After the poop bar put the text "- P KEY", and after the swoop bar "- SPACE BAR"
  - On touch screens they read "- SECOND FINGER" and "- QUICK TAP" instead

## 26. Legs in a swoop

- When he swoops, can we see his legs dangling down from his body at 30 degrees and flapping around

## 27. Calmer legs

- Make the legs flap less, and only at an angle of 15 degrees

## 28. SWOOP-AND-POOP!

- If he swoops and poops at the same time, flash "SWOOP-AND-POOP!" in Roy Lichtenstein pop-art lettering for 1 second, fading out

## 29. Stunts

- Under the poop bar add "BARREL ROLL - B KEY", then "LOOP-DE-LOOP - L KEY"
- Line up the "- X KEY" texts with the "- P KEY" text
- Pressing B or L does a barrel roll or a loop-the-loop

## 30. Sound

- Can we add sound?
  - Decision: sounds made in code (no files); the poop and pub sounds plus a background; sound starts on the first key press, M or a speaker icon mutes it and it's remembered

## 31. M in the key list

- Add M to the key list under LOOP-DE-LOOP

## 32. Didgeridoo

- In the background, a didgeridoo fading in and out now and then

## 33. A corkscrew barrel roll

- Make the barrel roll faster, and more of a corkscrew than a clean roll about his own axis

## 34. Afterburner sound

- Add swoop afterburner sounds

## 35. Full screen

- Make the game fit my full screen

## 36. Quieter, smaller SWOOP-AND-POOP!

- Remove the SWOOP-AND-POOP! sound effect; put the text above the bird at half the size

## 37. No face on the sign

- Remove the face from the BOTTLE-O sign

## 38. Real clinks

- Make the bottle and can sounds more like real bottles and cans clinking

## 39. A real didgeridoo

- The didgeridoo has to change its tone: it sounds too much like a drone; make it more realistic

## 40. No text in the shop

- Remove the BOTTLE-O text from inside the shop

## 41. A slightly pixelated magpie

- Make the magpie slightly more pixelated

## 42. SWOOP-AND-LOOP!

- When he does a swoop and a loop, add the Lichtenstein-style text; it should start from nothing, grow and fade out over 1 second

## 43. A bit more pixelated

- Pixelate the magpie slightly more

## 44. No flag

- Remove the chequered flag

## 45. No swooping by itself

- When we first move the magpie he seems to swoop by himself without the space bar: remove that
  - Cause: a quick mouse click on the game (to focus the window) counted as a touch-screen tap, which starts a swoop. Touch controls now only answer fingers and pens

## 46. Crisp, not fuzzy

- The magpie is too fuzzy: the pixelation is good, but make him not fuzzy

## 47. More real sounds

- More realistic bottle and can sounds, and a more realistic didgeridoo with more "wo-wow-wow", like a real one

## 48. Browser width, not full screen

- Remove F for full screen; just resize the game to the browser's width. A black bar at the bottom to keep the aspect ratio is fine

## 49. Faster walk

- Double the walking speed

## 50. Just cans, and a more real didgeridoo

- Remove the bottle sound and make it just cans clanging; the didgeridoo needs to sound more like a real one
  - Decision: keep the didgeridoo made in code (rather than a recording)

## 51. A Hills Hoist to ride

- Put a Hills Hoist up front on the ground by the shop, with some clothes on it; if the bird lands on it, it spins with him on it

## 52. Both texts the same

- SWOOP-AND-POOP! and SWOOP-AND-LOOP! should both grow from nothing and fade out; the loop one moves around, which I don't want
  - Both now stay put on the screen where the magpie was when they appeared

## 53. Hills Hoist away from the shop

- Put the Hills Hoist as far from the shop as possible; when the bird is on it, the bird and the Hills Hoist spin together
  - It's now half a lap from the shop (the level loops); the warning sign moved to the start of the lap to make room

## 54. A game controller

- Will this support a controller? I'm going to plug one in. Map the buttons sensibly
  - Left stick or D-pad: fly; A: flap; right trigger or right bumper (hold): swoop; X: poop; B: barrel roll; Y: loop-the-loop; Back: sound

## 55. A kangaroo in a cork hat

- Make a kangaroo in the same pixel style as the bird, hopping along and wearing a cork hat

## 56. Knock him over, ride him

- If the kangaroo gets swooped or pooped, he falls over with dizzy stars over him for 5 seconds
- The bird can land on him and ride on him

## 57. Doiiinggg

- Give the kangaroo a noise like "doiiinggg" when he's hit

## 58. Turning on the hoist

- When the bird lands on the Hills Hoist, don't hop: just turn round with the hoist, from facing left to facing right

## 59. Controller (again)

- Can we do the controller support? (It was already in from prompt 54: press any button once after plugging in)

## 60. Carried round the hoist

- The bird's spin on the Hills Hoist is good, but make him move with the hoist too: if he lands on the left, as it rotates he moves to the right, and still turns

## 61. Magpie photo on hold

- Forget the magpie photo for now (the magpie stays drawn in code)

## 62. Faster poop

- Make the poop bar recharge in 5 seconds

## 63. Turning round

- When the bird turns, he carries on going the old way; he should take 1 second to get going the other way
  - From any speed (even straight after a swoop) he's now flying full speed the other way 1 second after you turn

## 64. Controller and resizing (checks)

- How did we do with resizing to fit the browser, and the controller support? My controller is a standard USB Xbox one on a PC. Also resize the width to fit when the browser is resized
  - Both were already in; checked again on the live site: the game refits the width every time the window is resized, and a standard Xbox controller is the layout it's mapped for

## 65. A tree to land on

- Put a tree in the same style as the background ones in the foreground, which the bird can land on; space it away from the Hills Hoist and the BOTTLE-O

## 66. An Aussie flag

- Give one of the front row of houses a flapping Australian flag on a pole

## 67. A more natural tree

- Make the tree more organically shaped

## 68. Controller check

- The controller works. (Asked for the button that flies up to do the swoop, then decided the right trigger for the swoop is fine: kept as it is)

## 69. A big batch

- When the bird is on the ground, every 10 to 20 seconds (at random) he does a magpie call: he raises his head and opens and shuts his beak for 2 seconds, with a magpie call sound
- Make poops fade away over 10 seconds
- Make the barrel roll more of a corkscrew, with a wider circle round the corkscrew's centre line
- Remove the lap counter
- Halve the size of the BOTTLE-O sign
- Remove the SWOOPING MAGPIES sign
- Put a koala in the tree, climbing up and down the trunk
- Separate the clouds from the background and make them parallax again
- There's a little sound like chirps or water drops: remove it (it was the distant birds)
- Put a small shark fin in the sea in front of the bridge: it appears at random but rarely (about every 30 seconds), rises, moves along, then sinks back down
- Put a man using a barbecue between the Hills Hoist and the BOTTLE-O, flipping burgers. If the bird lands on the barbecue he starts to smoke, goes red, and gets thrown off with a sizzle
- Put a kookaburra on top of the tree. If the bird swoops or poops him, he topples and spins down to the ground, stunned like the kangaroo, then flies back up after a few seconds
- Put a typical Australian postie on his motorbike riding along the front row of houses, stopping briefly at random houses
- Then check it in and publish it; don't take a screenshot for every change, just one at the end
- If you don't know what the "water drip" sound is, list the sounds we've got for me to pick from

## 70. Pixel poop, a bigger barbie

- Make the poop pixelated
- Make the barbecue and the man 50% taller, and the barbecue slightly wider

## 71. Widening the browser

- Fix the resize when the browser is widened: make it full width; a black strip at the bottom is fine if it keeps the aspect ratio better
  - The game always fills the width now, however wide the window (it used to stop at 4:1); taller windows get a black strip below

## 72. Burnt on the barbie

- When the bird sizzles on the barbecue, make him scream and tumble onto his back waving his legs, then he stands back up
- When he tumbles, he spins and rotates

## 73. A bigger kookaburra

- Make the kookaburra twice the size

## 74. The live address

- What's the live URL on GitHub? (https://wizzard262.github.io/swooping-simulator/)

## 75. The kookaburra laughs

- While he's on screen, now and then (rare, about every 30 seconds, at random) the kookaburra calls, opening his beak

## 76. A wider barbie

- Double the barbecue's width; if the bird poops on it, it sizzles

## 77. A proper kookaburra laugh

- The proper kookaburra call is like a screeching laugh

## 78. Open beaks

- When the two birds' beaks are open, remove the fill between the top and bottom of the beak

## 79. A harbour ferry

- Add a small green Sydney Harbour ferry that moves slowly back and forth across the width of the sea; it has a wheelhouse at each end, so it goes both ways without turning

## 80. A better shark fin

- The shark fin moves the wrong way; also make it more curvy

## 81. Koala up the branch

- The koala should go along the central branch, up to the tree's canopy

## 82. More ideas

- Give me some more good ideas to put in, Australian ones especially
  - Picked: a cyclist in a helmet to swoop, a score with combos, weather (storms), cockatoos, a possum on the power line, a beach with lifesavers, a drop bear
- The drop bear drops if you stay under the tree; it can't be seen until it drops, then it climbs back up and disappears into the canopy
- The possum is small, in the background with the front row of houses: add a power line
- Make the postie rideable, so the magpie can ride on him; the ferry the same
- A few tiny bridge-climber figures moving slowly across the bridge
- Remove the beach and the shark alarm
- The cyclist needs to be as big as the kangaroo

## 83. Just one power line

- Remove the long power line: I want just one, between two houses, with the possum moving along that one section only, about 20% above the roof height

## 84. On the portfolio

- What's the published URL? Add it to the portfolio page on the Harrier Carrier website, and commit and push both this game and the website

## 85. No graphics card needed?

- Does this work without graphics acceleration? (Yes: checked with the GPU, hardware canvas and WebGL all switched off, it runs at 60 frames a second)

## 86. Move the backyard hoist

- Move the background Hills Hoist (not the foreground one) to another position, as it now clashes with the power line: move it to the next house

## 87. Move the front hoist

- Move the front Hills Hoist about three times its width to the left

## 88. Keep going

- Keep committing and publishing

## 89. More possum

- Keep the possum on the power line a third of the time

## 90. A better cyclist

- The cyclist's collision detection is far too high, well above his head
- Try a different, blockier, slightly larger cyclist: I don't like him

## 91. Poopable bridge climbers

- Make the bridge climbers poopable as a group: if they're hit, they scream a word bubble and jump up and down for 3 seconds

## 92. Cartoon swearing

- The word bubble has a cartoon profanity like "#!$?", or whatever the stereotype is

## 93. Poopable postie

- Make the postie poopable too: he gets knocked off sideways, picks up his bike and heads off the opposite way

## 94. Cable ties and losing points

- The cyclist always has cable ties on his helmet; he can't be swooped, only pooped
- If you swoop him, land on the barbecue or get drop-beared, you lose points: show a minus. The total score can go below zero

## 95. A quieter kookaburra

- The kookaburra should laugh less often, and not when he's off screen

## 96. Whirling the hoist

- Swooping past the Hills Hoist spins it fast, and the clothes swing outwards as if with centrifugal force

## 97. Hanging under the hoist

- If the magpie flies up under the Hills Hoist, he can hold on and ride it round
- Half the time he looks up and holds on with his wings, legs waggling; the other half he hangs upside down by his feet as it turns

## 98. WHIPPER SNIPPER!

- If the magpie swoops while he's spinning after the barbecue, he scores, and the words "WHIPPER SNIPPER!" travel along above him, flashing
- The cyclist has too many cable ties: just 4

## 99. BARREL SWOOP!

- Add pop-art text for a barrel roll: "BARREL SWOOP!"

## 100. Performance

- How's performance? We've got a lot going on

## 101. Version number

- Put a version number just under the screenshots link: work out how many versions we've done and make a good guess at where we're up to

## 102. Cable-tie spokes

- Make the cyclist's cable ties short, fanning out round a curve like spokes do

## 103. Upside down only

- Remove the magpie holding on to the Hills Hoist with his wings: just hang upside down

## 104. Hoist WHIPPER SNIPPER!

- Spinning the Hills Hoist scores and says WHIPPER SNIPPER!
- When the magpie spins off the barbecue, change the text: give me 10 options

## 105. Poopable possum

- The magpie can poop on the possum to score, and the possum spins round the wire for 3 seconds

## 106. BEER-BARREL!

- When the magpie does a barrel roll through the BOTTLE-O, it says in pop-art text "BEER-BARREL!"

## 107. Barbecue swoop text

- Give me some different, suitable text options in a radio select for when the magpie swoops after being thrown off the barbecue
- Picked: SNAG ROCKET!

## 108. Smaller pop art

- Make all the pop-art text 30% smaller

## 109. Spiked by the cyclist

- If the magpie swoops the cyclist, he's knocked back spinning and lands on his back with his legs wiggling, like after the barbecue

## 110. Captions for everything

- Which interactions have no text? List them with great Australian sayings and jokes, each as a radio option with a "none" option
- Picked: kangaroo knocked over ROO-DY HELL!, riding the kangaroo ROO WRECKER!, kookaburra knocked off KOOKA-BOOM-A!, postie knocked off SPECIAL DELIVERY!, possum spun ROUND THE TWIST!, landing on the barbecue COOKED, MATE!, drop bear YEAH, NAH!
- Pooping the cyclist: list some more, maybe CYCLO-something. Picked CYCLO-PATH!
- Picked: hanging under the hoist DOWN UNDER!, riding the postie or ferry BLUDGER!, riding the hoist SPIN CYCLE!, spiked by the cyclist STREWTH!

## 111. Bridge climbers and the barbie

- And for the bridge walkers? Offer more; they've got to be shorter. Picked COAT-HANGER!
- Give some for pooping on the barbecue, a pun on barbie. Picked BARBIE-POO!

## 112. RBT TIME!

- And one for landing on the postie, plus another for when the magpie is drunk, implying drink driving
- Picked: BLUDGER! when sober, RBT TIME! when drunk

## 113. No starburst

- Lose the flash behind the pop-art text

## 114. BEER-BARREL! only when you roll

- Every time through the BOTTLE-O it now says BEER-BARREL! and does a barrel roll: it should only happen if you do the barrel roll

## 115. Any ideas?

- OK, what else have we got? Any ideas? (Interrupted before choosing)

## 116. No spikes on the pop art

- The pop-art text still has some triangles of the explosion coming off it: get rid of them

## 117. Faster poops

- Faster poops: make them recharge in 3 seconds

## 118. Snags and the nest

- The barbecue bloke flips a sausage into the air every 4 seconds; it spins up to half the screen's height
- The magpie can catch it (SNAG-A-SNAG!) and carry it in his beak; the bloke keeps flipping more
- Swooping, pooping or getting knocked back (the barbecue, the cyclist) makes him drop it, and it disappears
- He can take it to a nest of 3 little chicks at the top of the tree and feed them; give me ideas for the text in radio options. Picked: BREKKIE!
- Both score
- Also: a table of all the events, with their text and score (or minus score). Are there any events with no score or no text?

## 119. Don't commit yet

- Don't commit for now: I want to time it

## 120. Barrels, GROG RUN! and a quieter kookaburra

- Make sure we only hear the kookaburra when he's on screen
- When we barrel roll through the BOTTLE-O, don't throw out bottles and cans: show 2 beer barrels bouncing out
- What text can we show for flying through the BOTTLE-O? Give radio options. Picked: GROG RUN!

## 121. Hyphens and a postie pillion

- WHIPPER SNIPPER! becomes WHIPPER-SNIPPER!, SNAG ROCKET! becomes SNAG-ROCKET!, SPIN CYCLE! becomes SPIN-CYCLE!
- We need a different text for landing on the postie: give me radio options, maybe PILLION-something. Picked: POSTIE-PILLION!

## 122. Sounds and a tidy-up

- List all the sounds used
- Then run a review for efficiency, refactor, and remove duplication

## 123. A separate JS file?

- Will it still run in the browser directly, without hosting, if we put the JavaScript in its own file?

## 124. Rain that tilts

- When the magpie swoops or flies forward, up or down, make the rain tilt as he moves

## 125. JavaScript in its own files

- OK, put the JavaScript in its own file, and split the library out into other files if it will still work in the browser unhosted: data like the sun image, tables of numbers, functions, and the game loop

## 126. Questions about the art

- Open the folder with all the pixel art. So we draw all the art from code? How is this possible? So it's totally different from using sprite sheets?

## 127. A bigger sun

- Make the sun 25% larger

## 128. Fit any window

- Can we resize to any browser size, with a black strip if needed to keep the aspect ratio? Picked: a fixed 16:9 view, centred, with black bars

## 129. Objectives and a timer

- Put a timer on the game, near the score, and below it a link to the objectives. Put it in the list of keys as O, below the others, and give it a controller button
- Clicking it toggles a popup window with the table of events: each event's name is the text shown when it's done, then the description, and each shows done or not done with a tick
- That's a lot of data to get on screen: can we do it?
- When they're all done the game is complete, and only then is a run's high score set. Play a little fanfare and some celebratory text; give me 10 great end-text options. Picked: TOO EASY, MATE!
- Make the end text like all the others, but bigger, and it doesn't fade away; add a smaller PRESS ANY KEY TO RESTART
- I keep closing your browser windows when the game opens: is that OK?

## 130. A tidier list

- Remove the 3 instances of "(costs 100 points)"
- Put the list in 2 columns, to get it all on screen without scrolling

## 131. One line each

- Shorten any text to stop any line wraps

## 132. Links to the bottom right

- Move the top-right text (prompts and the rest) to the bottom right, so the pixel score and the rest can sit in the top right
- For the bottom line of the popup put just "Press any key to exit", and make it work that way

## 133. SWOOP-POO-LOOP!

- Is it possible to do a SWOOP-POO-LOOP? Add it as another goal, listed 3rd down
- Also, can we require the swoop-poop and the swoop-poo-loop to hit something (any poopable character)?
- Add the list to the instructions

## 134. SWOOP-POOP-LOOP!

- Call it SWOOP-POOP-LOOP

## 135. A new roo caption

- I don't like ROO-DY HELL!: think of some others, 10 options. Picked: ROO THE DAY!

## 136. Together, in any order

- Can the swoop, poop and loop all happen together, or do they need to be in order?
- OK, make it loop, then poop and swoop, and rename it. Picked: LOOP-POOP-SWOOP!
- Make it so any 2 goals can happen together, like flying through the BOTTLE-O and a barrel roll together
- Or LOOP-POOP-SWOOP! fulfils all the swoop, poop and loop goals; list any others that might count as 2 goals at once
- How do we score the multiplier currently?

## 137. Helmets for the climbers

- What's the best colour for the bridge walkers, as in real life? OK, try a white helmet dot

## 138. A combo bar

- Can we have a combo cooldown in the key list section? Make it 6 seconds
- Remove the white helmets from the bridge walkers

## 139. Shark attack

- Let's add a shark attack: you've got to swoop the shark fin. Give me 10 options for the text. Picked: FIN-ISHED!

## 140. More shark

- What else are we missing? It looks pretty good
- Make the shark appear more often: decide what works well

## 141. Join the flock

- Another goal, join the flock: fly with the crested cockatoos for 5 seconds, keeping with them. Suggest some text. Picked: FLOCK YEAH!
- By keeping above the cockatoos I don't mean vertically above, I mean overlapping them
- How often does the storm come?

## 142. Struck by lightning? No

- I want a goal where he gets hit by lightning, but there's nothing easy to interact with and the storm is rare: give me ideas
- OK, no storm lightning goal

## 143. Hoot the owl

- Do you know the owl Hoot from Giggle and Hoot? We can add him: what could we do with him, how would he interact?
- Picked: follow the leader, flying through his trail of hoot notes. Caption picked: HOOT HOOT!
- Does he just turn up rarely, like the cockatoos?

## 144. Hoot's look, then no Hoot

- He's got to be blue and flying sideways: give me options, show me 5 renders, make it look just like Hoot
- OK, show me 5 renders of him from the front: we'll do something else with him
- Look at the picture on the Desktop, hoot.png: show me 5 pixelated versions of him
- None: let's leave this idea. Remove the owl and his goal

## 145. Cooked when flung

- Don't say COOKED, MATE! until the bird is thrown off the barbecue

## 146. Barbie on the move

- Put the barbecue between the Hills Hoist and the BOTTLE-O

## 147. ROO-DIMENTARY!

- Change ROO WRECKER! to ROO RIDER!
- No, change it to ROO-DIMENTARY!

## 148. Bigger possum

- Make the possum 25% larger and 30% more common

## 149. Barrel roll burst

- For the barrel roll, make him turn on his axis and thrust forward like the swoop, but no afterburner

## 150. Show the combo

- I don't ever see a combo text: it should say COMBO X3 etc.

## 151. Double barrel roll

- Make each barrel roll 2 rotations

## 152. Sky in strips

- Try the sky as 4 coloured blue strips, like in Harrier Carrier, but blended at the edges

## 153. SOLAR-NOVA!

- Add a goal to loop-the-loop round the sun: give me 10 names, something SOLAR-. Picked: SOLAR-NOVA!
- And the screen fades out quickly to white and snaps back
- When the SOLAR-NOVA! happens, I want all the clouds to disappear for 10 seconds and fade back in
- Fade back in slowly, one at a time, over 20 seconds

## 154. Sharp sky strips

- No, for the sky make the coloured strips distinct and sharp
- Make the sky 5 distinct strips, all the same height

## 155. Wisps

- I want a very low level of cloud, like thin wispy lines

## 156. SOLAR-NOVA! bounce

- Make the sun fade out 4 times slower, and then when we come back to normal I want a 2-second tween bounce
- A tween bounce of the whole game!
- The fade should start slow and accelerate

## 157. Drunk glitch

- When the bird is drunk, can we have some pixel glitch and a horizontal random slide around the screen

## 158. Postie somersault

- When the postie is knocked off his bike, make him somersault off and walk back to the bike: a 4-second sequence
- Somersault off in a slow-motion roll with limbs flailing
- Make the postie's limbs flail much faster

## 159. More time, bigger poops

- Allow twice as long for a swoop-poop, a swoop-and-loop and a loop-poop-swoop; make poos hit 25% wider

## 160. Eaves

- Make the house roofs extend out about 15% of the building's width

## 161. KANGA-POO!

- Add a goal to poop on the kangaroo, called KANGA-POO!

## 162. TRUE-BLUE!

- Add a goal to barrel roll past the Aussie flag: when the bird does, the flag disappears and he wears it like a cape for 5 seconds. The text for the goal is TRUE-BLUE
- The flag reappears when this is done

## 163. Zoom, not warp

- When the solar loop warps, I don't want to see the size of the whole game change, giving it black bars at the side: bulge it out to distort centrally, fish-eye style
- OK, for the solar loop thing just zoom in 30% and tween bounce back to normal size; remove the existing attempts at animation
- Don't allow the game to change from full screen: it keeps the full size of the browser

## 164. Stretchy stunts

- With the barrel roll and loop, stretch the bird 50% longer but not taller through the manoeuvre: stretching up to size and back down

## 165. SOLAR-SLINGSHOT!!!!

- When he does the solar loop, make him stretch to 200% length but not height and rotate around the sun 3 times, coming out with twice the swoop and afterburner of a normal swoop. Rename it SOLAR-SLINGSHOT!!!!

## Sessions

| # | Date | Length | What we did |
|---|------|--------|-------------|
| 1 | 2026-10-21 | about 740 min so far | Prompts 1–145: the first build, then the smooth sun and magpie, billowy clouds, hills with Aussie icons, the swoop bar, blur and afterburner, the poop bar, distant hills, a deep suburb with a clear view of the harbour, the BOTTLE-O, the screenshots page, the photo sun, key hints, legs dangling in a swoop, SWOOP-AND-POOP!, barrel rolls and loops, sound and a didgeridoo, fitting the browser width, real-sounding clinks and didgeridoo, SWOOP-AND-LOOP!, a Hills Hoist to ride, controller support, a kangaroo in a cork hat, a big gum with a koala and kookaburra, a flag, a barbie, the postie, a shark, a harbour ferry, a cyclist, a drop bear, cockatoos, a possum, storms, a score, swearing bridge climbers, a poopable postie, losing points, a whirling hoist to hang under, WHIPPER SNIPPER!, BARREL SWOOP!, BEER-BARREL!, a spinning possum, Aussie captions for everything, a performance check, a version number |
| 2 | 2026-10-23 | about 120 min so far | Prompts 146–165: the barbie moved between the BOTTLE-O and the Hills Hoist, ROO-DIMENTARY!, a bigger and more common possum, a barrel roll that spins on his axis and bursts forward (two turns), COMBO X shown with the points, the sky in five sharp strips, low wisps of cloud, SOLAR-NOVA! (loop round the sun: white flash, clouds burnt away, the whole game bouncing back), a drunk slide and glitch, the postie's slow-motion somersault, longer swoops, wider poop hits, wider eaves, KANGA-POO!, TRUE-BLUE! (the flag as a cape), stretchy stunts, the sun loop becoming SOLAR-SLINGSHOT!!!! (three times round the sun, flung out at double swoop speed, the game zooming in and bouncing back) |
