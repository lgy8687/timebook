/**
 * 报表沙盘 v1.2 — 主线/并行同层切换；并行=叠在主线（方案 B）
 */
(function () {
    const PERIOD_LABELS = { day: '日报', week: '周报', month: '月报', year: '年报' };
    const VIEW_LABELS = { main: '主线', parallel: '并行' };

    let state = { period: 'month', view: 'main', legendMode: 'l1' };

    function polar(cx, cy, r, deg) {
        const rad = ((deg - 90) * Math.PI) / 180;
        return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    }

    function arcPath(cx, cy, r0, r1, a0, a1) {
        if (a1 - a0 >= 360) a1 = a0 + 359.99;
        const p0s = polar(cx, cy, r0, a0);
        const p0e = polar(cx, cy, r0, a1);
        const p1s = polar(cx, cy, r1, a0);
        const p1e = polar(cx, cy, r1, a1);
        const large = a1 - a0 <= 180 ? 0 : 1;
        return [
            'M', p1s.x, p1s.y,
            'A', r1, r1, 0, large, 1, p1e.x, p1e.y,
            'L', p0e.x, p0e.y,
            'A', r0, r0, 0, large, 0, p0s.x, p0s.y,
            'Z'
        ].join(' ');
    }

    function buildRingSegments(items, cx, cy, r0, r1, total, keyCat) {
        let angle = 0;
        return items.filter((item) => item.hours > 0).map((item) => {
            const sweep = (item.hours / total) * 360;
            const path = arcPath(cx, cy, r0, r1, angle, angle + sweep);
            const seg = { path, cat: item[keyCat] || item.name, name: item.name, l1: item.l1, hours: item.hours, color: item.color };
            angle += sweep;
            return seg;
        });
    }

    function fmtHours(h) {
        return (Math.round(h * 10) / 10) + 'h';
    }

    function pct(h, total) {
        if (!total) return '0%';
        return (Math.round((h / total) * 1000) / 10) + '%';
    }

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
    }

    function getBundle() {
        const p = REPORT_DATA[state.period];
        return p ? p[state.view] : null;
    }

    function render() {
        const bundle = getBundle();
        if (!bundle) return;

        const viewName = VIEW_LABELS[state.view];
        const periodName = PERIOD_LABELS[state.period];

        document.getElementById('bill-subtitle').innerHTML =
            `TimeBook · ${bundle.meta.title} · <strong>${viewName}</strong> · ${periodName} <span class="badge-sample">沙盘样本</span>`;

        renderSummary(bundle.summary);
        toggleStructurePanels();

        if (state.view === 'main') {
            const total = bundle.l1.reduce((s, x) => s + x.hours, 0);
            document.getElementById('structure-title').textContent = '主线结构（内外环）';
            renderSunburst(bundle.l1, bundle.l2, total);
            renderMainLegend(bundle.l1, bundle.l2, total);
        } else {
            document.getElementById('structure-title').textContent = '并行叠在主线（方案 B）';
            renderOverlay(bundle.overlay);
            renderParallelLegend(bundle.activityLegend, bundle.overlay);
        }

        const insight = document.getElementById('insight-block');
        insight.style.display = (state.period === 'month' || state.period === 'year') ? 'block' : 'none';

        document.getElementById('footer-note').textContent =
            bundle.meta.footnote + ' · 周一起算 · v1.2';

        syncToolbar();
    }

    function renderSummary(cards) {
        const box = document.getElementById('summary-cards');
        box.innerHTML = (cards || []).map((c) => `
            <div class="card card-summary">
                <div class="icon">${c.icon}</div>
                <div class="num summary-value">${esc(c.value)}</div>
                <div class="lbl">${esc(c.label)}</div>
                <div class="sub">${esc(c.sub)}</div>
            </div>
        `).join('');
    }

    function toggleStructurePanels() {
        const isMain = state.view === 'main';
        document.getElementById('panel-main').classList.toggle('hidden', !isMain);
        document.getElementById('panel-parallel').classList.toggle('hidden', isMain);
    }

    function renderSunburst(l1, l2, total) {
        const svg = document.getElementById('sunburst-svg');
        const cx = 100, cy = 100;
        const inner = buildRingSegments(l1, cx, cy, 28, 50, total, 'name');
        const outer = buildRingSegments(l2, cx, cy, 54, 80, total, 'l1');

        let html = '';
        inner.forEach((s) => {
            html += `<path d="${s.path}" fill="${s.color}" fill-opacity=".88" stroke="#fff" stroke-width="1" class="inner-seg" data-cat="${esc(s.cat)}"
                data-title="${esc(s.name)}" data-hours="${fmtHours(s.hours)}" data-pct="${pct(s.hours, total)}"/>`;
        });
        outer.forEach((s) => {
            html += `<path d="${s.path}" fill="${s.color}" fill-opacity=".78" stroke="#fff" stroke-width=".5" class="outer-seg" data-cat="${esc(s.l1)}"
                data-title="${esc(s.name)}" data-sub="${esc(s.l1)}" data-hours="${fmtHours(s.hours)}" data-pct="${pct(s.hours, total)}"/>`;
        });
        const centerVal = Math.round(total * 10) / 10;
        html += `<circle cx="100" cy="100" r="26" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>`;
        html += `<text x="100" y="96" text-anchor="middle" fill="#1e293b" font-size="17" font-weight="800">${centerVal}</text>`;
        html += `<text x="100" y="112" text-anchor="middle" fill="#94a3b8" font-size="9" font-weight="700">小时</text>`;
        svg.innerHTML = html;

        svg.querySelectorAll('.inner-seg').forEach(bindSegTip);
        svg.querySelectorAll('.outer-seg').forEach((el) => {
            el.addEventListener('mouseenter', (e) => showTipOuter(e, el.dataset.title, el.dataset.sub, el.dataset.hours, el.dataset.pct));
            el.addEventListener('mouseleave', hideTip);
        });
    }

    function bindSegTip(el) {
        el.addEventListener('mouseenter', (e) => showTip(e, el.dataset.title, el.dataset.hours, el.dataset.pct));
        el.addEventListener('mouseleave', hideTip);
    }

    function renderMainLegend(l1, l2, total) {
        const l1Box = document.getElementById('legend-l1');
        const l2Box = document.getElementById('legend-l2');
        l1Box.innerHTML = l1.map((row) => legendRow(row.name, null, row.hours, row.color, total, row.name)).join('');
        l2Box.innerHTML = l2.map((row) => legendRow(row.name, row.l1, row.hours, row.color, total, row.l1)).join('');
        l1Box.style.display = state.legendMode === 'l1' ? 'block' : 'none';
        l2Box.style.display = state.legendMode === 'l2' ? 'block' : 'none';
        document.getElementById('btn-l1').classList.toggle('active', state.legendMode === 'l1');
        document.getElementById('btn-l2').classList.toggle('active', state.legendMode === 'l2');
        bindLegendHighlight();
    }

    function legendRow(name, l1, hours, color, total, cat) {
        const label = l1 ? `${l1} · <span class="legend-sub">${name}</span>` : name;
        return `<div class="legend-item" data-cat="${esc(cat)}">
            <span class="legend-dot" style="background:${color}"></span>
            <span class="legend-name">${label}</span>
            <span class="legend-val">${fmtHours(hours)}</span>
            <span class="legend-pct">${pct(hours, total)}</span>
        </div>`;
    }

    function bindLegendHighlight() {
        document.querySelectorAll('#panel-main .legend-item').forEach((el) => {
            el.addEventListener('mouseenter', () => highlightCat(el.dataset.cat));
            el.addEventListener('mouseleave', unhighlightCat);
        });
    }

    function renderOverlay(rows) {
        const box = document.getElementById('overlay-chart');
        const maxMain = Math.max(...rows.map((r) => r.mainHours), 1);
        box.innerHTML = rows.map((row) => {
            const mainW = Math.round((row.mainHours / maxMain) * 100);
            const paraPctOfMain = row.mainHours ? (row.parallelHours / row.mainHours) * 100 : 0;
            const paraW = Math.min(Math.round(paraPctOfMain), 100);
            let stackHtml = '';
            let left = 0;
            row.stacks.forEach((st) => {
                const w = row.parallelHours ? (st.hours / row.parallelHours) * paraW : 0;
                stackHtml += `<span class="overlay-stack-seg" style="left:${left}%;width:${w}%;background:${st.color}" title="${esc(st.name)} ${fmtHours(st.hours)}"></span>`;
                left += w;
            });
            const penet = row.mainHours ? Math.round((row.parallelHours / row.mainHours) * 100) : 0;
            return `<div class="overlay-row">
                <div class="overlay-label">
                    <span class="overlay-dot" style="background:${row.color}"></span>
                    <span class="overlay-name">${esc(row.mainL1)}</span>
                    <span class="overlay-meta">主线 ${fmtHours(row.mainHours)} · 叠 +${fmtHours(row.parallelHours)} (${penet}%)</span>
                </div>
                <div class="overlay-track">
                    <div class="overlay-main-bar" style="width:${mainW}%;background:${row.color}22;border-color:${row.color}55"></div>
                    <div class="overlay-para-layer" style="width:${mainW}%">
                        ${stackHtml}
                    </div>
                </div>
            </div>`;
        }).join('');
    }

    function renderParallelLegend(activities, overlay) {
        const box = document.getElementById('legend-parallel');
        const totalPara = activities.reduce((s, a) => s + a.hours, 0);
        document.getElementById('parallel-legend-hint').textContent =
            '并行活动（样本）· 色块叠在对应主线时段上';
        box.innerHTML = activities.map((a) => `
            <div class="legend-item">
                <span class="legend-dot" style="background:${a.color}"></span>
                <span class="legend-name">${esc(a.name)}</span>
                <span class="legend-val">${fmtHours(a.hours)}</span>
                <span class="legend-pct">${pct(a.hours, totalPara)}</span>
            </div>
        `).join('');

        const topHost = overlay.reduce((best, r) => (r.parallelHours > (best?.parallelHours || 0) ? r : best), null);
        document.getElementById('overlay-top-host').textContent = topHost
            ? `并行最多叠在：${topHost.mainL1}（+${fmtHours(topHost.parallelHours)}）`
            : '';
    }

    function syncToolbar() {
        document.querySelectorAll('[data-period]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.period === state.period);
        });
        document.querySelectorAll('[data-view]').forEach((btn) => {
            const on = btn.dataset.view === state.view;
            btn.classList.toggle('active', on);
            btn.classList.toggle('view-main', btn.dataset.view === 'main');
            btn.classList.toggle('view-parallel', btn.dataset.view === 'parallel');
        });
    }

    window.showTip = function (e, title, val1, val2) {
        const tip = document.getElementById('tip');
        tip.innerHTML = `<div class="tip-title">${title}</div><div class="tip-row"><span>${val1}</span><span>${val2}</span></div>`;
        tip.className = 'show';
        positionTip(e);
    };

    window.showTipOuter = function (e, sub, cat, val1, val2) {
        const tip = document.getElementById('tip');
        tip.innerHTML = `<div class="tip-title">${sub}</div><div class="tip-sub">${cat}</div><div class="tip-row"><span>${val1}</span><span>${val2}</span></div>`;
        tip.className = 'show';
        positionTip(e);
    };

    function positionTip(e) {
        const tip = document.getElementById('tip');
        const r = e.target.getBoundingClientRect();
        tip.style.left = Math.min(r.left + r.width / 2 - 60, window.innerWidth - 230) + 'px';
        tip.style.top = Math.max(r.top - 48, 8) + 'px';
    }

    window.hideTip = function () {
        document.getElementById('tip').className = '';
    };

    window.highlightCat = function (cat) {
        document.querySelectorAll('.inner-seg, .outer-seg').forEach((el) => {
            el.style.fillOpacity = el.dataset.cat === cat ? '1' : '0.12';
        });
    };

    window.unhighlightCat = function () {
        document.querySelectorAll('.inner-seg, .outer-seg').forEach((el) => {
            el.style.fillOpacity = '';
        });
    };

    window.setLegendMode = function (mode) {
        state.legendMode = mode;
        render();
    };

    window.setPeriod = function (period) {
        state.period = period;
        render();
    };

    window.setView = function (view) {
        state.view = view;
        render();
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-period]').forEach((btn) => {
            btn.addEventListener('click', () => setPeriod(btn.dataset.period));
        });
        document.querySelectorAll('[data-view]').forEach((btn) => {
            btn.addEventListener('click', () => setView(btn.dataset.view));
        });
        render();
    });
})();
