/** 报表沙盘样本 — 并入主页后由 aggregate(logs, period) 替换 */
const REPORT_DATA = {
    month: {
        main: {
            meta: {
                title: '2026年4月',
                range: '2026年4月1日 → 4月30日',
                footnote: '主线时段互斥；样本数据，非真实日志。'
            },
            summary: [
                { icon: '🎯', label: '结构重心', value: '上班', sub: '占主线 44.6%' },
                { icon: '🔀', label: '活动切换', value: '412', sub: '次快捷/切段' },
                { icon: '📋', label: '流水条数', value: '678', sub: '条主线记录' }
            ],
            l1: [
                { name: '上班', hours: 321.5, color: '#3b82f6' },
                { name: '生活', hours: 311.6, color: '#f59e0b' },
                { name: '學習', hours: 57.7, color: '#10b981' },
                { name: '餐飲', hours: 21.8, color: '#06b6d4' },
                { name: '交通', hours: 8.1, color: '#ef4444' }
            ],
            l2: [
                { l1: '上班', name: '工作', hours: 321.5, color: '#93c5fd' },
                { l1: '生活', name: '睡眠', hours: 217.8, color: '#fcd34d' },
                { l1: '生活', name: '摸魚', hours: 34.6, color: '#fbbf24' },
                { l1: '生活', name: '休息', hours: 34.5, color: '#f59e0b' },
                { l1: '生活', name: '閱讀', hours: 22.8, color: '#d97706' },
                { l1: '生活', name: '鍛煉', hours: 1.8, color: '#b45309' },
                { l1: '學習', name: '閱讀', hours: 30.7, color: '#6ee7b7' },
                { l1: '學習', name: '公眾號', hours: 27.0, color: '#34d399' },
                { l1: '餐飲', name: '早午晚餐', hours: 21.8, color: '#67e8f9' },
                { l1: '交通', name: '開車', hours: 8.1, color: '#fca5a5' }
            ]
        },
        parallel: {
            meta: {
                title: '2026年4月',
                range: '并行活动样本 · 与主线目录独立',
                footnote: '并行可重叠累计；环图按并行活动聚合（样本）。'
            },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '86.4', sub: '小时（重叠累计）' },
                { icon: '📐', label: '叠在主线比', value: '12.0%', sub: '并行/主线时长' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '34.6h' }
            ],
            l1: [
                { name: '摸魚', hours: 34.6, color: '#7c3aed' },
                { name: '公眾號', hours: 27.0, color: '#34d399' },
                { name: '閱讀', hours: 22.8, color: '#10b981' },
                { name: '臨時會議', hours: 9.1, color: '#6366f1' },
                { name: '聽歌', hours: 8.9, color: '#a78bfa' }
            ],
            l2: [
                { l1: '摸魚', name: '叠在上班', hours: 28.2, color: '#c4b5fd' },
                { l1: '摸魚', name: '叠在生活', hours: 6.4, color: '#a78bfa' },
                { l1: '公眾號', name: '叠在上班', hours: 15.2, color: '#6ee7b7' },
                { l1: '公眾號', name: '叠在學習', hours: 11.8, color: '#34d399' },
                { l1: '閱讀', name: '叠在學習', hours: 12.1, color: '#6ee7b7' },
                { l1: '閱讀', name: '叠在生活', hours: 10.7, color: '#10b981' },
                { l1: '臨時會議', name: '叠在上班', hours: 9.1, color: '#818cf8' },
                { l1: '聽歌', name: '零散叠加', hours: 8.9, color: '#ddd6fe' }
            ]
        }
    },
    day: {
        main: {
            meta: { title: '2026年5月20日', range: '当日主线 · 样本', footnote: '日报 24h 轴下一步加入。' },
            summary: [
                { icon: '🎯', label: '结构重心', value: '上班', sub: '占 44.5%' },
                { icon: '🔀', label: '活动切换', value: '18', sub: '次' },
                { icon: '📋', label: '流水条数', value: '42', sub: '条' }
            ],
            l1: [
                { name: '上班', hours: 10.5, color: '#3b82f6' },
                { name: '生活', hours: 9.2, color: '#f59e0b' },
                { name: '學習', hours: 2.4, color: '#10b981' },
                { name: '餐飲', hours: 1.2, color: '#06b6d4' },
                { name: '交通', hours: 0.3, color: '#ef4444' }
            ],
            l2: [
                { l1: '上班', name: '工作', hours: 10.5, color: '#93c5fd' },
                { l1: '生活', name: '睡眠', hours: 7.0, color: '#fcd34d' },
                { l1: '生活', name: '休息', hours: 2.2, color: '#fbbf24' },
                { l1: '學習', name: '閱讀', hours: 2.4, color: '#6ee7b7' },
                { l1: '餐飲', name: '早午晚餐', hours: 1.2, color: '#67e8f9' },
                { l1: '交通', name: '開車', hours: 0.3, color: '#fca5a5' }
            ]
        },
        parallel: {
            meta: { title: '2026年5月20日', range: '并行活动 · 样本', footnote: '样本数据。' },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '3.2', sub: '小时' },
                { icon: '📐', label: '叠在主线比', value: '13.6%', sub: '并行/主线' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '1.6h' }
            ],
            l1: [
                { name: '摸魚', hours: 1.6, color: '#7c3aed' },
                { name: '公眾號', hours: 1.1, color: '#34d399' },
                { name: '聽歌', hours: 0.5, color: '#a78bfa' }
            ],
            l2: [
                { l1: '摸魚', name: '叠在上班', hours: 1.6, color: '#c4b5fd' },
                { l1: '公眾號', name: '叠在上班', hours: 0.5, color: '#6ee7b7' },
                { l1: '公眾號', name: '叠在學習', hours: 0.6, color: '#34d399' },
                { l1: '聽歌', name: '零散叠加', hours: 0.5, color: '#ddd6fe' }
            ]
        }
    },
    week: {
        main: {
            meta: { title: '2026年第21周', range: '5/19（周一）→ 5/25（周日）', footnote: '周一起算 · 样本。' },
            summary: [
                { icon: '🎯', label: '结构重心', value: '上班', sub: '占 44.2%' },
                { icon: '🔀', label: '活动切换', value: '96', sub: '次' },
                { icon: '📋', label: '流水条数', value: '312', sub: '条' }
            ],
            l1: [
                { name: '上班', hours: 72.5, color: '#3b82f6' },
                { name: '生活', hours: 72.1, color: '#f59e0b' },
                { name: '學習', hours: 14.2, color: '#10b981' },
                { name: '餐飲', hours: 4.8, color: '#06b6d4' },
                { name: '交通', hours: 0.6, color: '#ef4444' }
            ],
            l2: [
                { l1: '上班', name: '工作', hours: 72.5, color: '#93c5fd' },
                { l1: '生活', name: '睡眠', hours: 50.2, color: '#fcd34d' },
                { l1: '生活', name: '摸魚', hours: 8.1, color: '#fbbf24' },
                { l1: '學習', name: '閱讀', hours: 8.2, color: '#6ee7b7' },
                { l1: '學習', name: '公眾號', hours: 6.0, color: '#34d399' },
                { l1: '餐飲', name: '早午晚餐', hours: 4.8, color: '#67e8f9' }
            ]
        },
        parallel: {
            meta: { title: '2026年第21周', range: '并行活动 · 样本', footnote: '样本数据。' },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '19.8', sub: '小时' },
                { icon: '📐', label: '叠在主线比', value: '12.1%', sub: '并行/主线' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '8.1h' }
            ],
            l1: [
                { name: '摸魚', hours: 8.1, color: '#7c3aed' },
                { name: '公眾號', hours: 6.0, color: '#34d399' },
                { name: '閱讀', hours: 4.2, color: '#10b981' },
                { name: '臨時會議', hours: 1.5, color: '#6366f1' }
            ],
            l2: [
                { l1: '摸魚', name: '叠在上班', hours: 8.1, color: '#c4b5fd' },
                { l1: '公眾號', name: '叠在學習', hours: 6.0, color: '#34d399' },
                { l1: '閱讀', name: '叠在學習', hours: 4.2, color: '#6ee7b7' },
                { l1: '臨時會議', name: '叠在上班', hours: 1.5, color: '#818cf8' }
            ]
        }
    },
    year: {
        main: {
            meta: { title: '2026年', range: '样本期 1–4 月', footnote: '年报样本仅含前四月。' },
            summary: [
                { icon: '🎯', label: '结构重心', value: '上班', sub: '占 44.6%' },
                { icon: '🔀', label: '活动切换', value: '1680', sub: '次（样本期）' },
                { icon: '📋', label: '流水条数', value: '2140', sub: '条' }
            ],
            l1: [
                { name: '上班', hours: 1286.0, color: '#3b82f6' },
                { name: '生活', hours: 1246.4, color: '#f59e0b' },
                { name: '學習', hours: 230.8, color: '#10b981' },
                { name: '餐飲', hours: 87.2, color: '#06b6d4' },
                { name: '交通', hours: 32.4, color: '#ef4444' }
            ],
            l2: [
                { l1: '上班', name: '工作', hours: 1286.0, color: '#93c5fd' },
                { l1: '生活', name: '睡眠', hours: 871.2, color: '#fcd34d' },
                { l1: '生活', name: '摸魚', hours: 138.4, color: '#fbbf24' },
                { l1: '學習', name: '閱讀', hours: 122.8, color: '#6ee7b7' },
                { l1: '學習', name: '公眾號', hours: 108.0, color: '#34d399' }
            ]
        },
        parallel: {
            meta: { title: '2026年', range: '并行活动 · 样本', footnote: '样本数据。' },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '345.6', sub: '小时（样本期）' },
                { icon: '📐', label: '叠在主线比', value: '12.0%', sub: '并行/主线' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '138.4h' }
            ],
            l1: [
                { name: '摸魚', hours: 138.4, color: '#7c3aed' },
                { name: '公眾號', hours: 108.0, color: '#34d399' },
                { name: '閱讀', hours: 72.0, color: '#10b981' },
                { name: '臨時會議', hours: 36.4, color: '#6366f1' }
            ],
            l2: [
                { l1: '摸魚', name: '叠在上班', hours: 112.0, color: '#c4b5fd' },
                { l1: '摸魚', name: '叠在生活', hours: 26.4, color: '#a78bfa' },
                { l1: '公眾號', name: '叠在學習', hours: 108.0, color: '#34d399' },
                { l1: '閱讀', name: '叠在學習', hours: 72.0, color: '#6ee7b7' },
                { l1: '臨時會議', name: '叠在上班', hours: 36.4, color: '#818cf8' }
            ]
        }
    }
};
