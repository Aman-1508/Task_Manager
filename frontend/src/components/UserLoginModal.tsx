import React, { useState } from 'react';
import { User, Project } from '../types';
import { X, LogIn, Shield, AlertCircle, Check } from 'lucide-react';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  currentProject: Project | null;
  onSelectUser: (user: User) => void;
  onLoginByEmail: (email: string) => Promise<void>;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  currentProject,
  onSelectUser,
  onLoginByEmail,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const getUserPermission = (userId: string) => {
    const member = currentProject?.members.find((m) => m.userId === userId);
    return member?.permission || 'MEMBER';
  };

  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'ADMIN':
        return {
          bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          label: 'Admin (Full Access)',
        };
      case 'VIEWER':
        return {
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          label: 'Viewer (Read-Only)',
        };
      case 'MEMBER':
      default:
        return {
          bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          label: 'Member (Edit Tasks)',
        };
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setError('Please enter an email address');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onLoginByEmail(emailInput.trim());
      setEmailInput('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#0F1626] border border-slate-800 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">Switch User / Login</h3>
              <p className="text-[11px] text-slate-400">
                Log in as Admin, Member, or Viewer to test permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Profile Switcher */}
        <div className="mb-5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Quick 1-Click Profile Selection
          </label>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {users.map((user) => {
              const isSelected = currentUser?.id === user.id;
              const perm = getUserPermission(user.id);
              const badge = getPermissionBadge(perm);

              return (
                <button
                  key={user.id}
                  onClick={() => {
                    onSelectUser(user);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500/60 ring-1 ring-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-700 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {user.name}
                        </span>
                        {isSelected && (
                          <span className="p-0.5 rounded-full bg-indigo-500 text-white">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{user.role}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badge.bg} flex-shrink-0 ml-2`}
                  >
                    {badge.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Or Log In by Email */}
        <div className="pt-4 border-t border-slate-800">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Or Sign In with Email
          </label>
          <form onSubmit={handleEmailSubmit} className="flex gap-2">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="e.g. sarah@taskflow.dev or your email"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Role Privileges Hint */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Role Permissions:</strong> Admin can add members &amp; rebalance. Members can create and move tasks. Viewers have read-only access.
          </span>
        </div>
      </div>
    </div>
  );
};
