/**
 * 报表沙盘渲染 — 周期 × 视图（主线/并行）
 * 并入主页：getReportBundle(logs, period, view) 替换 REPORT_DATA 读取
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
        
        return items.map((item) => {
            const sweep = (item.hours / total) * 360;
            const path = arcPath(cx, cy, r0, r1, angle, angle + sweep);
            const seg = {
                path,
                cat: item[keyCat] || item.name,
                name: item.name,
                l1: item.l1,
                hours: item.hours,
                color: item.color,
                start: angle,
                end: angle + sweep
            };
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

    function getBundle() {
        const p = REPORT_DATA[state.period];
        if (!p) return null;
        return p[state.view] || null;
    }

    function render() {
        const bundle = getBundle();
        if (!bundle) return;

        const { meta, l1, l2, leaderboard } = bundle;
        const total = meta.totalHours || l1.reduce((s, x) => s + x.hours, 0);
        const periodName = PERIOD_LABELS[state.period];
        const viewName = VIEW_LABELS[state.view];

        document.getElementById('bill-title').textContent = '🧾 时间消费账单';
        document.getElementById('bill-subtitle').innerHTML =
            `TimeBook · ${meta.title} · ${meta.days} 天 · ${meta.records} 条记录 · <strong>${viewName}</strong>视图`;

        const cardPeriod = document.getElementById('card-period');
        const cardHours = document.getElementById('card-hours');
        cardPeriod.className = 'card card-period' + (state.view === 'parallel' ? ' view-parallel' : '');
        cardHours.className = 'card card-hours' + (state.view === 'parallel' ? ' view-parallel' : '');

        document.getElementById('card-period-num').innerHTML =
            `${meta.days}<span class="unit"> 天</span>`;
        document.getElementById('card-period-lbl').textContent = periodName + ' · 统计周期';
        document.getElementById('card-period-sub').textContent = meta.range;

        document.getElementById('card-hours-num').innerHTML =
            `${Math.round(meta.totalHours * 10) / 10}<span class="unit"> 小时</span>`;
        document.getElementById('card-hours-lbl').textContent = meta.totalLabel;
        document.getElementById('card-hours-sub').textContent = meta.sub;

        document.getElementById('structure-title').textContent =
            state.view === 'parallel' ? '并行结构（内外环）' : '主线结构（内外环）';

        renderSunburst(l1, l2, total);
        renderLegend(l1, l2, total);
        document.querySelector(".leaderboard h3").textContent =
            state.view === "parallel" ? "🏆 并行时间排行榜" : "🏆 时间排行榜";
        renderLeaderboard(leaderboard, total);

        const insight = document.getElementById('insight-block');
        insight.style.display = (state.period === 'month' || state.period === 'year') ? 'block' : 'none';

        document.getElementById('footer-note').textContent =
            meta.footnote + ' · 样本沙盘 · 周一起算';

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

    function renderLegend(l1, l2, total) {
        const l1Box = document.getElementById('legend-l1');
        const l2Box = document.getElementById('legend-l2');
        l1Box.innerHTML = l1.map((row) => legendRow(row.name, null, row.hours, row.color, total, row.name)).join('');
        l2Box.innerHTML = l2.map((row) => legendRow(row.name, row.l1, row.hours, row.color, total, row.l1)).join('');
        l1Box.style.display = state.legendMode === 'l1' ? 'block' : 'none';
        l2Box.style.display = state.legendMode === 'l2' ? 'block' : 'none';
        document.getElementById('btn-l1').classList.toggle('active', state.legendMode === 'l1');
        document.getElementById('btn-l2').classList.toggle('active', state.legendMode === 'l2');

        document.querySelectorAll('.legend-item').forEach((el) => {
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

    function renderLeaderboard(rows, total) {
        const box = document.getElementById('leaderboard-rows');
        const maxH = rows[0]?.hours || 1;
        const medals = ['#f59e0b', '#94a3b8', '#b45309'];
        box.innerHTML = rows.map((row, i) => {
            const rankCls = i < 3 ? 'top3' : '';
            const rankColor = i < 3 ? medals[i] : '';
            const w = Math.round((row.hours / maxH) * 100);
            return `<div class="lb-row">
                <span class="lb-rank ${rankCls}" style="color:${rankColor || ''}">${i + 1}</span>
                <span class="lb-dot" style="background:${row.color}"></span>
                <span class="lb-name">${esc(row.l2)} <span class="lb-cat-badge">· ${esc(row.l1)}</span></span>
                <div class="lb-bar-bg"><div class="lb-bar-fill" style="width:${w}%;background:${row.color}"></div></div>
                <span class="lb-hours">${fmtHours(row.hours)}</span>
                <span class="lb-pct">${pct(row.hours, total)}</span>
            </div>`;
        }).join('');
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

    function esc(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/"/g, '&quot;');
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
