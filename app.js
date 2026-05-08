
const STORAGE_KEY = "schedule_clean_v1";

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
monthInput.value = getCurrentMonth();

function getCurrentMonth(){
const d = new Date();
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

function save(){
localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function showToast(text){
toast.textContent = text;
toast.classList.add("show");
setTimeout(()=>toast.classList.remove("show"),1400);
}

function formatDate(v){
const d = new Date(v+"T00:00:00");
const w = ["일","월","화","수","목","금","토"][d.getDay()];
return `${d.getMonth()+1}월 ${d.getDate()}일 (${w})`;
}

function monthKey(v){
return v.slice(0,7);
}

function formatPay(v){
return Number(v||0).toLocaleString("ko-KR")+"원";
}

function escapeHtml(text){
return text
.replaceAll("&","&amp;")
.replaceAll("<","&lt;")
.replaceAll(">","&gt;")
.replaceAll('"',"&quot;")
.replaceAll("'","&#039;");
}

function renderSummary(){

const selected = monthInput.value;

const list = schedules.filter(s=>monthKey(s.date)===selected);

const hourSum = list.reduce((a,b)=>a+Number(b.hours||0),0);
const paySum = list.reduce((a,b)=>a+Number(b.pay||0),0);

const [y,m] = selected.split("-");

summaryTitle.textContent = `월별 합계 (${y}년 ${Number(m)}월)`;

totalHours.textContent = `${hourSum}시간`;
totalPay.textContent = formatPay(paySum);
}

function render(){

renderSummary();

const selected = monthInput.value;

const list = schedules
.filter(s=>monthKey(s.date)===selected)
.sort((a,b)=>b.date.localeCompare(a.date));

if(list.length===0){
scheduleList.innerHTML = `<div class="empty-box">등록된 일정이 없습니다.<br>일정을 추가해보세요.</div>`;
return;
}

scheduleList.innerHTML = "";

list.forEach(item=>{

const card = document.createElement("div");
card.className = "schedule-card";

card.innerHTML = `
<div class="left">
<div class="date">${formatDate(item.date)}</div>
<div class="memo">${escapeHtml(item.memo)}</div>
</div>

<div class="right">

<div class="badges">
<div class="badge">◷ ${item.hours || 0}시간</div>
<div class="badge">₩ ${formatPay(item.pay)}</div>
</div>

<div class="actions">
<button class="edit-btn">✎ 수정</button>
<button class="pay-btn">₩ 급여수정</button>
<button class="delete-btn">🗑 삭제</button>
</div>

</div>
`;

card.querySelector(".edit-btn").onclick = ()=>{

editId = item.id;

dateInput.value = item.date;
memoInput.value = item.memo;

tempHours = item.hours;
tempPay = item.pay;

addBtn.textContent = "수정 완료";

window.scrollTo({
top:0,
behavior:"smooth"
});

};

card.querySelector(".pay-btn").onclick = ()=>{

const h = prompt("근무시간 입력", item.hours || "");
if(h===null) return;

const p = prompt("일당 입력", item.pay || "");
if(p===null) return;

item.hours = h.replace(/[^0-9.]/g,"");
item.pay = p.replace(/[^0-9]/g,"");

save();
render();

};

card.querySelector(".delete-btn").onclick = ()=>{

if(!confirm("삭제할까요?")) return;

schedules = schedules.filter(s=>s.id !== item.id);

save();
render();

};

scheduleList.appendChild(card);

});

}

hourBtn.onclick = ()=>{

const h = prompt("근무시간 입력", tempHours || "");
if(h===null) return;

tempHours = h.replace(/[^0-9.]/g,"");

showToast("근무시간 저장");

};

payBtn.onclick = ()=>{

const p = prompt("일당 입력", tempPay || "");
if(p===null) return;

tempPay = p.replace(/[^0-9]/g,"");

showToast("일당 저장");

};

addBtn.onclick = ()=>{

const date = dateInput.value;
const memo = memoInput.value.trim();

if(!date) return showToast("날짜를 선택하세요");
if(!memo) return showToast("일정을 입력하세요");

if(editId){

schedules = schedules.map(item=>
item.id===editId
? {...item,date,memo,hours:tempHours,pay:tempPay}
: item
);

showToast("수정 완료");

}else{

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

render();

memoInput.value = "";
tempHours = "";
tempPay = "";
editId = null;

addBtn.textContent = "일정 추가";

};

function moveMonth(amount){

const [y,m] = monthInput.value.split("-").map(Number);

const d = new Date(y,m-1+amount,1);

monthInput.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;

render();

}

prevBtn.onclick = ()=>moveMonth(-1);
nextBtn.onclick = ()=>moveMonth(1);

monthInput.onchange = render;

render();
