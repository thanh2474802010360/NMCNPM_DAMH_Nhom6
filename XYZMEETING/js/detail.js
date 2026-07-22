/* js/detail.js – View chi tiết cuộc họp */

let detailLiveTimer = null;

/* ── HTML ────────────────────────────────────────── */
function viewDetail(id) {
  const m = getMeeting(id);
  if (!m) return `<div class="empty">Không tìm thấy cuộc họp.</div>`;

  const isOwner   = m.organizer === CURRENT_USER.name;
  const canEdit   = isOwner && ["upcoming", "ongoing"].includes(m.status);
  const canCancel = isOwner && ["upcoming", "ongoing"].includes(m.status);
  const canDelete = isOwner;
  const canRespond = canCurrentUserRespond(m);
  const myParticipantStatus = participantStatusOf(m, CURRENT_USER.name);

  const accepted = m.participants.filter((p) => p.status === "accepted").length;
  const pending  = m.participants.filter((p) => p.status === "pending" || p.status === "invited").length;
  const declined = m.participants.filter((p) => p.status === "declined").length;

  const responsePanel = canRespond ? `
        <!-- Xác nhận tham gia -->
        <div class="summary-card response-card" style="margin-bottom:16px;">
          <h3>Xác nhận tham gia</h3>
          <div class="status-box">
            <span class="ic">🙋</span>
            Trạng thái:&nbsp;<b>${respLabel(myParticipantStatus)}</b>
          </div>
          <button class="full-btn green ${myParticipantStatus === "accepted" ? "active-state" : ""}"
            id="btnAccept" ${myParticipantStatus === "accepted" ? "disabled" : ""}>✅ Đồng ý tham gia</button>
          <button class="full-btn red ${myParticipantStatus === "declined" ? "active-state" : ""}"
            id="btnDecline" ${myParticipantStatus === "declined" ? "disabled" : ""}>✖️ Từ chối tham gia</button>
        </div>` : "";

  return `
    <a href="#" class="back-link" id="backLink">← Quay lại danh sách</a>

    <div class="detail-header">
      <div>
        <h2 class="page-title" style="margin-bottom:6px;">${escapeHtml(m.title)}</h2>
        <span class="pill ${statusPillClass(m.status)}">${statusLabel(m.status)}</span>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn" id="btnShare">🔗 Chia sẻ</button>
        <button class="btn btn-primary" id="btnEdit" ${!canEdit ? "disabled" : ""}>✏️ Chỉnh sửa</button>
        <button class="btn btn-outline-red" id="btnCancelMeeting" ${!canCancel ? "disabled" : ""}>🚫 Hủy họp</button>
        <button class="btn btn-outline-red" id="btnDeleteMeeting" ${!canDelete ? "disabled" : ""}>🗑️ Xóa</button>
      </div>
    </div>

    <div class="detail-grid">

      <!-- CỘT TRÁI -->
      <div>

        <!-- Nội dung -->
        <div class="panel">
          <h3>📄 Nội dung cuộc họp</h3>
          <p style="font-size:14px;line-height:1.7;color:#374151;">
            ${escapeHtml(m.description) || "<i>Không có mô tả</i>"}
          </p>
          <hr class="divider">
          <div class="meta-grid">
            <div class="meta-item">
              <div class="ic">📅</div>
              <div><div class="lbl">Ngày diễn ra</div><div class="val">${fmtDateVN(m.date)}</div></div>
            </div>
            <div class="meta-item">
              <div class="ic">📍</div>
              <div><div class="lbl">Địa điểm</div><div class="val">${roomName(m.roomId)}</div></div>
            </div>
            <div class="meta-item">
              <div class="ic">🕒</div>
              <div><div class="lbl">Thời gian</div><div class="val">${m.startTime} - ${m.endTime}</div></div>
            </div>
            <div class="meta-item">
              <div class="ic">🔗</div>
              <div>
                <div class="lbl">Link tham gia</div>
                <div class="val">
                  ${m.onlineLink
                    ? `<a href="#" style="color:var(--primary);">${escapeHtml(m.onlineLink)}</a>`
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tài liệu đính kèm -->
        <div class="panel">
          <h3>📎 Tài liệu đính kèm</h3>
          ${m.attachments.length === 0
            ? `<p style="color:var(--muted);font-size:13px;">Không có tài liệu đính kèm</p>`
            : `<div class="att-grid">
                ${m.attachments.map((a) => `
                  <div class="att">
                    <div class="ic">📄</div>
                    <div style="flex:1;">
                      <div class="name">${escapeHtml(a.name)}</div>
                      <div class="size">${a.size}</div>
                    </div>
                    <div>⬇️</div>
                  </div>`).join("")}
              </div>`}
        </div>

        <!-- Lịch sử -->
        <div class="panel">
          <h3>🕘 Lịch sử cập nhật</h3>
          ${m.history.slice().reverse().map((h) => `
            <div class="history-item">
              <div class="history-dot">•</div>
              <div class="history-txt">
                ${escapeHtml(h.text)}
                <div class="history-time">${escapeHtml(h.time)}</div>
              </div>
            </div>`).join("")}
        </div>

      </div><!-- /CỘT TRÁI -->

      <!-- CỘT PHẢI -->
      <div>

        ${responsePanel}

        <!-- Người tổ chức -->
        <div class="summary-card" style="margin-bottom:16px;">
          <h3>Người tạo cuộc họp</h3>
          <div class="participant-left">
            <div class="av" style="width:40px;height:40px;font-size:14px;">${initials(m.organizer)}</div>
            <div>
              <div class="participant-name">${escapeHtml(m.organizer)}</div>
              <div class="participant-role">Chủ trì: ${escapeHtml(m.host)}</div>
            </div>
          </div>
        </div>

        <!-- Người tham gia -->
        <div class="summary-card">
          <h3>Người tham gia (${m.participants.length})</h3>
          <div class="summary-counts">
            <div><div class="n" style="color:var(--green);">${accepted}</div><div class="l">Đồng ý</div></div>
            <div><div class="n" style="color:var(--amber);">${pending}</div><div class="l">Chờ</div></div>
            <div><div class="n" style="color:var(--red);">${declined}</div><div class="l">Từ chối</div></div>
          </div>
          ${m.participants.map((p) => `
            <div class="participant-row">
              <div class="participant-left">
                <div class="av">${initials(p.name)}</div>
                <div>
                  <div class="participant-name">${escapeHtml(p.name)}</div>
                  <div class="participant-role">${escapeHtml(p.role || "")}</div>
                </div>
              </div>
              <span class="pill ${respPillClass(p.status)}">${respLabel(p.status)}</span>
            </div>`).join("")}
        </div>

      </div><!-- /CỘT PHẢI -->

    </div>
  `;
}

/* ── Khởi tạo sự kiện detail ─────────────────────── */
function initDetail(id) {
  if (detailLiveTimer) clearInterval(detailLiveTimer);
  detailLiveTimer = setInterval(() => {
    if (state.view === "detail" && state.meetingId === id) {
      const latest = getMeeting(id);
      if (latest) navigate("detail", { meetingId: id });
    }
  }, 30000);

  document.getElementById("backLink").addEventListener("click", (e) => {
    e.preventDefault();
    navigate("my-meetings");
  });

  document.getElementById("btnEdit").addEventListener("click", () =>
    navigate("edit", { meetingId: id })
  );

  document.getElementById("btnShare").addEventListener("click", () =>
    toast("Đã sao chép liên kết chia sẻ (demo)")
  );

  document.getElementById("btnCancelMeeting").addEventListener("click", () => {
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
    toast("Đã hủy cuộc họp");
    navigate("detail", { meetingId: id });
  });

  document.getElementById("btnDeleteMeeting").addEventListener("click", () => {
    if (!confirm("Bạn có chắc muốn xóa vĩnh viễn cuộc họp này không?")) return;
    deleteMeeting(id);
    toast("Đã xóa cuộc họp");
    navigate("my-meetings");
  });

  /* Xác nhận tham gia */
  const btnAccept = document.getElementById("btnAccept");
  const btnDecline = document.getElementById("btnDecline");
  if (btnAccept) btnAccept.addEventListener("click", () => setResponse(id, "accepted"));
  if (btnDecline) btnDecline.addEventListener("click", () => setResponse(id, "declined"));
}

function setResponse(id, val) {
  const updated = setParticipantResponse(id, CURRENT_USER.name, val);
  if (!updated) { toast("Không thể cập nhật phản hồi cho cuộc họp này"); return; }
  toast(val === "accepted" ? "Đã đồng ý tham gia" : "Đã từ chối tham gia");
  navigate("detail", { meetingId: id });
}
