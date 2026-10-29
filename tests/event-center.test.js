const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const app = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const source = app.slice(app.indexOf('function buildEventReport('), app.indexOf('\nfunction buildLiveReportDay(', app.indexOf('function buildEventReport(')));

test('event statistics count occurrences and distinct days, preserving date-only status', () => {
    const day = 86400000, start = Date.parse('2026-10-01T00:00:00Z');
    const context = {
        eventRecords: [
            { typeId: 'water', occurredAt: start + 1000, count: 2 },
            { typeId: 'water', occurredAt: start + day, count: 3, dateOnly: true },
            { typeId: 'water', occurredAt: start + 3 * day, count: 8 },
        ],
        eventTypeById: () => ({ name: '喝水', icon: '💧', color: '#0ea5e9' }),
        formatBeijingDate: ms => new Date(ms).toISOString().slice(0, 10),
    };
    vm.createContext(context);
    vm.runInContext(source, context);
    const report = context.buildEventReport(start, start + 2 * day, 'range');
    assert.equal(report.total, 5);
    assert.equal(report.activeDays, 2);
    assert.equal(report.entries[0].days, 2);
    assert.equal(report.entries[0].latestDateOnly, true);
});
