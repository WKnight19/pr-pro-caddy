/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Club, CaddyRecommendation, ShotInputs, PutInputs } from '../types';
import { Target, Compass, Sparkles, AlertTriangle, Play, HelpCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import TrajectoryChart from './TrajectoryChart';

interface CaddyOutputProps {
  recommendation: CaddyRecommendation;
  activeTab: 'full' | 'short' | 'putting';
  puttingDetails?: {
    aimLine: string;
    strokePaceFeet: number;
    explanation: string;
    risks: string[];
    mentalTip: string;
    totalBreakInches: number;
  };
  shotInputs: ShotInputs;
  putInputs: PutInputs;
}

export default function CaddyOutput({ recommendation, activeTab, puttingDetails, shotInputs, putInputs }: CaddyOutputProps) {
  if (activeTab === 'putting' && puttingDetails) {
    const { aimLine, strokePaceFeet, explanation, risks, mentalTip, totalBreakInches } = puttingDetails;

    return (
      <div className="bg-[#1E293B] text-slate-100 rounded-2xl p-6 shadow-2xl border border-slate-700/80 flex flex-col justify-between h-full" id="caddy-output">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <span className="text-xs font-bold tracking-widest text-emerald-400 font-mono uppercase">
              CADDY READING • GREEN ANALYSIS
            </span>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              <span>STIMP READ</span>
            </div>
          </div>

          {/* Core Rec: Stroke Power & Aim */}
          <div className="space-y-2">
            <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">STROKE PACE STRENGTH</span>
            <div className="text-4xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
              {strokePaceFeet} <span className="text-lg text-emerald-400 font-display italic uppercase font-extrabold">ft Putt Power</span>
            </div>
            <p className="text-xs text-slate-400">
              Corresponds to standard flat-green pendulum stroke distance.
            </p>
          </div>

          {/* Trajectory / Putt Line Break Visualizer */}
          <TrajectoryChart
            activeTab="putting"
            putInputs={putInputs}
            puttingDetails={puttingDetails}
          />

          {/* Aim Line Card */}
          <div className="bg-[#0F172A] border border-slate-800/80 p-4 rounded-xl flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold tracking-wider">TARGET BREAK COMPENSATION</span>
              <h4 className="text-base font-black text-white mt-0.5 font-display italic uppercase">{aimLine}</h4>
              <p className="text-xs text-slate-400 mt-1">
                Calculated break is approx. <span className="text-emerald-400 font-bold font-mono">{totalBreakInches} inches</span> over total paces.
              </p>
            </div>
          </div>

          {/* Break Details */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-widest">
              GREEN CONTEXT & GRAIN
            </span>
            <p className="text-xs text-slate-300 bg-[#0F172A] p-3 rounded-lg border border-slate-800/80 leading-relaxed font-serif italic">
              "{explanation}"
            </p>
          </div>

          {/* Warnings / Risks */}
          {risks.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-bold text-slate-500 font-mono uppercase tracking-widest block">
                HAZARDS & DANGER ZONES
              </span>
              <div className="space-y-1.5">
                {risks.map((risk, idx) => (
                  <div key={idx} className="flex gap-2 items-start text-xs bg-rose-950/20 border border-rose-900/40 text-rose-300 p-2.5 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Caddy Advice Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800 flex items-start gap-2.5 text-xs text-emerald-400 font-medium">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="font-serif italic leading-relaxed">
            "{mentalTip}"
          </p>
        </div>
      </div>
    );
  }

  // TEE / APPROACH & SHORT GAME REC VIEW
  const {
    playsLikeDistance,
    recommendedClub,
    swingType,
    aimOffset,
    aimExplanation,
    canopyWarning,
    canopyExplanation,
    riskAssessment,
    mentalTip,
    carryDistance,
    rollDistance,
    expectedApex,
    expectedSpin
  } = recommendation;

  const totalDist = carryDistance + rollDistance;
  const carryPct = (carryDistance / totalDist) * 100;

  return (
    <div className="bg-[#1E293B] text-slate-100 rounded-2xl p-6 shadow-2xl border border-slate-700/80 flex flex-col justify-between h-full" id="caddy-output">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <span className="text-xs font-bold tracking-widest text-emerald-400 font-mono uppercase">
            CADDY SHOT STRATEGY
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono font-bold">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span>PLAYS LIKE: <b className="text-white text-xs font-bold font-mono bg-[#0F172A] border border-slate-850 px-1.5 py-0.5 rounded">{playsLikeDistance}y</b></span>
          </div>
        </div>

        {/* Club Recommendation */}
        <div className="space-y-1">
          <span className="text-[10px] text-slate-500 font-mono block uppercase tracking-wider">RECOMMENDED CLUB</span>
          <h2 className="text-3xl font-black font-mono tracking-tight text-white uppercase font-display italic">
            {recommendedClub.name.replace('Callaway Edge ', '').replace('Cleveland ', '')}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded border border-emerald-500/20">
              {recommendedClub.loft}° LOFT
            </span>
            <span className="text-xs text-slate-300 font-medium">
              {swingType}
            </span>
          </div>
        </div>

        {/* Carry vs Roll Chart */}
        <TrajectoryChart
          activeTab={activeTab}
          recommendation={recommendation}
          shotInputs={shotInputs}
        />

        {/* Aim Line Compass Card */}
        <div className="bg-[#0F172A] border border-slate-850 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold tracking-wider">AIM DIRECTION COMPENSATION</span>
            <h4 className="text-sm font-black text-white mt-0.5 font-display uppercase italic">
              {aimOffset === 0 ? 'AIM DIRECTLY AT THE PIN' : `AIM ${Math.abs(aimOffset).toFixed(1)} YARDS ${aimOffset < 0 ? 'LEFT' : 'RIGHT'}`}
            </h4>
            <p className="text-xs text-slate-400 mt-1 leading-snug">
              {aimExplanation}
            </p>
          </div>
        </div>

        {/* Physics Specs Grid */}
        <div className="grid grid-cols-2 gap-3 bg-[#0F172A] p-3 rounded-xl border border-slate-800/85 text-xs">
          <div>
            <span className="text-slate-500 font-mono block text-[9px] font-bold uppercase tracking-wider">EXPECTED APEX</span>
            <span className="text-sm font-bold text-slate-200 font-mono">{expectedApex} ft</span>
          </div>
          <div>
            <span className="text-slate-500 font-mono block text-[9px] font-bold uppercase tracking-wider">EXPECTED SPIN</span>
            <span className="text-sm font-bold text-slate-200 font-mono">{expectedSpin} rpm</span>
          </div>
        </div>

        {/* Canopy warnings */}
        {canopyWarning && canopyExplanation && (
          <div className="flex gap-2 items-start text-xs bg-amber-950/20 border border-amber-900/40 text-amber-300 p-3 rounded-xl">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <p>{canopyExplanation}</p>
          </div>
        )}

        {/* Risks */}
        {riskAssessment.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[9px] text-slate-500 font-mono block uppercase font-bold tracking-wider">COURSE ARCHITECTURE RISKS</span>
            {riskAssessment.map((risk, idx) => (
              <div key={idx} className="flex gap-2 items-start text-xs bg-rose-950/20 border border-rose-900/40 text-rose-300 p-2.5 rounded-lg">
                <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                <span>{risk}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Caddy Advice Footer */}
      <div className="mt-8 pt-4 border-t border-slate-800 flex items-start gap-2.5 text-xs text-emerald-400 font-medium">
        <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="font-serif italic leading-relaxed">
          "{mentalTip}"
        </p>
      </div>
    </div>
  );
}
