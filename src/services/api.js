// MYNEXUS API Client
// Connects to FastAPI Backend at http://127.0.0.1:8000/api/v1
// Ensures Zero-Trust Bearer Token Authorization on every authenticated request

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken() {
  return localStorage.getItem('mynexus_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('mynexus_token', token);
  } else {
    localStorage.removeItem('mynexus_token');
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 204) {
    return null;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.detail || `API error ${response.status}`;
    throw new ApiError(errorMsg, response.status, data);
  }

  return data;
}

export const api = {
  // Authentication
  auth: {
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) =>
      request('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      })
  },

  // Tasks
  tasks: {
    list: (category) =>
      request(`/tasks${category ? `?category=${encodeURIComponent(category)}` : ''}`),
    create: (taskData) =>
      request('/tasks', {
        method: 'POST',
        body: JSON.stringify(taskData)
      }),
    get: (id) => request(`/tasks/${id}`),
    update: (id, taskData) =>
      request(`/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(taskData)
      }),
    delete: (id) =>
      request(`/tasks/${id}`, {
        method: 'DELETE'
      }),
    toggle: (id) =>
      request(`/tasks/${id}/toggle`, {
        method: 'POST'
      }),
    addSubtask: (taskId, title) =>
      request(`/tasks/${taskId}/subtasks`, {
        method: 'POST',
        body: JSON.stringify({ title })
      })
  },

  // Goals
  goals: {
    list: (category) =>
      request(`/goals${category ? `?category=${encodeURIComponent(category)}` : ''}`),
    create: (goalData) =>
      request('/goals', {
        method: 'POST',
        body: JSON.stringify(goalData)
      }),
    get: (id) => request(`/goals/${id}`),
    update: (id, goalData) =>
      request(`/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(goalData)
      }),
    delete: (id) =>
      request(`/goals/${id}`, {
        method: 'DELETE'
      }),
    addMilestone: (goalId, milestoneData) =>
      request(`/goals/${goalId}/milestones`, {
        method: 'POST',
        body: JSON.stringify(milestoneData)
      })
  },

  // Habits
  habits: {
    list: () => request('/habits'),
    create: (habitData) =>
      request('/habits', {
        method: 'POST',
        body: JSON.stringify(habitData)
      }),
    log: (id, logData = {}) =>
      request(`/habits/${id}/log`, {
        method: 'POST',
        body: JSON.stringify(logData)
      }),
    delete: (id) =>
      request(`/habits/${id}`, {
        method: 'DELETE'
      })
  },

  // Notes
  notes: {
    list: (tag) =>
      request(`/notes${tag ? `?tag=${encodeURIComponent(tag)}` : ''}`),
    create: (noteData) =>
      request('/notes', {
        method: 'POST',
        body: JSON.stringify(noteData)
      }),
    update: (id, noteData) =>
      request(`/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(noteData)
      }),
    delete: (id) =>
      request(`/notes/${id}`, {
        method: 'DELETE'
      })
  },

  // Learning
  learning: {
    list: () => request('/learning'),
    create: (itemData) =>
      request('/learning', {
        method: 'POST',
        body: JSON.stringify(itemData)
      }),
    logSession: (itemId, sessionData) =>
      request(`/learning/${itemId}/sessions`, {
        method: 'POST',
        body: JSON.stringify(sessionData)
      })
  },

  // Coding
  coding: {
    list: (difficulty) =>
      request(`/coding${difficulty ? `?difficulty=${encodeURIComponent(difficulty)}` : ''}`),
    create: (problemData) =>
      request('/coding', {
        method: 'POST',
        body: JSON.stringify(problemData)
      }),
    update: (id, problemData) =>
      request(`/coding/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(problemData)
      })
  },

  // Career
  career: {
    getProfile: () => request('/career/profile'),
    updateProfile: (profileData) =>
      request('/career/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      }),
    listApplications: (status) =>
      request(`/career/applications${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    createApplication: (appData) =>
      request('/career/applications', {
        method: 'POST',
        body: JSON.stringify(appData)
      }),
    addInterview: (appId, interviewData) =>
      request(`/career/applications/${appId}/interviews`, {
        method: 'POST',
        body: JSON.stringify(interviewData)
      })
  },

  // Finance
  finance: {
    getSummary: () => request('/finance/summary'),
    listTransactions: (limit = 50) => request(`/finance/transactions?limit=${limit}`),
    createTransaction: (txnData) =>
      request('/finance/transactions', {
        method: 'POST',
        body: JSON.stringify(txnData)
      }),
    deleteTransaction: (id) =>
      request(`/finance/transactions/${id}`, {
        method: 'DELETE'
      }),
    listBudgets: () => request('/finance/budgets'),
    createBudget: (budgetData) =>
      request('/finance/budgets', {
        method: 'POST',
        body: JSON.stringify(budgetData)
      })
  },

  // Analytics
  analytics: {
    getSummary: () => request('/analytics/summary')
  },

  // Activity Audit Log
  activity: {
    list: (limit = 20) => request(`/activity?limit=${limit}`)
  },

  // Notifications
  notifications: {
    list: (unreadOnly = false) =>
      request(`/notifications${unreadOnly ? '?unread_only=true' : ''}`),
    markRead: (id) =>
      request(`/notifications/${id}/read`, {
        method: 'PATCH'
      }),
    markAllRead: () =>
      request('/notifications/read-all', {
        method: 'POST'
      })
  },

  // Global Search
  search: {
    query: (q) => request(`/search?q=${encodeURIComponent(q)}`)
  },

  // Context-Aware AI Copilot
  ai: {
    getDailyBrief: () => request('/ai/daily-brief'),
    askCopilot: (prompt, context = {}) =>
      request('/ai/copilot', {
        method: 'POST',
        body: JSON.stringify({ prompt, context })
      })
  }
};
