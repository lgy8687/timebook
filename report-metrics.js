/**
 * 报表摘要指标 — 主页设置中心配置，报表沙盘读取
 */
const REPORT_SUMMARY_DEFAULTS = {
    main: ['focus', 'switches', 'records'],
    parallel: ['paraHours', 'paraRatio', 'topPara'],
};

const REPORT_METRIC_POOL = {
    main: [
        { id: 'focus', label: '结构重心' },
        { id: 'switches', label: '活动切换' },
        { id: 'records', label: '流水条数' },
        { id: 'mainHours', label: '主线总时长' },
        { id: 'topCat', label: '占比最高分类' },
    ],
    parallel: [
        { id: 'paraHours', label: '并行总时长' },
        { id: 'paraRatio', label: '叠在主线比' },
        { id: 'topPara', label: '最常并行' },
        { id: 'paraRecords', label: '并行条数' },
        { id: 'topHost', label: '叠加最多时段' },
    ],
};

function getReportSummarySlots(view) {
    const key = view === 'parallel' ? 'v9_report_summary_parallel' : 'v9_report_summary_main';
    try {
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : null;
        if (Array.isArray(arr) && arr.length === 3) return arr;
    } catch (e) { /* ignore */ }
    return [...REPORT_SUMMARY_DEFAULTS[view]];
}

function saveReportSummarySlots(view, slots) {
    const key = view === 'parallel' ? 'v9_report_summary_parallel' : 'v9_report_summary_main';
    localStorage.setItem(key, JSON.stringify(slots.slice(0, 3)));
}

function resolveReportMetric(metricId, periodData, view) {
    const main = periodData.main;
    const parallel = periodData.parallel;
    const b = view === 'main' ? main : parallel;
    const summary = b.summary || [];
    const l1 = main.l1 || [];
    const mainTotal = l1.reduce((s, x) => s + x.hours, 0) || 1;
    const paraTotal = (parallel.l1 || []).reduce((s, x) => s + x.hours, 0);

    const fromSummary = (icon, labelKey) => {
        const row = summary.find((r) => r.label === labelKey || r.icon === icon);
        if (!row) return null;
        return { value: row.value, label: row.label };
    };

    switch (metricId) {
        case 'focus':
            return fromSummary('🎯', '结构重心') || { value: '—', label: '结构重心' };
        case 'switches':
            return fromSummary('🔀', '活动切换') || { value: '—', label: '活动切换' };
        case 'records':
            return fromSummary('📋', '流水条数') || { value: '—', label: '流水条数' };
        case 'mainHours': {
            const h = Math.round(mainTotal * 10) / 10;
            return { value: h + 'h', label: '主线总时长' };
        }
        case 'topCat': {
            const top = [...l1].sort((a, c) => c.hours - a.hours)[0];
            return top
                ? { value: top.name, label: '占比最高分类' }
                : { value: '—', label: '占比最高分类' };
        }
        case 'paraHours':
            return fromSummary('⏳', '并行总时长') || { value: '—', label: '并行总时长' };
        case 'paraRatio':
            return fromSummary('📐', '叠在主线比') || { value: '—', label: '叠在主线比' };
        case 'topPara':
            return fromSummary('🔝', '最常并行') || { value: '—', label: '最常并行' };
        case 'paraRecords': {
            const row = summary.find((r) => r.label && r.label.includes('条'));
            return row ? { value: row.value, label: '并行条数' } : { value: '—', label: '并行条数' };
        }
        case 'topHost':
            return { value: '上班', label: '叠加最多时段' };
        default:
            return { value: '—', label: '—' };
    }
}
