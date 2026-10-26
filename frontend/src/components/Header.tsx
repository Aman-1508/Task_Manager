import React from 'react';
import { Project, User } from '../types';
import { 
  KanbanSquare, 
  Plus, 
  UserPlus, 
  Sparkles, 
  AlertTriangle,
  FolderKanban,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentProject: Project | null;
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenCreateTask: () => void;
  onOpenAddMember: () => void;
  onOpenChatbot: () => void;
  onOpenLoginModal: () => void;
  burnoutCount: number;
  currentUser: User | null;
  currentUserPermission: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export const Header: React.FC<HeaderProps> = ({
  currentProject,
  projects,
  onSelectProject,
  onOpenCreateTask,
  onOpenAddMember,
  onOpenChatbot,
  onOpenLoginModal,
  burnoutCount,
  currentUser,
  currentUserPermission,
}) => {
  const getPermissionBadge = (perm: 'ADMIN' | 'MEMBER' | 'VIEWER') => {
    switch (perm) {
      case 'ADMIN':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'VIEWER':
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
      case 'MEMBER':
      default:
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-[#0B0F19]/90 backdrop-blur sticky top-0 z-30 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <KanbanSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  TaskFlow
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Pro
                </span>
              </div>
              <p className="text-xs text-slate-400">Kanban & Workload Balancing</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden md:block" />

          {/* Project Selector */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={currentProject?.id || ''}
              onChange={(e) => {
                const proj = projects.find((p) => p.id === e.target.value);
                if (proj) onSelectProject(proj);
              }}
              className="bg-transparent border-none text-slate-200 font-medium focus:outline-none cursor-pointer text-xs"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-slate-900 text-slate-200">
                  {proj.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* User Controls and Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Burnout Alert Banner (if any) */}
          {burnoutCount > 0 && (
            <button
              onClick={onOpenChatbot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/40 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition group"
            >
              <AlertTriangle className="w-3.5 h-3.5 animate-bounce text-red-400" />
              <span>{burnoutCount} Burnout Alert{burnoutCount > 1 ? 's' : ''}!</span>
              <span className="underline opacity-80 group-hover:opacity-100 text-[11px]">Rebalance</span>
            </button>
          )}

          {/* Add User Button (Only visible for Admins) */}
          {currentUserPermission === 'ADMIN' && (
            <button
              onClick={onOpenAddMember}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-medium transition"
            >
              <UserPlus className="w-3.5 h-3.5 text-slate-400" />
              <span>Add Member</span>
            </button>
          )}

          {/* Create Task Button (Enabled for Admin and Member, disabled for Viewer) */}
          {currentUserPermission !== 'VIEWER' ? (
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/25 transition active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Task</span>
            </button>
          ) : (
            <div className="px-3 py-1 rounded-lg bg-slate-800/50 border border-slate-700/60 text-slate-400 text-[11px] font-medium flex items-center gap-1.5">
              <span>Read-Only Viewer</span>
            </div>
          )}

          {/* AI Copilot Button */}
          <button
            onClick={onOpenChatbot}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600/90 to-indigo-600/90 hover:from-violet-500 hover:to-indigo-500 border border-violet-400/30 text-white text-xs font-semibold shadow-md shadow-violet-600/20 transition active:scale-95 relative"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Copilot</span>
            {burnoutCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500 absolute -top-1 -right-1 animate-ping" />
            )}
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Logged-in User Switcher Pill */}
          {currentUser && (
            <button
              onClick={onOpenLoginModal}
              title="Click to switch active user / role"
              className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 transition group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
              <div className="text-left hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition">
                    {currentUser.name}
                  </span>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider border ${getPermissionBadge(
                      currentUserPermission
                    )}`}
                  >
                    {currentUserPermission}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition" />
            </button>
          )}

        </div>

      </div>
    </header>
  );
};
