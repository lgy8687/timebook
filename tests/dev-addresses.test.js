const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const test = require('node:test');

const root = path.join(__dirname, '..');
const inspector = fs.readFileSync(path.join(root, 'dev-inspector.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const app = fs.readFileSync(path.join(root, 'app.js'), 'utf8');
const report = fs.readFileSync(path.join(root, 'report.js'), 'utf8');
const registry = fs.readFileSync(path.join(root, 'docs/design-registry.md'), 'utf8');

function readRegistryArray(name) {
    const match = inspector.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n    \\]);`));
    assert.ok(match, `Unable to read ${name} from dev-inspector.js`);
    return vm.runInNewContext(match[1]);
}

function registeredTemplateCodes() {
    return new Set([...registry.matchAll(/^\| (C\d+) \|/gm)].map(match => match[1]));
}

test('B and Z addresses are unique and every Z has one registered parent B', () => {
    const blocks = readRegistryArray('blocks');
    const submodules = readRegistryArray('submodules');
    const blockCodes = blocks.map(([code]) => code);
    const submoduleCodes = submodules.map(([code]) => code);

    assert.equal(new Set(blockCodes).size, blockCodes.length, 'B code is registered more than once');
    assert.equal(new Set(submoduleCodes).size, submoduleCodes.length, 'Z code is registered more than once');
    assert.equal(blockCodes.some(code => submoduleCodes.includes(code)), false, 'A B code is incorrectly listed as a Z');
    for (const code of submoduleCodes) {
        const parentB = `B${code.match(/^Z(\d+)-/)[1]}`;
        assert.ok(blockCodes.includes(parentB), `${code} has no registered parent ${parentB}`);
    }
});

test('all C references resolve to a registered design template', () => {
    const templates = registeredTemplateCodes();
    for (const [code, , , contract] of [...readRegistryArray('blocks'), ...readRegistryArray('submodules')]) {
        if (contract) assert.ok(templates.has(contract), `${code} refers to missing ${contract}`);
    }
});

test('single-instance B selectors use unique static DOM IDs', () => {
    const blocks = readRegistryArray('blocks');
    for (const [code, , selector, , options = {}] of blocks) {
        if (options.repeatable) continue;
        const direct = selector.match(/^#([\w-]+)$/);
        const workflow = selector.match(/^#calendar-backfill-modal\[data-dev-address-block="(B\d+)"\] #(\w[\w-]*)$/);
        const stateScoped = selector.match(/^#([\w-]+)\[data-dev-address-block="(B\d+)"\]$/);
        assert.ok(direct || workflow || stateScoped, `${code} must use one unique ID selector or a declared workflow-scoped ID: ${selector}`);
        if (direct) {
            const count = [...html.matchAll(new RegExp(`\\bid=["']${direct[1]}["']`, 'g'))].length;
            assert.equal(count, 1, `${code} must point to one unique DOM id; found ${count}: ${selector}`);
        } else if (workflow) {
            assert.equal(workflow[1], code, `${code} selector is scoped to a different workflow`);
            for (const id of ['calendar-backfill-modal', workflow[2]]) {
                const count = [...html.matchAll(new RegExp(`\\bid=["']${id}["']`, 'g'))].length;
                assert.equal(count, 1, `${code} requires unique DOM id #${id}; found ${count}`);
            }
        } else {
            assert.equal(stateScoped[2], code, `${code} selector is scoped to a different rendered state`);
            assert.equal([...html.matchAll(new RegExp(`\\bid=["']${stateScoped[1]}["']`, 'g'))].length, 1,
                `${code} requires unique DOM id #${stateScoped[1]}`);
        }
    }
});

test('each backfill entry point has its own B and is mapped exactly once', () => {
    const blocks = readRegistryArray('blocks');
    const entryBlocks = Array.from(blocks).filter(([, , , , options]) => options?.entryPoint);
    const origins = entryBlocks.map(([, , , , options]) => options.origin);
    const owners = entryBlocks.map(([, , , , options]) => options.entryPoint);
    assert.equal(new Set(origins).size, origins.length, 'A backfill origin must map to one B');
    assert.equal(new Set(owners).size, owners.length, 'A B must have only one backfill entry point');
    const expected = entryBlocks.map(([code, , selector, , options]) => {
            assert.ok(selector.includes(`[data-dev-address-block="${code}"]`), `${code} selector does not scope its workflow`);
            return `${options.entryPoint}:${options.origin}`;
        }).sort();
    const mapMatch = app.match(/const BACKFILL_DEV_ADDRESS_BY_ORIGIN = Object\.freeze\((\{[\s\S]*?\})\);/);
    assert.ok(mapMatch, 'Backfill origin-to-B map is missing');
    const addressByOrigin = vm.runInNewContext(`(${mapMatch[1]})`);
    assert.deepEqual(Object.entries(addressByOrigin).map(([origin, code]) => `${code}:${origin}`).sort(),
        entryBlocks.map(([code, , , , options]) => `${code}:${options.origin}`).sort(),
        'Origin-to-B map must agree with the developer-address registry');
    const declarations = [...app.matchAll(/function\s+([\w$]+)\s*\([^)]*\)\s*\{/g)];
    const actual = [];
    for (const call of app.matchAll(/\bopenCalendarBackfill\(([^)]*)\)/g)) {
        if (/function\s+$/.test(app.slice(Math.max(0, call.index - 16), call.index))) continue;
        const owner = declarations.filter(item => item.index < call.index).at(-1)?.[1];
        const origin = call[1].match(/,\s*'([^']+)'\s*$/)?.[1];
        assert.ok(origin, `Call from ${owner} must explicitly name its workflow origin`);
        actual.push(`${owner}:${origin}`);
    }
    assert.deepEqual(actual.sort(), expected, 'Every modal entry call must have one explicit B/workflow mapping');
});

test('report timeline functional views have distinct, state-scoped B addresses and templates', () => {
    const blocks = readRegistryArray('blocks');
    const byCode = new Map(blocks.map(([code, , selector, contract]) => [code, { selector, contract }]));
    assert.deepEqual(byCode.get('B18'), { selector: '#timeline-card-a[data-dev-address-block="B18"]', contract: 'C23' });
    assert.deepEqual(byCode.get('B42'), { selector: '#timeline-card-b[data-dev-address-block="B42"]', contract: 'C23' });
    assert.deepEqual(byCode.get('B45'), { selector: '#timeline-card-a[data-dev-address-block="B45"]', contract: 'C24' });
    assert.match(report, /tl\.kind === 'day'[\s\S]*\? \(suffix === 'a' \? 'B18' : 'B42'\)[\s\S]*: tl\.kind === 'bars' \? 'B45'/,
        'Timeline rendering must map daily halves and period-composition bars to separate B addresses');
    assert.match(report, /delete card\.dataset\.devAddressBlock/,
        'Hidden or empty timeline cards must not keep a stale B address');
    assert.match(inspector, /\[data-dev-address-kind="timeline"\]\[data-dev-block-code\][\s\S]*element\.dataset\.devBlockCode === element\.dataset\.devAddressBlock[\s\S]*dev-inspector-badge--block/,
        'Developer mode must replace the old B badge when a reused card changes functional view');
    assert.match(inspector, /const parentBlock = `B\$\{code\.match\(\/\^Z\(\\d\+\)-\//,
        'Submodule display must derive and enforce its parent B when a workflow modal is active');
    assert.match(html, /id="timeline-card-a"[^>]*data-dev-address-kind="timeline"/);
    assert.match(html, /id="timeline-card-b"[^>]*data-dev-address-kind="timeline"/);
});
