'use strict';
// ---------------------------------------------------------------------------
// Objectives: everything there is to do (OBJECTIVES in data.js), each ticked off when its caption
// shows. O, Start on a controller, or the link under the timer opens the list; the game waits
// while it's open. Do them all and the game is complete: a fanfare, TOO EASY, MATE!, and only
// then does the run's score count for the high score. Then any key starts a new game.
// ---------------------------------------------------------------------------
const RUN = { done: new Set(), finished: false, finishedAt: 0, newHi: false };
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
  Sound.fanfare();
}
// After the game's complete (and a moment to take it in), any key, button or tap starts again
const canRestart = () => RUN.finished && time - RUN.finishedAt > 1.5;
function restart() { location.reload(); }

// The list: one row per objective, its caption, what to do, and a tick when it's done
function fillObjectives() {
  document.getElementById('objCount').textContent = RUN.done.size + ' / ' + OBJECTIVES.length;
  document.getElementById('objTime').textContent = 'TIME ' + clock(runTime()) + (RUN.finished ? '   GAME COMPLETE!' : '');
  const rows = OBJECTIVES.map(([name, what]) => {
    const tr = document.createElement('tr'), done = RUN.done.has(name);
    if (done) tr.className = 'done';
    for (const [cls, text] of [['tick', done ? '\u2714' : '\u2610'], ['name', name], ['what', what]]) {
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
  touch = null;
}
document.getElementById('objClose').addEventListener('click', () => toggleObjectives(false));
objList.addEventListener('click', e => { if (e.target === objList) toggleObjectives(false); });   // a click outside the panel closes it

// The end: the big caption, which stays, with how you did and how to play again
function drawEnd(g) {
  if (!RUN.finished) return;
  const age = time - RUN.finishedAt, grow = Math.min(1, age / 0.6);
  drawPopText(g, END_TEXT, W / 2, 58, 1.15 * Math.sqrt(grow) * (1 + 0.04 * Math.sin(time * 5)), 1, Math.floor(time * 4) % 2 ? '#ffd23f' : '#e8232a');
  if (canRestart()) drawPopText(g, 'PRESS ANY KEY TO RESTART', W / 2, 128, 0.45 + 0.02 * Math.sin(time * 6));
}
function drawEndStats() {
  if (!RUN.finished || time - RUN.finishedAt < 0.6) return;
  drawTextCentred('GAME COMPLETE - ALL ' + OBJECTIVES.length + ' OBJECTIVES DONE', 84, '#ffffff');
  drawTextCentred('TIME ' + clock(runTime()) + '   SCORE ' + SCORE.pts, 94, '#ffe066');
  if (RUN.newHi && Math.floor(time * 3) % 2) drawTextCentred('NEW HIGH SCORE!', 104, '#5fd35f');
}
