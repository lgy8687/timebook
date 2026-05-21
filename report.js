/**
 * 报表 v1.6 — 主页嵌入 + 沙盘；日报可走真实日志
 */
(function () {
    const PERIOD_LABELS = { day: '日报', week: '周报', month: '月报', year: '年报' };
    const REPORT_VERSION = 'v1.6';

    let state = { period: 'day', chartView: 'main', legendMode: 'l1' };
    let getPeriodData = null;
    let eventsBound = false;

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

    function resolvePeriodData() {
        if (getPeriodData) {
            const live = getPeriodData(state.period);
            if (live) return live;
        }
        return REPORT_DATA[state.period] || null;
    }

    function renderSummaryRow(elId, view, periodData) {
        const slots = getReportSummarySlots(view);
        const box = document.getElementById(elId);
        if (!box) return;
        box.innerHTML = slots.map((id) => {
            const m = resolveReportMetric(id, periodData, view);
            return `<div class="stat-indigo">
                <div class="stat-indigo-value">${esc(m.value)}</div>
                <div class="stat-indigo-label">${esc(m.label)}</div>
            </div>`;
        }).join('');
    }

    function renderTimeline(tl) {
        const card = document.getElementById('timeline-card');
        const titleEl = document.getElementById('timeline-title');
        const hintEl = document.getElementById('timeline-hint');
        const body = document.getElementById('timeline-body');
        const scaleEl = document.getElementById('timeline-scale');
        if (!card || !body) return;

        if (!tl) {
            card.classList.add('hidden');
            return;
        }
        card.classList.remove('hidden');
        titleEl.textContent = tl.title || '时间分布';
        hintEl.textContent = tl.hint || '';

        if (tl.kind === 'day') {
            let segHtml = '';
            (tl.segments || []).forEach((s) => {
                const w = Math.max(s.width, 0.25);
                segHtml += `<button type="button" class="timeline-block" style="left:${s.left}%;width:${w}%;background:${s.color}" title="${esc(s.title)}">${s.width > 7 ? esc(s.label) : ''}</button>`;
            });
            if (tl.nowPct != null) {
                segHtml += `<div class="timeline-now" style="left:${tl.nowPct}%"></div>`;
            }
            body.innerHTML = `<div class="timeline-track">${segHtml}</div>`;
            scaleEl.innerHTML = (tl.scale || []).map((t) => `<span>${t}</span>`).join('');
            scaleEl.classList.remove('hidden');
        } else if (tl.kind === 'bars') {
            const maxH = Math.max(...(tl.bars || []).map((b) => b.hours), 1);
            body.innerHTML = `<div class="timeline-bars">${(tl.bars || []).map((b) => {
                const w = Math.round((b.hours / maxH) * 100);
                return `<div class="timeline-bar-row">
                    <span class="timeline-bar-label">${esc(b.label)}</span>
                    <div class="timeline-bar-track"><div class="timeline-bar-fill" style="width:${w}%;background:${b.color}"></div></div>
                    <span class="timeline-bar-val">${b.hours}h</span>
                </div>`;
            }).join('')}</div>`;
            scaleEl.classList.add('hidden');
            scaleEl.innerHTML = '';
        }
    }

    function render() {
        const root = document.getElementById('summary-main');
        if (!root) return;

        const periodData = resolvePeriodData();
        if (!periodData) return;

        const mainBundle = periodData.main;
        const parallelBundle = periodData.parallel;
        const chartBundle = state.chartView === 'main' ? mainBundle : parallelBundle;
        const periodName = PERIOD_LABELS[state.period];
        const isLive = !!periodData._live;
        const badge = isLive
            ? '<span class="badge-live">当日记录</span>'
            : '<span class="badge-sample">沙盘样本</span>';

        const verEl = document.getElementById('report-version');
        if (verEl) verEl.textContent = REPORT_VERSION;

        const sub = document.getElementById('bill-subtitle');
        if (sub) {
            sub.innerHTML = `TimeBook · ${esc(mainBundle.meta.title)} · ${periodName} ${badge}`;
        }

        renderSummaryRow('summary-main', 'main', periodData);
        renderSummaryRow('summary-parallel', 'parallel', periodData);
        renderTimeline(periodData.timeline);

        const total = chartBundle.l1.reduce((s, x) => s + x.hours, 0);
        const isMain = state.chartView === 'main';

        document.getElementById('structure-title').textContent = '时间结构';
        document.getElementById('chart-legend-hint').textContent = isMain
            ? '内环 = 活动分类 · 外环 = 活动'
            : '内环 = 并行活动 · 外环 = 叠加明细';

        renderSunburst(chartBundle.l1, chartBundle.l2, total);
        renderLegend(chartBundle.l1, chartBundle.l2, total, isMain);

        const insight = document.getElementById('insight-block');
        if (insight) insight.style.display = 'block';

        const foot = document.getElementById('footer-note');
        if (foot) {
            foot.textContent = chartBundle.meta.footnote + ' · 周一起算 · ' + REPORT_VERSION;
        }

        syncToolbar();
    }

    function renderSunburst(l1, l2, total) {
        const svg = document.getElementById('sunburst-svg');
        if (!svg) return;
        const cx = 100, cy = 100;
        const inner = buildRingSegments(l1, cx, cy, 28, 50, total || 1, 'name');
        const outer = buildRingSegments(l2, cx, cy, 54, 80, total || 1, 'l1');

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
        document.getElementById('btn-l1').textContent = isMain ? '活动分类' : '并行活动';
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
        document.querySelectorAll('#page-report [data-period], #report-standalone [data-period]').forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.period === state.period);
        });
        document.querySelectorAll('#page-report [data-chart], #report-standalone [data-chart]').forEach((btn) => {
            const on = btn.dataset.chart === state.chartView;
            btn.classList.toggle('active', on);
            btn.classList.toggle('chart-main', btn.dataset.chart === 'main');
            btn.classList.toggle('chart-parallel', btn.dataset.chart === 'parallel');
        });
    }

    function bindEvents() {
        if (eventsBound) return;
        eventsBound = true;
        document.querySelectorAll('[data-period]').forEach((btn) => {
            btn.addEventListener('click', () => setPeriod(btn.dataset.period));
        });
        document.querySelectorAll('[data-chart]').forEach((btn) => {
            btn.addEventListener('click', () => setChartView(btn.dataset.chart));
        });
    }

    window.showTip = function (e, title, val1, val2) {
        const tip = document.getElementById('tip');
        if (!tip) return;
        tip.innerHTML = `<div class="tip-title">${title}</div><div class="tip-row"><span>${val1}</span><span>${val2}</span></div>`;
        tip.className = 'show';
        positionTip(e);
    };

    window.showTipOuter = function (e, sub, cat, val1, val2) {
        const tip = document.getElementById('tip');
        if (!tip) return;
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
        const tip = document.getElementById('tip');
        if (tip) tip.className = '';
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

    window.initReportBillboard = function (opts) {
        opts = opts || {};
        if (opts.defaultPeriod) state.period = opts.defaultPeriod;
        if (opts.getPeriodData) getPeriodData = opts.getPeriodData;
        bindEvents();
        render();
    };

    window.renderReportBillboard = function () {
        render();
    };

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('summary-main')) return;
        if (document.body.id === 'report-standalone') {
            state.period = 'month';
            bindEvents();
            render();
        }
    });
})();
