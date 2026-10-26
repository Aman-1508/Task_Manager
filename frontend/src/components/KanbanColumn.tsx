import React from 'react';
import { Task, TaskStatus } from '../types';
import { Droppable } from '@hello-pangea/dnd';
import { TaskCard } from './TaskCard';
import { Plus, CheckCircle2, Clock, ListTodo } from 'lucide-react';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  id,
  title,
  tasks,
  onDeleteTask,
  onQuickAddTask,
}) => {
  const getColumnStyle = (colId: TaskStatus) => {
    switch (colId) {
      case 'TODO':
        return {
          icon: <ListTodo className="w-4 h-4 text-indigo-400" />,
          badgeBg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          dot: 'bg-indigo-400',
          borderHover: 'hover:border-indigo-500/40',
        };
      case 'IN_PROGRESS':
        return {
          icon: <Clock className="w-4 h-4 text-amber-400" />,
          badgeBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          dot: 'bg-amber-400',
          borderHover: 'hover:border-amber-500/40',
        };
      case 'DONE':
        return {
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          badgeBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          dot: 'bg-emerald-400',
          borderHover: 'hover:border-emerald-500/40',
        };
    }
  };

  const style = getColumnStyle(id);

  return (
    <div className={`flex flex-col flex-1 min-w-[300px] max-w-[420px] bg-[#0D1322]/80 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur shadow-sm transition-all ${style.borderHover}`}>
      
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {style.icon}
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            {title}
          </h3>
          
          {/* Column Task Counter Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${style.badgeBg}`}
            title={`${tasks.length} tasks in ${title}`}
          >
            {tasks.length}
          </span>
        </div>

        {/* Quick Add Button */}
        <button
          onClick={() => onQuickAddTask(id)}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Droppable Card List */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 overflow-y-auto pr-1 min-h-[380px] rounded-xl transition-colors duration-200 ${
              snapshot.isDraggingOver ? 'bg-indigo-950/20 ring-2 ring-indigo-500/30' : ''
            }`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}

            {tasks.length === 0 && (
              <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/80 rounded-xl text-slate-500 text-xs text-center p-4">
                <span className="text-slate-600 mb-1">No tasks here</span>
                <button
                  onClick={() => onQuickAddTask(id)}
                  className="text-indigo-400 hover:underline text-[11px] font-medium"
                >
                  + Create first task
                </button>
              </div>
            )}
          </div>
        )}
      </Droppable>

    </div>
  );
};
