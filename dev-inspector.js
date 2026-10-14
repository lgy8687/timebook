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
        ['B22', '事件记录', '#event-modal .event-modal-card']
    ];
    let enabled = localStorage.getItem(STORAGE_KEY) !== 'false';
    let scheduled = false;
    let toastTimer;

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
                if (element.classList.contains('dev-inspector-target')) return;
                element.classList.add('dev-inspector-target');
                const badge = document.createElement('button');
                badge.type = 'button';
                badge.className = 'dev-inspector-badge';
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
            document.querySelectorAll('.dev-inspector-target').forEach((element) => element.classList.remove('dev-inspector-target'));
        }
    }

    window.setDevInspectorEnabled = setEnabled;
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    setEnabled(enabled);
})();
