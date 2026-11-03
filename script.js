const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

const monthNamesShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

let currentTarget = null;
let selectedYear = new Date().getFullYear();
let selectedMonth = new Date().getMonth();
let selectedDay = new Date().getDate();
let pickerMode = 'month';
let currentMode = 'late';

function changeYear(direction) {
    selectedYear += direction;
    document.getElementById('yearText').innerText = selectedYear;
}

function changeMonth(direction) {
    selectedMonth += direction;
    if (selectedMonth < 0) {
        selectedMonth = 11;
        selectedYear -= 1;
        document.getElementById('yearText').innerText = selectedYear;
    } else if (selectedMonth > 11) {
        selectedMonth = 0;
        selectedYear += 1;
        document.getElementById('yearText').innerText = selectedYear;
    }
    document.getElementById('monthDisplay').innerText = monthNames[selectedMonth];
    renderDays();
}

document.getElementById('startDate').addEventListener('click', () => openDatePicker('startDate'));
document.getElementById('endDate').addEventListener('click', () => openDatePicker('endDate'));
document.getElementById('today').addEventListener('click', () => openDatePicker('today'));
document.getElementById('moveoutDate').addEventListener('click', () => openDatePicker('moveoutDate'));

document.getElementById('today').value = formatDate(new Date());

document.querySelectorAll('.mode-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchMode(btn.dataset.mode));
});

document.getElementById('calculateBtn').addEventListener('click', () => {
    if (currentMode === 'credit') {
        calculateCredit();
    } else {
        calculateLateFee();
    }
});

function switchMode(mode) {
    currentMode = mode;

    document.querySelectorAll('.mode-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.querySelectorAll('.late-only').forEach((el) => {
        el.classList.toggle('hidden', mode !== 'late');
    });
    document.querySelectorAll('.credit-only').forEach((el) => {
        el.classList.toggle('hidden', mode !== 'credit');
    });

    const isCredit = mode === 'credit';
    document.getElementById('pageTitle').textContent = isCredit ? 'Credit Calculator' : 'Late Fee Calculator';
    document.getElementById('pageSubtitle').textContent = isCredit
        ? 'Early Move-out Credit Calculation System'
        : 'Late Fee Calculation System';
    document.getElementById('amountLabel').textContent = isCredit ? 'Price (THB)' : 'Booking Amount (THB)';
    document.getElementById('amount').placeholder = isCredit ? 'Enter price' : 'Enter amount';
    document.getElementById('endDateLabel').textContent = isCredit ? 'End Date' : 'Contract End Date';
    document.title = isCredit ? 'Credit Calculator' : 'Late Fee Calculator';

    document.getElementById('result').classList.add('hidden');
    document.getElementById('result').innerHTML = '';
    document.getElementById('breakdown').innerHTML = '';
}

function openDatePicker(target) {
    currentTarget = target;
    const input = document.getElementById(target);

    const now = new Date();
    selectedYear = now.getFullYear();
    selectedMonth = now.getMonth();
    selectedDay = now.getDate();

    if (input.value) {
        const [d, m, y] = input.value.split('/');
        selectedYear = parseInt(y);
        selectedMonth = parseInt(m) - 1;
        selectedDay = parseInt(d);
    }

    document.getElementById('datePickerOverlay').classList.add('active');
    showDaySelection();
    initYearDropdown();
}

function closeDatePicker() {
    document.getElementById('datePickerOverlay').classList.remove('active');
    document.getElementById('yearDropdown').classList.remove('active');
}

function initYearDropdown() {
    const yearDropdown = document.getElementById('yearDropdown');
    const yearDisplay = document.getElementById('yearDisplay');
    const yearText = document.getElementById('yearText');

    yearText.textContent = selectedYear;

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let y = currentYear - 50; y <= currentYear + 50; y++) {
        years.push(y);
    }

    yearDropdown.innerHTML = years.map(y =>
        `<div class="year-option ${y === selectedYear ? 'selected' : ''}" 
              onclick="selectYear(${y})">${y}</div>`
    ).join('');

    yearDisplay.onclick = (e) => {
        e.stopPropagation();
        yearDropdown.classList.toggle('active');

        if (yearDropdown.classList.contains('active')) {
            const selected = yearDropdown.querySelector('.selected');
            if (selected) {
                selected.scrollIntoView({ block: 'center' });
            }
        }
    };

    document.addEventListener('click', (e) => {
        if (!yearDropdown.contains(e.target) && e.target !== yearDisplay) {
            yearDropdown.classList.remove('active');
        }
    });
}

function selectYear(year) {
    selectedYear = year;
    document.getElementById('yearText').textContent = year;
    document.getElementById('yearDropdown').classList.remove('active');

    if (pickerMode === 'month') {
        showMonthSelection();
    } else {
        showDaySelection();
    }
}

function showMonthSelection() {
    pickerMode = 'month';
    document.getElementById('monthGrid').style.display = 'grid';
    document.getElementById('dayGrid').style.display = 'none';

    const monthDisplay = document.getElementById('monthDisplay');
    monthDisplay.textContent = monthNames[selectedMonth];
    monthDisplay.onclick = null;

    const monthGrid = document.getElementById('monthGrid');
    monthGrid.innerHTML = monthNamesShort.map((month, index) =>
        `<div class="month-item ${index === selectedMonth ? 'selected' : ''}" 
              onclick="selectMonth(${index})">${month}</div>`
    ).join('');
}

function selectMonth(month) {
    selectedMonth = month;
    showDaySelection();
}

function showDaySelection() {
    pickerMode = 'day';
    document.getElementById('monthGrid').style.display = 'none';
    document.getElementById('dayGrid').style.display = 'block';

    const monthDisplay = document.getElementById('monthDisplay');
    monthDisplay.textContent = monthNames[selectedMonth];
    monthDisplay.onclick = () => {
        showMonthSelection();
    };

    renderDays();
}

function renderDays() {
    const daysContainer = document.getElementById('daysContainer');
    const firstDay = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const today = new Date();

    let html = '';

    for (let i = 0; i < firstDay; i++) {
        html += '<div class="day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const isSelected = day === selectedDay;
        const isToday = today.getDate() === day &&
            today.getMonth() === selectedMonth &&
            today.getFullYear() === selectedYear;

        html += `<div class="day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}" 
                      onclick="selectDay(${day})">${day}</div>`;
    }

    daysContainer.innerHTML = html;
}

function selectDay(day) {
    selectedDay = day;
    confirmDate();
}

function confirmDate() {
    const date = new Date(selectedYear, selectedMonth, selectedDay);
    document.getElementById(currentTarget).value = formatDate(date);
    closeDatePicker();
}

function formatDate(date) {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
}

function formatNumber(num) {
    return Number(num).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function parseDate(str) {
    const [d, m, y] = str.split("/");
    return new Date(`${y}-${m}-${d}`);
}

function diffDays(from, to) {
    return Math.round((to - from) / 86400000);
}

function calculateLateFee() {
    const amount = Number(document.getElementById("amount").value);
    const endDateStr = document.getElementById("endDate").value;
    const todayStr = document.getElementById("today").value;

    if (!amount || !endDateStr || !todayStr) {
        alert("Please fill in all required fields.");
        return;
    }

    const endDate = parseDate(endDateStr);
    const today = parseDate(todayStr);

    let months = 0;
    let start = new Date(endDate);
    start.setDate(start.getDate() + 1);

    while (start <= today) {
        months++;
        let next = new Date(start);
        next.setMonth(next.getMonth() + 1);
        next.setDate(start.getDate() - 1);
        start = new Date(next);
        start.setDate(start.getDate() + 1);
    }

    const rate = 15 / 36500;
    let periodStart = new Date(endDate);
    periodStart.setDate(periodStart.getDate() + 1);

    let totalInterest = 0;

    let breakdownHTML = `
        <h3>📋 Calculation Breakdown</h3>
        <table>
            <thead>
                <tr>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Days</th>
                    <th>Interest</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let i = 1; i <= months; i++) {
        let periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);
        periodEnd.setDate(periodStart.getDate() - 1);

        if (periodEnd > today) periodEnd = new Date(today);

        const days = Math.round((periodEnd - periodStart) / 86400000) + 1;
        const accAmount = amount * i;
        const fee = accAmount * rate * days;

        totalInterest += fee;

        breakdownHTML += `
            <tr>
                <td>${i}</td>
                <td>${formatNumber(accAmount)}</td>
                <td>${days}</td>
                <td>${formatNumber(fee)}</td>
            </tr>
        `;

        periodStart = new Date(periodEnd);
        periodStart.setDate(periodStart.getDate() + 1);
    }

    breakdownHTML += "</tbody></table>";
    document.getElementById("breakdown").innerHTML = breakdownHTML;

    const followFirst = 50;
    const followNext = 100;
    const followTotal = months > 0 ? followFirst + (months - 1) * followNext : 0;

    const accumulated = amount * months;
    const totalDue = accumulated + totalInterest + followTotal;
    const totalInterestFee = totalInterest + followTotal;

    const summary = `
        <h3>💰 Summary</h3>
        
        <div class="summary-row">
            <span>Booking Amount (${months} months)</span>
            <span>${formatNumber(accumulated)} THB</span>
        </div>
        
        <div class="summary-row">
            <span>Follow-up Fee</span>
            <span>${formatNumber(followTotal)} THB</span>
        </div>

        <div class="summary-row">
            <span>Interest Fee</span>
            <span>${formatNumber(totalInterest)} THB</span>
        </div>

        <div class="summary-row">
            <span>Total Interest Fee</span>
            <span>${formatNumber(totalInterestFee)} THB</span>
        </div>

        <div class="summary-total">
            <span>Total Amount</span>
            <span>${formatNumber(totalDue)} THB</span>
        </div>
    `;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = summary;
    resultDiv.classList.remove("hidden");
}

function calculateCredit() {
    const amount = Number(document.getElementById("amount").value);
    const startDateStr = document.getElementById("startDate").value;
    const endDateStr = document.getElementById("endDate").value;
    const moveoutDateStr = document.getElementById("moveoutDate").value;

    if (!amount || amount <= 0 || !startDateStr || !endDateStr || !moveoutDateStr) {
        alert("Please fill in all required fields.");
        return;
    }

    const startDate = parseDate(startDateStr);
    const endDate = parseDate(endDateStr);
    const moveoutDate = parseDate(moveoutDateStr);

    if (endDate < startDate) {
        alert("End Date must be on or after Start Date.");
        return;
    }

    if (moveoutDate < startDate) {
        alert("Actual Move-out Date must be on or after Start Date.");
        return;
    }

    const dailyRate = amount / 30;
    const remainingDaysRaw = diffDays(moveoutDate, endDate);
    const remainingDays = Math.max(0, remainingDaysRaw);
    const credit = remainingDays * dailyRate;
    const contractDays = diffDays(startDate, endDate) + 1;
    const usedDays = Math.min(contractDays, diffDays(startDate, moveoutDate) + 1);

    document.getElementById("breakdown").innerHTML = `
        <h3>📋 Calculation Breakdown</h3>
        <table>
            <thead>
                <tr>
                    <th>Daily Rate</th>
                    <th>Remaining Days</th>
                    <th>Credit</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${formatNumber(dailyRate)}</td>
                    <td>${remainingDays}</td>
                    <td>${formatNumber(credit)}</td>
                </tr>
            </tbody>
        </table>
    `;

    let overstayRow = "";
    if (remainingDaysRaw < 0) {
        overstayRow = `
            <div class="summary-row">
                <span>Overstay</span>
                <span>${Math.abs(remainingDaysRaw)} days</span>
            </div>
        `;
    }

    const summary = `
        <h3>💰 Summary</h3>
        
        <div class="summary-row">
            <span>Price</span>
            <span>${formatNumber(amount)} THB</span>
        </div>
        
        <div class="summary-row">
            <span>Daily Rate (Price / 30)</span>
            <span>${formatNumber(dailyRate)} THB</span>
        </div>

        <div class="summary-row">
            <span>Contract Period</span>
            <span>${contractDays} days</span>
        </div>

        <div class="summary-row">
            <span>Used Days</span>
            <span>${usedDays} days</span>
        </div>

        <div class="summary-row">
            <span>Remaining Days</span>
            <span>${remainingDays} days</span>
        </div>

        ${overstayRow}

        <div class="summary-total">
            <span>Remaining Credit</span>
            <span>${formatNumber(credit)} THB</span>
        </div>
    `;

    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = summary;
    resultDiv.classList.remove("hidden");
}

document.getElementById('datePickerOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'datePickerOverlay') {
        closeDatePicker();
    }
});

const initialMode = new URLSearchParams(location.search).get('mode')
    || (location.hash === '#credit' ? 'credit' : '')
    || document.body.dataset.defaultMode
    || (/credit/i.test(location.pathname) ? 'credit' : 'late');
if (initialMode === 'credit') {
    switchMode('credit');
}
