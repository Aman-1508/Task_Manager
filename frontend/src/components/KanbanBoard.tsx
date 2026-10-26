import React from 'react';
import { Task, TaskStatus } from '../types';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import confetti from 'canvas-confetti';
import { Eye } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMoved: (taskId: string, newStatus: TaskStatus, newOrder: number, reorderedIds: string[]) => void;
  onDeleteTask: (id: string) => void;
  onQuickAddTask: (status: TaskStatus) => void;
  currentUserPermission?: 'ADMIN' | 'MEMBER' | 'VIEWER';
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskMoved,
  onDeleteTask,
  onQuickAddTask,
  currentUserPermission = 'ADMIN',
}) => {
  const isViewer = currentUserPermission === 'VIEWER';

  const columns: Array<{ id: TaskStatus; title: string }> = [
    { id: 'TODO', title: 'To-Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' },
  ];

  const handleDragEnd = (result: DropResult) => {
    if (isViewer) {
      alert('You are currently viewing in Read-Only mode (Viewer role). Log in as Admin or Member to move tasks.');
      return;
    }

    const { source, destination, draggableId } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    // Filter tasks in destination column
    const destTasks = tasks.filter((t) => t.status === destStatus && t.id !== draggableId);

    // Insert task into destination array at destination.index
    const movedTask = tasks.find((t) => t.id === draggableId);
    if (!movedTask) return;

    const newDestTasks = [...destTasks];
    newDestTasks.splice(destination.index, 0, { ...movedTask, status: destStatus });

    const reorderedIds = newDestTasks.map((t) => t.id);

    // If moved to DONE, fire celebratory confetti
    if (destStatus === 'DONE' && sourceStatus !== 'DONE') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10B981', '#6366F1', '#F59E0B'],
        });
      } catch (e) {
        // Safe fallback
      }
    }

    onTaskMoved(draggableId, destStatus, destination.index, reorderedIds);
  };

  return (
    <div className="space-y-3">
      {isViewer && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs">
          <Eye className="w-4 h-4 text-sky-400 flex-shrink-0" />
          <span>
            <strong>Viewer Mode:</strong> You are browsing with read-only permissions. Drag-and-drop and task deletions are locked. Use the profile switcher in the top right to switch to an Admin or Member.
          </span>
        </div>
      )}

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row items-stretch gap-5 overflow-x-auto pb-4">
          {columns.map((col) => {
            const colTasks = tasks
              .filter((t) => t.status === col.id)
              .sort((a, b) => a.order - b.order);

            return (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                tasks={colTasks}
                onDeleteTask={isViewer ? () => alert('Viewers cannot delete tasks.') : onDeleteTask}
                onQuickAddTask={onQuickAddTask}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
