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
        mergeAdjacentSameActivity() {},
        renderAll() {},
        localStorage: { setItem() {} },
        document: { getElementById() { return { value: '' }; } },
        Number,
    };
    vm.createContext(context);
    vm.runInContext(drawerPickSource + '\n' + executeSplitSource, context);
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
