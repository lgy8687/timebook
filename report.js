/**
 * 报表沙盘 v1.4 — 双摘要同屏；环图左上角切换主线/并行
 */
(function () {
    const PERIOD_LABELS = { day: '日报', week: '周报', month: '月报', year: '年报' };

    let state = { period: 'month', chartView: 'main', legendMode: 'l1' };

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

    function getBundle(view) {
        const p = REPORT_DATA[state.period];
        return p ? p[view || state.chartView] : null;
    }

    function renderSummaryCards(elId, cards) {
        const box = document.getElementById(elId);
        box.innerHTML = (cards || []).map((c) => `
            <div class="card card-summary">
                <div class="icon">${c.icon}</div>
                <div class="num summary-value">${esc(c.value)}</div>
                <div class="lbl">${esc(c.label)}</div>
                <div class="sub">${esc(c.sub)}</div>
            </div>
        `).join('');
    }

    function render() {
        const periodData = REPORT_DATA[state.period];
        if (!periodData) return;

        const mainBundle = periodData.main;
        const parallelBundle = periodData.parallel;
        const chartBundle = state.chartView === 'main' ? mainBundle : parallelBundle;
        const periodName = PERIOD_LABELS[state.period];

        document.getElementById('bill-subtitle').innerHTML =
            `TimeBook · ${mainBundle.meta.title} · ${periodName} <span class="badge-sample">沙盘样本</span>`;

        renderSummaryCards('summary-main', mainBundle.summary);
        renderSummaryCards('summary-parallel', parallelBundle.summary);

        const total = chartBundle.l1.reduce((s, x) => s + x.hours, 0);
        const isMain = state.chartView === 'main';

        document.getElementById('structure-title').textContent = '时间结构';
        document.getElementById('chart-legend-hint').textContent = isMain
            ? '内环 = 分类 · 外环 = 活动'
            : '内环 = 并行活动 · 外环 = 叠加明细';

        renderSunburst(chartBundle.l1, chartBundle.l2, total);
        renderLegend(chartBundle.l1, chartBundle.l2, total, isMain);

        document.getElementById('insight-block').style.display =
            (state.period === 'month' || state.period === 'year') ? 'block' : 'none';

        document.getElementById('footer-note').textContent =
            chartBundle.meta.footnote + ' · 周一起算 · v1.4';

        syncToolbar();
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

    function renderLegend(l1, l2, total, isMain) {
        const l1Box = document.getElementById('legend-l1');
        const l2Box = document.getElementById('legend-l2');
        l1Box.innerHTML = l1.map((row) => legendRow(row.name, null, row.hours, row.color, total, row.name)).join('');
        l2Box.innerHTML = l2.map((row) => legendRow(row.name, row.l1, row.hours, row.color, total, row.l1)).join('');
        l1Box.style.display = state.legendMode === 'l1' ? 'block' : 'none';
        l2Box.style.display = state.legendMode === 'l2' ? 'block' : 'none';
        document.getElementById('btn-l1').classList.toggle('active', state.legendMode === 'l1');
        document.getElementById('btn-l2').classList.toggle('active', state.legendMode === 'l2');
        document.getElementById('btn-l1').textContent = isMain ? '分类' : '并行活动';
        document.getElementById('btn-l2').textContent = isMain ? '活动明细' : '叠加明细';

        document.querySelectorAll('.sunburst-legend .legend-item').forEach((el) => {
            el.addEventListener('mouseenter', () => highlightCat(el.dataset.cat));
            el.addEventListener('mouseleave', unhighlightCat);
        });
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

    function syncToolbar() {
        document.querySelectorAll('[data-period]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.period === state.period);
        });
        document.querySelectorAll('[data-chart]').forEach((btn) => {
            const on = btn.dataset.chart === state.chartView;
            btn.classList.toggle('active', on);
            btn.classList.toggle('chart-main', btn.dataset.chart === 'main');
            btn.classList.toggle('chart-parallel', btn.dataset.chart === 'parallel');
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

    window.setChartView = function (view) {
        state.chartView = view;
        render();
    };

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('[data-period]').forEach((btn) => {
            btn.addEventListener('click', () => setPeriod(btn.dataset.period));
        });
        document.querySelectorAll('[data-chart]').forEach((btn) => {
            btn.addEventListener('click', () => setChartView(btn.dataset.chart));
        });
        render();
    });
})();
