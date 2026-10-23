'use strict';
// ---------------------------------------------------------------------------
// The magpie, drawn smoothly (not pixel art): glossy black, white nape, shoulders
// and tail base, a pale bill with a dark tip and a red-brown eye.
// Units: about 100 from tail to bill; origin at the body centre, facing right, +y down.
// ---------------------------------------------------------------------------
function blackFill(g, x, y, r) {
  const gr = g.createRadialGradient(x - r * 0.4, y - r * 0.5, r * 0.05, x, y, r * 1.2);
  gr.addColorStop(0, '#4b5060'); gr.addColorStop(0.35, '#22232b'); gr.addColorStop(1, '#0c0c10');
  return gr;
}
function whiteFill(g, x, y, r) {
  const gr = g.createRadialGradient(x - r * 0.3, y - r * 0.4, r * 0.05, x, y, r * 1.1);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#eceef1'); gr.addColorStop(1, '#b8bcc6');
  return gr;
}
function blob(g, fill, draw) { g.beginPath(); draw(); g.closePath(); g.fillStyle = fill; g.fill(); }
// Shorthands for drawing the cast: fill a shape, or stroke a line through a list of points
function brush(g, cap = 'round') {
  return {
    fill: (col, shape) => blob(g, col, shape),
    line: (col, w, pts) => {
      g.strokeStyle = col; g.lineWidth = w; g.lineCap = cap; if (cap !== 'round') g.lineJoin = 'miter';
      g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    }
  };
}

// A spread wing at the shoulder; open runs from 1 (raised) through 0 (edge on) to -1 (lowered)
function spreadWing(g, open, far) {
  g.save();
  g.translate(far ? 9 : 5, far ? -9 : -6);
  g.rotate(-0.15);
  g.scale(far ? 0.9 : 1, Math.abs(open) < 0.12 ? Math.sign(open || 1) * 0.12 : open);
  blob(g, far ? '#101014' : blackFill(g, 0, -25, 30), () => {
    g.moveTo(9, 0); g.bezierCurveTo(12, -18, 9, -38, 0, -50);
    for (const [x, y] of [[-6, -49], [-4, -44], [-11, -45], [-9, -40], [-16, -40], [-14, -35], [-21, -34]]) g.lineTo(x, y);
    g.bezierCurveTo(-20, -22, -16, -8, -13, 0);
  });
  blob(g, far ? '#9da1aa' : whiteFill(g, 3, -10, 14), () => {           // white shoulder
    g.moveTo(9, 0); g.bezierCurveTo(11, -9, 10, -17, 7, -22);
    g.quadraticCurveTo(-2, -20, -6, -12); g.quadraticCurveTo(-6, -4, -6, 0);
  });
  g.strokeStyle = 'rgba(80,90,115,0.5)'; g.lineWidth = 0.8;               // feather lines
  for (const [x, y] of [[-5, -46], [-12, -42], [-18, -37]]) { g.beginPath(); g.moveTo(-6, -22); g.lineTo(x, y); g.stroke(); }
  g.restore();
}

function foldedWing(g) {
  blob(g, blackFill(g, -8, -6, 26), () => {
    g.moveTo(14, -6); g.bezierCurveTo(6, -14, -14, -13, -24, -7);
    g.lineTo(-41, -1); g.quadraticCurveTo(-24, 6, -8, 6); g.quadraticCurveTo(8, 5, 14, -6);
  });
  blob(g, whiteFill(g, 2, -8, 12), () => {                                // white shoulder
    g.moveTo(13, -5); g.bezierCurveTo(8, -12, -4, -12, -10, -9);
    g.quadraticCurveTo(-8, -3, 0, -1); g.quadraticCurveTo(8, 0, 13, -5);
  });
  g.strokeStyle = 'rgba(90,100,125,0.55)'; g.lineWidth = 0.8;
  for (const [y0, y1] of [[-4, -1], [0, 1.5], [3, 3.5]]) { g.beginPath(); g.moveTo(-12, y0); g.lineTo(-38, y1); g.stroke(); }
}

function head(g, drunk, beak = 0) {
  blob(g, '#141418', () => g.ellipse(-7, 5, 11, 9, -0.5, 0, Math.PI * 2));          // neck
  blob(g, blackFill(g, 0, 0, 11), () => g.arc(0, 0, 11, 0, Math.PI * 2));
  blob(g, whiteFill(g, -9, 2, 9), () => {                                            // white nape
    g.moveTo(-5, -9.5); g.quadraticCurveTo(-13, -6, -13, 5); g.lineTo(-7, 9); g.quadraticCurveTo(-9, -1, -3, -8);
  });
  const bill = () => { g.moveTo(7, -4.6); g.quadraticCurveTo(17, -5.2, 26, 0.6); g.quadraticCurveTo(17, 3.3, 7, 4.6); };
  const bg = g.createLinearGradient(0, -5, 0, 5);
  bg.addColorStop(0, '#eef0f4'); bg.addColorStop(0.5, '#c9cdd6'); bg.addColorStop(1, '#9196a2');
  if (beak > 0.05) {                                                 // beak open: upper and lower halves hinge apart
    const half = (sign, ang) => {
      g.save(); g.translate(7, 0); g.rotate(ang); g.translate(-7, 0);
      const path = () => { g.moveTo(7, sign * 4.6); g.quadraticCurveTo(17, sign * (sign < 0 ? 5.2 : 3.3), 26, 0.6); g.lineTo(7, 0.4); };
      blob(g, bg, path);
      g.save(); g.beginPath(); path(); g.clip(); g.fillStyle = '#25262c'; g.fillRect(20, -8, 10, 16); g.restore();
      g.restore();
    };
    half(-1, -beak * 0.38); half(1, beak * 0.3);
  } else {
    blob(g, bg, bill);
    g.save(); g.beginPath(); bill(); g.clip(); g.fillStyle = '#25262c'; g.fillRect(20, -8, 10, 16); g.restore();   // dark tip
    g.beginPath(); g.moveTo(8, 0.8); g.quadraticCurveTo(16, 1.1, 24.5, 0.7);   // the line where the beak closes
    g.strokeStyle = '#555a66'; g.lineWidth = 0.6; g.stroke();
  }
  blob(g, '#a3301c', () => g.arc(3, -3, 2.4, 0, Math.PI * 2));                      // eye
  blob(g, '#130808', () => g.arc(3.3, -3, 1.2, 0, Math.PI * 2));
  blob(g, '#ffffff', () => g.arc(2.6, -3.8, 0.6, 0, Math.PI * 2));
  if (drunk) {                                                                        // bright red eye with a flare
    const pulse = 1 + 0.25 * Math.sin(time * 9);
    blob(g, '#ff2414', () => g.arc(3, -3, 2.6, 0, Math.PI * 2));
    blob(g, '#ffd0c0', () => g.arc(2.5, -3.6, 0.7, 0, Math.PI * 2));
    g.save(); g.globalCompositeOperation = 'lighter';
    const glow = g.createRadialGradient(3, -3, 0, 3, -3, 9 * pulse);
    glow.addColorStop(0, 'rgba(255,80,50,0.9)'); glow.addColorStop(1, 'rgba(255,30,10,0)');
    blob(g, glow, () => g.arc(3, -3, 9 * pulse, 0, Math.PI * 2));
    for (const [rx, ry] of [[15 * pulse, 0.7], [0.7, 10 * pulse]]) {
      const st = g.createRadialGradient(3, -3, 0, 3, -3, Math.max(rx, ry));
      st.addColorStop(0, 'rgba(255,200,180,0.9)'); st.addColorStop(1, 'rgba(255,60,30,0)');
      blob(g, st, () => g.ellipse(3, -3, rx, ry, 0.3, 0, Math.PI * 2));
    }
    g.restore();
  }
  g.beginPath(); g.arc(0, 0, 9.5, Math.PI * 1.05, Math.PI * 1.55);                  // sheen
  g.strokeStyle = 'rgba(130,150,200,0.35)'; g.lineWidth = 1.6; g.stroke();
}

// While swooping, his legs dangle back and down from his belly at about 15 degrees,
// fluttering a little in the wind. Drawn in the body frame, under the body.
function danglingLegs(g) {
  g.save();
  g.strokeStyle = '#3a3b40'; g.lineCap = g.lineJoin = 'round';
  [[-3, 0], [4, 1.9]].forEach(([hip, phase]) => {
    const a = Math.PI - Math.PI / 12 + Math.sin(time * 26 + phase) * 0.07;   // 15 degrees below straight back, fluttering
    const knee = [hip + Math.cos(a) * 14, 11 + Math.sin(a) * 14];
    const a2 = a + Math.sin(time * 31 + phase) * 0.12;
    const foot = [knee[0] + Math.cos(a2) * 13, knee[1] + Math.sin(a2) * 13];
    for (const [w, col] of [[4.2, '#202126'], [2.4, '#55575e']]) {       // dark leg with a lighter shine
      g.strokeStyle = col; g.lineWidth = w;
      g.beginPath(); g.moveTo(hip, 9); g.lineTo(...knee); g.lineTo(...foot); g.stroke();
    }
    g.strokeStyle = '#2a2b30'; g.lineWidth = 2; g.beginPath();             // toes, curled and flicking
    for (const t of [-0.6, 0, 0.6]) {
      const ta = a2 + t + Math.sin(time * 40 + phase + t) * 0.1;
      g.moveTo(...foot); g.lineTo(foot[0] + Math.cos(ta) * 6, foot[1] + Math.sin(ta) * 6);
    }
    g.stroke();
  });
  g.restore();
}

// Afterburner flames out of the tail while swooping; power 0 to 1
function afterburner(g, power) {
  if (power < 0.02) return;
  g.save();
  g.translate(-44, 1);
  g.globalCompositeOperation = 'lighter';
  const glow = g.createRadialGradient(0, 0, 0, 0, 0, 30 * power);
  glow.addColorStop(0, 'rgba(255,170,60,0.6)'); glow.addColorStop(1, 'rgba(255,110,30,0)');
  g.fillStyle = glow; g.beginPath(); g.arc(0, 0, 30 * power, 0, Math.PI * 2); g.fill();
  [[110, 13, 'rgba(255,60,20,0.6)'], [82, 9, 'rgba(255,140,30,0.85)'], [54, 6, 'rgba(255,220,120,0.95)'], [28, 3, 'rgba(255,255,240,1)']].forEach(([len, w, col], i) => {
    const flicker = 1 + 0.15 * Math.sin(time * 41 + i * 1.7) + 0.1 * Math.sin(time * 67 + i * 2.9);
    const L = len * power * flicker, hw = w * (0.7 + 0.3 * power);
    const gr = g.createLinearGradient(0, 0, -L, 0);
    gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,80,20,0)');
    g.beginPath(); g.moveTo(3, -hw); g.quadraticCurveTo(-L * 0.45, -hw * 1.15, -L, 0); g.quadraticCurveTo(-L * 0.45, hw * 1.15, 3, hw); g.closePath();
    g.fillStyle = gr; g.fill();
  });
  g.restore();
}

// pose: { pitch (radians, + is nose down), headPitch, wings: 'folded' | open amount, legs: walk phase or null,
//         burn: afterburner 0 to 1, dangle: legs trailing in a swoop, stretch: length factor in a stunt }
function drawMagpie(g, pose) {
  if (pose.legs !== null) {                                                // legs, in the upright frame
    const swing = Math.sin(pose.legs) * 5;
    g.strokeStyle = '#3a3b40'; g.lineCap = 'round';
    for (const [hip, foot, lift] of [[-3, -4 + swing, Math.max(0, Math.sin(pose.legs)) * 3], [5, 6 - swing, Math.max(0, -Math.sin(pose.legs)) * 3]]) {
      const fy = 30 - lift;
      g.lineWidth = 2.8; g.beginPath(); g.moveTo(hip, 10); g.lineTo(foot, fy); g.stroke();
      g.lineWidth = 1.6; g.beginPath();
      g.moveTo(foot, fy); g.lineTo(foot + 6, fy);
      g.moveTo(foot, fy); g.lineTo(foot + 4.5, fy - 1.2);
      g.moveTo(foot, fy); g.lineTo(foot - 3, fy); g.stroke();
    }
    blob(g, '#141418', () => g.ellipse(1, 12, 8, 6, 0, 0, Math.PI * 2));           // feathered thighs
  }
  g.save();
  g.rotate(pose.pitch);
  g.scale(pose.stretch || 1, 1);                                           // stretched along his body in a stunt, no taller
  afterburner(g, pose.burn || 0);
  g.scale(1, Math.cos(pose.roll || 0));
  const spread = pose.wings !== 'folded';
  if (pose.dangle) danglingLegs(g);
  if (spread) spreadWing(g, pose.wings, true);
  const tailW = spread ? 1.35 : 1;                                         // tail: white base, black tip
  const tail = () => { g.moveTo(-16, -4 * tailW); g.lineTo(-41, -3 * tailW); g.quadraticCurveTo(-47, 1, -41, 6 * tailW); g.lineTo(-16, 6); };
  blob(g, whiteFill(g, -26, 0, 16), tail);
  g.save(); g.beginPath(); tail(); g.clip(); g.fillStyle = '#121216'; g.fillRect(-50, -12, 14, 24); g.restore();
  blob(g, blackFill(g, 0, 0, 24), () => g.ellipse(0, 0, 24, 15, 0, 0, Math.PI * 2));   // body
  blob(g, whiteFill(g, -15, 7, 8), () => g.ellipse(-15, 7, 8, 4.5, 0.2, 0, Math.PI * 2));  // under the tail
  blob(g, whiteFill(g, 6, -12, 14), () => {                                // white back of the neck
    g.moveTo(22, -12); g.quadraticCurveTo(10, -17, -6, -14); g.quadraticCurveTo(-12, -11, -8, -7);
    g.quadraticCurveTo(6, -9, 18, -3);
  });
  if (spread) spreadWing(g, pose.wings, false); else foldedWing(g);
  g.save(); g.translate(24, -9); g.rotate(pose.headPitch); head(g, pose.drunk, pose.beak || 0);
  if (pose.snag) { g.save(); g.translate(22, 2); g.rotate(0.35); drawSnag(g); g.restore(); }   // the snag in his beak
  g.restore();
  g.restore();
}
