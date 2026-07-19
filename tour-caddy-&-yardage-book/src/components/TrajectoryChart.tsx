/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import * as d3 from 'd3';
import { CaddyRecommendation, ShotInputs, PutInputs } from '../types';
import { Wind, Trees, Target as TargetIcon, ArrowRight, ArrowUpRight } from 'lucide-react';

interface TrajectoryChartProps {
  recommendation?: CaddyRecommendation;
  activeTab: 'full' | 'short' | 'putting';
  shotInputs?: ShotInputs;
  putInputs?: PutInputs;
  puttingDetails?: {
    aimLine: string;
    strokePaceFeet: number;
    explanation: string;
    risks: string[];
    mentalTip: string;
    totalBreakInches: number;
  };
}

export default function TrajectoryChart({
  recommendation,
  activeTab,
  shotInputs,
  putInputs,
  puttingDetails
}: TrajectoryChartProps) {
  // SVG size configuration
  const width = 640;
  const height = 240;
  const margin = { top: 30, right: 50, bottom: 40, left: 50 };

  // ----------------------------------------------------
  // MODE A: FLIGHT TRAJECTORY (FULL SHOT & SHORT GAME)
  // ----------------------------------------------------
  const flightData = useMemo(() => {
    if (activeTab === 'putting' || !recommendation || !shotInputs) return null;

    const carry = recommendation.carryDistance || 10;
    const roll = recommendation.rollDistance || 0;
    const apex = recommendation.expectedApex || 10;
    const targetDist = shotInputs.targetDistance || 150;
    const targetElev = shotInputs.targetElevation || 0; // in feet
    const canopyHeight = shotInputs.canopyHeight || 999;

    // Convert target elevation from feet to yards for consistent horizontal/vertical physics modeling if needed,
    // but we can map them on separate scales in D3.
    // Horizontal scale: Yards (0 to max yards)
    // Vertical scale: Feet (0 to max apex / target elevation feet)
    const totalDist = carry + roll;
    const xMax = Math.max(targetDist, totalDist) * 1.15;
    const xMin = 0;

    // Vertical scale limits (in feet)
    const yMin = Math.min(0, targetElev) - 15;
    const yMax = Math.max(apex, targetElev, canopyHeight < 150 ? canopyHeight : 0, 15) * 1.25;

    // Generate terrain profile function
    // Assuming uniform slope from tee (0,0) to target (targetDist, targetElev)
    const getTerrainHeight = (x: number) => {
      if (targetDist <= 0) return 0;
      if (x <= targetDist) {
        return (x / targetDist) * targetElev;
      } else {
        return targetElev; // flat after pin/cup
      }
    };

    // Landing point height (in feet)
    const landingElev = getTerrainHeight(carry);

    // Generate trajectory flight points
    const trajectoryPoints: [number, number][] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const x = (carry * i) / steps;
      const t = x / carry;
      // Air resistance & spin model: peak of the ball flight occurs at ~60% of carry (t = 0.6)
      const yBase = apex * (Math.pow(t, 1.5) * (1 - t)) / 0.1859;
      const y = yBase + t * landingElev;
      trajectoryPoints.push([x, y]);
    }

    // Generate ground line points
    const groundPoints: [number, number][] = [];
    const groundSteps = 40;
    for (let i = 0; i <= groundSteps; i++) {
      const x = (xMax * i) / groundSteps;
      groundPoints.push([x, getTerrainHeight(x)]);
    }

    // Generate rollout points (hugging the ground from carry to carry + roll)
    const rolloutPoints: [number, number][] = [];
    const rollSteps = 20;
    for (let i = 0; i <= rollSteps; i++) {
      const x = carry + (roll * i) / rollSteps;
      rolloutPoints.push([x, getTerrainHeight(x)]);
    }

    return {
      carry,
      roll,
      totalDist,
      apex,
      targetDist,
      targetElev,
      canopyHeight,
      canopyWarning: recommendation.canopyWarning,
      clubName: recommendation.recommendedClub.name,
      xMin,
      xMax,
      yMin,
      yMax,
      trajectoryPoints,
      groundPoints,
      rolloutPoints,
      getTerrainHeight,
      landingElev
    };
  }, [recommendation, activeTab, shotInputs]);

  // Create flight scales & generators
  const flightScales = useMemo(() => {
    if (!flightData) return null;

    const xScale = d3.scaleLinear()
      .domain([flightData.xMin, flightData.xMax])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([flightData.yMin, flightData.yMax])
      .range([height - margin.bottom, margin.top]);

    const flightLineGen = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveCatmullRom);

    const groundLineGen = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]));

    const groundAreaGen = d3.area<[number, number]>()
      .x(d => xScale(d[0]))
      .y0(height - margin.bottom)
      .y1(d => yScale(d[1]));

    return { xScale, yScale, flightLineGen, groundLineGen, groundAreaGen };
  }, [flightData]);

  // ----------------------------------------------------
  // MODE B: TOP-DOWN PUTTING PATH (PUTTING TAB)
  // ----------------------------------------------------
  const puttingData = useMemo(() => {
    if (activeTab !== 'putting' || !putInputs || !puttingDetails) return null;

    const paces = putInputs.paces || 5;
    const breakInches = puttingDetails.totalBreakInches || 0;
    const breakDirection = putInputs.breakDirection; // 'left-to-right' | 'right-to-left' | 'straight'

    // Width of green visual is in paces (0 to paces)
    const xMin = 0;
    const xMax = paces * 1.25; // 25% margin past cup

    // Vertical range is -15 to +15 inches of side break
    const yBound = Math.max(12, Math.abs(breakInches) * 2.2);
    const yMin = -yBound;
    const yMax = yBound;

    // Start of ball is at (0, 0)
    // Cup/Hole is at (paces, 0)
    // If break is left-to-right (slopes right, which curves downwards on page),
    // then the target aim point is to the left (upwards on page, positive Y) by `breakInches`!
    // The ball is hit towards this aim point, but gravity pulls it down.
    const aimY = breakDirection === 'left-to-right'
      ? breakInches
      : breakDirection === 'right-to-left'
        ? -breakInches
        : 0;

    // Sample ball roll path using a nice cubic bezier curve to simulate breaking speed decay
    // Towards the cup, gravity has more time to break the ball, so the curve breaks more sharply near the hole.
    const pathPoints: [number, number][] = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = paces * t;

      // Ball starts towards aimY but breaks back towards 0 at the cup.
      // We simulate this with a cubic polynomial to make it look highly authentic
      // At t=0, y=0. At t=1, y=0. At t=0.4, it is close to the apex of the aim line.
      const breakCompensation = aimY * t * (1 - Math.pow(t, 2.5));
      pathPoints.push([x, breakCompensation]);
    }

    return {
      paces,
      breakInches,
      breakDirection,
      aimY,
      xMin,
      xMax,
      yMin,
      yMax,
      pathPoints
    };
  }, [putInputs, puttingDetails, activeTab]);

  // Create putting scales & generators
  const puttingScales = useMemo(() => {
    if (!puttingData) return null;

    const xScale = d3.scaleLinear()
      .domain([puttingData.xMin, puttingData.xMax])
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([puttingData.yMin, puttingData.yMax])
      .range([height - margin.bottom, margin.top]);

    const pathLineGen = d3.line<[number, number]>()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveBasis);

    return { xScale, yScale, pathLineGen };
  }, [puttingData]);


  // ----------------------------------------------------
  // RENDERING LOGIC
  // ----------------------------------------------------

  // 1. Flight Trajectory Render
  if (activeTab !== 'putting' && flightData && flightScales) {
    const {
      carry,
      roll,
      totalDist,
      apex,
      targetDist,
      targetElev,
      canopyHeight,
      canopyWarning,
      clubName,
      trajectoryPoints,
      groundPoints,
      rolloutPoints,
      getTerrainHeight,
      landingElev
    } = flightData;

    const { xScale, yScale, flightLineGen, groundLineGen, groundAreaGen } = flightScales;

    // Grid ticks
    const xTicks = xScale.ticks(6);
    const yTicks = yScale.ticks(4);

    // Peak coordinates for apex labelling
    const peakT = 0.6;
    const peakX = carry * peakT;
    const peakY = apex * (Math.pow(peakT, 1.5) * (1 - peakT)) / 0.1859 + peakT * landingElev;

    // Cleaned up club label
    const shortClubName = clubName
      .replace('Callaway Edge ', '')
      .replace('Cleveland ', '')
      .replace('Srixon ', '');

    return (
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col gap-3" id="flight-trajectory-chart">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-100 font-mono tracking-widest">
                D3 Trajectory Profile
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Real-time aero & gravity simulation for {shortClubName}
              </p>
            </div>
          </div>

          {/* Environmental Wind Indicator */}
          {shotInputs && shotInputs.environment.windSpeed > 0 && (
            <div className="flex items-center gap-1.5 bg-[#0F172A] border border-slate-800/80 px-2 py-1 rounded-lg text-[10px] font-mono text-sky-400">
              <Wind className="w-3 h-3" />
              <span>
                {shotInputs.environment.windSpeed} mph wind
              </span>
            </div>
          )}
        </div>

        {/* SVG Drawing Area */}
        <div className="relative bg-[#0F172A] rounded-xl overflow-hidden border border-slate-850">
          <svg className="w-full h-auto max-h-[240px]" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
            <defs>
              {/* Glowing flight line gradient */}
              <linearGradient id="flightGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#34D399" stopOpacity="1" />
                <stop offset="100%" stopColor="#6EE7B7" stopOpacity="0.9" />
              </linearGradient>

              {/* Glowing rollout line gradient */}
              <linearGradient id="rollGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
              </linearGradient>

              {/* Terrain Gradient */}
              <linearGradient id="terrainGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1B3F2E" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0B131E" stopOpacity="0.95" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Lines */}
            <g className="grid-lines" stroke="#334155" strokeOpacity="0.15" strokeDasharray="2,3">
              {/* Horizontal Lines */}
              {yTicks.map(y => (
                <line
                  key={`y-${y}`}
                  x1={margin.left}
                  y1={yScale(y)}
                  x2={width - margin.right}
                  y2={yScale(y)}
                />
              ))}
              {/* Vertical Lines */}
              {xTicks.map(x => (
                <line
                  key={`x-${x}`}
                  x1={xScale(x)}
                  y1={margin.top}
                  x2={xScale(x)}
                  y2={height - margin.bottom}
                />
              ))}
            </g>

            {/* Tree Canopy Ceiling Line if applicable */}
            {canopyHeight < 150 && (
              <g id="canopy-visual">
                <line
                  x1={margin.left}
                  y1={yScale(canopyHeight)}
                  x2={width - margin.right}
                  y2={yScale(canopyHeight)}
                  stroke={canopyWarning ? '#F43F5E' : '#22C55E'}
                  strokeWidth="1.5"
                  strokeDasharray="4,4"
                  strokeOpacity="0.6"
                />
                <rect
                  x={margin.left + 10}
                  y={yScale(canopyHeight) - 18}
                  width="135"
                  height="14"
                  rx="3"
                  fill={canopyWarning ? '#4C0519' : '#064E3B'}
                  fillOpacity="0.8"
                  stroke={canopyWarning ? '#F43F5E' : '#22C55E'}
                  strokeWidth="0.5"
                  strokeOpacity="0.5"
                />
                <text
                  x={margin.left + 15}
                  y={yScale(canopyHeight) - 8}
                  fill={canopyWarning ? '#FDA4AF' : '#A7F3D0'}
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  CANOPY CEILING: {canopyHeight}ft {canopyWarning ? '⚠️' : '✓'}
                </text>
              </g>
            )}

            {/* Terrain Polygon Fill */}
            <path
              d={groundAreaGen(groundPoints) || undefined}
              fill="url(#terrainGrad)"
            />

            {/* Terrain Edge Line */}
            <path
              d={groundLineGen(groundPoints) || undefined}
              fill="none"
              stroke="#047857"
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Target Flagstick */}
            <g transform={`translate(${xScale(targetDist)}, ${yScale(targetElev)})`}>
              {/* Hole Cup */}
              <ellipse cx="0" cy="0" rx="4" ry="1.5" fill="#047857" stroke="#34D399" strokeWidth="0.5" />
              {/* Pole */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="-38"
                stroke="#94A3B8"
                strokeWidth="2"
              />
              {/* Red Flag */}
              <path
                d="M 0 -38 L 13 -32 L 0 -26 Z"
                fill="#EF4444"
                stroke="#DC2626"
                strokeWidth="0.5"
              />
              {/* Flag pin indicator text */}
              <text
                x="0"
                y="-43"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
                className="bg-slate-900"
              >
                PIN ({targetDist}y)
              </text>
            </g>

            {/* Ball Rollout Path */}
            <path
              d={groundLineGen(rolloutPoints) || undefined}
              fill="none"
              stroke="url(#rollGrad)"
              strokeWidth="3.5"
              strokeDasharray="4,3"
              strokeLinecap="round"
            />

            {/* Ball Trajectory Flight Path */}
            <path
              d={flightLineGen(trajectoryPoints) || undefined}
              fill="none"
              stroke="url(#flightGrad)"
              strokeWidth="3.5"
              filter="url(#glow)"
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Apex Highlight */}
            <g transform={`translate(${xScale(peakX)}, ${yScale(peakY)})`}>
              <line
                x1="0"
                y1="0"
                x2={-xScale(peakX) + margin.left}
                y2="0"
                stroke="#10B981"
                strokeOpacity="0.4"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
              <circle cx="0" cy="0" r="3" fill="#10B981" />
              <rect
                x="5"
                y="-18"
                width="72"
                height="13"
                rx="3"
                fill="#0F172A"
                fillOpacity="0.85"
                stroke="#10B981"
                strokeWidth="0.5"
              />
              <text
                x="9"
                y="-9"
                fill="#6EE7B7"
                fontSize="8"
                fontFamily="monospace"
                fontWeight="bold"
              >
                APEX: {apex.toFixed(0)} ft
              </text>
            </g>

            {/* Landing Point Marker */}
            <g transform={`translate(${xScale(carry)}, ${yScale(landingElev)})`}>
              <circle cx="0" cy="0" r="6" fill="none" stroke="#10B981" strokeWidth="1.5" strokeOpacity="0.8" className="animate-pulse" />
              <circle cx="0" cy="0" r="2.5" fill="#10B981" />
              <text
                x="0"
                y="14"
                textAnchor="middle"
                fill="#10B981"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                CARRY {carry.toFixed(0)}y
              </text>
            </g>

            {/* Final Position Marker (White Golf Ball) */}
            <g transform={`translate(${xScale(carry + roll)}, ${yScale(getTerrainHeight(carry + roll))})`}>
              <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.75" />
              <circle cx="0" cy="0" r="1" fill="#CCCCCC" />
              <text
                x="0"
                y="-8"
                textAnchor="middle"
                fill="#F59E0B"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                STOP {totalDist.toFixed(0)}y
              </text>
            </g>

            {/* Axes & Boundaries */}
            {/* Ground Baseline */}
            <line
              x1={margin.left}
              y1={height - margin.bottom}
              x2={width - margin.right}
              y2={height - margin.bottom}
              stroke="#475569"
              strokeWidth="1"
            />
            {/* Left Height Line */}
            <line
              x1={margin.left}
              y1={margin.top}
              x2={margin.left}
              y2={height - margin.bottom}
              stroke="#475569"
              strokeWidth="1"
            />

            {/* Axis Labels (X-Axis: Distance Yards) */}
            {xTicks.map(x => (
              <text
                key={`lbl-x-${x}`}
                x={xScale(x)}
                y={height - margin.bottom + 14}
                textAnchor="middle"
                fill="#64748B"
                fontSize="8"
                fontFamily="monospace"
              >
                {x}y
              </text>
            ))}
            <text
              x={width / 2}
              y={height - 6}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              letterSpacing="0.1em"
            >
              SHOT CARRY & ROLLOUT RANGE (YARDS)
            </text>

            {/* Axis Labels (Y-Axis: Height Feet) */}
            {yTicks.map(y => (
              <text
                key={`lbl-y-${y}`}
                x={margin.left - 8}
                y={yScale(y) + 3}
                textAnchor="end"
                fill="#64748B"
                fontSize="8"
                fontFamily="monospace"
              >
                {y}ft
              </text>
            ))}
            <text
              transform={`translate(14, ${(height - margin.bottom - margin.top) / 2 + margin.top}) rotate(-90)`}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              letterSpacing="0.1em"
            >
              TRAJECTORY HEIGHT (FEET)
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center bg-[#0F172A] p-2 rounded-xl border border-slate-800 text-[10px] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-emerald-500 rounded-full" />
              <span className="text-slate-400">Flight (Carry)</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-amber-500" />
              <span className="text-slate-400">Rollout</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-emerald-700 rounded-full" />
              <span className="text-slate-400">Ground Slope</span>
            </span>
          </div>

          <div className="text-slate-500 text-[9px] uppercase font-bold">
            Uphill/Downhill Flight Scaling Active
          </div>
        </div>
      </div>
    );
  }

  // 2. Putting Green Top-Down Render
  if (activeTab === 'putting' && puttingData && puttingScales && puttingDetails) {
    const {
      paces,
      breakInches,
      breakDirection,
      aimY,
      xMin,
      xMax,
      yMin,
      yMax,
      pathPoints
    } = puttingData;

    const { xScale, yScale, pathLineGen } = puttingScales;

    // Grid ticks
    const xTicks = xScale.ticks(5);

    // Aim Line end point coordinates
    const aimEndX = paces;
    const aimEndY = aimY;

    // Compensate background color based on wet greens
    const isWet = putInputs?.wetGreens;

    return (
      <div className="bg-[#1E293B] border border-slate-700/80 rounded-2xl p-5 shadow-2xl flex flex-col gap-3" id="putting-trajectory-chart">
        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <TargetIcon className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-xs font-bold uppercase text-slate-100 font-mono tracking-widest">
                D3 Green Putting Break
              </h3>
              <p className="text-[10px] text-slate-400 font-sans mt-0.5">
                Top-down gravity break compensation at {putInputs?.greenSpeed} stimp
              </p>
            </div>
          </div>

          {/* Wet Greens Indicator */}
          {isWet && (
            <div className="flex items-center gap-1 bg-sky-950/40 border border-sky-800 px-2 py-0.5 rounded text-[9px] font-bold text-sky-400 font-mono uppercase tracking-widest">
              Wet/Dewy Green
            </div>
          )}
        </div>

        {/* SVG Drawing Area */}
        <div className="relative bg-[#0b1b14] rounded-xl overflow-hidden border border-emerald-950/60">
          <svg className="w-full h-auto max-h-[240px]" viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
            <defs>
              {/* Green grass radial gradient */}
              <radialGradient id="greenGrass" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor={isWet ? "#0B261D" : "#143E30"} />
                <stop offset="100%" stopColor={isWet ? "#061510" : "#0A2018"} />
              </radialGradient>

              {/* Glowing putting line gradient */}
              <linearGradient id="puttGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                <stop offset="70%" stopColor="#34D399" stopOpacity="1" />
                <stop offset="100%" stopColor="#059669" stopOpacity="0.9" />
              </linearGradient>

              {/* Hole shadow/fill gradient */}
              <radialGradient id="cupGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#020617" />
                <stop offset="75%" stopColor="#1E293B" />
                <stop offset="100%" stopColor="#475569" />
              </radialGradient>
            </defs>

            {/* Grass background */}
            <rect width={width} height={height} fill="url(#greenGrass)" />

            {/* Center target guide line (flat linear aim reference) */}
            <line
              x1={xScale(0)}
              y1={yScale(0)}
              x2={xScale(paces)}
              y2={yScale(0)}
              stroke="#10B981"
              strokeOpacity="0.1"
              strokeWidth="2"
              strokeDasharray="5,5"
            />

            {/* Horizontal Grid lines (Break bounds) */}
            <line x1={margin.left} y1={yScale(yMin / 2)} x2={width - margin.right} y2={yScale(yMin / 2)} stroke="#10B981" strokeOpacity="0.05" strokeDasharray="2,2" />
            <line x1={margin.left} y1={yScale(yMax / 2)} x2={width - margin.right} y2={yScale(yMax / 2)} stroke="#10B981" strokeOpacity="0.05" strokeDasharray="2,2" />

            {/* Visual Aim Compensation Line (dashed line from ball starting to aimed location) */}
            {breakInches !== 0 && (
              <g id="aim-line-compensator">
                <line
                  x1={xScale(0)}
                  y1={yScale(0)}
                  x2={xScale(aimEndX)}
                  y2={yScale(aimEndY)}
                  stroke="#F59E0B"
                  strokeWidth="1.5"
                  strokeDasharray="3,3"
                  strokeOpacity="0.55"
                />
                {/* Aim Compensator Dot */}
                <circle
                  cx={xScale(aimEndX)}
                  cy={yScale(aimEndY)}
                  r="3.5"
                  fill="#F59E0B"
                  stroke="#FFFFFF"
                  strokeWidth="0.5"
                />
                <text
                  x={xScale(aimEndX) + 6}
                  y={yScale(aimEndY) + 3}
                  fill="#F59E0B"
                  fontSize="8"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  AIM POINT COMP (+{Math.abs(breakInches).toFixed(1)}")
                </text>
              </g>
            )}

            {/* The Gravity Curved Putt Path (Actual path ball takes to hole) */}
            <path
              d={pathLineGen(pathPoints) || undefined}
              fill="none"
              stroke="url(#puttGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="transition-all duration-500 ease-out"
            />

            {/* Green Cup (The Hole) */}
            <g transform={`translate(${xScale(paces)}, ${yScale(0)})`}>
              {/* Outer white lip */}
              <circle cx="0" cy="0" r="10.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
              {/* Inside Cup shadow */}
              <circle cx="0" cy="0" r="9.5" fill="url(#cupGrad)" />
              {/* Flagstick base */}
              <circle cx="0" cy="0" r="2.5" fill="#FFFFFF" />
              <text
                x="0"
                y="-14"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                CUP ({paces} Paces)
              </text>
            </g>

            {/* Starting Golf Ball */}
            <g transform={`translate(${xScale(0)}, ${yScale(0)})`}>
              <circle cx="0" cy="0" r="5" fill="#FFFFFF" stroke="#475569" strokeWidth="0.75" />
              <circle cx="-1" cy="-1" r="1" fill="#E2E8F0" />
              <text
                x="0"
                y="14"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
              >
                START
              </text>
            </g>

            {/* Break Direction arrow marker */}
            {breakInches !== 0 && (
              <g transform={`translate(${(xScale(0) + xScale(paces)) / 2}, ${yScale(0) + (breakDirection === 'left-to-right' ? 30 : -35)})`} opacity="0.6">
                <text
                  x="0"
                  y="0"
                  textAnchor="middle"
                  fill="#34D399"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="monospace"
                  letterSpacing="0.05em"
                >
                  {breakDirection === 'left-to-right' ? 'SLOPE BREAKS RIGHT →' : '← SLOPE BREAKS LEFT'}
                </text>
                <path
                  d={breakDirection === 'left-to-right' ? "M -20 6 L 20 6 M 15 2 L 20 6 L 15 10" : "M 20 -6 L -20 -6 M -15 -10 L -20 -6 L -15 -2"}
                  fill="none"
                  stroke="#34D399"
                  strokeWidth="1.25"
                />
              </g>
            )}

            {/* Horizontal Paces ticks */}
            {xTicks.map(p => (
              <text
                key={`lbl-p-${p}`}
                x={xScale(p)}
                y={height - 12}
                textAnchor="middle"
                fill="#64748B"
                fontSize="8"
                fontFamily="monospace"
              >
                {p} paces
              </text>
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex justify-between items-center bg-[#0F172A] p-2 rounded-xl border border-slate-800 text-[10px] font-mono">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 bg-white rounded-full" />
              <span className="text-slate-400">Putt Path</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-1 border-t-2 border-dashed border-amber-500" />
              <span className="text-slate-400">Aim Compensation</span>
            </span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold">
              Grain Effect: {putInputs?.grainDirection !== 'neutral' ? putInputs?.grainDirection.toUpperCase().replace('_', ' ') : 'NONE'}
            </span>
          </div>

          <div className="text-amber-500 font-bold uppercase text-[9px]">
            Aim Left/Right to let it break
          </div>
        </div>
      </div>
    );
  }

  // Fallback
  return null;
}
