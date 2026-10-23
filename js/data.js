'use strict';
// ---------------------------------------------------------------------------
// The numbers the game is built on: the world's size and layers, the magpie's flight, and the tables
// of colours, letters and little pictures the scenery and the cast are drawn from
// ---------------------------------------------------------------------------

// World
const H = 180;                    // internal height in pixels; width follows the window
const SCREEN = 320;
const LEVEL_W = SCREEN * 6;       // the level is 6 screens wide and loops round
const GRASS_TOP = 152;            // top of the lawn
const SUBURB_BASE = 154;          // houses stand here (a little hidden by the lawn)
const LAND_Y = 160;               // the magpie's feet rest here
const TOP_Y = 12;                 // highest the magpie can fly
const BIRD_SCALE = 0.3;           // internal pixels per magpie unit (about 100 units from tail to bill)
const FEET = 30 * BIRD_SCALE;     // body centre to feet

// Parallax: how far each layer moves per pixel the camera moves.
// Each layer repeats every LEVEL_W * factor pixels, so the whole scene loops with the level.
// The clouds are pinned to the sky and don't scroll.
const PARALLAX = { clouds: 0.2, hills: 0.35, suburb: 0.5, ground: 1 };
// Rows of houses behind the front street, nearest first: each smaller, higher up, hazier and
// slower, so the suburb tiers off into the distance. The hills sit up behind the last row.
const BACK_STREETS = [
  { f: 0.45, base: 143, scale: 0.78, haze: 0.18, seed: 11 },
  { f: 0.4, base: 134, scale: 0.6, haze: 0.32, seed: 12 },
  { f: 0.375, base: 126, scale: 0.45, haze: 0.46, seed: 13 }
];
const HILLS_LIFT = 18;
const HARBOUR = [90, 300];        // where the harbour, the bridge and the Opera House are on the hills layer
const SUN_SIZE = 48;               // the sun's height in pixels (25% bigger than the 38 it was)
const SUN_LOOPS = 3;              // fly the level this many times to push the sun off one side and back on the other

// Magpie flight
const GRAVITY = 70, FLAP = 230, DIVE = 230, ACCEL_X = 230;
const MAX_FALL = 45, MAX_DIVE = 170, MAX_CLIMB = 95, MAX_X = 115, MAX_X_DIVE = 150, WALK = 56;
const TURN_TIME = 1;              // seconds to go from flying one way to full speed the other

// Ordered dithering: a 4x4 pattern of thresholds (see dither in helpers.js)
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

// 3x5 pixel font: each glyph is 5 rows of 3 bits (4 = left, 2 = middle, 1 = right)
const FONT = {
  A: '25755', B: '65656', C: '34443', D: '65556', E: '74647', F: '74644', G: '34553', H: '55755',
  I: '72227', J: '11152', K: '55655', L: '44447', M: '57755', N: '65555', O: '25552', P: '65644',
  Q: '25563', R: '65655', S: '34216', T: '72222', U: '55557', V: '55552', W: '55775', X: '55255',
  Y: '55222', Z: '71247', 0: '75557', 1: '26227', 2: '61247', 3: '61216', 4: '55711', 5: '74616',
  6: '34757', 7: '71222', 8: '75757', 9: '75716', ' ': '00000', '-': '00700', '+': '02720', '.': '00002',
  '!': '22202', ':': '02020', '/': '11244',
  '#': '57575', '$': '36236', '?': '61202', '@': '75747', '%': '51245', '&': '25253', '*': '52725'   // for cartoon swearing
};

// The sky: five flat strips of blue, all the same height, from the top down to SKY_BOTTOM (about where
// the hills and the harbour start; the last strip carries on below), like Harrier Carrier's, with sharp joins
const SKY = ['#1c78d8', '#2a8ae0', '#3c9ce6', '#5cb0eb', '#86c6f0'];
const SKY_BOTTOM = 120;

// Clouds: the shades of a cloud, lit side to shadow (from the reference picture in prompt-art/)
const CLOUD_TONES = ['#fafcff', '#e2ebfa', '#c8e2f9', '#a8d6f8', '#84d0f6', '#6cb6e8'];

// Hills: greens, lit to shadow, and the haze that greys them out with distance
const HILL_GREENS = ['#7cc457', '#5aa846', '#43913d', '#317a36', '#24652f'];
const HILL_HAZE = '#a9bccb', FAR = 0.5;   // the green hills are low and greyed out, so they read as far away

// The suburb: leaves, bushes, bricks (colour, darker, mortar) and roofs
const GUM_LEAF = ['#93a95c', '#6c8a42', '#4e6a33'];
const JACARANDA = ['#b4d878', '#92c05a', '#70a244'];   // light green (they were purple)
const LEAFY = ['#7caa4c', '#5a8a38', '#3f6a2c'];
const BUSH = ['#6f9a45', '#4f7b35', '#3a5e29'];
const BRICKS = [
  ['#a8492f', '#943f28', '#c9a48a'],   // red
  ['#d8c39a', '#c6ae86', '#ece2cc'],   // cream
  ['#8c5636', '#784a2e', '#b99a7c'],   // 70s liver brick
  ['#cfa268', '#bb8f57', '#e6cfa8']    // blonde
];
const ROOFS = [
  { steel: false, c1: '#b4532f', c2: '#963f20', c3: '#c96a42', cap: '#7f3519', fascia: '#ece6d6' },  // terracotta tiles
  { steel: false, c1: '#7d7064', c2: '#685d53', c3: '#8e8276', cap: '#544b43', fascia: '#e2dccd' },  // concrete tiles
  { steel: true, c1: '#5d6263', c2: '#4b4f50', cap: '#3f4243', fascia: '#5d6263' },                  // Colorbond grey
  { steel: true, c1: '#e6dbb8', c2: '#d1c49e', cap: '#bfb18b', fascia: '#e6dbb8' },                  // Colorbond cream
  { steel: true, c1: '#7b302b', c2: '#682823', cap: '#561f1b', fascia: '#efe9dc' }                   // Colorbond red
];

// The BOTTLE-O in Dan Murphy's colours, and the heights of its shelves
const DM_GREEN = '#1f5b2c', DM_DARK = '#164622', DM_LINE = '#2a6d38', LIME = '#d4e62a';
const SHELVES = [131, 139, 147, 155], FRIDGE_SHELVES = [136, 145, 154];

// Pixel sprites for what falls out (and, at half size, the stock on the shelves):
// a Foster's can and a Johnnie Walker bottle
const LOOT_ART = {
  can: { rows: ['ssss', 'BBBB', 'BWRB', 'BRWB', 'BYYB', 'BBBB', 'ssss'], pal: { s: '#c9ccd0', B: '#1e56b5', W: '#f4f4f4', R: '#d22b2b', Y: '#e8c13a' } },
  bottle: { rows: ['.yy.', '.aa.', '.aa.', 'aaaa', 'aaaa', 'kkkk', 'kyyk', 'kkkk', 'aaaa', 'aaaa', 'AAAA'], pal: { y: '#e0b03a', a: '#b5651d', k: '#141414', A: '#7a4010' } },
  barrel: { rows: ['.kkkkkkk.', 'kwwWwwWwk', 'kWwwWwwWk', 'HHHHHHHHH', 'kwWwwwWwk', 'kWwwBwwWk', 'kwWwwwWwk', 'HHHHHHHHH', 'kWwwWwwWk', 'kwwWwwWwk', '.kkkkkkk.'],
    pal: { k: '#5a3416', w: '#a8662c', W: '#c8843f', H: '#5b5e64', B: '#2a1608' } }   // a wooden beer barrel with iron hoops and a bung
};

// The Hills Hoist: its lines (how far out along the arms) and the washing pegged on them
const HOIST_LINES = [0.45, 0.75, 1];
const CLOTH_SIZE = { shirt: [5, 5], sock: [2, 4], sheet: [7, 9], towel: [4, 7] };
const WASHING = [                                                    // [side 0-3, line, along 0-1, kind, colour]
  [0, 2, 0.3, 'shirt', '#d64534'], [0, 1, 0.7, 'sock', '#f2efe6'], [1, 2, 0.5, 'sheet', '#f4f1e8'],
  [1, 0, 0.4, 'towel', '#3f6fc4'], [2, 2, 0.6, 'towel', '#f1c640'], [2, 1, 0.25, 'shirt', '#5aa846'],
  [3, 2, 0.45, 'sheet', '#e8a6c0'], [3, 1, 0.8, 'sock', '#222']
].map(([side, li, along, kind, col]) => ({ side, li, along, kind, col }));

// The Sydney ferry, as pixels: each letter a colour, dots see-through
const FERRY_ROWS = [
  '.GGG..........GGG.',
  '.CWC....Y.....CWC.',
  '..GGGGGGGGGGGGGG..',
  '..CWCWCWCWCWCWCC..',
  'CCCCCCCCCCCCCCCCCC',
  'GGGGGGGGGGGGGGGGGG',
  '.GGGGGGGGGGGGGGGG.',
  '..DDDDDDDDDDDDDD..'
];
const FERRY_COLOURS = { G: '#1f6b3a', C: '#efe6c8', W: '#3a4a5a', Y: '#f2c230', D: '#164d2a' };

// Objectives: everything there is to do, each named by the pop-art caption it shows when you do it
const OBJECTIVES = [
  ['SWOOP-AND-POOP!', 'Swoop-poop on someone'],
  ['SWOOP-AND-LOOP!', 'Loop-the-loop in a swoop'],
  ['LOOP-POOP-SWOOP!', 'Loop, then swoop-poop someone'],
  ['BARREL SWOOP!', 'Barrel roll in a swoop'],
  ['GROG RUN!', 'Fly through the BOTTLE-O'],
  ['BEER-BARREL!', 'Barrel roll in the BOTTLE-O'],
  ['RBT TIME!', 'Land on the postie drunk'],
  ['WHIPPER-SNIPPER!', 'Swoop past the Hills Hoist'],
  ['SPIN-CYCLE!', 'Ride on top of the Hills Hoist'],
  ['DOWN UNDER!', 'Hang under the Hills Hoist'],
  ['SNAG-A-SNAG!', 'Catch a flipped snag'],
  ['BREKKIE!', 'Feed a snag to the chicks'],
  ['BARBIE-POO!', 'Poop on the barbie'],
  ['COOKED, MATE!', 'Get flung off the hot barbie'],
  ['SNAG-ROCKET!', 'Swoop tumbling off the barbie'],
  ['ROO THE DAY!', 'Knock the kangaroo over'],
  ['ROO-DIMENTARY!', 'Ride the kangaroo'],
  ['KOOKA-BOOM-A!', 'Knock the kookaburra off'],
  ['CYCLO-PATH!', 'Poop on the cyclist'],
  ['STREWTH!', 'Swoop the cyclist'],
  ['SPECIAL DELIVERY!', 'Poop on the postie'],
  ['POSTIE-PILLION!', "Ride on the postie's bike"],
  ['BLUDGER!', 'Ride the harbour ferry'],
  ['FIN-ISHED!', 'Swoop the shark fin'],
  ['FLOCK YEAH!', 'Fly 5 s in the cockatoo flock'],
  ['ROUND THE TWIST!', 'Poop on the possum'],
  ['COAT-HANGER!', 'Poop on the bridge climbers'],
  ['YEAH, NAH!', 'Get caught by the drop bear'],
  ['SOLAR-NOVA!', 'Loop-the-loop round the sun']
];
const END_TEXT = 'TOO EASY, MATE!';   // shown when they're all done
