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
        ['B11', '日历补录弹窗', '#calendar-backfill-modal .calendar-backfill-card', 'C04'],
        ['B12', '日历时间输入', '#calendar-backfill-interval-fields .calendar-backfill-time-row'],
        ['B13', '活动分类选择', '#drawer > div'],
        ['B14', '主线摘要', '#summary-block-main', 'C01'],
        ['B15', '并行摘要', '#summary-block-parallel', 'C01'],
        ['B16', '事件统计', '#event-report-block', 'C01'],
        ['B17', '时间结构', '#page-report .structure-card', 'C01'],
        ['B18', '报表时间段', '#page-report .timeline-card'],
        ['B19', '设置入口', '#page-mine .config-grid-card'],
        ['B20', '设置详情', '#page-mine .config-panel'],
        ['B21', '场景选择', '#scene-popover .scene-popover-card'],
        ['B22', '事件记录', '#event-modal .event-modal-card'],
        ['B30', '底部导航', '.app-bottom-nav', 'C07'],
        ['B31', '当前状态卡片', '.header-main-status'],
        ['B33', '报表周期与日期', '#report-period-toolbar', 'C16'],
        ['B34', '随手记', '#free-note-module']
    ];
    // A Z address names a submodule prototype; repeated instances share one badge and contract.
    const submodules = [
        ['Z01-1', '主线快捷键', '#home-shortcuts .keycap--main', 'C09'],
        ['Z01-2', '添加主线快捷键', '#home-shortcuts .shortcut-add-btn--main', 'C10'],
        ['Z02-1', '并行快捷键', '#parallel-shortcuts .keycap--parallel-slot', 'C11'],
        ['Z02-2', '添加并行快捷键', '#parallel-shortcuts .shortcut-add-btn--parallel', 'C12'],
        ['Z06-1', '日历日期格', '#page-calendar .flow-calendar-day', 'C13'],
        ['Z06-2', '日历月份切换键', '#page-calendar .flow-calendar-nav', 'C14'],
        ['Z06-3', '日历月份选择键', '#page-calendar .flow-calendar-title-btn', 'C15'],
        ['Z11-1', '补录时间段选择', '#calendar-backfill-target-picker .calendar-backfill-target-choice', 'C05'],
        ['Z11-2', '补录方式中的事件次数入口', '#calendar-backfill-options .calendar-backfill-choice:not(.journal-only)', 'C06'],
        ['Z11-3', '时段选择列表中的事件次数入口', '#calendar-backfill-target-picker .calendar-backfill-event-choice', 'C19'],
        ['Z14-1', '主线摘要切换', '#summary-block-main .summary-view-toggle', 'C02'],
        ['Z15-1', '并行摘要切换', '#summary-block-parallel .summary-view-toggle', 'C02'],
        ['Z16-1', '事件统计切换', '#event-report-block .chart-mode-toggle', 'C02'],
        ['Z17-1', '时间结构切换', '#page-report .structure-card .chart-mode-toggle', 'C02'],
        ['Z17-2', '活动分类与明细切换', '#legend-mode-toggle', 'C02'],
        ['Z30-1', '底部导航键', '#nav-record, #nav-calendar, #nav-report, #nav-mine', 'C08'],
        ['Z33-1', '报表周期切换', '#seg-period', 'C18'],
        ['Z33-2', '报表日期导航', '#report-period-nav', 'C03'],
        ['B32', '场景切换键', '#scene-entry-btn']
    ];
    const floatingBadges = new Map();
    let enabled = localStorage.getItem(STORAGE_KEY) !== 'false';
    let scheduled = false;
    let toastTimer;

    function scanSubmodules() {
        const activeModal = document.querySelector('#calendar-backfill-modal:not(.hidden)');
        for (const [code, label, selector, contract] of submodules) {
            const address = contract ? `${code}/${contract}` : code;
            const instances = [...document.querySelectorAll(selector)];
            instances.forEach(element => { element.dataset.devAddress = address; });
            const visible = element => {
                if (activeModal && !activeModal.contains(element)) return false;
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
                badge.className = `dev-inspector-badge dev-inspector-badge--detail dev-inspector-badge--${code.startsWith('B') ? 'block' : 'submodule'}`;
                badge.textContent = address;
                badge.title = `${address} · ${label}（点击复制）`;
                badge.setAttribute('aria-label', `复制${code.startsWith('B') ? '区块' : '模块'}编号 ${address}，${label}`);
                badge.addEventListener('pointerdown', event => event.stopPropagation());
                badge.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    copyCode(address);
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
            if (code.startsWith('B')) {
                entry.badge.style.left = `${Math.max(0, Math.min(window.innerWidth - entry.badge.offsetWidth, rect.right - entry.badge.offsetWidth - 6))}px`;
                entry.badge.style.top = `${Math.max(0, rect.top - 10)}px`;
            } else {
                entry.badge.style.left = `${Math.max(0, Math.min(window.innerWidth - entry.badge.offsetWidth, rect.left + 6))}px`;
                entry.badge.style.top = `${Math.max(0, Math.min(window.innerHeight - entry.badge.offsetHeight, rect.bottom - 12))}px`;
            }
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
        for (const [code, label, selector, contract] of blocks) {
            document.querySelectorAll(selector).forEach((element) => {
                if ([...element.children].some(child => child.classList.contains('dev-inspector-badge') && child.dataset.code === code)) return;
                element.classList.add('dev-inspector-target');
                element.dataset.devBlockCode = code;
                const badge = document.createElement('button');
                badge.type = 'button';
                badge.className = 'dev-inspector-badge dev-inspector-badge--block';
                badge.dataset.code = code;
                const address = contract ? `${code}/${contract}` : code;
                badge.textContent = address;
                badge.title = `${address} · ${label}（点击复制）`;
                badge.setAttribute('aria-label', `复制区块编号 ${address}，${label}`);
                badge.addEventListener('pointerdown', (event) => event.stopPropagation());
                badge.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    copyCode(address);
                });
                element.appendChild(badge);
            });
        }
        scanSubmodules();
        scanTypography();
    }

    function scanTypography() {
        const rootStyle = getComputedStyle(document.documentElement);
        const typeLevels = new Map(UI_TYPE_LEVEL_TOKENS.map(([level, token]) => [Number.parseFloat(rootStyle.getPropertyValue(token)), level]));
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const elements = new Set();
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (!node.textContent.trim()) continue;
            const element = node.parentElement;
            if (!element || element.closest('script, style, .dev-inspector-badge, #dev-inspector-toast')) continue;
            elements.add(element);
        }
        document.querySelectorAll('input, textarea, select').forEach(element => elements.add(element));
        for (const element of elements) {
            const pixels = Number.parseFloat(getComputedStyle(element).fontSize);
            const level = typeLevels.get(pixels) || '待归档';
            const size = `${pixels}px`;
            if (element.dataset.devTypeLevel !== level) element.dataset.devTypeLevel = level;
            if (element.dataset.devTypeSize !== size) element.dataset.devTypeSize = size;
        }
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
            document.querySelectorAll('[data-dev-address]').forEach((element) => delete element.dataset.devAddress);
            document.querySelectorAll('[data-dev-block-code]').forEach((element) => delete element.dataset.devBlockCode);
            document.querySelectorAll('[data-dev-type-level]').forEach((element) => {
                delete element.dataset.devTypeLevel;
                delete element.dataset.devTypeSize;
            });
        }
    }

    window.setDevInspectorEnabled = setEnabled;
    window.addEventListener('scroll', scheduleScan, true);
    window.addEventListener('resize', scheduleScan);
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    setEnabled(enabled);
})();
