'use strict';
// ---------------------------------------------------------------------------
// Objectives: everything there is to do (OBJECTIVES in data.js), each ticked off when its caption
// shows. O, Start on a controller, or the link under the timer opens the list; the game waits
// while it's open. Do them all and the game is complete: a fanfare, TOO EASY, MATE!, and only
// then does the run's score count for the high score, and the time for the best time.
// Then any key starts a new game.
// ---------------------------------------------------------------------------
const RUN = { done: new Set(), finished: false, finishedAt: 0, newHi: false, newBest: false };
const BEST = { time: 0 };          // the fastest game complete so far, in seconds (0: none yet); kept on this computer
try { BEST.time = +localStorage.getItem('swoopBestTime') || 0; } catch (e) { /* no saved best time */ }
const objList = document.getElementById('objectives');
let objLink = null;                // where the OBJECTIVES link is on screen: { x, y, w, h } in game pixels

const runTime = () => started ? (RUN.finished ? RUN.finishedAt : time) - startedAt : 0;
const clock = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
const onObjLink = p => objLink && p.x >= objLink.x && p.x <= objLink.x + objLink.w && p.y >= objLink.y && p.y <= objLink.y + objLink.h;
const objectivesOpen = () => !objList.hidden;

// A caption has just shown: if it names an objective, tick it off
function markObjective(text) {
  if (RUN.finished || RUN.done.has(text) || !OBJECTIVES.some(([name]) => name === text)) return;
  RUN.done.add(text);
  if (RUN.done.size === OBJECTIVES.length) finishRun();
}
function finishRun() {
  RUN.finished = true; RUN.finishedAt = time;
  RUN.newHi = SCORE.pts > SCORE.hi;
  if (RUN.newHi) { SCORE.hi = SCORE.pts; try { localStorage.setItem('swoopHi', SCORE.hi); } catch (e) { /* not saved */ } }
  recordBestTime(runTime());
  Sound.fanfare();
}
// The game's complete in this many seconds: is it the fastest yet? If so, keep it
function recordBestTime(took) {
  const noBestYet = !BEST.time;
  RUN.newBest = noBestYet || took < BEST.time;
  if (!RUN.newBest) return;                                         // slower than the best: nothing to keep
  BEST.time = took;
  try { localStorage.setItem('swoopBestTime', took); } catch (e) { /* not saved */ }
}
const bestTimeText = () => BEST.time ? 'BEST ' + clock(BEST.time) : '';
// After the game's complete (and a moment to take it in), any key, button or tap starts again
const canRestart = () => RUN.finished && time - RUN.finishedAt > 1.5;
function restart() { location.reload(); }

// The list: one row per objective, its caption, what to do, and a tick when it's done
function fillObjectives() {
  document.getElementById('objCount').textContent = RUN.done.size + ' / ' + OBJECTIVES.length;
  const best = BEST.time ? '   ' + bestTimeText() : '';             // the best time, once there is one
  document.getElementById('objTime').textContent = 'TIME ' + clock(runTime()) + best + (RUN.finished ? '   GAME COMPLETE!' : '');
  const rows = OBJECTIVES.map(([name, what], i) => {
    const tr = document.createElement('tr'), done = RUN.done.has(name);
    if (done) tr.className = 'done';
    for (const [cls, text] of [['num', i + 1], ['tick', done ? '\u2714' : '\u2610'], ['name', name], ['what', what]]) {
      const td = document.createElement('td'); td.className = cls; td.textContent = text; tr.append(td);
    }
    return tr;
  });
  const half = Math.ceil(rows.length / 2);                           // two columns side by side
  document.getElementById('objCols').replaceChildren(...[rows.slice(0, half), rows.slice(half)].map(part => {
    const table = document.createElement('table'), body = document.createElement('tbody');
    body.append(...part); table.append(body);
    return table;
  }));
}
function toggleObjectives(open = !objectivesOpen()) {
  if (open) fillObjectives();
  objList.hidden = !open;
  for (const k in keys) keys[k] = false;                            // nothing stays held down behind it
  releaseTouchControls();
}
document.getElementById('objClose').addEventListener('click', () => toggleObjectives(false));
objList.addEventListener('click', e => { if (e.target === objList) toggleObjectives(false); });   // a click outside the panel closes it

// The end: the big caption, which stays, with how you did and how to play again
function drawEnd(g) {
  if (!RUN.finished) return;
  const age = time - RUN.finishedAt, grow = Math.min(1, age / 0.6);
  drawPopText(g, END_TEXT, W / 2, 58, 1.15 * Math.sqrt(grow) * (1 + 0.04 * Math.sin(time * 5)), 1, Math.floor(time * 4) % 2 ? '#ffd23f' : '#e8232a');
  if (canRestart()) drawPopText(g, isTouch ? 'TAP TO RESTART' : 'PRESS ANY KEY TO RESTART', W / 2, 128, 0.45 + 0.02 * Math.sin(time * 6));
}
function drawEndStats() {
  if (!RUN.finished || time - RUN.finishedAt < 0.6) return;
  drawTextCentred('GAME COMPLETE - ALL ' + OBJECTIVES.length + ' OBJECTIVES DONE', 84, '#ffffff');
  drawTextCentred('TIME ' + clock(runTime()) + '   SCORE ' + SCORE.pts, 94, '#ffe066');
  const blinkOn = Math.floor(time * 3) % 2;                         // the news flashes
  if (!RUN.newBest) drawTextCentred('BEST TIME ' + clock(BEST.time), 104, '#cfd8e0');   // slower: show the time to beat
  else if (blinkOn) drawTextCentred('NEW BEST TIME!', 104, '#5fd35f');
  if (RUN.newHi && blinkOn) drawTextCentred('NEW HIGH SCORE!', 112, '#5fd35f');
}

// The title screen: how many objectives there are, how to see the list, each one in turn, and the best time
const TITLE_OBJ_EVERY = 2.5;       // seconds each objective shows on the title screen
// Only the letters the pixel font has (no commas or apostrophes)
const fontSafe = str => str.toUpperCase().replace(/[^A-Z0-9 \-+.!:\/]/g, '');
function drawTitleObjectives(y) {
  const howToSee = PAD.connected ? 'START' : isTouch ? 'TAP OBJECTIVES TOP RIGHT' : 'O KEY';
  drawTextCentred('DO ALL ' + OBJECTIVES.length + ' OBJECTIVES - ' + howToSee + ' FOR THE LIST', y, '#9fdcff');
  // One objective at a time, in order: its number and caption in red, what to do in white
  const n = mod(Math.floor(time / TITLE_OBJ_EVERY), OBJECTIVES.length);   // (time starts just below 0)
  const [name, what] = OBJECTIVES[n];
  const head = (n + 1) + '. ' + name, tail = ' ' + fontSafe(what);
  const x = Math.round((W - textWidth(head + tail)) / 2);           // the whole line centred
  drawText(head, x, y + 10, '#ff7a6a');
  drawText(tail, x + head.length * 4, y + 10, '#ffffff');           // straight after the caption (4 pixels a letter)
  if (BEST.time) drawTextCentred('BEST TIME ' + clock(BEST.time), y + 22, '#ffe066');
}
