/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Club, ShortGameMatrixItem } from '../types';
import { ShieldAlert, Edit2, Check, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

interface ClubStatsPanelProps {
  clubs: Club[];
  setClubs: (clubs: Club[]) => void;
  shortGameMatrix: ShortGameMatrixItem[];
  setShortGameMatrix: (matrix: ShortGameMatrixItem[]) => void;
}

export default function ClubStatsPanel({
  clubs,
  setClubs,
  shortGameMatrix,
  setShortGameMatrix
}: ClubStatsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [editingClubId, setEditingClubId] = useState<string | null>(null);
  const [editingCarry, setEditingCarry] = useState<number>(0);
  const [editingMatrixIndex, setEditingMatrixIndex] = useState<number | null>(null);
  const [editingMatrixCarry, setEditingMatrixCarry] = useState<number>(0);
  const [editingMatrixRoll, setEditingMatrixRoll] = useState<number>(0);

  const startEditingClub = (club: Club) => {
    setEditingClubId(club.id);
    setEditingCarry(club.defaultCarry);
  };

  const saveClubCarry = () => {
    if (editingClubId) {
      setClubs(
        clubs.map(c => (c.id === editingClubId ? { ...c, defaultCarry: editingCarry } : c))
      );
      setEditingClubId(null);
    }
  };

  const startEditingMatrix = (index: number, item: ShortGameMatrixItem) => {
    setEditingMatrixIndex(index);
    setEditingMatrixCarry(item.carry);
    setEditingMatrixRoll(item.roll);
  };

  const saveMatrixItem = (index: number) => {
    const updated = [...shortGameMatrix];
    updated[index] = {
      ...updated[index],
      carry: editingMatrixCarry,
      roll: editingMatrixRoll
    };
    setShortGameMatrix(updated);
    setEditingMatrixIndex(null);
  };

  const resetAllDefaults = () => {
    if (confirm('Are you sure you want to reset all club carries and short game matrices to default trackman settings?')) {
      window.location.reload();
    }
  };

  // Group clubs by category for rendering
  const woodsAndHybrids = clubs.filter(c => ['driver', 'wood', 'hybrid'].includes(c.type));
  const irons = clubs.filter(c => c.type === 'iron');
  const wedges = clubs.filter(c => c.type === 'wedge');

  return (
    <div className="bg-[#1E293B] rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden mb-6" id="club-stats-panel">
      {/* Toggle Header */}
      <button
        id="btn-toggle-bag"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#162035] hover:bg-[#1e2d4a] px-6 py-4 flex justify-between items-center transition-all border-b border-slate-800 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          <span className="font-bold text-slate-100 tracking-tight text-sm md:text-base uppercase italic font-display">
            Your Bag & Yardage Specifications (Callaway Edge + Cleveland)
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-bold tracking-widest">
          <span>{isOpen ? 'COLLAPSE SPECS' : 'EXPAND SPECS'}</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
        </div>
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="p-6 space-y-8 animate-fade-in">
          {/* Top Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#0F172A] rounded-xl p-4 border border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                These are calibrated carry yardages based on your Trackman stats. Click any yardage to customize it for your swing.
              </span>
            </div>
            <button
              id="btn-reset-bag"
              onClick={resetAllDefaults}
              className="flex items-center gap-1.5 text-[10px] text-emerald-400 hover:text-emerald-350 font-bold font-mono uppercase tracking-wider transition-colors shrink-0"
            >
              <RefreshCw className="w-3 h-3" /> Reset Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Clubs Grid (Left) */}
            <div className="lg:col-span-7 space-y-6">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 font-mono uppercase border-b border-slate-700/60 pb-2">
                1. FULL SWING PROFILE
              </h3>

              {/* Group: Woods & Hybrids */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">Woods & Utility</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {woodsAndHybrids.map(club => (
                    <div
                      key={club.id}
                      className="border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 bg-[#0F172A] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                            {club.type}
                          </span>
                          <span className="text-xs font-mono text-slate-500 font-bold">
                            {club.loft}°
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-200 mt-1 leading-snug font-display">
                          {club.name}
                        </h4>
                        <div className="text-[10px] text-slate-500 mt-2 font-mono space-y-0.5">
                          <div>Len: {club.standardLength}</div>
                          <div className="truncate" title={club.material}>Mat: {club.material}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-mono font-bold tracking-wide">CARRY:</span>
                        {editingClubId === club.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-16 px-1.5 py-0.5 border border-slate-800 rounded text-sm text-center font-bold text-emerald-400 bg-[#1E293B] focus:outline-none focus:border-emerald-500"
                              value={editingCarry}
                              onChange={e => setEditingCarry(parseInt(e.target.value) || 0)}
                              autoFocus
                            />
                            <button
                              onClick={saveClubCarry}
                              className="p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-xs font-bold"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingClub(club)}
                            className="group flex items-center gap-1 text-sm font-bold text-slate-200 hover:text-emerald-400 transition-colors font-mono"
                          >
                            <span>{club.defaultCarry} yd</span>
                            <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group: Irons */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">Edge CB Cavity Back Irons (Stiff)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {irons.map(club => (
                    <div
                      key={club.id}
                      className="border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 bg-[#0F172A] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                            Iron {club.id.toUpperCase()}
                          </span>
                          <span className="text-xs font-mono text-slate-500 font-bold">
                            {club.loft}°
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1 truncate font-display">
                          {club.name}
                        </h4>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 font-mono font-bold">CARRY:</span>
                        {editingClubId === club.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-14 px-1 py-0.5 border border-slate-800 rounded text-xs text-center font-bold text-emerald-400 bg-[#1E293B] focus:outline-none focus:border-emerald-500"
                              value={editingCarry}
                              onChange={e => setEditingCarry(parseInt(e.target.value) || 0)}
                              autoFocus
                            />
                            <button
                              onClick={saveClubCarry}
                              className="p-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingClub(club)}
                            className="group flex items-center gap-0.5 text-xs font-bold text-slate-200 hover:text-emerald-400 transition-colors font-mono"
                          >
                            <span>{club.defaultCarry}y</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Group: Wedges */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-400 font-mono tracking-wider block">Wedges (Callaway Edge + Custom Cleveland)</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {wedges.map(club => (
                    <div
                      key={club.id}
                      className="border border-slate-800/80 hover:border-slate-700 rounded-xl p-3 bg-[#0F172A] transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase">
                            WEDGE
                          </span>
                          <span className="text-xs font-mono text-slate-500 font-bold">
                            {club.loft}°
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1 truncate font-display" title={club.name}>
                          {club.name}
                        </h4>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-800/80 flex justify-between items-center">
                        <span className="text-[9px] text-slate-500 font-mono font-bold">CARRY:</span>
                        {editingClubId === club.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              className="w-14 px-1 py-0.5 border border-slate-800 rounded text-xs text-center font-bold text-emerald-400 bg-[#1E293B] focus:outline-none focus:border-emerald-500"
                              value={editingCarry}
                              onChange={e => setEditingCarry(parseInt(e.target.value) || 0)}
                              autoFocus
                            />
                            <button
                              onClick={saveClubCarry}
                              className="p-0.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingClub(club)}
                            className="group flex items-center gap-0.5 text-xs font-bold text-slate-200 hover:text-emerald-400 transition-colors font-mono"
                          >
                            <span>{club.defaultCarry}y</span>
                            <Edit2 className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 text-emerald-400 transition-opacity" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5+1x6 System Matrix (Right) */}
            <div className="lg:col-span-5 space-y-6">
              <h3 className="text-xs font-bold tracking-widest text-slate-400 font-mono uppercase border-b border-slate-700/60 pb-2">
                2. 5+1x6 SHORT GAME SYSTEM
              </h3>

              <div className="bg-[#0F172A] text-slate-200 rounded-xl p-4 border border-slate-800">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">THE SYSTEM DEFINITION</span>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  You play 5 wedges (9i, PW, GW 50°, SW 54°, LW 60°) plus putter, across 6 swing lengths (Foot, Knee, Hips, Torso, Shoulder, Full) to manage all green approach and greenside chips safely and precisely.
                </p>
              </div>

              {/* Matrix Table */}
              <div className="border border-slate-800 bg-[#0F172A] rounded-xl overflow-hidden shadow-inner max-h-[350px] overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#162035] border-b border-slate-850 text-slate-400 font-mono uppercase font-bold text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-3">Length</th>
                      <th className="py-2.5 px-3 text-right">Carry (yd)</th>
                      <th className="py-2.5 px-3 text-right">Roll (yd)</th>
                      <th className="py-2.5 px-3 text-center">Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {shortGameMatrix.map((item, idx) => {
                      const isEditing = editingMatrixIndex === idx;
                      const club = clubs.find(c => c.id === item.clubId);

                      return (
                        <tr key={idx} className="hover:bg-[#162035]/50 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-200">
                            {club?.id.toUpperCase()} ({club?.loft}°)
                          </td>
                          <td className="py-2 px-3 text-slate-400 font-mono">
                            {item.swingLength}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-bold text-slate-100">
                            {isEditing ? (
                              <input
                                type="number"
                                className="w-12 px-1 border border-slate-800 rounded text-center text-xs bg-[#1E293B] text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold"
                                value={editingMatrixCarry}
                                onChange={e => setEditingMatrixCarry(parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              `${item.carry}y`
                            )}
                          </td>
                          <td className="py-2 px-3 text-right font-mono text-slate-400">
                            {isEditing ? (
                              <input
                                type="number"
                                className="w-12 px-1 border border-slate-800 rounded text-center text-xs bg-[#1E293B] text-emerald-400 focus:outline-none focus:border-emerald-500 font-bold"
                                value={editingMatrixRoll}
                                onChange={e => setEditingMatrixRoll(parseInt(e.target.value) || 0)}
                              />
                            ) : (
                              `${item.roll}y`
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            {isEditing ? (
                              <button
                                onClick={() => saveMatrixItem(idx)}
                                className="p-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded font-bold"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            ) : (
                              <button
                                onClick={() => startEditingMatrix(idx, item)}
                                className="text-slate-500 hover:text-emerald-400 p-1"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
