// --- 安全读取 localStorage ---
function safeJSON(key, fallback) {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch(e) { return fallback; }
}
// --- 数据模型 ---
let cats = safeJSON('v9_cats') || [
    { id: 1, name: "上班", icon: "💼", color: "#3b82f6", subs: ["开网约车", "开会", "写代码", "办公"] },
    { id: 2, name: "生活", icon: "🏠", color: "#f59e0b", subs: ["睡觉", "起床", "休息", "洗漱"] },
    { id: 3, name: "交通", icon: "🚗", color: "#ef4444", subs: ["开车", "加油"] },
    { id: 4, name: "餐饮", icon: "🍱", color: "#10b981", subs: ["早午晚餐", "午休"] }
];
let shortcuts = safeJSON('v9_shorts') || [
    { l1: "上班", l2: "开网约车", icon: "🚕" },
    { l1: "生活", l2: "睡觉", icon: "🛌" },
    { l1: "交通", l2: "开车", icon: "🚗" }
];
if (shortcuts.length < 3) {
    shortcuts = [
        { l1: "上班", l2: "开网约车", icon: "🚕" },
        { l1: "生活", l2: "睡觉", icon: "🛌" },
        { l1: "交通", l2: "开车", icon: "🚗" }
    ];
}
let parallelShortcuts = safeJSON('v9_parallel_shorts') || [
    { l1: "生活", l2: "休息", icon: "☕" },
    { l1: "餐饮", l2: "早午晚餐", icon: "🍽️" }
];
let logs = safeJSON('v9_logs') || [];
let current = safeJSON('v9_current') || null;
let parallelCurrent = safeJSON('v9_parallel') || null;
let parallelHistory = safeJSON('v9_parallel_history') || [];
let labelFontSize = safeJSON('v9_labelFontSize') || 13;
const SUB_ICON_MAP = {
    '开网约车':'🚕','开会':'📋','会议':'📋','写代码':'💻','编程':'💻','办公':'📝','上班':'📝',
    '睡觉':'😴','起床':'⏰','休息':'☕','洗漱':'🧴','刷牙':'🪥','洗澡':'🚿',
    '开车':'🚗','加油':'⛽','早午晚餐':'🍽️','午休':'😪',
    '学习':'📖','看书':'📖','阅读':'📖','跑步':'🏃','运动':'🏋️','健身':'🏋️','散步':'🚶',
    '购物':'🛒','做饭':'👨‍🍳'
};
function getSubIcon(name, parentIcon) { return SUB_ICON_MAP[name] || parentIcon; }

const EMOJI_CATS = {
    '所有': ['😊','😀','🥰','😎','😴','🥱','🤗','😅','😂','😁','🤣','😍','😘','😏','😜','🤔','😤','🥺','🤩','🥳','💤','😰','🤒','💼','📝','💻','📱','📖','✏️','🎓','💡','🔧','📊','📈','📋','📁','✉️','📞','🔍','⚙️','🛠️','🧰','📐','💊','🩺','🚗','🚌','🏃','🧘','✈️','🏖️','🚕','🚙','🚲','🛵','🚇','🚆','🚢','🚶','🧎','⛰️','🌊','🌅','🏕️','🚴','🎵','🎮','🎬','🎧','🎤','🎸','🎹','🎨','📸','🎭','🎯','🏆','🥇','🎽','🎿','🛹','📺','📚','🍳','☕','🍵','🍽️','🥗','🍜','🍎','🍊','🍇','🍓','🍑','🥝','🥑','🥦','🥕','🌽','🍞','🧀','🥛','🍺','🍷','🥤','🍰','🍪','🍩','🍿','🍔','🌭','🥟','🍣','🍛','🍝','🧁','🍦','🥘','🛒','🏠','🐱','🐶','❤️','🔥','🛌','🚿','🪥','🧹','🧴','🧤','🧣','👕','👖','👟','👓','💤','🎁','💰','🔑','📦','🧧','💊','🩹','🧽','🧺','🪣','🧵','✂️','📿','🔒','📌','📍'],
    '表情': ['😊','😀','🥰','😎','😴','🥱','🤗','😅','😂','😁','🤣','😍','😘','😏','😜','🤔','😤','🥺','🤩','🥳','💤','😰','🤒','😈','💀'],
    '工作': ['💼','📝','💻','📱','📖','✏️','🎓','💡','🔧','📊','📈','📉','📋','📁','🗂️','✉️','📞','📠','🔍','🔬','⚙️','🛠️','🧰','📐','💊','🩺','🧪','🔗'],
    '出行': ['🚗','🚌','🏃','🧘','✈️','🏖️','🚕','🚙','🚲','🛵','🏍️','🚇','🚆','🚢','🛴','🚶','🧎','⛰️','🌊','🌅','🏕️','🚴','🏄'],
    '娱乐': ['🎵','🎮','🎬','🎧','🎤','🎸','🎹','🎺','🎨','📸','🎭','🎪','🎯','🏆','🥇','🥈','🥉','🎽','🎿','🛹','🎳','📺','📚','🎰','🃏'],
    '饮食': ['🍳','☕','🍵','🍽️','🥗','🍜','🍎','🍊','🍋','🍇','🍓','🍑','🍒','🥝','🥑','🥦','🥕','🌽','🍞','🧀','🥛','🍺','🍷','🥤','🧊','🍰','🍪','🍩','🍿','🍔','🌭','🥟','🍣','🍛','🍝','🧁','🍦','🥘','🍖','🥩'],
    '生活': ['🛒','🏠','❤️','🔥','🛌','🚿','🪥','🧹','🧴','🧤','🧣','👕','👖','👟','👓','💤','🎁','💰','🔑','📦','🧧','💊','🩹','🧽','🧺','🪣','🧵','✂️','📿','🔒','📌','📍','🐱','🐶']
};
const EMOJI_CAT_ORDER = ['所有', '表情', '工作', '出行', '娱乐', '饮食', '生活'];
let selL1 = cats[0]?.name || "";
let pickerMode = 'record';
const CLOCK_SPAN_OPTIONS = [1, 3, 6, 9, 12, 24];
let viewDate = '';
let calendarViewYear = 0;
let calendarViewMonth = 0;
let editIndex = null;
let editingShortcutIndex = null;
let configEditMode = false;
let configSectionOpen = null;
let drawerViewMode = 'columns';
let showShortcutIcons = true;
const BJ_OFFSET = 8 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const CLOCK_PREFS_DEFAULT = { layout: 'dual', singleAxis: '60m', spanHoursA: 1, spanHoursB: 24 };
let clockPrefs = { ...CLOCK_PREFS_DEFAULT, ...safeJSON('v9_clock_prefs') };

function clampClockSpanHours(n) {
    const v = parseInt(n, 10);
    if (!Number.isFinite(v)) return CLOCK_SPAN_OPTIONS[0];
    let best = CLOCK_SPAN_OPTIONS[0];
    CLOCK_SPAN_OPTIONS.forEach((o) => {
        if (Math.abs(o - v) < Math.abs(best - v)) best = o;
    });
    return best;
}

function getClockPrefs() {
    const raw = { ...CLOCK_PREFS_DEFAULT, ...clockPrefs };
    raw.spanHoursA = clampClockSpanHours(raw.spanHoursA);
    raw.spanHoursB = clampClockSpanHours(raw.spanHoursB);
    return raw;
}

/** 查看日 N 小时：不跨查看日 0 点；N≥24=查看日全天；历史日按结转闭合 */
function getTodayDateStr() {
    return formatBeijingDate(Date.now());
}

function isDateToday(dateStr) {
    return dateStr === getTodayDateStr();
}

function getClockWindow(which, dateStr) {
    const d = dateStr || getTodayDateStr();
    const p = getClockPrefs();
    const anchor = getViewAnchorMs(d);
    const dayStart = beijingDateStrToDayStart(d);
    const dayEnd = dayStart + DAY_MS;
    const hours = which === 'b' ? p.spanHoursB : p.spanHoursA;

    if (hours >= 24) {
        return { rangeStart: dayStart, rangeEnd: dayEnd };
    }

    if (!isDateToday(d)) {
        const rangeEnd = dayEnd;
        const rangeStart = Math.max(dayStart, dayEnd - hours * HOUR_MS);
        return { rangeStart, rangeEnd };
    }

    const hourEnd = beijingPeriodStart(anchor, HOUR_MS) + HOUR_MS;
    const rangeEnd = Math.min(hourEnd, dayEnd);
    const rangeStart = Math.max(dayStart, rangeEnd - hours * HOUR_MS);
    return { rangeStart, rangeEnd };
}

function formatClockRemain(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h > 0) return `${h}h${m > 0 ? m + 'm' : ''}`;
    return String(Math.max(1, Math.ceil(ms / 60000)));
}

function formatClockCenterRemain(remainMs, spanHours) {
    const ms = Math.max(0, remainMs);
    if (spanHours <= 1) return String(Math.max(1, Math.ceil(ms / 60000)));
    return formatClockRemain(ms);
}

function updateClockCenterLabels(anchorMs) {
    const now = anchorMs;
    const p = getClockPrefs();
    const show60 = p.layout === 'dual' || p.singleAxis === '60m';
    const show24 = p.layout === 'dual' || p.singleAxis === '24h';
    if (show60) {
        const wA = getClockWindow('a', getTodayDateStr());
        setText('label-60m-remain', formatClockCenterRemain(wA.rangeEnd - now, p.spanHoursA));
    }
    if (show24) {
        const wB = getClockWindow('b', getTodayDateStr());
        if (p.spanHoursB >= 24) {
            const dayRemainMs = Math.max(0, wB.rangeEnd - now);
            const dayRemainH = Math.floor(dayRemainMs / HOUR_MS);
            const dayRemainM = Math.floor((dayRemainMs % HOUR_MS) / 60000);
            setText('label-24h-remain', `${String(dayRemainH).padStart(2, '0')}:${String(dayRemainM).padStart(2, '0')}`);
        } else {
            setText('label-24h-remain', formatClockCenterRemain(wB.rangeEnd - now, p.spanHoursB));
        }
    }
}

function saveClockPrefs() {
    localStorage.setItem('v9_clock_prefs', JSON.stringify(clockPrefs));
}

function setClockPref(key, value) {
    if (key === 'spanHoursA' || key === 'spanHoursB') {
        clockPrefs[key] = clampClockSpanHours(value);
    } else {
        clockPrefs[key] = value;
    }
    saveClockPrefs();
    applyClockLayout();
    lastSecondTs = 0;
    renderFlow();
    renderClockSettings();
    if (document.getElementById('page-record')?.classList.contains('active')) renderRecordPage();
}

const COMPACT_WHEEL_ITEM_H = 28;
const COMPACT_WHEEL_PAD = 2;

let compactWheelScrollTimer = null;
let compactWheelOnSelect = null;

function closeCompactWheel(applySelection) {
    const overlay = document.getElementById('compact-wheel-overlay');
    const listEl = document.getElementById('compact-wheel-list');
    if (applySelection && compactWheelOnSelect && listEl) {
        const active = listEl.querySelector('.compact-wheel-item.is-active');
        if (active?.dataset?.value !== undefined) compactWheelOnSelect(active.dataset.value);
    }
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.classList.remove('compact-wheel-open');
    const viewport = document.getElementById('compact-wheel-viewport');
    if (viewport) viewport.onscroll = null;
    compactWheelOnSelect = null;
}

function highlightCompactWheelItem(listEl, index) {
    listEl.querySelectorAll('.compact-wheel-item:not(.compact-wheel-pad)').forEach((el, i) => {
        el.classList.toggle('is-active', i === index);
    });
}

function scrollCompactWheelToIndex(viewport, listEl, index) {
    const items = listEl.querySelectorAll('.compact-wheel-item:not(.compact-wheel-pad)');
    if (!items.length) return;
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    viewport.scrollTop = (clamped + COMPACT_WHEEL_PAD) * COMPACT_WHEEL_ITEM_H;
    highlightCompactWheelItem(listEl, clamped);
    return clamped;
}

function openCompactWheel({ title, items, value, onSelect }) {
    const overlay = document.getElementById('compact-wheel-overlay');
    const titleEl = document.getElementById('compact-wheel-title');
    const viewport = document.getElementById('compact-wheel-viewport');
    const listEl = document.getElementById('compact-wheel-list');
    if (!overlay || !viewport || !listEl) return;

    closeCompactWheel();
    compactWheelOnSelect = onSelect;
    if (titleEl) titleEl.textContent = title || '';

    listEl.innerHTML = '';
    for (let i = 0; i < COMPACT_WHEEL_PAD; i++) {
        const pad = document.createElement('li');
        pad.className = 'compact-wheel-item compact-wheel-pad';
        pad.setAttribute('aria-hidden', 'true');
        listEl.appendChild(pad);
    }
    items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'compact-wheel-item';
        li.dataset.value = String(item.value);
        li.textContent = item.label;
        li.addEventListener('click', () => {
            if (compactWheelOnSelect) compactWheelOnSelect(item.value);
            closeCompactWheel(false);
        });
        listEl.appendChild(li);
    });
    for (let i = 0; i < COMPACT_WHEEL_PAD; i++) {
        const pad = document.createElement('li');
        pad.className = 'compact-wheel-item compact-wheel-pad';
        pad.setAttribute('aria-hidden', 'true');
        listEl.appendChild(pad);
    }

    const startIdx = Math.max(0, items.findIndex((it) => it.value === value));
    overlay.classList.remove('hidden');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('compact-wheel-open');

    requestAnimationFrame(() => {
        scrollCompactWheelToIndex(viewport, listEl, startIdx);
    });

    viewport.onscroll = () => {
        clearTimeout(compactWheelScrollTimer);
        compactWheelScrollTimer = setTimeout(() => {
            const idx = Math.round(viewport.scrollTop / COMPACT_WHEEL_ITEM_H) - COMPACT_WHEEL_PAD;
            scrollCompactWheelToIndex(viewport, listEl, idx);
        }, 90);
    };
}

function createPickerTrigger(displayText, onOpen) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'picker-trigger btn-active';
    const text = document.createElement('span');
    text.className = 'picker-trigger-text';
    text.textContent = displayText;
    const chev = document.createElement('span');
    chev.className = 'picker-trigger-chevron';
    chev.textContent = '▾';
    btn.append(text, chev);
    btn.addEventListener('click', onOpen);
    return btn;
}

(function initCompactWheelOverlay() {
    const overlay = document.getElementById('compact-wheel-overlay');
    if (!overlay) return;
    overlay.querySelector('[data-wheel-dismiss]')?.addEventListener('click', () => closeCompactWheel(true));
})();

window.onload = () => {
    try {
        initViewDateState();
        applyClockLayout();
        renderAll();
        tickLoop();
    } catch(e) {
        document.body.innerHTML = '<div style="padding:40px;font-size:14px;color:red;"><h2>⚠️ 初始化失败</h2><pre style="margin-top:16px;background:#fee;padding:16px;border-radius:12px;font-size:12px;white-space:pre-wrap;">' + e.stack + '</pre></div>';
    }
};

let tickRAF = null;
function tickLoop() {
    try { tick(); } catch(e) { console.error('tick error', e); }
    tickRAF = requestAnimationFrame(tickLoop);
}

function renderAll() {
    renderShortcuts();
    renderParallelShortcuts();
    renderLogs('log-list', getTodayDateStr());
    renderLogs('calendar-log-list', viewDate);
    renderConfig();
    renderReport();
    updateUI();
}

function formatDuration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const mm = String(m).padStart(2, '0');
    const ss = String(s).padStart(2, '0');
    if (h > 0) return `${h}:${mm}:${ss}`;
    return `${mm}:${ss}`;
}

/** 优先用 endTime-startTime 毫秒差，避免 duration(分钟) 丢秒 */
function logDurationMs(log, liveEndMs) {
    if (!log) return 0;
    const end = liveEndMs != null ? liveEndMs : (log.endTime || (log.live ? Date.now() : null));
    if (end != null && log.startTime != null) return Math.max(0, end - log.startTime);
    if (log.duration != null) return Math.max(1000, Math.round(log.duration * 60000));
    return 0;
}

/** main-live | main-log | parallel-live=并行进行中 | parallel-log=主线下并行(灰) */
function logFlowCardClass(kind) {
    return 'swipe-card log-flow-card log-flow-card--' + kind;
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value;
}

function beijingPeriodStart(ms, periodMs) {
    return Math.floor((ms + BJ_OFFSET) / periodMs) * periodMs - BJ_OFFSET;
}

function pad2(n) {
    return String(n).padStart(2, '0');
}

function formatBeijingClockSec(ms) {
    const d = new Date(ms + BJ_OFFSET);
    return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}`;
}

function formatBeijingDate(ms) {
    const d = new Date(ms + BJ_OFFSET);
    return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

const WEEKDAY_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function beijingDateStrToDayStart(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return Date.UTC(y, m - 1, d) - BJ_OFFSET;
}

function beijingDateStrToDayEnd(dateStr) {
    return beijingDateStrToDayStart(dateStr) + DAY_MS;
}

function isViewToday() {
    return isDateToday(viewDate);
}

function getViewAnchorMs(dateStr) {
    const d = dateStr || viewDate;
    if (isDateToday(d)) return Date.now();
    return beijingDateStrToDayEnd(d) - 1;
}

function formatDateHeaderLabel(dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const wd = new Date(beijingDateStrToDayStart(dateStr) + BJ_OFFSET);
    const w = WEEKDAY_ZH[wd.getUTCDay()];
    return `${y}年${m}月${d}日 星期${w}`;
}

function setViewDate(dateStr) {
    viewDate = dateStr;
    renderCalendarPage();
}

function renderRecordPage() {
    applyClockLayout();
    renderFlow();
    renderLogs('log-list', getTodayDateStr());
    renderDayRemain();
}

function renderCalendarPage() {
    renderFlowCalendar();
    renderLogs('calendar-log-list', viewDate);
}

function initViewDateState() {
    viewDate = formatBeijingDate(Date.now());
    const d = new Date(Date.now() + BJ_OFFSET);
    calendarViewYear = d.getUTCFullYear();
    calendarViewMonth = d.getUTCMonth();
}

function getCat(name) {
    return cats.find(c => c.name === name);
}

function displayName(log) {
    return log?.l2 || log?.l1 || "未分类";
}

function formatHours(ms) {
    return `${(ms / HOUR_MS).toFixed(1)}h`;
}

function drawClockSegment(parent, r, startMs, endMs, rangeStart, rangeEnd, color, data, strokeWidth) {
    const total = rangeEnd - rangeStart;
    const start = Math.max(startMs, rangeStart);
    const end = Math.min(endMs, rangeEnd);
    if (end <= start) return;
    strokeWidth = strokeWidth || 14;
    const circ = Math.PI * 2 * r;
    const dash = ((end - start) / total) * circ;
    const offset = -((start - rangeStart) / total) * circ;
    const arc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    arc.setAttribute("cx", "60");
    arc.setAttribute("cy", "60");
    arc.setAttribute("r", r);
    arc.setAttribute("fill", "none");
    arc.setAttribute("stroke", color);
    arc.setAttribute("stroke-width", strokeWidth);
    arc.setAttribute("stroke-linecap", "butt");
    arc.setAttribute("stroke-dasharray", `${Math.max(0.5, dash - 0.5)} ${circ}`);
    arc.setAttribute("stroke-dashoffset", offset);
    arc.setAttribute("opacity", strokeWidth < 14 ? "0.7" : "1");
    parent.appendChild(arc);
}

/** 环内刻度：每整点的 15 / 30 / 45 分（整点对齐窗口） */
function renderClockMarks(marksG, rangeStart, rangeEnd) {
    if (!marksG) return;
    marksG.innerHTML = "";
    const total = rangeEnd - rangeStart;
    if (total <= 0) return;
    let hourStart = beijingPeriodStart(rangeStart, HOUR_MS);
    while (hourStart < rangeEnd) {
        [15, 30, 45].forEach(min => {
            const t = hourStart + min * 60000;
            if (t <= rangeStart || t >= rangeEnd) return;
            const angle = ((t - rangeStart) / total) * 360 * (Math.PI / 180);
            const r1 = 44, r2 = 47;
            const x1 = 60 + Math.cos(angle) * r1;
            const y1 = 60 + Math.sin(angle) * r1;
            const x2 = 60 + Math.cos(angle) * r2;
            const y2 = 60 + Math.sin(angle) * r2;
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", x1); line.setAttribute("y1", y1);
            line.setAttribute("x2", x2); line.setAttribute("y2", y2);
            line.setAttribute("stroke", "#94a3b8");
            line.setAttribute("stroke-width", "0.65");
            marksG.appendChild(line);
        });
        hourStart += HOUR_MS;
    }
}

function logSegmentColor(log) {
    return log.color || getCat(log.l1)?.color || '#cbd5e1';
}

function applyClockLayout() {
    const p = getClockPrefs();
    const stage = document.getElementById('clock-stage');
    const panel60 = document.getElementById('clock-panel-60m');
    const panel24 = document.getElementById('clock-panel-24h');
    if (!stage || !panel60 || !panel24) return;
    const dual = p.layout === 'dual';
    stage.classList.toggle('clock-stage--dual', dual);
    stage.classList.toggle('clock-stage--single', !dual);
    if (dual) {
        panel60.classList.remove('hidden');
        panel24.classList.remove('hidden');
    } else {
        panel60.classList.toggle('hidden', p.singleAxis !== '60m');
        panel24.classList.toggle('hidden', p.singleAxis !== '24h');
    }
    const cap60 = panel60.querySelector('.clock-panel-caption');
    const cap24 = panel24.querySelector('.clock-panel-caption');
    if (cap60) cap60.textContent = p.spanHoursA + 'H';
    if (cap24) cap24.textContent = p.spanHoursB + 'H';
    updateClockCenterLabels(getViewAnchorMs(getTodayDateStr()));
}

function renderClockSettings() {
    const wrap = document.getElementById('clock-settings-ui');
    if (!wrap) return;
    const p = getClockPrefs();
    wrap.innerHTML = '';

    const row1 = document.createElement('div');
    row1.className = 'clock-settings-row';
    [['dual', '双时间轴'], ['single', '单时间轴']].forEach(([val, lab]) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'clock-settings-btn btn-active' + (p.layout === val ? ' active' : '');
        btn.innerText = lab;
        btn.addEventListener('click', () => setClockPref('layout', val));
        row1.appendChild(btn);
    });
    wrap.appendChild(row1);

    if (p.layout === 'single') {
        const row2 = document.createElement('div');
        row2.className = 'clock-settings-row';
        [['60m', '60M 环'], ['24h', '24H 环']].forEach(([val, lab]) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'clock-settings-btn btn-active' + (p.singleAxis === val ? ' active' : '');
            btn.innerText = lab;
            btn.addEventListener('click', () => setClockPref('singleAxis', val));
            row2.appendChild(btn);
        });
        wrap.appendChild(row2);
    }

    const addSpanRow = (label, key, value) => {
        const row = document.createElement('div');
        row.className = 'clock-span-row';
        const lab = document.createElement('label');
        lab.innerText = label;
        const items = [];
        CLOCK_SPAN_OPTIONS.forEach((h) => items.push({ value: h, label: h + ' 小时' }));
        const trigger = createPickerTrigger(value + ' 小时', () => {
            openCompactWheel({
                title: label,
                items,
                value,
                onSelect: (v) => setClockPref(key, parseInt(v, 10)),
            });
        });
        row.append(lab, trigger);
        wrap.appendChild(row);
    };

    if (p.layout === 'dual') {
        addSpanRow('60M 环 · 统计范围', 'spanHoursA', p.spanHoursA);
        addSpanRow('24H 环 · 统计范围', 'spanHoursB', p.spanHoursB);
    } else {
        const key = p.singleAxis === '24h' ? 'spanHoursB' : 'spanHoursA';
        const val = p.singleAxis === '24h' ? p.spanHoursB : p.spanHoursA;
        addSpanRow((p.singleAxis === '24h' ? '24H' : '60M') + ' 环 · 统计范围', key, val);
    }
}

function renderOneClockRing(opts) {
    const { gSeg, gMarks, handEl, rangeStart, rangeEnd, logs, now } = opts;
    gSeg.innerHTML = "";
    renderClockMarks(gMarks, rangeStart, rangeEnd);
    const innerBg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    innerBg.setAttribute("cx", "60"); innerBg.setAttribute("cy", "60"); innerBg.setAttribute("r", "38");
    innerBg.setAttribute("fill", "none"); innerBg.setAttribute("stroke", "#f1f5f9"); innerBg.setAttribute("stroke-width", "10");
    gSeg.appendChild(innerBg);
    const windowLogs = logs.filter(l => l.endTime > rangeStart && l.startTime < rangeEnd);
    windowLogs.forEach(log => {
        const color = logSegmentColor(log);
        const thin = !!log.parallel;
        drawClockSegment(gSeg, thin ? 38 : 50, log.startTime, log.endTime, rangeStart, rangeEnd, color, log, thin ? 10 : 14);
    });
    const angle = ((now - rangeStart) / (rangeEnd - rangeStart)) * 360;
    if (handEl) handEl.style.transform = `translateX(-50%) rotate(${angle}deg)`;
}

let promptCallback = null;
function showPrompt(title, placeholder, defaultValue, callback) {
    document.getElementById('prompt-title').innerText = title;
    document.getElementById('prompt-input').placeholder = placeholder || '';
    document.getElementById('prompt-input').value = defaultValue || '';
    promptCallback = callback;
    document.getElementById('prompt-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('prompt-input').focus(), 100);
}
function confirmPrompt() {
    const val = document.getElementById('prompt-input').value;
    document.getElementById('prompt-modal').classList.add('hidden');
    document.activeElement?.blur();
    if (promptCallback) promptCallback(val);
    promptCallback = null;
}
function closePrompt() {
    document.getElementById('prompt-modal').classList.add('hidden');
    if (promptCallback) promptCallback(null);
    promptCallback = null;
}
let catEmojiPickerCb = null;

function showCategoryPicker(title, callback) {
    catEmojiPickerCb = callback;
    document.getElementById('cat-emoji-picker-title').innerText = title || '选择图标';
    const left = document.getElementById('cat-emoji-left');
    left.innerHTML = '';
    EMOJI_CAT_ORDER.forEach((catName, ci) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full text-left px-2.5 py-2 text-[11px] font-bold rounded-lg ' + (ci === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500');
        btn.innerText = catName;
        btn.addEventListener('click', () => {
            left.querySelectorAll('button').forEach(b => {
                b.className = 'w-full text-left px-2.5 py-2 text-[11px] font-bold rounded-lg bg-slate-50 text-slate-500';
            });
            btn.className = 'w-full text-left px-2.5 py-2 text-[11px] font-bold rounded-lg bg-indigo-600 text-white';
            renderCatGrid(EMOJI_CATS[catName]);
        });
        left.appendChild(btn);
    });
    renderCatGrid(EMOJI_CATS['所有']);
    document.getElementById('cat-emoji-picker').classList.remove('hidden');
}
function renderCatGrid(emojis) {
    const grid = document.getElementById('cat-emoji-grid');
    grid.innerHTML = '';
    emojis.forEach(emoji => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-10 h-10 rounded-lg text-lg flex items-center justify-center bg-slate-50 active:bg-indigo-200 transition-colors';
        btn.innerText = emoji;
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('cat-emoji-picker').classList.add('hidden');
            if (catEmojiPickerCb) { catEmojiPickerCb(emoji); catEmojiPickerCb = null; }
        });
        grid.appendChild(btn);
    });
}
document.addEventListener('click', (e) => {
    const picker = document.getElementById('cat-emoji-picker');
    if (picker && !picker.classList.contains('hidden') && e.target === picker) {
        picker.classList.add('hidden');
        if (catEmojiPickerCb) { catEmojiPickerCb(null); catEmojiPickerCb = null; }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('prompt-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') confirmPrompt();
    });
    document.getElementById('edit-note-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') confirmEdit();
    });
});

let confirmCallback = null;
function closeConfirm(result) {
    document.getElementById('confirm-modal').classList.add('hidden');
    if (confirmCallback) confirmCallback(result);
    confirmCallback = null;
}

let keyboardActiveModal = null;
let keyboardShifts = new WeakMap();
const KEYBOARD_GAP = 80;
document.addEventListener('focusin', (e) => {
    const input = e.target;
    if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA') return;
    const modal = input.closest('#prompt-modal, #edit-modal, #cat-emoji-picker');
    if (!modal) return;
    keyboardActiveModal = modal;
    if (window.visualViewport) {
        setTimeout(() => {
            const vv = window.visualViewport;
            const body = modal.querySelector('.bg-white');
            if (!body) return;
            const rect = body.getBoundingClientRect();
            if (rect.bottom > vv.height) {
                const overlap = rect.bottom - vv.height + KEYBOARD_GAP;
                keyboardShifts.set(body, body.style.marginTop);
                body.style.marginTop = `-${overlap}px`;
            }
        }, 350);
    }
});
document.addEventListener('focusout', (e) => {
    const input = e.target;
    if (input.tagName !== 'INPUT' && input.tagName !== 'TEXTAREA') return;
    const modal = input.closest('#prompt-modal, #edit-modal, #cat-emoji-picker');
    if (!modal) return;
    setTimeout(() => {
        if (!modal.contains(document.activeElement)) {
            const body = modal.querySelector('.bg-white');
            if (body && keyboardShifts.has(body)) {
                body.style.marginTop = keyboardShifts.get(body);
                keyboardShifts.delete(body);
            }
            keyboardActiveModal = null;
        }
    }, 150);
});
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', () => {
        if (!keyboardActiveModal) return;
        const vv = window.visualViewport;
        const body = keyboardActiveModal.querySelector('.bg-white');
        if (!body) return;
        const rect = body.getBoundingClientRect();
        if (rect.bottom > vv.height) {
            const overlap = rect.bottom - vv.height + KEYBOARD_GAP;
            keyboardShifts.set(body, body.style.marginTop || '');
            body.style.marginTop = `-${overlap}px`;
        } else if (keyboardShifts.has(body)) {
            body.style.marginTop = keyboardShifts.get(body);
            keyboardShifts.delete(body);
        }
    });
}

let editOldL1 = null, editOldL2 = null;
function showConfirm(title, message, okText, callback, cancelText) {
    document.getElementById('confirm-title').innerText = title;
    document.getElementById('confirm-message').innerText = message;
    const okBtn = document.getElementById('confirm-ok-btn');
    okBtn.innerText = okText || '确定';
    okBtn.className = 'flex-1 py-3 text-sm font-bold text-white ' + (okText === '删除' ? 'bg-red-500' : 'bg-indigo-600') + ' rounded-2xl';
    const cancelBtn = document.getElementById('confirm-cancel-btn');
    if (cancelBtn) cancelBtn.innerText = cancelText || '取消';
    confirmCallback = callback;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

function openEdit(index) {
    editIndex = index;
    const log = logs[index];
    if (!log) return;
    editOldL1 = log.l1;
    editOldL2 = log.l2;
    document.getElementById('edit-log-preview').innerText = `${log.l1 || '??'}${log.l2 ? ' / ' + log.l2 : ''} — ${formatDuration((log.endTime||Date.now())-log.startTime)}`;
    document.getElementById('edit-start-display').innerText = formatBeijingClockSec(log.startTime);
    document.getElementById('edit-duration-display').innerText = formatDuration((log.duration || Math.max(1, Math.round(((log.endTime||Date.now())-log.startTime)/60000))) * 60000);
    document.getElementById('edit-note-input').value = log.note || '';
    updateEditCatDisplay(log.l1, log.l2);
    document.getElementById('edit-modal').classList.remove('hidden');
}
function updateEditCatDisplay(l1, l2) {
    const d = document.getElementById('edit-cat-display');
    const cat = getCat(l1);
    const icon = cat?.icon || '📌';
    d.innerText = l2 ? `${icon} ${l1} / ${l2}` : `${icon} ${l1}`;
}
document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('edit-cat-btn');
    if (btn) btn.addEventListener('click', () => {
        if (editIndex === null) return;
        _parallelCallback = (l1, l2) => { editOldL1 = l1; editOldL2 = l2; updateEditCatDisplay(l1, l2); document.getElementById('edit-modal').classList.remove('hidden'); };
        pickerMode = 'edit';
        document.getElementById('edit-modal').classList.add('hidden');
        document.getElementById('drawer-title').innerText = "修改分类";
        document.getElementById('drawer-footer').classList.add('hidden');
        showDrawer();
        renderPicker();
        renderDrawerToggle();
    });
});
function confirmEdit() {
    if (editIndex !== null && logs[editIndex]) {
        const log = logs[editIndex];
        if (editOldL1) { log.l1 = editOldL1; log.l2 = editOldL2; }
        log.note = document.getElementById('edit-note-input').value;
        localStorage.setItem('v9_logs', JSON.stringify(logs));
    }
    document.getElementById('edit-modal').classList.add('hidden');
    editIndex = null;
    editOldL1 = null; editOldL2 = null;
    renderAll();
}
function closeEdit() {
    document.getElementById('edit-modal').classList.add('hidden');
    editIndex = null;
    editOldL1 = null; editOldL2 = null;
}

function deleteLogEntry(id) {
    const target = logs.find(l => l.id === id);
    if (target && !target.parallel) {
        // 删除：时间段合并到前一段（同一天）
        const sameDay = logs
            .filter(l => !l.parallel && formatBeijingDate(l.startTime) === formatBeijingDate(target.startTime))
            .sort((a, b) => a.startTime - b.startTime);
        const idx = sameDay.findIndex(l => l.id === id);
        if (idx > 0) {
            const prev = sameDay[idx - 1];
            const targetEnd = target.endTime || (target.startTime + (target.duration || 0) * 60000);
            prev.endTime = Math.max(prev.endTime || prev.startTime, targetEnd);
            prev.duration = Math.round((prev.endTime - prev.startTime) / 60000);
        }
    }
    logs = logs.filter(l => l.id !== id);
    // 级联删除挂载的并行子记录
    if (target && !target.parallel) {
        logs = logs.filter(l => !(l.parallel && l.parentId === target.id));
    }
    mergeAdjacentSameActivity();
    localStorage.setItem('v9_logs', JSON.stringify(logs));
    renderAll();
}

function executeRecord(l1, l2, tag, note) {
    if (parallelCurrent) {
        const pName = displayName(parallelCurrent);
        showConfirm("⏎ 并行还在运行", `「${pName}」还在跑，是结束它还是结转到下一条主线？`, "一起结束", (ok) => {
            if (!ok) {
                // 结转：结束当前段，重启续上
                doExecuteRecord(l1, l2, tag, note, false, true);
            } else {
                doExecuteRecord(l1, l2, tag, note, true, false);
            }
        }, "结转");
        return;
    }
    doExecuteRecord(l1, l2, tag, note, false);
}
function doExecuteRecord(l1, l2, tag, note, endParallel, rollover) {
    const now = Date.now();
    const cat = getCat(l1);
    const color = cat ? cat.color : "#cbd5e1";
    if (current) {
        const dur = Math.max(1, Math.round((now - current.startTime) / 60000));
        logs.unshift({ ...current, endTime: now, duration: dur, color: current.color || color, status: current.l1 ? 'ok' : 'pending' });
        // 主线切换时，结算并行
        const pid = current.id;
        if (parallelCurrent && (endParallel || rollover)) {
            const pDur = Math.max(1, Math.round((now - parallelCurrent.startTime) / 60000));
            logs.unshift({ ...parallelCurrent, endTime: now, duration: pDur, parallel: true, parentId: pid, note: parallelCurrent.note || '' });
            if (rollover) {
                // 结转：结束当前段，重启续上
                parallelCurrent = { ...parallelCurrent, id: now + 0.001, startTime: now };
                localStorage.setItem('v9_parallel', JSON.stringify(parallelCurrent));
            } else {
                // 一起结束
                parallelCurrent = null;
                localStorage.removeItem('v9_parallel');
            }
        }
        parallelHistory.forEach(p => {
            logs.unshift({ ...p, parentId: pid });
        });
        parallelHistory = [];
        localStorage.setItem('v9_parallel_history', JSON.stringify(parallelHistory));
        localStorage.setItem('v9_logs', JSON.stringify(logs));
    }
    current = { id: now, startTime: now, l1, l2, tag, note, color };
    localStorage.setItem('v9_current', JSON.stringify(current));
    closeDrawer(); renderAll();
}

function executeAddShortcut(l1, l2) {
    if (shortcuts.length >= 9) {
        alert("上限9个");
        closeDrawer();
        return;
    }
    shortcuts.push({ l1, l2, icon: "📌" });
    localStorage.setItem('v9_shorts', JSON.stringify(shortcuts));
    closeDrawer(); renderAll();
}

function executeEditShortcut(l1, l2) {
    if (editingShortcutIndex === null || !shortcuts[editingShortcutIndex]) return;
    shortcuts[editingShortcutIndex].l1 = l1;
    shortcuts[editingShortcutIndex].l2 = l2;
    localStorage.setItem('v9_shorts', JSON.stringify(shortcuts));
    editingShortcutIndex = null;
    closeDrawer();
    renderAll();
}

let _parallelPending = false;
let _parallelCallback = null;
function drawerPick(l1, l2) {
    if (_parallelPending) {
        _parallelPending = false;
        const cat = getCat(l1);
        closeDrawer();
        toggleParallel(l1, l2 || '', cat?.icon || '📌');
        return;
    }
    if (pickerMode === 'shortcut') {
        executeAddShortcut(l1, l2);
    } else if (pickerMode === 'shortcut-edit') {
        executeEditShortcut(l1, l2);
    } else if (pickerMode === 'parallel-record') {
        const cat = getCat(l1);
        const t = document.getElementById('parallel-start').value.split(':');
        const dur = parseInt(document.getElementById('parallel-dur').value) || 30;
        const now = Date.now();
        const d = new Date(now);
        d.setHours(+t[0], +t[1], 0, 0);
        if (d.getTime() > now) d.setDate(d.getDate() - 1);
        const entry = {
            id: Date.now() + Math.random(),
            startTime: d.getTime(),
            endTime: d.getTime() + dur * 60000,
            duration: dur,
            l1, l2: l2 || '',
            tag: '', note: document.getElementById('drawer-note').value || '',
            color: cat?.color || '#cbd5e1',
            parallel: true,
            parentId: null
        };
        logs.unshift(entry);
        localStorage.setItem('v9_logs', JSON.stringify(logs));
        closeDrawer();
        renderAll();
    } else if (pickerMode === 'edit' || pickerMode === 'split' || (pickerMode && pickerMode.startsWith('parallel-backfill'))) {
        if (pickerMode.startsWith('parallel-backfill')) {
            snapTimeToRange();
            if (!isTimeInParentRange()) {
                showConfirm('⏱ 时间不合法', '开始或结束时间超出了父活动的范围，请调整后重新选择分类。', '知道了', () => {});
                return;
            }
        }
        const cb = _parallelCallback;
        closeDrawer();
        if (cb) { cb(l1, l2); }
    } else {
        executeRecord(l1, l2, "", document.getElementById('drawer-note').value);
    }
}

function renderShortcuts() {
    const container = document.getElementById('home-shortcuts');
    container.innerHTML = "";
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = "shortcut-add-btn shortcut-add-btn--main btn-active";
    addBtn.innerText = "＋";
    addBtn.title = "记一笔活动";
    addBtn.addEventListener('click', () => { openDrawerForRecord(); });
    container.appendChild(addBtn);
    const n = shortcuts.length;
    let cols = 3;
    if (n <= 2) cols = n;
    else if (n === 3 || n === 4) cols = 2;
    else if (n >= 7 && n <= 8) cols = 4;
    const grid = document.createElement('div');
    grid.className = `shortcut-grid grid grid-cols-${cols} gap-1.5 flex-1`;
    shortcuts.forEach((s, idx) => {
        const item = document.createElement('button');
        item.type = 'button';
        const isPressed = current && current.l1 === s.l1 && current.l2 === s.l2;
        item.className = `keycap keycap--main${isPressed ? ' pressed' : ''} btn-active`;
        let pressTimer = null;
        let longPressed = false;
        const clearPress = () => { if (pressTimer) clearTimeout(pressTimer); pressTimer = null; };
        item.addEventListener('pointerdown', () => {
            longPressed = false;
            pressTimer = setTimeout(() => { longPressed = true; editShortcut(idx); }, 550);
        });
        item.addEventListener('pointerup', clearPress);
        item.addEventListener('pointerleave', clearPress);
        item.addEventListener('pointercancel', clearPress);
        item.addEventListener('click', (e) => {
            if (longPressed) { e.preventDefault(); return; }
            if (current && current.l1 === s.l1 && current.l2 === s.l2) return;
            pickerMode = 'record';
            executeRecord(s.l1, s.l2, "", "");
        });
        const icon = document.createElement('span');
        icon.className = "keycap-icon";
        icon.innerText = s.icon;
        const label = document.createElement('span');
        label.className = "keycap-label";
        label.innerText = s.l2 || s.l1;
        item.append(icon, label);
        grid.appendChild(item);
    });
    container.appendChild(grid);
}
function renderParallelShortcuts() {
    const container = document.getElementById('parallel-shortcuts');
    container.innerHTML = "";
    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.className = "shortcut-add-btn shortcut-add-btn--parallel btn-active";
    addBtn.innerText = "＋";
    addBtn.title = "记一笔并行活动";
    addBtn.addEventListener('click', () => {
        _parallelPending = true;
        openDrawerForRecord();
    });
    container.appendChild(addBtn);
    const n = parallelShortcuts.length;
    let cols = 3;
    if (n <= 2) cols = n;
    else if (n === 3 || n === 4) cols = 2;
    else if (n >= 7 && n <= 8) cols = 4;
    const grid = document.createElement('div');
    grid.className = `shortcut-grid grid grid-cols-${cols} gap-1.5 flex-1`;
    parallelShortcuts.forEach((s, idx) => {
        const item = document.createElement('button');
        item.type = 'button';
        const isActive = parallelCurrent && parallelCurrent.l1 === s.l1 && parallelCurrent.l2 === s.l2;
        item.className = `keycap keycap--parallel-slot${isActive ? ' pressed' : ''} btn-active`;
        item.dataset.slotIdx = String(idx % 2);
        item.title = s.l2 || s.l1;
        const icon = document.createElement('span');
        icon.className = "keycap-icon";
        icon.innerText = s.icon;
        const label = document.createElement('span');
        label.className = "keycap-label";
        label.innerText = s.l2 || s.l1;
        item.append(icon, label);
        item.addEventListener('click', () => { toggleParallel(s.l1, s.l2, s.icon); });
        grid.appendChild(item);
    });
    container.appendChild(grid);
    updateParallelStatus();
}
function toggleParallel(l1, l2, icon) {
    const now = Date.now();
    // 结束当前并行 → 存入 parallelHistory
    if (parallelCurrent) {
        const dur = Math.max(1, Math.round((now - parallelCurrent.startTime) / 60000));
        parallelHistory.unshift({ ...parallelCurrent, endTime: now, duration: dur, parallel: true, parentId: null, note: parallelCurrent.note || '' });
        if (parallelCurrent.l1 === l1 && parallelCurrent.l2 === l2) {
            // 点同一个并行 → 只结束，不开新的
            parallelCurrent = null;
            localStorage.removeItem('v9_parallel');
        } else {
            // 点不同的并行 → 结束旧的，开新的
            parallelCurrent = { id: now, startTime: now, l1, l2, icon: icon || '📌', note: '' };
            localStorage.setItem('v9_parallel', JSON.stringify(parallelCurrent));
        }
        localStorage.setItem('v9_parallel_history', JSON.stringify(parallelHistory));
    } else {
        // 没有并行在跑 → 直接开新的
        parallelCurrent = { id: now, startTime: now, l1, l2, icon: icon || '📌', note: '' };
        localStorage.setItem('v9_parallel', JSON.stringify(parallelCurrent));
    }
    renderParallelShortcuts();
    renderAll();
}
function updateParallelStatus() {
    const badge = document.getElementById('parallel-status');
    if (!badge) return;
    if (parallelCurrent) {
        badge.classList.remove('hidden');
        badge.innerText = `${parallelCurrent.icon || '⏎'} ${parallelCurrent.l2 || parallelCurrent.l1}`;
    } else {
        badge.classList.add('hidden');
    }
function openDrawer() {
    pickerMode = 'record';
    document.getElementById('drawer-title').innerText = "记一笔活动";
    document.getElementById('parallel-time-row').classList.add('hidden');
    showDrawer();
    renderDrawerToggle();
    document.getElementById('drawer-note').value = "";
    document.getElementById('drawer-footer').classList.remove('hidden');
    renderPicker();
}
}
function openDrawerForRecord() {
    pickerMode = 'record';
    _parallelCallback = null;
    document.getElementById('drawer-title').innerText = "记一笔活动";
    document.getElementById('parallel-time-row').classList.add('hidden');
    document.getElementById('drawer-footer').classList.remove('hidden');
    document.getElementById('drawer-note').placeholder = "选填备注...";
    document.getElementById('drawer-note').value = "";
    showDrawer();
    renderPicker();
    renderDrawerToggle();
}

function editShortcut(idx) {
    const s = shortcuts[idx];
    if (!s) return;
    showPrompt("编辑快捷入口 Emoji", "输入一个 Emoji", s.icon || "📌", (icon) => {
        if (icon === null) return;
        shortcuts[idx].icon = icon.trim() || "📌";
        localStorage.setItem('v9_shorts', JSON.stringify(shortcuts));
        if (confirm("要重新选择这个快捷入口的分类吗？")) {
            editingShortcutIndex = idx;
            pickerMode = 'shortcut-edit';
            document.getElementById('drawer-title').innerText = "修改快捷入口";
            document.getElementById('drawer-footer').classList.add('hidden');
            showDrawer();
            renderPicker();
        } else {
            renderAll();
        }
    });
}

function syncConfigSectionUI() {
    document.querySelectorAll('.config-tile[data-config-section]').forEach((el) => {
        el.classList.toggle('active', el.dataset.configSection === configSectionOpen);
    });
    const expand = document.getElementById('config-expand');
    if (expand) expand.classList.toggle('hidden', !configSectionOpen);
    ['clock', 'shortcut', 'parallel', 'report', 'cats', 'more'].forEach((id) => {
        const panel = document.getElementById('config-panel-' + id);
        if (panel) panel.classList.toggle('hidden', configSectionOpen !== id);
    });
}

function openConfigSection(id) {
    configSectionOpen = configSectionOpen === id ? null : id;
    syncConfigSectionUI();
    renderConfig();
}
window.openConfigSection = openConfigSection;

function toggleConfigEdit() {
    configEditMode = !configEditMode;
    const btn = document.getElementById('config-edit-btn');
    if (btn) {
        btn.innerText = configEditMode ? '完成' : '编辑';
        btn.className = configEditMode ? 'text-[10px] bg-indigo-100 text-indigo-600 px-3 py-1.5 rounded-full font-black' : 'text-[10px] bg-slate-100 text-slate-500 px-3 py-1.5 rounded-full font-black';
    }
    renderConfig();
}

function toggleShortcutIcons() {
    showShortcutIcons = !showShortcutIcons;
    const toggle = document.getElementById('shortcut-icon-toggle');
    const text = document.getElementById('shortcut-icon-toggle-text');
    if (showShortcutIcons) {
        toggle.style.background = '#6366f1';
        toggle.querySelector('div').style.transform = 'translateX(14px)';
        if (text) text.innerText = '图标';
    } else {
        toggle.style.background = '#94a3b8';
        toggle.querySelector('div').style.transform = 'translateX(0)';
        if (text) text.innerText = '隐藏';
    }
    renderShortcuts();
    renderConfig();
}


function renderReportSummarySettings() {
    const box = document.getElementById('report-summary-settings-ui');
    if (!box || typeof REPORT_METRIC_POOL === 'undefined') return;
    box.innerHTML = '';

    ['main', 'parallel'].forEach((view) => {
        const title = view === 'main' ? '主线摘要（3 格）' : '并行摘要（3 格）';
        const wrap = document.createElement('div');
        wrap.className = 'summary-settings-group border-b border-slate-50 pb-2 last:border-0';
        const h = document.createElement('div');
        h.className = 'text-[11px] font-black text-slate-600';
        h.innerText = title;
        wrap.appendChild(h);
        const slots = getReportSummarySlots(view);
        const used = new Set();
        slots.forEach((slotId, idx) => {
            const row = document.createElement('div');
            row.className = 'summary-slot-row';
            const lab = document.createElement('span');
            lab.className = 'text-[10px] font-bold text-slate-400 w-8 shrink-0';
            lab.innerText = `格${idx + 1}`;
            const current = REPORT_METRIC_POOL[view].find((m) => m.id === slotId);
            const items = REPORT_METRIC_POOL[view].map((m) => ({ value: m.id, label: m.label }));
            const trigger = createPickerTrigger(current?.label || '—', () => {
                openCompactWheel({
                    title: (view === 'main' ? '主线' : '并行') + ` · 格${idx + 1}`,
                    items,
                    value: slotId,
                    onSelect: (id) => {
                        const next = getReportSummarySlots(view);
                        next[idx] = id;
                        saveReportSummarySlots(view, next);
                        renderReportSummarySettings();
                        if (typeof renderReportBillboard === "function") renderReportBillboard();
                    },
                });
            });
            row.append(lab, trigger);
            wrap.appendChild(row);
        });
        box.appendChild(wrap);
    });
}

function renderConfig() {
    syncConfigSectionUI();
    renderClockSettings();
    renderReportSummarySettings();
    const shortcutList = document.getElementById('shortcut-list');
    shortcutList.innerHTML = "";
    shortcuts.forEach((s, idx) => {
        const card = document.createElement('div');
        const compact = !showShortcutIcons;
        card.className = compact
            ? "bg-slate-50 rounded-xl p-1.5 text-center text-xs font-bold relative"
            : "bg-slate-50 rounded-2xl p-2 text-center text-xs font-bold relative";
        if (showShortcutIcons) {
            const icon = document.createElement('div');
            icon.className = "text-xs leading-none mb-0.5";
            icon.innerText = s.icon;
            card.appendChild(icon);
        }
        const label = document.createElement('div');
        label.className = "text-xs font-bold leading-tight";
        label.innerText = s.l2 || s.l1;
        card.appendChild(label);
        {
            const del = document.createElement('button');
            del.type = 'button';
            del.className = "absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 text-white rounded-full text-[10px] flex items-center justify-center shadow-sm";
            del.innerText = "✕";
            del.addEventListener('click', () => {
                shortcuts.splice(idx, 1);
                localStorage.setItem('v9_shorts', JSON.stringify(shortcuts));
                renderAll();
            });
            card.appendChild(del);
        }
        shortcutList.appendChild(card);
    });

    const paraList = document.getElementById('parallel-shortcut-list');
    if (paraList) {
        paraList.innerHTML = "";
        parallelShortcuts.forEach((s, idx) => {
            const card = document.createElement('div');
            card.className = "bg-violet-50 rounded-2xl p-2 text-center text-xs font-bold relative";
            const icon = document.createElement('div');
            icon.className = "text-xs leading-none mb-0.5";
            icon.innerText = s.icon;
            card.appendChild(icon);
            const label = document.createElement('div');
            label.className = "text-xs font-bold leading-tight";
            label.innerText = s.l2 || s.l1;
            card.appendChild(label);
            {
                const del = document.createElement('button');
                del.type = 'button';
                del.className = "absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 text-white rounded-full text-[10px] flex items-center justify-center shadow-sm";
                del.innerText = "✕";
                del.addEventListener('click', () => {
                    parallelShortcuts.splice(idx, 1);
                    localStorage.setItem('v9_parallel_shorts', JSON.stringify(parallelShortcuts));
                    renderAll();
                });
                card.appendChild(del);
            }
            paraList.appendChild(card);
        });
    }

    const catList = document.getElementById('full-cat-list');
    catList.innerHTML = "";
    cats.forEach(c => {
        const wrap = document.createElement('div');
        wrap.className = "space-y-2 border-b border-slate-50 pb-3";

        const head = document.createElement('div');
        head.className = "flex justify-between items-center text-base font-black";
        const titleGroup = document.createElement('div');
        titleGroup.className = "flex items-center gap-2";
        const PRESET_COLORS = ['#f59e0b','#06b6d4','#10b981','#0ea5e9','#f97316','#c4841a','#ec4899','#3b82f6','#ef4444','#8b5cf6','#a0522d','#334155'];
        const colorDot = document.createElement('button');
        colorDot.type = 'button';
        colorDot.className = "w-3.5 h-3.5 rounded-full shrink-0 cursor-pointer";
        colorDot.style.background = c.color || '#6366f1';
        colorDot.title = "点击修改颜色";
        colorDot.addEventListener('click', (e) => {
            e.stopPropagation();
            const old = document.querySelector('.color-picker-popup');
            if (old) { document.querySelector('.color-picker-overlay')?.remove(); old.remove(); return; }
            const overlay = document.createElement('div');
            overlay.className = 'color-picker-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:9998;background:transparent;';
            overlay.addEventListener('click', () => { popup.remove(); overlay.remove(); });
            document.body.appendChild(overlay);
            const popup = document.createElement('div');
            popup.className = 'color-picker-popup';
            popup.style.cssText = 'position:fixed;z-index:9999;background:white;border-radius:20px;padding:14px;box-shadow:0 8px 32px rgba(0,0,0,0.15);top:50%;left:50%;transform:translate(-50%,-50%);width:auto;';
            const grid = document.createElement('div');
            grid.style.cssText = 'display:grid;grid-template-columns:repeat(6,1fr);gap:8px;';
            PRESET_COLORS.forEach(clr => {
                const swatch = document.createElement('button');
                swatch.type = 'button';
                swatch.style.cssText = `width:36px;height:36px;border-radius:50%;background:${clr};border:2px solid ${c.color === clr ? '#0f172a' : '#e2e8f0'};cursor:pointer;`;
                swatch.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    c.color = clr;
                    colorDot.style.background = clr;
                    localStorage.setItem('v9_cats', JSON.stringify(cats));
                    renderAll();
                    popup.remove();
                    overlay.remove();
                });
                grid.appendChild(swatch);
            });
            popup.appendChild(grid);
            document.body.appendChild(popup);
        });
        const title = document.createElement('span');
        title.innerText = `${c.icon} ${c.name}`;
        titleGroup.append(colorDot, title);
        head.appendChild(titleGroup);
        {
            const actions = document.createElement('div');
            actions.className = "flex space-x-2";
            const edit = document.createElement('button');
            edit.type = 'button';
            edit.className = "text-slate-400 text-[11px] font-black";
            edit.innerText = "编辑";
            edit.addEventListener('click', () => editL1(c.id));
            const del = document.createElement('button');
            del.type = 'button';
            del.className = "text-red-400 text-[11px] font-black";
            del.innerText = "✕";
            del.addEventListener('click', () => delL1(c.id));
            actions.append(edit, del);
            head.appendChild(actions);
        }
        wrap.appendChild(head);

        const subs = document.createElement('div');
        subs.className = "grid grid-cols-3 gap-2";
        c.subs.forEach(name => {
            const card = document.createElement('div');
            card.className = "bg-slate-50 rounded-xl p-1.5 text-center text-xs font-bold relative cursor-pointer";
            const iconEl = document.createElement('div');
            iconEl.className = "text-xs leading-none mb-0.5";
            iconEl.innerText = getSubIcon(name, c.icon);
            card.appendChild(iconEl);
            const nameEl = document.createElement('div');
            nameEl.className = "leading-tight";
            nameEl.innerText = name;
            card.appendChild(nameEl);
            card.addEventListener('click', () => editS(c.id, name));
            {
                const del = document.createElement('button');
                del.type = 'button';
                del.className = "absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-400 text-white rounded-full text-[8px] flex items-center justify-center shadow-sm";
                del.innerText = "✕";
                del.addEventListener('click', (e) => { e.stopPropagation(); delS(c.id, name); });
                card.appendChild(del);
            }
            subs.appendChild(card);
        });
        const addBtn = document.createElement('button');
        addBtn.type = 'button';
        addBtn.className = "bg-slate-100 border border-dashed border-slate-300 rounded-xl p-1.5 text-center text-[10px] font-bold text-slate-400 cursor-pointer";
        addBtn.innerHTML = '<div class="text-base leading-none mb-0.5">＋</div><div class="leading-tight">添加</div>';
        addBtn.addEventListener('click', () => addS(c.id));
        subs.appendChild(addBtn);

        wrap.append(head, subs);
        catList.appendChild(wrap);
    });
    const addL1Btn = document.createElement('button');
    addL1Btn.type = 'button';
    addL1Btn.className = "w-full py-3 text-center text-sm font-bold text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300";
    addL1Btn.innerText = "＋ 添加一级分类";
    addL1Btn.addEventListener('click', () => addL1());
    catList.appendChild(addL1Btn);
}

function buildLogFlowBar(color, muted) {
    const bar = document.createElement('div');
    bar.className = 'log-flow-bar' + (muted ? ' log-flow-bar--muted' : '');
    bar.style.background = color || '#cbd5e1';
    return bar;
}

function buildLogFlowMainRow(opts) {
    const { timeText, nameText, durText, live, durId, endedParallel } = opts;
    const top = document.createElement('div');
    top.className = 'log-flow-main';
    const time = document.createElement('span');
    time.className = 'log-flow-time';
    time.innerText = timeText;
    const name = document.createElement('span');
    name.className = 'log-flow-name';
    name.innerText = nameText;
    const dur = document.createElement('span');
    const durCls = live ? 'log-flow-dur--live' : (endedParallel ? 'log-flow-dur--done' : 'log-flow-dur--log');
    dur.className = 'log-flow-dur ' + durCls;
    if (durId) dur.id = durId;
    dur.innerText = durText;
    top.append(time, name, dur);
    return top;
}

function appendLogFlowNote(body, log) {
    if (!log || (!log.note && !log.tag)) return;
    const noteRow = document.createElement('div');
    noteRow.className = 'log-flow-note';
    if (log.tag) {
        const tagEl = document.createElement('span');
        tagEl.className = "text-[10px] font-bold text-indigo-400 bg-indigo-50 px-1.5 py-0.5 rounded-full shrink-0";
        tagEl.innerText = '#' + log.tag;
        noteRow.appendChild(tagEl);
    }
    if (log.note) {
        const note = document.createElement('span');
        note.className = 'log-flow-note-text';
        note.innerText = log.note;
        noteRow.appendChild(note);
    }
    body.appendChild(noteRow);
}

function renderLogs(listId, dateStr) {
    const list = document.getElementById(listId);
    if (!list) return;
    const moreWrap = listId === 'log-list' ? document.getElementById('load-more-wrap') : null;
    list.innerHTML = "";

    // ── 实时卡片（仅查看今天） ──
    if (isDateToday(dateStr) && current) {
        const liveWrap = document.createElement('div');
        liveWrap.className = "swipe-wrap";
        const liveCard = document.createElement('div');
        liveCard.className = logFlowCardClass('main-live');
        const inner = document.createElement('div');
        inner.className = "log-flow-inner";
        const bar = buildLogFlowBar((cats.find(c => c.name === current.l1)?.color) || '#6366f1', false);
        const body = document.createElement('div');
        body.className = 'log-flow-body';
        body.appendChild(buildLogFlowMainRow({
            timeText: formatBeijingClockSec(current.startTime),
            nameText: displayName(current),
            durText: formatDuration(logDurationMs(current, Date.now())),
            live: true,
            durId: 'live-main-duration'
        }));
        inner.append(bar, body);
        liveCard.appendChild(inner);
        liveWrap.appendChild(liveCard);
        list.appendChild(liveWrap);
    }

    // ── 辅助：渲染并行使卡片（主线卡片样式，无缩进） ──
    function createLiveParallelCard(parent, parallel, isActive, idx) {
        const wrap = document.createElement('div');
        wrap.className = "swipe-wrap";
        const leftAct = document.createElement('div');
        leftAct.className = "swipe-actions left";
        const delBtn = document.createElement('div');
        delBtn.className = "swipe-action-btn delete";
        delBtn.innerText = isActive ? "关闭" : "删除";
        leftAct.appendChild(delBtn);
        wrap.appendChild(leftAct);
        const rightAct = document.createElement('div');
        rightAct.className = "swipe-actions right";
        const editBtn = document.createElement('div');
        editBtn.className = "swipe-action-btn edit";
        editBtn.innerText = "切换";
        rightAct.appendChild(editBtn);
        wrap.appendChild(rightAct);
        const card = document.createElement('div');
        card.className = logFlowCardClass(isActive ? 'parallel-live' : 'parallel-log');
        let sx=0,sy=0,swiping=false,dx=0;
        card.addEventListener('touchstart', e=>{const t=e.touches[0];sx=t.clientX;sy=t.clientY;swiping=false;dx=0;card.classList.add('swiping');},{passive:false});
        card.addEventListener('touchmove', e=>{const d=e.touches[0].clientX-sx;const dy=e.touches[0].clientY-sy;if(!swiping&&Math.abs(d)>Math.abs(dy)&&Math.abs(d)>10)swiping=true;if(swiping){e.preventDefault();dx=Math.max(-80,Math.min(80,d));card.style.transform=`translateX(${dx}px)`;}},{passive:false});
        card.addEventListener('touchend',()=>{card.classList.remove('swiping');card.style.transform='';if(swiping){if(dx>55){if(isActive){showConfirm('关闭并行','关闭「'+displayName(parallel)+'」？不会记入日志。','关闭',ok=>{if(ok){parallelCurrent=null;localStorage.removeItem('v9_parallel');renderAll();}})}else{showConfirm('删除并行','删除已结束的「'+displayName(parallel)+'」？','删除',ok=>{if(ok){parallelHistory.splice(idx,1);localStorage.setItem('v9_parallel_history',JSON.stringify(parallelHistory));renderAll();}})}}else if(dx<-55){const cb=(l1,l2)=>{if(isActive){_parallelPending=true;toggleParallel(l1,l2||'',(getCat(l1)?.icon)||'📌');_parallelPending=false;}else{const p=parallelHistory[idx];if(p){p.l1=l1;p.l2=l2||'';const cat=getCat(l1);p.color=cat?.color||'#cbd5e1';localStorage.setItem('v9_parallel_history',JSON.stringify(parallelHistory));renderAll();}}};pickerMode='edit';document.getElementById('drawer-title').innerText=isActive?'切换并行':'修改并行';document.getElementById('drawer-footer').classList.add('hidden');_parallelCallback=cb;showDrawer();renderPicker();renderDrawerToggle();}swiping=false;dx=0;}},{passive:true});
        const inner = document.createElement('div');
        inner.className = "log-flow-inner";
        const barColor = (cats.find(c => c.name === parallel.l1)?.color) || '#cbd5e1';
        const bar = buildLogFlowBar(barColor, false);
        const body = document.createElement('div');
        body.className = 'log-flow-body';
        const durMs = logDurationMs(parallel, isActive ? Date.now() : null);
        body.appendChild(buildLogFlowMainRow({
            timeText: formatBeijingClockSec(parallel.startTime),
            nameText: displayName(parallel),
            durText: formatDuration(durMs),
            live: isActive,
            durId: isActive ? 'live-parallel-duration' : null,
            endedParallel: !isActive
        }));
        inner.append(bar, body);
        card.appendChild(inner);
        wrap.appendChild(card);
        parent.appendChild(wrap);
    }

    // ── 主线下并行窗口（实时 + 已结束） ──
    if (isDateToday(dateStr) && (parallelCurrent || parallelHistory.length > 0)) {
        const ph = document.createElement('div');
        ph.className = "flex items-center gap-2 px-1 pt-4 pb-1";
        const icon = document.createElement('span');
        icon.className = "parallel-flow-icon text-[14px]";
        icon.innerText = "↳";
        const label = document.createElement('span');
        label.className = "parallel-flow-label text-[11px] font-black uppercase tracking-widest";
        label.innerText = "并行";
        ph.append(icon, label);
        if (parallelCurrent) {
            const badge = document.createElement('span');
            badge.className = "text-[8px] font-black text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full";
            badge.innerText = "运行中";
            ph.appendChild(badge);
        }
        list.appendChild(ph);
        const pWrap = document.createElement('div');
        pWrap.className = "log-flow-nest";
        if (parallelCurrent) {
            createLiveParallelCard(pWrap, parallelCurrent, true, 0);
        }
        parallelHistory.forEach((p, i) => {
            createLiveParallelCard(pWrap, p, false, i);
        });
        list.appendChild(pWrap);
    }

    const header = document.createElement('div');
    header.className = 'log-day-header';
    header.innerText = formatDateHeaderLabel(dateStr);
    list.appendChild(header);

    const dayLogs = logs.filter((l) => formatBeijingDate(l.startTime) === dateStr);
    const normalLogs = dayLogs.filter((l) => !l.parallel).sort((a, b) => b.startTime - a.startTime);
    const parallelLogs = dayLogs.filter((l) => l.parallel);

    normalLogs.forEach((log) => {
        const realIdx = logs.indexOf(log);
        createLogRow(list, log, realIdx);
        parallelLogs.filter((p) => p.parentId === log.id).sort((a, b) => a.startTime - b.startTime).forEach((child) => {
            const childIdx = logs.indexOf(child);
            const wrap = document.createElement('div');
            wrap.className = 'log-flow-nest mt-1 mb-1';
            createLogRow(wrap, child, childIdx);
            list.appendChild(wrap);
        });
    });

    if (dayLogs.length === 0 && !(isDateToday(dateStr) && (current || parallelCurrent))) {
        const empty = document.createElement('div');
        empty.className = 'text-center text-[11px] text-slate-400 py-6';
        empty.innerText = '该日暂无流水';
        list.appendChild(empty);
    }
    if (moreWrap) moreWrap.innerHTML = '';
}

function createLogRow(list, log, idx) {
    const wrap = document.createElement('div');
    wrap.className = "swipe-wrap";

    const leftActions = document.createElement('div');
    leftActions.className = "swipe-actions left";
    const delBtn = document.createElement('div');
    delBtn.className = "swipe-action-btn delete";
    delBtn.innerText = "删除";
    leftActions.appendChild(delBtn);
    wrap.appendChild(leftActions);

    const rightActions = document.createElement('div');
    rightActions.className = "swipe-actions right";
    const editBtn = document.createElement('div');
    editBtn.className = "swipe-action-btn edit";
    editBtn.innerText = "编辑";
    rightActions.appendChild(editBtn);
    wrap.appendChild(rightActions);

    const card = document.createElement('div');
    card.className = logFlowCardClass(log.parallel ? 'parallel-log' : 'main-log');

    let startX = 0, startY = 0, isSwiping = false, currentDx = 0;
    let _wasLongPress = false, _lpTimer = null;
    card.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
        isSwiping = false;
        currentDx = 0;
        card.classList.add('swiping');
    }, { passive: true });
    card.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const dx = touch.clientX - startX;
        const dy = touch.clientY - startY;
        if (!isSwiping && Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
            isSwiping = true;
            if (_lpTimer) { clearTimeout(_lpTimer); _lpTimer = null; }
        }
        if (isSwiping) {
            e.preventDefault();
            currentDx = Math.max(-80, Math.min(80, dx));
            card.style.transform = `translateX(${currentDx}px)`;
        }
    }, { passive: false });
    card.addEventListener('touchend', (e) => {
        card.classList.remove('swiping');
        card.style.transform = '';
        if (isSwiping) {
            if (currentDx > 55) {
                const logName = displayName(log);
                showConfirm("确认删除", `删除「${logName}」？这条记录将被永久移除。`, "删除", (ok) => {
                    if (ok) deleteLogEntry(log.id);
                });
            } else if (currentDx < -55) {
                openEdit(idx);
            }
            isSwiping = false;
            currentDx = 0;
        }
    }, { passive: true });

    if (!log.parallel && !log._crossDay) {
        card.addEventListener('pointerdown', (e) => {
            if (isSwiping) return;
            _wasLongPress = false;
            _lpTimer = setTimeout(() => {
                if (isSwiping) return;
                _wasLongPress = true;
                openSplitDrawer(log);
            }, 500);
        });
        card.addEventListener('pointerup', () => { clearTimeout(_lpTimer); });
        card.addEventListener('pointerleave', () => { clearTimeout(_lpTimer); });
        card.addEventListener('pointercancel', () => { clearTimeout(_lpTimer); });
        card.addEventListener('click', (e) => {
            if (isSwiping || _wasLongPress) return;
            openBackfillDrawer(log);
        });
    }

    const inner = document.createElement('div');
    inner.className = "log-flow-inner";

    const bar = buildLogFlowBar((cats.find(c => c.name === log.l1)?.color) || '#cbd5e1', false);

    const body = document.createElement('div');
    body.className = "log-flow-body";
    body.appendChild(buildLogFlowMainRow({
        timeText: formatBeijingClockSec(log.startTime),
        nameText: displayName(log),
        durText: formatDuration(logDurationMs(log)),
        live: false,
        endedParallel: !!log.parallel
    }));
    appendLogFlowNote(body, log);

    inner.append(bar, body);
    card.appendChild(inner);
    wrap.appendChild(card);
    list.appendChild(wrap);
    return wrap;
}

function openBackfillDrawer(parentLog) {
    pickerMode = 'parallel-backfill';
    document.getElementById('drawer-title').innerText = `↳ 补录并行于 ${displayName(parentLog)}`;
    document.getElementById('parallel-time-row').classList.remove('hidden');
    document.getElementById('drawer-footer').classList.remove('hidden');
    document.getElementById('drawer-note').value = '';
    document.getElementById('drawer-note').placeholder = '备注（选填）';
    const parentEnd = parentLog.endTime || (parentLog.startTime + (parentLog.duration || 60) * 60000);
    _backfillRange = { start: parentLog.startTime, end: parentEnd };
    setTimeInFields('ps', new Date(parentLog.startTime));
    setTimeInFields('pe', new Date(parentEnd));
    syncBackfillProgress(parentLog);
    setupBackfillDrag(parentLog, parentEnd);
    _parallelCallback = (l1, l2) => {
        const cat = getCat(l1);
        const startMs = parseTimeFromInput('ps', parentLog.startTime);
        const realParentEnd = parentLog.endTime || (parentLog.startTime + (parentLog.duration || 60) * 60000);
        const clampedStart = Math.max(parentLog.startTime, Math.min(realParentEnd, startMs));
        const clampedEnd = Math.max(parentLog.startTime, Math.min(realParentEnd, parseTimeFromInput('pe', parentLog.startTime)));
        const e = clampedEnd > clampedStart ? clampedEnd : Math.min(realParentEnd, clampedStart + 60000);
        const dur = Math.round((e - clampedStart) / 60000);
        // 时间唯一性：检查与已有并行是否重叠
        const parentId = parentLog.id || parentLog.startTime;
        const existingParallels = [...logs.filter(l => l.parallel && l.parentId === parentId), ...parallelHistory];
        const overlapConflict = existingParallels.some(p => {
            const pEnd = p.endTime || (p.startTime + (p.duration || 0) * 60000);
            return p.startTime < e && pEnd > clampedStart;
        });
        if (overlapConflict) {
            showConfirm('⏰ 时间已被占用', '该时段已有其他并行活动，请调整时间后重试。', '知道了', () => {});
            return;
        }
        const entry = {
            id: Date.now() + Math.random(),
            startTime: clampedStart,
            endTime: e,
            duration: dur,
            l1, l2: l2 || '',
            tag: '', note: document.getElementById('drawer-note').value || '',
            color: cat?.color || '#cbd5e1',
            parallel: true,
            parentId: parentLog.id || parentLog.startTime
        };
        logs.unshift(entry);
        localStorage.setItem('v9_logs', JSON.stringify(logs));
        renderAll();
    };
    if (drawerViewMode === 'columns') drawerViewMode = 'flat';
    renderPicker();
    renderDrawerToggle();
    showDrawer();
}
function openSplitDrawer(parentLog) {
    pickerMode = 'split';
    const pStart = parentLog.startTime;
    const pEnd = parentLog.endTime || (pStart + (parentLog.duration || 60) * 60000);
    document.getElementById('drawer-title').innerText = `✂️ 切割 — ${displayName(parentLog)}`;
    document.getElementById('parallel-time-row').classList.remove('hidden');
    document.getElementById('drawer-footer').classList.remove('hidden');
    document.getElementById('drawer-note').value = '';
    document.getElementById('drawer-note').placeholder = '备注（选填）';
    _backfillRange = { start: pStart, end: pEnd };
    setTimeInFields('ps', new Date(pStart));
    setTimeInFields('pe', new Date(pEnd));
    setupBackfillDrag(parentLog, pEnd);
    _parallelCallback = (l1, l2) => { executeSplit(parentLog, l1, l2); };
    if (drawerViewMode === 'columns') drawerViewMode = 'flat';
    renderPicker();
    renderDrawerToggle();
    showDrawer();
}
function executeSplit(parentLog, l1, l2) {
    const pStart = parentLog.startTime;
    const pEnd = parentLog.endTime || (pStart + (parentLog.duration || 60) * 60000);
    const startMs = parseTimeFromInput('ps', pStart);
    const endMs = parseTimeFromInput('pe', pStart);
    const splitStart = Math.max(pStart, Math.min(pEnd, startMs));
    const splitEnd = Math.max(pStart, Math.min(pEnd, endMs));
    if (splitEnd - splitStart < 60000) { closeDrawer(); return; }
    // 时间唯一性：切割区间不能与已有并行重叠
    const splitParentId = parentLog.id || parentLog.startTime;
    const splitConflicts = [...logs.filter(l => l.parallel && l.parentId === splitParentId), ...parallelHistory].some(p => {
        const pEnd = p.endTime || (p.startTime + (p.duration || 0) * 60000);
        return p.startTime < splitEnd && pEnd > splitStart;
    });
    if (splitConflicts) {
        showConfirm('⏰ 时间已被占用', '切割区间与已有并行活动冲突，请调整切割范围后重试，或先删除冲突的并行。', '知道了', () => {});
        closeDrawer();
        return;
    }
    const idx = logs.indexOf(parentLog);
    if (idx === -1) { closeDrawer(); return; }
    logs.splice(idx, 1);
    const cat = getCat(l1);
    const color = cat?.color || '#cbd5e1';
    const note = document.getElementById('drawer-note').value || '';
    const newLogs = [];
    if (splitStart > pStart) {
        newLogs.push({ ...parentLog, id: Date.now() + Math.random(), startTime: pStart, endTime: splitStart, duration: Math.round((splitStart - pStart) / 60000) });
    }
    newLogs.push({ id: Date.now() + Math.random() + 1, startTime: splitStart, endTime: splitEnd, duration: Math.round((splitEnd - splitStart) / 60000), l1, l2: l2 || '', tag: '', note, color });
    if (splitEnd < pEnd) {
        newLogs.push({ ...parentLog, id: Date.now() + Math.random() + 2, startTime: splitEnd, endTime: pEnd, duration: Math.round((pEnd - splitEnd) / 60000) });
    }
    logs.splice(idx, 0, ...newLogs);
    mergeAdjacentSameActivity();
    localStorage.setItem('v9_logs', JSON.stringify(logs));
    closeDrawer();
    renderAll();
}
function mergeAdjacentSameActivity() {
    const merged = [];
    for (const log of logs) {
        const last = merged[merged.length - 1];
        if (last && last.l1 === log.l1 && last.l2 === log.l2 && last.endTime === log.startTime && last.parallel === log.parallel) {
            last.endTime = log.endTime;
            last.duration = Math.round((last.endTime - last.startTime) / 60000);
        } else {
            merged.push({ ...log });
        }
    }
    logs = merged;
}
// 吸附到最近的空闲区段边界（考虑已有并行占用）
function snapToNearestFreeZone(pct, parentLog, parentEnd) {
    const pStart = parentLog.startTime;
    const pEnd = parentEnd || (pStart + (parentLog.duration || 60) * 60000);
    const total = pEnd - pStart;
    if (total <= 0) return Math.max(0, Math.min(1, pct));
    const pid = parentLog.id || parentLog.startTime;
    // 收集所有已占用的时间区间
    const occupied = [...logs.filter(l => l.parallel && l.parentId === pid), ...parallelHistory]
        .map(p => ({
            start: Math.max(p.startTime, pStart),
            end: Math.min(p.endTime || (p.startTime + (p.duration || 0) * 60000), pEnd)
        }))
        .filter(r => r.end > r.start)
        .sort((a, b) => a.start - b.start);
    // 没有并行占位 → 自由拖动，不磁吸
    if (occupied.length === 0) return Math.max(0, Math.min(1, pct));
    // 计算空闲区段
    const freeZones = [];
    let cursor = pStart;
    occupied.forEach(r => {
        if (r.start > cursor) freeZones.push({ start: cursor, end: r.start });
        cursor = Math.max(cursor, r.end);
    });
    if (cursor < pEnd) freeZones.push({ start: cursor, end: pEnd });
    if (freeZones.length === 0) return 0.5; // 全占满则落在正中
    const clickMs = pStart + total * pct;
    // 判断点击位置落在什么区
    const inOccupied = occupied.some(r => clickMs >= r.start && clickMs <= r.end);
    if (!inOccupied) {
        // 落在空闲区 → 不磁吸，停在原地
        return Math.max(0, Math.min(1, pct));
    }
    // 落在占用区 → 吸到最近空闲边界
    let bestEdge = freeZones[0].start;
    let bestDist = Infinity;
    freeZones.forEach(z => {
        [z.start, z.end].forEach(edge => {
            const dist = Math.abs(edge - clickMs);
            if (dist < bestDist) { bestDist = dist; bestEdge = edge; }
        });
    });
    return Math.max(0, Math.min(1, (bestEdge - pStart) / total));
}
function setupBackfillDrag(parentLog, parentEnd) {
    let dragTarget = null;
    const total = parentEnd - parentLog.startTime;

    const setTimeFromPct = (pct, target) => {
        pct = Math.max(0, Math.min(1, pct));
        const ms = parentLog.startTime + total * pct;
        const prefix = target === 'start' ? 'ps' : 'pe';
        setTimeInFields(prefix, new Date(ms));
        syncBackfillProgress(parentLog);
    };

    const clientXFromEvent = (e) => {
        if (e.touches && e.touches.length > 0) return e.touches[0].clientX;
        return e.clientX;
    };

    const oldTrack = document.getElementById('backfill-track');
    const newTrack = oldTrack.cloneNode(true);
    oldTrack.parentNode.replaceChild(newTrack, oldTrack);
    const newStartH = newTrack.querySelector('#backfill-start-handle');
    const newEndH = newTrack.querySelector('#backfill-end-handle');
    if (!newStartH || !newEndH) return;

    const onMove = (e) => {
        if (!dragTarget) return;
        e.preventDefault();
        const rect = newTrack.getBoundingClientRect();
        const handleHalfW = 5; // w-2.5 的一半
        const pct = (clientXFromEvent(e) - rect.left + (dragTarget === 'end' ? handleHalfW : 0)) / rect.width;
        setTimeFromPct(pct, dragTarget);
    };
    const onEnd = () => {
        if (dragTarget) {
            // 释放时吸附到最近的空闲区段边界
            const rect = newTrack.getBoundingClientRect();
            const curEl = document.getElementById('backfill-' + dragTarget + '-handle');
            if (curEl) {
                const curPct = parseFloat(curEl.style.left) / 100;
                const snapped = snapToNearestFreeZone(curPct, parentLog, parentEnd);
                setTimeFromPct(snapped, dragTarget);
            }
        }
        dragTarget = null;
    };

    const onTrackTap = (clientX) => {
        const rect = newTrack.getBoundingClientRect();
        let pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const snapped = snapToNearestFreeZone(pct, parentLog, parentEnd);
        const clickMs = parentLog.startTime + total * snapped;
        const curStart = parseTimeFromInput('ps', parentLog.startTime);
        const curEnd = parseTimeFromInput('pe', parentLog.startTime);
        const distToStart = Math.abs(clickMs - curStart);
        const distToEnd = Math.abs(clickMs - curEnd);
        const target = distToStart <= distToEnd ? 'start' : 'end';
        // 目标位置的最近空闲区段：如果点和目标有距离偏移，取偏移后的位置
        setTimeFromPct(snapped, target);
    };

    newTrack.addEventListener('click', (e) => {
        if (e.target === newStartH || e.target === newEndH) return;
        onTrackTap(e.clientX);
    });
    newTrack.addEventListener('touchstart', (e) => {
        if (e.target === newStartH || e.target === newEndH) return;
        if (e.touches && e.touches.length > 0) onTrackTap(e.touches[0].clientX);
    }, { passive: true });

    newStartH.addEventListener('mousedown', (e) => { dragTarget = 'start'; e.preventDefault(); e.stopPropagation(); });
    newStartH.addEventListener('touchstart', (e) => { dragTarget = 'start'; e.stopPropagation(); }, { passive: true });
    newEndH.addEventListener('mousedown', (e) => { dragTarget = 'end'; e.preventDefault(); e.stopPropagation(); });
    newEndH.addEventListener('touchstart', (e) => { dragTarget = 'end'; e.stopPropagation(); }, { passive: true });

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
}
function syncBackfillProgress(parentLog) {
    const parentEnd = parentLog.endTime || (parentLog.startTime + (parentLog.duration || 60) * 60000);
    const total = parentEnd - parentLog.startTime;
    if (total <= 0) return;
    let startMs = parseTimeFromInput('ps', parentLog.startTime);
    let endMs = parseTimeFromInput('pe', parentLog.startTime);
    startMs = Math.max(parentLog.startTime, Math.min(parentEnd, startMs));
    endMs = Math.max(parentLog.startTime, Math.min(parentEnd, endMs));
    if (endMs <= startMs) endMs = Math.min(parentEnd, startMs + 60000);
    const left = Math.max(0, ((startMs - parentLog.startTime) / total) * 100);
    const right = Math.min(100, ((endMs - parentLog.startTime) / total) * 100);
    if (startMs !== parseTimeFromInput('ps', parentLog.startTime)) {
        setTimeInFields('ps', new Date(startMs));
    }
    if (endMs !== parseTimeFromInput('pe', parentLog.startTime)) {
        setTimeInFields('pe', new Date(endMs));
    }
    document.getElementById('backfill-fill').style.left = left + '%';
    document.getElementById('backfill-fill').style.width = Math.max(2, right - left) + '%';
    document.getElementById('backfill-start-handle').style.left = left + '%';
    document.getElementById('backfill-end-handle').style.left = right + '%';
    document.getElementById('backfill-track-start').innerText = formatBeijingClockSec(parentLog.startTime);
    document.getElementById('backfill-track-end').innerText = formatBeijingClockSec(parentEnd);
    // 渲染已有并行占用区段（灰色块）
    const occupiedBox = document.getElementById('backfill-occupied');
    if (occupiedBox) {
        const pid = parentLog.id || parentLog.startTime;
        occupiedBox.innerHTML = '';
        [...logs.filter(l => l.parallel && l.parentId === pid), ...parallelHistory].forEach(p => {
            const pStart = Math.max(p.startTime, parentLog.startTime);
            const pEnd = Math.min(p.endTime || (p.startTime + (p.duration || 0) * 60000), parentEnd);
            if (pEnd <= pStart) return;
            const oLeft = ((pStart - parentLog.startTime) / total) * 100;
            const oWidth = ((pEnd - pStart) / total) * 100;
            const block = document.createElement('div');
            block.className = "absolute inset-y-0 bg-slate-300/60 rounded";
            block.style.left = oLeft + '%';
            block.style.width = Math.max(2, oWidth) + '%';
            occupiedBox.appendChild(block);
        });
    }
}
function parseTimeFromInput(prefix, refDate) {
    const h = parseInt(document.getElementById(prefix + '-h').value) || 0;
    const m = parseInt(document.getElementById(prefix + '-m').value) || 0;
    const s = parseInt(document.getElementById(prefix + '-s').value) || 0;
    const d = new Date(refDate);
    d.setHours(Math.min(23, Math.max(0, h)), Math.min(59, Math.max(0, m)), Math.min(59, Math.max(0, s)), 0);
    return d.getTime();
}
function setTimeInFields(prefix, date) {
    document.getElementById(prefix + '-h').value = String(date.getHours()).padStart(2,'0');
    document.getElementById(prefix + '-m').value = String(date.getMinutes()).padStart(2,'0');
    document.getElementById(prefix + '-s').value = String(date.getSeconds()).padStart(2,'0');
}
let _backfillRange = null;

function initTimeField(el, max) {
    el.addEventListener('touchstart', function() {
        this.select();
    });
    el.addEventListener('focus', function() {
        this.setSelectionRange(0, this.value.length);
        let tries = 0;
        const poll = setInterval(() => {
            tries++;
            if (document.activeElement !== this) {
                clearInterval(poll);
                return;
            }
            if (this.selectionStart === 0 && this.selectionEnd === this.value.length) {
                clearInterval(poll);
            } else {
                this.setSelectionRange(0, this.value.length);
            }
            if (tries > 20) clearInterval(poll);
        }, 50);
    });
    el.addEventListener('input', function() {
        this.value = this.value.replace(/\D/g, '').slice(0, 2);
        if (this.value.length >= 2) {
            const all = this.parentElement.querySelectorAll('input[type="text"]');
            const idx = Array.from(all).indexOf(this);
            if (idx >= 0 && idx < all.length - 1) {
                const next = all[idx + 1];
                next.focus();
                setTimeout(() => {
                    next.setSelectionRange(0, next.value.length);
                }, 80);
            }
            if (_backfillRange) snapTimeToRange();
        }
        // 输入→进度条视觉同步（不写回输入框）
        if (_backfillRange) {
            const { start, end } = _backfillRange;
            const total = end - start;
            if (total > 0) {
                const startMs = parseTimeFromInput('ps', start);
                const endMs = parseTimeFromInput('pe', start);
                const left = Math.max(0, ((startMs - start) / total) * 100);
                const right = Math.min(100, ((endMs - start) / total) * 100);
                document.getElementById('backfill-fill').style.left = left + '%';
                document.getElementById('backfill-fill').style.width = Math.max(2, right - left) + '%';
                document.getElementById('backfill-start-handle').style.left = left + '%';
                document.getElementById('backfill-end-handle').style.left = right + '%';
            }
        }
    });
    el.addEventListener('blur', function() {
        const val = parseInt(this.value);
        if (isNaN(val)) this.value = '00';
        else this.value = String(Math.min(val, max)).padStart(2, '0');
    });
}

function setFieldColor(prefix, bg) {
    ['-h','-m','-s'].forEach(suf => {
        const el = document.getElementById(prefix + suf);
        if (!el) return;
        if (bg) {
            el.style.background = bg;
            el.style.color = '#dc2626';
        } else {
            el.style.background = '';
            el.style.color = '';
        }
    });
}

function snapTimeToRange() {
    if (!_backfillRange) return;
    const { start: prStart, end: prEnd } = _backfillRange;

    const rawPs = parseTimeFromInput('ps', prStart);
    const rawPe = parseTimeFromInput('pe', prStart);

    let sClamped = Math.max(prStart, Math.min(rawPs, prEnd));
    let eClamped = Math.min(prEnd, Math.max(rawPe, prStart));

    if (eClamped - sClamped < 60000) {
        eClamped = Math.min(prEnd, sClamped + 60000);
        if (eClamped - sClamped < 60000) {
            sClamped = Math.max(prStart, eClamped - 60000);
        }
    }

    const sChanged = sClamped !== rawPs;
    const eChanged = eClamped !== rawPe;

    if (sChanged) {
        setTimeInFields('ps', new Date(sClamped));
        flashRed('ps');
    }
    if (eChanged) {
        setTimeInFields('pe', new Date(eClamped));
        flashRed('pe');
    }
    if (!sChanged) setFieldColor('ps', '');
    if (!eChanged) setFieldColor('pe', '');

    syncBackfillProgress({ startTime: prStart, endTime: prEnd, duration: (prEnd - prStart) / 60000 });
}

let _snapRedTimers = {};
function flashRed(prefix) {
    if (_snapRedTimers[prefix]) clearTimeout(_snapRedTimers[prefix]);
    setFieldColor(prefix, '#fee2e2');
    _snapRedTimers[prefix] = setTimeout(() => {
        setFieldColor(prefix, '');
        delete _snapRedTimers[prefix];
    }, 1200);
}

function isTimeInParentRange() {
    if (!_backfillRange) return true;
    const { start: prStart, end: prEnd } = _backfillRange;
    const ps = parseTimeFromInput('ps', prStart);
    const pe = parseTimeFromInput('pe', prStart);
    return ps >= prStart && ps < pe && pe <= prEnd;
}
['ps-h','ps-m','ps-s','pe-h','pe-m','pe-s'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const max = id.endsWith('-h') ? 23 : 59;
    initTimeField(el, max);
});
['fb-h','fb-m','fb-s','fe-h','fe-m','fe-s'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const max = id.endsWith('-h') ? 23 : 59;
    initTimeField(el, max);
});

function getTodaySegments() {
    const now = Date.now();
    const dayStart = beijingPeriodStart(now, DAY_MS);
    const dayEnd = dayStart + DAY_MS;
    const currentLog = current ? { ...current, endTime: now, live: true } : null;
    return logs
        .map(l => ({ ...l, endTime: l.endTime || l.startTime }))
        .concat(currentLog ? [currentLog] : [])
        .filter(Boolean)
        .filter(l => l.endTime > dayStart && l.startTime < dayEnd)
        .map(l => ({
            ...l,
            clippedStart: Math.max(l.startTime, dayStart),
            clippedEnd: Math.min(l.endTime, dayEnd)
        }))
        .filter(l => l.clippedEnd > l.clippedStart)
        .sort((a, b) => a.clippedStart - b.clippedStart);
}

let reportBillboardReady = false;

function msToReportHours(ms) {
    return Math.round((ms / 3600000) * 10) / 10;
}

function aggregateReportSegments(segments, keyFn) {
    const map = new Map();
    segments.forEach((l) => {
        const key = keyFn(l);
        const ms = l.clippedEnd - l.clippedStart;
        const old = map.get(key) || {
            name: key,
            ms: 0,
            l1: l.l1 || '未分类',
            color: getCat(l.l1)?.color || '#94a3b8',
        };
        old.ms += ms;
        map.set(key, old);
    });
    return [...map.values()].sort((a, b) => b.ms - a.ms);
}

function parallelHostL1(paraLog) {
    if (!paraLog.parentId) return '未分类';
    const parent = logs.find((l) => l.id === paraLog.parentId);
    return parent?.l1 || '未分类';
}

function buildLiveReportDay() {
    const now = Date.now();
    const dayStart = beijingPeriodStart(now, DAY_MS);
    const all = getTodaySegments();
    const mainSegs = all.filter((l) => !l.parallel);
    const paraSegs = all.filter((l) => l.parallel);
    const mainMs = mainSegs.reduce((s, l) => s + (l.clippedEnd - l.clippedStart), 0);
    const paraMs = paraSegs.reduce((s, l) => s + (l.clippedEnd - l.clippedStart), 0);

    const l1Agg = aggregateReportSegments(mainSegs, (l) => l.l1 || '未分类');
    const l2Agg = aggregateReportSegments(mainSegs, displayName);
    const l1 = l1Agg.map((r) => ({ name: r.name, hours: msToReportHours(r.ms), color: r.color }));
    const l2 = l2Agg.map((r) => ({
        l1: r.l1,
        name: r.name,
        hours: msToReportHours(r.ms),
        color: r.color,
    }));

    const topL1 = l1[0];
    const mainHours = msToReportHours(mainMs);
    const focusPct = topL1 && mainHours
        ? (Math.round((topL1.hours / mainHours) * 1000) / 10) + '%'
        : '0%';

    const paraL1Agg = aggregateReportSegments(paraSegs, displayName);
    const paraL1 = paraL1Agg.map((r) => ({ name: r.name, hours: msToReportHours(r.ms), color: r.color }));
    const topPara = paraL1[0];
    const paraRatio = mainHours
        ? (Math.round((msToReportHours(paraMs) / mainHours) * 1000) / 10) + '%'
        : '0%';

    const overlayMap = new Map();
    paraSegs.forEach((l) => {
        const act = displayName(l);
        const host = parallelHostL1(l);
        const key = act + '|' + host;
        const ms = l.clippedEnd - l.clippedStart;
        const old = overlayMap.get(key) || {
            l1: act,
            name: '叠在' + host,
            ms: 0,
            color: getCat(l.l1)?.color || '#a78bfa',
        };
        old.ms += ms;
        overlayMap.set(key, old);
    });
    const paraL2 = [...overlayMap.values()]
        .map((r) => ({ l1: r.l1, name: r.name, hours: msToReportHours(r.ms), color: r.color }))
        .sort((a, b) => b.hours - a.hours);

    const timelineSegs = mainSegs.map((l) => {
        const left = ((l.clippedStart - dayStart) / DAY_MS) * 100;
        const width = ((l.clippedEnd - l.clippedStart) / DAY_MS) * 100;
        return {
            left,
            width,
            color: getCat(l.l1)?.color || '#94a3b8',
            label: displayName(l),
            title: `${displayName(l)} ${formatBeijingClockSec(l.clippedStart)}-${formatBeijingClockSec(l.clippedEnd)}`,
        };
    });

    return {
        _live: true,
        timeline: {
            title: '24 小时时间轴',
            hint: '仅主线 · 当日真实记录',
            kind: 'day',
            scale: ['00:00', '06:00', '12:00', '18:00', '24:00'],
            segments: timelineSegs,
            nowPct: Math.min(100, Math.max(0, ((now - dayStart) / DAY_MS) * 100)),
        },
        main: {
            meta: {
                title: formatBeijingDate(now),
                range: '当日主线',
                footnote: '日报数据来自本地记录；周/月/年仍为样本占位。',
            },
            summary: [
                { icon: '🎯', label: '结构重心', value: topL1?.name || '—', sub: `占 ${focusPct}` },
                { icon: '🔀', label: '活动切换', value: String(Math.max(0, mainSegs.length - 1)), sub: '次' },
                { icon: '📋', label: '流水条数', value: String(mainSegs.length), sub: '条' },
            ],
            l1,
            l2,
        },
        parallel: {
            meta: {
                title: formatBeijingDate(now),
                range: '并行活动',
                footnote: '并行时段可重叠累计。',
            },
            summary: [
                { icon: '⏳', label: '并行总时长', value: String(msToReportHours(paraMs)), sub: '小时' },
                { icon: '📐', label: '叠在主线比', value: paraRatio, sub: '并行/主线' },
                { icon: '🔝', label: '最常并行', value: topPara?.name || '—', sub: topPara ? topPara.hours + 'h' : '' },
            ],
            l1: paraL1,
            l2: paraL2,
        },
    };
}

function getReportPeriodData(period) {
    if (period === 'day') return buildLiveReportDay();
    return REPORT_DATA[period] || null;
}

function ensureReportBillboard() {
    if (!document.getElementById('summary-main')) return;
    if (!reportBillboardReady && typeof initReportBillboard === 'function') {
        initReportBillboard({ defaultPeriod: 'day', getPeriodData: getReportPeriodData });
        reportBillboardReady = true;
    }
}

function renderReport() {
    ensureReportBillboard();
    if (typeof renderReportBillboard === 'function') renderReportBillboard();
}

function showDrawer() {
    const drawer = document.getElementById('drawer');
    drawer.classList.remove('hidden');
    const panel = drawer.querySelector('.drawer-up');
    if (panel) {
        panel.classList.remove('drawer-up');
        void panel.offsetHeight;
        panel.classList.add('drawer-up');
    }
}

function openShortcutPicker() {
    pickerMode = 'shortcut';
    document.getElementById('drawer-title').innerText = "设为首页大图标";
    document.getElementById('drawer-footer').classList.add('hidden');
    showDrawer();
    renderPicker();
}
function openParallelShortcutPicker() {
    pickerMode = 'parallel-shortcut';
    document.getElementById('drawer-title').innerText = "设为并行快捷";
    document.getElementById('drawer-footer').classList.add('hidden');
    showDrawer();
    renderPicker();
}

function addShortcut(l1, l2, icon) {
    if (shortcuts.some(s => s.l1 === l1 && s.l2 === l2)) return;
    shortcuts.push({ l1, l2, icon: icon || "📌" });
    localStorage.setItem('v9_shorts', JSON.stringify(shortcuts));
    renderPicker();
    renderAll();
}
function addParallelShortcut(l1, l2, icon) {
    if (parallelShortcuts.some(s => s.l1 === l1 && s.l2 === l2)) return;
    const cat = getCat(l1);
    parallelShortcuts.push({ l1, l2: l2 || '', icon: cat?.icon || '📌' });
    localStorage.setItem('v9_parallel_shorts', JSON.stringify(parallelShortcuts));
    renderPicker();
    renderAll();
}
function removeShortcut(l1, l2) {
    shortcuts = shortcuts.filter(s => !(s.l1 === l1 && s.l2 === l2));
    localStorage.setItem('v9_shorts', JSON.stringify(shortcuts));
    renderPicker();
    renderAll();
}
function renderDrawerToggle() {
    const btn = document.getElementById('drawer-view-toggle');
    if (!btn) return;
    if (pickerMode === 'record' || pickerMode === 'parallel-backfill' || pickerMode === 'edit' || pickerMode === 'split') {
        btn.classList.remove('hidden');
        const modes = [
            { key: 'columns', icon: '◧', title: '左右分栏' },
            { key: 'flat', icon: '⊞', title: '扁平铺满' },
            { key: 'stacked', icon: '⊟', title: '上下堆叠' },
        ];
        btn.innerHTML = modes.map(m =>
            `<span class="drawer-view-btn ${drawerViewMode === m.key ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}" data-mode="${m.key}" style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;font-size:14px;cursor:pointer;transition:.12s" title="${m.title}">${m.icon}</span>`
        ).join('');
        btn.querySelectorAll('.drawer-view-btn').forEach(el => {
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                drawerViewMode = el.dataset.mode;
                renderDrawerToggle();
                renderPicker();
            });
        });
    } else {
        btn.classList.add('hidden');
    }
}
function renderPicker() {
    const l1Box = document.getElementById('drawer-l1');
    const l2Box = document.getElementById('drawer-l2');
    l1Box.innerHTML = "";
    l2Box.innerHTML = "";
    if (!cats.length) {
        l1Box.style.display = '';
        l2Box.className = "w-3/4 p-4 overflow-y-auto grid grid-cols-2 gap-3 h-fit";
        const empty = document.createElement('div');
        empty.className = "p-4 text-sm text-slate-400 font-bold";
        empty.innerText = "暂无分类";
        l2Box.appendChild(empty);
        return;
    }

    if (pickerMode === 'shortcut') {
        l1Box.style.display = 'none';
        l2Box.className = "w-full p-3 overflow-y-auto grid grid-cols-4 gap-2 h-fit";
        cats.forEach(c => {
            if (!c.subs.length) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = "bg-white border border-slate-100 rounded-xl p-2 text-center text-[10px] font-bold shadow-sm";
                btn.innerHTML = `<div class=\"text-base leading-none mb-0.5\">${c.icon}</div><div class=\"leading-tight\">${c.name}</div>`;
                const already = shortcuts.some(s => s.l1 === c.name && s.l2 === "");
                if (already) {
                    btn.style.background = '#f1f5f9';
                    btn.style.color = '#94a3b8';
                    btn.style.cursor = 'pointer';
                    btn.style.opacity = '0.6';
                    btn.style.borderLeft = `4px solid ${c.color || '#6366f1'}`;
                    btn.addEventListener('click', () => removeShortcut(c.name, ""));
                } else {
                    btn.addEventListener('click', () => addShortcut(c.name, "", c.icon));
                }
                l2Box.appendChild(btn);
                return;
            }
            c.subs.forEach(s => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = "bg-white border border-slate-100 rounded-xl p-2 text-center text-[10px] font-bold shadow-sm";
                btn.innerHTML = `<div class=\"text-base leading-none mb-0.5\">${getSubIcon(s, c.icon)}</div><div class=\"leading-tight\">${s}</div>`;
                const already = shortcuts.some(sm => sm.l1 === c.name && sm.l2 === s);
                if (already) {
                    btn.style.background = '#f1f5f9';
                    btn.style.color = '#94a3b8';
                    btn.style.cursor = 'pointer';
                    btn.style.opacity = '0.6';
                    btn.style.borderLeft = `4px solid ${c.color || '#6366f1'}`;
                    btn.addEventListener('click', () => removeShortcut(c.name, s));
                } else {
                    btn.addEventListener('click', () => addShortcut(c.name, s, getSubIcon(s, c.icon)));
                }
                l2Box.appendChild(btn);
            });
        });
        return;
    }

    if (pickerMode === 'parallel-shortcut') {
        l1Box.style.display = 'none';
        l2Box.className = "w-full p-3 overflow-y-auto grid grid-cols-4 gap-2 h-fit";
        cats.forEach(c => {
            if (!c.subs.length) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = "bg-white border border-slate-100 rounded-xl p-2 text-center text-[10px] font-bold shadow-sm";
                btn.innerHTML = `<div class=\"text-base leading-none mb-0.5\">${c.icon}</div><div class=\"leading-tight\">${c.name}</div>`;
                const already = parallelShortcuts.some(s => s.l1 === c.name && s.l2 === "");
                if (already) {
                    btn.style.background = '#f1f5f9'; btn.style.color = '#94a3b8'; btn.style.cursor = 'pointer'; btn.style.opacity = '0.6';
                    btn.style.borderLeft = `4px solid ${c.color || '#6366f1'}`;
                    btn.addEventListener('click', () => {
                        parallelShortcuts = parallelShortcuts.filter(s => !(s.l1 === c.name && s.l2 === ""));
                        localStorage.setItem('v9_parallel_shorts', JSON.stringify(parallelShortcuts));
                        renderPicker(); renderAll();
                    });
                } else {
                    btn.addEventListener('click', () => addParallelShortcut(c.name, "", getSubIcon("", c.icon)));
                }
                l2Box.appendChild(btn);
                return;
            }
            c.subs.forEach(s => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = "bg-white border border-slate-100 rounded-xl p-2 text-center text-[10px] font-bold shadow-sm";
                btn.innerHTML = `<div class=\"text-base leading-none mb-0.5\">${getSubIcon(s, c.icon)}</div><div class=\"leading-tight\">${s}</div>`;
                const already = parallelShortcuts.some(sm => sm.l1 === c.name && sm.l2 === s);
                if (already) {
                    btn.style.background = '#f1f5f9'; btn.style.color = '#94a3b8'; btn.style.cursor = 'pointer'; btn.style.opacity = '0.6';
                    btn.style.borderLeft = `4px solid ${c.color || '#6366f1'}`;
                    btn.addEventListener('click', () => {
                        parallelShortcuts = parallelShortcuts.filter(sm => !(sm.l1 === c.name && sm.l2 === s));
                        localStorage.setItem('v9_parallel_shorts', JSON.stringify(parallelShortcuts));
                        renderPicker(); renderAll();
                    });
                } else {
                    btn.addEventListener('click', () => addParallelShortcut(c.name, s, getSubIcon(s, c.icon)));
                }
                l2Box.appendChild(btn);
            });
        });
        return;
    }

    if (drawerViewMode === 'flat' && (pickerMode === 'record' || pickerMode === 'parallel-backfill' || pickerMode === 'edit' || pickerMode === 'split')) {
        l1Box.style.display = 'none';
        l2Box.className = "w-full p-3 overflow-y-auto grid grid-cols-5 gap-1.5 h-fit";
        cats.forEach(c => {
            if (!c.subs.length) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = "bg-white border border-slate-100 rounded-xl p-1.5 text-center text-[10px] font-bold text-slate-600 shadow-sm active:bg-indigo-50";
                btn.innerHTML = `<div class="text-base leading-none mb-0.5">${c.icon}</div><div class="leading-tight">${c.name}</div>`;
                btn.addEventListener('click', () => drawerPick(c.name, ""));
                l2Box.appendChild(btn);
                return;
            }
            c.subs.forEach(s => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = "bg-white border border-slate-100 rounded-xl p-1.5 text-center text-[10px] font-bold text-slate-600 shadow-sm active:bg-indigo-50";
                btn.innerHTML = `<div class="text-base leading-none mb-0.5">${getSubIcon(s, c.icon)}</div><div class="leading-tight">${s}</div>`;
                btn.addEventListener('click', () => drawerPick(c.name, s));
                l2Box.appendChild(btn);
            });
        });
        return;
    }

    if (drawerViewMode === 'stacked' && (pickerMode === 'record' || pickerMode === 'parallel-backfill' || pickerMode === 'edit' || pickerMode === 'split')) {
        l1Box.style.display = 'none';
        l2Box.className = "w-full p-4 overflow-y-auto h-fit";
        cats.forEach(c => {
            const header = document.createElement('div');
            header.className = "flex items-center gap-2 mb-2 mt-4 first:mt-0";
            header.innerHTML = `<span class="text-lg">${c.icon}</span><span class="text-sm font-black text-slate-500 uppercase tracking-wider">${c.name}</span>`;
            l2Box.appendChild(header);
            const grid = document.createElement('div');
            grid.className = "grid grid-cols-5 gap-1.5";
            const direct = document.createElement('button');
            direct.type = 'button';
            direct.className = "bg-indigo-600 text-white border border-indigo-600 rounded-xl p-1.5 text-center text-[10px] font-bold shadow-sm active:bg-indigo-700";
            direct.innerHTML = `<div class="text-base leading-none mb-0.5">${c.icon}</div><div class="leading-tight">${c.name}</div>`;
            direct.addEventListener('click', () => drawerPick(c.name, ""));
            grid.appendChild(direct);
            c.subs.forEach(s => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = "bg-white border border-slate-100 rounded-xl p-1.5 text-center text-[10px] font-bold text-slate-600 shadow-sm active:bg-indigo-50";
                btn.innerHTML = `<div class="text-base leading-none mb-0.5">${getSubIcon(s, c.icon)}</div><div class="leading-tight">${s}</div>`;
                btn.addEventListener('click', () => drawerPick(c.name, s));
                grid.appendChild(btn);
            });
            l2Box.appendChild(grid);
        });
        return;
    }

    l1Box.style.display = '';
    l2Box.className = "w-3/4 p-4 overflow-y-auto grid grid-cols-2 gap-3 h-fit";
    if (!cats.some(c => c.name === selL1)) selL1 = cats[0].name;

    cats.forEach(c => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `w-full py-5 text-sm font-black ${selL1 === c.name ? 'bg-white text-indigo-600 border-l-4 border-indigo-600' : 'text-slate-400'}`;
        btn.innerText = c.name;
        btn.addEventListener('click', () => {
            selL1 = c.name;
            renderPicker();
        });
        l1Box.appendChild(btn);
    });

    const selected = cats.find(c => c.name === selL1);
    if (!selected) return;
    const direct = document.createElement('button');
    direct.type = 'button';
    direct.className = "bg-indigo-600 text-white border border-indigo-600 p-4 rounded-2xl text-sm font-black shadow-sm active:bg-indigo-700";
    direct.innerText = `${selected.name}`;
    direct.addEventListener('click', () => drawerPick(selected.name, ""));
    l2Box.appendChild(direct);

    selected.subs.forEach(s => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = "bg-white border border-slate-100 p-4 rounded-2xl text-sm font-black text-slate-600 shadow-sm active:bg-indigo-50";
        btn.innerText = s;
        btn.addEventListener('click', () => drawerPick(selL1, s));
        l2Box.appendChild(btn);
    });
    if (!selected.subs.length) {
        const hint = document.createElement('div');
        hint.className = "col-span-2 text-sm text-slate-300 font-bold px-2";
        hint.innerText = "这个一级分类还没有子类，也可以直接记录。";
        l2Box.appendChild(hint);
    }
}

let lastSecondTs = 0;
function tick() {
    const now = Date.now();
    const clockNow = getViewAnchorMs(getTodayDateStr());
    const d = new Date(now + BJ_OFFSET);
    const secAngle = (d.getUTCSeconds() + d.getUTCMilliseconds() / 1000) * 6;

    const p = getClockPrefs();
    const hourStart = beijingPeriodStart(now, HOUR_MS);
    const hourEnd = hourStart + HOUR_MS;
    const dayStart = beijingPeriodStart(now, DAY_MS);
    const dayEnd = dayStart + DAY_MS;
    const show60 = p.layout === 'dual' || p.singleAxis === '60m';
    const show24 = p.layout === 'dual' || p.singleAxis === '24h';

    if (show60) {
        const wA = getClockWindow('a', getTodayDateStr());
        const spanA = wA.rangeEnd - wA.rangeStart;
        const hand60 = document.getElementById('hand-60m');
        const angle60 = spanA > 0 ? ((clockNow - wA.rangeStart) / spanA) * 360 : 0;
        if (hand60) hand60.style.transform = `translateX(-50%) rotate(${angle60}deg)`;
        const sec60 = document.getElementById('second-60m');
        if (sec60) sec60.style.transform = `rotate(${secAngle}deg)`;
    }
    if (show24) {
        const wB = getClockWindow('b', getTodayDateStr());
        const spanB = wB.rangeEnd - wB.rangeStart;
        const hand24 = document.getElementById('hand-24h');
        const angle24 = spanB > 0 ? ((clockNow - wB.rangeStart) / spanB) * 360 : 0;
        if (hand24) hand24.style.transform = `translateX(-50%) rotate(${angle24}deg)`;
        const sec24 = document.getElementById('second-24h');
        if (sec24) sec24.style.transform = `rotate(${secAngle}deg)`;
    }

    const sec = Math.floor(now / 1000);
    if (sec !== lastSecondTs) {
        lastSecondTs = sec;

        updateClockCenterLabels(clockNow);

        if (current) {
            const diff = now - current.startTime;
            const el = document.getElementById('header-timer');
            if (el) el.innerText = formatDuration(diff);
            const liveDur = document.getElementById('live-main-duration');
            if (liveDur) liveDur.innerText = formatDuration(diff);
        }
        if (parallelCurrent) {
            const diff = now - parallelCurrent.startTime;
            const badge = document.getElementById('parallel-status');
            if (badge) {
                badge.classList.remove('hidden');
                badge.innerText = `${parallelCurrent.icon || '⏎'} ${(parallelCurrent.l2 || parallelCurrent.l1)} ${formatDuration(diff)}`;
            }
            const livePDur = document.getElementById('live-parallel-duration');
            if (livePDur) livePDur.innerText = formatDuration(diff);
        } else {
            const badge = document.getElementById('parallel-status');
            if (badge && !badge._pinned) badge.classList.add('hidden');
        }
        renderDayRemain();

        if(current) {
            document.getElementById('status-light').className = "w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse";
            setText('header-l2', displayName(current));
            setText('header-memo', current.note || "");
        } else {
            setText('header-l2', "等待开启...");
            setText('header-memo', "");
        }
        updateUI();
    }
}

function renderDayRemain() {
    const fill = document.getElementById('day-remain-fill');
    const flame = document.getElementById('match-flame');
    if (!fill) return;
    const now = Date.now();
    const dayStart = beijingDateStrToDayStart(getTodayDateStr());
    const elapsed = Math.min(DAY_MS, Math.max(0, now - dayStart));
    const remain = Math.max(0, DAY_MS - elapsed);
    const remainPct = (remain / DAY_MS) * 100;
    fill.style.width = `${remainPct}%`;
    if (flame) {
        flame.style.left = `calc(${remainPct}% - 1px)`;
        flame.style.opacity = (remainPct > 1 && remainPct < 99) ? '1' : '0';
    }
    setText('day-remain-label', `今天剩余 ${Math.round(remainPct)}%`);
}

function updateUI() {
    renderFlow();
}

window.addEventListener('load', () => {});

function renderFlow() {
    const todayStr = getTodayDateStr();
    const now = getViewAnchorMs(todayStr);
    const dayStart = beijingPeriodStart(now, DAY_MS);
    const dayEnd = dayStart + DAY_MS;
    const hourStart = beijingPeriodStart(now, HOUR_MS);
    const hourEnd = hourStart + HOUR_MS;
    applyClockLayout();
    const p = getClockPrefs();
    const show60 = p.layout === 'dual' || p.singleAxis === '60m';
    const show24 = p.layout === 'dual' || p.singleAxis === '24h';

    const currentLog = current ? { ...current, endTime: now, live: true } : null;
    const all = logs
        .map(l => ({ ...l, endTime: l.endTime || l.startTime }))
        .concat(currentLog ? [currentLog] : [])
        .concat(parallelCurrent ? [{ ...parallelCurrent, endTime: now, parallel: true, parentId: current?.id || null }] : [])
        .concat(parallelHistory.filter(ph => ph.endTime > dayStart || (ph.startTime && ph.startTime < dayEnd)).map(ph => ({ ...ph, endTime: ph.endTime || (ph.startTime + (ph.duration || 0) * 60000) })))
        .filter(Boolean);

    if (show60) {
        const wA = getClockWindow('a', todayStr);
        renderOneClockRing({
            gSeg: document.getElementById('svg-60m'),
            gMarks: document.getElementById('svg-60m-marks'),
            handEl: document.getElementById('hand-60m'),
            rangeStart: wA.rangeStart,
            rangeEnd: wA.rangeEnd,
            logs: all,
            now
        });
    }
    if (show24) {
        const wB = getClockWindow('b', todayStr);
        renderOneClockRing({
            gSeg: document.getElementById('svg-24h'),
            gMarks: document.getElementById('svg-24h-marks'),
            handEl: document.getElementById('hand-24h'),
            rangeStart: wB.rangeStart,
            rangeEnd: wB.rangeEnd,
            logs: all,
            now
        });
    }
    updateClockCenterLabels(now);
}


const CALENDAR_YM_WHEEL_H = 36;
const CALENDAR_YM_WHEEL_PAD = 2;
let calendarYmWheelTimer = null;

function highlightCalendarYmWheelItem(listEl, index) {
    listEl.querySelectorAll('.calendar-ym-wheel-item:not(.calendar-ym-wheel-pad)').forEach((el, i) => {
        el.classList.toggle('is-active', i === index);
    });
}

function scrollCalendarYmWheelToIndex(viewport, listEl, index) {
    const items = listEl.querySelectorAll('.calendar-ym-wheel-item:not(.calendar-ym-wheel-pad)');
    if (!items.length) return 0;
    const clamped = Math.max(0, Math.min(items.length - 1, index));
    viewport.scrollTop = (clamped + CALENDAR_YM_WHEEL_PAD) * CALENDAR_YM_WHEEL_H;
    highlightCalendarYmWheelItem(listEl, clamped);
    return clamped;
}

function getCalendarYmWheelValue(viewport, listEl) {
    const items = listEl.querySelectorAll('.calendar-ym-wheel-item:not(.calendar-ym-wheel-pad)');
    if (!items.length) return null;
    const idx = Math.round(viewport.scrollTop / CALENDAR_YM_WHEEL_H) - CALENDAR_YM_WHEEL_PAD;
    const clamped = Math.max(0, Math.min(items.length - 1, idx));
    return items[clamped].dataset.value;
}

function populateCalendarYmWheel(listEl, items, activeValue) {
    listEl.innerHTML = '';
    for (let i = 0; i < CALENDAR_YM_WHEEL_PAD; i++) {
        const pad = document.createElement('li');
        pad.className = 'calendar-ym-wheel-item calendar-ym-wheel-pad';
        pad.setAttribute('aria-hidden', 'true');
        listEl.appendChild(pad);
    }
    items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'calendar-ym-wheel-item';
        li.dataset.value = String(item.value);
        li.textContent = item.label;
        listEl.appendChild(li);
    });
    for (let i = 0; i < CALENDAR_YM_WHEEL_PAD; i++) {
        const pad = document.createElement('li');
        pad.className = 'calendar-ym-wheel-item calendar-ym-wheel-pad';
        pad.setAttribute('aria-hidden', 'true');
        listEl.appendChild(pad);
    }
    const startIdx = Math.max(0, items.findIndex((it) => String(it.value) === String(activeValue)));
    return startIdx;
}

function bindCalendarYmWheel(viewport, listEl) {
    viewport.onscroll = () => {
        clearTimeout(calendarYmWheelTimer);
        calendarYmWheelTimer = setTimeout(() => {
            const idx = Math.round(viewport.scrollTop / CALENDAR_YM_WHEEL_H) - CALENDAR_YM_WHEEL_PAD;
            scrollCalendarYmWheelToIndex(viewport, listEl, idx);
        }, 90);
    };
}

function openCalendarYearMonthPicker() {
    const modal = document.getElementById('calendar-ym-modal');
    const yearVp = document.getElementById('calendar-ym-year-viewport');
    const yearList = document.getElementById('calendar-ym-year-list');
    const monthVp = document.getElementById('calendar-ym-month-viewport');
    const monthList = document.getElementById('calendar-ym-month-list');
    if (!modal || !yearVp || !yearList || !monthVp || !monthList) return;

    const now = new Date(Date.now() + BJ_OFFSET);
    const curYear = now.getUTCFullYear();
    const yearItems = [];
    for (let y = curYear - 10; y <= curYear + 1; y++) {
        yearItems.push({ value: y, label: String(y) });
    }
    const monthItems = [];
    for (let m = 0; m < 12; m++) {
        monthItems.push({ value: m, label: String(m + 1) });
    }

    const yIdx = populateCalendarYmWheel(yearList, yearItems, calendarViewYear);
    const mIdx = populateCalendarYmWheel(monthList, monthItems, calendarViewMonth);
    bindCalendarYmWheel(yearVp, yearList);
    bindCalendarYmWheel(monthVp, monthList);

    modal.classList.remove('hidden');
    document.body.classList.add('calendar-ym-open');
    requestAnimationFrame(() => {
        scrollCalendarYmWheelToIndex(yearVp, yearList, yIdx);
        scrollCalendarYmWheelToIndex(monthVp, monthList, mIdx);
    });
}

function closeCalendarYearMonthPicker() {
    const modal = document.getElementById('calendar-ym-modal');
    if (modal) modal.classList.add('hidden');
    document.body.classList.remove('calendar-ym-open');
}

function confirmCalendarYearMonthPicker() {
    const yearVp = document.getElementById('calendar-ym-year-viewport');
    const yearList = document.getElementById('calendar-ym-year-list');
    const monthVp = document.getElementById('calendar-ym-month-viewport');
    const monthList = document.getElementById('calendar-ym-month-list');
    const y = yearVp && yearList ? getCalendarYmWheelValue(yearVp, yearList) : null;
    const m = monthVp && monthList ? getCalendarYmWheelValue(monthVp, monthList) : null;
    if (y != null) calendarViewYear = parseInt(y, 10);
    if (m != null) calendarViewMonth = parseInt(m, 10);
    closeCalendarYearMonthPicker();
    renderCalendarPage();
}

function shiftCalendarMonth(delta) {
    calendarViewMonth += delta;
    while (calendarViewMonth < 0) { calendarViewMonth += 12; calendarViewYear -= 1; }
    while (calendarViewMonth > 11) { calendarViewMonth -= 12; calendarViewYear += 1; }
    renderCalendarPage();
}

function renderFlowCalendar() {
    const host = document.getElementById('flow-calendar');
    if (!host) return;
    host.innerHTML = '';
    const todayStr = formatBeijingDate(Date.now());
    const head = document.createElement('div');
    head.className = 'flow-calendar-head';
    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'flow-calendar-nav btn-active';
    prev.innerText = '‹';
    prev.addEventListener('click', () => shiftCalendarMonth(-1));
    const title = document.createElement('button');
    title.type = 'button';
    title.className = 'flow-calendar-title flow-calendar-title-btn btn-active';
    title.innerText = `${calendarViewYear}年${calendarViewMonth + 1}月`;
    title.addEventListener('click', openCalendarYearMonthPicker);
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'flow-calendar-nav btn-active';
    next.innerText = '›';
    next.addEventListener('click', () => shiftCalendarMonth(1));
    head.append(prev, title, next);
    host.appendChild(head);

    const weekdays = document.createElement('div');
    weekdays.className = 'flow-calendar-weekdays';
    ['一', '二', '三', '四', '五', '六', '日'].forEach((w) => {
        const el = document.createElement('span');
        el.innerText = w;
        weekdays.appendChild(el);
    });
    host.appendChild(weekdays);

    const grid = document.createElement('div');
    grid.className = 'flow-calendar-grid';
    const first = new Date(Date.UTC(calendarViewYear, calendarViewMonth, 1));
    const startWeekday = (first.getUTCDay() + 6) % 7;
    const daysInMonth = new Date(Date.UTC(calendarViewYear, calendarViewMonth + 1, 0)).getUTCDate();
    const logDays = new Set(logs.map((l) => formatBeijingDate(l.startTime)));

    for (let i = 0; i < startWeekday; i++) {
        const pad = document.createElement('span');
        pad.className = 'flow-calendar-pad';
        grid.appendChild(pad);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${calendarViewYear}-${pad2(calendarViewMonth + 1)}-${pad2(d)}`;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'flow-calendar-day btn-active';
        if (dateStr === todayStr) btn.classList.add('is-today');
        if (dateStr === viewDate) btn.classList.add('is-selected');
        if (dateStr > todayStr) btn.classList.add('is-future');
        if (logDays.has(dateStr)) btn.classList.add('has-logs');
        const numEl = document.createElement('span');
        numEl.className = 'flow-calendar-day-num';
        numEl.innerText = String(d);
        const todayLabel = document.createElement('span');
        todayLabel.className = 'flow-calendar-day-today-label';
        todayLabel.innerText = '今';
        btn.append(numEl, todayLabel);
        if (dateStr <= todayStr) btn.addEventListener('click', () => setViewDate(dateStr));
        else btn.disabled = true;
        grid.appendChild(btn);
    }
    host.appendChild(grid);
}

function switchTab(t) {
    pickerMode = 'record';
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    const page = document.getElementById('page-' + t);
    if (page) page.classList.add('active');
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;
    if (t === 'dev' && typeof renderDevAppearancePanel === 'function') renderDevAppearancePanel();
    ['record', 'calendar', 'report', 'mine'].forEach(name => {
        const nav = document.getElementById('nav-' + name);
        if (nav) {
            nav.classList.remove('text-indigo-600');
            nav.classList.add('text-slate-400');
        }
    });
    const btn = document.getElementById('nav-'+t); if(btn) btn.classList.replace('text-slate-400','text-indigo-600');
    if (t === 'report') renderReport();
    if (t === 'record') {
        renderRecordPage();
        renderShortcuts();
        renderParallelShortcuts();
    }
    if (t === 'calendar') renderCalendarPage();
    if (t === 'mine') syncConfigSectionUI();
}
function handleFreeInput() {
    const el = document.getElementById('free-input'); const val = el.value.trim(); if(!val) return;
    const backfillVisible = !document.getElementById('free-backfill').classList.contains('hidden');
    if (backfillVisible) {
        // 带时间段的补录模式
        const now = Date.now();
        const dayStart = beijingPeriodStart(now, DAY_MS);
        const fbH = parseInt(document.getElementById('fb-h').value) || 0;
        const fbM = parseInt(document.getElementById('fb-m').value) || 0;
        const fbS = parseInt(document.getElementById('fb-s').value) || 0;
        const feH = parseInt(document.getElementById('fe-h').value) || 0;
        const feM = parseInt(document.getElementById('fe-m').value) || 0;
        const feS = parseInt(document.getElementById('fe-s').value) || 0;
        const startMs = dayStart + fbH * 3600000 + fbM * 60000 + fbS * 1000;
        const endMs = dayStart + feH * 3600000 + feM * 60000 + feS * 1000;
        if (endMs <= startMs) { showConfirm('⏱ 时间不合法', '结束时间必须晚于开始时间。', '知道了', () => {}); return; }
        // 解析分类
        const matches = [];
        cats.forEach(c => c.subs.forEach(s => { const idx = val.indexOf(s); if (idx >= 0) matches.push({ l1: c.name, l2: s, idx }); }));
        cats.forEach(c => { const idx = val.indexOf(c.name); if (idx >= 0) matches.push({ l1: c.name, l2: "", idx }); });
        matches.sort((a, b) => a.idx - b.idx || b.l2.length - a.l2.length);
        const match = matches[0] || { l1: "", l2: "" };
        const cat = getCat(match.l1);
        const entry = {
            id: Date.now() + Math.random(),
            startTime: startMs,
            endTime: endMs,
            duration: Math.round((endMs - startMs) / 60000),
            l1: match.l1, l2: match.l2 || '',
            tag: val.match(/#(\S+)/)?.[1] || '',
            note: val,
            color: cat?.color || '#cbd5e1',
            parallel: false
        };
        logs.unshift(entry);
        localStorage.setItem('v9_logs', JSON.stringify(logs));
        el.value = '';
        document.getElementById('free-backfill').classList.add('hidden');
        renderAll();
        return;
    }
    // 普通模式（无时间选择）
    const matches = [];
    cats.forEach(c => c.subs.forEach(s => {
        const index = val.indexOf(s);
        if (index >= 0) matches.push({ l1: c.name, l2: s, index });
    }));
    cats.forEach(c => {
        const index = val.indexOf(c.name);
        if (index >= 0) matches.push({ l1: c.name, l2: "", index });
    });
    matches.sort((a, b) => a.index - b.index || b.l2.length - a.l2.length);
    const match = matches[0] || { l1: "", l2: "" };
    const tag = val.match(/#(\S+)/)?.[1] || "";
    executeRecord(match.l1, match.l2, tag, val); el.value = "";
}

function closeDrawer() { document.getElementById('drawer').classList.add('hidden'); pickerMode = 'record'; _parallelCallback = null; }

function toggleFreeBackfill() {
    const el = document.getElementById('free-backfill');
    el.classList.toggle('hidden');
    if (!el.classList.contains('hidden')) {
        // 初始化时间为当前小时的前后
        const now = Date.now();
        const d = new Date(now);
        const h = d.getHours();
        document.getElementById('fb-h').value = String(Math.max(0, h-2)).padStart(2,'0');
        document.getElementById('fb-m').value = '00';
        document.getElementById('fb-s').value = '00';
        document.getElementById('fe-h').value = String(h).padStart(2,'0');
        document.getElementById('fe-m').value = String(d.getMinutes()).padStart(2,'0');
        document.getElementById('fe-s').value = String(d.getSeconds()).padStart(2,'0');
    }
}

function addL1() {
    showPrompt("新建一级分类", "输入大类名称", "", (n) => {
        if (n && n.trim()) {
            const name = n.trim();
            showCategoryPicker("为「" + name + "」选图标", (icon) => {
                cats.push({id:Date.now(), name:name, icon: icon || "📁", color:"#3b82f6", subs: []});
                save();
            });
        }
    });
}
function addS(id) {
    const cat = cats.find(c => c.id == id);
    if (!cat) return;
    showPrompt("新建子分类", "输入子类名称", "", (n) => {
        if (n && n.trim()) {
            const name = n.trim();
            showCategoryPicker("为「" + name + "」选图标", (icon) => {
                cat.subs.push(name);
                SUB_ICON_MAP[name] = icon || "📌";
                save();
            });
        }
    });
}
function editL1(id) {
    const cat = cats.find(c => c.id == id);
    if (!cat) return;
    const oldName = cat.name;
    showPrompt("编辑一级分类名称", "输入大类名称", cat.name, (name) => {
        if (!name || !name.trim()) return;
        cat.name = name.trim();
        shortcuts.forEach(s => { if (s.l1 === oldName) s.l1 = cat.name; });
        logs.forEach(l => { if (l.l1 === oldName) l.l1 = cat.name; });
        if (current?.l1 === oldName) current.l1 = cat.name;
        if (selL1 === oldName) selL1 = cat.name;
        showPrompt("编辑图标", "输入一个 Emoji", cat.icon || "📁", (icon) => {
            if (icon && icon.trim()) cat.icon = icon.trim();
            showPrompt("编辑颜色", "例如 #6366f1", cat.color || "#94a3b8", (color) => {
                if (color && color.trim()) cat.color = color.trim();
                saveAll();
            });
        });
    });
}
function editS(id, oldName) {
    const cat = cats.find(c => c.id == id);
    if (!cat) return;
    showPrompt("编辑子分类", "输入新的子类名称", oldName, (name) => {
        if (name === null) return;
        const next = name.trim();
        if (!next) return;
        cat.subs = cat.subs.map(s => s === oldName ? next : s);
        shortcuts.forEach(s => { if (s.l1 === cat.name && s.l2 === oldName) s.l2 = next; });
        logs.forEach(l => { if (l.l1 === cat.name && l.l2 === oldName) l.l2 = next; });
        if (current?.l1 === cat.name && current?.l2 === oldName) current.l2 = next;
        saveAll();
    });
}
function delS(id, name) {
    const cat = cats.find(c => c.id == id);
    if (!cat) return;
    if (confirm(`删除子类「${name}」？`)) {
        cat.subs = cat.subs.filter(s => s !== name);
        shortcuts = shortcuts.filter(s => !(s.l1 === cat.name && s.l2 === name));
        saveAll();
    }
}
function delL1(id) {
    const cat = cats.find(c => c.id === id);
    if(confirm("删除？")) {
        cats = cats.filter(c=>c.id!==id);
        if (cat) shortcuts = shortcuts.filter(s => s.l1 !== cat.name);
        if (!cats.some(c => c.name === selL1)) selL1 = cats[0]?.name || "";
        saveAll();
    }
}
function save() { localStorage.setItem('v9_cats', JSON.stringify(cats)); renderAll(); }
function saveAll() {
    localStorage.setItem('v9_cats', JSON.stringify(cats));
    localStorage.setItem('v9_shorts', JSON.stringify(shortcuts));
    localStorage.setItem('v9_parallel_shorts', JSON.stringify(parallelShortcuts));
    localStorage.setItem('v9_logs', JSON.stringify(logs));
    if (current) localStorage.setItem('v9_current', JSON.stringify(current));
    renderAll();
}
