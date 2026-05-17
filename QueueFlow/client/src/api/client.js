const API_BASE = import.meta.env.VITE_API_URL || "/api";

function getToken() {
  return localStorage.getItem("qf_token");
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export const authApi = {
  login: (body) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
};

export const adminQueuesApi = {
  list: () => request("/admin/queues").then((r) => r.queues),
  create: (body) =>
    request("/admin/queues", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) =>
    request(`/admin/queues/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id) => request(`/admin/queues/${id}`, { method: "DELETE" }),
};

export const adminDeskApi = {
  customers: () => request("/admin/desk/customers").then((r) => r.users),
  board: (queueId) => request(`/admin/desk/board/${queueId}`),
  callNext: (queueId) =>
    request("/admin/desk/call-next", {
      method: "POST",
      body: JSON.stringify({ queueId }),
    }),
  complete: (id) => request(`/admin/desk/complete/${id}`, { method: "PUT" }),
  remove: (id) => request(`/admin/desk/remove/${id}`, { method: "PUT" }),
  promoteWaiting: (queueId) =>
    request("/admin/desk/promote-waiting", {
      method: "POST",
      body: JSON.stringify({ queueId }),
    }),
  joinForUser: (queueId, userId) =>
    request("/admin/desk/join", {
      method: "POST",
      body: JSON.stringify({ queueId, userId }),
    }),
};

export const userApi = {
  openQueues: () => request("/user/queues/open").then((r) => r.queues),
  join: (queueId) =>
    request("/user/join", {
      method: "POST",
      body: JSON.stringify({ queueId }),
    }),
  myTokens: () => request("/user/mine").then((r) => r.tokens),
  getToken: (id) => request(`/user/${id}`).then((r) => r.token),
  cancel: (id) => request(`/user/${id}/cancel`, { method: "PUT" }),
};
