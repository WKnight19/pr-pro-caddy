/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Club, ShortGameMatrixItem } from '../types';

export const CLUBS_DATA: Club[] = [
  {
    id: 'dr',
    name: 'Callaway Edge Driver 10.5°',
    type: 'driver',
    loft: 10.5,
    lieAngle: 58.0,
    standardLength: '45.25"',
    material: 'Titanium Crown, Graphite Shaft (Stiff)',
    moi: 'Very High (Max Forgiveness)',
    defaultCarry: 245,
    defaultSpin: 2450,
    defaultApex: 95,
    rolloutRatio: 0.12
  },
  {
    id: '3w',
    name: 'Callaway Edge 3-Wood 15°',
    type: 'wood',
    loft: 15.0,
    lieAngle: 58.5,
    standardLength: '43.0"',
    material: 'Stainless Steel, Graphite Shaft (Stiff)',
    moi: 'High Draw Bias',
    defaultCarry: 225,
    defaultSpin: 3200,
    defaultApex: 85,
    rolloutRatio: 0.08
  },
  {
    id: '5h',
    name: 'Callaway Edge 5-Hybrid 25°',
    type: 'hybrid',
    loft: 25.0,
    lieAngle: 60.5,
    standardLength: '39.5"',
    material: 'Stainless Steel, Graphite Shaft (Stiff)',
    moi: 'High MOI Utility',
    defaultCarry: 205,
    defaultSpin: 4100,
    defaultApex: 75,
    rolloutRatio: 0.05
  },
  {
    id: '6i',
    name: 'Callaway Edge 6-Iron',
    type: 'iron',
    loft: 27.0,
    lieAngle: 62.0,
    standardLength: '37.63"',
    material: 'Stainless Steel Cavity Back, Steel Shaft (Stiff)',
    moi: 'Moderate Game Improvement',
    defaultCarry: 180,
    defaultSpin: 4500,
    defaultApex: 68,
    rolloutRatio: 0.04
  },
  {
    id: '7i',
    name: 'Callaway Edge 7-Iron',
    type: 'iron',
    loft: 30.0,
    lieAngle: 62.5,
    standardLength: '37.0"',
    material: 'Stainless Steel Cavity Back, Steel Shaft (Stiff)',
    moi: 'Moderate Game Improvement',
    defaultCarry: 170, // User's custom trackman average
    defaultSpin: 4400, // 4200-4600 range
    defaultApex: 65,   // 62-67 ft range
    rolloutRatio: 0.03
  },
  {
    id: '8i',
    name: 'Callaway Edge 8-Iron',
    type: 'iron',
    loft: 34.5,
    lieAngle: 63.0,
    standardLength: '36.5"',
    material: 'Stainless Steel Cavity Back, Steel Shaft (Stiff)',
    moi: 'Moderate Game Improvement',
    defaultCarry: 157,
    defaultSpin: 5300,
    defaultApex: 60,
    rolloutRatio: 0.025
  },
  {
    id: '9i',
    name: 'Callaway Edge 9-Iron',
    type: 'iron',
    loft: 39.0,
    lieAngle: 63.5,
    standardLength: '36.0"',
    material: 'Stainless Steel Cavity Back, Steel Shaft (Stiff)',
    moi: 'High Forgiveness Cavity',
    defaultCarry: 145,
    defaultSpin: 6200,
    defaultApex: 58,
    rolloutRatio: 0.02
  },
  {
    id: 'pw',
    name: 'Callaway Edge PW',
    type: 'wedge',
    loft: 44.0,
    lieAngle: 64.0,
    standardLength: '35.5"',
    material: 'Stainless Steel Cavity Back, Steel Shaft (Stiff)',
    moi: 'High Forgiveness Wedge',
    defaultCarry: 130, // User carries 135-145
    defaultSpin: 7200,
    defaultApex: 55,
    rolloutRatio: 0.015
  },
  {
    id: 'gw',
    name: 'Cleveland CBX4 Gap Wedge 50°',
    type: 'wedge',
    loft: 50.0,
    lieAngle: 64.0,
    standardLength: '35.5"',
    material: 'Rotex Face, ZipCore Insert, Steel Shaft (Stiff)',
    moi: 'V-Sole Wedge Forgiveness',
    defaultCarry: 115,
    defaultSpin: 8100,
    defaultApex: 53,
    rolloutRatio: 0.012
  },
  {
    id: 'sw',
    name: 'Callaway Edge SW',
    type: 'wedge',
    loft: 54.0,
    lieAngle: 64.0,
    standardLength: '35.25"',
    material: 'Stainless Steel Cavity Back, Steel Shaft (Stiff)',
    moi: 'Wide Sole Sand Wedge',
    defaultCarry: 100,
    defaultSpin: 8500,
    defaultApex: 50,
    rolloutRatio: 0.01
  },
  {
    id: 'lw',
    name: 'Cleveland CBZ Full Face 2 60°',
    type: 'wedge',
    loft: 60.0,
    lieAngle: 64.0,
    standardLength: '35.0"',
    material: 'HydraZip, Full Face Grooves, Steel Shaft (Stiff)',
    moi: 'C-Grind High Toe',
    defaultCarry: 80,
    defaultSpin: 9500,
    defaultApex: 45,
    rolloutRatio: 0.008
  },
  {
    id: 'pt',
    name: 'Odyssey White Hot OG Double Wide',
    type: 'putter',
    loft: 3.0,
    lieAngle: 70.0,
    standardLength: '34.0"',
    material: 'Steel Body, White Hot Insert',
    moi: 'Double Wide Blade (Moderate Toe Flow)',
    defaultCarry: 0,
    defaultSpin: 0,
    defaultApex: 0,
    rolloutRatio: 0
  }
];

// Short Game 5+1x6 Matrix: 5 Clubs (9i, PW, 50, SW, 60) x 6 swing lengths
export const SHORT_GAME_MATRIX: ShortGameMatrixItem[] = [
  // 60° Lob Wedge (Cleveland CBZ Full Face 2) - Loft: 60°, High Loft, Fast Stopping
  { clubId: 'lw', swingLength: 'Foot', carry: 2, roll: 1 },
  { clubId: 'lw', swingLength: 'Knee', carry: 5, roll: 2.5 },
  { clubId: 'lw', swingLength: 'Hips', carry: 12, roll: 6 },
  { clubId: 'lw', swingLength: 'Torso', carry: 25, roll: 12 },
  { clubId: 'lw', swingLength: 'Shoulder', carry: 45, roll: 18 },
  { clubId: 'lw', swingLength: 'Full', carry: 85, roll: 1 },

  // 54° Sand Wedge (Callaway Edge SW) - Loft: 54°, Moderate Loft, Sand/General Pitching
  { clubId: 'sw', swingLength: 'Foot', carry: 3, roll: 3 },
  { clubId: 'sw', swingLength: 'Knee', carry: 7, roll: 7 },
  { clubId: 'sw', swingLength: 'Hips', carry: 16, roll: 16 },
  { clubId: 'sw', swingLength: 'Torso', carry: 32, roll: 25 },
  { clubId: 'sw', swingLength: 'Shoulder', carry: 55, roll: 35 },
  { clubId: 'sw', swingLength: 'Full', carry: 105, roll: 10 },

  // 50° Gap Wedge (Cleveland CBX4) - Loft: 50°, Mid-Wedge, Controlled Runner
  { clubId: 'gw', swingLength: 'Foot', carry: 4, roll: 6 },
  { clubId: 'gw', swingLength: 'Knee', carry: 10, roll: 15 },
  { clubId: 'gw', swingLength: 'Hips', carry: 20, roll: 30 },
  { clubId: 'gw', swingLength: 'Torso', carry: 40, roll: 48 },
  { clubId: 'gw', swingLength: 'Shoulder', carry: 65, roll: 65 },
  { clubId: 'gw', swingLength: 'Full', carry: 122, roll: 15 },

  // Pitching Wedge (Callaway Edge PW) - Loft: 44°, Low Wedge, Run and Bump
  { clubId: 'pw', swingLength: 'Foot', carry: 5, roll: 10 },
  { clubId: 'pw', swingLength: 'Knee', carry: 12, roll: 24 },
  { clubId: 'pw', swingLength: 'Hips', carry: 25, roll: 45 },
  { clubId: 'pw', swingLength: 'Torso', carry: 48, roll: 72 },
  { clubId: 'pw', swingLength: 'Shoulder', carry: 75, roll: 90 },
  { clubId: 'pw', swingLength: 'Full', carry: 140, roll: 20 },

  // 9-Iron (Callaway Edge 9i) - Loft: 39°, High Rollout Chipping
  { clubId: '9i', swingLength: 'Foot', carry: 6, roll: 18 },
  { clubId: '9i', swingLength: 'Knee', carry: 15, roll: 45 },
  { clubId: '9i', swingLength: 'Hips', carry: 30, roll: 80 },
  { clubId: '9i', swingLength: 'Torso', carry: 55, roll: 110 },
  { clubId: '9i', swingLength: 'Shoulder', carry: 85, roll: 130 },
  { clubId: '9i', swingLength: 'Full', carry: 150, roll: 25 }
];

export const MENTAL_TIPS = [
  "One shot at a time. The past hole is history, the next shot is all that matters.",
  "Pick a very small target on the horizon (a single leaf or branch) and lock into it.",
  "Commit fully to the shot. Indecision is the father of double bogeys.",
  "Smooth tempo beats hard swings. Let the loft of the club do the work.",
  "Breathe. Slow down your heart rate by exhaling fully before you grip the club.",
  "A good miss is better than a perfect shot in the wrong spot. Play to the fat of the green.",
  "Golf is a game of recovery. Focus on the next opportunity, not the past error.",
  "Keep your chest moving through impact. Trust your pivot.",
  "Under pressure, choke down half an inch and maintain your tempo.",
  "Putting is about pace and picture. See the line, feel the speed.",
  "Soft hands on the short game. Let the bounce slide under the ball.",
  "Trust your yardage book. The caddy has done the math, now just swing.",
  "If you find yourself in trouble, take your medicine. Put it back in play.",
  "Greenside sand is about splashing the sand, not hitting the golf ball.",
  "On downhill lies, match your shoulders to the slope and swing down the hill."
];
