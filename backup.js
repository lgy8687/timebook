const TIMEBOOK_BACKUP_FORMAT = 'timebook-backup';
const TIMEBOOK_BACKUP_VERSION = 1;

function collectTimebookBackup(storage = localStorage) {
    const data = {};
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (/^v9_[A-Za-z0-9_]+$/.test(key)) data[key] = storage.getItem(key);
    }
    return {
        format: TIMEBOOK_BACKUP_FORMAT,
        version: TIMEBOOK_BACKUP_VERSION,
        exportedAt: new Date().toISOString(),
        data
    };
}

function parseTimebookBackup(text) {
    const backup = JSON.parse(text);
    if (!backup || backup.format !== TIMEBOOK_BACKUP_FORMAT || backup.version !== TIMEBOOK_BACKUP_VERSION
        || !backup.data || typeof backup.data !== 'object' || Array.isArray(backup.data)) {
        throw new Error('不是受支持的时间记录备份文件。');
    }
    const entries = Object.entries(backup.data);
    if (!entries.length || !entries.every(([key, value]) => /^v9_[A-Za-z0-9_]+$/.test(key) && typeof value === 'string')) {
        throw new Error('备份文件中的数据格式不正确。');
    }
    if (!('v9_logs' in backup.data) && !('v9_current' in backup.data) && !('v9_event_records' in backup.data)) {
        throw new Error('备份文件中没有可恢复的记录。');
    }
    const arrays = ['v9_logs', 'v9_parallel_history', 'v9_cats', 'v9_event_types', 'v9_event_records'];
    for (const key of arrays) {
        if (key in backup.data && !Array.isArray(JSON.parse(backup.data[key]))) {
            throw new Error(`${key} 不是有效的记录列表。`);
        }
    }
    for (const key of ['v9_current', 'v9_parallel']) {
        if (!(key in backup.data)) continue;
        const value = JSON.parse(backup.data[key]);
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error(`${key} 不是有效的进行中记录。`);
        }
    }
    return backup;
}

function restoreTimebookBackup(backup, storage = localStorage) {
    const previous = collectTimebookBackup(storage).data;
    const replace = (data) => {
        Object.keys(previous).forEach((key) => storage.removeItem(key));
        Object.entries(data).forEach(([key, value]) => storage.setItem(key, value));
    };
    try {
        replace(backup.data);
    } catch (error) {
        Object.keys(backup.data).forEach((key) => storage.removeItem(key));
        Object.entries(previous).forEach(([key, value]) => storage.setItem(key, value));
        throw error;
    }
}

function exportTimebookBackup() {
    const backup = collectTimebookBackup();
    const json = JSON.stringify(backup, null, 2);
    const name = `timebook-backup-${new Date().toISOString().slice(0, 10)}.json`;
    if (window.TimeBookAndroid?.saveBackup) {
        window.TimeBookAndroid.saveBackup(name, json);
        return;
    }
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function importTimebookBackup(input) {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
        showConfirm('文件太大', '备份文件超过 50 MB，请检查是否选错文件。', '知道了', () => {});
        return;
    }
    let backup;
    try {
        backup = parseTimebookBackup(await file.text());
    } catch (error) {
        showConfirm('无法读取备份', error.message || '请选择本应用导出的 JSON 备份。', '知道了', () => {});
        return;
    }
    const count = JSON.parse(backup.data.v9_logs || '[]').length;
    showConfirm('恢复备份', `备份中有 ${count} 条流水记录。恢复将替换这台设备内的全部时间记录和设置，请确认已保留当前设备的备份。`, '恢复', (ok) => {
        if (!ok) return;
        try {
            restoreTimebookBackup(backup);
            location.reload();
        } catch (error) {
            showConfirm('恢复失败', '存储空间可能不足，原有记录已尝试保留。请先检查设备空间。', '知道了', () => {});
        }
    }, '取消');
}
