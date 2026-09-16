/**
 * 报表 v2.6 — 真实时刻场景弧与高区分活动色
 */
(function () {
    const PERIOD_LABELS = { day: '日报', week: '周报', month: '月报', year: '年报' };
    const REPORT_VERSION = 'v2.6';

    let state = {
        period: 'day',
        chartView: 'main',
        legendMode: 'l1',
        summaryModes: {
            main: localStorage.getItem('v9_report_summary_view_main') || 'live',
            parallel: localStorage.getItem('v9_report_summary_view_parallel') || 'live',
        },
        eventMode: localStorage.getItem('v9_report_event_mode') || 'count',
    };
    let getPeriodData = null;
    let eventsBound = false;
    const REPORT_COLORS = ['#2563eb', '#f97316', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4', '#eab308', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1', '#84cc16'];
    const ACTIVITY_COLORS = ['#2563eb', '#f97316', '#0f9f8c', '#8b5cf6', '#dc2626', '#ca8a04', '#0891b2', '#c026d3', '#65a30d', '#4f46e5', '#be123c', '#0f766e'];

    function colorForKey(key, fallback) {
        const text = String(key || fallback || '');
        let hash = 0;
        for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
        return REPORT_COLORS[Math.abs(hash) % REPORT_COLORS.length];
    }

    function reportColor(value, fallback) {
        const color = String(value || '').trim();
        if (/^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) return color;
        if (/^(?:rgb|rgba|hsl|hsla)\([\d\s.,%]+\)$/i.test(color)) return color;
        return colorForKey(fallback, fallback);
    }

    function buildActivityColors(items) {
        const names = [...new Set(items.map((item) => item.name).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
        const colors = new Map();
        names.forEach((name, index) => {
            colors.set(name, name === '自由时间' ? '#ffffff' : ACTIVITY_COLORS[index % ACTIVITY_COLORS.length]);
        });
        return colors;
    }

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

    function buildRingSegments(items, cx, cy, r0, r1, total, keyCat, useItemColor) {
        let angle = 0;
        return items.filter((item) => item.hours > 0).map((item) => {
            const sweep = (item.hours / total) * 360;
            const path = arcPath(cx, cy, r0, r1, angle, angle + sweep);
            const seg = {
                path,
                cat: item[keyCat] || item.name,
                name: item.name,
                l1: item.l1,
                hours: item.hours,
                color: useItemColor ? reportColor(item.color, item.name) : colorForKey(`${item.l1 || ''}|${item.name}`, item.color),
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
        return typeof REPORT_DATA !== 'undefined' ? REPORT_DATA[state.period] || null : null;
    }

    function resolveSummaryPeriodData(view, fallback) {
        if (getPeriodData) {
            const data = getPeriodData(state.period, { summaryMode: state.summaryModes[view] || 'live' });
            if (data) return data;
        }
        return fallback;
    }

    function syncSummaryModeButtons() {
        document.querySelectorAll('.summary-view-btn').forEach((button) => {
            const selected = state.summaryModes[button.dataset.summaryView] === button.dataset.summaryMode;
            button.classList.toggle('is-active', selected);
            button.setAttribute('aria-pressed', String(selected));
        });
    }

    function renderSummaryRow(elId, view, periodData) {
        const slots = getReportSummarySlots(view, state.period);
        const box = document.getElementById(elId);
        if (!box) return;
        box.innerHTML = slots.map((slot) => {
            const m = resolveReportMetric(slot, periodData, view);
            return `<div class="stat-indigo">
                <div class="stat-indigo-value">${esc(m.value)}</div>
                <div class="stat-indigo-label">${esc(m.label)}</div>
            </div>`;
        }).join('');
    }

    function formatEventClock(ms) {
        const date = new Date(ms + 8 * 60 * 60 * 1000);
        return `${String(date.getUTCHours()).padStart(2, '0')}:${String(date.getUTCMinutes()).padStart(2, '0')}`;
    }

    function renderEventReport(eventData) {
        const block = document.getElementById('event-report-block');
        const box = document.getElementById('event-report-content');
        if (!block || !box) return;
        const data = eventData || { total: 0, activeDays: 0, entries: [] };
        document.querySelectorAll('.event-mode-btn').forEach((button) => {
            const active = button.dataset.eventMode === state.eventMode;
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
        });
        if (!data.entries.length) {
            box.innerHTML = '<div class="event-report-empty">这个周期还没有事件记录</div>';
            return;
        }
        const mode = state.eventMode;
        const label = mode === 'days' ? '发生天数' : '记录次数';
        const total = mode === 'days' ? data.activeDays : data.total;
        box.innerHTML = `<div class="event-report-summary"><span>${esc(label)}</span><strong>${esc(String(total))}</strong></div><div class="event-report-list">${data.entries.map((item) => {
            const value = mode === 'days' ? item.days : item.count;
            const suffix = mode === 'days' ? '天' : '次';
            const detail = data.period === 'day' && item.latest ? `最近 ${formatEventClock(item.latest)}` : `${item.count} 次 · ${item.days} 天`;
            return `<div class="event-report-row"><span class="event-report-dot" style="background:${esc(reportColor(item.color, item.name))}"></span><span class="event-report-icon">${esc(item.icon)}</span><span class="event-report-name">${esc(item.name)}</span><span class="event-report-detail">${esc(detail)}</span><strong>${esc(String(value))}${suffix}</strong></div>`;
        }).join('')}</div>`;
    }

    function renderTimelineHalf(tl, suffix, fromPct, toPct, title) {
        const card = document.getElementById('timeline-card-' + suffix);
        const titleEl = document.getElementById('timeline-title-' + suffix);
        const hintEl = document.getElementById('timeline-hint-' + suffix);
        const body = document.getElementById('timeline-body-' + suffix);
        const scaleEl = document.getElementById('timeline-scale-' + suffix);
        if (!card || !body) return;

        if (!tl) {
            card.classList.add('hidden');
            return;
        }
        card.classList.remove('hidden');
        titleEl.textContent = title || tl.title || '时间分布';
        hintEl.textContent = tl.hint || '';

        if (tl.kind === 'day') {
            let segHtml = '';
            const labels = [];
            (tl.segments || []).forEach((s) => {
                const segStart = Math.max(fromPct, s.left);
                const segEnd = Math.min(toPct, s.left + s.width);
                if (segEnd <= segStart) return;
                const left = ((segStart - fromPct) / (toPct - fromPct)) * 100;
                const width = ((segEnd - segStart) / (toPct - fromPct)) * 100;
                const w = Math.max(width, 0.35);
                segHtml += `<button type="button" class="timeline-block" style="left:${left}%;width:${w}%;background:${colorForKey(s.key || s.label, s.color)}" title="${esc(s.title)}"></button>`;
                labels.push({ label: s.label, title: s.title, left: left + width / 2 });
            });
            if (tl.nowPct != null && tl.nowPct >= fromPct && tl.nowPct <= toPct) {
                const nowLeft = ((tl.nowPct - fromPct) / (toPct - fromPct)) * 100;
                segHtml += `<div class="timeline-now" style="left:${nowLeft}%"></div>`;
            }
            labels.sort((a, b) => a.left - b.left);
            let lastRight = -Infinity;
            labels.forEach((item) => {
                const row = item.left - 12 < lastRight ? 1 : 0;
                item.row = row;
                lastRight = item.left + 12;
            });
            const labelHtml = labels.map((item) => `<span class="timeline-callout timeline-callout-row-${item.row}" style="left:${item.left}%" title="${esc(item.title)}">${esc(item.label)}</span>`).join('');
            body.innerHTML = `<div class="timeline-stage"><div class="timeline-track">${segHtml}</div><div class="timeline-callouts">${labelHtml}</div></div>`;
            const labelsForHalf = suffix === 'a' ? ['00:00', '03:00', '06:00', '09:00', '12:00'] : ['12:00', '15:00', '18:00', '21:00', '24:00'];
            scaleEl.innerHTML = labelsForHalf.map((t) => `<span>${t}</span>`).join('');
            scaleEl.classList.remove('hidden');
        } else if (tl.kind === 'bars') {
            body.innerHTML = `<div class="timeline-bars">${(tl.bars || []).map((b) => {
                return `<div class="timeline-bar-row">
                    <span class="timeline-bar-label">${esc(b.label)}</span>
                    <div class="timeline-bar-track">${(b.segments || []).map((s) => `<span class="timeline-bar-segment" style="width:${Math.max(0, s.width)}%;background:${reportColor(s.color, s.l1 || s.name)}" title="${esc(s.title || s.name)}"></span>`).join('')}</div>
                    <span class="timeline-bar-val">${esc(String(b.hours))}h</span>
                </div>`;
            }).join('')}</div>`;
            scaleEl.classList.add('hidden');
            scaleEl.innerHTML = '';
        }
    }

    function render() {
        const root = document.getElementById('page-report');
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

        const periodic = state.period === 'week' || state.period === 'month';
        document.getElementById('summary-block-main')?.classList.toggle('hidden', !periodic);
        document.getElementById('summary-block-parallel')?.classList.toggle('hidden', !periodic);
        if (periodic) {
            renderSummaryRow('summary-main', 'main', resolveSummaryPeriodData('main', periodData));
            renderSummaryRow('summary-parallel', 'parallel', resolveSummaryPeriodData('parallel', periodData));
            syncSummaryModeButtons();
        }
        renderEventReport(periodData.events);

        if (periodData.timeline?.kind === 'day') {
            renderTimelineHalf(periodData.timeline, 'a', 0, 50, '00:00–12:00');
            renderTimelineHalf(periodData.timeline, 'b', 50, 100, '12:00–24:00');
        } else {
            renderTimelineHalf(periodData.timeline, 'a', 0, 100, periodData.timeline?.title || '时间分布');
            document.getElementById('timeline-card-b')?.classList.add('hidden');
        }

        const total = chartBundle.l1.reduce((s, x) => s + x.hours, 0);
        const isMain = state.chartView === 'main';

        document.getElementById('structure-title').textContent = '时间结构';
        document.getElementById('chart-legend-hint').textContent = isMain
            ? '内环 = 一级目录 · 外环 = 二级活动 · 最外弧 = 场景覆盖'
            : '内环 = 并行活动 · 外环 = 叠加明细';

        const chartL2 = isMain ? (chartBundle.l2Slices || chartBundle.l2) : chartBundle.l2;
        const activityColors = buildActivityColors((chartBundle.l2 || []).concat(chartL2 || []));
        renderSunburst(chartBundle.l1, chartL2, total, isMain, chartBundle.sceneCoverage || [], chartBundle.sceneRange, activityColors);
        renderLegend(chartBundle.l1, chartBundle.l2, total, isMain, activityColors);

        const insight = document.getElementById('insight-block');
        if (insight) insight.style.display = 'block';

        const foot = document.getElementById('footer-note');
        if (foot) {
            foot.textContent = chartBundle.meta.footnote + ' · 周一起算 · ' + REPORT_VERSION;
        }

        syncToolbar();
    }

    function renderSunburst(l1, l2, total, isMain, sceneCoverage, sceneRange, activityColors) {
        const svg = document.getElementById('sunburst-svg');
        if (!svg) return;
        const cx = 100, cy = 100;
        const inner = buildRingSegments(l1, cx, cy, 28, 50, total || 1, 'name', isMain);
        const outer = isMain
            ? buildEmbeddedOuterSegments(l1, l2, cx, cy, total || 1, activityColors)
            : buildRingSegments(l2, cx, cy, 54, 80, total || 1, 'l1', false);
        const sceneArcs = isMain ? buildSceneCoverageSegments(sceneCoverage, cx, cy, sceneRange) : [];

        let html = '';
        inner.forEach((s) => {
            html += `<path d="${s.path}" fill="${s.color}" fill-opacity=".88" stroke="#fff" stroke-width="1" class="inner-seg" data-cat="${esc(s.cat)}"
                data-title="${esc(s.name)}" data-hours="${fmtHours(s.hours)}" data-pct="${pct(s.hours, total)}"/>`;
        });
        outer.forEach((s) => {
            const remainder = s.remainder ? ' scene-remainder' : '';
            const free = s.free ? ' free-time-seg' : '';
            html += `<path d="${s.path}" fill="${s.color}" fill-opacity=".78" stroke="${s.free ? '#cbd5e1' : '#fff'}" stroke-width="${s.free ? '1' : '.5'}" class="outer-seg${remainder}${free}" data-cat="${esc(s.l1)}"
                data-title="${esc(s.name)}" data-sub="${esc(s.l1)}" data-hours="${fmtHours(s.hours)}" data-pct="${pct(s.hours, total)}"/>`;
        });
        sceneArcs.forEach((s) => {
            html += `<path d="${s.path}" fill="${s.color}" fill-opacity=".96" stroke="#fff" stroke-width=".8" class="scene-coverage-seg"
                data-title="场景 / ${esc(s.name)}" data-hours="${fmtHours(s.hours)}" data-pct="${pct(s.hours, total)}"/>`;
        });
        const centerVal = Math.round(total * 10) / 10;
        html += `<circle cx="100" cy="100" r="26" fill="#fff" stroke="#e2e8f0" stroke-width="1"/>`;
        html += `<text x="100" y="96" text-anchor="middle" fill="#1e293b" font-size="17" font-weight="800">${centerVal}</text>`;
        html += `<text x="100" y="112" text-anchor="middle" fill="#94a3b8" font-size="9" font-weight="700">小时</text>`;
        svg.innerHTML = html;

        svg.querySelectorAll('.inner-seg').forEach(bindSegTip);
        svg.querySelectorAll('.outer-seg:not(.scene-remainder)').forEach((el) => {
            el.addEventListener('mouseenter', (e) => showTipOuter(e, el.dataset.title, isMain ? '' : el.dataset.sub, el.dataset.hours, el.dataset.pct));
            el.addEventListener('mouseleave', hideTip);
        });
        svg.querySelectorAll('.scene-coverage-seg').forEach((el) => {
            el.addEventListener('mouseenter', (e) => showTip(e, el.dataset.title, el.dataset.hours, el.dataset.pct));
            el.addEventListener('mouseleave', hideTip);
        });
    }

    // 外环严格跟随内环父块；场景内未细分的部分已作为“自由时间”写入切片。
    function buildEmbeddedOuterSegments(l1, l2, cx, cy, total, activityColors) {
        let angle = 0;
        const rows = [];
        l1.filter((item) => item.hours > 0).forEach((parent) => {
            const parentSweep = (parent.hours / total) * 360;
            const children = l2.filter((item) => item.l1 === parent.name && item.hours > 0);
            const childHours = children.reduce((sum, item) => sum + item.hours, 0);
            const scale = childHours > parent.hours && childHours > 0 ? parent.hours / childHours : 1;
            let childAngle = angle;
            children.forEach((item) => {
                const sweep = (item.hours * scale / total) * 360;
                if (sweep <= 0) return;
                rows.push({
                    path: arcPath(cx, cy, 54, 80, childAngle, childAngle + sweep),
                    cat: parent.name,
                    name: item.name,
                    l1: parent.name,
                    hours: item.hours,
                    color: item.free ? '#ffffff' : (activityColors.get(item.name) || colorForKey(`l2|${parent.name}|${item.name}`, item.color)),
                    free: !!item.free,
                });
                childAngle += sweep;
            });
            const remainder = angle + parentSweep - childAngle;
            if (remainder > 0.0001) {
                rows.push({
                    path: arcPath(cx, cy, 54, 80, childAngle, angle + parentSweep),
                    cat: parent.name,
                    name: parent.name,
                    l1: parent.name,
                    hours: 0,
                    color: reportColor(parent.color, parent.name),
                    remainder: true,
                });
            }
            angle += parentSweep;
        });
        return rows;
    }

    // 场景覆盖是观察维度：按真实开始、结束时刻落在圆周位置，不加入中心的 24 小时合计。
    function buildSceneCoverageSegments(items, cx, cy, range) {
        const span = range?.end - range?.start;
        if (!span) return [];
        return items
            .map((item) => ({ ...item, start: Math.max(range.start, item.start), end: Math.min(range.end, item.end) }))
            .filter((item) => item.end > item.start)
            .sort((a, b) => a.start - b.start)
            .map((item) => {
                const a0 = ((item.start - range.start) / span) * 360;
                const a1 = ((item.end - range.start) / span) * 360;
                return {
                    path: arcPath(cx, cy, 84, 89, a0, a1),
                    name: item.name,
                    hours: (item.end - item.start) / 3600000,
                    color: reportColor(item.color, item.name),
                };
            });
    }

    function bindSegTip(el) {
        el.addEventListener('mouseenter', (e) => showTip(e, el.dataset.title, el.dataset.hours, el.dataset.pct));
        el.addEventListener('mouseleave', hideTip);
    }

    function renderLegend(l1, l2, total, isMain, activityColors) {
        const l1Box = document.getElementById('legend-l1');
        const l2Box = document.getElementById('legend-l2');
        l1Box.innerHTML = l1.map((row) => legendRow(row.name, null, row.hours, isMain ? reportColor(row.color, row.name) : colorForKey(`l1|${row.name}`, row.color), total, row.name)).join('');
        l2Box.innerHTML = l2.map((row) => legendRow(
            row.name,
            isMain ? null : row.l1,
            row.hours,
            isMain ? (activityColors.get(row.name) || row.color) : colorForKey(`l2|${row.l1 || ''}|${row.name}`, row.color),
            total,
            isMain ? row.name : row.l1
        )).join('');
        l1Box.style.display = state.legendMode === 'l1' ? 'block' : 'none';
        l2Box.style.display = state.legendMode === 'l2' ? 'block' : 'none';
        document.getElementById('btn-l1').classList.toggle('active', state.legendMode === 'l1');
        document.getElementById('btn-l2').classList.toggle('active', state.legendMode === 'l2');
        document.getElementById('btn-l1').textContent = isMain ? '活动分类' : '并行活动';
        document.getElementById('btn-l2').textContent = isMain ? '活动明细' : '叠加明细';

        document.querySelectorAll('.sunburst-legend .legend-item').forEach((el) => {
            el.addEventListener('mouseenter', () => {
                if (el.dataset.activity) highlightActivity(el.dataset.activity);
                else highlightCat(el.dataset.cat);
            });
            el.addEventListener('mouseleave', unhighlightCat);
        });
    }

    function legendRow(name, l1, hours, color, total, cat) {
        const label = l1 ? `${l1} · <span class="legend-sub">${name}</span>` : name;
        return `<div class="legend-item" data-cat="${esc(cat)}"${l1 ? '' : ` data-activity="${esc(name)}"`}>
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
        document.querySelectorAll('.summary-view-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.summaryView;
                const mode = btn.dataset.summaryMode;
                if (!view || !mode || state.summaryModes[view] === mode) return;
                state.summaryModes[view] = mode;
                localStorage.setItem(`v9_report_summary_view_${view}`, mode);
                render();
            });
        });
        document.querySelectorAll('.event-mode-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.eventMode;
                if (!mode || state.eventMode === mode) return;
                state.eventMode = mode;
                localStorage.setItem('v9_report_event_mode', mode);
                render();
            });
        });
    }

    function renderTip(title, sub, val1, val2) {
        const tip = document.getElementById('tip');
        if (!tip) return null;
        tip.replaceChildren();
        const titleEl = document.createElement('div');
        titleEl.className = 'tip-title';
        titleEl.textContent = title || '';
        tip.appendChild(titleEl);
        if (sub != null && sub !== '') {
            const subEl = document.createElement('div');
            subEl.className = 'tip-sub';
            subEl.textContent = sub;
            tip.appendChild(subEl);
        }
        const row = document.createElement('div');
        row.className = 'tip-row';
        const left = document.createElement('span');
        const right = document.createElement('span');
        left.textContent = val1 || '';
        right.textContent = val2 || '';
        row.append(left, right);
        tip.appendChild(row);
        return tip;
    }

    window.showTip = function (e, title, val1, val2) {
        const tip = renderTip(title, '', val1, val2);
        if (!tip) return;
        tip.className = 'show';
        positionTip(e);
    };

    window.showTipOuter = function (e, sub, cat, val1, val2) {
        const tip = renderTip(sub, cat, val1, val2);
        if (!tip) return;
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

    window.highlightActivity = function (activity) {
        document.querySelectorAll('.inner-seg, .outer-seg').forEach((el) => {
            el.style.fillOpacity = el.classList.contains('outer-seg') && el.dataset.title === activity ? '1' : '0.12';
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
        if (!document.getElementById('sunburst-svg')) return;
        if (document.body.id === 'report-standalone') {
            state.period = 'month';
            bindEvents();
            render();
        }
    });
})();
