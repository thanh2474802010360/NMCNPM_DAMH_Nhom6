/* js/form.js – Form tạo mới & chỉnh sửa cuộc họp */

/* State cục bộ của form */
let formParticipants = [];   // [{name, status}]
let formFiles         = [];

const TIMEZONES = [
  "(GMT+07:00) Bangkok, Hanoi, Jakarta",
  "(GMT+08:00) Singapore, Kuala Lumpur",
  "(GMT+09:00) Tokyo, Seoul",
  "(GMT+00:00) London",
];

const REPEAT_OPTIONS = [
  { v: "none",    l: "Không lặp lại" },
  { v: "daily",   l: "Hàng ngày" },
  { v: "weekly",  l: "Hàng tuần" },
  { v: "monthly", l: "Hàng tháng" },
];

/* ── HTML form ───────────────────────────────────── */
function viewForm(editId) {
  const m = editId ? getMeeting(editId) : null;
  if (editId && !m) return `<div class="empty">Không tìm thấy cuộc họp.</div>`;

  const v   = (field) => m ? escapeHtml(m[field] || "") : "";
  const sel = (field, val) => (m && m[field] === val) ? "selected" : "";
  const chk = (field, val) => (!m && val === "hybrid") || (m && m[field] === val) ? "checked" : "";

  return `
    <div class="breadcrumb">Dashboard &gt; <b>${m ? "Sửa cuộc họp" : "Tạo cuộc họp"}</b></div>
    <h2 class="page-title">${m ? "Sửa cuộc họp" : "Tạo cuộc họp mới"}</h2>
    <p class="page-sub">${m ? "Cập nhật thông tin cuộc họp đã tạo" : "Lên lịch cuộc họp và mời các thành viên tham gia"}</p>

    <form id="meetingForm" novalidate>
      <div class="form-grid">

        <!-- CỘT TRÁI -->
        <div>

          <!-- Người tổ chức -->
          <div class="panel">
            <h3>👤 Người tạo cuộc họp &amp; Chủ trì</h3>
            <div class="field-row">
              <div class="field">
                <label>Người tạo cuộc họp</label>
                <div class="organizer" style="border:1px solid var(--border);border-radius:9px;padding:10px 12px;background:#f9fafb;">
                  <div class="av">${initials(CURRENT_USER.name)}</div>
                  ${escapeHtml(CURRENT_USER.name)} (Tôi)
                </div>
              </div>
              <div class="field">
                <label>Chủ trì cuộc họp <span class="req">*</span></label>
                <select id="f_host">
                  <option ${sel("host", CURRENT_USER.name) || (!m ? "selected" : "")}>${CURRENT_USER.name}</option>
                  ${STAFF.map((s) => `<option ${sel("host", s.name)}>${escapeHtml(s.name)}</option>`).join("")}
                </select>
              </div>
            </div>
          </div>

          <!-- Thông tin cuộc họp -->
          <div class="panel">
            <h3>ℹ️ Thông tin cuộc họp</h3>
            <div class="field" id="field_title">
              <label>Tiêu đề cuộc họp <span class="req">*</span></label>
              <input type="text" id="f_title" maxlength="200" placeholder="Nhập tiêu đề cuộc họp..." value="${v("title")}">
              <div class="err hidden">Vui lòng nhập tiêu đề cuộc họp</div>
            </div>
            <div class="field">
              <label>Mô tả nội dung</label>
              <textarea id="f_desc" placeholder="Nội dung chính, mục tiêu cuộc họp...">${v("description")}</textarea>
            </div>
            <div class="field">
              <label>Hình thức họp</label>
              <div class="radio-group">
                <label><input type="radio" name="f_format" value="offline" ${chk("format","offline")}> Trực tiếp</label>
                <label><input type="radio" name="f_format" value="online"  ${chk("format","online")}>  Trực tuyến</label>
                <label><input type="radio" name="f_format" value="hybrid"  ${chk("format","hybrid")}>  Hybrid</label>
              </div>
            </div>
          </div>

          <!-- Thời gian -->
          <div class="panel">
            <h3>🕒 Thời gian &amp; Cài đặt</h3>
            <div class="field-row">
              <div class="field" id="field_date">
                <label>Ngày họp <span class="req">*</span></label>
                <input type="date" id="f_date" value="${m ? m.date : todayStr(1)}">
                <div class="err hidden">Không được chọn ngày trong quá khứ</div>
              </div>
              <div class="field">
                <label>Múi giờ</label>
                <select id="f_timezone">
                  ${TIMEZONES.map((tz, i) => `<option ${(m && m.timezone === tz) || (!m && i === 0) ? "selected" : ""}>${tz}</option>`).join("")}
                </select>
              </div>
            </div>
            <div class="field-row">
              <div class="field" id="field_start">
                <label>Bắt đầu <span class="req">*</span></label>
                <input type="time" id="f_start" value="${m ? m.startTime : "09:00"}">
              </div>
              <div class="field" id="field_end">
                <label>Kết thúc <span class="req">*</span></label>
                <input type="time" id="f_end" value="${m ? m.endTime : "10:00"}">
                <div class="err hidden">Thời gian kết thúc phải sau thời gian bắt đầu</div>
              </div>
            </div>
            <div class="field-row">
              <div class="field">
                <label>Lặp lại</label>
                <select id="f_repeat">
                  ${REPEAT_OPTIONS.map((r) => `<option value="${r.v}" ${m && m.repeat === r.v ? "selected" : ""}>${r.l}</option>`).join("")}
                </select>
              </div>
              <div class="field">
                <label>Nhắc hẹn trước</label>
                <select id="f_reminder">
                  <option value="10"  ${sel("reminder","10")}>10 phút</option>
                  <option value="15"  ${sel("reminder","15")}>15 phút</option>
                  <option value="30"  ${sel("reminder","30") || !m ? "selected" : ""}>30 phút</option>
                  <option value="60"  ${sel("reminder","60")}>1 giờ</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Địa điểm -->
          <div class="panel">
            <h3>📍 Địa điểm &amp; Đường dẫn</h3>
            <div class="room-select-row" id="field_room">
              <div class="field">
                <label>Chọn phòng họp <span class="req">*</span></label>
                <select id="f_room">
                  <option value="">-- Chọn phòng họp --</option>
                  ${ROOMS.map((r) => `<option value="${r.id}" ${m && m.roomId===r.id?"selected":""}>${r.name}</option>`).join("")}
                </select>
                <div class="err hidden">Vui lòng chọn phòng họp</div>
              </div>
              <button type="button" class="btn btn-check-room" id="btnCheckRoom">📅 Kiểm tra lịch trống</button>
            </div>
            <div id="roomInfoBox"></div>
            <div class="field" style="margin-top:14px;">
              <label>Link họp trực tuyến</label>
              <input type="text" id="f_link" placeholder="https://meet.google.com/xxx-xxxx-xxx" value="${v("onlineLink")}">
            </div>
          </div>

          <!-- Thành viên -->
          <div class="panel">
            <div class="participant-head">
              <h3 style="margin:0;">👥 Thành viên tham gia</h3>
              <span class="participant-count-badge" id="participantCount"></span>
              <span class="availability-note" id="availabilityNote" style="margin-left:auto;"></span>
            </div>
            <div class="suggest-box">
              <input type="text" id="f_participantSearch" placeholder="🔍 Tìm kiếm nhân viên...">
              <div class="suggest-list hidden" id="suggestList"></div>
            </div>
            <div class="tags" id="participantTags"></div>
            <div style="margin-top:10px;">
              <span class="quick-add-link" id="btnQuickAdd">➕ Thêm nhanh</span>
            </div>
          </div>

          <!-- Đính kèm -->
          <div class="panel">
            <h3>📎 Tài liệu đính kèm</h3>
            <div class="dropzone" id="dropzone">
              <div class="dz-icon">☁️⬆️</div>
              <div class="dz-main">Nhấp hoặc kéo thả tệp vào đây</div>
              <div class="dz-sub">Hỗ trợ PDF, DOCX, XLSX (Tối đa 10MB/tệp)</div>
              <input type="file" id="fileInput" multiple style="display:none;">
            </div>
            <div id="fileList"></div>
          </div>

        </div><!-- /CỘT TRÁI -->

        <!-- CỘT PHẢI: Summary sticky -->
        <div>
          <div class="summary-card">
            <h3>Tóm tắt cuộc họp</h3>
            <div class="sum-item">
              <div class="ic">📅</div>
              <div><div class="lbl">Thời gian</div><div class="val" id="sumTime">—</div></div>
            </div>
            <div class="sum-item">
              <div class="ic">👤</div>
              <div><div class="lbl">Người tạo cuộc họp / Chủ trì</div><div class="val" id="sumHost">—</div></div>
            </div>
            <div class="sum-item">
              <div class="ic">📍</div>
              <div><div class="lbl">Địa điểm</div><div class="val" id="sumRoom">—</div></div>
            </div>
            <div class="sum-item">
              <div class="ic">🔔</div>
              <div><div class="lbl">Nhắc hẹn</div><div class="val" id="sumReminder">—</div></div>
            </div>
            <div class="sum-item">
              <div class="ic">👥</div>
              <div><div class="lbl">Tham gia</div><div class="val" id="sumParticipants">0 thành viên</div></div>
            </div>
            <div id="conflictBox"></div>
            <div class="summary-actions">
              <button type="submit" class="btn btn-primary">
                ${m ? "💾 Lưu thay đổi" : "✅ Tạo cuộc họp"}
              </button>
              <button type="button" class="btn" id="btnSaveDraft">Lưu bản nháp</button>
              <button type="button" class="btn-link" id="btnCancelForm">Hủy bỏ</button>
            </div>
          </div>
          <div class="tip-box">
            <div class="tip-title">💡 Mẹo nhỏ</div>
            <p>Bạn có thể tạo cuộc họp định kỳ bằng cách chọn thêm cấu hình ở phần "Lặp lại" phía trên.</p>
          </div>
        </div><!-- /CỘT PHẢI -->

      </div>
    </form>
  `;
}

/* ── Khởi tạo sự kiện form ───────────────────────── */
function initForm(editId) {
  const m = editId ? getMeeting(editId) : null;

  // Khởi tạo state cục bộ
  formParticipants = m
    ? m.participants.map((p) => ({ name: p.name, status: p.status || "invited" }))
    : [];
  formFiles        = m ? [...m.attachments] : [];

  renderParticipantTags();
  renderFileList();
  updateSummary();
  showRoomInfo();
  checkConflict();

  // Nút hủy bỏ
  document.getElementById("btnCancelForm").addEventListener("click", () => {
    if (confirm("Hủy bỏ thay đổi và quay lại?")) navigate("dashboard");
  });

  // Nút lưu bản nháp (demo)
  document.getElementById("btnSaveDraft").addEventListener("click", () => {
    toast("Đã lưu bản nháp cuộc họp (demo)");
  });

  // Nút kiểm tra lịch trống (demo — chạy lại kiểm tra xung đột)
  document.getElementById("btnCheckRoom").addEventListener("click", () => {
    showRoomInfo();
    checkConflict();
    toast("Đã kiểm tra lịch trống phòng họp");
  });

  // Lắng nghe thay đổi để cập nhật summary + conflict
  const watchIds = ["f_title", "f_date", "f_start", "f_end", "f_room", "f_link", "f_host", "f_reminder", "f_desc", "f_timezone", "f_repeat"];
  watchIds.forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("input",  () => { updateSummary(); checkConflict(); clearFieldErr(id); });
    el.addEventListener("change", () => { updateSummary(); checkConflict(); clearFieldErr(id); });
  });
  document.querySelectorAll('input[name="f_format"]').forEach((r) =>
    r.addEventListener("change", updateSummary)
  );

  // Thông tin phòng
  document.getElementById("f_room").addEventListener("change", showRoomInfo);

  // Tìm kiếm / thêm người tham gia
  initParticipantSearch();

  // Thêm nhanh (mở toàn bộ danh sách nhân viên còn lại)
  document.getElementById("btnQuickAdd").addEventListener("click", () => {
    const psearch = document.getElementById("f_participantSearch");
    const listBox = document.getElementById("suggestList");
    const remaining = STAFF.filter((s) => !formParticipants.find((p) => p.name === s.name));
    if (!remaining.length) { toast("Đã mời tất cả nhân viên"); return; }
    listBox.innerHTML = remaining.map((s) => `<div class="suggest-item" data-name="${escapeHtml(s.name)}">
        <span>${escapeHtml(s.name)}</span><small>${escapeHtml(s.dept)}</small>
      </div>`).join("");
    listBox.classList.remove("hidden");
    psearch.focus();
    listBox.querySelectorAll(".suggest-item[data-name]").forEach((it) => {
      it.addEventListener("click", () => {
        formParticipants.push({ name: it.dataset.name, status: "pending" });
        listBox.classList.add("hidden");
        renderParticipantTags();
        updateSummary();
        checkConflict();
      });
    });
  });

  // Upload file
  initFileUpload();

  // Submit
  document.getElementById("meetingForm").addEventListener("submit", (e) => {
    e.preventDefault();
    submitForm(editId);
  });
}

/* ── Thông tin phòng họp ─────────────────────────── */
function showRoomInfo() {
  const roomId = document.getElementById("f_room").value;
  const box    = document.getElementById("roomInfoBox");
  if (!roomId) { box.innerHTML = ""; return; }
  const r = roomObj(roomId);

  const date  = document.getElementById("f_date").value;
  const start = document.getElementById("f_start").value;
  const end   = document.getElementById("f_end").value;
  const editId = state.meetingId || null;
  const conflicts = findScheduleConflicts({
    id: editId,
    date,
    startTime: start,
    endTime: end,
    roomId,
    participants: formParticipants,
    organizer: CURRENT_USER.name,
    host: document.getElementById("f_host")?.value || CURRENT_USER.name,
  });
  const busy = !!conflicts.roomConflict;

  box.innerHTML = `
    <div class="room-info">
      <span class="room-status ${busy ? "busy" : ""}">Sức chứa: ${r.capacity} người &nbsp;·&nbsp; ${busy ? "Đang bận" : "Trống"}</span>
      <span class="room-equip">
        ${r.equip.map((e) => `<span class="pill">${e}</span>`).join("")}
      </span>
    </div>`;
}

/* ── Tóm tắt bên phải ────────────────────────────── */
function updateSummary() {
  const date  = document.getElementById("f_date").value;
  const start = document.getElementById("f_start").value;
  const end   = document.getElementById("f_end").value;
  const roomId = document.getElementById("f_room").value;
  const host   = document.getElementById("f_host").value;
  const reminder = document.getElementById("f_reminder").value;

  document.getElementById("sumTime").textContent =
    date ? `${fmtDateVN(date)} | ${start || "--:--"} - ${end || "--:--"}` : "—";
  document.getElementById("sumRoom").textContent  = roomId ? roomName(roomId) : "Chưa chọn phòng";
  document.getElementById("sumHost").textContent  = host || "—";
  document.getElementById("sumReminder").textContent = `Trước ${reminder} phút`;
  document.getElementById("sumParticipants").textContent = `${formParticipants.length} thành viên`;
}

/* ── Kiểm tra trùng lịch ─────────────────────────── */
function checkConflict() {
  const box    = document.getElementById("conflictBox");
  const note   = document.getElementById("availabilityNote");
  const date   = document.getElementById("f_date").value;
  const start  = document.getElementById("f_start").value;
  const end    = document.getElementById("f_end").value;
  const roomId = document.getElementById("f_room").value;
  const host   = document.getElementById("f_host")?.value || CURRENT_USER.name;

  if (!date || !start || !end || !roomId || start >= end) {
    box.innerHTML = "";
    note.innerHTML = "";
    return { hasConflict: false, roomConflict: null, busyPeople: [] };
  }

  const editId = state.meetingId || null;
  const conflicts = findScheduleConflicts({
    id: editId,
    date,
    startTime: start,
    endTime: end,
    roomId,
    participants: formParticipants,
    organizer: CURRENT_USER.name,
    host,
  });

  const messages = [];
  if (conflicts.roomConflict) {
    messages.push(`Phòng đã có lịch "<b>${escapeHtml(conflicts.roomConflict.title)}</b>" (${conflicts.roomConflict.startTime}–${conflicts.roomConflict.endTime})`);
  }
  if (conflicts.busyPeople.length) {
    messages.push(`<b>${conflicts.busyPeople.map(escapeHtml).join(", ")}</b> đang bận trong khung giờ này`);
  }

  if (messages.length) {
    box.innerHTML = `<div class="conflict-box conflict-bad">⚠️ ${messages.join("<br>⚠️ ")}</div>`;
    note.className = "availability-note bad";
    note.textContent = "⚠️ Có xung đột lịch";
  } else {
    box.innerHTML = `<div class="conflict-box conflict-ok">✅ Không có xung đột lịch cho phòng họp và thành viên đã chọn.</div>`;
    note.className = "availability-note";
    note.innerHTML = `✓ Tất cả thành viên đều có lịch trống`;
  }

  showRoomInfo();
  return { hasConflict: messages.length > 0, ...conflicts };
}

/* ── Xóa lỗi field ───────────────────────────────── */
function clearFieldErr(inputId) {
  const map = {
    f_title: "field_title",
    f_date:  "field_date",
    f_start: "field_start",
    f_end:   "field_end",
    f_room:  "field_room",
  };
  const fid = map[inputId];
  if (!fid) return;
  const field = document.getElementById(fid);
  field.classList.remove("invalid");
  field.querySelector(".err")?.classList.add("hidden");
}

/* ── Người tham gia ──────────────────────────────── */
function initParticipantSearch() {
  const psearch  = document.getElementById("f_participantSearch");
  const listBox  = document.getElementById("suggestList");

  psearch.addEventListener("input", () => {
    const q = psearch.value.toLowerCase().trim();
    if (!q) { listBox.classList.add("hidden"); return; }

    const matches = STAFF.filter(
      (s) => s.name.toLowerCase().includes(q) && !formParticipants.find((p) => p.name === s.name)
    );

    listBox.innerHTML = matches.length
      ? matches.map((s) => `<div class="suggest-item" data-name="${escapeHtml(s.name)}">
          <span>${escapeHtml(s.name)}</span><small>${escapeHtml(s.dept)}</small>
        </div>`).join("")
      : `<div class="suggest-item">Không tìm thấy nhân viên</div>`;

    listBox.classList.remove("hidden");

    listBox.querySelectorAll(".suggest-item[data-name]").forEach((it) => {
      it.addEventListener("click", () => {
        formParticipants.push({ name: it.dataset.name, status: "pending" });
        psearch.value = "";
        listBox.classList.add("hidden");
        renderParticipantTags();
        updateSummary();
        checkConflict();
      });
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".suggest-box") && !e.target.closest("#btnQuickAdd")) listBox?.classList.add("hidden");
  });
}

function renderParticipantTags() {
  const box = document.getElementById("participantTags");
  document.getElementById("participantCount").textContent = `Đã chọn: ${formParticipants.length} người`;

  if (!formParticipants.length) {
    box.innerHTML = `<span style="color:var(--muted);font-size:13px;">Chưa có thành viên nào được mời</span>`;
    return;
  }

  box.innerHTML = formParticipants
    .map((p, i) => `
      <div class="tag">
        <div class="av">${initials(p.name)}</div>
        <div class="tag-body">
          <span class="tag-name">${escapeHtml(p.name)}</span>
          <span class="tag-status ${p.status}">${respLabel(p.status)}</span>
        </div>
        <span class="x" data-i="${i}">✕</span>
      </div>`)
    .join("");

  box.querySelectorAll(".x").forEach((x) => {
    x.addEventListener("click", () => {
      formParticipants.splice(parseInt(x.dataset.i), 1);
      renderParticipantTags();
      updateSummary();
      checkConflict();
    });
  });
}

/* ── File upload (demo) ──────────────────────────── */
function initFileUpload() {
  const dz = document.getElementById("dropzone");
  const fi = document.getElementById("fileInput");

  const addFiles = (fileArr) => {
    Array.from(fileArr).forEach((f) => {
      const kb  = f.size / 1024;
      const sz  = kb > 1024 ? (kb / 1024).toFixed(1) + " MB" : Math.round(kb) + " KB";
      formFiles.push({ name: f.name, size: sz });
    });
    renderFileList();
  };

  dz.addEventListener("click", () => fi.click());
  fi.addEventListener("change", () => { addFiles(fi.files); fi.value = ""; });

  dz.addEventListener("dragover", (e) => { e.preventDefault(); dz.style.borderColor = "var(--primary)"; });
  dz.addEventListener("dragleave", () => { dz.style.borderColor = ""; });
  dz.addEventListener("drop", (e) => {
    e.preventDefault();
    dz.style.borderColor = "";
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
  });
}

function renderFileList() {
  const box = document.getElementById("fileList");
  box.innerHTML = formFiles
    .map((f, i) => `
      <div class="file-item">
        <div class="f-ic ${fileExtClass(f.name)}">${fileExtIcon(f.name)}</div>
        <div class="f-body">
          <div class="f-name">${escapeHtml(f.name)}</div>
          <div class="f-size">${f.size}</div>
        </div>
        <span class="x" data-i="${i}" title="Xóa">🗑️</span>
      </div>`)
    .join("");

  box.querySelectorAll(".x").forEach((x) => {
    x.addEventListener("click", () => {
      formFiles.splice(parseInt(x.dataset.i), 1);
      renderFileList();
    });
  });
}

/* ── Submit form ─────────────────────────────────── */
function submitForm(editId) {
  /* Lấy giá trị */
  const title    = document.getElementById("f_title").value.trim();
  const desc     = document.getElementById("f_desc").value.trim();
  const date     = document.getElementById("f_date").value;
  const start    = document.getElementById("f_start").value;
  const end      = document.getElementById("f_end").value;
  const roomId   = document.getElementById("f_room").value;
  const link     = document.getElementById("f_link").value.trim();
  const host     = document.getElementById("f_host").value;
  const reminder = document.getElementById("f_reminder").value;
  const timezone = document.getElementById("f_timezone").value;
  const repeat   = document.getElementById("f_repeat").value;
  const format   = document.querySelector('input[name="f_format"]:checked').value;

  /* Validate */
  let valid = true;
  const fail  = (fid) => { valid = false; const f = document.getElementById(fid); f.classList.add("invalid"); f.querySelector(".err")?.classList.remove("hidden"); };
  const clear = (fid) => { const f = document.getElementById(fid); f.classList.remove("invalid"); f.querySelector(".err")?.classList.add("hidden"); };

  ["field_title","field_date","field_start","field_end","field_room"].forEach(clear);

  if (!title)                                fail("field_title");
  if (!date)                                 fail("field_date");
  else if (date < todayStr(0))               fail("field_date");
  if (!start)                                fail("field_start");
  if (!end)                                  fail("field_end");
  else if (start && end && end <= start)     fail("field_end");
  if (!roomId)                               fail("field_room");

  if (!valid) { toast("Vui lòng kiểm tra lại các trường bắt buộc"); return; }

  /* Tự động kiểm tra trùng lịch phòng họp và người tham gia bận – không cho lưu nếu có xung đột */
  const conflicts = findScheduleConflicts({
    id: editId,
    date,
    startTime: start,
    endTime: end,
    roomId,
    participants: formParticipants,
    organizer: CURRENT_USER.name,
    host,
  });
  if (conflicts.roomConflict || conflicts.busyPeople.length) {
    checkConflict();
    const parts = [];
    if (conflicts.roomConflict) parts.push(`phòng họp đang trùng lịch với "${conflicts.roomConflict.title}"`);
    if (conflicts.busyPeople.length) parts.push(`${conflicts.busyPeople.join(", ")} đang bận`);
    toast("Không thể lưu vì " + parts.join(" và "));
    return;
  }

  /* Lưu */
  const list = getMeetings();

  if (editId) {
    /* ── Cập nhật ── */
    const m = list.find((x) => x.id === editId);
    if (!m) { toast("Không tìm thấy cuộc họp cần sửa"); return; }
    Object.assign(m, { title, description: desc, date, startTime: start, endTime: end,
      roomId, format, onlineLink: link, host, reminder, timezone, repeat });
    m.participants = formParticipants.map((p) => ({
      name:   p.name,
      role:   STAFF.find((s) => s.name === p.name)?.dept || "",
      status: m.participants.find((x) => x.name === p.name)?.status || "pending",
    }));
    m.attachments = [...formFiles];
    m.status = computeMeetingStatus(m);
    m.history.push({ text: "Cập nhật nội dung bởi " + CURRENT_USER.name, time: new Date().toLocaleString("vi-VN") });
    saveMeetings(list);
    toast("Đã lưu thay đổi cuộc họp");
    navigate("detail", { meetingId: editId });

  } else {
    /* ── Tạo mới ── */
    const id = genId();
    const newMeeting = {
      id, title, description: desc, organizer: CURRENT_USER.name, host,
      date, startTime: start, endTime: end, roomId, format, onlineLink: link, reminder, timezone, repeat,
      participants: formParticipants.map((p) => ({
        name: p.name, role: STAFF.find((s) => s.name === p.name)?.dept || "", status: "pending",
      })),
      attachments: [...formFiles],
      status: "upcoming",
      myResponse: "accepted",
      history: [{ text: "Được tạo bởi " + CURRENT_USER.name, time: new Date().toLocaleString("vi-VN") }],
    };
    newMeeting.status = computeMeetingStatus(newMeeting);
    list.push(newMeeting);
    saveMeetings(list);
    toast("Tạo cuộc họp thành công!");
    navigate("detail", { meetingId: id });
  }
}
