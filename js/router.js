/* js/router.js – Điều phối navigation giữa các view */

let state = { view: "dashboard", meetingId: null };

function setActiveNav(view) {
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.classList.toggle("active", a.dataset.view === view);
  });
}

function navigate(view, params = {}) {
  state = { view, ...params };
  // highlight sidebar: detail/edit đều thuộc nhóm dashboard
  const navMap = {
    detail: "my-meetings",
    edit: "my-meetings",
  };
  setActiveNav(navMap[view] || view);
  render();
  window.scrollTo(0, 0);
}

function render() {
  const c = document.getElementById("content");

  switch (state.view) {
    case "dashboard":
      c.innerHTML = viewDashboard();
      initDashboard();
      break;
    case "my-meetings":
      c.innerHTML = viewDashboard({
        mode: "my-meetings",
        title: "Quản lý cuộc họp",
        sub: "Các cuộc họp bạn tổ chức hoặc được mời tham gia",
      });
      initDashboard({ mode: "my-meetings" });
      break;
    case "dashboard-created":
      c.innerHTML = viewDashboard({
        mode: "created",
        title: "Cuộc họp đã tạo",
        sub: "Danh sách các cuộc họp do bạn tạo và tổ chức",
      });
      initDashboard({ mode: "created" });
      break;
    case "create":
      c.innerHTML = viewForm(null);
      initForm(null);
      break;
    case "edit":
      c.innerHTML = viewForm(state.meetingId);
      initForm(state.meetingId);
      break;
    case "detail":
      c.innerHTML = viewDetail(state.meetingId);
      initDetail(state.meetingId);
      break;
    case "profile":
      c.innerHTML = viewProfile();
      initProfile();
      break;
    default:
      c.innerHTML = `<div class="empty">404 – Không tìm thấy trang.</div>`;
  }
}

/* Gắn sự kiện sidebar */
function initRouter() {
  document.querySelectorAll(".nav-link").forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      navigate(a.dataset.view);
    });
  });

  document.getElementById("changePwBtn").addEventListener("click", (e) => {
    e.preventDefault();
    toast("Tính năng đổi mật khẩu sẽ sớm ra mắt (demo)");
  });

  document.getElementById("logoutBtn").addEventListener("click", (e) => {
    e.preventDefault();
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      toast("Đã đăng xuất (demo)");
    }
  });

  document.getElementById("bellBtn").addEventListener("click", () => {
    toast("Bạn không có thông báo mới");
  });

  /* global search box → filter trong dashboard */
  document.getElementById("globalSearch").addEventListener("input", (e) => {
    if (!["dashboard", "my-meetings", "dashboard-created"].includes(state.view)) navigate("dashboard");
    setTimeout(() => {
      const f = document.getElementById("filterSearch");
      if (f) { f.value = e.target.value; applyFilters(); }
    }, 0);
  });
}
