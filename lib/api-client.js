import {
  clearAllAuthTokens,
  getAccessToken,
  getRefreshTokenCookie,
  setAccessToken,
  setRefreshTokenCookie,
} from "@/lib/token-store";

function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
}

function clearAuthStorage() {
  clearAllAuthTokens();
}

function getStoredAccessToken() {
  return getAccessToken();
}

function getStoredRefreshToken() {
  return getRefreshTokenCookie();
}

function saveTokens(accessToken, refreshToken) {
  setAccessToken(accessToken);
  setRefreshTokenCookie(refreshToken);
}

async function parseApiResponse(response) {
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload?.data ?? payload;
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error("Session expired. Please sign in again.");
  }

  const response = await fetch(`${getApiBaseUrl()}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  const tokenData = await parseApiResponse(response);
  saveTokens(tokenData.accessToken, tokenData.refreshToken);
  return tokenData.accessToken;
}

export async function apiRequest(path, options = {}, shouldRetry = true) {
  const headers = {
    ...(options.headers || {}),
  };

  const accessToken = getStoredAccessToken();
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && shouldRetry) {
    try {
      const newAccessToken = await refreshAccessToken();
      return apiRequest(
        path,
        {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newAccessToken}`,
          },
        },
        false,
      );
    } catch {
      clearAuthStorage();
      throw new Error("Session expired. Please sign in again.");
    }
  }

  return parseApiResponse(response);
}

export const budgetApi = {
  list: () => apiRequest("/budgets"),
  getById: (id) => apiRequest(`/budgets/${id}`),
  create: (payload) =>
    apiRequest("/budgets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiRequest(`/budgets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  delete: (id) =>
    apiRequest(`/budgets/${id}`, {
      method: "DELETE",
    }),
};

export const expenseApi = {
  list: () => apiRequest("/expenses"),
  listByBudget: (budgetId) => apiRequest(`/expenses/budget/${budgetId}`),
  create: (payload) =>
    apiRequest("/expenses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  update: (id, payload) =>
    apiRequest(`/expenses/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
  delete: (id) =>
    apiRequest(`/expenses/${id}`, {
      method: "DELETE",
    }),
};

export const dashboardApi = {
  get: () => apiRequest("/dashboard"),
};

export const statementApi = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiRequest("/statements/upload", {
      method: "POST",
      body: formData
    });
  },
  getRequests: () => apiRequest("/statements/requests"),
  getPredictions: (id) => apiRequest(`/statements/requests/${id}/predictions`),
  confirm: (payload) =>
    apiRequest("/statements/confirm", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }),
};

export function formatDateDDMMYYYY(dateInput) {
  if (!dateInput) return "-";
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return "-";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = String(date.getFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

export function toUiExpense(expense) {
  return {
    ...expense,
    name: expense.title,
    createdAt: formatDateDDMMYYYY(expense.expenseDate || expense.createdAt),
  };
}

export function toUiBudget(budget, stats = {}) {
  return {
    ...budget,
    icon: "💰",
    totalSpent: Number(stats.totalSpent || 0),
    totalCount: Number(stats.totalCount || 0),
  };
}

export function mergeBudgetStats(budgets, expenses) {
  const statsByBudgetId = expenses.reduce((acc, expense) => {
    const budgetId = Number(expense.budgetId);
    if (!budgetId) return acc;

    if (!acc[budgetId]) {
      acc[budgetId] = { totalSpent: 0, totalCount: 0 };
    }

    acc[budgetId].totalSpent += Number(expense.amount || 0);
    acc[budgetId].totalCount += 1;
    return acc;
  }, {});

  return budgets.map((budget) => {
    const stats = statsByBudgetId[Number(budget.id)] || {
      totalSpent: 0,
      totalCount: 0,
    };
    return toUiBudget(budget, stats);
  });
}
