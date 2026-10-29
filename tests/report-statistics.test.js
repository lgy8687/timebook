const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const metrics = fs.readFileSync(path.join(__dirname, '..', 'report-metrics.js'), 'utf8');
function functionSource(name, next) {
    return app.slice(app.indexOf(`function ${name}(`), app.indexOf(`\nfunction ${next}(`));
}
const DAY_MS = 86400000, HOUR_MS = 3600000, BJ_OFFSET = 8 * HOUR_MS;

test('year navigation honors offsets and leap years in Beijing time', () => {
    const ctx = vm.createContext({ DAY_MS, BJ_OFFSET });
    vm.runInContext(functionSource('getBeijingReportRange', 'getReportPeriodTitle'), ctx);
    const range = ctx.getBeijingReportRange('year', Date.parse('2026-10-29T12:00:00+08:00'), -2);
    assert.equal(range.start, Date.parse('2024-01-01T00:00:00+08:00'));
    assert.equal(range.end, Date.parse('2025-01-01T00:00:00+08:00'));
    assert.equal((range.end - range.start) / DAY_MS, 366);
});

test('parallel summaries retain minutes and seconds before formatting', () => {
    const ctx = vm.createContext({ localStorage: { getItem: () => null } });
    vm.runInContext(metrics, ctx);
    const data = { main: { l1: [] }, parallel: { l1: [{ hours: 0, exactHours: 2 / 60 }] } };
    assert.equal(ctx.resolveReportMetric('paraHours', data, 'parallel').value, '2分钟');
    data.parallel.l1[0].exactHours = 10 / 3600;
    assert.equal(ctx.resolveReportMetric('paraHours', data, 'parallel').value, '10秒');
});

test('historical day clips records and events to that day, preserving exact parallel duration', () => {
    const now = Date.parse('2026-10-29T12:00:00+08:00');
    const start = Date.parse('2026-10-28T00:00:00+08:00');
    let queried, eventRange;
    const ctx = vm.createContext({
        DAY_MS, HOUR_MS, UNRECORDED_COLOR: '#cbd5e1', unlocatedLogs: [],
        nowSecondMs: () => now,
        beijingPeriodStart: ms => Math.floor((ms + BJ_OFFSET) / DAY_MS) * DAY_MS - BJ_OFFSET,
        getSegmentsInRange(a, b) {
            queried = [a, b];
            return [
                { clippedStart: a, clippedEnd: a + HOUR_MS, l1: '工作' },
                { clippedStart: a, clippedEnd: a + 120000, parallel: true, l1: '工作' },
            ];
        },
        getUnrecordedSegments: () => [],
        buildMainChartComposition: () => ({ l1: [{ name: '工作', hours: 1, exactHours: 1 }], l2: [], l2Slices: [] }),
        mergeUnlocatedIntoChart: () => 0,
        msToReportHours: ms => Math.round(ms / HOUR_MS * 10) / 10,
        aggregateReportSegments: () => [{ name: '开会', ms: 120000, color: '#123456' }],
        parallelHostL1: () => '工作', displayName: l => l.parallel ? '开会' : '办公',
        getCat: () => ({ color: '#123456' }),
        formatBeijingClockSec: () => '00:00:00',
        formatBeijingDate: ms => new Date(ms + BJ_OFFSET).toISOString().slice(0, 10),
        buildEventReport(a, b) { eventRange = [a, b]; return {}; },
    });
    vm.runInContext(functionSource('buildLiveReportDay', 'getReportPeriodData'), ctx);
    const data = ctx.buildLiveReportDay(-1);
    assert.deepEqual(queried, [start, start + DAY_MS]);
    assert.deepEqual(eventRange, queried);
    assert.equal(data.main.meta.title, '2026-10-28');
    assert.equal(data._live, false);
    assert.equal(data.timeline.nowPct, null);
    assert.equal(data.parallel.l1[0].exactHours, 2 / 60);
    assert.equal(data.parallel.l2[0].exactHours, 2 / 60);
    assert.equal(data.parallel.summary[1].value, '3.3%');
});

test('overlapping primary records plus uncovered time still compose exactly 24 hours', () => {
    const start = Date.parse('2026-10-28T00:00:00+08:00');
    const ctx = vm.createContext({
        DAY_MS, UNRECORDED_COLOR: '#cbd5e1', nowSecondMs: () => start + DAY_MS,
        getTrackingStartMs: () => start, beijingDateStrToDayStart: () => start,
        formatBeijingDate: () => '2026-10-28', displayName: l => l.l1,
        getCat: () => ({ color: '#123456' }), formatBeijingClockSec: () => '00:00:00',
        msToReportHours: ms => Math.round(ms / HOUR_MS * 10) / 10,
    });
    vm.runInContext(functionSource('getUnrecordedSegments', 'msToReportHours'), ctx);
    vm.runInContext(functionSource('buildMainComposition', 'parallelHostL1'), ctx);
    const records = [
        { l1: '工作', clippedStart: start, clippedEnd: start + 10 * HOUR_MS },
        { l1: '生活', clippedStart: start + 9 * HOUR_MS, clippedEnd: start + 14 * HOUR_MS },
    ];
    const gaps = ctx.getUnrecordedSegments(records, start, start + DAY_MS);
    const parts = ctx.buildMainComposition(records.concat(gaps), start, start + DAY_MS);
    assert.ok(Math.abs(parts.reduce((sum, row) => sum + row.width, 0) - 100) < 1e-8);
});
