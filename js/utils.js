/* js/utils.js – Helper functions dùng chung */

const CURRENT_USER = {
  name: "Nguyễn Văn A",
  initials: "NA",
  dept: "Phòng Quản lý dự án",
  role: "Quản lý dự án",
  email: "nguyenvana@xyzcompany.com",
  phone: "090 123 4567",
};

function initials(name) {
  const parts = name.trim().split(" ");
  return (parts[parts.length - 2]?.[0] || "") + (parts[parts.length - 1]?.[0] || "");
}

function fileExtClass(name) {
  const ext = (name.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext)) return "docx";
  if (["xls", "xlsx", "csv"].includes(ext)) return "xlsx";
  return "other";
}

function fileExtIcon(name) {
  const cls = fileExtClass(name);
  return { pdf: "📕", docx: "📘", xlsx: "📗", other: "📄" }[cls];
}

function fmtTime12(t) {
  if (!t) return "--:--";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

function todayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function fmtDateVN(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/* Tự động thêm dấu "/" khi gõ số vào ô ngày dạng dd/mm/yyyy */
function maskDateInput(el) {
  const digits = el.value.replace(/\D/g, "").slice(0, 8);
  let out = digits;
  if (digits.length > 4) out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  else if (digits.length > 2) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  el.value = out;
}

/* Chuyển "dd/mm/yyyy" -> "yyyy-mm-dd" (ISO) để so sánh/lọc; trả "" nếu chưa hợp lệ/chưa nhập đủ */
function parseVNDate(str) {
  const m = (str || "").match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return "";
  const [, d, mo, y] = m;
  const day = Number(d), month = Number(mo), year = Number(y);
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return "";
  return `${y}-${mo}-${d}`;
}

function overlap(s1, e1, s2, e2) {
  return s1 < e2 && s2 < e1;
}

function escapeHtml(s) {
  return (s || "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}

function statusLabel(s) {
  return (
    { upcoming: "Sắp diễn ra", ongoing: "Đang diễn ra", done: "Đã hoàn thành", cancelled: "Đã hủy" }[s] || s
  );
}

function statusPillClass(s) {
  return (
    { upcoming: "pill-upcoming", ongoing: "pill-ongoing", done: "pill-done", cancelled: "pill-cancelled" }[s] || ""
  );
}

function respLabel(r) {
  return (
    { accepted: "Đã đồng ý", declined: "Đã từ chối", pending: "Chờ phản hồi", invited: "Đã mời", none: "Chưa phản hồi" }[r] || r
  );
}

function respPillClass(r) {
  return (
    { accepted: "pill-accepted", declined: "pill-declined", pending: "pill-pending", invited: "pill-invited", none: "pill-pending" }[r] || ""
  );
}

let _toastTimer;
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}
