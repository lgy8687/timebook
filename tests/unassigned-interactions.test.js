const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const index = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const inspector = fs.readFileSync(path.join(__dirname, '..', 'dev-inspector.js'), 'utf8');
const deleteSource = app.slice(app.indexOf('function getUnassignedMergeNeighbors('), app.indexOf('\nfunction openCalendarBackfill(', app.indexOf('function getUnassignedMergeNeighbors(')));
const clearSource = app.slice(app.indexOf('function clearLogEntryToUnassigned('), app.indexOf('\nfunction requestDeleteLogEntry(', app.indexOf('function clearLogEntryToUnassigned(')));
const closeConfirmSource = app.slice(app.indexOf('function closeConfirm('), app.indexOf('\nlet keyboardActiveModal', app.indexOf('function closeConfirm(')));
const editSource = app.slice(app.indexOf('function confirmUnassignedEdit('), app.indexOf('\nfunction confirmActiveMainEdit(', app.indexOf('function confirmUnassignedEdit(')));
const dayStart = Date.parse('2026-10-12T00:00:00+08:00');
const hour = 3600000;
const gap = { start: dayStart + 10 * hour, end: dayStart + 10 * hour + 10 * 60000 };

function storage() {
    const saved = new Map();
    return {
        setItem(key, value) { saved.set(key, value); },
        getItem(key) { return saved.get(key); },
    };
}

function deleteContext(direction, assigned = []) {
    const earlier = { id: 'earlier', startTime: dayStart + 9 * hour, endTime: gap.start, l2: '较早活动' };
    const later = { id: 'later', startTime: gap.end, endTime: dayStart + 11 * hour, l2: '较晚活动' };
    const alerts = [];
    const context = {
        logs: [earlier, later], current: null, unlocatedLogs: assigned,
        localStorage: storage(),
        getDayUnassignedSegments: () => [gap],
        assignUnlocatedToGaps: () => ({ byGap: [assigned], unplaced: [] }),
        getActiveUnassignedSegment: () => null,
        formatBeijingDate: () => '2026-10-12',
        logEndMs: (item) => item.endTime,
        showConfirm(title, _message, _button, callback) { alerts.push(title); if (title === '确认删除') callback(true); },
        showMergeDirection(_target, callback) { callback(direction); },
        renderAll() {},
    };
    vm.createContext(context);
    vm.runInContext(deleteSource, context);
    return { context, earlier, later, alerts };
}

test('deleting a ten-minute gap merges it into only the chosen adjacent main', () => {
    const up = deleteContext('up');
    up.context.requestDeleteUnassignedGap('2026-10-12', gap.start);
    assert.equal(up.later.startTime, gap.start);
    assert.equal(up.earlier.endTime, gap.start);
    assert.equal(up.later.endTime - up.later.startTime, 60 * 60000);

    const down = deleteContext('down');
    down.context.requestDeleteUnassignedGap('2026-10-12', gap.start);
    assert.equal(down.earlier.endTime, gap.end);
    assert.equal(down.later.startTime, gap.end);
    assert.equal(down.earlier.endTime - down.earlier.startTime, 70 * 60000);
});

test('a gap with an untimed activity cannot be deleted', () => {
    const activity = { id: 'activity', date: '2026-10-12', durationMs: 60000, gapStart: gap.start };
    const { context, earlier, later, alerts } = deleteContext('down', [activity]);
    context.requestDeleteUnassignedGap('2026-10-12', gap.start);
    assert.deepEqual(alerts, ['不能删除未分配']);
    assert.equal(earlier.endTime, gap.start);
    assert.equal(later.startTime, gap.end);
});

test('editing a gap creates a classified main only within the selected interval', () => {
    const store = storage();
    const alerts = [];
    const context = {
        editTarget: { source: 'unassigned', dateStr: '2026-10-12', gapStart: gap.start, live: false },
        editOldL1: '生活', editOldL2: '洗漱', recordMode: 'journal',
        logs: [], current: null, unlocatedLogs: [], localStorage: store,
        nowSecondMs: () => dayStart + 2 * 86400000,
        getCat: () => ({ color: '#f90' }),
        getDayUnassignedSegments: () => [gap],
        getActiveUnassignedSegment: () => null,
        parseTimeOnBeijingDate: (prefix) => prefix === 'es' ? gap.start + 2 * 60000 : gap.end - 2 * 60000,
        mainRecordOverlaps: () => [], intervalExceedsDayBudget: () => false,
        assignUnlocatedToGaps: () => ({ byGap: [[]], unplaced: [] }),
        document: { getElementById: () => ({ value: '' }) },
        showConfirm: (title) => alerts.push(title),
        genId: () => 'classified', closeEdit() {}, renderAll() {},
    };
    vm.createContext(context);
    vm.runInContext(editSource, context);
    context.confirmUnassignedEdit();
    assert.deepEqual(alerts, []);
    assert.equal(context.logs[0].startTime, gap.start + 2 * 60000);
    assert.equal(context.logs[0].endTime, gap.end - 2 * 60000);
    assert.equal(context.logs[0].l2, '洗漱');
    assert.equal(JSON.parse(store.getItem('v9_logs'))[0].id, 'classified');
});

test('clearing a classified main preserves its time as an unassigned gap and detaches child records', () => {
    const target = { id: 'main', startTime: gap.start, endTime: gap.end, l1: '生活', l2: '散步' };
    const child = { id: 'parallel', parentId: 'main', parallel: true };
    const event = { id: 'event', parentId: 'main', occurredAt: gap.start };
    const saved = new Map();
    let rendered = false;
    const context = {
        logs: [target, child], parallelHistory: [], parallelCurrent: null, eventRecords: [event],
        localStorage: { setItem(key, value) { saved.set(key, value); } },
        saveEventRecords() { saved.set('v9_event_records', JSON.stringify(context.eventRecords)); },
        renderAll() { rendered = true; },
    };
    vm.createContext(context);
    vm.runInContext(clearSource, context);
    context.clearLogEntryToUnassigned(target);
    assert.deepEqual(context.logs.map(item => item.id), ['parallel']);
    assert.equal(context.logs[0].parentId, null);
    assert.equal(context.eventRecords[0].parentId, null);
    assert.deepEqual(JSON.parse(saved.get('v9_logs')).map(item => item.id), ['parallel']);
    assert.equal(rendered, true);
});

test('delete confirmation offers clear; backdrop dismissal remains non-destructive', () => {
    assert.match(index, /id="confirm-cancel-btn"[^>]*>取消<\/button>/);
    assert.match(index, /onclick="if\(event\.target===this\)closeConfirm\(false\)"/);
    assert.match(app, /showConfirm\("确认删除"[\s\S]*?'清空', \{ addressBlock: 'B83', onSecondary: \(\) => clearLogEntryToUnassigned\(log\) \}\)/);
    assert.match(app, /showMergeDirection\(target, direction => \{[\s\S]*\}, neighbors, \{ addressBlock: 'B81' \}\)/);
    assert.match(inspector, /\['B81', '已分配主线删除归并方向界面'/);
    assert.match(inspector, /\['B82', '未分配时段删除归并方向界面'/);
    assert.match(inspector, /\['B83', '流水删除确认及清空界面'/);

    let result = null;
    let cleared = false;
    const context = {
        document: { getElementById: () => ({ classList: { add() {} } }) },
        confirmCallback: value => { result = value; },
        confirmSecondaryCallback: () => { cleared = true; },
    };
    vm.createContext(context);
    vm.runInContext(closeConfirmSource, context);
    context.closeConfirm(false);
    assert.equal(result, false);
    assert.equal(cleared, false);
    context.confirmCallback = value => { result = value; };
    context.confirmSecondaryCallback = () => { cleared = true; };
    context.closeConfirm(false, 'secondary');
    assert.equal(result, false);
    assert.equal(cleared, true);
});
