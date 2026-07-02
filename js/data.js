/* js/data.js – Dữ liệu, localStorage, seed data, CRUD, trạng thái thời gian thực */

const LS_KEY = "xyz_meetings_v2";
const OLD_LS_KEY = "xyz_meetings_v1";

const ROOMS = [
  { id: "r1", name: "Phòng Meeting A1",      capacity: 12,  equip: ["TV", "AC", "WIFI"] },
  { id: "r2", name: "Phòng Alpha (Tầng 3)",  capacity: 12,  equip: ["TV", "AC", "WIFI"] },
  { id: "r3", name: "Phòng Beta (Tầng 5)",   capacity: 8,   equip: ["TV", "WIFI"] },
  { id: "r4", name: "Google Meet (Trực tuyến)", capacity: 100, equip: ["WIFI"] },
];

const STAFF = [
  { id: "u1", name: "Lê Thu Hà",       dept: "Phòng Nhân sự" },
  { id: "u2", name: "Phạm Minh Đức",   dept: "Phòng Công nghệ" },
  { id: "u3", name: "Trần Tiến",        dept: "Phòng Kinh doanh" },
  { id: "u4", name: "Trần Thị B",       dept: "Lead Designer" },
  { id: "u5", name: "Lê Văn C",         dept: "Senior Developer" },
  { id: "u6", name: "Hoàng Anh E",      dept: "Frontend Dev" },
  { id: "u7", name: "Vũ Thu F",         dept: "QA Specialist" },
  { id: "u8", name: "Phạm Minh D",      dept: "Business Analyst" },
];

function seedData() {
  const seed = [
    {
      id: "MTG-00124",
      title: "Review thiết kế Mobile App v2.0",
      description:
        "Xem lại toàn bộ luồng trải nghiệm người dùng (UX) và giao diện (UI) của phiên bản Mobile App 2.0. " +
        "Tập trung vào các tính năng mới như Dark Mode, Voice Command và quy trình Checkout rút gọn.",
      organizer: CURRENT_USER.name,
      host: CURRENT_USER.name,
      date: todayStr(3),
      startTime: "09:00",
      endTime: "10:30",
      roomId: "r1",
      format: "hybrid",
      onlineLink: "meet.google.com/xyz-me",
      reminder: "30",
      participants: [
        { name: "Trần Thị B",   role: "Lead Designer",    status: "accepted" },
        { name: "Lê Văn C",     role: "Senior Developer",  status: "pending" },
        { name: "Phạm Minh D",  role: "Business Analyst",  status: "declined" },
        { name: "Hoàng Anh E",  role: "Frontend Dev",      status: "accepted" },
        { name: "Vũ Thu F",     role: "QA Specialist",     status: "accepted" },
      ],
      attachments: [
        { name: "Figma_Design_v2.pdf",      size: "2.4 MB" },
        { name: "Requirement_Specs.docx",   size: "1.1 MB" },
      ],
      status: "upcoming",
      myResponse: "accepted",
      history: [
        { text: "Được tạo bởi Nguyễn Văn A",       time: "20 Tháng 10, 2023 • 14:30" },
        { text: "Cập nhật nội dung bởi Admin User", time: "24 Tháng 10, 2023 • 09:15" },
      ],
    },
    {
      id: "MTG-00125",
      title: "Review tiến độ Sprint 42",
      description:
        "Đánh giá kết quả công việc Sprint 42, xác định blocker và lên kế hoạch Sprint tiếp theo.",
      organizer: "Trần Thị B",
      host: "Trần Thị B",
      date: todayStr(0),
      startTime: "09:00",
      endTime: "10:30",
      roomId: "r4",
      format: "online",
      onlineLink: "meet.google.com/sprint-42",
      reminder: "10",
      participants: [
        { name: "Nguyễn Văn A", role: "Project Management", status: "accepted" },
        { name: "Lê Văn C",     role: "Senior Developer",   status: "accepted" },
      ],
      attachments: [],
      status: "upcoming",
      myResponse: "accepted",
      history: [{ text: "Được tạo bởi Trần Thị B", time: "18 Tháng 10, 2023 • 11:00" }],
    },
    {
      id: "MTG-00126",
      title: "Họp Sprint Planning",
      description:
        "Lên kế hoạch công việc cho Sprint mới, phân chia nhiệm vụ cho từng thành viên.",
      organizer: CURRENT_USER.name,
      host: CURRENT_USER.name,
      date: todayStr(-2),
      startTime: "09:00",
      endTime: "10:00",
      roomId: "r2",
      format: "offline",
      onlineLink: "",
      reminder: "15",
      participants: [
        { name: "Lê Thu Hà",    role: "Phòng Nhân sự",   status: "accepted" },
        { name: "Phạm Minh Đức", role: "Phòng Công nghệ", status: "accepted" },
      ],
      attachments: [{ name: "Agenda_Hop_Giao_Ban.pdf", size: "1.2 MB" }],
      status: "done",
      myResponse: "accepted",
      history: [
        { text: "Được tạo bởi Nguyễn Văn A",  time: "10 Tháng 10, 2023 • 08:30" },
        { text: "Cuộc họp đã hoàn thành",       time: todayStr(-2) + " • 10:00" },
      ],
    },
    {
      id: "MTG-00127",
      title: "Họp đối tác Quý 4",
      description: "Trao đổi với đối tác về kế hoạch hợp tác quý 4.",
      organizer: "Phạm Minh Đức",
      host: "Phạm Minh Đức",
      date: todayStr(-5),
      startTime: "14:00",
      endTime: "15:00",
      roomId: "r3",
      format: "offline",
      onlineLink: "",
      reminder: "30",
      participants: [{ name: CURRENT_USER.name, role: "Project Management", status: "declined" }],
      attachments: [],
      status: "cancelled",
      myResponse: "declined",
      history: [
        { text: "Được tạo bởi Phạm Minh Đức", time: "1 Tháng 10, 2023 • 09:00" },
        { text: "Cuộc họp đã bị hủy",           time: todayStr(-5) + " • 13:00" },
      ],
    },
  ];
  localStorage.setItem(LS_KEY, JSON.stringify(seed));
}

/* ── Trạng thái thời gian thực ───────────────────── */
function meetingStartDate(m) {
  return new Date(`${m.date}T${m.startTime || "00:00"}:00`);
}
function meetingEndDate(m) {
  return new Date(`${m.date}T${m.endTime || "23:59"}:00`);
}
function computeMeetingStatus(m, now = new Date()) {
  if (!m || m.status === "cancelled") return "cancelled";
  const start = meetingStartDate(m);
  const end   = meetingEndDate(m);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return m.status || "upcoming";
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "done";
}
function normalizeMeeting(m) {
  return {
    attachments: [],
    participants: [],
    history: [],
    myResponse: "none",
    status: "upcoming",
    ...m,
  };
}
function syncStatuses(list) {
  let changed = false;
  const now = new Date();
  list.forEach((m) => {
    const next = computeMeetingStatus(m, now);
    if (m.status !== next && m.status !== "cancelled") {
      m.status = next;
      changed = true;
    }
  });
  return changed;
}

/* ── CRUD ─────────────────────────────────────────── */
function getMeetings() {
  let raw = localStorage.getItem(LS_KEY);
  if (!raw) {
    // Nếu trình duyệt còn dữ liệu phiên bản cũ thì dùng lại, không thì seed mới.
    raw = localStorage.getItem(OLD_LS_KEY);
    if (raw) localStorage.setItem(LS_KEY, raw);
  }
  if (!raw) { seedData(); raw = localStorage.getItem(LS_KEY); }

  let list = [];
  try {
    list = JSON.parse(raw).map(normalizeMeeting);
  } catch (e) {
    seedData();
    list = JSON.parse(localStorage.getItem(LS_KEY)).map(normalizeMeeting);
  }

  const changed = syncStatuses(list);
  if (changed) saveMeetings(list, false);
  return list;
}

function saveMeetings(list, shouldSync = true) {
  const normalized = list.map(normalizeMeeting);
  if (shouldSync) syncStatuses(normalized);
  localStorage.setItem(LS_KEY, JSON.stringify(normalized));
}

function getMeeting(id) {
  return getMeetings().find((m) => m.id === id) || null;
}

function deleteMeeting(id) {
  const list = getMeetings().filter((m) => m.id !== id);
  saveMeetings(list);
}

function genId() {
  let max = 124;
  getMeetings().forEach((m) => {
    const n = parseInt((m.id || "").split("-")[1]);
    if (!Number.isNaN(n) && n > max) max = n;
  });
  return "MTG-" + String(max + 1).padStart(5, "0");
}

/* ── Room helpers ──────────────────────────────────── */
function roomName(id) {
  return ROOMS.find((r) => r.id === id)?.name || "—";
}
function roomObj(id) {
  return ROOMS.find((r) => r.id === id) || null;
}

/* ── Participant helpers ──────────────────────────── */
function participantOf(m, name = CURRENT_USER.name) {
  return (m.participants || []).find((p) => p.name === name) || null;
}
function participantStatusOf(m, name = CURRENT_USER.name) {
  return participantOf(m, name)?.status || "none";
}
function canCurrentUserRespond(m) {
  return m && m.organizer !== CURRENT_USER.name && !!participantOf(m, CURRENT_USER.name) &&
    ["upcoming", "ongoing"].includes(m.status);
}
function setParticipantResponse(meetingId, name, val) {
  const list = getMeetings();
  const m = list.find((x) => x.id === meetingId);
  if (!m) return null;
  const p = participantOf(m, name);
  if (!p) return null;
  p.status = val;
  if (name === CURRENT_USER.name) m.myResponse = val;
  m.history.push({
    text: `${name} đã ${val === "accepted" ? "đồng ý tham gia" : "từ chối tham gia"}`,
    time: new Date().toLocaleString("vi-VN"),
  });
  saveMeetings(list);
  return m;
}

/* ── Kiểm tra trùng lịch phòng và người bận ───────── */
function isPersonBusyInMeeting(m, name) {
  if (!m || m.status === "cancelled") return false;
  if (m.organizer === name || m.host === name) return true;
  return (m.participants || []).some((p) => p.name === name && p.status !== "declined");
}

function findScheduleConflicts({ id = null, date, startTime, endTime, roomId, participants = [], organizer = CURRENT_USER.name, host = CURRENT_USER.name }) {
  if (!date || !startTime || !endTime) return { roomConflict: null, busyPeople: [] };

  // Chỉ kiểm tra người bận đối với Chủ trì và Thành viên tham gia.
  // Người tạo cuộc họp chỉ là người thao tác tạo lịch, không mặc định là người tham gia,
  // nên không bị báo trùng lịch nếu đã chọn phòng khác và chủ trì khác.
  const names = new Set();
  if (host) names.add(host);
  participants.forEach((p) => names.add(typeof p === "string" ? p : p.name));

  const overlaps = getMeetings().filter((m) =>
    m.id !== id &&
    m.status !== "cancelled" &&
    m.date === date &&
    overlap(startTime, endTime, m.startTime, m.endTime)
  );

  const roomConflict = roomId ? overlaps.find((m) => m.roomId === roomId) || null : null;
  const busyPeople = [...names].filter((name) => overlaps.some((m) => isPersonBusyInMeeting(m, name)));

  return { roomConflict, busyPeople, overlappingMeetings: overlaps };
}
