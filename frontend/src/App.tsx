import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, User, TaskStatus, TaskPriority } from './types';
import { api } from './api';
import { Header } from './components/Header';
import { TeamWorkloadList } from './components/TeamWorkloadList';
import { PriorityFilter } from './components/PriorityFilter';
import { KanbanBoard } from './components/KanbanBoard';
import { CreateTaskModal } from './components/CreateTaskModal';
import { AddUserModal } from './components/AddUserModal';
import { UserLoginModal } from './components/UserLoginModal';
import { ChatbotDrawer } from './components/ChatbotDrawer';
import { Loader2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active User & Permissions
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [defaultTaskStatus, setDefaultTaskStatus] = useState<TaskStatus>('TODO');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotInitialPrompt, setChatbotInitialPrompt] = useState<string | null>(null);

  // Calculate current user permission in active project
  const currentUserPermission: 'ADMIN' | 'MEMBER' | 'VIEWER' = useMemo(() => {
    if (!currentUser || !currentProject) return 'ADMIN';
    const member = currentProject.members.find((m) => m.userId === currentUser.id);
    return member?.permission || 'MEMBER';
  }, [currentUser, currentProject]);

  // Initial load
  const loadData = async (targetProjectId?: string) => {
    try {
      setError(null);
      const projList = await api.getProjects();
      setProjects(projList);

      const activeProj = targetProjectId
        ? projList.find((p) => p.id === targetProjectId) || projList[0]
        : currentProject || projList[0] || null;

      setCurrentProject(activeProj);

      if (activeProj) {
        const [taskList, userList] = await Promise.all([
          api.getTasks(activeProj.id),
          api.getUsers(activeProj.id),
        ]);
        setTasks(taskList);
        setUsers(userList);

        // Setup active logged in user
        const storedUserId = localStorage.getItem('taskflow_user_id');
        const foundUser = userList.find((u) => u.id === storedUserId);
        if (foundUser) {
          setCurrentUser(foundUser);
        } else if (!currentUser && userList.length > 0) {
          // Default to Alex (or first user)
          setCurrentUser(userList[0]);
          localStorage.setItem('taskflow_user_id', userList[0].id);
        }
      }
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setError(err.message || 'Could not load data from backend server');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // When currentProject changes
  const handleSelectProject = async (project: Project) => {
    setCurrentProject(project);
    setIsLoading(true);
    try {
      const [taskList, userList] = await Promise.all([
        api.getTasks(project.id),
        api.getUsers(project.id),
      ]);
      setTasks(taskList);
      setUsers(userList);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch User Profile
  const handleSelectUser = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('taskflow_user_id', user.id);
  };

  // Login by Email
  const handleLoginByEmail = async (email: string) => {
    const loggedUser = await api.loginUser({ email });
    const fullUser = users.find((u) => u.id === loggedUser.id) || {
      id: loggedUser.id,
      name: loggedUser.name,
      email: loggedUser.email,
      avatar: loggedUser.avatar,
      role: loggedUser.role,
      inProgressCount: loggedUser.inProgressCount,
    };
    setCurrentUser(fullUser);
    localStorage.setItem('taskflow_user_id', fullUser.id);
  };

  // Drag and Drop movement
  const handleTaskMoved = async (
    taskId: string,
    newStatus: TaskStatus,
    newOrder: number,
    reorderedIds: string[]
  ) => {
    if (currentUserPermission === 'VIEWER') {
      alert('Viewers have read-only access. You cannot move tasks.');
      return;
    }

    // 1. Optimistic update
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId);
      if (!target) return prev;
      const updatedTarget = { ...target, status: newStatus, order: newOrder };
      const rest = prev.filter((t) => t.id !== taskId);
      return [...rest, updatedTarget];
    });

    try {
      // 2. Persist to PostgreSQL backend
      await api.batchMoveTask(taskId, newStatus, newOrder, reorderedIds);

      // 3. Refresh user workload to dynamically update red avatar pulse
      if (currentProject) {
        const updatedUsers = await api.getUsers(currentProject.id);
        setUsers(updatedUsers);
      }
    } catch (err) {
      console.error('Failed to persist task move:', err);
      if (currentProject) {
        const freshTasks = await api.getTasks(currentProject.id);
        setTasks(freshTasks);
      }
    }
  };

  // Delete Task
  const handleDeleteTask = async (taskId: string) => {
    if (currentUserPermission === 'VIEWER') {
      alert('Viewers have read-only access. You cannot delete tasks.');
      return;
    }

    try {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await api.deleteTask(taskId);
      if (currentProject) {
        const updatedUsers = await api.getUsers(currentProject.id);
        setUsers(updatedUsers);
      }
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Create Task
  const handleCreateTask = async (data: {
    title: string;
    description?: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    assignedUserId?: string;
  }) => {
    if (!currentProject) return;
    const newTask = await api.createTask({
      ...data,
      projectId: currentProject.id,
      assignedUserId: data.assignedUserId || currentUser?.id,
    });
    setTasks((prev) => [newTask, ...prev]);
    const updatedUsers = await api.getUsers(currentProject.id);
    setUsers(updatedUsers);
  };

  // Add Member
  const handleAddMember = async (data: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
    permission: 'ADMIN' | 'MEMBER' | 'VIEWER';
  }) => {
    if (!currentProject) return;
    const newUser = await api.createUser({
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      role: data.role,
    });
    await api.addProjectMember(currentProject.id, newUser.id, data.permission);
    await loadData(currentProject.id);
  };

  // Open quick add for a specific column
  const handleQuickAddTask = (status: TaskStatus) => {
    if (currentUserPermission === 'VIEWER') {
      alert('Viewers cannot create tasks. Please switch to an Admin or Member account.');
      return;
    }
    setDefaultTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  // Burnout count calculation
  const burnoutUsers = users.filter((u) => (u.inProgressCount || 0) > 5);

  // Filter tasks by priority and search
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      selectedPriority === 'ALL' || task.priority === selectedPriority;
    const matchesSearch =
      searchQuery.trim() === '' ||
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesPriority && matchesSearch;
  });

  // Calculate priority counts
  const priorityCounts = {
    ALL: tasks.length,
    URGENT: tasks.filter((t) => t.priority === 'URGENT').length,
    HIGH: tasks.filter((t) => t.priority === 'HIGH').length,
    MEDIUM: tasks.filter((t) => t.priority === 'MEDIUM').length,
    LOW: tasks.filter((t) => t.priority === 'LOW').length,
  };

  if (isLoading && !currentProject) {
    return (
      <div className="min-h-screen bg-[#080C15] flex flex-col items-center justify-center gap-3 text-slate-300">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <p className="text-sm font-semibold tracking-wide">Connecting to TaskFlow PostgreSQL...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080C15]">
      {/* Header with User Login / Switcher Profile */}
      <Header
        currentProject={currentProject}
        projects={projects}
        onSelectProject={handleSelectProject}
        onOpenCreateTask={() => {
          setDefaultTaskStatus('TODO');
          setIsCreateTaskOpen(true);
        }}
        onOpenAddMember={() => setIsAddMemberOpen(true)}
        onOpenChatbot={() => {
          setChatbotInitialPrompt(null);
          setIsChatbotOpen(true);
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        burnoutCount={burnoutUsers.length}
        currentUser={currentUser}
        currentUserPermission={currentUserPermission}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6 space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs font-semibold">{error}</span>
            </div>
            <button
              onClick={() => loadData()}
              className="text-xs font-bold underline hover:text-red-200"
            >
              Retry
            </button>
          </div>
        )}

        {/* 1. The Vibe Check: Team Workload & Burnout Monitor */}
        <TeamWorkloadList
          users={users}
          onOpenRebalanceForUser={(user) => {
            setChatbotInitialPrompt(`Rebalance workload for ${user.name}`);
            setIsChatbotOpen(true);
          }}
        />

        {/* 2. Priority Filter & Search Controls */}
        <PriorityFilter
          selectedPriority={selectedPriority}
          onSelectPriority={setSelectedPriority}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          priorityCounts={priorityCounts}
        />

        {/* 3. Three-Column Kanban Board with Drag & Drop */}
        <KanbanBoard
          tasks={filteredTasks}
          onTaskMoved={handleTaskMoved}
          onDeleteTask={handleDeleteTask}
          onQuickAddTask={handleQuickAddTask}
          currentUserPermission={currentUserPermission}
        />
      </main>

      {/* Modals & Drawers */}
      <CreateTaskModal
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onSubmit={handleCreateTask}
        users={users}
        defaultStatus={defaultTaskStatus}
      />

      <AddUserModal
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onAddUser={handleAddMember}
        currentProject={currentProject}
      />

      <UserLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        users={users}
        currentUser={currentUser}
        currentProject={currentProject}
        onSelectUser={handleSelectUser}
        onLoginByEmail={handleLoginByEmail}
      />

      <ChatbotDrawer
        isOpen={isChatbotOpen}
        onClose={() => {
          setIsChatbotOpen(false);
          setChatbotInitialPrompt(null);
        }}
        currentProject={currentProject}
        onRefreshData={() => loadData(currentProject?.id)}
        initialPrompt={chatbotInitialPrompt}
      />
    </div>
  );
};

export default App;
