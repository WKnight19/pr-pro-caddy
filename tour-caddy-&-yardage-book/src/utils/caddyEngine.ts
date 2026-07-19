/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShotInputs, CaddyRecommendation, Club, PutInputs, ShortGameMatrixItem } from '../types';
import { CLUBS_DATA, SHORT_GAME_MATRIX, MENTAL_TIPS } from '../data/clubs';

// Helper to convert degrees to radians
const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * Calculates the recommended shot details for Tee and Approach shots
 */
export function calculateFullShot(inputs: ShotInputs, customClubs: Club[] = CLUBS_DATA): CaddyRecommendation {
  const { targetDistance, targetElevation, canopyHeight, environment, lie, hazard, roomToWorkWith } = inputs;
  const clubs = customClubs.filter(c => c.type !== 'putter');

  // 1. Calculate Environmental Factors
  // Temperature effect: 70°F is base. ±0.15% carry per °F deviation.
  const tempFactor = 1 + (environment.temperature - 70) * 0.0015;

  // Altitude (Elevation) effect: 1% more carry per 1000 feet
  const altitudeFactor = 1 + (environment.elevation / 1000) * 0.01;

  // Humidity effect: 50% is base. ±0.02% carry per 1% humidity deviation.
  const humidityFactor = 1 + (environment.humidity - 50) * 0.0002;

  const envMultiplier = tempFactor * altitudeFactor * humidityFactor;

  // 2. Wind Adjustments
  // windDirection: 0 = Headwind, 180 = Tailwind, 90 = Right-to-Left, 270 = Left-to-Right
  // Calculate relative angle to shot line
  const windAngleRad = toRad(environment.windDirection);
  const headwindMph = environment.windSpeed * Math.cos(windAngleRad);
  const crosswindMph = environment.windSpeed * Math.sin(windAngleRad);

  // 3. Lie Adjustments
  // Terrain carry multipliers
  let terrainCarryMult = 1.0;
  let terrainSpinMult = 1.0;
  let terrainRollMult = 1.0;

  switch (lie.type) {
    case 'first_cut':
      terrainCarryMult = 0.98;
      terrainSpinMult = 0.85; // flier risk, rolls out slightly more
      terrainRollMult = 1.15;
      break;
    case 'rough':
      terrainCarryMult = 0.86; // 14% loss
      terrainSpinMult = 0.60; // much less spin
      terrainRollMult = 1.40; // rolls out significantly
      break;
    case 'sand':
      terrainCarryMult = 0.80; // 20% loss
      terrainSpinMult = 0.70;
      terrainRollMult = 1.10;
      break;
    case 'buried':
      terrainCarryMult = 0.72; // 28% loss
      terrainSpinMult = 0.40;
      terrainRollMult = 1.50;
      break;
    case 'tee':
    case 'fairway':
    default:
      terrainCarryMult = 1.0;
      terrainSpinMult = 1.0;
      terrainRollMult = 1.0;
      break;
  }

  // Lie Slope adjustments
  // Uphill lie adds loft, increases height, reduces carry by ~1.2% per degree
  // Downhill lie reduces loft, decreases height, reduces carry by ~0.8% per degree but increases rollout
  const slopeUpDownRad = toRad(lie.slopeUpDown);
  let slopeCarryMult = 1.0;
  let slopeRollMult = 1.0;

  if (lie.slopeUpDown > 0) {
    slopeCarryMult = 1 - (lie.slopeUpDown * 0.012);
    slopeRollMult = 1 - (lie.slopeUpDown * 0.02);
  } else if (lie.slopeUpDown < 0) {
    slopeCarryMult = 1 - (Math.abs(lie.slopeUpDown) * 0.008);
    slopeRollMult = 1 + (Math.abs(lie.slopeUpDown) * 0.04);
  }

  // Ground firmness roll multipliers
  let firmnessRollMult = 1.0;
  if (environment.groundFirmness === 'soft') firmnessRollMult = 0.4;
  if (environment.groundFirmness === 'firm') firmnessRollMult = 1.6;

  // 4. Evaluate Each Club Option
  interface FullShotOption {
    club: Club;
    adjustedCarry: number;
    adjustedRoll: number;
    totalDistance: number;
    adjustedApex: number;
    adjustedSpin: number;
    totalDeflection: number;
    isPunch: boolean;
  }

  const options: FullShotOption[] = [];

  clubs.forEach(club => {
    // A. Standard Option
    let adjustedCarry = club.defaultCarry * envMultiplier * terrainCarryMult * slopeCarryMult;

    // Apply specific wind factor per club type (wedges balloon, driver penetrates)
    let windFactor = 1.1; // irons
    if (club.type === 'driver') windFactor = 0.95;
    if (club.type === 'wood') windFactor = 1.0;
    if (club.type === 'hybrid') windFactor = 1.05;
    if (club.type === 'wedge') windFactor = 1.25;

    // Wind effects on carry (headwind hurts, tailwind helps slightly less)
    if (headwindMph > 0) {
      adjustedCarry -= headwindMph * windFactor * (adjustedCarry / 150);
    } else {
      adjustedCarry += Math.abs(headwindMph) * 0.6 * windFactor * (adjustedCarry / 150);
    }

    // Apex height adjusted by slope and launch profile
    let adjustedApex = club.defaultApex;
    if (lie.slopeUpDown > 0) {
      adjustedApex += lie.slopeUpDown * 1.5; // fly higher on uphill lie
    } else {
      adjustedApex -= Math.abs(lie.slopeUpDown) * 1.0; // fly lower on downhill lie
    }

    // Spin rate adjusted by lie (rough reduces spin)
    const adjustedSpin = club.defaultSpin * terrainSpinMult;

    // Rollout calculation
    // Base rollout is rolloutRatio * carry. Adjusted by terrain rollout, slope rollout, and firmness.
    let baseRoll = club.defaultCarry * club.rolloutRatio;
    let adjustedRoll = baseRoll * terrainRollMult * slopeRollMult * firmnessRollMult;

    // Wedges on soft green stop instantly
    if (club.type === 'wedge' && environment.groundFirmness === 'soft') {
      adjustedRoll = Math.max(0.5, adjustedRoll * 0.2);
    }

    // Sideways deflection (drift) due to crosswind and lie slope (ball above/below feet)
    // Crosswind drift: ~1.1 yard per mph of crosswind per 150 yards. (negative = drift left, positive = drift right)
    // Note: right-to-left crosswind (crosswindMph > 0) drifts the ball left (negative deflection)
    const windDrift = -crosswindMph * 1.1 * (adjustedCarry / 150);

    // Ball above feet (slopeLeftRight > 0) draws left (negative deflection)
    // Ball below feet (slopeLeftRight < 0) fades right (positive deflection)
    // Dynamic slope deflection: 0.6 yard per degree of slope per 100 yards of distance
    const slopeDrift = -lie.slopeLeftRight * 0.6 * (adjustedCarry / 100);

    const totalDeflection = windDrift + slopeDrift; // negative = drifting left, positive = drifting right

    // Target Elevation Effect on flight truncation:
    // Every +3 feet of target elevation reduces carry by 1 yard (it hits the hill early).
    // Every -3 feet of target elevation increases carry by 1 yard (it falls further down).
    const elevationCarryAdj = -targetElevation / 3;
    const finalCarry = Math.max(10, adjustedCarry + elevationCarryAdj);

    // Rollout is also affected by target elevation:
    let elevationRollMult = 1.0;
    if (targetElevation > 0) {
      elevationRollMult = Math.max(0.65, 1 - (targetElevation * 0.006));
    } else if (targetElevation < 0) {
      elevationRollMult = Math.min(1.5, 1 + (Math.abs(targetElevation) * 0.008));
    }
    const finalRoll = adjustedRoll * elevationRollMult;
    const finalTotalDistance = finalCarry + finalRoll;

    options.push({
      club,
      adjustedCarry: finalCarry,
      adjustedRoll: finalRoll,
      totalDistance: finalTotalDistance,
      adjustedApex,
      adjustedSpin,
      totalDeflection,
      isPunch: false
    });

    // B. Low Punch Shot Option (Added when tree canopy height is low and restricted)
    if (canopyHeight < 90 && club.type !== 'driver' && club.type !== 'wedge') {
      const punchCarryMult = 0.65;
      const punchRollMult = 2.2;
      const punchApexMult = 0.30; // low boring trajectory

      let pCarry = club.defaultCarry * punchCarryMult * envMultiplier * terrainCarryMult * slopeCarryMult;
      
      // Punch shots cut through wind much better
      if (headwindMph > 0) {
        pCarry -= headwindMph * windFactor * 0.6 * (pCarry / 150);
      } else {
        pCarry += Math.abs(headwindMph) * 0.4 * windFactor * (pCarry / 150);
      }

      const pCarryFinal = Math.max(10, pCarry + (elevationCarryAdj * 0.5));
      const pRoll = (club.defaultCarry * club.rolloutRatio) * punchRollMult * terrainRollMult * slopeRollMult * firmnessRollMult * elevationRollMult;
      const pApex = club.defaultApex * punchApexMult;
      const pSpin = club.defaultSpin * 0.5;

      const pWindDrift = -crosswindMph * 0.4 * (pCarryFinal / 150); // wind has 60% less effect
      const pSlopeDrift = -lie.slopeLeftRight * 0.6 * (pCarryFinal / 100);
      const pDeflection = pWindDrift + pSlopeDrift;

      options.push({
        club,
        adjustedCarry: pCarryFinal,
        adjustedRoll: pRoll,
        totalDistance: pCarryFinal + pRoll,
        adjustedApex: pApex,
        adjustedSpin: pSpin,
        totalDeflection: pDeflection,
        isPunch: true
      });
    }
  });

  // Plays Like Distance calculation:
  // Plays Like = Actual distance + target elevation adjustments + wind adjustments + env adjustments
  // Let's back-calculate playsLike based on a target-specific reference carry distance (capped 50-250)
  const refCarry = Math.max(50, Math.min(250, targetDistance));
  const elevationAdj = targetElevation / 3; // +1 yd per 3ft uphill
  let windAdj = 0;
  let refWindFactor = 1.1;
  if (headwindMph > 0) {
    windAdj = headwindMph * refWindFactor * (refCarry / 150);
  } else {
    windAdj = headwindMph * 0.6 * refWindFactor * (refCarry / 150);
  }

  // Environment plays-like adjustment
  const envAdj = refCarry * (1 - envMultiplier);
  const playsLikeDistance = Math.max(10, Math.round(targetDistance + elevationAdj + windAdj + envAdj));

  // 5. Select Best Club Option
  let validOptions = options;
  let canopyWarning = false;
  let canopyExplanation = '';

  if (canopyHeight < 90) {
    // If club apex exceeds canopy height, we might hit the branches!
    // Flag any club whose apex is > canopyHeight - 5 feet
    validOptions = options.filter(opt => opt.adjustedApex < canopyHeight - 5);
    if (validOptions.length < options.length) {
      canopyWarning = true;
      canopyExplanation = `Canopy hazard at ${canopyHeight}ft detected. Recommending a low punch shot or a lower-launch club to slide under the branches.`;
    }
    
    // If everything standard was filtered, prefer low punch/hybrid options
    if (validOptions.length === 0) {
      validOptions = options.filter(opt => opt.isPunch || opt.club.type === 'hybrid' || opt.club.id === '5h');
    }
    if (validOptions.length === 0) {
      validOptions = options;
    }
  }

  // Find the option whose carry clears front hazards, and whose total distance is closest to selection target
  let bestOpt = validOptions[0];
  let minDiff = Infinity;

  // Hazard handling
  const frontHazard = hazard.location === 'front' ? hazard : null;
  const backHazard = hazard.location === 'back' ? hazard : null;

  // Get recommendation bias (default to 10 yards to prevent coming up short)
  const bias = typeof environment.caddyBias === 'number' ? environment.caddyBias : 10;
  const selectionTarget = targetDistance + bias;

  validOptions.forEach(opt => {
    // Must carry past front hazards!
    if (frontHazard && frontHazard.type !== 'none') {
      if (opt.adjustedCarry < frontHazard.distance + 8) {
        // Skip or penalize if it carries too short and lands in front hazard
        return;
      }
    }

    // Must not roll into back hazards!
    if (backHazard && backHazard.type !== 'none') {
      if (opt.totalDistance > backHazard.distance - 10) {
        // Skip or penalize if total distance overshoots into back hazard
        return;
      }
    }

    // We want total distance to be as close to biased selection target as possible
    const diff = Math.abs(opt.totalDistance - selectionTarget);
    if (diff < minDiff) {
      minDiff = diff;
      bestOpt = opt;
    }
  });

  // If no option fit the hazard rules, find the closest one overall
  if (!bestOpt) {
    minDiff = Infinity;
    options.forEach(opt => {
      const diff = Math.abs(opt.totalDistance - selectionTarget);
      if (diff < minDiff) {
        minDiff = diff;
        bestOpt = opt;
      }
    });
  }

  // Determine Swing Type / Choke adjustments
  let swingType = 'Full Swing';
  
  // Calculate swing adjustments relative to selectionTarget (where the golfer actually intends to reach)
  let distanceDiff = bestOpt.totalDistance - selectionTarget;

  if (bestOpt.isPunch) {
    swingType = 'Low Punch Shot (Hands forward, ball back in stance)';
  } else {
    // If the club hits too far, we can suggest choking down or a 3/4 swing
    if (distanceDiff > 8 && bestOpt.club.type !== 'driver') {
      swingType = 'Choke down 1 inch (smooth tempo)';
      bestOpt.totalDistance -= 7;
      bestOpt.adjustedCarry -= 6;
      bestOpt.adjustedRoll -= 1;
    } else if (distanceDiff < -8 && bestOpt.club.id !== 'dr') {
      swingType = 'Hard / Aggressive Swing';
      bestOpt.totalDistance += 5;
      bestOpt.adjustedCarry += 5;
    }
  }

  // 6. Calculate Aim Offset and Explanation
  // Deflection is positive (right) or negative (left)
  // To compensate, we aim in the opposite direction
  const aimOffset = -bestOpt.totalDeflection; // e.g., if deflects 10 yd right, aimOffset is -10 (aim 10 yd left)
  let aimExplanation = '';

  const selectedCarry = bestOpt.adjustedCarry;
  // Recalculate drift components for the chosen club with the corrected signs:
  const windDriftSelected = -crosswindMph * 1.1 * (selectedCarry / 150);
  const slopeDriftSelected = -lie.slopeLeftRight * 0.6 * (selectedCarry / 100);

  // Compensations: opposite of the drift
  const windEffect = -windDriftSelected;
  const slopeEffect = -slopeDriftSelected;

  if (Math.abs(aimOffset) < 2) {
    aimExplanation = 'Aim directly at target line. Neutral flight conditions.';
  } else {
    const dirStr = aimOffset < 0 ? 'LEFT' : 'RIGHT';
    const amountStr = Math.abs(aimOffset).toFixed(1);

    aimExplanation = `Aim ${amountStr} yards ${dirStr} of target. `;
    if (Math.abs(windEffect) > 1.5) {
      const windDir = windEffect > 0 ? 'RIGHT' : 'LEFT';
      aimExplanation += `Compensating ${Math.abs(windEffect).toFixed(1)} yd ${windDir} for crosswind drift. `;
    }
    if (Math.abs(slopeEffect) > 1.5) {
      const slopeDir = slopeEffect > 0 ? 'RIGHT' : 'LEFT';
      aimExplanation += `Compensating ${Math.abs(slopeEffect).toFixed(1)} yd ${slopeDir} for uneven lie slope (${lie.slopeLeftRight > 0 ? 'ball above feet' : 'ball below feet'}).`;
    }
  }

  // Srixon Soft Feel Specific Comment
  let ballComment = "Srixon Soft Feel: Highly forgiving low-compression ball. Expect lower driver spin which reduces dispersion right/left, but moderate rollout on irons.";

  // 7. Hazard Risks and Warnings
  const riskAssessment: string[] = [];
  if (hazard.type !== 'none' && hazard.location !== 'none') {
    const isClose = Math.abs(targetDistance - hazard.distance) < 25;
    if (isClose) {
      riskAssessment.push(`CRITICAL HAZARD: ${hazard.size.toUpperCase()} ${hazard.type.toUpperCase()} located ${hazard.location} of the green at ${hazard.distance} yd.`);
      if (hazard.offset < 15) {
        riskAssessment.push(`Aim safety margin adjusted to keep shot away from the ${hazard.type}.`);
      }
    }
  }

  if (lie.type === 'rough') {
    riskAssessment.push('Rough Lie: Flyer risk active. Spin reduced. Expect steeper landing and extended rollout.');
  } else if (lie.type === 'sand') {
    riskAssessment.push('Bunker Full Shot: Keep lower body stable. Strike ball-first to avoid chunking.');
  }

  if (roomToWorkWith === 'short_sided') {
    riskAssessment.push('Short-sided green: Limited room to stop. Prioritize higher apex and landing spot accuracy.');
  }

  // Pick random mental tip
  const mentalTip = MENTAL_TIPS[Math.floor(Math.random() * MENTAL_TIPS.length)];

  return {
    playsLikeDistance,
    recommendedClub: bestOpt.club,
    swingType,
    aimOffset,
    aimExplanation,
    canopyWarning,
    canopyExplanation,
    riskAssessment,
    mentalTip: `${mentalTip} | ${ballComment}`,
    carryDistance: Math.round(bestOpt.adjustedCarry),
    rollDistance: Math.round(bestOpt.adjustedRoll),
    expectedApex: Math.round(bestOpt.adjustedApex),
    expectedSpin: Math.round(bestOpt.adjustedSpin)
  };
}

/**
 * Calculates the recommended shot details for Short Game (Greenside / Chip & Pitch)
 * Utilizing the 5+1x6 System (9i, PW, 50°, SW, 60° x 6 swing lengths)
 */
export function calculateShortGame(inputs: ShotInputs, customMatrix: ShortGameMatrixItem[] = SHORT_GAME_MATRIX): CaddyRecommendation {
  const { targetDistance, targetElevation, canopyHeight, environment, lie, hazard, roomToWorkWith } = inputs;

  const elevationAdj = (targetElevation || 0) / 3; // 1 yard per 3 feet
  const playsLikeDistance = Math.max(2, Math.round(targetDistance + elevationAdj));

  // Greenside Bunker Splash Shot Override
  if (lie.type === 'sand' && playsLikeDistance <= 25) {
    const swClub = CLUBS_DATA.find(c => c.id === 'sw') || CLUBS_DATA[9];
    const lwClub = CLUBS_DATA.find(c => c.id === 'lw') || CLUBS_DATA[10];
    const recClub = roomToWorkWith === 'short_sided' ? lwClub : swClub;

    return {
      playsLikeDistance: playsLikeDistance,
      recommendedClub: recClub,
      swingType: 'Greenside Bunker Splash Shot',
      aimOffset: 0,
      aimExplanation: 'Open the club face wide. Take a steep, full swing targeting a spot 2 inches behind the ball. Splash the sand to lift the ball out of the bunker.',
      canopyWarning: false,
      riskAssessment: [
        'Sand Lie: Avoid direct ball contact. Speed through impact is critical to escape.',
        'Use open stance and visual spot behind the ball.'
      ],
      mentalTip: 'Greenside bunkers require speed! Accelerate through the sand and hold your finish.',
      carryDistance: Math.round(playsLikeDistance * 0.4),
      rollDistance: Math.round(playsLikeDistance * 0.6),
      expectedApex: 12,
      expectedSpin: 6000
    };
  }

  // 1. Environmental Adjustments on Short Game
  const tempFactor = 1 + (environment.temperature - 70) * 0.0005; // lower effect at short range
  const altitudeFactor = 1 + (environment.elevation / 1000) * 0.005;
  const envMultiplier = tempFactor * altitudeFactor;

  // Ground firmness roll multipliers
  let firmnessRollMult = 1.0;
  if (environment.groundFirmness === 'soft') firmnessRollMult = 0.7;
  if (environment.groundFirmness === 'firm') firmnessRollMult = 1.35;

  // Stimp speed rollout adjustment (base is stimp 10)
  const stimpFactor = (environment.greenSpeed || 10) / 10;

  // Lie Slope adjustments for chip rollout
  // Downhill chips roll out significantly, uphill chips stop quickly
  let slopeRollMult = 1.0;
  let slopeCarryMult = 1.0;
  if (lie.slopeUpDown > 0) {
    slopeCarryMult = 1 - (lie.slopeUpDown * 0.01);
    slopeRollMult = 1 - (lie.slopeUpDown * 0.03);
  } else if (lie.slopeUpDown < 0) {
    slopeCarryMult = 1 - (Math.abs(lie.slopeUpDown) * 0.005);
    slopeRollMult = 1 + (Math.abs(lie.slopeUpDown) * 0.05);
  }

  // Rough penalty
  let roughCarryMult = 1.0;
  let roughRollMult = 1.0;
  if (lie.type === 'rough' || lie.type === 'first_cut') {
    roughCarryMult = 0.90;
    roughRollMult = 1.30; // less spin, runs out
  } else if (lie.type === 'buried') {
    roughCarryMult = 0.75;
    roughRollMult = 1.50;
  }

  // 2. Evaluate short game matrix options with elevation flight truncation
  const evaluatedOptions = customMatrix.map(item => {
    const club = CLUBS_DATA.find(c => c.id === item.clubId)!;

    // Adjusted carry
    const adjustedCarry = item.carry * envMultiplier * roughCarryMult * slopeCarryMult;

    // Adjusted roll
    const adjustedRoll = item.roll * firmnessRollMult * stimpFactor * slopeRollMult * roughRollMult;

    // Target Elevation Effect on flight truncation:
    const elevationCarryAdj = -targetElevation / 3;
    const finalCarry = Math.max(1.0, adjustedCarry + elevationCarryAdj);

    // Rollout is also affected by target elevation
    let elevationRollMult = 1.0;
    if (targetElevation > 0) {
      elevationRollMult = Math.max(0.5, 1 - (targetElevation * 0.015));
    } else if (targetElevation < 0) {
      elevationRollMult = Math.min(2.0, 1 + (Math.abs(targetElevation) * 0.02));
    }
    const finalRoll = adjustedRoll * elevationRollMult;
    const finalTotalDistance = finalCarry + finalRoll;

    return {
      item,
      club,
      adjustedCarry: finalCarry,
      adjustedRoll: finalRoll,
      totalDistance: finalTotalDistance
    };
  });

  // 3. Score all options to find the absolute best recommendation
  // This avoids the '60 degree for everything' bias and selects the ideal wedge-swing combination
  let bestOpt = evaluatedOptions[0];
  let bestScore = -Infinity;

  evaluatedOptions.forEach(opt => {
    // A. Distance score (must be close to physical target distance)
    const distanceDiff = Math.abs(opt.totalDistance - targetDistance);
    
    let distanceScore = 0;
    if (distanceDiff <= 2) {
      distanceScore = 100; // Perfect distance match
    } else if (distanceDiff <= 5) {
      distanceScore = 80;
    } else if (distanceDiff <= 10) {
      distanceScore = 45;
    } else if (distanceDiff <= 20) {
      distanceScore = 5;
    } else {
      distanceScore = -150 - distanceDiff * 4; // heavy penalty for being too far
    }

    // B. Rollout ratio score based on room to work with (Strategy Match)
    const rollRatio = opt.adjustedRoll / opt.totalDistance;
    let strategyScore = 0;

    if (roomToWorkWith === 'short_sided') {
      // Short-sided: want low roll ratio (high loft, lands soft)
      if (rollRatio <= 0.35) {
        strategyScore = 45;
      } else if (rollRatio <= 0.52) {
        strategyScore = 20;
      } else if (rollRatio <= 0.62) {
        strategyScore = -15;
      } else {
        strategyScore = -60;
      }
    } else if (roomToWorkWith === 'plenty') {
      // Plenty of green: want high roll ratio (bump and run with PW/9i is safest)
      if (rollRatio >= 0.70) {
        strategyScore = 45;
      } else if (rollRatio >= 0.60) {
        strategyScore = 30;
      } else if (rollRatio >= 0.50) {
        strategyScore = 10;
      } else {
        strategyScore = -30;
      }
    } else {
      // Normal room: standard balanced chip
      if (rollRatio >= 0.35 && rollRatio <= 0.65) {
        strategyScore = 25;
      } else {
        strategyScore = 0;
      }
    }

    // C. Swing comfort preference
    // Shorter, controlled swings (Foot, Knee, Hips) are preferred for short targets (<30 yards)
    let swingScore = 0;
    if (targetDistance < 35) {
      if (opt.item.swingLength === 'Foot' || opt.item.swingLength === 'Knee') {
        swingScore = 20; // boost small chips
      } else if (opt.item.swingLength === 'Hips') {
        swingScore = 10;
      } else if (opt.item.swingLength === 'Full' || opt.item.swingLength === 'Shoulder') {
        swingScore = -25; // discourage massive swings for short yards
      }
    }

    const totalScore = distanceScore + strategyScore + swingScore;

    if (totalScore > bestScore) {
      bestScore = totalScore;
      bestOpt = opt;
    }
  });

  // Lie left-right drift
  // Short chips break sideways slightly due to lie angle slope (slopeLeftRight > 0 is ball above feet, draws left)
  // Positive aimOffset compensates to the right
  const aimOffset = lie.slopeLeftRight * 0.15 * (bestOpt.adjustedCarry);
  let aimExplanation = 'Aim dead center.';
  if (Math.abs(aimOffset) > 0.5) {
    const dir = aimOffset < 0 ? 'LEFT' : 'RIGHT';
    aimExplanation = `Aim ${Math.abs(aimOffset).toFixed(1)} cups ${dir} of target to compensate for uneven lie slope side-hill break.`;
  }

  const riskAssessment: string[] = [];
  if (roomToWorkWith === 'short_sided') {
    riskAssessment.push('Short-sided green: Hit a high soft chip. Trust the 60° or SW loft.');
  } else if (roomToWorkWith === 'plenty') {
    riskAssessment.push('Plenty of green: Bump-and-run is the highest percentage play. Let it roll like a putt.');
  }

  if (lie.type === 'rough') {
    riskAssessment.push('Rough Chip: High grass cushions impact. Hold wrists firm, accelerate through grass.');
  }

  // Combine with Srixon ball profile
  const ballComment = "Srixon Soft Feel: Soft cover gives reliable greenside checks, but will roll slightly further than tour-grade urethane balls. Plan landing spot accordingly.";

  const mentalTip = MENTAL_TIPS[Math.floor(Math.random() * MENTAL_TIPS.length)];

  // Convert to descriptive labels
  const rollRatioPct = bestOpt.totalDistance > 0
    ? ((bestOpt.adjustedRoll / bestOpt.totalDistance) * 100).toFixed(0)
    : '0';

  return {
    playsLikeDistance: playsLikeDistance,
    recommendedClub: bestOpt.club,
    swingType: `5+1x6 System: ${bestOpt.item.swingLength} Swing length (${bestOpt.adjustedCarry.toFixed(0)}y carry + ${bestOpt.adjustedRoll.toFixed(0)}y roll, ${rollRatioPct}% rollout)`,
    aimOffset,
    aimExplanation,
    canopyWarning: false,
    riskAssessment,
    mentalTip: `${mentalTip} | ${ballComment}`,
    carryDistance: Math.round(bestOpt.adjustedCarry),
    rollDistance: Math.round(bestOpt.adjustedRoll),
    expectedApex: Math.round(bestOpt.club.defaultApex * 0.2), // lower apex for short game
    expectedSpin: Math.round(bestOpt.club.defaultSpin * 0.7)
  };
}

/**
 * Calculates putting line, break, speed, and putter suggestions
 * Leverages classical physics of rolling friction on a sloped green
 */
export function calculatePutting(inputs: PutInputs): {
  aimLine: string;
  strokePaceFeet: number;
  explanation: string;
  risks: string[];
  mentalTip: string;
  totalBreakInches: number;
} {
  const {
    paces,
    breakHalfway,
    breakTwoThirds,
    breakDirection,
    slopeUpDown,
    slopePercent,
    grainDirection,
    greenSpeed,
    wetGreens
  } = inputs;

  const distanceFt = paces * 3;

  // 1. Calculate base break
  // Average slope percentage
  const avgSlopePercent = (breakHalfway + breakTwoThirds) / 2;

  // Physical green-reading model derived from rolling friction and lateral gravity acceleration:
  // Base break in inches = Distance (feet) * Slope (%) * Stimpmeter speed / 25
  // (Assuming capture speed of ~1.5 - 2.0 ft/s past the cup, i.e., standard high-percentage capture pace)
  let baseBreakInches = (distanceFt * avgSlopePercent * greenSpeed) / 25;

  if (breakDirection === 'straight') {
    baseBreakInches = 0;
  }

  let totalBreakInches = baseBreakInches;

  // 2. Adjust break for uphill vs downhill sloped profile (Time-on-green adjustment)
  if (slopeUpDown === 'uphill') {
    // Uphill putts are hit harder, traveling faster on average, spending less time rolling and breaking less
    totalBreakInches *= (1 / (1 + 0.08 * slopePercent));
  } else if (slopeUpDown === 'downhill') {
    // Downhill putts are hit softer, decelerate much slower, spending far more time rolling and breaking significantly more
    const downhillMultiplier = Math.min(3.0, 1 / (1 - 0.12 * slopePercent));
    totalBreakInches *= downhillMultiplier;
  }

  // 3. Adjust break for wet greens (dew/moisture adds heavy friction, stabilizing the ball's line)
  if (wetGreens) {
    totalBreakInches *= 0.85;
  }

  // 4. Adjust for grain direction on break
  let grainComment = '';
  if (breakDirection !== 'straight') {
    if (grainDirection === 'cross_left') {
      if (breakDirection === 'right-to-left') {
        totalBreakInches *= 1.20; // grain amplifies break
        grainComment = 'Cross-grain left pulls the ball left, amplifying the right-to-left break.';
      } else {
        totalBreakInches *= 0.80; // grain fights break
        grainComment = 'Cross-grain left pulls the ball left, fighting the left-to-right break.';
      }
    } else if (grainDirection === 'cross_right') {
      if (breakDirection === 'left-to-right') {
        totalBreakInches *= 1.20; // grain amplifies break
        grainComment = 'Cross-grain right pulls the ball right, amplifying the left-to-right break.';
      } else {
        totalBreakInches *= 0.80; // grain fights break
        grainComment = 'Cross-grain right pulls the ball right, fighting the right-to-left break.';
      }
    } else if (grainDirection === 'into_you') {
      totalBreakInches *= 0.95; // increased resistance to break
      grainComment = 'Grain is into you, slightly stabilizing the line and slowing the roll.';
    } else if (grainDirection === 'away_from_you') {
      totalBreakInches *= 1.05; // reduced resistance to break
      grainComment = 'Grain is away from you (down grain), which slightly exaggerates the break.';
    }
  } else {
    // Straight putts with strong cross-grain will drift slightly
    if (grainDirection === 'cross_left') {
      totalBreakInches = distanceFt * 0.12;
      grainComment = 'Straight putt but cross-grain left will cause a subtle left drift (~' + totalBreakInches.toFixed(0) + ' in).';
    } else if (grainDirection === 'cross_right') {
      totalBreakInches = distanceFt * 0.12;
      grainComment = 'Straight putt but cross-grain right will cause a subtle right drift (~' + totalBreakInches.toFixed(0) + ' in).';
    }
  }

  // Round break to nearest 0.5 inches
  totalBreakInches = Math.max(0, Math.round(totalBreakInches * 2) / 2);

  // 5. Speed (Stroke Pace in Feet)
  // Standard flat-putt pace on a Stimp 10 green is distanceFt
  let strokePaceFeet = distanceFt;

  // Uphill requires more power. Physics rule of thumb: add 1.5 feet of distance per 1% grade.
  if (slopeUpDown === 'uphill') {
    strokePaceFeet += slopePercent * 1.5;
  } else if (slopeUpDown === 'downhill') {
    // Downhill requires less power. Physics rule of thumb: subtract 1.8 feet of distance per 1% grade.
    strokePaceFeet -= slopePercent * 1.8;
    strokePaceFeet = Math.max(2, strokePaceFeet); // minimum 2ft roll
  }

  // Adjust for Stimpmeter speed deviation from standard (Stimp 10)
  // Slower green (Stimp < 10) plays longer, faster green (Stimp > 10) plays shorter
  const stimpRatio = 10 / greenSpeed;
  strokePaceFeet *= stimpRatio;

  // Grain affects speed
  if (grainDirection === 'into_you') {
    strokePaceFeet += 1.5; // plays 1.5 feet longer
    grainComment += (grainComment ? ' ' : '') + 'Grain is into you: will feel slower (plays ~1.5 ft longer).';
  } else if (grainDirection === 'away_from_you') {
    strokePaceFeet -= 1.0; // plays 1 foot shorter
    strokePaceFeet = Math.max(2, strokePaceFeet);
    grainComment += (grainComment ? ' ' : '') + 'Grain is away from you: highly slick down-grain roll (plays ~1.0 ft shorter).';
  }

  // Wet greens affect speed (slower)
  if (wetGreens) {
    strokePaceFeet *= 1.15; // plays 15% longer
    grainComment += (grainComment ? ' ' : '') + ' Greens are wet: rolls slower, hit firmer (plays ~15% longer).';
  }

  strokePaceFeet = Math.max(2, Math.round(strokePaceFeet));

  // 6. Aim Line output text
  let aimLine = 'Aim dead center.';
  const actualBreakDir = breakDirection === 'straight' && totalBreakInches > 0 
    ? (grainDirection === 'cross_left' ? 'left-to-right' : 'right-to-left') // cross-grain drift
    : breakDirection;

  if (actualBreakDir !== 'straight' && totalBreakInches > 0) {
    const dir = actualBreakDir === 'left-to-right' ? 'LEFT' : 'RIGHT';
    if (totalBreakInches < 12) {
      aimLine = `Aim ${totalBreakInches} inches ${dir} of cup.`;
    } else {
      const feet = Math.floor(totalBreakInches / 12);
      const inches = Math.round(totalBreakInches % 12);
      const feetStr = feet > 0 ? `${feet} ft ` : '';
      const inchesStr = inches > 0 ? `${inches} in` : '';
      aimLine = `Aim ${feetStr}${inchesStr} ${dir} of cup.`;
    }
  }

  // Odyssey Double Wide putter advice
  let advice = `Odyssey Double Wide: Trust the moderate toe hang of your double-wide mallet. Let your shoulders rock like a pendulum, matching the tempo of a ${strokePaceFeet.toFixed(0)}-foot flat putt. Maintain consistent grip pressure.`;

  const risks: string[] = [];
  if (slopeUpDown === 'downhill') {
    risks.push('DOWNHILL RISK: If you miss, the comeback putt could run far past. Prioritize dying-pace speed.');
  }
  if (greenSpeed > 11) {
    risks.push('FAST GREENS (Stimp ' + greenSpeed + '): Breaks will take heavily. Focus on soft hands.');
  }

  const mentalTip = "Pace dictates break. Choose a speed where the ball trickles into the cup on its final turn.";

  return {
    aimLine,
    strokePaceFeet,
    explanation: `${grainComment} Putter advice: ${advice}`,
    risks,
    mentalTip,
    totalBreakInches
  };
}
