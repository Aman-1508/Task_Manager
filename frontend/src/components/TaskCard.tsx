import React from 'react';
import { Task } from '../types';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Trash2, Flame, ArrowUp, Minus, ArrowDown, UserCircle } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  index: number;
  onDelete: (id: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, index, onDelete }) => {
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return {
          bg: 'bg-rose-500/15 border-rose-500/30 text-rose-300',
          icon: <Flame className="w-3 h-3 text-rose-400" />,
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
          icon: <ArrowUp className="w-3 h-3 text-amber-400" />,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
          icon: <Minus className="w-3 h-3 text-sky-400" />,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
          icon: <ArrowDown className="w-3 h-3 text-emerald-400" />,
        };
    }
  };

  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now && date.toDateString() !== now.toDateString();
    const isToday = date.toDateString() === now.toDateString();

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return {
      text: isToday ? 'Today' : formatted,
      isOverdue,
    };
  };

  const priorityStyle = getPriorityBadge(task.priority);
  const dueInfo = formatDueDate(task.dueDate);

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-[#131B2E]/95 border rounded-xl p-3.5 mb-2.5 transition-all duration-200 select-none ${
            snapshot.isDragging
              ? 'border-indigo-500 shadow-2xl shadow-indigo-500/30 scale-[1.02] rotate-1 z-50 ring-2 ring-indigo-500/40'
              : 'border-slate-800/90 hover:border-slate-700 hover:shadow-md hover:shadow-black/40'
          }`}
        >
          {/* Top row: Priority Badge + Delete Button */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${priorityStyle.bg}`}
            >
              {priorityStyle.icon}
              <span>{task.priority}</span>
            </span>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete task "${task.title}"?`)) {
                  onDelete(task.id);
                }
              }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Task Title */}
          <h4 className="text-xs font-semibold text-slate-100 leading-snug line-clamp-2 mb-1.5 group-hover:text-indigo-200 transition">
            {task.title}
          </h4>

          {/* Task Description */}
          {task.description && (
            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
              {task.description}
            </p>
          )}

          {/* Bottom row: Due Date + Assignee */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
            {/* Due Date */}
            {dueInfo ? (
              <div
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${
                  dueInfo.isOverdue
                    ? 'text-rose-400 bg-rose-500/10 font-semibold'
                    : 'text-slate-400 bg-slate-800/50'
                }`}
                title={`Due date: ${task.dueDate}`}
              >
                <Calendar className="w-3 h-3" />
                <span className="text-[10px]">{dueInfo.text}</span>
              </div>
            ) : (
              <span />
            )}

            {/* Assignee Avatar */}
            {task.assignedUser ? (
              <div
                className="flex items-center gap-1.5 pl-1.5"
                title={`Assigned to: ${task.assignedUser.name} (${task.assignedUser.role})`}
              >
                <img
                  src={task.assignedUser.avatar}
                  alt={task.assignedUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-slate-700"
                />
                <span className="text-[10px] font-medium text-slate-300 max-w-[80px] truncate hidden sm:inline">
                  {task.assignedUser.name.split(' ')[0]}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-slate-500 text-[10px]">
                <UserCircle className="w-3.5 h-3.5" />
                <span>Unassigned</span>
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
