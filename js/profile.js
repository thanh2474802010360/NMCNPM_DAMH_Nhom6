/* js/profile.js – View "Hồ sơ cá nhân" */

function viewProfile() {
  const list      = getMeetings();
  const organized = list.filter((m) => m.organizer === CURRENT_USER.name).length;
  const joined    = list.filter((m) => m.participants.some((p) => p.name === CURRENT_USER.name)).length;

  return `
    <div class="breadcrumb">Dashboard &gt; <b>Hồ sơ cá nhân</b></div>
    <h2 class="page-title">Hồ sơ cá nhân</h2>
    <p class="page-sub">Thông tin tài khoản của bạn trong hệ thống quản lý họp</p>

    <div class="panel">
      <div class="profile-hero">
        <div class="avatar">${CURRENT_USER.initials}</div>
        <div>
          <div class="p-name">${escapeHtml(CURRENT_USER.name)}</div>
          <div class="p-role">${escapeHtml(CURRENT_USER.role)} · ${escapeHtml(CURRENT_USER.dept)}</div>
        </div>
      </div>
      <div class="profile-grid">
        <div class="profile-item">
          <div class="lbl">Email</div>
          <div class="val">${escapeHtml(CURRENT_USER.email)}</div>
        </div>
        <div class="profile-item">
          <div class="lbl">Điện thoại</div>
          <div class="val">${escapeHtml(CURRENT_USER.phone)}</div>
        </div>
        <div class="profile-item">
          <div class="lbl">Phòng ban</div>
          <div class="val">${escapeHtml(CURRENT_USER.dept)}</div>
        </div>
        <div class="profile-item">
          <div class="lbl">Chức vụ</div>
          <div class="val">${escapeHtml(CURRENT_USER.role)}</div>
        </div>
      </div>
    </div>

    <div class="stats" style="grid-template-columns:repeat(2,1fr);">
      <div class="stat-card">
        <div class="row1"><div class="stat-icon" style="background:var(--blue-bg);">📋</div></div>
        <div class="num">${organized}</div>
        <div class="label">Cuộc họp đã tạo</div>
      </div>
      <div class="stat-card">
        <div class="row1"><div class="stat-icon" style="background:var(--green-bg);">👥</div></div>
        <div class="num">${joined}</div>
        <div class="label">Cuộc họp tham gia</div>
      </div>
    </div>

    <div class="panel">
      <h3>🔒 Bảo mật</h3>
      <p style="font-size:13px;color:var(--muted);margin-bottom:14px;">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn.</p>
      <button class="btn btn-primary" id="btnChangePassword">Đổi mật khẩu</button>
    </div>
  `;
}

function initProfile() {
  document.getElementById("btnChangePassword").addEventListener("click", () => {
    toast("Tính năng đổi mật khẩu sẽ sớm ra mắt (demo)");
  });
}
