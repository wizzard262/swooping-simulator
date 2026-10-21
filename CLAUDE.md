# Swooping Simulator

- After every prompt about the game, add a short summary of it to [PROMPTS.md](PROMPTS.md) (spelling and typos fixed), as its note says
- At the end of each session, record its length in the **Sessions** table at the bottom of PROMPTS.md (keep that table last)
- After each change to the game, save a numbered screenshot in `screenshots/` (`02-short-name.png`, `03-…`), taken in a visible browser, then add it to `screenshots/list.json` (the screenshots page reads that list)
- Save every picture the user supplies with a prompt in `prompt-art/` (numbered). That folder is git-ignored: it stays on this PC
- Sound is synthesised in the `Sound` module (Web Audio); no sound files
- The game is one page: `index.html` (plain JavaScript, 2D canvas, no WebGL). `prompts.html` renders `PROMPTS.md`
- Test locally with `python -m http.server 8765` in this folder, then open http://localhost:8765/
