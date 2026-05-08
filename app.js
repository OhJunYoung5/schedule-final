
const STORAGE_KEY = 'spacious_schedule_app_v1';

const dateInput = document.getElementById('dateInput');
const memoInput = document.getElementById('memoInput');
const monthInput = document.getElementById('monthInput');

const addBtn = document.getElementById('addBtn');
const hourBtn = document.getElementById('hourBtn');
const payBtn = document.getElementById('payBtn');

const scheduleList = document.getElementById('scheduleList');

const totalHours = document.getElementById('totalHours');
const totalPay = document.getElementById('totalPay');
const summaryTitle = document.getElementById('summaryTitle');

let schedules = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

let tempHours = '';
let tempPay = '';
let editId = null;

dateInput.valueAsDate = new Date();
monthInput.value = currentMonth();

function currentMonth(){
const d = new Date();
return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
}

function save(){
localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
}

function monthKey(v){
return v.slice(0,7);
}

function pay(v){
return Number(v||0).toLocaleString('ko-KR') + '원';
}

function dateText(v){
const d = new Date(v+'T00:00:00');
const w = ['일','월','화','수','목','금','토'][d.getDay()];
return `${d.getMonth()+1}월 ${d.getDate()}일 (${w})`;
}

function renderSummary(){

const list = schedules.filter(i => monthKey(i.date) === monthInput.value);

const hourSum = list.reduce((a,b)=>a+Number(b.hours||0),0);
const paySum = list.reduce((a,b)=>a+Number(b.pay||0),0);

const [y,m] = monthInput.value.split('-');

summaryTitle.textContent = `월별 합계 (${y}년 ${Number(m)}월)`;

totalHours.textContent = hourSum + '시간';
totalPay.textContent = pay(paySum);
}

function render(){

renderSummary();

const list = schedules
.filter(i => monthKey(i.date) === monthInput.value)
.sort((a,b)=>b.date.localeCompare(a.date));

if(list.length === 0){
scheduleList.innerHTML = `<div class="empty">등록된 일정이 없습니다.<br>일정을 추가해보세요.</div>`;
return;
}

scheduleList.innerHTML = '';

list.forEach(item => {

const div = document.createElement('div');
div.className = 'schedule-card';

div.innerHTML = `
<div class="date">${dateText(item.date)}</div>

<div class="memo">${item.memo}</div>

<div class="badges">
<div class="badge">◷ ${item.hours || 0}시간</div>
<div class="badge">₩ ${pay(item.pay)}</div>
</div>

<div class="actions">
<button class="edit">✎ 수정</button>
<button class="payEdit">₩ 급여수정</button>
<button class="delete">🗑 삭제</button>
</div>
`;

div.querySelector('.edit').onclick = () => {

editId = item.id;

dateInput.value = item.date;
memoInput.value = item.memo;

tempHours = item.hours;
tempPay = item.pay;

addBtn.textContent = '수정 완료';

window.scrollTo({
top:0,
behavior:'smooth'
});

};

div.querySelector('.payEdit').onclick = () => {

const h = prompt('근무시간 입력', item.hours || '');
if(h === null) return;

const p = prompt('일당 입력', item.pay || '');
if(p === null) return;

item.hours = h.replace(/[^0-9]/g,'');
item.pay = p.replace(/[^0-9]/g,'');

save();
render();

};

div.querySelector('.delete').onclick = () => {

if(!confirm('삭제할까요?')) return;

schedules = schedules.filter(s => s.id !== item.id);

save();
render();

};

scheduleList.appendChild(div);

});

}

hourBtn.onclick = () => {
const v = prompt('근무시간 입력', tempHours || '');
if(v !== null) tempHours = v.replace(/[^0-9]/g,'');
};

payBtn.onclick = () => {
const v = prompt('일당 입력', tempPay || '');
if(v !== null) tempPay = v.replace(/[^0-9]/g,'');
};

addBtn.onclick = () => {

const date = dateInput.value;
const memo = memoInput.value.trim();

if(!date || !memo) return;

if(editId){

schedules = schedules.map(item =>
item.id === editId
? {...item, date, memo, hours:tempHours, pay:tempPay}
: item
);

}else{

schedules.push({
id: Date.now().toString(),
date,
memo,
hours: tempHours,
pay: tempPay
});

}

save();

monthInput.value = monthKey(date);

memoInput.value = '';
tempHours = '';
tempPay = '';
editId = null;

addBtn.textContent = '일정 추가';

render();

};

document.getElementById('prevBtn').onclick = () => moveMonth(-1);
document.getElementById('nextBtn').onclick = () => moveMonth(1);

function moveMonth(n){

const [y,m] = monthInput.value.split('-').map(Number);

const d = new Date(y, m-1+n, 1);

monthInput.value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;

render();

}

monthInput.onchange = render;

render();
