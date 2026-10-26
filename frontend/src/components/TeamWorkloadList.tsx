import React from 'react';
import { User } from '../types';
import { Flame, ShieldCheck, Activity, ArrowRightLeft } from 'lucide-react';

interface TeamWorkloadListProps {
  users: User[];
  onOpenRebalanceForUser?: (user: User) => void;
}

export const TeamWorkloadList: React.FC<TeamWorkloadListProps> = ({
  users,
  onOpenRebalanceForUser,
}) => {
  return (
    <div className="bg-[#0F1626]/80 border border-slate-800/80 rounded-2xl p-4 shadow-sm backdrop-blur">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Team Workload & Burnout Monitor
          </h2>
        </div>
        <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Safety Limit: &le; 5 tasks In-Progress
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {users.map((user) => {
          const inProgress = user.inProgressCount || 0;
          const isBurnout = inProgress > 5;

          return (
            <div
              key={user.id}
              className={`relative rounded-xl p-3 border transition-all duration-300 flex items-center gap-3 ${
                isBurnout
                  ? 'bg-red-950/30 border-red-500/50 shadow-lg shadow-red-900/20'
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Avatar with Burnout Red Pulse */}
              <div className="relative flex-shrink-0">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className={`w-11 h-11 rounded-full object-cover transition-all duration-300 ${
                    isBurnout
                      ? 'avatar-burnout-pulse bg-red-600 ring-4 ring-red-500/50'
                      : 'border-2 border-slate-700'
                  }`}
                />
                {isBurnout ? (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white p-0.5 rounded-full shadow-md animate-bounce">
                    <Flame className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                )}
              </div>

              {/* User Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-xs font-semibold text-slate-200 truncate">
                    {user.name}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{user.role}</p>

                {/* Workload Indicator Badge */}
                <div className="mt-1 flex items-center justify-between">
                  <div
                    className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      isBurnout
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                        : inProgress >= 3
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {isBurnout ? (
                      <>
                        <Flame className="w-2.5 h-2.5" />
                        <span>{inProgress} In-Progress (BURNOUT!)</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-2.5 h-2.5" />
                        <span>{inProgress} In-Progress</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Rebalance Trigger if Burnout */}
              {isBurnout && onOpenRebalanceForUser && (
                <button
                  onClick={() => onOpenRebalanceForUser(user)}
                  title="Rebalance this user's workload with AI"
                  className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 border border-red-500/30 transition flex-shrink-0"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
