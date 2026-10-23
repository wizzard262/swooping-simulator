# Swooping Simulator

- After every prompt about the game, add a short summary of it to [PROMPTS.md](PROMPTS.md) (spelling and typos fixed), as its note says
- At the end of each session, record its length in the **Sessions** table at the bottom of PROMPTS.md (keep that table last)
- After each change to the game, save a numbered screenshot in `screenshots/` (`02-short-name.png`, `03-…`), taken in a visible browser, then add it to `screenshots/list.json` (the screenshots page reads that list)
- Save every picture the user supplies with a prompt in `prompt-art/` (numbered). That folder is git-ignored: it stays on this PC
- Sound is synthesised in the `Sound` module (Web Audio); no sound files
- The game is `index.html` plus its scripts in `js/` (plain JavaScript, 2D canvas, no WebGL). They're classic scripts loaded in order, not modules, so the game also runs straight from the file with no server: keep it that way (no `type="module"`, no `fetch` in the game). `prompts.html` renders `PROMPTS.md`
  - `js/sun-image.js` the sun picture; `js/data.js` world numbers and tables; `js/helpers.js`; `js/sound.js`; `js/scenery.js`; `js/magpie.js`; `js/shop.js`; `js/cast.js`; `js/game.js` (input and movement); `js/objectives.js` (the objectives list, timer and game complete); `js/draw.js`; `js/main.js` (start-up and the game loop)
- Test locally with `python -m http.server 8765` in this folder, then open http://localhost:8765/
- The version number (`#ver` in `index.html`, under the screenshots link) goes up by 1 with every commit to the game: it's the count of commits (`git rev-list --count HEAD` + 1 for the commit being made)
