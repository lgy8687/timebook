const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'backup.js'), 'utf8');

function storage(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        get length() { return data.size; },
        key(index) { return [...data.keys()][index] || null; },
        getItem(key) { return data.get(key) ?? null; },
        setItem(key, value) { data.set(key, value); },
        removeItem(key) { data.delete(key); },
        entries() { return Object.fromEntries(data); }
    };
}

function backupFunctions() {
    const context = { Date, Object, JSON, Array, Error };
    vm.createContext(context);
    vm.runInContext(source, context);
    return context;
}

test('exports all app data but no unrelated origin data', () => {
    const context = backupFunctions();
    const sourceStorage = storage({
        v9_logs: '[{"id":"main","startTime":1}]',
        v9_current: '{"id":"live","startTime":2}',
        v9_parallel_history: '[]',
        other_app_token: 'private'
    });

    const backup = context.collectTimebookBackup(sourceStorage);
    assert.equal(backup.data.v9_logs, sourceStorage.getItem('v9_logs'));
    assert.equal(backup.data.v9_current, sourceStorage.getItem('v9_current'));
    assert.equal(backup.data.v9_parallel_history, '[]');
    assert.equal('other_app_token' in backup.data, false);
});

test('valid backup restores records and removes stale app keys only', () => {
    const context = backupFunctions();
    const sourceStorage = storage({ v9_logs: '[{"id":"main","startTime":1}]', v9_cats: '[]' });
    const backup = context.parseTimebookBackup(JSON.stringify(context.collectTimebookBackup(sourceStorage)));
    const target = storage({ v9_logs: '[]', v9_old_setting: 'old', other_app_token: 'keep' });

    context.restoreTimebookBackup(backup, target);

    assert.equal(target.getItem('v9_logs'), sourceStorage.getItem('v9_logs'));
    assert.equal(target.getItem('v9_cats'), '[]');
    assert.equal(target.getItem('v9_old_setting'), null);
    assert.equal(target.getItem('other_app_token'), 'keep');
});

test('rejects a malformed backup before changing storage', () => {
    const context = backupFunctions();
    const target = storage({ v9_logs: '[{"id":"safe"}]' });
    const malformed = JSON.stringify({ format: 'timebook-backup', version: 1, data: { v9_logs: '{}' } });

    assert.throws(() => context.parseTimebookBackup(malformed));
    assert.equal(target.getItem('v9_logs'), '[{"id":"safe"}]');
});
