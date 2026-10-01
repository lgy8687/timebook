const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const drawerPickSource = source.slice(
    source.indexOf('function drawerPick('),
    source.indexOf('\nfunction renderShortcuts()', source.indexOf('function drawerPick('))
);
const executeSplitSource = source.slice(
    source.indexOf('function executeSplit('),
    source.indexOf('\nfunction mergeAdjacentSameActivity()', source.indexOf('function executeSplit('))
);
const mergeSource = source.slice(
    source.indexOf('function mergeAdjacentSameActivity()'),
    source.indexOf('\n// 吸附到最近的空闲区段边界', source.indexOf('function mergeAdjacentSameActivity()'))
);
const homeHistorySource = source.slice(
    source.indexOf('function renderHomeHistory()'),
    source.indexOf('\nfunction renderCalendarPage()', source.indexOf('function renderHomeHistory()'))
);
const sceneTreeSource = source.slice(
    source.indexOf('function renderSceneActivityTree('),
    source.indexOf('\nfunction renderMainLogTree(', source.indexOf('function renderSceneActivityTree('))
);
const confirmEditSource = source.slice(
    source.indexOf('function confirmEdit()'),
    source.indexOf('\nfunction confirmActiveParallelEdit()', source.indexOf('function confirmEdit()'))
);

function makeEditor(parent, start, end) {
    const fields = { start, end };
    const prompts = [];
    let nextId = 0;
    const context = {
        _parallelPending: false,
        _parallelCallback: null,
        _backfillRange: { start: parent.startTime, end: parent.endTime },
        pickerMode: 'split',
        logs: [parent],
        parallelHistory: [],
        recordRecentPick() {},
        parseTimeFromInput(prefix) { return fields[prefix === 'ps' ? 'start' : 'end']; },
        closeDrawer() {
            context.pickerMode = 'record';
            context._backfillRange = null;
            fields.start = parent.startTime;
            fields.end = parent.endTime;
        },
        showConfirm(title, message) { prompts.push({ title, message }); },
        getCat() { return { color: '#123456' }; },
        genId() { return `test-${++nextId}`; },
        logEndMs(log) { return log.endTime; },
        formatBeijingDate() { return '1970-01-01'; },
        parallelCurrent: null,
        renderAll() {},
        localStorage: { setItem() {} },
        document: { getElementById() { return { value: '' }; } },
        Number,
    };
    vm.createContext(context);
    vm.runInContext(drawerPickSource + '\n' + executeSplitSource + '\n' + mergeSource, context);
    context._parallelCallback = (l1, l2, range) => context.executeSplit(parent, l1, l2, range);
    return { context, prompts };
}

test('split saves the selected interval even when closing resets the fields', () => {
    const parent = { id: 'main', startTime: 0, endTime: 7200000, l1: 'Life', l2: 'Rest' };
    const { context } = makeEditor(parent, 1800000, 3600000);

    context.drawerPick('Work', 'Meeting');

    assert.equal(context.logs.length, 3);
    assert.deepEqual(Array.from(context.logs, (log) => [log.startTime, log.endTime]), [
        [0, 1800000], [1800000, 3600000], [3600000, 7200000]
    ]);
    assert.equal(context.logs[1].l2, 'Meeting');
});

test('split refuses an unchanged full-range selection', () => {
    const parent = { id: 'main', startTime: 0, endTime: 7200000, l1: 'Life', l2: 'Rest' };
    const { context, prompts } = makeEditor(parent, 0, 7200000);

    context.drawerPick('Work', 'Meeting');

    assert.equal(context.logs.length, 1);
    assert.equal(context.logs[0], parent);
    assert.equal(context.pickerMode, 'split');
    assert.equal(prompts.length, 1);
});

test('same-category split stays visible as separate main records in history', () => {
    const parent = { id: 'main', startTime: 0, endTime: 7200000, l1: 'Life', l2: 'Rest' };
    const { context } = makeEditor(parent, 1800000, 3600000);
    context.drawerPick('Life', 'Rest');
    context.mergeAdjacentSameActivity();
    const visible = [];
    const list = { appendChild() {} };
    context.document = {
        getElementById() { return list; },
        createElement() { return {}; }
    };
    context.renderLogs = () => {};
    context.getTodayDateStr = () => '1970-01-02';
    context.collectLogCalendarDays = () => new Set(['1970-01-01']);
    context.logTouchesDate = (log, dateStr) => {
        const dayStart = Date.parse(dateStr + 'T00:00:00+08:00');
        return log.startTime < dayStart + 86400000 && log.endTime > dayStart;
    };
    context.formatDateHeaderLabel = () => '1970-01-01';
    context.getParallelDisplayRecords = () => [];
    context.renderMainLogTree = (_list, log) => { visible.push(log); };
    context.appendUnattachedParallelLogs = () => {};
    vm.runInContext(homeHistorySource, context);

    context.renderHomeHistory();

    assert.equal(visible.length, 3);
    assert.equal(new Set(visible.map((log) => log.id)).size, 3);
});

test('split keeps a scene activity inside its scene', () => {
    const parent = {
        id: 'scene-activity', startTime: 0, endTime: 7200000,
        l1: 'Life', l2: 'Rest', sceneActivity: true,
        sceneParentId: 'scene', sceneName: 'Trip'
    };
    const { context } = makeEditor(parent, 1800000, 3600000);

    context.drawerPick('Work', 'Meeting');

    assert.equal(context.logs[1].sceneActivity, true);
    assert.equal(context.logs[1].sceneParentId, 'scene');
    assert.equal(context.logs[1].sceneName, 'Trip');
    const visible = [];
    context.document = { createElement() { return { appendChild() {} }; } };
    context.getSceneContainerId = (log) => String(log.sceneRootId || log.id);
    context.applySceneNestTheme = () => {};
    context.createLogRow = (_wrap, log) => { visible.push(log); };
    vm.runInContext(sceneTreeSource, context);

    context.renderSceneActivityTree({ appendChild() {} }, { id: 'scene' }, context.logs, []);

    assert.equal(visible.length, 3);
});

test('parallel backfill also keeps its selected interval after closing', () => {
    const parent = { id: 'main', startTime: 0, endTime: 7200000, l1: 'Life', l2: 'Rest' };
    const { context } = makeEditor(parent, 1800000, 3600000);
    let selectedRange;
    context.pickerMode = 'parallel-backfill';
    context.snapTimeToRange = () => {};
    context.isTimeInParentRange = () => true;
    context._parallelCallback = (_l1, _l2, range) => { selectedRange = range; };

    context.drawerPick('Work', 'Meeting');

    assert.deepEqual([selectedRange.start, selectedRange.end], [1800000, 3600000]);
});

test('a stale picker tap cannot switch from split into recording another activity', () => {
    const parent = { id: 'main', startTime: 0, endTime: 7200000, l1: 'Life', l2: 'Rest' };
    const { context } = makeEditor(parent, 1800000, 3600000);
    let recorded = false;
    context.executeRecord = () => { recorded = true; };

    context.drawerPick('Work', 'Meeting', 'split');
    context.drawerPick('Life', 'Sleep', 'split');

    assert.equal(recorded, false);
    assert.equal(context.logs.length, 3);
    assert.deepEqual(Array.from(context.logs, (log) => log.l2), ['Rest', 'Meeting', 'Rest']);
});

test('split keeps each original activity name and reparents its parallel by interval', () => {
    const parent = { id: 'main', startTime: 0, endTime: 7200000, l1: 'Life', l2: 'Rest' };
    const { context } = makeEditor(parent, 1800000, 3600000);
    context.logs.push({ id: 'parallel', startTime: 3600000, endTime: 4200000,
        l1: 'Work', l2: 'Call', parallel: true, parentId: 'main' });

    context.drawerPick('Work', 'Meeting');

    const mains = context.logs.filter((log) => !log.parallel);
    const child = context.logs.find((log) => log.parallel);
    assert.deepEqual(Array.from(mains, (log) => log.l2), ['Rest', 'Meeting', 'Rest']);
    assert.equal(child.l2, 'Call');
    assert.equal(child.parentId, mains[2].id);
    assert.equal(new Set(context.logs.map((log) => log.id)).size, context.logs.length);
});

test('an edit confirmation keeps its selected category when another picker changes later', () => {
    const log = { id: 'one', startTime: 0, endTime: 3600000, l1: 'Life', l2: 'Rest', color: '#aaa' };
    let finish;
    const context = {
        editTarget: { source: 'logs', id: 'one' }, editOldL1: 'Work', editOldL2: 'Meeting',
        logs: [log], parallelHistory: [], current: null,
        parseTimeFromInput(prefix) { return prefix === 'es' ? 0 : 3600000; },
        applyEditedRange(_log, _start, _end, done) { finish = done; },
        getCat() { return { color: '#123456' }; },
        rememberInputAlias() {}, mergeAdjacentSameActivity() {}, renderAll() {},
        localStorage: { setItem() {} },
        document: { getElementById() { return { value: '', classList: { add() {} } }; } }
    };
    vm.createContext(context);
    vm.runInContext(confirmEditSource, context);

    context.confirmEdit();
    context.editOldL1 = 'Life';
    context.editOldL2 = 'Sleep';
    finish();

    assert.equal(log.l1, 'Work');
    assert.equal(log.l2, 'Meeting');
    assert.equal(log.color, '#123456');
});
