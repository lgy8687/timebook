(() => {
    const STORAGE_KEY = 'timebook_dev_inspector_enabled';
    const CODE_MAP_KEY = 'timebook_dev_inspector_codes_v3';
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
    const INTERACTIVE_SELECTOR = 'button,input,select,textarea,a,[role="button"],[role="switch"],[onclick]';
    const TEXT_SELECTOR = 'h1,h2,h3,h4,label,p,[role="status"],[role="alert"],.empty-state,.report-block-title,.log-day-header';
    let codeMap = readCodeMap();
    const fixedTargets = new WeakSet();
    const floatingBadges = new Map();
    let enabled = localStorage.getItem(STORAGE_KEY) !== 'false';
    let scheduled = false;
    let toastTimer;

    function readCodeMap() {
        try {
            const value = JSON.parse(localStorage.getItem(CODE_MAP_KEY) || '{}');
            return value && typeof value === 'object' ? value : {};
        } catch (_) {
            return {};
        }
    }

    function saveCodeMap() {
        try { localStorage.setItem(CODE_MAP_KEY, JSON.stringify(codeMap)); } catch (_) { /* Storage may be unavailable. */ }
    }

    function semanticParent(element) {
        let parent = element.parentElement;
        while (parent && parent !== document.body) {
            if (parent.id) return `#${parent.id}`;
            const classes = [...parent.classList].filter(name => !/^(dev-inspector|hidden|active|selected|disabled|open|show|flex|grid|block|relative|absolute|fixed|sticky|w-|h-|min-|max-|p-|px-|py-|m-|mt-|mb-|mx-|my-|text-|font-|bg-|border|rounded|shadow|gap-|items-|justify-|overflow-)/.test(name));
            if (classes.length) return `.${classes.sort().join('.')}`;
            parent = parent.parentElement;
        }
        return element.closest('section')?.id || 'app';
    }

    function directText(element) {
        return [...element.childNodes]
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .filter(Boolean)
            .join(' ');
    }

    function isMeaningfulText(element) {
        if (element.matches(INTERACTIVE_SELECTOR) || element.closest(INTERACTIVE_SELECTOR)) return false;
        const text = directText(element);
        return !!text && !/^[\p{Extended_Pictographic}\p{Punctuation}\p{Symbol}\s]+$/u.test(text);
    }

    function signature(element, kind) {
        const classes = [...element.classList].filter(name => !/^(dev-inspector|hidden|active|selected|disabled|open|show|flex|grid|block|relative|absolute|fixed|sticky|w-|h-|min-|max-|p-|px-|py-|m-|mt-|mb-|mx-|my-|text-|font-|bg-|border|rounded|shadow|gap-|items-|justify-|overflow-)/.test(name)).sort().join('.') || '-';
        const visibleText = (element.innerText || directText(element) || '').replace(/\s+/g, ' ').trim();
        const action = element.dataset.devAction || element.dataset.configSection || element.dataset.period || element.dataset.chart || element.getAttribute('aria-label') || element.getAttribute('title') || (kind === 'control' ? visibleText || element.value || element.id || '' : directText(element));
        return `${kind}|${semanticParent(element)}|${element.id ? `#${element.id}` : element.tagName.toLowerCase() + '.' + classes}|${String(action).replace(/\s+/g, ' ').trim().slice(0, 64)}`;
    }

    function codeFor(key) {
        if (!codeMap[key]) {
            const used = [...blocks.map(([code]) => Number(code.slice(1))), ...Object.values(codeMap).map(code => Number(String(code).slice(1)))];
            codeMap[key] = `B${String(Math.max(22, ...used) + 1).padStart(2, '0')}`;
            saveCodeMap();
        }
        return codeMap[key];
    }

    function attachBadge(element, code, label, kind) {
        const key = element.dataset.devInspectorKey || `${kind}|${code}`;
        if (kind === 'control') {
            let badge = floatingBadges.get(element);
            if (!badge) {
                badge = document.createElement('button');
                badge.type = 'button';
                badge.className = 'dev-inspector-badge dev-inspector-badge--detail';
                badge.dataset.key = key;
                badge.addEventListener('pointerdown', event => event.stopPropagation());
                badge.addEventListener('click', event => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    copyCode(badge.textContent);
                });
                document.body.appendChild(badge);
                floatingBadges.set(element, badge);
            }
            badge.textContent = code;
            badge.title = `${code} · ${label}（点击复制）`;
            badge.setAttribute('aria-label', `复制区块编号 ${code}，${label}`);
            element.classList.add('dev-inspector-target');
            const rect = element.getBoundingClientRect();
            badge.hidden = !rect.width || !rect.height;
            if (!badge.hidden) {
                badge.style.left = `${Math.max(0, Math.min(window.innerWidth - 42, rect.right - 40))}px`;
                badge.style.top = `${Math.max(0, rect.top - 10)}px`;
            }
            return;
        }
        const host = element;
        host.classList.add('dev-inspector-target');
        if ([...host.children].some(child => child.classList.contains('dev-inspector-badge') && child.dataset.key === key)) return;
        const badge = document.createElement('button');
        badge.type = 'button';
        badge.className = 'dev-inspector-badge dev-inspector-badge--inline';
        badge.textContent = code;
        badge.title = `${code} · ${label}（点击复制）`;
        badge.setAttribute('aria-label', `复制区块编号 ${code}，${label}`);
        badge.dataset.key = key;
        badge.addEventListener('pointerdown', event => event.stopPropagation());
        badge.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            copyCode(code);
        });
        host.appendChild(badge);
    }

    function scanDetails() {
        const candidates = document.querySelectorAll(`${INTERACTIVE_SELECTOR},${TEXT_SELECTOR}`);
        candidates.forEach(element => {
            if (element.closest('.dev-inspector-badge,.dev-inspector-toast,[aria-hidden="true"]') || fixedTargets.has(element)) return;
            const isControl = element.matches(INTERACTIVE_SELECTOR);
            if (!isControl && !isMeaningfulText(element)) return;
            if (!isControl && element.matches('label') && element.querySelector(INTERACTIVE_SELECTOR)) return;
            const kind = isControl ? 'control' : 'text';
            const key = signature(element, kind);
            const code = codeFor(key);
            element.dataset.devInspectorKey = key;
            const label = element.getAttribute('aria-label') || element.getAttribute('title') || (element.innerText || directText(element) || element.id || element.tagName.toLowerCase()).replace(/\s+/g, ' ').trim();
            attachBadge(element, code, isControl ? `交互控件：${label}` : `文字区块：${directText(element)}`, kind);
        });
        for (const [element, badge] of floatingBadges) {
            if (!element.isConnected) {
                badge.remove();
                floatingBadges.delete(element);
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
        for (const [code, label, selector] of blocks) {
            document.querySelectorAll(selector).forEach((element) => {
                if (element.classList.contains('dev-inspector-target')) return;
                element.classList.add('dev-inspector-target');
                fixedTargets.add(element);
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
        scanDetails();
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
            floatingBadges.clear();
            document.querySelectorAll('.dev-inspector-target').forEach((element) => element.classList.remove('dev-inspector-target'));
        }
    }

    window.setDevInspectorEnabled = setEnabled;
    window.addEventListener('scroll', scheduleScan, true);
    window.addEventListener('resize', scheduleScan);
    new MutationObserver(scheduleScan).observe(document.body, { childList: true, subtree: true });
    setEnabled(enabled);
})();
