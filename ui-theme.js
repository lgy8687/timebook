/** 开发者外观：改 false 可隐藏入口（用后就丢） */
function _themeSafeJSON(key, fallback) {
    try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
    } catch (e) { return fallback; }
}
const DEV_PANEL_ENABLED = true;
const UI_THEME_STORAGE_KEY = 'v9_dev_theme';

const UI_THEME_DEFAULTS = {
    bodyBg: '#f8fafc',
    bodyText: '#0f172a',
    baseFontSize: 16,
    headerTimer: '#4f46e5',
    headerL2: '#334155',
    headerActiveLabel: '#6366f1',
    versionBadge: '#ef4444',
    dayRemainFill: '#D4B88C',
    dayRemainLabel: '#ffffff',
    dayRemainTrackH: 26,
    dayRemainLabelSize: 13,
    sectionTitleSize: 12,
    sectionTitleColor: '#64748b',
    sectionTitleColor: '#64748b',
    mainKeycapBg: '#ffffff',
    mainKeycapBorder: '#d1d5db',
    mainKeycapText: '#334155',
    mainKeycapPressedBg: '#f1f5f9',
    mainKeycapIconSize: 18,
    mainKeycapLabelSize: 10,
    shortcutAddMainBg: '#eef2ff',
    shortcutAddMainColor: '#4f46e5',
    parallelIconColor: '#94a3b8',
    parallelLabelColor: '#64748b',
    parallelLabelSize: 11,
    parallelStatusColor: '#10b981',
    parallelKeycapBg: '#ffffff',
    parallelKeycapText: '#334155',
    parallelKeycapBorderA: '#002FA7',
    parallelKeycapBorderB: '#002FA7',
    parallelKeycapIconSize: 18,
    parallelKeycapLabelSize: 10,
    shortcutAddParallelBg: '#f1f5f9',
    shortcutAddParallelColor: '#475569',
    freeInputSize: 16,
    recordBtnBg: '#1e293b',
    recordBtnColor: '#ffffff',
    clockFaceBg: '#ffffff',
    clockRingStroke: '#e2e8f0',
    clock60mRemain: '#10b981',
    clock24hRemain: '#6366f1',
    clockHand60m: '#10b981',
    clockHand24h: '#6366f1',
    clockMutedLabel: '#94a3b8',
    logMainBg: '#ffffff',
    logTimeColor: '#94a3b8',
    logTimeSize: 13,
    logNameColor: '#334155',
    logNameSize: 16,
    logDurLive: '#10b981',
    logDurLog: '#334155',
    logDurDone: '#475569',
    logDurSize: 15,
    logInnerMinH: 52,
    logBarW: 6,
    logBarH: 32,
    logNoteColor: '#94a3b8',
    logNoteSize: 11,
    logParallelBg: '#e8edf4',
    logParallelBorder: '#cbd5e1',
    logParallelTime: '#64748b',
    logParallelName: '#64748b',
    logParallelNameSize: 14,
    logParallelInnerMinH: 44,
    logParallelBarW: 5,
    logParallelBarH: 26,
    logNestBorder: '#cbd5e1',
    logDayHeaderColor: '#cbd5e1',
    logTagColor: '#818cf8',
    logTagBg: '#eef2ff',
    swipeDeleteBg: '#ef4444',
    swipeEditBg: '#3b82f6',
    swipeBtnSize: 11,
    navActive: '#4f46e5',
    navInactive: '#94a3b8',
    navFabBg: '#4f46e5',
    reportTitleColor: '#64748b',
    reportTitleSize: 13,
    reportCardBg: '#ffffff',
    reportCardBorder: '#eef2f7',
    timelineBg: '#f1f5f9',
    distBarBg: '#e2e8f0',
    drawerTitleSize: 18,
    drawerOverlay: 'rgba(15,23,42,0.4)',
    confirmOkBg: '#4f46e5',
    keycapMinH: 48
};

const UI_THEME_SECTIONS = [
    { id: 'global', title: '① 全局 · 顶栏', fields: [
        { key: 'bodyBg', label: '页面背景', type: 'color' },
        { key: 'bodyText', label: '页面文字', type: 'color' },
        { key: 'baseFontSize', label: '基础字号', type: 'number', min: 12, max: 20, unit: 'px' },
        { key: 'headerTimer', label: '顶栏计时色', type: 'color' },
        { key: 'headerL2', label: '活动名称色', type: 'color' },
        { key: 'headerActiveLabel', label: 'Active 标签', type: 'color' },
        { key: 'versionBadge', label: '版本号颜色', type: 'color' }
    ]},
    { id: 'dayremain', title: '② 今天剩余', fields: [
        { key: 'dayRemainFill', label: '进度填充色', type: 'color' },
        { key: 'dayRemainLabel', label: '条上文字色', type: 'color' },
        { key: 'dayRemainTrackH', label: '条高度', type: 'number', min: 18, max: 36, unit: 'px' },
        { key: 'dayRemainLabelSize', label: '条文字号', type: 'number', min: 9, max: 16, unit: 'px' }
    ]},
    { id: 'mainkey', title: '③ 主线键帽', fields: [
        { key: 'mainKeycapBg', label: '键帽背景', type: 'color' },
        { key: 'mainKeycapBorder', label: '键帽边框', type: 'color' },
        { key: 'mainKeycapText', label: '键帽文字', type: 'color' },
        { key: 'mainKeycapPressedBg', label: '按下背景', type: 'color' },
        { key: 'mainKeycapIconSize', label: '图标字号', type: 'number', min: 12, max: 28, unit: 'px' },
        { key: 'mainKeycapLabelSize', label: '标签字号', type: 'number', min: 8, max: 14, unit: 'px' },
        { key: 'keycapMinH', label: '键帽高度', type: 'number', min: 40, max: 56, unit: 'px' },
        { key: 'shortcutAddMainBg', label: '＋钮背景', type: 'color' },
        { key: 'shortcutAddMainColor', label: '＋钮文字', type: 'color' }
    ]},
    { id: 'parallelkey', title: '④ 并行区 · 键帽', fields: [
        { key: 'parallelIconColor', label: '↳ 图标色', type: 'color' },
        { key: 'parallelLabelColor', label: '并行标题色', type: 'color' },
        { key: 'parallelLabelSize', label: '并行标题号', type: 'number', min: 9, max: 14, unit: 'px' },
        { key: 'parallelStatusColor', label: '运行中文字', type: 'color' },
        { key: 'parallelKeycapBg', label: '键帽背景', type: 'color' },
        { key: 'parallelKeycapText', label: '键帽文字', type: 'color' },
        { key: 'parallelKeycapBorderA', label: '外框色 A', type: 'color' },
        { key: 'parallelKeycapBorderB', label: '外框色 B', type: 'color' },
        { key: 'parallelKeycapIconSize', label: '图标字号', type: 'number', min: 12, max: 28, unit: 'px' },
        { key: 'parallelKeycapLabelSize', label: '标签字号', type: 'number', min: 8, max: 14, unit: 'px' },
        { key: 'shortcutAddParallelBg', label: '＋钮背景', type: 'color' },
        { key: 'shortcutAddParallelColor', label: '＋钮文字', type: 'color' }
    ]},
    { id: 'input', title: '⑤ 随手记', fields: [
        { key: 'freeInputSize', label: '输入框字号', type: 'number', min: 12, max: 20, unit: 'px' },
        { key: 'recordBtnBg', label: '「记」按钮底', type: 'color' },
        { key: 'recordBtnColor', label: '「记」按钮字', type: 'color' }
    ]},
    { id: 'clock', title: '⑥ 双钟面', fields: [
        { key: 'clockFaceBg', label: '表盘背景', type: 'color' },
        { key: 'clockRingStroke', label: '环描边', type: 'color' },
        { key: 'clock60mRemain', label: '60M 数字', type: 'color' },
        { key: 'clock24hRemain', label: '24H 数字', type: 'color' },
        { key: 'clockHand60m', label: '60M 指针', type: 'color' },
        { key: 'clockHand24h', label: '24H 指针', type: 'color' },
        { key: 'clockMutedLabel', label: '小标签字', type: 'color' }
    ]},
    { id: 'logmain', title: '⑦ 流水 · 主线', fields: [
        { key: 'logMainBg', label: '卡片背景', type: 'color' },
        { key: 'logTimeColor', label: '时间色', type: 'color' },
        { key: 'logTimeSize', label: '时间字号', type: 'number', min: 10, max: 16, unit: 'px' },
        { key: 'logNameColor', label: '名称色', type: 'color' },
        { key: 'logNameSize', label: '名称字号', type: 'number', min: 13, max: 20, unit: 'px' },
        { key: 'logDurLive', label: '进行中时长', type: 'color' },
        { key: 'logDurLog', label: '已结束时长', type: 'color' },
        { key: 'logDurSize', label: '时长字号', type: 'number', min: 12, max: 18, unit: 'px' },
        { key: 'logInnerMinH', label: '行最小高度', type: 'number', min: 44, max: 60, unit: 'px' },
        { key: 'logBarW', label: '色条宽度', type: 'number', min: 4, max: 10, unit: 'px' },
        { key: 'logBarH', label: '色条高度', type: 'number', min: 24, max: 40, unit: 'px' }
    ]},
    { id: 'logparallel', title: '⑧ 流水 · 并行', fields: [
        { key: 'logParallelBg', label: '灰底背景', type: 'color' },
        { key: 'logParallelBorder', label: '灰底描边', type: 'color' },
        { key: 'logParallelTime', label: '时间色', type: 'color' },
        { key: 'logParallelName', label: '名称色', type: 'color' },
        { key: 'logParallelNameSize', label: '名称字号', type: 'number', min: 12, max: 18, unit: 'px' },
        { key: 'logParallelInnerMinH', label: '行最小高度', type: 'number', min: 36, max: 52, unit: 'px' },
        { key: 'logParallelBarW', label: '色条宽度', type: 'number', min: 4, max: 8, unit: 'px' },
        { key: 'logParallelBarH', label: '色条高度', type: 'number', min: 20, max: 32, unit: 'px' },
        { key: 'logDurDone', label: '已结束时长', type: 'color' }
    ]},
    { id: 'logmisc', title: '⑨ 流水 · 其它', fields: [
        { key: 'logNestBorder', label: '嵌套左边线', type: 'color' },
        { key: 'logDayHeaderColor', label: '日期标题', type: 'color' },
        { key: 'logNoteColor', label: '备注色', type: 'color' },
        { key: 'logNoteSize', label: '备注字号', type: 'number', min: 9, max: 14, unit: 'px' },
        { key: 'logTagColor', label: '标签文字', type: 'color' },
        { key: 'logTagBg', label: '标签背景', type: 'color' },
        { key: 'swipeDeleteBg', label: '右滑删除底', type: 'color' },
        { key: 'swipeEditBg', label: '左滑编辑底', type: 'color' },
        { key: 'swipeBtnSize', label: '滑钮字号', type: 'number', min: 10, max: 14, unit: 'px' }
    ]},
    { id: 'nav', title: '⑩ 底部导航', fields: [
        { key: 'navActive', label: '选中色', type: 'color' },
        { key: 'navInactive', label: '未选中色', type: 'color' },
        { key: 'navFabBg', label: '中间＋钮', type: 'color' }
    ]},
    { id: 'report', title: '⑪ 日报表', fields: [
        { key: 'reportTitleColor', label: '区块标题', type: 'color' },
        { key: 'reportTitleSize', label: '标题字号', type: 'number', min: 11, max: 16, unit: 'px' },
        { key: 'reportCardBg', label: '卡片背景', type: 'color' },
        { key: 'reportCardBorder', label: '卡片边框', type: 'color' },
        { key: 'timelineBg', label: '时间轴槽', type: 'color' },
        { key: 'distBarBg', label: '分布条槽', type: 'color' }
    ]},
    { id: 'overlay', title: '⑫ 抽屉 · 弹窗', fields: [
        { key: 'drawerTitleSize', label: '抽屉标题号', type: 'number', min: 14, max: 22, unit: 'px' },
        { key: 'drawerOverlay', label: '遮罩色', type: 'color' },
        { key: 'confirmOkBg', label: '确定按钮', type: 'color' }
    ]}
];

function themeKeyToCssVar(key) {
    return '--tb-' + key.replace(/[A-Z]/g, m => '-' + m[0].toLowerCase());
}

function loadUiTheme() {
    const saved = _themeSafeJSON(UI_THEME_STORAGE_KEY, null);
    if (!saved || typeof saved !== 'object') return { ...UI_THEME_DEFAULTS };
    return { ...UI_THEME_DEFAULTS, ...saved };
}

function saveUiTheme(cfg) {
    localStorage.setItem(UI_THEME_STORAGE_KEY, JSON.stringify(cfg));
}

function applyUiTheme(cfg) {
    const c = { ...UI_THEME_DEFAULTS, ...cfg };
    const root = document.documentElement;
    Object.keys(UI_THEME_DEFAULTS).forEach(key => {
        const val = c[key];
        const cssVar = themeKeyToCssVar(key);
        const field = UI_THEME_SECTIONS.flatMap(s => s.fields).find(f => f.key === key);
        if (field && field.type === 'number') {
            root.style.setProperty(cssVar, val + (field.unit || 'px'));
        } else {
            root.style.setProperty(cssVar, String(val));
        }
    });
    document.body.style.backgroundColor = c.bodyBg;
    document.body.style.color = c.bodyText;
    document.body.style.fontSize = c.baseFontSize + 'px';
}

function resetUiTheme() {
    localStorage.removeItem(UI_THEME_STORAGE_KEY);
    applyUiTheme(UI_THEME_DEFAULTS);
}

(function initUiThemeEarly() {
    applyUiTheme(loadUiTheme());
})();
