const hourlyWage =1100;
const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const now = new Date();
const today = now.getDate();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
let month = currentMonth
let year = currentYear
function createCalendar(Year, Month) {
    let monthlyWage = 0;
    const firstDate = new Date(Year, Month, 1);
    const endDate = new Date(Year, Month + 1, 0);
    const firstDay = firstDate.getDay();
    const endDayCount = endDate.getDate();
    let DayCount = 1
    let calendarHTML = ""
    let calendarHeadHTML = ""
    calendarHeadHTML += `<p>今日は${currentYear}年${currentMonth + 1}月${today}日</p>`
    calendarHeadHTML += `<div class="headerCountainer"><p>${Year}年${Month + 1}月</p>`
    calendarHTML += '<table border=1>'
    for (let i = 0; i < 7; i++) {
        calendarHTML += '<th>' + week[i] + '</th>'
    }
    for (let w = 0; w < Math.ceil((firstDay + endDayCount) / 7); w++) {
        calendarHTML += '<tr>'
        for (let d = 0; d < 7; d++) {
            if (w == 0 && d < firstDay) {
                calendarHTML += '<td></td>'
            } else if (DayCount > endDayCount) {
                calendarHTML += '<td></td>'
            } else if (DayCount == today && currentMonth == Month && currentYear == Year) {
                const dataStr = `${Year}-${Month + 1}-${DayCount}`
                const wage = money(dataStr);
                monthlyWage += wage
                calendarHTML += `<td class="Today" data-date="${dataStr}">${DayCount}<br><small class="dailyWage">¥${wage.toLocaleString()}</small></td>`
                DayCount++
            } else {
                const dataStr = `${Year}-${Month + 1}-${DayCount}`
                const wage = money(dataStr);
                monthlyWage += wage
                calendarHTML += `<td data-date="${dataStr}">${DayCount}<br><small class="dailyWage">¥${wage.toLocaleString()}</small></td>`
                DayCount++
            }

        }
        calendarHTML += '</tr>'
    }
    calendarHeadHTML += `<p id="monthlyWage">${monthlyWage.toLocaleString()} 円</p></div>`
    calendarHTML += '</table>'
    document.querySelector('#calendar').innerHTML = calendarHTML
    document.querySelector('#header').innerHTML = calendarHeadHTML
    addClick();
}//カレンダーの再構成
function money(dataStr){
    console.log(dataStr)
    workKey= `${dataStr}-work`
    breakKey=`${dataStr}-break`
    workTime=localStorage.getItem(workKey)||0;
    breakTime=localStorage.getItem(breakKey)||0;
    actualWorkTime = workTime-breakTime;
    console.log(actualWorkTime);
    salary = Math.floor((actualWorkTime /1000/60)*(hourlyWage /60));
    return salary;
};
function buttonHold(button, actionFn) {
    let timeOutID = null;
    let intervalID = null;
    function clearTimers() {
        clearInterval(intervalID);
        clearTimeout(timeOutID);
        intervalID = null;
        timeOutID = null;
    }
    button.addEventListener('pointerdown', () => {
        actionFn();
        timeOutID = setTimeout(function () {
            intervalID = setInterval(actionFn, 200);
        }, 500)
    });

    button.addEventListener("pointerup", () => {
        clearTimers();
    });
    button.addEventListener("pointerleave", () => {
        clearTimers();
    });
    button.addEventListener("pointercancel", () => {
        clearTimers();
    });
}//ボタンの長押し短押し

const next = document.getElementById("next");
buttonHold(next, function () {
    month++
    if (month == 12) {
        year++
        month = 0
    }
    console.log(month)
    createCalendar(year, month)
})

const back = document.getElementById("back");
buttonHold(back, function () {
    month--
    if (month == -1) {
        year--
        month = 11
    }
    console.log(month)
    createCalendar(year, month)
})

function customPrompt(dateKey, currentMemo, workTimestrage, breakTimeStrage, callback) {
    const modal = document.getElementById('customPrompt');
    const time = document.getElementById('workTime');
    const breakTime = document.getElementById('breakInput');
    const textarea = document.getElementById('promptInput');
    const text = document.getElementById('promptText');

    textarea.value = currentMemo;
    time.value = MsToString(workTimestrage);
    breakTime.value = MsToString(breakTimeStrage);
    text.textContent = `${dateKey}のメモ`;
    modal.style.display = 'flex';


    document.getElementById('ok').onclick = () => {
        modal.style.display = 'none';
        callback(textarea.value, StringToMs(time.value), StringToMs(breakTime.value));
        createCalendar(year,month);
    };
    document.getElementById('del').onclick = () => {
        modal.style.display = 'none';
        callback(null);
        createCalendar(year,month);
    };
    document.getElementById('close').onclick = () => {
        modal.style.display = 'none';
    }
    modal.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
};

function addClick() {
    document.querySelectorAll('td[data-date]').forEach(cell => {
        cell.addEventListener('click', () => {
            const dateKey = cell.getAttribute('data-date');
            const workKey = `${dateKey}-work`
            const breakKey = `${dateKey}-break`
            const memo = localStorage.getItem(dateKey) || "";
            const work = localStorage.getItem(workKey) || "";
            const breakTime = localStorage.getItem(breakKey) || "";
            customPrompt(dateKey, memo, work, breakTime, (result, timeResult,breakResult) => {
                if (result == null) {
                    localStorage.removeItem(dateKey);
                    localStorage.removeItem(workKey);
                    localStorage.removeItem(breakKey);
                } else {
                    localStorage.setItem(dateKey, result);
                    localStorage.setItem(workKey, timeResult);
                    localStorage.setItem(breakKey,breakResult);
                }
            });
        });
    });
}
createCalendar(currentYear, currentMonth);

document.getElementById("menu").addEventListener("click", menuModal)

function menuModal() {
    const menuModal = document.getElementById("menuModal");
    menuModal.style.display = "flex"

    document.getElementById("menuClose").onclick = () => {
        menuModal.style.display = "none"
    };
    document.querySelectorAll(".menuModalButton").forEach(cell => {
        cell.addEventListener("click", () => {
            menuModal.style.display = "none"
        });
    });
    document.getElementById("menuModal").onclick = (event) => {
        if (event.target == menuModal) {
            menuModal.style.display = "none"
        };
    };

};

document.getElementById('banner').addEventListener("click",(event)=>{
    event.target.classList.add("banish");
    banishTimeOut = setTimeout(() => {
    event.target.classList.remove("banish");
    }, 3000);
});

function clockIn() {
    if(localStorage.getItem("working")=="false"){
        alert("出勤");
        const getTime = new Date();
        localStorage.setItem("clockInTime", getTime.toISOString());
        localStorage.setItem("working", "true");
        document.getElementById("updateBreak").textContent=`休憩 0時0間分0秒`
        showBanner();
    }else[
        alert("出勤済")
    ]
};

function showBanner() {
    document.getElementById("banner").style.display = "flex";
    updateTime();
    workStart = setInterval(updateTime, 1000);
};

function updateTime() {
    const clockInTime = localStorage.getItem("clockInTime");
    if (!clockInTime) return;

    const start = new Date(clockInTime);
    const now = new Date();
    const diffMs = now - start;
    const diffSec = Math.floor(diffMs / 1000);
    const [hours,minutes]= MsToString(diffMs).split(":").map(Number)
    const seconds = diffSec % 60;
    if(localStorage.getItem("breakFlg")=="true"){/*!変数の頭にBつけてるよ！breakのB*/
        const breakInTime = new Date(localStorage.getItem("breakInTime"));
        const BdiffMs = now - breakInTime;
        const [Bhours,Bminutes]= MsToString(BdiffMs).split(":").map(Number)
        const Bseconds = Math.floor(BdiffMs/1000)%60;
        document.getElementById("updateBreak").textContent=`休憩 ${Bhours}時間${Bminutes}分${Bseconds}秒`
    }

    document.getElementById("updateTime").textContent = `出勤 ${hours}時間${minutes}分${seconds}秒`
}
function clockOut() {
    const currentWorkKey = `${currentYear}-${currentMonth + 1}-${today}-work`
    const getTime = new Date();
    if (localStorage.getItem("working") == "true") {
        alert("退勤");
        const clockInTime = new Date(localStorage.getItem("clockInTime"));
        const workingTime = Math.floor((getTime - clockInTime)/60000)*60000;
        localStorage.setItem(currentWorkKey, workingTime);
        clearInterval(workStart);
        document.getElementById('banner').style.display = "none";
        localStorage.setItem("working", "false");
        localStorage.removeItem("clockInTime");
        breakEnd();
    } else {
        alert("未出勤")
    }
};
function breakStart() {
    if (localStorage.getItem("working") == "true") {
        alert("休憩開始")
        const getTime = new Date();
        localStorage.setItem("breakInTime", getTime.toISOString());
        localStorage.setItem("breakFlg", "true");
    } else {
        alert("未出勤");
    }
};
function breakEnd() {
    const currentBreakKey = `${currentYear}-${currentMonth + 1}-${today}-break`
    if (localStorage.getItem("breakFlg") == "true") {
        alert("休憩終了");
        const getTime = new Date();
        const breakInTime = new Date(localStorage.getItem("breakInTime"));
        const breakTime = Math.floor((getTime - breakInTime)/60000)*60000;
        localStorage.setItem(currentBreakKey, breakTime);
        localStorage.setItem("breakFlg","false");
        localStorage.removeItem("breakInTime");
    } else if(localStorage.getItem("working")=="true"){
        alert("未休憩");
    }
};
function MsToString(Ms) {
    const Minutes = Math.floor(Ms / 60000);
    const hours = String(Math.floor(Minutes / 60)).padStart(2, "0");
    const minutes = String(Math.floor(Minutes % 60)).padStart(2, "0");
    return `${hours}:${minutes}`;
};
function StringToMs(TimeString) {
    const [hour, minute] = TimeString.split(':').map(Number);
    return (hour * 60 + minute) * 60 * 1000;
}
window.onload = function () {
    const isWorking = localStorage.getItem("working");
    if (isWorking == "true") {
        showBanner();
    } else {
        localStorage.setItem("working", "false");
    }
};
document.getElementById("start").addEventListener("click", clockIn);
document.getElementById("end").addEventListener("click",()=>{ 
    clockOut();
    createCalendar(year,month);
});
document.getElementById("break").addEventListener("click", breakStart);
document.getElementById("breakEnd").addEventListener("click", breakEnd);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").then(reg => {
      console.log("Service Worker registered", reg);
    }).catch(err => {
      console.error("Service Worker registration failed:", err);
    });
  });
}
