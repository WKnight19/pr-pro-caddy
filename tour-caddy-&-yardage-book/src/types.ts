/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ClubType = 'driver' | 'wood' | 'hybrid' | 'iron' | 'wedge' | 'putter';

export interface Club {
  id: string;
  name: string;
  type: ClubType;
  loft: number;
  lieAngle?: number;
  standardLength: string;
  material: string;
  moi?: string;
  defaultCarry: number; // in yards under neutral conditions
  defaultSpin: number;  // in rpm
  defaultApex: number;  // in feet
  rolloutRatio: number; // percentage of carry distance that the ball rolls out
}

export interface Environment {
  temperature: number; // in Fahrenheit
  humidity: number;    // in percentage
  windSpeed: number;   // in mph
  windDirection: number; // in degrees (0 = Headwind, 90 = Crosswind Right-to-Left, 180 = Tailwind, 270 = Crosswind Left-to-Right)
  elevation: number;   // in feet
  groundFirmness: 'soft' | 'normal' | 'firm';
  greenSpeed: number;  // Stimpmeter speed (e.g., 10)
  caddyBias?: number;  // Option to adjust full shot recommendation bias (yards)
}

export interface ShortGameMatrixItem {
  clubId: string;
  swingLength: 'Foot' | 'Knee' | 'Hips' | 'Torso' | 'Shoulder' | 'Full';
  carry: number; // in yards
  roll: number;  // in yards
}

export interface Lie {
  type: 'tee' | 'fairway' | 'first_cut' | 'rough' | 'sand' | 'buried';
  slopeUpDown: number; // in degrees (positive = uphill, negative = downhill)
  slopeLeftRight: number; // in degrees (positive = ball above feet [draw], negative = ball below feet [fade])
}

export interface Target {
  distance: number; // in yards
  elevationChange: number; // in feet (positive = uphill, negative = downhill)
  canopyHeight: number; // in feet (999 = unlimited)
  greenSpeed: number; // Stimpmeter
  roomToWorkWith: 'short_sided' | 'normal' | 'plenty';
}

export interface Hazard {
  type: 'water' | 'sand' | 'ob' | 'trees' | 'none';
  location: 'front' | 'back' | 'left' | 'right' | 'none';
  size: 'small' | 'medium' | 'large';
  distance: number; // yards to hazard
  offset: number; // yards from target/aim line
}

export interface PutInputs {
  paces: number; // 1 pace ≈ 3 feet
  breakHalfway: number; // percent slope
  breakTwoThirds: number; // percent slope
  breakDirection: 'left-to-right' | 'right-to-left' | 'straight';
  slopeUpDown: 'uphill' | 'downhill' | 'flat';
  slopePercent: number; // percent grade
  grainDirection: 'into_you' | 'away_from_you' | 'cross_left' | 'cross_right' | 'neutral';
  greenSpeed: number; // stimp
  wetGreens: boolean;
}

export interface ShotInputs {
  mode: 'full' | 'short' | 'putting';
  targetDistance: number;
  targetElevation: number; // feet
  canopyHeight: number; // feet
  environment: Environment;
  lie: Lie;
  hazard: Hazard;
  roomToWorkWith: 'short_sided' | 'normal' | 'plenty';
}

export interface CaddyRecommendation {
  playsLikeDistance: number;
  recommendedClub: Club;
  swingType: string; // "Full Swing", "Choke Down 1-inch", "3/4 Swing", or 5+1x6 system swing
  aimOffset: number; // in yards, negative = left, positive = right
  aimExplanation: string;
  canopyWarning: boolean;
  canopyExplanation?: string;
  riskAssessment: string[];
  mentalTip: string;
  carryDistance: number;
  rollDistance: number;
  expectedApex: number;
  expectedSpin: number;
}
