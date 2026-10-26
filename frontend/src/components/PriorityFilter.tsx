import React from 'react';
import { Filter, Flame, ArrowUp, Minus, ArrowDown, Search } from 'lucide-react';

interface PriorityFilterProps {
  selectedPriority: string;
  onSelectPriority: (priority: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  priorityCounts: {
    ALL: number;
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    URGENT: number;
  };
}

export const PriorityFilter: React.FC<PriorityFilterProps> = ({
  selectedPriority,
  onSelectPriority,
  searchQuery,
  onSearchChange,
  priorityCounts,
}) => {
  const filters: Array<{
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    count: number;
  }> = [
    { id: 'ALL', label: 'All Tasks', icon: Filter, color: 'text-slate-400', count: priorityCounts.ALL },
    { id: 'URGENT', label: 'Urgent', icon: Flame, color: 'text-rose-400', count: priorityCounts.URGENT },
    { id: 'HIGH', label: 'High', icon: ArrowUp, color: 'text-amber-400', count: priorityCounts.HIGH },
    { id: 'MEDIUM', label: 'Medium', icon: Minus, color: 'text-sky-400', count: priorityCounts.MEDIUM },
    { id: 'LOW', label: 'Low', icon: ArrowDown, color: 'text-emerald-400', count: priorityCounts.LOW },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#0F1626]/60 border border-slate-800/80 rounded-xl p-2.5">
      {/* Priority Filter Buttons */}
      <div className="flex items-center flex-wrap gap-1.5">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1 pl-1">
          <Filter className="w-3.5 h-3.5" /> Filter:
        </span>
        {filters.map((f) => {
          const isSelected = selectedPriority === f.id;
          const Icon = f.icon;

          return (
            <button
              key={f.id}
              onClick={() => onSelectPriority(f.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800'
              }`}
            >
              <Icon className={`w-3 h-3 ${isSelected ? 'text-white' : f.color}`} />
              <span>{f.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Search Bar */}
      <div className="relative min-w-[200px]">
        <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search task title..."
          className="w-full bg-slate-900/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
        />
      </div>
    </div>
  );
};
