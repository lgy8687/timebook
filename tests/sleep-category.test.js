const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const source = app.slice(app.indexOf('function editS('), app.indexOf('\nfunction delS(', app.indexOf('function editS(')));

test('moving system sleep preserves its identity and updates historical and active references', () => {
    const life = { id: 1, name: '生活', subs: ['睡觉', '洗漱'], systemSleep: true };
    const rest = { id: 2, name: '休息', subs: [], color: '#8899aa' };
    const sleep = () => ({ l1: '生活', l2: '睡觉' });
    const data = { logs: [sleep()], unlocatedLogs: [sleep()], parallelHistory: [sleep()], current: sleep(), parallelCurrent: sleep(), shortcuts: [sleep()], parallelShortcuts: [sleep()] };
    const saved = {};
    const ctx = {
        ...data, cats: [life, rest], inputAliases: { bedtime: sleep() },
        isSystemSleep: (cat, name) => !!cat.systemSleep && name === '睡觉',
        openReportChoiceGrid(_title, _choices, _selected, cb) { cb('2'); },
        showCategoryPicker(_title, cb) { cb(null); },
        safeJSON: () => [], setSubIcon() {}, saveAll() {},
        localStorage: { setItem(k, v) { saved[k] = v; } },
        showConfirm() { assert.fail('unexpected warning'); },
    };
    vm.createContext(ctx);
    vm.runInContext(source, ctx);
    ctx.editS(1, '睡觉');
    assert.equal(life.systemSleep, undefined);
    assert.equal(rest.systemSleep, true);
    assert.deepEqual(life.subs, ['洗漱']);
    assert.deepEqual(rest.subs, ['睡觉']);
    for (const record of [data.logs[0], data.unlocatedLogs[0], data.parallelHistory[0], data.current, data.parallelCurrent, data.shortcuts[0], data.parallelShortcuts[0], ctx.inputAliases.bedtime]) {
        assert.equal(record.l1, '休息');
        assert.equal(record.l2, '睡觉');
    }
    assert.equal(JSON.parse(saved.v9_unlocated_logs)[0].l1, '休息');
});
