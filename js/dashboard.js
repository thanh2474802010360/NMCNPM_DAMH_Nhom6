/* js/dashboard.js – View "Quản lý cuộc họp" */

let dashMode       = "all";   // all | my-meetings | created
let dashPage       = 1;
let dashTimeMode   = "all";   // all | day | week | month
let dashLiveTimer  = null;
const PAGE_SIZE    = 8;

/* ── Lấy danh sách theo mode ─────────────────────── */
function scopedMeetings(mode) {
  const list = getMeetings();
  if (mode === "created") {
    return list.filter((m) => m.organizer === CURRENT_USER.name);
  }
  if (mode === "my-meetings") {
    return list.filter(
      (m) => m.organizer === CURRENT_USER.name || m.host === CURRENT_USER.name || m.participants.some((p) => p.name === CURRENT_USER.name)
    );
  }
  return list;
}

function rangeOfMode(mode) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  const fmt = (dt) => {
    const yy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
  };

  if (mode === "day") {
    const today = fmt(new Date(y, m, d));
    return { from: today, to: today };
  }
  if (mode === "week") {
    const day = now.getDay(); // 0 = CN
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(y, m, d + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { from: fmt(monday), to: fmt(sunday) };
  }
  if (mode === "month") {
    return { from: fmt(new Date(y, m, 1)), to: fmt(new Date(y, m + 1, 0)) };
  }
  return { from: "", to: "" };
}

/* ── HTML ────────────────────────────────────────── */
function viewDashboard(opts = {}) {
  const mode  = opts.mode || "all";
  const title = opts.title || "Quản lý cuộc họp";
  const sub   = opts.sub   || "Quản lý, theo dõi, xác nhận, hủy hoặc xóa các cuộc họp trong hệ thống";

  const list      = scopedMeetings(mode);
  const total     = list.length;
  const upcoming  = list.filter((m) => m.status === "upcoming").length;
  const done      = list.filter((m) => m.status === "done").length;
  const cancelled = list.filter((m) => m.status === "cancelled").length;
  const donePct   = total ? Math.round((done / total) * 100) : 0;

  const organizers = [...new Set(getMeetings().map((m) => m.organizer))];

  return `
    <div class="breadcrumb">Dashboard &gt; <b>${escapeHtml(title)}</b></div>
    <div class="page-head-row">
      <div>
        <h2 class="page-title">${escapeHtml(title)}</h2>
        <p class="page-sub" style="margin:0;">${escapeHtml(sub)}</p>
      </div>
      <div class="page-head-actions">
        <div class="view-toggle" id="viewToggle" title="Lọc nhanh theo thời gian">
          <button type="button" class="active" data-mode="all">Tất cả</button>
          <button type="button" data-mode="day">Ngày</button>
          <button type="button" data-mode="week">Tuần</button>
          <button type="button" data-mode="month">Tháng</button>
        </div>
        <button class="btn btn-primary" id="btnNewMeeting">+ Tạo cuộc họp mới</button>
      </div>
    </div>

    <div class="stats">
      <div class="stat-card stat-clickable active" data-stat="">
        <div class="row1">
          <div class="stat-icon" style="background:var(--blue-bg);">👥</div>
          <span class="badge-trend" style="color:var(--primary)">Tất cả</span>
        </div>
        <div class="num" id="statTotal">${total}</div>
        <div class="label">Tổng cuộc họp</div>
      </div>
      <div class="stat-card stat-clickable" data-stat="upcoming">
        <div class="row1">
          <div class="stat-icon" style="background:var(--blue-bg);">⏰</div>
          <span class="badge-trend" style="color:var(--primary)">Sắp tới</span>
        </div>
        <div class="num" id="statUpcoming">${upcoming}</div>
        <div class="label">Sắp diễn ra</div>
      </div>
      <div class="stat-card stat-clickable" data-stat="done">
        <div class="row1">
          <div class="stat-icon" style="background:var(--amber-bg);">✅</div>
          <span class="badge-trend" style="color:var(--amber)" id="statDonePct">${donePct}%</span>
        </div>
        <div class="num" id="statDone">${done}</div>
        <div class="label">Đã hoàn thành</div>
      </div>
      <div class="stat-card stat-clickable" data-stat="cancelled">
        <div class="row1">
          <div class="stat-icon" style="background:var(--red-bg);">⛔</div>
          <span class="badge-trend" style="color:var(--red)" id="statCancelledBadge">${cancelled ? "-" + cancelled : "0"}</span>
        </div>
        <div class="num" id="statCancelled">${cancelled}</div>
        <div class="label">Đã hủy</div>
      </div>
    </div>

    <div class="panel">
      <div class="toolbar">
        <input type="text" id="filterSearch" placeholder="🔍 Tìm tên cuộc họp...">
        <div class="date-range">
          <input type="date" id="filterDateFrom" title="Từ ngày">
          <span>đến</span>
          <input type="date" id="filterDateTo" title="Đến ngày">
        </div>
        <select id="filterStatus">
          <option value="">Trạng thái: Tất cả</option>
          <option value="upcoming">Sắp diễn ra</option>
          <option value="ongoing">Đang diễn ra</option>
          <option value="done">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
        <select id="filterOrganizer">
          <option value="">Người tạo cuộc họp: Tất cả</option>
          ${organizers.map((o) => `<option value="${escapeHtml(o)}">${escapeHtml(o)}</option>`).join("")}
        </select>
        <select id="filterRoom">
          <option value="">Phòng họp: Tất cả</option>
          ${ROOMS.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}
        </select>
        <div class="toolbar-spacer"></div>
        <button class="btn btn-sm btn-icon-only" id="btnResetFilters" title="Xóa bộ lọc">⟲</button>
      </div>

      <div style="overflow-x:auto;">
        <table>
          <thead>
            <tr>
              <th>Tên cuộc họp</th>
              <th>Người tạo cuộc họp</th>
              <th>Ngày họp</th>
              <th>Thời gian</th>
              <th>Phòng họp</th>
              <th>Thành viên</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody id="meetingTableBody"></tbody>
        </table>
      </div>
      <div id="emptyState" class="empty hidden">Không tìm thấy cuộc họp nào phù hợp.</div>
      <div class="pager">
        <div class="pager-info" id="pagerInfo"></div>
        <div class="pager-nums" id="pagerNums"></div>
      </div>
    </div>
  `;
}

/* ── Khởi tạo sự kiện dashboard ─────────────────── */
function initDashboard(opts = {}) {
  dashMode = opts.mode || "all";
  dashPage = 1;
  dashTimeMode = "all";

  if (dashLiveTimer) clearInterval(dashLiveTimer);
  dashLiveTimer = setInterval(() => {
    if (["dashboard", "my-meetings", "dashboard-created"].includes(state.view)) applyFilters();
  }, 30000);

  document.getElementById("btnNewMeeting").addEventListener("click", () => navigate("create"));
  ["filterSearch", "filterDateFrom", "filterDateTo"].forEach((id) =>
    document.getElementById(id).addEventListener("input", () => { dashPage = 1; dashTimeMode = "custom"; updateTimeToggle(); applyFilters(); })
  );
  ["filterStatus", "filterOrganizer", "filterRoom"].forEach((id) =>
    document.getElementById(id).addEventListener("change", () => { dashPage = 1; applyFilters(); })
  );

  document.getElementById("btnResetFilters").addEventListener("click", () => {
    document.getElementById("filterSearch").value = "";
    document.getElementById("filterDateFrom").value = "";
    document.getElementById("filterDateTo").value = "";
    document.getElementById("filterStatus").value = "";
    document.getElementById("filterOrganizer").value = "";
    document.getElementById("filterRoom").value = "";
    dashTimeMode = "all";
    dashPage = 1;
    updateTimeToggle();
    applyFilters();
  });

  document.getElementById("viewToggle").querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", () => {
      dashTimeMode = btn.dataset.mode;
      const range = rangeOfMode(dashTimeMode);
      document.getElementById("filterDateFrom").value = range.from;
      document.getElementById("filterDateTo").value = range.to;
      dashPage = 1;
      updateTimeToggle();
      applyFilters();
    });
  });

  document.querySelectorAll(".stat-card[data-stat]").forEach((card) => {
    card.addEventListener("click", () => {
      document.getElementById("filterStatus").value = card.dataset.stat;
      dashPage = 1;
      applyFilters();
    });
  });

  applyFilters();
}

function updateTimeToggle() {
  document.getElementById("viewToggle")?.querySelectorAll("button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === dashTimeMode);
  });
}

function updateStatCards(list) {
  const total = list.length;
  const upcoming = list.filter((m) => m.status === "upcoming").length;
  const done = list.filter((m) => m.status === "done").length;
  const cancelled = list.filter((m) => m.status === "cancelled").length;
  const donePct = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statUpcoming").textContent = upcoming;
  document.getElementById("statDone").textContent = done;
  document.getElementById("statCancelled").textContent = cancelled;
  document.getElementById("statDonePct").textContent = donePct + "%";
  document.getElementById("statCancelledBadge").textContent = cancelled ? "-" + cancelled : "0";

  const st = document.getElementById("filterStatus").value;
  document.querySelectorAll(".stat-card[data-stat]").forEach((card) => {
    card.classList.toggle("active", card.dataset.stat === st);
  });
}

/* ── Filter & render bảng ────────────────────────── */
function applyFilters() {
  const q     = (document.getElementById("filterSearch").value || "").toLowerCase().trim();
  const st    = document.getElementById("filterStatus").value;
  const rm    = document.getElementById("filterRoom").value;
  const org   = document.getElementById("filterOrganizer").value;
  const dFrom = document.getElementById("filterDateFrom").value;
  const dTo   = document.getElementById("filterDateTo").value;

  const base = scopedMeetings(dashMode).filter((m) => {
    if (q   && !m.title.toLowerCase().includes(q) && !m.id.toLowerCase().includes(q)) return false;
    if (rm  && m.roomId !== rm) return false;
    if (org && m.organizer !== org) return false;
    if (dFrom && m.date < dFrom) return false;
    if (dTo   && m.date > dTo)   return false;
    return true;
  });

  updateStatCards(base);

  let list = base.filter((m) => !st || m.status === st);
  list.sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime));

  const totalCount = list.length;
  const pageCount  = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  if (dashPage > pageCount) dashPage = pageCount;
  const pageList = list.slice((dashPage - 1) * PAGE_SIZE, dashPage * PAGE_SIZE);

  const body  = document.getElementById("meetingTableBody");
  const empty = document.getElementById("emptyState");

  if (pageList.length === 0) {
    body.innerHTML = "";
    empty.classList.remove("hidden");
  } else {
    empty.classList.add("hidden");
    body.innerHTML = pageList.map(rowHtml).join("");
  }

  const from = totalCount === 0 ? 0 : (dashPage - 1) * PAGE_SIZE + 1;
  const to   = Math.min(dashPage * PAGE_SIZE, totalCount);
  document.getElementById("pagerInfo").textContent =
    `Hiển thị ${from}-${to} trong tổng số ${totalCount} cuộc họp`;

  renderPagerNums(pageCount);

  /* Gắn sự kiện nút hành động trong bảng */
  body.querySelectorAll("[data-action]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      if (el.disabled) return;
      const id     = el.closest("tr").dataset.id;
      const action = el.dataset.action;
      handleRowAction(action, id);
    });
  });

  /* Xác nhận tham gia nhanh trong bảng */
  body.querySelectorAll("[data-resp]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.stopPropagation();
      const id  = el.closest("tr").dataset.id;
      const val = el.dataset.resp;
      quickRespond(id, val);
    });
  });

  /* Click vào row → xem chi tiết */
  body.querySelectorAll("tr").forEach((tr) => {
    tr.addEventListener("click", () => navigate("detail", { meetingId: tr.dataset.id }));
  });
}

/* ── Phân trang ───────────────────────────────────── */
function renderPagerNums(pageCount) {
  const box = document.getElementById("pagerNums");
  let pages = [];
  const add = (p) => pages.push(p);

  if (pageCount <= 7) {
    for (let i = 1; i <= pageCount; i++) add(i);
  } else {
    add(1);
    if (dashPage > 3) add("...");
    for (let i = Math.max(2, dashPage - 1); i <= Math.min(pageCount - 1, dashPage + 1); i++) add(i);
    if (dashPage < pageCount - 2) add("...");
    add(pageCount);
  }

  box.innerHTML = `
    <button id="pagerPrev" ${dashPage <= 1 ? "disabled" : ""}>‹</button>
    ${pages.map((p) => p === "..."
      ? `<span class="dots">…</span>`
      : `<button data-p="${p}" class="${p === dashPage ? "active" : ""}">${p}</button>`
    ).join("")}
    <button id="pagerNext" ${dashPage >= pageCount ? "disabled" : ""}>›</button>
  `;

  box.querySelectorAll("button[data-p]").forEach((b) =>
    b.addEventListener("click", () => { dashPage = parseInt(b.dataset.p); applyFilters(); })
  );
  const prev = document.getElementById("pagerPrev");
  const next = document.getElementById("pagerNext");
  if (prev) prev.addEventListener("click", () => { dashPage = Math.max(1, dashPage - 1); applyFilters(); });
  if (next) next.addEventListener("click", () => { dashPage = Math.min(pageCount, dashPage + 1); applyFilters(); });
}

/* ── HTML avatar stack thành viên ────────────────── */
function memberStackHtml(m) {
  const shown = m.participants.slice(0, 3);
  const rest  = m.participants.length - shown.length;
  return `
    <div class="avatar-stack" title="${m.participants.map((p) => p.name).join(", ")}">
      ${shown.map((p) => `<div class="av">${initials(p.name)}</div>`).join("")}
      ${rest > 0 ? `<div class="av more">+${rest}</div>` : ""}
    </div>`;
}

/* ── HTML một hàng trong bảng ────────────────────── */
function rowHtml(m) {
  const isOwner    = m.organizer === CURRENT_USER.name;
  const isInvited  = !isOwner && !!participantOf(m, CURRENT_USER.name);
  const userStatus = participantStatusOf(m, CURRENT_USER.name);
  const isActive   = m.status === "upcoming" || m.status === "ongoing";
  const canEdit    = isOwner && isActive;
  const canCancel  = isOwner && isActive;
  const canDelete  = isOwner;
  const canRespond = isInvited && isActive;
  const canJoin    = m.status === "ongoing" && (isOwner || isInvited);

  const responseActions = canRespond
    ? `<button class="resp-btn accept" data-resp="accepted" ${userStatus === "accepted" ? "disabled" : ""}>Đồng ý</button>
       <button class="resp-btn decline" data-resp="declined" ${userStatus === "declined" ? "disabled" : ""}>Từ chối</button>`
    : "";

  return `
    <tr data-id="${m.id}" class="${m.status === "ongoing" ? "row-live" : ""}" style="cursor:pointer;">
      <td>
        <div class="mtitle">${escapeHtml(m.title)}</div>
        <div class="mid">ID: #${m.id}</div>
      </td>
      <td>
        <div class="organizer">
          <div class="av">${initials(m.organizer)}</div>
          ${escapeHtml(m.organizer)}
        </div>
      </td>
      <td>${m.date === todayStr(0) ? "<b>Hôm nay</b>" : fmtDateVN(m.date)}</td>
      <td>${m.startTime} - ${m.endTime}</td>
      <td>${roomName(m.roomId)}</td>
      <td>${memberStackHtml(m)}</td>
      <td><span class="pill ${statusPillClass(m.status)}">${statusLabel(m.status)}</span></td>
      <td>
        <div class="row-actions">
          ${canJoin ? `<button class="join-btn" data-action="view">Tham gia</button>` : ""}
          ${responseActions}
          <button class="icon-btn" data-action="view"   title="Xem chi tiết">👁️</button>
          <button class="icon-btn" data-action="edit"   title="Sửa" ${!canEdit ? "disabled" : ""}>✏️</button>
          <button class="icon-btn" data-action="cancel" title="Hủy cuộc họp" ${!canCancel ? "disabled" : ""}>🚫</button>
          <button class="icon-btn danger-action" data-action="delete" title="Xóa cuộc họp" ${!canDelete ? "disabled" : ""}>🗑️</button>
        </div>
      </td>
    </tr>`;
}

/* ── Xác nhận tham gia nhanh từ bảng ─────────────── */
function quickRespond(id, val) {
  const updated = setParticipantResponse(id, CURRENT_USER.name, val);
  if (!updated) { toast("Không thể cập nhật phản hồi cho cuộc họp này"); return; }
  toast(val === "accepted" ? "Đã đồng ý tham gia" : "Đã từ chối tham gia");
  applyFilters();
}

/* ── Xử lý nút thao tác trong bảng ──────────────── */
function handleRowAction(action, id) {
  if (action === "view")   navigate("detail", { meetingId: id });
  if (action === "edit")   navigate("edit",   { meetingId: id });
  if (action === "cancel") {
    if (!confirm("Bạn có chắc muốn hủy cuộc họp này không?")) return;
    const list = getMeetings();
    const m    = list.find((x) => x.id === id);
    if (!m) return;
    m.status   = "cancelled";
    m.history.push({
      text: "Cuộc họp đã bị hủy bởi " + CURRENT_USER.name,
      time: new Date().toLocaleString("vi-VN"),
    });
    saveMeetings(list, false);
    applyFilters();
    toast("Đã hủy cuộc họp");
  }
  if (action === "delete") {
    if (!confirm("Bạn có chắc muốn xóa vĩnh viễn cuộc họp này khỏi danh sách không?")) return;
    deleteMeeting(id);
    applyFilters();
    toast("Đã xóa cuộc họp");
  }
}

