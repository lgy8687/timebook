const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const backup = fs.readFileSync(path.join(__dirname, '..', 'backup.js'), 'utf8');
const gapSource = app.slice(app.indexOf('const UNRECORDED_COLOR'), app.indexOf('\nlet reportBillboardReady', app.indexOf('const UNRECORDED_COLOR')));
const stopSource = app.slice(app.indexOf('function stopCurrentMain()'), app.indexOf('\nfunction executeAddShortcut(', app.indexOf('function stopCurrentMain()')));
const editSource = app.slice(app.indexOf('function applyEditedRange('), app.indexOf('\nfunction commitEditedRange(', app.indexOf('function applyEditedRange(')));
const resetSource = backup.slice(backup.indexOf('function resetTimebookStorage('), backup.indexOf('\nfunction requestTimebookReset(', backup.indexOf('function resetTimebookStorage(')));
const modeSource = app.slice(app.indexOf('function setRecordMode('), app.indexOf('\nwindow.setRecordMode = setRecordMode;', app.indexOf('function setRecordMode(')));

function storage(values) {
    const valuesMap = new Map(Object.entries(values));
    return {
        get length() { return valuesMap.size; },
        key(index) { return [...valuesMap.keys()][index]; },
        getItem(key) { return valuesMap.get(key) ?? null; },
        setItem(key, value) { valuesMap.set(key, String(value)); },
        removeItem(key) { valuesMap.delete(key); },
    };
}

const DAY = 86400000;
const start = Date.parse('2026-10-13T00:00:00+08:00');
function segment(fromHour, toHour, extra = {}) {
    return { clippedStart: start + fromHour * 3600000, clippedEnd: start + toHour * 3600000, ...extra };
}

function gapContext(segments, nowHour = 24) {
    const context = {
        logs: [{ startTime: start + 2 * 3600000, parallel: false }],
        current: null,
        localStorage: storage({}),
        nowSecondMs: () => start + nowHour * 3600000,
        formatBeijingDate: () => '2026-10-13',
        beijingDateStrToDayStart: () => start,
    };
    vm.createContext(context);
    vm.runInContext(gapSource, context);
    return context.getUnrecordedSegments(segments, start, start + DAY * 2, start + nowHour * 3600000);
}

test('unrecorded time fills elapsed gaps but not scene coverage or future time', () => {
    const gaps = gapContext([
        segment(2, 4),
        segment(6, 9, { scene: true }),
        segment(7, 8, { sceneActivity: true }),
        segment(10, 12),
    ], 12);
    assert.deepEqual(Array.from(gaps, (gap) => [(gap.clippedStart - start) / 3600000, (gap.clippedEnd - start) / 3600000]), [
        [0, 2], [4, 6], [9, 10]
    ]);
    assert.equal(gaps.every((gap) => gap.unrecorded && gap.l1 === '未记录时间'), true);
});

test('cross-day gaps keep a complete 24-hour day and shrink after backfill', () => {
    const original = gapContext([segment(22, 25)], 48);
    const backfilled = gapContext([segment(10, 12), segment(22, 25)], 48);
    const total = (items) => items.reduce((sum, item) => sum + item.clippedEnd - item.clippedStart, 0);
    assert.equal(total(original) + 3 * 3600000, 2 * DAY);
    assert.equal(total(original) - total(backfilled), 2 * 3600000);
});

test('ending a journal main records it and leaves no active main', () => {
    const active = { id: 'main', startTime: start, l1: '生活', l2: '休息' };
    const store = storage({ v9_current: JSON.stringify(active) });
    const calls = [];
    const context = {
        recordMode: 'journal', current: active, parallelCurrent: null, localStorage: store,
        nowSecondMs: () => start + 3600000,
        ensureDayRolloversBefore() {},
        commitCurrentSlice(end, continuation, options) { calls.push({ end, continuation, options }); },
        setText() {}, renderAll() {},
    };
    vm.createContext(context);
    vm.runInContext(stopSource, context);
    context.stopCurrentMain();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].options.endParallel, true);
    assert.equal(store.getItem('v9_current'), null);
    assert.equal(context.current, null);
});

test('switching mode waits for confirmation and preserves active parallel state', () => {
    const parallel = { id: 'parallel-1', parentId: 'main-1', startTime: start };
    const store = storage({ v9_parallel: JSON.stringify(parallel) });
    let confirm;
    let renders = 0;
    const context = {
        recordMode: 'continuous', current: { id: 'main-1', startTime: start },
        parallelCurrent: parallel, localStorage: store,
        showConfirm(title, message, action, callback) { confirm = callback; },
        nowSecondMs: () => start, renderAll() { renders++; },
    };
    vm.createContext(context);
    vm.runInContext(modeSource, context);
    context.setRecordMode('journal');
    assert.equal(store.getItem('v9_record_mode'), null);
    confirm(false);
    assert.equal(store.getItem('v9_record_mode'), null);
    context.setRecordMode('journal');
    confirm(true);
    assert.equal(store.getItem('v9_record_mode'), 'journal');
    assert.equal(store.getItem('v9_parallel'), JSON.stringify(parallel));
    assert.equal(context.parallelCurrent, parallel);
    assert.equal(renders, 1);
});

test('journal main can expand into a gap without moving adjacent records', () => {
    const log = { id: 'journal', journal: true, startTime: start + 10 * 3600000, endTime: start + 11 * 3600000 };
    const next = { id: 'next', startTime: start + 13 * 3600000, endTime: start + 14 * 3600000 };
    const context = {
        logs: [log, next], parallelHistory: [], current: null,
        DAY_MS: DAY,
        nowSecondMs: () => start + 20 * 3600000,
        formatBeijingDate: () => '2026-10-13',
        beijingDateStrToDayStart: () => start,
        beijingDateStrToDayEnd: () => start + DAY,
        logEndMs: (item) => item.endTime,
        mainRecordOverlaps: (from, to, excluded) => [log, next].filter((item) => !excluded.has(item.id) && item.startTime < to && item.endTime > from),
        showConfirm() { throw new Error('An open gap should not need a prompt'); },
    };
    vm.createContext(context);
    vm.runInContext(editSource, context);
    let saved = false;
    context.applyEditedRange(log, start + 9 * 3600000, start + 11 * 3600000, () => { saved = true; });
    assert.equal(saved, true);
    assert.equal(log.startTime, start + 9 * 3600000);
    assert.equal(next.startTime, start + 13 * 3600000);
});

test('record reset keeps configuration; full reset clears only app data', () => {
    const values = {
        v9_logs: '[]', v9_current: '{}', v9_event_records: '[]',
        v9_cats: 'categories', v9_scene_settings: 'scenes', v9_record_mode: 'journal',
        unrelated: 'keep',
    };
    const context = {};
    vm.createContext(context);
    vm.runInContext(resetSource, context);
    const records = storage(values);
    context.resetTimebookStorage('records', records, start);
    assert.equal(records.getItem('v9_logs'), null);
    assert.equal(records.getItem('v9_event_records'), null);
    assert.equal(records.getItem('v9_cats'), 'categories');
    assert.equal(records.getItem('v9_record_mode'), 'journal');
    assert.equal(records.getItem('v9_tracking_start'), String(start));
    const all = storage(values);
    context.resetTimebookStorage('all', all);
    assert.equal(all.getItem('v9_cats'), null);
    assert.equal(all.getItem('v9_record_mode'), null);
    assert.equal(all.getItem('unrelated'), 'keep');
});
