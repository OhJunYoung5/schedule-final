const STORAGE_KEY = "dark_mobile_calendar_icon_fixed_v1";
const CALENDAR_ICON = `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" stroke="currentColor" stroke-width="2"/>
  <path d="M7.5 3.5V7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M16.5 3.5V7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M4 10H20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
</svg>`;

const dateInput = document.getElementById("dateInput");
const memoInput = document.getElementById("memoInput");
const monthInput = document.getElementById("monthInput");

const hourBtn = document.getElementById("hourBtn");
const payBtn = document.getElementById("payBtn");
const addBtn = document.getElementById("addBtn");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const scheduleList = document.getElementById("scheduleList");
const totalHours = document.getElementById("totalHours");
const totalPay = document.getElementById("totalPay");
const summaryTitle = document.getElementById("summaryTitle");
const toast = document.getElementById("toast");

let schedules = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let tempHours = "";
let tempPay = "";
let editId = null;

dateInput.valueAsDate = new Date();
monthInput.value = currentMonth();

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function showToast(text) {
  toast.textContent = text;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1400);
}

function monthKey(value) {
  return value.slice(0, 7);
}

function formatPay(value) {
  return Number(value || 0).toLocaleString("ko-KR") + "원";
}

function formatDate(value) {
  const d = new Date(value + "T00:00:00");
  const week = ["일", "월", "화", "수", "목", "금", "토"][d.getDay()];
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${week})`;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSummary() {
  const selectedMonth = monthInput.value;
  const monthly = schedules.filter((item) => monthKey(item.date) === selectedMonth);

  const hours = monthly.reduce((sum, item) => sum + Number(item.hours || 0), 0);
  const pay = monthly.reduce((sum, item) => sum + Number(item.pay || 0), 0);

  const [year, month] = selectedMonth.split("-");
  summaryTitle.textContent = `월별 합계 (${year}년 ${Number(month)}월)`;
  totalHours.textContent = `${hours}시간`;
  totalPay.textContent = formatPay(pay);
}

function render() {
  renderSummary();

  const selectedMonth = monthInput.value;
  const visible = schedules
    .filter((item) => monthKey(item.date) === selectedMonth)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (visible.length === 0) {
    scheduleList.innerHTML = `
      <div class="empty">
        <div>
          <span class="empty-icon">${CALENDAR_ICON}</span>
          등록된 일정이 없습니다.<br />
          일정을 추가해보세요.
        </div>
      </div>
    `;
    return;
  }

  scheduleList.innerHTML = "";

  visible.forEach((item) => {
    const card = document.createElement("article");
    card.className = "schedule-card";

    card.innerHTML = `
      <div class="schedule-date">${formatDate(item.date)}</div>
      <div class="schedule-memo">${escapeHtml(item.memo)}</div>

      <div class="badges">
        <span class="badge">◷ ${item.hours || 0}시간</span>
        <span class="badge">₩ ${formatPay(item.pay)}</span>
      </div>

      <div class="actions">
        <button class="edit" type="button">✎ 수정</button>
        <button class="pay-edit" type="button">₩ 급여수정</button>
        <button class="delete" type="button">🗑 삭제</button>
      </div>
    `;

    card.querySelector(".edit").onclick = () => {
      editId = item.id;
      dateInput.value = item.date;
      memoInput.value = item.memo;
      tempHours = item.hours || "";
      tempPay = item.pay || "";
      addBtn.textContent = "수정 완료";
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    card.querySelector(".pay-edit").onclick = () => {
      const hours = prompt("근무시간 입력", item.hours || "");
      if (hours === null) return;

      const pay = prompt("일당 입력", item.pay || "");
      if (pay === null) return;

      item.hours = hours.replace(/[^0-9.]/g, "");
      item.pay = pay.replace(/[^0-9]/g, "");

      save();
      render();
    };

    card.querySelector(".delete").onclick = () => {
      if (!confirm("삭제할까요?")) return;

      schedules = schedules.filter((schedule) => schedule.id !== item.id);
      save();
      render();
    };

    scheduleList.appendChild(card);
  });
}

hourBtn.onclick = () => {
  const value = prompt("근무시간 입력", tempHours || "");
  if (value === null) return;

  tempHours = value.replace(/[^0-9.]/g, "");
  showToast("근무시간 저장");
};

payBtn.onclick = () => {
  const value = prompt("일당 입력", tempPay || "");
  if (value === null) return;

  tempPay = value.replace(/[^0-9]/g, "");
  showToast("일당 저장");
};

addBtn.onclick = () => {
  const date = dateInput.value;
  const memo = memoInput.value.trim();

  if (!date) return showToast("날짜를 선택하세요");
  if (!memo) return showToast("일정을 입력하세요");

  if (editId) {
    schedules = schedules.map((item) =>
      item.id === editId
        ? { ...item, date, memo, hours: tempHours, pay: tempPay }
        : item
    );
    showToast("수정 완료");
  } else {
    schedules.push({
      id: Date.now().toString(),
      date,
      memo,
      hours: tempHours,
      pay: tempPay
    });
    showToast("일정 추가 완료");
  }

  save();
  monthInput.value = monthKey(date);

  memoInput.value = "";
  tempHours = "";
  tempPay = "";
  editId = null;
  addBtn.textContent = "일정 추가";

  render();
};

function moveMonth(amount) {
  const [year, month] = monthInput.value.split("-").map(Number);
  const d = new Date(year, month - 1 + amount, 1);
  monthInput.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  render();
}

prevBtn.onclick = () => moveMonth(-1);
nextBtn.onclick = () => moveMonth(1);
monthInput.onchange = render;

render();
