# TaskFlow — Kanban Board & Workload Balancing App

> A streamlined task management application with Kanban-style organization for personal or team productivity, featuring **Workload Balancing Burnout Alerts** and an **AI Copilot** for task decomposition and team rebalancing.

---

## 🚀 Key Features

### 1. Frontend UI & User Interaction
* **Three-Column Kanban Board**: Organized into `To-Do`, `In Progress`, and `Done` columns with smooth drag-and-drop capability powered by `@hello-pangea/dnd`.
* **Rich Task Cards**:
  * **Priority Tags**: Distinct visual tags (`URGENT`, `HIGH`, `MEDIUM`, `LOW`).
  * **Due Dates**: Formatted badges with calendar icons, highlighting overdue or today's items.
  * **Descriptions & Assignees**: Displaying team member avatars, names, and task descriptions.
* **User Controls**:
  * **Create Tasks**: Modal with title, description, priority, column status, due date, and team assignee.
  * **Add Users / Project Members**: Modal to invite team members with specific roles and project permissions (`ADMIN`, `MEMBER`, `VIEWER`).
  * **Priority & Search Filters**: One-click toggles to filter tasks by `URGENT`, `HIGH`, `MEDIUM`, `LOW`, or `ALL`, plus real-time text search.

---

### 2. Backend Logic & Relational Data Management
* **Custom CRUD API**: Built with Node.js and Express (TypeScript / ESM), managing task states, column ordering, and user associations.
* **Relational PostgreSQL & Prisma ORM**:
  * Hierarchical schema: **Projects** ➔ **Tasks** (with self-referencing subtasks support).
  * **User Permissions & Memberships**: Many-to-many relationship tracking permissions (`ADMIN`, `MEMBER`, `VIEWER`) across projects.

---

### 3. The Vibe Check: "Workload Balancing"
* **Column Task Counters**: Real-time counter badge on each column header indicating the exact number of active tasks (e.g. `To-Do (4)`, `In Progress (8)`, `Done (3)`).
* **Burnout Warning Avatar (Red Pulse)**:
  * If any user has **more than 5 tasks in "In Progress"**, the background and border of their avatar in the Team Workload list **pulses red** (`avatar-burnout-pulse` animation) to warn of potential burnout.
  * Includes a warning indicator badge: `🔥 6 in Progress (BURNOUT DANGER!)`.
  * Dynamic: As tasks are dragged into or out of "In Progress", or reassigned, the red pulse dynamically starts or stops in real-time.

---

### 4. Extra Features: AI Copilot Capabilities
* **Feature 1: Burnout Prevention & Smart Workload Rebalancing Copilot**:
  * Detects when a team member hits >5 in-progress tasks.
  * Suggests which tasks should be transferred and selects the most available team members.
  * Includes a **1-Click "Execute Workload Rebalancing"** action button in chat that immediately transfers tasks in PostgreSQL and normalizes the team avatar pulses.
* **Feature 2: AI Task Breakdown & Auto-Estimator Assistant**:
  * Users can input high-level feature requirements (e.g., *"Break down Stripe Payment Checkout"*).
  * The copilot decomposes the feature into 4 structured subtasks with estimated priorities (`High`, `Medium`, `Low`), due dates, and suggested assignees.
  * Includes a **1-Click "Add All Tasks to To-Do Board"** action button that directly creates the tasks in PostgreSQL.
* **Standup Copilot & Natural Language Queries**:
  * Type *"Give me a standup summary"* or *"Show urgent tasks"* to get executive overviews of sprint progress and blockers.

---

## 🛠️ Tech Stack Architecture

* **Frontend**: React 18, Vite, Tailwind CSS, `@hello-pangea/dnd`, `lucide-react`, `canvas-confetti`.
* **Backend**: Node.js, Express, TypeScript, Prisma ORM.
* **Database**: PostgreSQL 16 (Docker Compose container running on port `5433`).

---

## ⚡ Quick Start Guide

### Step 1: Start PostgreSQL Container
Make sure Docker Desktop is running, then run:
```bash
docker compose up -d
```
*(PostgreSQL will run on port `5433` with user `taskuser`, password `taskpassword`, database `taskflow_db`)*.

### Step 2: Initialize & Seed Database
In the `backend` folder:
```bash
cd backend
npm run db:push
npm run db:seed
```

### Step 3: Start the Backend API Server
In the `backend` folder:
```bash
npm run dev
```
*(Backend runs on `http://localhost:5001`)*

### Step 4: Start the Frontend UI
In a new terminal, in the `frontend` folder:
```bash
cd frontend
npm run dev
```
*(Frontend runs on `http://localhost:3000`)*

Or simply double-click `start.bat` on Windows!

---

## 🧪 Testing the "Vibe Check" Burnout Red Pulse
1. Open `http://localhost:3000`.
2. Look at the **Team Workload & Burnout Monitor** at the top.
3. Observe **David Kim**: His avatar background is **intensely pulsing red** because he is seeded with 6 active tasks in "In Progress".
4. Open the **AI Copilot** (click the glowing purple button in header or the red alert banner).
5. Click **"Execute Workload Rebalancing Now"** in the chat drawer.
6. Watch 2 of David's tasks get transferred to Alex and Liam, David's count drops to 4, and his avatar stops pulsing red!
