import React from 'react';
import { Task, TaskStatus } from '../types';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { KanbanColumn } from './KanbanColumn';
import confetti from 'canvas-confetti';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskMoved: (taskId: string, newStatus: TaskStatus, newOrder: number, reorderedIds: string[]) => void;
  onDeleteTask: (id: string) => void;
  onQuickAddTask: (status: TaskStatus) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onTaskMoved,
  onDeleteTask,
  onQuickAddTask,
}) => {
  const columns: Array<{ id: TaskStatus; title: string }> = [
    { id: 'TODO', title: 'To-Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' },
  ];

  const handleDragEnd = (result: DropResult) => {
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
              onDeleteTask={onDeleteTask}
              onQuickAddTask={onQuickAddTask}
            />
          );
        })}
      </div>
    </DragDropContext>
  );
};
