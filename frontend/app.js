const API_STORAGE_KEY = "ferretto_api_base";
const TOKEN_STORAGE_KEY = "ferretto_jwt";

const elements = {
  apiBaseInput: document.getElementById("apiBase"),
  saveApiBtn: document.getElementById("saveApiBtn"),
  healthBtn: document.getElementById("healthBtn"),
  healthBadge: document.getElementById("healthBadge"),
  refreshAllBtn: document.getElementById("refreshAllBtn"),
  exportBtn: document.getElementById("exportBtn"),
  autoRefreshToggle: document.getElementById("autoRefreshToggle"),
  globalSearch: document.getElementById("globalSearch"),
  tokenState: document.getElementById("tokenState"),
  logoutBtn: document.getElementById("logoutBtn"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  createProjectForm: document.getElementById("createProjectForm"),
  createMachineForm: document.getElementById("createMachineForm"),
  createWarehouseForm: document.getElementById("createWarehouseForm"),
  createIssueForm: document.getElementById("createIssueForm"),
  createAssignmentForm: document.getElementById("createAssignmentForm"),
  createReportForm: document.getElementById("createReportForm"),
  updateIssueStatusForm: document.getElementById("updateIssueStatusForm"),
  projectsBtn: document.getElementById("projectsBtn"),
  machinesBtn: document.getElementById("machinesBtn"),
  issuesBtn: document.getElementById("issuesBtn"),
  reportsBtn: document.getElementById("reportsBtn"),
  assignmentsBtn: document.getElementById("assignmentsBtn"),
  warehousesBtn: document.getElementById("warehousesBtn"),
  meBtn: document.getElementById("meBtn"),
  projectsCount: document.getElementById("projectsCount"),
  machinesCount: document.getElementById("machinesCount"),
  openIssuesCount: document.getElementById("openIssuesCount"),
  reportsTodayCount: document.getElementById("reportsTodayCount"),
  projectsDelta: document.getElementById("projectsDelta"),
  installedRate: document.getElementById("installedRate"),
  criticalHint: document.getElementById("criticalHint"),
  assignmentsHint: document.getElementById("assignmentsHint"),
  meOutput: document.getElementById("meOutput"),
  apiOutput: document.getElementById("apiOutput"),
  projectsTable: document.getElementById("projectsTable"),
  machinesTable: document.getElementById("machinesTable"),
  issuesTable: document.getElementById("issuesTable"),
  reportsTable: document.getElementById("reportsTable"),
  assignmentsTable: document.getElementById("assignmentsTable"),
  warehousesTable: document.getElementById("warehousesTable"),
  issuesKanban: document.getElementById("issuesKanban"),
  assignmentsTimeline: document.getElementById("assignmentsTimeline"),
  projectPmId: document.getElementById("projectPmId"),
  machineProjectId: document.getElementById("machineProjectId"),
  machineWarehouseId: document.getElementById("machineWarehouseId"),
  issueProjectId: document.getElementById("issueProjectId"),
  issueMachineId: document.getElementById("issueMachineId"),
  assignmentProjectId: document.getElementById("assignmentProjectId"),
  reportProjectId: document.getElementById("reportProjectId"),
  reportMachineId: document.getElementById("reportMachineId"),
  updateIssueId: document.getElementById("updateIssueId"),
};

const state = {
  me: null,
  projects: [],
  machines: [],
  issues: [],
  reports: [],
  assignments: [],
  warehouses: [],
  search: "",
  autoRefreshTimer: null,
};

function getApiBase() {
  return localStorage.getItem(API_STORAGE_KEY) || "http://localhost:3000/api";
}

function setApiBase(value) {
  localStorage.setItem(API_STORAGE_KEY, value.replace(/\/+$/, ""));
}

function getToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

function setToken(token) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function safeText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cut(value, max = 42) {
  if (value === null || value === undefined || value === "") return "-";
  const str = String(value);
  return str.length > max ? `${str.slice(0, max - 1)}...` : str;
}

function showApiOutput(payload) {
  elements.apiOutput.textContent =
    typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
}

function setHealth(text, status) {
  elements.healthBadge.textContent = text;
  elements.healthBadge.classList.remove("neutral", "ok", "ko");
  elements.healthBadge.classList.add(status);
}

function updateTokenState() {
  const token = getToken();
  elements.tokenState.textContent = token
    ? `Token attivo (${token.slice(0, 18)}...)`
    : "Non autenticato";
}

function normalizeRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.data)) return payload.data;
  return [];
}

async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers,
  });

  const raw = await res.text();
  let body;
  try {
    body = raw ? JSON.parse(raw) : null;
  } catch {
    body = raw;
  }

  if (!res.ok) {
    throw new Error(
      typeof body === "string"
        ? body
        : JSON.stringify(body || { status: res.status }, null, 2)
    );
  }
  return body;
}

function toIsoDate(dateValue) {
  if (!dateValue) return undefined;
  return new Date(dateValue).toISOString();
}

function filterRows(rows) {
  if (!state.search.trim()) return rows;
  const q = state.search.toLowerCase();
  return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(q));
}

function updateMetrics() {
  const projects = state.projects;
  const machines = state.machines;
  const issues = state.issues;
  const reports = state.reports;
  const assignments = state.assignments;

  const inProgress = projects.filter((p) => p.status === "IN_PROGRESS").length;
  const installed = machines.filter((m) => m.installationStatus === "INSTALLED").length;
  const installRate = machines.length ? Math.round((installed / machines.length) * 100) : 0;
  const openIssues = issues.filter((i) => ["OPEN", "IN_PROGRESS"].includes(i.status)).length;
  const today = new Date().toISOString().slice(0, 10);
  const reportsToday = reports.filter((r) => String(r.date || "").startsWith(today)).length;

  elements.projectsCount.textContent = String(projects.length);
  elements.machinesCount.textContent = String(machines.length);
  elements.openIssuesCount.textContent = String(openIssues);
  elements.reportsTodayCount.textContent = String(reportsToday);
  elements.projectsDelta.textContent = `In corso: ${inProgress}`;
  elements.installedRate.textContent = `Installate: ${installRate}%`;
  elements.criticalHint.textContent =
    openIssues > 0 ? `${openIssues} issue richiedono attenzione` : "Nessuna issue aperta";
  elements.assignmentsHint.textContent = `Assegnazioni pianificate: ${assignments.length}`;
}

function fillSelect(select, items, placeholder = "Seleziona...") {
  const html = [`<option value="">${safeText(placeholder)}</option>`]
    .concat(
      items.map(
        (item) =>
          `<option value="${safeText(item.value)}">${safeText(item.label)}</option>`
      )
    )
    .join("");
  select.innerHTML = html;
}

function syncDynamicInputs() {
  const projects = state.projects.map((p) => ({
    value: p.id,
    label: `${p.name} (${p.id})`,
  }));
  const machines = state.machines.map((m) => ({
    value: m.id,
    label: `${m.model} - ${m.serialNumber}`,
  }));
  const issues = state.issues.map((i) => ({
    value: i.id,
    label: `${i.type} ${i.status} (${i.id})`,
  }));
  const warehouses = state.warehouses.map((w) => ({
    value: w.id,
    label: `${w.name} (${w.location})`,
  }));

  fillSelect(elements.machineProjectId, projects, "Project...");
  fillSelect(elements.machineWarehouseId, warehouses, "Magazzino (opzionale)...");
  fillSelect(elements.issueProjectId, projects, "Project...");
  fillSelect(elements.assignmentProjectId, projects, "Project...");
  fillSelect(elements.reportProjectId, projects, "Project...");
  fillSelect(elements.issueMachineId, machines, "Machine (opzionale)...");
  fillSelect(elements.reportMachineId, machines, "Machine...");
  fillSelect(elements.updateIssueId, issues, "Issue...");

  if (state.me && state.me.id) elements.projectPmId.value = state.me.id;
}

function renderTable(container, columns, rows) {
  if (!rows.length) {
    container.innerHTML = `<p style="padding:0.6rem;margin:0;">Nessun dato</p>`;
    return;
  }
  const shown = rows.slice(0, 60);
  const head = columns.map((c) => `<th>${safeText(c.label)}</th>`).join("");
  const body = shown
    .map((row) => {
      const tds = columns
        .map((c) => {
          if (c.raw) return `<td>${c.raw(row)}</td>`;
          return `<td>${safeText(cut(c.value(row)))}</td>`;
        })
        .join("");
      return `<tr>${tds}</tr>`;
    })
    .join("");
  container.innerHTML = `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderKanban() {
  const statusBuckets = {
    OPEN: [],
    IN_PROGRESS: [],
    RESOLVED: [],
    CLOSED: [],
  };
  filterRows(state.issues).forEach((issue) => {
    if (!statusBuckets[issue.status]) statusBuckets.OPEN.push(issue);
    else statusBuckets[issue.status].push(issue);
  });

  const html = Object.keys(statusBuckets)
    .map((status) => {
      const cards = statusBuckets[status]
        .slice(0, 12)
        .map(
          (issue) => `
            <div class="kanban-item">
              <strong>${safeText(issue.type)}</strong><br/>
              <span>${safeText(cut(issue.description, 54))}</span><br/>
              <small>${safeText(cut(issue.project?.name || issue.projectId, 36))}</small>
            </div>`
        )
        .join("");
      return `<div class="kanban-col"><h5>${status}</h5>${cards || "<small>Nessuna</small>"}</div>`;
    })
    .join("");
  elements.issuesKanban.innerHTML = html;
}

function renderTimeline() {
  const sorted = filterRows(state.assignments)
    .slice()
    .sort((a, b) => String(a.startDate).localeCompare(String(b.startDate)))
    .slice(0, 20);

  if (!sorted.length) {
    elements.assignmentsTimeline.innerHTML = "<p>Nessuna assegnazione.</p>";
    return;
  }

  elements.assignmentsTimeline.innerHTML = sorted
    .map(
      (a) => `
        <div class="timeline-item">
          <strong>${safeText(cut(a.project?.name || a.projectId, 40))}</strong><br/>
          Installer: ${safeText(cut(a.installer?.email || a.installerId, 34))}<br/>
          Start: ${safeText(cut(a.startDate, 24))} ${a.endDate ? `- End: ${safeText(cut(a.endDate, 24))}` : ""}
        </div>`
    )
    .join("");
}

function renderAll() {
  const projects = filterRows(state.projects);
  const machines = filterRows(state.machines);
  const issues = filterRows(state.issues);
  const reports = filterRows(state.reports);
  const assignments = filterRows(state.assignments);
  const warehouses = filterRows(state.warehouses);

  renderTable(
    elements.projectsTable,
    [
      { label: "Nome", value: (r) => r.name },
      { label: "Cliente", value: (r) => r.customer },
      { label: "Status", value: (r) => r.status },
      { label: "PM", value: (r) => r.pm?.email || r.pmId },
      {
        label: "Azioni",
        raw: (r) =>
          `<div class="row-actions"><button class="btn-mini delete" data-action="delete-project" data-id="${safeText(r.id)}">Delete</button></div>`,
      },
    ],
    projects
  );

  renderTable(
    elements.machinesTable,
    [
      { label: "Model", value: (r) => r.model },
      { label: "Serial", value: (r) => r.serialNumber },
      { label: "Status", value: (r) => r.installationStatus },
      { label: "Project", value: (r) => r.project?.name || r.projectId },
      { label: "Magazzino", value: (r) => r.warehouse?.name || "-" },
      { label: "Valore EUR", value: (r) => r.valueEur },
      {
        label: "Azioni",
        raw: (r) =>
          `<div class="row-actions"><button class="btn-mini delete" data-action="delete-machine" data-id="${safeText(r.id)}">Delete</button></div>`,
      },
    ],
    machines
  );

  renderTable(
    elements.issuesTable,
    [
      { label: "Type", value: (r) => r.type },
      { label: "Status", value: (r) => r.status },
      { label: "Descrizione", value: (r) => r.description },
      { label: "Project", value: (r) => r.project?.name || r.projectId },
      {
        label: "Azioni",
        raw: (r) =>
          `<div class="row-actions">
            <button class="btn-mini update" data-action="advance-issue" data-id="${safeText(r.id)}">Advance</button>
            <button class="btn-mini update" data-action="close-issue" data-id="${safeText(r.id)}">Close</button>
          </div>`,
      },
    ],
    issues
  );

  renderTable(
    elements.reportsTable,
    [
      { label: "Date", value: (r) => r.date },
      { label: "Outcome", value: (r) => r.outcome },
      { label: "Project", value: (r) => r.project?.name || r.projectId },
      { label: "Machine", value: (r) => r.machine?.serialNumber || r.machineId },
    ],
    reports
  );

  renderTable(
    elements.assignmentsTable,
    [
      { label: "Project", value: (r) => r.project?.name || r.projectId },
      { label: "Installer", value: (r) => r.installer?.email || r.installerId },
      { label: "Start", value: (r) => r.startDate },
      { label: "End", value: (r) => r.endDate },
    ],
    assignments
  );

  renderTable(
    elements.warehousesTable,
    [
      { label: "Nome", value: (r) => r.name },
      { label: "Location", value: (r) => r.location },
      { label: "Macchine", value: (r) => r.machinesCount },
      { label: "Valore EUR", value: (r) => r.valueEur },
      { label: "Valore USD", value: (r) => r.valueUsd },
    ],
    warehouses
  );

  renderKanban();
  renderTimeline();
  updateMetrics();
  syncDynamicInputs();
}

async function checkHealth() {
  setHealth("Health: check...", "neutral");
  try {
    const data = await apiFetch("/health", { method: "GET" });
    setHealth("Health: online", "ok");
    showApiOutput({ endpoint: "/health", data });
  } catch (error) {
    setHealth("Health: offline", "ko");
    showApiOutput(`Health error: ${error.message}`);
  }
}

async function loadMe() {
  const me = await apiFetch("/users/me", { method: "GET" });
  state.me = me;
  elements.meOutput.textContent = JSON.stringify(me, null, 2);
}

async function loadProjects() {
  state.projects = normalizeRows(await apiFetch("/projects", { method: "GET" }));
}

async function loadMachines() {
  state.machines = normalizeRows(await apiFetch("/machines", { method: "GET" }));
}

async function loadIssues() {
  state.issues = normalizeRows(await apiFetch("/issues", { method: "GET" }));
}

async function loadReports() {
  state.reports = normalizeRows(await apiFetch("/reports", { method: "GET" }));
}

async function loadAssignments() {
  state.assignments = normalizeRows(await apiFetch("/assignments", { method: "GET" }));
}

async function loadWarehouses() {
  state.warehouses = normalizeRows(await apiFetch("/warehouses", { method: "GET" }));
}

async function refreshAll() {
  try {
    await loadMe();
    await Promise.all([
      loadProjects(),
      loadMachines(),
      loadIssues(),
      loadReports(),
      loadAssignments(),
      loadWarehouses(),
    ]);
    renderAll();
    showApiOutput("Dati aggiornati.");
  } catch (error) {
    showApiOutput(`Refresh failed: ${error.message}`);
  }
}

function startAutoRefresh(enabled) {
  if (state.autoRefreshTimer) {
    clearInterval(state.autoRefreshTimer);
    state.autoRefreshTimer = null;
  }
  if (!enabled) return;
  state.autoRefreshTimer = setInterval(() => {
    if (getToken()) refreshAll();
  }, 30000);
}

function exportSnapshot() {
  const snapshot = {
    exportedAt: new Date().toISOString(),
    apiBase: getApiBase(),
    metrics: {
      projects: state.projects.length,
      machines: state.machines.length,
      issues: state.issues.length,
      reports: state.reports.length,
      assignments: state.assignments.length,
      warehouses: state.warehouses.length,
    },
    data: {
      me: state.me,
      projects: state.projects,
      machines: state.machines,
      issues: state.issues,
      reports: state.reports,
      assignments: state.assignments,
      warehouses: state.warehouses,
    },
  };
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ferretto-snapshot-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function createProject(formData) {
  const payload = {
    name: String(formData.get("name") || ""),
    customer: String(formData.get("customer") || ""),
    location: String(formData.get("location") || ""),
    startDate: toIsoDate(String(formData.get("startDate") || "")),
    expectedEndDate: toIsoDate(String(formData.get("expectedEndDate") || "")),
    status: String(formData.get("status") || "SCHEDULED"),
    pmId: String(formData.get("pmId") || ""),
  };
  if (!payload.expectedEndDate) delete payload.expectedEndDate;
  return apiFetch("/projects", { method: "POST", body: JSON.stringify(payload) });
}

async function createMachine(formData) {
  const payload = {
    model: String(formData.get("model") || ""),
    serialNumber: String(formData.get("serialNumber") || ""),
    projectId: String(formData.get("projectId") || ""),
    warehouseId: String(formData.get("warehouseId") || ""),
    valueEur: Number(formData.get("valueEur") || 0),
    installationStatus: String(formData.get("installationStatus") || "NOT_STARTED"),
    notes: String(formData.get("notes") || ""),
  };
  if (!payload.warehouseId) delete payload.warehouseId;
  if (!payload.notes) delete payload.notes;
  return apiFetch("/machines", { method: "POST", body: JSON.stringify(payload) });
}

async function createIssue(formData) {
  const payload = {
    type: String(formData.get("type") || "PROBLEM"),
    description: String(formData.get("description") || ""),
    projectId: String(formData.get("projectId") || ""),
    machineId: String(formData.get("machineId") || ""),
    assigneeId: String(formData.get("assigneeId") || ""),
  };
  if (!payload.machineId) delete payload.machineId;
  if (!payload.assigneeId) delete payload.assigneeId;
  return apiFetch("/issues", { method: "POST", body: JSON.stringify(payload) });
}

async function createAssignment(formData) {
  const payload = {
    projectId: String(formData.get("projectId") || ""),
    installerId: String(formData.get("installerId") || ""),
    startDate: toIsoDate(String(formData.get("startDate") || "")),
    endDate: toIsoDate(String(formData.get("endDate") || "")),
  };
  if (!payload.endDate) delete payload.endDate;
  return apiFetch("/assignments", { method: "POST", body: JSON.stringify(payload) });
}

async function createReport(formData) {
  const payload = {
    projectId: String(formData.get("projectId") || ""),
    machineId: String(formData.get("machineId") || ""),
    outcome: String(formData.get("outcome") || "OK"),
    notes: String(formData.get("notes") || ""),
  };
  if (!payload.notes) delete payload.notes;
  return apiFetch("/reports", { method: "POST", body: JSON.stringify(payload) });
}


async function createWarehouse(formData) {
  const payload = {
    name: String(formData.get("name") || ""),
    location: String(formData.get("location") || ""),
  };
  return apiFetch("/warehouses", { method: "POST", body: JSON.stringify(payload) });
}

function nextIssueStatus(current) {
  if (current === "OPEN") return "IN_PROGRESS";
  if (current === "IN_PROGRESS") return "RESOLVED";
  if (current === "RESOLVED") return "CLOSED";
  return "CLOSED";
}

function bindEvents() {
  elements.saveApiBtn.addEventListener("click", () => {
    setApiBase(elements.apiBaseInput.value.trim());
    showApiOutput(`API base salvata: ${getApiBase()}`);
  });

  elements.healthBtn.addEventListener("click", checkHealth);
  elements.refreshAllBtn.addEventListener("click", refreshAll);
  elements.exportBtn.addEventListener("click", exportSnapshot);

  elements.autoRefreshToggle.addEventListener("change", (event) => {
    startAutoRefresh(event.target.checked);
  });

  elements.globalSearch.addEventListener("input", (event) => {
    state.search = event.target.value || "";
    renderAll();
  });

  elements.logoutBtn.addEventListener("click", () => {
    clearToken();
    state.me = null;
    state.projects = [];
    state.machines = [];
    state.issues = [];
    state.reports = [];
    state.assignments = [];
    state.warehouses = [];
    elements.meOutput.textContent = "Nessun dato";
    updateTokenState();
    renderAll();
    showApiOutput("Sessione chiusa.");
  });

  elements.loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(elements.loginForm);
    try {
      const result = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      if (!result.accessToken) throw new Error("Token mancante in risposta login.");
      setToken(result.accessToken);
      updateTokenState();
      showApiOutput({ endpoint: "/auth/login", user: result.user });
      await refreshAll();
    } catch (error) {
      showApiOutput(`Login error: ${error.message}`);
    }
  });

  elements.registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(elements.registerForm);
    try {
      const result = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data.entries())),
      });
      showApiOutput({ action: "register", user: result });
    } catch (error) {
      showApiOutput(`Register error: ${error.message}`);
    }
  });

  elements.createProjectForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const created = await createProject(new FormData(elements.createProjectForm));
      showApiOutput({ action: "createProject", id: created.id });
      elements.createProjectForm.reset();
      if (state.me?.id) elements.projectPmId.value = state.me.id;
      await loadProjects();
      renderAll();
    } catch (error) {
      showApiOutput(`Create project error: ${error.message}`);
    }
  });

  elements.createWarehouseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const created = await createWarehouse(new FormData(elements.createWarehouseForm));
      showApiOutput({ action: "createWarehouse", id: created.id });
      elements.createWarehouseForm.reset();
      await loadWarehouses();
      renderAll();
    } catch (error) {
      showApiOutput(`Create warehouse error: ${error.message}`);
    }
  });

  elements.createMachineForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const created = await createMachine(new FormData(elements.createMachineForm));
      showApiOutput({ action: "createMachine", id: created.id });
      elements.createMachineForm.reset();
      await loadMachines();
      renderAll();
    } catch (error) {
      showApiOutput(`Create machine error: ${error.message}`);
    }
  });

  elements.createIssueForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const created = await createIssue(new FormData(elements.createIssueForm));
      showApiOutput({ action: "createIssue", id: created.id });
      elements.createIssueForm.reset();
      await loadIssues();
      renderAll();
    } catch (error) {
      showApiOutput(`Create issue error: ${error.message}`);
    }
  });

  elements.createAssignmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const created = await createAssignment(new FormData(elements.createAssignmentForm));
      showApiOutput({ action: "createAssignment", id: created.id });
      elements.createAssignmentForm.reset();
      await loadAssignments();
      renderAll();
    } catch (error) {
      showApiOutput(`Create assignment error: ${error.message}`);
    }
  });

  elements.createReportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const created = await createReport(new FormData(elements.createReportForm));
      showApiOutput({ action: "createReport", id: created.id });
      elements.createReportForm.reset();
      await loadReports();
      renderAll();
    } catch (error) {
      showApiOutput(`Create report error: ${error.message}`);
    }
  });

  elements.updateIssueStatusForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(elements.updateIssueStatusForm);
    const issueId = String(data.get("issueId") || "");
    const status = String(data.get("status") || "OPEN");
    try {
      await apiFetch(`/issues/${issueId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      showApiOutput({ action: "updateIssueStatus", issueId, status });
      await loadIssues();
      renderAll();
    } catch (error) {
      showApiOutput(`Update issue error: ${error.message}`);
    }
  });

  elements.projectsBtn.addEventListener("click", async () => {
    try {
      await loadProjects();
      renderAll();
      showApiOutput("/projects aggiornato");
    } catch (error) {
      showApiOutput(error.message);
    }
  });
  elements.machinesBtn.addEventListener("click", async () => {
    try {
      await loadMachines();
      renderAll();
      showApiOutput("/machines aggiornato");
    } catch (error) {
      showApiOutput(error.message);
    }
  });
  elements.issuesBtn.addEventListener("click", async () => {
    try {
      await loadIssues();
      renderAll();
      showApiOutput("/issues aggiornato");
    } catch (error) {
      showApiOutput(error.message);
    }
  });
  elements.reportsBtn.addEventListener("click", async () => {
    try {
      await loadReports();
      renderAll();
      showApiOutput("/reports aggiornato");
    } catch (error) {
      showApiOutput(error.message);
    }
  });
  elements.warehousesBtn.addEventListener("click", async () => {
    try {
      await loadWarehouses();
      renderAll();
      showApiOutput("/warehouses aggiornato");
    } catch (error) {
      showApiOutput(error.message);
    }
  });

  elements.assignmentsBtn.addEventListener("click", async () => {
    try {
      await loadAssignments();
      renderAll();
      showApiOutput("/assignments aggiornato");
    } catch (error) {
      showApiOutput(error.message);
    }
  });
  elements.meBtn.addEventListener("click", async () => {
    try {
      await loadMe();
      renderAll();
      showApiOutput("/users/me aggiornato");
    } catch (error) {
      showApiOutput(error.message);
    }
  });

  elements.projectsTable.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-action='delete-project']");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id || !window.confirm(`Eliminare project ${id}?`)) return;
    try {
      await apiFetch(`/projects/${id}`, { method: "DELETE" });
      await loadProjects();
      renderAll();
      showApiOutput({ action: "deleteProject", id });
    } catch (error) {
      showApiOutput(`Delete project error: ${error.message}`);
    }
  });

  elements.machinesTable.addEventListener("click", async (event) => {
    const btn = event.target.closest("[data-action='delete-machine']");
    if (!btn) return;
    const id = btn.dataset.id;
    if (!id || !window.confirm(`Eliminare machine ${id}?`)) return;
    try {
      await apiFetch(`/machines/${id}`, { method: "DELETE" });
      await loadMachines();
      renderAll();
      showApiOutput({ action: "deleteMachine", id });
    } catch (error) {
      showApiOutput(`Delete machine error: ${error.message}`);
    }
  });

  elements.issuesTable.addEventListener("click", async (event) => {
    const closeBtn = event.target.closest("[data-action='close-issue']");
    const advanceBtn = event.target.closest("[data-action='advance-issue']");
    if (!closeBtn && !advanceBtn) return;
    const id = (closeBtn || advanceBtn).dataset.id;
    if (!id) return;
    try {
      const issue = state.issues.find((i) => i.id === id);
      const status = closeBtn ? "CLOSED" : nextIssueStatus(issue?.status);
      await apiFetch(`/issues/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await loadIssues();
      renderAll();
      showApiOutput({ action: "updateIssueInline", id, status });
    } catch (error) {
      showApiOutput(`Update issue inline error: ${error.message}`);
    }
  });
}

function init() {
  elements.apiBaseInput.value = getApiBase();
  updateTokenState();
  bindEvents();
  renderAll();
  checkHealth();

  if (getToken()) {
    refreshAll();
  } else {
    setHealth("Health: in attesa login", "neutral");
  }
}

init();
