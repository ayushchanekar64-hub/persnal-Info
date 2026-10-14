// MIND OS API Client
// Connects to FastAPI Backend at http://127.0.0.1:8000/api/v1
// Ensures Zero-Trust Bearer Token Authorization on every authenticated request

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function getToken() {
  return localStorage.getItem('mindos_token') || localStorage.getItem('ayora_token') || localStorage.getItem('mynexus_token');
}

export function setToken(token) {
  if (token) {
    localStorage.setItem('mindos_token', token);
    localStorage.setItem('ayora_token', token);
  } else {
    localStorage.removeItem('mindos_token');
    localStorage.removeItem('ayora_token');
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

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers
    });
  } catch (netErr) {
    throw new ApiError('Unable to connect to MIND OS backend service. Please check your network or server connection.', 0, null);
  }

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
    checkIdentifier: (identifier) =>
      request('/auth/check-identifier', {
        method: 'POST',
        body: JSON.stringify({ identifier })
      }),
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    login2FA: (twoFactorToken, securityPin) =>
      request('/auth/login/2fa', {
        method: 'POST',
        body: JSON.stringify({ two_factor_token: twoFactorToken, security_pin: securityPin })
      }),
    googleLogin: (payload) =>
      request('/auth/google', {
        method: 'POST',
        body: JSON.stringify(payload)
      }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) =>
      request('/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      }),
    setRecoveryPin: (recoveryPin) =>
      request('/auth/set-recovery-pin', {
        method: 'POST',
        body: JSON.stringify({ recovery_pin: recoveryPin })
      }),
    verifyRecoveryIdentifier: (identifier) =>
      request('/auth/recovery/verify-identifier', {
        method: 'POST',
        body: JSON.stringify({ identifier })
      }),
    verifyRecoveryPin: (recoveryToken, recoveryPin) =>
      request('/auth/recovery/verify-pin', {
        method: 'POST',
        body: JSON.stringify({ recovery_token: recoveryToken, recovery_pin: recoveryPin })
      }),
    resetPasswordWithPin: (resetToken, newPassword) =>
      request('/auth/recovery/reset-password', {
        method: 'POST',
        body: JSON.stringify({ reset_token: resetToken, new_password: newPassword })
      })
  },

  // Personal Database / Profile
  profile: {
    get: () => request('/profile'),
    updateBasic: (data) =>
      request('/profile/basic', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    createEducation: (data) =>
      request('/profile/education', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateEducation: (id, data) =>
      request(`/profile/education/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteEducation: (id) =>
      request(`/profile/education/${id}`, {
        method: 'DELETE'
      }),
    createCertification: (data) =>
      request('/profile/certification', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateCertification: (id, data) =>
      request(`/profile/certification/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteCertification: (id) =>
      request(`/profile/certification/${id}`, {
        method: 'DELETE'
      }),
    createExperience: (data) =>
      request('/profile/experience', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateExperience: (id, data) =>
      request(`/profile/experience/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteExperience: (id) =>
      request(`/profile/experience/${id}`, {
        method: 'DELETE'
      }),
    updateCareer: (data) =>
      request('/profile/career', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    createSkill: (data) =>
      request('/profile/skills', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateSkill: (id, data) =>
      request(`/profile/skills/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteSkill: (id) =>
      request(`/profile/skills/${id}`, {
        method: 'DELETE'
      }),
    updateLinks: (data) =>
      request('/profile/links', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    updatePreferences: (data) =>
      request('/profile/preferences', {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    createDocument: (data) =>
      request('/profile/documents', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateDocument: (id, data) =>
      request(`/profile/documents/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteDocument: (id) =>
      request(`/profile/documents/${id}`, {
        method: 'DELETE'
      }),
    createContact: (data) =>
      request('/profile/contacts', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    updateContact: (id, data) =>
      request(`/profile/contacts/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    deleteContact: (id) =>
      request(`/profile/contacts/${id}`, {
        method: 'DELETE'
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
      }),
    toggleSubtask: (taskId, subtaskId) =>
      request(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
        method: 'POST'
      }),
    deleteSubtask: (taskId, subtaskId) =>
      request(`/tasks/${taskId}/subtasks/${subtaskId}`, {
        method: 'DELETE'
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
      }),
    delete: (id) =>
      request(`/coding/${id}`, {
        method: 'DELETE'
      }),
    listSessions: () => request('/coding/sessions'),
    logSession: (sessionData) =>
      request('/coding/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData)
      }),
    listMistakes: (status) =>
      request(`/coding/mistakes${status ? `?status=${encodeURIComponent(status)}` : ''}`),
    logMistake: (mistakeData) =>
      request('/coding/mistakes', {
        method: 'POST',
        body: JSON.stringify(mistakeData)
      }),
    updateMistake: (id, mistakeData) =>
      request(`/coding/mistakes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(mistakeData)
      }),
    deleteMistake: (id) =>
      request(`/coding/mistakes/${id}`, {
        method: 'DELETE'
      }),
    listAchievements: () => request('/coding/achievements'),
    execute: (data) =>
      request('/coding/execute', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    evaluate: (data) =>
      request('/coding/evaluate', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
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
  },

  // Family Members Management System
  family: {
    list: () => request('/family'),
    get: (id) => request(`/family/${id}`),
    create: (data) =>
      request('/family', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    update: (id, data) =>
      request(`/family/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/family/${id}`, {
        method: 'DELETE'
      }),
    // Education
    addEducation: (id, data) =>
      request(`/family/${id}/education`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteEducation: (id, eduId) =>
      request(`/family/${id}/education/${eduId}`, {
        method: 'DELETE'
      }),
    // Career
    addCareer: (id, data) =>
      request(`/family/${id}/career`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteCareer: (id, careerId) =>
      request(`/family/${id}/career/${careerId}`, {
        method: 'DELETE'
      }),
    // Documents
    addDocument: (id, data) =>
      request(`/family/${id}/documents`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteDocument: (id, docId) =>
      request(`/family/${id}/documents/${docId}`, {
        method: 'DELETE'
      }),
    // Contacts
    addContact: (id, data) =>
      request(`/family/${id}/contacts`, {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    deleteContact: (id, contactId) =>
      request(`/family/${id}/contacts/${contactId}`, {
        method: 'DELETE'
      })
  },

  // Frictionless Catch-All Inbox
  inbox: {
    capture: (data) =>
      request('/inbox/capture', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    list: (includeProcessed = false) =>
      request(`/inbox${includeProcessed ? '?include_processed=true' : ''}`),
    update: (id, data) =>
      request(`/inbox/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    delete: (id) =>
      request(`/inbox/${id}`, {
        method: 'DELETE'
      }),
    convert: (id, convData) =>
      request(`/inbox/${id}/convert`, {
        method: 'POST',
        body: JSON.stringify(convData)
      })
  }
};

