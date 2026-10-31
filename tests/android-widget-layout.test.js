const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('widget layouts use only views supported by Android RemoteViews', () => {
    const allowed = new Set(['LinearLayout', 'FrameLayout', 'RelativeLayout', 'GridLayout', 'TextView', 'Button', 'ImageView', 'ImageButton', 'Chronometer', 'ProgressBar', 'TextClock', 'AnalogClock', 'ListView', 'GridView', 'StackView', 'ViewFlipper', 'AdapterViewFlipper', 'ViewStub']);
    for (const name of ['main_widget.xml', 'main_widget_row.xml']) {
        const source = fs.readFileSync(path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res', 'layout', name), 'utf8');
        for (const match of source.matchAll(/<([A-Za-z][\w.]*)\b/g)) {
            assert.ok(allowed.has(match[1]), `${name}: unsupported RemoteViews element ${match[1]}`);
        }
    }
});
