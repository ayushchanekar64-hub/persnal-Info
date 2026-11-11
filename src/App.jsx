import React, { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import ExecutiveSummaryBar from './components/dashboard/ExecutiveSummaryBar';
import StatCardsRow from './components/dashboard/StatCardsRow';
import LearningAndCoding from './components/dashboard/LearningAndCoding';
import AnalyticsPreview from './components/dashboard/AnalyticsPreview';
import WelcomeScreen from './components/common/WelcomeScreen';
import MobileBottomNav from './components/layout/MobileBottomNav';
import { Sparkles, CheckCircle2 } from 'lucide-react';

// Lazy-loaded secondary views, creation screens & overlays for fast initial startup
const CreateScreen = lazy(() => import('./components/create/CreateScreen'));
const AuthPage = lazy(() => import('./components/auth/AuthPage'));
const ConfigureRecoveryPinModal = lazy(() => import('./components/auth/ConfigureRecoveryPinModal'));
const TasksView = lazy(() => import('./components/views/TasksView'));
const GoalsView = lazy(() => import('./components/views/GoalsView'));
const HabitsView = lazy(() => import('./components/views/HabitsView'));
const NotesView = lazy(() => import('./components/views/NotesView'));
const LearningView = lazy(() => import('./components/views/LearningView'));
const CodingView = lazy(() => import('./components/views/CodingView'));
const CareerView = lazy(() => import('./components/views/CareerView'));
const FinanceView = lazy(() => import('./components/views/FinanceView'));
const AnalyticsView = lazy(() => import('./components/views/AnalyticsView'));
const AIAssistantView = lazy(() => import('./components/views/AIAssistantView'));
const SettingsView = lazy(() => import('./components/views/SettingsView'));
const ProfileView = lazy(() => import('./components/views/ProfileView'));
const FamilyView = lazy(() => import('./components/views/FamilyView'));
const QuickCaptureHUD = lazy(() => import('./components/inbox/QuickCaptureHUD'));
const InboxTriageModal = lazy(() => import('./components/inbox/InboxTriageModal'));

function ViewLoadingFallback() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '260px', color: 'var(--text-tertiary)', fontSize: '0.88rem', gap: '0.6rem' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid rgba(139, 92, 246, 0.25)', borderTopColor: '#8B5CF6', animation: 'dashboardSpin 0.75s linear infinite' }} />
      <span>Loading workspace view...</span>
    </div>
  );
}

import { useAuth } from './context/AuthContext';
import { api } from './services/api';
import { initialData } from './data/initialData';
import './styles/global.css';
import './styles/layout.css';
import './styles/dashboard.css';
import './styles/inbox.css';

export default function App() {
  const { user, loading: authLoading, authScreen, setAuthScreen, openAuth, closeAuth } = useAuth();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mindos_theme') || localStorage.getItem('ayora_theme') || localStorage.getItem('mynexus_theme') || 'dark';
  });
  const [createScreen, setCreateScreen] = useState(null); // { type, returnTab, initialData }
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return sessionStorage.getItem('mindos_welcomed') !== '1';
    } catch {
      return false;
    }
  });
  const [welcomeDissolving, setWelcomeDissolving] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [showPinPrompt, setShowPinPrompt] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHudOpen, setIsHudOpen] = useState(false);
  const [isTriageOpen, setIsTriageOpen] = useState(false);
  const [inboxToast, setInboxToast] = useState(null);
  const userRef = useRef(user);
  userRef.current = user;

  // Frictionless Global Hotkey Listener: Alt + C or Ctrl + Space
  useEffect(() => {
    const handleGlobalShortcuts = (e) => {
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsHudOpen((prev) => !prev);
      }
      if (e.ctrlKey && e.code === 'Space') {
        const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);
        if (!isInput) {
          e.preventDefault();
          setIsHudOpen((prev) => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalShortcuts);
    return () => window.removeEventListener('keydown', handleGlobalShortcuts);
  }, []);

  const handleThoughtCaptured = (item) => {
    setInboxToast('Captured to Inbox in 0.2s ⚡');
    setTimeout(() => setInboxToast(null), 3500);
  };

  // Filter dashboard telemetry based on selected Date Range
  const filteredData = React.useMemo(() => {
    const hasFrom = Boolean(dateRange.from);
    const hasTo = Boolean(dateRange.to);

    // If no dates are selected, show all available data prioritizing the most recent records
    if (!hasFrom && !hasTo) {
      return data;
    }

    const fromTs = hasFrom ? new Date(dateRange.from + 'T00:00:00').getTime() : -Infinity;
    const toTs = hasTo ? new Date(dateRange.to + 'T23:59:59').getTime() : Infinity;

    const isWithin = (dateStr) => {
      if (!dateStr) return true;
      const parsed = new Date(dateStr).getTime();
      if (isNaN(parsed)) return true;
      return parsed >= fromTs && parsed <= toTs;
    };

    const tasks = (data.tasks || []).filter(t => {
      const d = t.due_date || t.created_at || t.due;
      return isWithin(d);
    });

    const goals = (data.goals || []).filter(g => {
      const d = g.target_date || g.created_at || g.deadline;
      return isWithin(d);
    });

    const learningSkills = (data.learning?.skills || []).filter(s => {
      const d = s.updated_at || s.created_at;
      return isWithin(d);
    });

    const codingTopics = (data.coding?.topics || []).filter(c => {
      const d = c.updated_at || c.created_at;
      return isWithin(d);
    });

    const stats = {
      ...data.stats,
      tasksTotal: tasks.length,
      tasksRemaining: tasks.filter(t => !t.completed).length,
      activeGoals: goals.filter(g => g.status !== 'completed').length,
      learningHours: learningSkills.reduce((acc, s) => acc + (Number(s.hours) || 0), 0) || Math.round((data.stats?.learningHours || 0) * 0.8),
      codingSolved: codingTopics.reduce((acc, t) => acc + (Number(t.solved) || 0), 0) || Math.round((data.stats?.codingSolved || 0) * 0.8)
    };

    return {
      ...data,
      tasks,
      goals,
      learning: {
        ...data.learning,
        skills: learningSkills
      },
      coding: {
        ...data.coding,
        topics: codingTopics
      },
      stats
    };
  }, [data, dateRange]);

  // Synchronize data-theme on document root and save to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mindos_theme', theme);
    localStorage.setItem('ayora_theme', theme);
  }, [theme]);

  // Load user data from PostgreSQL / Backend API
  const loadUserData = useCallback(async () => {
    const activeUser = userRef.current;
    if (!activeUser) {
      setData(initialData);
      return;
    }

    try {
      const [tasksRes, goalsRes, learningRes, codingRes, codingSessionsRes, codingMistakesRes, analyticsRes, activityRes, briefRes] =
        await Promise.allSettled([
          api.tasks.list(),
          api.goals.list(),
          api.learning.list(),
          api.coding.list(),
          api.coding.listSessions(),
          api.coding.listMistakes(),
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

      const codingItems = codingRes.status === 'fulfilled' ? codingRes.value : [];
      const codingSessions = codingSessionsRes.status === 'fulfilled' ? codingSessionsRes.value : [];
      const codingMistakes = codingMistakesRes.status === 'fulfilled' ? codingMistakesRes.value : [];

      // Calculate Coding Statistics natively
      const solvedTotal = codingItems.filter(c => c.status === 'Solved' || c.status === 'Mastered').length;
      const attemptedTotal = codingItems.filter(c => c.status === 'Attempted').length;
      const revisitTotal = codingItems.filter(c => c.status === 'Revisit').length;
      const masteredTotal = codingItems.filter(c => c.status === 'Mastered').length;
      const totalCodingTime = codingSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
      
      // Calculate active streak (simplified for real dates: count consecutive days backwards from today)
      const uniqueDates = [...new Set([
        ...codingItems.map(c => c.solved_date?.split('T')[0]),
        ...codingSessions.map(s => s.date?.split('T')[0])
      ].filter(Boolean))].sort((a, b) => new Date(b) - new Date(a));
      
      let streakDays = 0;
      let longestStreak = 0;
      // Basic streak calculation
      if (uniqueDates.length > 0) {
          let current = 1;
          for (let i = 0; i < uniqueDates.length - 1; i++) {
              const d1 = new Date(uniqueDates[i]);
              const d2 = new Date(uniqueDates[i+1]);
              const diffDays = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
              if (diffDays === 1) {
                  current++;
              } else {
                  if (current > longestStreak) longestStreak = current;
                  current = 1;
              }
          }
          if (current > longestStreak) longestStreak = current;
          // Only count active streak if last activity was today or yesterday
          const lastActivity = new Date(uniqueDates[0]);
          const today = new Date();
          const diffFromToday = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
          if (diffFromToday <= 1) {
              let activeCurrent = 1;
              for (let i = 0; i < uniqueDates.length - 1; i++) {
                  const d1 = new Date(uniqueDates[i]);
                  const d2 = new Date(uniqueDates[i+1]);
                  const diffDays = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
                  if (diffDays === 1) {
                      activeCurrent++;
                  } else {
                      break;
                  }
              }
              streakDays = activeCurrent;
          }
      }

      const coding = {
        problems: codingItems,
        sessions: codingSessions,
        mistakes: codingMistakes,
        solvedTotal,
        attemptedTotal,
        revisitTotal,
        masteredTotal,
        totalProblems: codingItems.length,
        totalCodingTime,
        thisWeek: codingItems.length, // Placeholder, can be refined based on dates
        streakDays,
        longestStreak,
        topics: Array.from(new Set(codingItems.map(c => c.topic).filter(Boolean))).map(t => {
            const topicProblems = codingItems.filter(c => c.topic === t);
            const topicSolved = topicProblems.filter(c => c.status === 'Solved' || c.status === 'Mastered').length;
            const topicMastered = topicProblems.filter(c => c.status === 'Mastered').length;
            return {
                name: t,
                count: topicProblems.length,
                solved: topicSolved,
                mastered: topicMastered,
                color: 'var(--primary-600)'
            };
        })
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

      const recentActivity = activityRes.status === 'fulfilled' && Array.isArray(activityRes.value)
        ? activityRes.value.map(a => {
            let displayTime = a.time_label || 'Just now';
            if (a.created_at) {
              try {
                const d = new Date(a.created_at);
                if (!isNaN(d.getTime())) {
                  displayTime = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
              } catch (e) {
                displayTime = a.time_label || 'Just now';
              }
            }
            return {
              id: `act-${a.id}`,
              type: a.type || a.entity_type || 'task',
              title: a.title || a.action || 'Activity updated',
              time: displayTime,
              color: a.color || (a.type === 'goal' || a.entity_type === 'goal' ? 'var(--accent-600)' : 'var(--primary-600)')
            };
          })
        : [];

      const aiBrief = briefRes.status === 'fulfilled' ? briefRes.value : initialData.aiBrief;

      setData({
        user: activeUser,
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
  }, [user?.id]);

  // Fetch once on user session initialization, login (_loginTs), or clear on logout
  useEffect(() => {
    if (user?.id) {
      loadUserData();
    } else {
      setData(initialData);
    }
  }, [user?._loginTs, user?.id, loadUserData]);

  // Handle task completion toggle with optimistic backend persistence (avoids 9-endpoint storm)
  const handleToggleTask = useCallback(async (taskId) => {
    if (!userRef.current) {
      openAuth('signin');
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
        upcoming: updatedTasks.filter((t) => !t.completed).map((t) => ({
          id: t.id,
          title: t.title,
          type: t.category,
          date: t.due,
          priority: t.priority
        })),
        stats: {
          ...prev.stats,
          tasksCompleted: isNowCompleted ? prev.stats.tasksCompleted + 1 : Math.max(0, prev.stats.tasksCompleted - 1)
        }
      };
    });

    try {
      await api.tasks.toggle(taskId);
    } catch (err) {
      console.error('Failed to toggle task:', err);
      loadUserData();
    }
  }, [openAuth, loadUserData]);

  // Open Full-Page Create Screen
  const handleOpenCreate = useCallback((type = 'task', init = {}) => {
    if (!userRef.current) {
      openAuth('signin');
      return;
    }

    const formattedInitialData = typeof init === 'string'
      ? { title: init, name: init, skill: init }
      : init?.label
        ? { title: init.label, name: init.label, skill: init.label, ...init }
        : init;

    setCreateScreen((prev) => ({
      type,
      returnTab: activeTab,
      initialData: formattedInitialData
    }));
  }, [activeTab, openAuth]);

  // Centralized Full-Page Creation Handler
  const handleSaveCreate = useCallback(async (type, formData) => {
    if (!userRef.current) {
      openAuth('signin');
      return;
    }

    if (type === 'task') {
      await api.tasks.create(formData);
    } else if (type === 'goal') {
      await api.goals.create(formData);
    } else if (type === 'coding') {
      await api.coding.create(formData);
    } else if (type === 'coding-session') {
      await api.coding.logSession(formData);
    } else if (type === 'coding-mistake') {
      await api.coding.logMistake(formData);
    } else if (type === 'learning') {
      await api.learning.create(formData);
    } else if (type === 'habit') {
      await api.habits.create(formData);
    } else if (type === 'note') {
      await api.notes.create(formData);
    } else if (type === 'career') {
      await api.career.createApplication(formData);
    } else if (type === 'finance') {
      await api.finance.createTransaction(formData);
    }

    // Refresh user records
    await loadUserData();

    // Determine target tab to return to
    setCreateScreen((prevScreen) => {
      const originTab = prevScreen?.returnTab || 'dashboard';
      const targetTab = originTab === 'dashboard' ? (
        type === 'task' ? 'tasks' :
        type === 'goal' ? 'goals' :
        (type === 'coding' || type === 'coding-session' || type === 'coding-mistake') ? 'coding' :
        type === 'learning' ? 'learning' :
        type === 'habit' ? 'habits' :
        type === 'note' ? 'notes' :
        type === 'career' ? 'career' :
        type === 'finance' ? 'finance' : 'dashboard'
      ) : originTab;
      setActiveTab(targetTab);
      return null;
    });
  }, [loadUserData, openAuth]);

  const pendingTaskCount = useMemo(
    () => data.tasks.filter((t) => !t.completed).length,
    [data.tasks]
  );

  // Stabilized UI handlers so memoized children never re-render needlessly
  const handleSetTab = useCallback((tab) => {
    setCreateScreen(null);
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  }, []);

  const handleFromChange = useCallback((from) => setDateRange(prev => ({ ...prev, from })), []);
  const handleToChange = useCallback((to) => setDateRange(prev => ({ ...prev, to })), []);
  const handleResetDateRange = useCallback(() => setDateRange({ from: '', to: '' }), []);
  const handleToggleMobileMenu = useCallback(() => setIsMobileMenuOpen(prev => !prev), []);
  const handleCloseMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);
  const handleOpenMobileMenu = useCallback(() => setIsMobileMenuOpen(true), []);
  const handleOpenHud = useCallback(() => setIsHudOpen(true), []);
  const handleCloseHud = useCallback(() => setIsHudOpen(false), []);
  const handleOpenTriage = useCallback(() => setIsTriageOpen(true), []);
  const handleCloseTriage = useCallback(() => setIsTriageOpen(false), []);
  const handleOpenDefaultQuickAction = useCallback((type) => handleOpenCreate(type || 'task'), [handleOpenCreate]);
  const handleWelcomeTransitionStart = useCallback(() => setWelcomeDissolving(true), []);
  const handleWelcomeFinish = useCallback(() => {
    setShowWelcome(false);
    setWelcomeDissolving(false);
  }, []);
  const handleChangeCreateType = useCallback((newType) => {
    setCreateScreen(prev => ({ ...prev, type: newType }));
  }, []);
  const handleCloseCreate = useCallback(() => setCreateScreen(null), []);
  const handleClosePinPrompt = useCallback(() => setShowPinPrompt(false), []);
  const handleReviewInboxToast = useCallback(() => {
    setInboxToast(null);
    setIsTriageOpen(true);
  }, []);

  // STRICT AUTHENTICATION GATE:
  // Unauthenticated visitors must sign in / register before accessing the personal workspace.
  if (!user || authScreen) {
    return (
      <Suspense fallback={<div style={{ minHeight: '100vh', background: '#09090B' }} />}>
        <AuthPage
          initialFlow={authScreen || 'signin'}
          onComplete={() => setAuthScreen(null)}
          onExit={() => setAuthScreen(null)}
        />
      </Suspense>
    );
  }

  return (
    <div className={`app-container ${welcomeDissolving ? 'app-revealing' : ''}`}>
      {/* CINEMATIC STARTUP / WELCOME SCREEN */}
      {showWelcome && (
        <WelcomeScreen
          user={user}
          onTransitionStart={handleWelcomeTransitionStart}
          onFinish={handleWelcomeFinish}
        />
      )}

      {/* 1. LEFT SIDEBAR */}
      <Sidebar
        activeTab={createScreen ? 'create' : activeTab}
        setActiveTab={handleSetTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        taskCount={pendingTaskCount}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={handleCloseMobileMenu}
        onOpenHUD={handleOpenHud}
        onOpenTriage={handleOpenTriage}
      />

      {/* Mobile Drawer Dimmer Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={handleCloseMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* MAIN WRAPPER */}
      <div className="main-wrapper">
        {/* 2. TOP HEADER */}
        <Header
          activeTab={activeTab}
          setActiveTab={handleSetTab}
          theme={theme}
          setTheme={setTheme}
          onOpenQuickAction={handleOpenDefaultQuickAction}
          onToggleMobileMenu={handleToggleMobileMenu}
          onOpenHUD={handleOpenHud}
          onOpenTriage={handleOpenTriage}
        />

        {/* 3. CONTENT AREA */}
        <div className="content-layout">
          <main className="dashboard-center">
            <Suspense fallback={<ViewLoadingFallback />}>
              {/* FULL-PAGE DEDICATED CREATION SCREEN */}
              {createScreen ? (
                <CreateScreen
                  type={createScreen.type}
                  setType={handleChangeCreateType}
                  onClose={handleCloseCreate}
                  returnTab={createScreen.returnTab || activeTab}
                  onSave={handleSaveCreate}
                  goals={data.goals}
                  initialData={createScreen.initialData}
                />
              ) : (
                <>
                  {/* DASHBOARD VIEW (Reference Match) */}
                  {activeTab === 'dashboard' && (
                    <div className="view-transition-container">
                      {/* Reference Header: Title + Date Range Pickers + Controls */}
                      <ExecutiveSummaryBar
                        user={user}
                        stats={filteredData.stats}
                        fromDate={dateRange.from}
                        toDate={dateRange.to}
                        onFromChange={handleFromChange}
                        onToChange={handleToChange}
                        onResetDateRange={handleResetDateRange}
                        onOpenQuickAction={handleOpenCreate}
                        onSync={loadUserData}
                      />

                      {/* Top Row: 2x2 KPI Cards on Left + Striped Bar Chart on Right */}
                      <div className="dashboard-reference-top-grid">
                        <StatCardsRow stats={filteredData.stats} tasks={filteredData.tasks} />
                        <LearningAndCoding
                          learning={filteredData.learning}
                          coding={filteredData.coding}
                          onOpenQuickAction={handleOpenCreate}
                        />
                      </div>

                      {/* Bottom Row: Multi-line Curve Chart on Left + Donut Ring on Right */}
                      <AnalyticsPreview
                        tasks={filteredData.tasks}
                        goals={filteredData.goals}
                        learning={filteredData.learning}
                        coding={filteredData.coding}
                        stats={filteredData.stats}
                        weeklyAnalytics={filteredData.weeklyAnalytics}
                        onOpenQuickAction={handleOpenCreate}
                        onNavigate={handleSetTab}
                      />
                    </div>
                  )}

                  {/* INDIVIDUAL SECTION VIEWS */}
                  {activeTab === 'tasks' && (
                    <TasksView
                      tasks={data.tasks}
                      goals={data.goals}
                      onToggleTask={handleToggleTask}
                      onOpenQuickAction={handleOpenCreate}
                      onRefreshTasks={loadUserData}
                    />
                  )}

                  {activeTab === 'goals' && (
                    <GoalsView
                      goals={data.goals}
                      onOpenQuickAction={handleOpenCreate}
                      onRefreshGoals={loadUserData}
                    />
                  )}

                  {activeTab === 'habits' && (
                    <HabitsView onOpenQuickAction={handleOpenCreate} />
                  )}

                  {activeTab === 'notes' && (
                    <NotesView onOpenQuickAction={handleOpenCreate} />
                  )}

                  {activeTab === 'learning' && (
                    <LearningView
                      learning={data.learning}
                      onOpenQuickAction={handleOpenCreate}
                    />
                  )}

                  {activeTab === 'coding' && (
                    <CodingView
                      coding={data.coding}
                      onOpenQuickAction={handleOpenCreate}
                      onRefreshCoding={loadUserData}
                    />
                  )}

                  {activeTab === 'career' && (
                    <CareerView onOpenQuickAction={handleOpenCreate} />
                  )}

                  {activeTab === 'finance' && (
                    <FinanceView onOpenQuickAction={handleOpenCreate} />
                  )}

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

                  {activeTab === 'profile' && (
                    <ProfileView
                      user={user}
                      onOpenQuickAction={handleOpenCreate}
                      onNavigate={handleSetTab}
                    />
                  )}

                  {activeTab === 'family' && (
                    <FamilyView
                      user={user}
                      onNavigate={handleSetTab}
                    />
                  )}

                  {activeTab === 'settings' && (
                    <SettingsView
                      user={user}
                      theme={theme}
                      setTheme={setTheme}
                    />
                  )}
                </>
              )}
            </Suspense>
          </main>
        </div>
      </div>

      {/* RECOVERY PIN PROMPT MODAL FOR ACCOUNTS MISSING A RECOVERY PIN */}
      {user && !user.has_recovery_pin && showPinPrompt && (
        <Suspense fallback={null}>
          <ConfigureRecoveryPinModal
            isOpen={showPinPrompt}
            onClose={handleClosePinPrompt}
          />
        </Suspense>
      )}

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <MobileBottomNav
        activeTab={createScreen ? 'create' : activeTab}
        setActiveTab={handleSetTab}
        taskCount={pendingTaskCount}
        onOpenMenu={handleOpenMobileMenu}
      />

      {/* QUICK CAPTURE HUD & TRIAGE MODAL */}
      {isHudOpen && (
        <Suspense fallback={null}>
          <QuickCaptureHUD
            isOpen={isHudOpen}
            onClose={handleCloseHud}
            onThoughtCaptured={handleThoughtCaptured}
            onOpenTriage={handleOpenTriage}
          />
        </Suspense>
      )}

      {isTriageOpen && (
        <Suspense fallback={null}>
          <InboxTriageModal
            isOpen={isTriageOpen}
            onClose={handleCloseTriage}
            onRefreshData={loadUserData}
          />
        </Suspense>
      )}

      {/* FLOATING QUICK DUMP PILL (Bottom Right - Accessible from other tabs, hidden on AI Assistant chat to prevent blocking Send button) */}
      {activeTab !== 'ai-assistant' && (
        <button
          type="button"
          className="frictionless-floating-pill"
          onClick={handleOpenHud}
          title="Dump Idea / Task (Alt + C)"
        >
          <Sparkles size={16} />
          <span>Dump Idea</span>
          <span className="pill-shortcut-badge">Alt+C</span>
        </button>
      )}

      {/* EXECUTIVE TOAST NOTIFICATION */}
      {inboxToast && (
        <div className="inbox-toast-banner">
          <CheckCircle2 size={16} color="#10B981" />
          <span>{inboxToast}</span>
          <button
            type="button"
            className="inbox-toast-triage-link"
            onClick={handleReviewInboxToast}
          >
            Review Inbox →
          </button>
        </div>
      )}
    </div>
  );
}
