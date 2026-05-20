function openDevAppearance() {
    if (!DEV_PANEL_ENABLED) return;
    switchTab('dev');
    renderDevAppearancePanel();
}

function renderDevAppearancePanel() {
    const root = document.getElementById('dev-theme-sections');
    if (!root) return;
    const cfg = loadUiTheme();
    root.innerHTML = '';
    UI_THEME_SECTIONS.forEach(section => {
        const block = document.createElement('div');
        block.className = 'dev-theme-block';
        const title = document.createElement('h3');
        title.className = 'dev-theme-block-title';
        title.innerText = section.title;
        block.appendChild(title);
        const grid = document.createElement('div');
        grid.className = 'dev-theme-grid';
        section.fields.forEach(field => {
            grid.appendChild(buildDevThemeField(field, cfg));
        });
        block.appendChild(grid);
        root.appendChild(block);
    });
}

function buildDevThemeField(field, cfg) {
    const wrap = document.createElement('label');
    wrap.className = 'dev-theme-field';
    const lab = document.createElement('span');
    lab.className = 'dev-theme-field-label';
    lab.innerText = field.label;
    wrap.appendChild(lab);
    let input;
    if (field.type === 'color') {
        input = document.createElement('input');
        input.type = 'color';
        input.value = cfg[field.key] || UI_THEME_DEFAULTS[field.key];
    } else {
        input = document.createElement('input');
        input.type = 'number';
        input.min = field.min;
        input.max = field.max;
        input.value = cfg[field.key] ?? UI_THEME_DEFAULTS[field.key];
    }
    input.dataset.themeKey = field.key;
    input.addEventListener('input', onDevThemeInput);
    input.addEventListener('change', onDevThemeInput);
    wrap.appendChild(input);
    return wrap;
}

function onDevThemeInput(e) {
    const key = e.target.dataset.themeKey;
    if (!key) return;
    const field = UI_THEME_SECTIONS.flatMap(s => s.fields).find(f => f.key === key);
    const cfg = loadUiTheme();
    if (field.type === 'number') {
        cfg[key] = Number(e.target.value);
    } else {
        cfg[key] = e.target.value;
    }
    saveUiTheme(cfg);
    applyUiTheme(cfg);
    if (typeof renderAll === 'function') renderAll();
}

function devThemeReset() {
    if (!confirm('恢复全部外观为默认 v4.10？')) return;
    resetUiTheme();
    renderDevAppearancePanel();
    if (typeof renderAll === 'function') renderAll();
}

function devThemeExport() {
    const json = JSON.stringify(loadUiTheme(), null, 2);
    navigator.clipboard.writeText(json).then(() => alert('已复制主题 JSON')).catch(() => prompt('复制主题配置', json));
}

document.addEventListener('DOMContentLoaded', () => {
    const entry = document.getElementById('dev-appearance-entry');
    if (entry) entry.classList.toggle('hidden', !DEV_PANEL_ENABLED);
});
