export const initialData = {
  user: null,
  stats: {
    tasksRemaining: 0,
    tasksTotal: 0,
    activeGoals: 0,
    goalsDueSoon: 0,
    learningHours: 0,
    codingSolved: 0,
    focusTime: "0h"
  },
  aiBrief: {
    title: "AI Daily Brief",
    subtitle: "Here's what deserves your attention today.",
    bullets: []
  },
  tasks: [],
  goals: [],
  learning: {
    skills: [],
    weeklyHours: 0,
    streak: "0 days"
  },
  coding: {
    solvedTotal: 0,
    thisWeek: 0,
    streakDays: 0,
    topics: []
  },
  recentActivity: [],
  upcoming: [],
  weeklyAnalytics: [
    { day: "Mon", tasks: 0, hours: 0, coding: 0 },
    { day: "Tue", tasks: 0, hours: 0, coding: 0 },
    { day: "Wed", tasks: 0, hours: 0, coding: 0 },
    { day: "Thu", tasks: 0, hours: 0, coding: 0 },
    { day: "Fri", tasks: 0, hours: 0, coding: 0 },
    { day: "Sat", tasks: 0, hours: 0, coding: 0 },
    { day: "Sun", tasks: 0, hours: 0, coding: 0 }
  ]
};
