(() => {
    const STORAGE_KEY = 'timebook_dev_inspector_enabled';
    const blocks = [
        ['B01', '主线快捷入口', '#main-shortcut-section'],
        ['B02', '并行快捷入口', '#parallel-section'],
        ['B03', '时钟面板', '#clock-stage'],
        ['B04', '流水主线卡片', '#log-list .log-flow-card--main-log, #log-list .log-flow-card--main-live'],
        ['B05', '流水并行卡片', '#log-list .log-flow-card--parallel-log, #log-list .log-flow-card--parallel-live'],
        ['B06', '日历月视图', '#page-calendar .flow-calendar-panel'],
        ['B07', '日历当日摘要', '#calendar-day-summary'],
        ['B08', '日历流水卡片', '#calendar-log-list .log-flow-card'],
        ['B09', '记录修改弹窗', '#edit-modal > div'],
        ['B10', '流水时间输入', '#edit-modal .time-edit-group'],
        ['B11', '日历补录弹窗', '#calendar-backfill-modal .calendar-backfill-card'],
        ['B12', '日历时间输入', '#calendar-backfill-interval-fields .calendar-backfill-time-row'],
        ['B13', '活动分类选择', '#drawer > div'],
        ['B14', '主线摘要', '#summary-block-main'],
        ['B15', '并行摘要', '#summary-block-parallel'],
        ['B16', '事件统计', '#event-report-block'],
        ['B17', '时间结构', '#page-report .structure-card'],
        ['B18', '报表时间段', '#page-report .timeline-card'],
        ['B19', '设置入口', '#page-mine .config-grid-card'],
        ['B20', '设置详情', '#page-mine .config-panel'],
        ['B21', '场景选择', '#scene-popover .scene-popover-card'],
        ['B22', '事件记录', '#event-modal .event-modal-card'],
        ['B31', '当前状态卡片', '.header-main-status']
    ];
    // One code belongs to an interaction prototype, not to each rendered item or its text.
    const prototypes = [
        ['B23', '主线快捷键', '#home-shortcuts .keycap--main'],
        ['B24', '添加主线快捷键', '#home-shortcuts .shortcut-add-btn--main'],
        ['B25', '并行快捷键', '#parallel-shortcuts .keycap--parallel-slot'],
        ['B26', '添加并行快捷键', '#parallel-shortcuts .shortcut-add-btn--parallel'],
        ['B27', '日历日期格', '#page-calendar .flow-calendar-day'],
        ['B28', '日历月份切换键', '#page-calendar .flow-calendar-nav'],
        ['B29', '日历月份选择键', '#page-calendar .flow-calendar-title-btn'],
        ['B30', '底部导航键', '#nav-record, #nav-calendar, #nav-report, #nav-mine'],
        ['B32', '场景切换键', '#scene-entry-btn']
    ];
    const floatingBadges = new Map();
    let enabled = localStorage.getItem(STORAGE_KEY) !== 'false';
    let scheduled = false;
    let toastTimer;

    function scanPrototypes() {
        for (const [code, label, selector] of prototypes) {
            const instances = [...document.querySelectorAll(selector)];
            instances.forEach(element => { element.dataset.devPrototype = code; });
            const visible = element => {
                const rect = element.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
            };
            const representative = instances.find(element => element.classList.contains('is-selected') && visible(element))
                || instances.find(visible);
            let entry = floatingBadges.get(code);
            if (!representative) {
                if (entry) {
                    entry.element.classList.remove('dev-inspector-target');
                    entry.badge.hidden = true;
                }
                continue;
            }
            if (!entry) {
                const badge = document.createElement('button');
                badge.type = 'button';
                badge.className = 'dev-inspector-badge dev-inspector-badge--detail';
                badge.textContent = code;
                badge.title = `${code} · ${label}（同类组件共用，点击复制）`;
                badge.setAttribute('aria-label', `复制组件编号 ${code}，${label}`);
                badge.addEventListener('pointerdown', event => event.stopPropagation());
                badge.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    copyCode(code);
                });
                document.body.appendChild(badge);
                entry = { element: representative, badge };
                floatingBadges.set(code, entry);
            }
            if (entry.element !== representative) entry.element.classList.remove('dev-inspector-target');
            entry.element = representative;
            representative.classList.add('dev-inspector-target');
            const rect = representative.getBoundingClientRect();
            entry.badge.hidden = false;
            entry.badge.style.left = `${Math.max(0, Math.min(window.innerWidth - 42, rect.right - 40))}px`;
            entry.badge.style.top = `${Math.max(0, rect.top - 10)}px`;
        }
    }

    function showToast(message) {
        let toast = document.getElementById('dev-inspector-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'dev-inspector-toast';
            toast.className = 'dev-inspector-toast';
            toast.setAttribute('role', 'status');
            document.body.appendChild(toast);
        }
        toast.textContent = message;
        toast.hidden = false;
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => { toast.hidden = true; }, 1800);
    }

    async function copyCode(code) {
        try {
            await navigator.clipboard.writeText(code);
        } catch (_) {
            const input = document.createElement('textarea');
            input.value = code;
            input.style.position = 'fixed';
            input.style.opacity = '0';
            document.body.appendChild(input);
            input.select();
            const copied = document.execCommand('copy');
            input.remove();
            if (!copied) {
                showToast(`复制失败：${code}`);
                return;
            }
        }
        showToast(`已复制 ${code}`);
    }

    function scan() {
        scheduled = false;
        if (!enabled) return;
        for (const [code, label, selector] of blocks) {
            document.querySelectorAll(selector).forEach((element) => {
                if ([...element.children].some(child => child.classList.contains('dev-inspector-badge') && child.dataset.code === code)) return;
                element.classList.add('dev-inspector-target');
                const badge = document.createElement('button');
                badge.type = 'button';
                badge.className = 'dev-inspector-badge';
                badge.dataset.code = code;
                badge.textContent = code;
                badge.title = `${code} · ${label}（点击复制）`;
                badge.setAttribute('aria-label', `复制区块编号 ${code}，${label}`);
                badge.addEventListener('pointerdown', (event) => event.stopPropagation());
                badge.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    copyCode(code);
                });
                element.appendChild(badge);
            });
        }
        scanPrototypes();
    }

    function scheduleScan() {
        if (enabled && !scheduled) {
            scheduled = true;
            requestAnimationFrame(scan);
        }
    }

    function setEnabled(value) {
        enabled = !!value;
        localStorage.setItem(STORAGE_KEY, String(enabled));
        document.body.classList.toggle('dev-inspector-on', enabled);
        const toggle = document.getElementById('dev-inspector-toggle');
        if (toggle) toggle.checked = enabled;
        if (enabled) scheduleScan();
        else {
            document.querySelectorAll('.dev-inspector-badge').forEach((badge) => badge.remove());
            for (const { badge } of floatingBadges.values()) badge.remove();
            floatingBadges.clear();
            document.querySelectorAll('.dev-inspector-target').forEach((element) => element.classList.remove('dev-inspector-target'));
            document.querySelectorAll('[data-dev-prototype]').forEach((element) => delete element.dataset.devPrototype);
        }
    }

    window.setDevInspectorEnabled = setEnabled;
    window.addEventListener('scroll', scheduleScan, true);
    window.addEventListener('resize', scheduleScan);
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    setEnabled(enabled);
})();
