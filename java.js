const hourlyWage = 1100;
const week = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const now = new Date();
const today = now.getDate();
const currentMonth = now.getMonth();
const currentYear = now.getFullYear();
let month = currentMonth
let year = currentYear
function createCalendar(Year, Month) {
    document.getElementById("calendar").innerHTML = "";
    document.getElementById("header").innerHTML = "";
    let monthlyWage = 0;
    const firstDate = new Date(Year, Month, 1);
    const endDate = new Date(Year, Month + 1, 0);
    const firstDay = firstDate.getDay();
    const endDayCount = endDate.getDate();
    let dayCount = 1
    const parent = document.getElementById("calendar")
    const header = document.getElementById("header")
    const fragment = document.createDocumentFragment();

    const headerP = document.createElement("p")
    headerP.textContent = `今日は${currentYear}年${currentMonth + 1}月${today}日`;
    header.appendChild(headerP);

    const headerDiv = document.createElement("div");
    headerDiv.classList.add("headerCountainer");
    header.appendChild(headerDiv);

    const headerCountainerP = document.createElement("p");
    headerCountainerP.textContent = `${Year}年${Month + 1}月`
    headerDiv.appendChild(headerCountainerP);

    const table = document.createElement("table")
    table.setAttribute("border", "1");
    fragment.appendChild(table);

    for (let i = 0; i < 7; i++) {
        const th = document.createElement("th")
        th.textContent = week[i]
        table.appendChild(th)
    }
    for (let w = 0; w < Math.ceil((firstDay + endDayCount) / 7); w++) {
        const tr = document.createElement("tr")
        table.appendChild(tr)
        for (let d = 0; d < 7; d++) {
            if (w == 0 && d < firstDay) {
                const td = document.createElement("td");
                tr.appendChild(td);
            } else if (dayCount > endDayCount) {
                const td = document.createElement("td");
                tr.appendChild(td);
            } else {
                const dataStr = `${Year}-${String(Month + 1).padStart(2, '0')}-${String(dayCount).padStart(2, '0')}`
                const wage = money(dataStr);
                monthlyWage += wage

                const td = document.createElement("td");
                td.dataset.date = dataStr
                td.textContent = dayCount
                if (dataStr == `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`) {
                    td.classList.add("Today")
                }

                td.appendChild(document.createElement("br"));

                const small = document.createElement("small");
                small.classList.add("dailyWage")
                small.textContent = `¥${wage.toLocaleString()}`
                td.appendChild(small);

                tr.appendChild(td);
                dayCount++
            }
        }
    }
    const pWage = document.createElement("p");
    pWage.id = "monthlyWage";
    pWage.textContent = `${monthlyWage.toLocaleString()} 円`
    headerDiv.appendChild(pWage);

    parent.appendChild(fragment);
    addClick();
}//カレンダーの再構成
function money(dataStr) {
    const data = getDateData(dataStr);
    const workTime = data.work || 0;
    const breakTime = data.break || 0;
    const actualWorkTime = workTime - breakTime;
    console.log(actualWorkTime);
    const salary = Math.floor((actualWorkTime / 1000 / 60) * (hourlyWage / 60));
    return salary;
};

function getDateData(datakey) {
    const item = localStorage.getItem(datakey);
    return item ? JSON.parse(localStorage.getItem(datakey)) : {};
};

function setDateData(datakey, newData) {
    const exsistingData = getDateData(datakey);
    const updatedData = { ...exsistingData, ...newData }
    localStorage.setItem(datakey, JSON.stringify(updatedData));
}

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

function customPrompt(dateKey, data, callback) {
    const modal = document.getElementById('customPrompt');
    const time = document.getElementById('workTime');
    const breakTime = document.getElementById('breakInput');
    const textarea = document.getElementById('promptInput');
    const text = document.getElementById('promptText');

    textarea.value = data.memo || "";
    time.value = MsToString(data.work);
    breakTime.value = MsToString(data.break);
    text.textContent = `${dateKey}のメモ`;
    modal.style.display = 'flex';


    document.getElementById('ok').onclick = () => {
        modal.style.display = 'none';
        const updatedData = { ...data, memo: textarea.value, work: StringToMs(time.value), break: StringToMs(breakTime.value) }
        callback(updatedData);
        createCalendar(year, month);
    };
    document.getElementById('del').onclick = () => {
        modal.style.display = 'none';
        callback(null);
        createCalendar(year, month);
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
            const data = getDateData(dateKey) || {};
            customPrompt(dateKey, data, (result) => {
                if (result == null) {
                    localStorage.removeItem(dateKey);
                } else {
                    setDateData(dateKey, { ...result })
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

document.getElementById('banner').addEventListener("click", (event) => {
    event.target.classList.add("banish");
    banishTimeOut = setTimeout(() => {
        event.target.classList.remove("banish");
    }, 3000);
});

function clockIn() {
    if (localStorage.getItem("working") == "false") {
        alert("出勤");
        const getTime = new Date();
        localStorage.setItem("clockInTime", getTime.toISOString());
        localStorage.setItem("working", "true");
        document.getElementById("updateBreak").textContent = `休憩 0時0間分0秒`
        showBanner();
    } else[
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
    const [hours, minutes] = MsToString(diffMs).split(":").map(Number)
    const seconds = diffSec % 60;
    if (localStorage.getItem("breakFlg") == "true") {/*!変数の頭にBつけてるよ！breakのB*/
        const breakInTime = new Date(localStorage.getItem("breakInTime"));
        const BdiffMs = now - breakInTime;
        const [Bhours, Bminutes] = MsToString(BdiffMs).split(":").map(Number)
        const Bseconds = Math.floor(BdiffMs / 1000) % 60;
        document.getElementById("updateBreak").textContent = `休憩 ${Bhours}時間${Bminutes}分${Bseconds}秒`
    }

    document.getElementById("updateTime").textContent = `出勤 ${hours}時間${minutes}分${seconds}秒`
}
function clockOut() {
    const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`
    const getTime = new Date();
    if (localStorage.getItem("working") == "true") {
        alert("退勤");
        const clockInTime = new Date(localStorage.getItem("clockInTime"));
        const workingTime = Math.floor((getTime - clockInTime) / 60000) * 60000;
        setDateData(currentKey, { work: workingTime });
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
    const currentKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(today).padStart(2, '0')}`
    if (localStorage.getItem("breakFlg") == "true") {
        alert("休憩終了");
        const getTime = new Date();
        const breakInTime = new Date(localStorage.getItem("breakInTime"));
        const breakTime = Math.floor((getTime - breakInTime) / 60000) * 60000;
        setDateData(currentKey, { break: breakTime });
        localStorage.setItem("breakFlg", "false");
        localStorage.removeItem("breakInTime");
    }
};
function MsToString(Ms) {
    if (!Ms) {
        return "00:00"
    }
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

    if (!localStorage.getItem("breakFlg")) {
        localStorage.setItem("breakFlg", "false")
    }
};
document.getElementById("start").addEventListener("click", clockIn);
document.getElementById("end").addEventListener("click", () => {
    clockOut();
    createCalendar(year, month);
});
document.getElementById("break").addEventListener("click", breakStart);
document.getElementById("breakEnd").addEventListener("click", () => {
    if (localStorage.getItem("breakFlg") == "true") {
        breakEnd();
    } else if (localStorage.getItem("working") == "true") {
        alert("未休憩");
    } else {
        alert("未出勤");
    }
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("/calendar-App/service-worker.js").then(reg => {
            console.log("Service Worker registered", reg);
        }).catch(err => {
            console.error("Service Worker registration failed:", err);
        });
    });
}
