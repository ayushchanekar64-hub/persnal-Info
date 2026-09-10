import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import RightPanel from './components/layout/RightPanel';
import StatCardsRow from './components/dashboard/StatCardsRow';
import AIDailyBrief from './components/dashboard/AIDailyBrief';
import TodayPriorities from './components/dashboard/TodayPriorities';
import GoalProgress from './components/dashboard/GoalProgress';
import LearningAndCoding from './components/dashboard/LearningAndCoding';
import AnalyticsPreview from './components/dashboard/AnalyticsPreview';
import QuickActionModal from './components/modals/QuickActionModal';
import AuthModal from './components/auth/AuthModal';
import WelcomeScreen from './components/common/WelcomeScreen';

// Secondary views
import TasksView from './components/views/TasksView';
import GoalsView from './components/views/GoalsView';
import HabitsView from './components/views/HabitsView';
import NotesView from './components/views/NotesView';
import LearningView from './components/views/LearningView';
import CodingView from './components/views/CodingView';
import CareerView from './components/views/CareerView';
import FinanceView from './components/views/FinanceView';
import AnalyticsView from './components/views/AnalyticsView';
import AIAssistantView from './components/views/AIAssistantView';
import SettingsView from './components/views/SettingsView';

import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { initialData } from './data/initialData';
import './styles/global.css';
import './styles/layout.css';
import './styles/dashboard.css';

export default function App() {
  const { user, authModalOpen, setAuthModalOpen } = useAuth();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalType, setModalType] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomeDissolving, setWelcomeDissolving] = useState(false);

  // Synchronize data-theme on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load user data from PostgreSQL / Backend API
  const loadUserData = useCallback(async () => {
    if (!user) {
      setData(initialData);
      return;
    }

    try {
      const [tasksRes, goalsRes, learningRes, codingRes, analyticsRes, activityRes, briefRes] =
        await Promise.allSettled([
          api.tasks.list(),
          api.goals.list(),
          api.learning.list(),
          api.coding.list(),
          api.analytics.getSummary(),
          api.activity.list(),
          api.ai.getDailyBrief()
        ]);

      const tasks = tasksRes.status === 'fulfilled' ? tasksRes.value.map(t => ({
        ...t,
        due: t.due_date || 'Today'
      })) : [];

      const goals = goalsRes.status === 'fulfilled' ? goalsRes.value.map(g => ({
        ...g,
        deadline: g.target_date || 'Ongoing',
        color: 'primary'
      })) : [];

      const learningItems = learningRes.status === 'fulfilled' ? learningRes.value.map(l => ({
        id: l.id,
        name: l.skill,
        skill: l.skill,
        topic: l.topic,
        hours: l.duration || `${l.total_hours || 1}h`,
        progress: l.progress || 0,
        status: l.status || 'Learning',
        level: l.status || 'Active',
        resources: l.notes || l.course || `${l.total_hours || 1}h tracked`
      })) : [];

      const learning = {
        skills: learningItems,
        weeklyHours: learningItems.reduce((acc, curr) => acc + (parseFloat(curr.hours) || 1), 0),
        streak: learningItems.length > 0 ? `${learningItems.length} days` : '0 days'
      };

      const codingItems = codingRes.status === 'fulfilled' ? codingRes.value.map(c => ({
        id: c.id,
        title: c.title,
        platform: c.platform,
        difficulty: c.difficulty,
        status: c.status,
        topic: c.topic || 'General',
        solved: c.status === 'Solved' || c.status === 'Mastered',
        time_taken: c.time_taken,
        attempts: c.attempts,
        solution_notes: c.solution_notes,
        mistake_learning: c.mistake_learning,
        tags: [c.platform || 'LeetCode']
      })) : [];

      const coding = {
        problems: codingItems,
        solvedTotal: codingItems.filter(c => c.solved).length,
        thisWeek: codingItems.length,
        streakDays: codingItems.length > 0 ? 1 : 0,
        topics: Array.from(new Set(codingItems.map(c => c.topic).filter(Boolean))).map(t => ({
          name: t,
          count: codingItems.filter(c => c.topic === t).length,
          color: 'var(--primary-600)'
        }))
      };

      const summary = analyticsRes.status === 'fulfilled' ? analyticsRes.value : null;
      const stats = summary?.stats || {
        tasksTotal: tasks.length,
        tasksCompleted: tasks.filter(t => t.completed).length,
        activeGoals: goals.length,
        learningHours: learning.weeklyHours,
        codingSolved: coding.solvedTotal,
        focusHours: 0
      };

      const weeklyAnalytics = summary?.weeklyAnalytics || initialData.weeklyAnalytics;

      const recentActivity = activityRes.status === 'fulfilled' ? activityRes.value.map(a => ({
        id: `act-${a.id}`,
        type: a.entity_type,
        title: a.action,
        time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        color: a.entity_type === 'goal' ? 'var(--accent-600)' : 'var(--primary-600)'
      })) : [];

      const aiBrief = briefRes.status === 'fulfilled' ? briefRes.value : initialData.aiBrief;

      setData({
        user,
        stats,
        tasks,
        goals,
        learning,
        coding,
        weeklyAnalytics,
        upcoming: tasks.filter(t => !t.completed).map(t => ({
          id: t.id,
          title: t.title,
          type: t.category,
          date: t.due,
          priority: t.priority
        })),
        recentActivity,
        aiBrief
      });
    } catch (err) {
      console.error('Failed to load user workspace data:', err);
    }
  }, [user]);

  // Re-fetch on user login/logout
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Handle task completion toggle with backend persistence
  const handleToggleTask = async (taskId) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Optimistic UI update
    setData((prev) => {
      const task = prev.tasks.find((t) => t.id === taskId);
      if (!task) return prev;
      const isNowCompleted = !task.completed;
      const updatedTasks = prev.tasks.map((t) =>
        t.id === taskId ? { ...t, completed: isNowCompleted } : t
      );
      return {
        ...prev,
        tasks: updatedTasks,
        stats: {
          ...prev.stats,
          tasksCompleted: isNowCompleted ? prev.stats.tasksCompleted + 1 : Math.max(0, prev.stats.tasksCompleted - 1)
        }
      };
    });

    try {
      await api.tasks.toggle(taskId);
      loadUserData();
    } catch (err) {
      console.error('Failed to toggle task:', err);
      loadUserData();
    }
  };

  // Add task handler with backend persistence
  const handleAddTask = async (newTask) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await api.tasks.create({
        title: newTask.title,
        description: newTask.description || undefined,
        category: newTask.category || 'Engineering',
        priority: newTask.priority || 'High',
        status: newTask.status || 'To Do',
        due_date: newTask.due_date || newTask.due || undefined,
        due_time: newTask.due_time || undefined,
        estimated_time: newTask.estimated_time || undefined,
        goal_id: newTask.goal_id || undefined,
        tags: newTask.tags || undefined
      });

      await loadUserData();
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Add goal handler with backend persistence
  const handleAddGoal = async (newGoal) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await api.goals.create({
        name: newGoal.name,
        description: newGoal.description || undefined,
        category: newGoal.category || 'Career',
        priority: newGoal.priority || 'High',
        start_date: newGoal.start_date || undefined,
        target_date: newGoal.target_date || newGoal.deadline || undefined,
        progress: Number(newGoal.progress) || 0,
        status: newGoal.status || 'In Progress'
      });

      await loadUserData();
    } catch (err) {
      console.error('Failed to create goal:', err);
    }
  };

  // Add learning session handler with backend persistence
  const handleAddLearning = async (newLearning) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await api.learning.create({
        skill: newLearning.skill,
        topic: newLearning.topic || undefined,
        course: newLearning.course || undefined,
        category: newLearning.category || 'Technical',
        learning_date: newLearning.learning_date || undefined,
        duration: newLearning.duration || undefined,
        status: newLearning.status || 'Learning',
        progress: Number(newLearning.progress) || 0,
        notes: newLearning.notes || undefined
      });

      await loadUserData();
    } catch (err) {
      console.error('Failed to log learning session:', err);
    }
  };

  // Add coding problem handler with backend persistence
  const handleAddCoding = async (newCoding) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      await api.coding.create({
        title: newCoding.title,
        platform: newCoding.platform || 'LeetCode',
        problem_url: newCoding.problem_url || undefined,
        topic: newCoding.topic || 'General',
        difficulty: newCoding.difficulty || 'Medium',
        status: newCoding.status || 'Solved',
        programming_language: newCoding.programming_language || 'Python',
        time_taken: newCoding.time_taken || undefined,
        attempts: Number(newCoding.attempts) || 1,
        solution_notes: newCoding.solution_notes || undefined,
        mistake_learning: newCoding.mistake_learning || undefined
      });

      await loadUserData();
    } catch (err) {
      console.error('Failed to log coding problem:', err);
    }
  };

  // Add activity log handler
  const handleAddActivity = (newAct) => {
    setData((prev) => ({
      ...prev,
      recentActivity: [newAct, ...prev.recentActivity.slice(0, 5)]
    }));
  };

  const pendingTaskCount = data.tasks.filter((t) => !t.completed).length;

  return (
    <div className={`app-container ${welcomeDissolving ? 'app-revealing' : ''}`}>
      {/* CINEMATIC STARTUP / WELCOME SCREEN */}
      {showWelcome && (
        <WelcomeScreen
          user={user}
          onTransitionStart={() => setWelcomeDissolving(true)}
          onFinish={() => setShowWelcome(false)}
        />
      )}

      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        taskCount={pendingTaskCount}
      />

      {/* MAIN WRAPPER */}
      <div className="main-wrapper">
        {/* 2. TOP HEADER */}
        <Header
          theme={theme}
          setTheme={setTheme}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenQuickAction={(type) => setModalType(type)}
        />

        {/* 3. CONTENT & OPTIONAL RIGHT PANEL */}
        <div className="content-layout">
          {/* Main Content Area */}
          <main className="dashboard-center">
            {activeTab === 'dashboard' && (
              <>
                {/* Statistics Row */}
                <StatCardsRow stats={data.stats} tasks={data.tasks} />

                {/* AI Daily Brief */}
                <AIDailyBrief
                  aiBrief={data.aiBrief}
                  tasks={data.tasks}
                  goals={data.goals}
                />

                {/* Today's Priorities & Goals Progress */}
                <div className="dashboard-split-row">
                  <TodayPriorities
                    tasks={data.tasks}
                    onToggleTask={handleToggleTask}
                    onOpenQuickAction={(type) => setModalType(type)}
                  />
                  <GoalProgress
                    goals={data.goals}
                    onOpenQuickAction={(type) => setModalType(type)}
                  />
                </div>

                {/* Learning & Coding Modules */}
                <LearningAndCoding
                  learning={data.learning}
                  coding={data.coding}
                  onOpenQuickAction={(type) => setModalType(type)}
                />

                {/* Compact Analytics Preview */}
                <AnalyticsPreview weeklyData={data.weeklyAnalytics} />
              </>
            )}

            {/* Individual Section Views */}
            {activeTab === 'tasks' && (
              <TasksView
                tasks={data.tasks}
                onToggleTask={handleToggleTask}
                onOpenQuickAction={(type) => setModalType(type)}
              />
            )}

            {activeTab === 'goals' && (
              <GoalsView
                goals={data.goals}
                onOpenQuickAction={(type) => setModalType(type)}
              />
            )}

            {activeTab === 'habits' && <HabitsView />}

            {activeTab === 'notes' && (
              <NotesView onOpenQuickAction={(type) => setModalType(type)} />
            )}

            {activeTab === 'learning' && (
              <LearningView
                learning={data.learning}
                onOpenQuickAction={(type) => setModalType(type)}
              />
            )}

            {activeTab === 'coding' && (
              <CodingView
                coding={data.coding}
                onOpenQuickAction={(type) => setModalType(type)}
              />
            )}

            {activeTab === 'career' && <CareerView />}

            {activeTab === 'finance' && <FinanceView />}

            {activeTab === 'analytics' && (
              <AnalyticsView weeklyData={data.weeklyAnalytics} />
            )}

            {activeTab === 'ai-assistant' && (
              <AIAssistantView
                user={user}
                tasks={data.tasks}
                goals={data.goals}
                stats={data.stats}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                user={user}
                theme={theme}
                setTheme={setTheme}
              />
            )}
          </main>

          {/* 4. OPTIONAL RIGHT-SIDE INFORMATION PANEL (Visible on Dashboard on Desktop) */}
          {activeTab === 'dashboard' && (
            <RightPanel
              upcoming={data.upcoming}
              recentActivity={data.recentActivity}
              onOpenQuickAction={(type) => setModalType(type)}
              onCompleteTask={handleToggleTask}
            />
          )}
        </div>
      </div>

      {/* QUICK ACTION MODAL */}
      <QuickActionModal
        isOpen={!!modalType}
        type={modalType}
        onClose={() => setModalType(null)}
        onAddTask={handleAddTask}
        onAddGoal={handleAddGoal}
        onAddLearning={handleAddLearning}
        onAddCoding={handleAddCoding}
        onAddActivity={handleAddActivity}
        goals={data.goals}
      />

      {/* USER AUTHENTICATION MODAL */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
