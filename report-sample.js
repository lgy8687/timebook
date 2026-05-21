/**
 * 报表沙盘样本 — 全部假数据，并入主页后替换为 aggregate(logs, period)
 * 并行 overlay：并行叠在对应主线一级时段上（方案 B）
 */
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
                range: '并行叠在主线时段上 · 样本',
                footnote: '并行可重叠累计，与主线不可相加；接入后用 parentId 归到主线段。'
            },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '86.4', sub: '小时（重叠累计）' },
                { icon: '📐', label: '叠在主线比', value: '12.0%', sub: '并行/主线时长' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '34.6h · 样本' }
            ],
            overlay: [
                {
                    mainL1: '上班',
                    mainHours: 321.5,
                    parallelHours: 41.8,
                    color: '#3b82f6',
                    stacks: [
                        { name: '摸魚', hours: 28.2, color: '#7c3aed' },
                        { name: '臨時會議', hours: 9.1, color: '#a78bfa' },
                        { name: '聽歌', hours: 4.5, color: '#c4b5fd' }
                    ]
                },
                {
                    mainL1: '生活',
                    mainHours: 311.6,
                    parallelHours: 28.4,
                    color: '#f59e0b',
                    stacks: [
                        { name: '摸魚', hours: 6.4, color: '#7c3aed' },
                        { name: '聽歌', hours: 3.6, color: '#c4b5fd' },
                        { name: '閱讀', hours: 18.4, color: '#10b981' }
                    ]
                },
                {
                    mainL1: '學習',
                    mainHours: 57.7,
                    parallelHours: 14.2,
                    color: '#10b981',
                    stacks: [
                        { name: '公眾號', hours: 9.8, color: '#34d399' },
                        { name: '閱讀', hours: 4.4, color: '#6ee7b7' }
                    ]
                },
                {
                    mainL1: '餐飲',
                    mainHours: 21.8,
                    parallelHours: 1.2,
                    color: '#06b6d4',
                    stacks: [{ name: '聽歌', hours: 1.2, color: '#c4b5fd' }]
                },
                {
                    mainL1: '交通',
                    mainHours: 8.1,
                    parallelHours: 0.8,
                    color: '#ef4444',
                    stacks: [{ name: '聽歌', hours: 0.8, color: '#c4b5fd' }]
                }
            ],
            activityLegend: [
                { name: '摸魚', hours: 34.6, color: '#7c3aed' },
                { name: '公眾號', hours: 27.0, color: '#34d399' },
                { name: '閱讀', hours: 22.8, color: '#6ee7b7' },
                { name: '臨時會議', hours: 9.1, color: '#a78bfa' },
                { name: '聽歌', hours: 8.9, color: '#c4b5fd' }
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
            meta: { title: '2026年5月20日', range: '并行叠在主线 · 样本', footnote: '样本数据。' },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '3.2', sub: '小时' },
                { icon: '📐', label: '叠在主线比', value: '13.6%', sub: '并行/主线' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '1.6h' }
            ],
            overlay: [
                { mainL1: '上班', mainHours: 10.5, parallelHours: 2.1, color: '#3b82f6', stacks: [{ name: '摸魚', hours: 1.6, color: '#7c3aed' }, { name: '公眾號', hours: 0.5, color: '#34d399' }] },
                { mainL1: '生活', mainHours: 9.2, parallelHours: 0.8, color: '#f59e0b', stacks: [{ name: '聽歌', hours: 0.5, color: '#c4b5fd' }] },
                { mainL1: '學習', mainHours: 2.4, parallelHours: 0.3, color: '#10b981', stacks: [{ name: '公眾號', hours: 0.3, color: '#34d399' }] }
            ],
            activityLegend: [
                { name: '摸魚', hours: 1.6, color: '#7c3aed' },
                { name: '公眾號', hours: 0.8, color: '#34d399' },
                { name: '聽歌', hours: 0.5, color: '#c4b5fd' }
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
            meta: { title: '2026年第21周', range: '并行叠在主线 · 样本', footnote: '样本数据。' },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '19.8', sub: '小时' },
                { icon: '📐', label: '叠在主线比', value: '12.1%', sub: '并行/主线' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '8.1h' }
            ],
            overlay: [
                { mainL1: '上班', mainHours: 72.5, parallelHours: 10.2, color: '#3b82f6', stacks: [{ name: '摸魚', hours: 8.1, color: '#7c3aed' }, { name: '臨時會議', hours: 2.1, color: '#a78bfa' }] },
                { mainL1: '生活', mainHours: 72.1, parallelHours: 6.4, color: '#f59e0b', stacks: [{ name: '閱讀', hours: 4.2, color: '#10b981' }] },
                { mainL1: '學習', mainHours: 14.2, parallelHours: 3.2, color: '#10b981', stacks: [{ name: '公眾號', hours: 3.2, color: '#34d399' }] }
            ],
            activityLegend: [
                { name: '摸魚', hours: 8.1, color: '#7c3aed' },
                { name: '公眾號', hours: 3.2, color: '#34d399' },
                { name: '閱讀', hours: 4.2, color: '#10b981' },
                { name: '臨時會議', hours: 2.1, color: '#a78bfa' }
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
            meta: { title: '2026年', range: '并行叠在主线 · 样本', footnote: '样本数据。' },
            summary: [
                { icon: '⏳', label: '并行总时长', value: '345.6', sub: '小时（样本期）' },
                { icon: '📐', label: '叠在主线比', value: '12.0%', sub: '并行/主线' },
                { icon: '🔝', label: '最常并行', value: '摸魚', sub: '138.4h' }
            ],
            overlay: [
                { mainL1: '上班', mainHours: 1286, parallelHours: 168, color: '#3b82f6', stacks: [{ name: '摸魚', hours: 112, color: '#7c3aed' }, { name: '臨時會議', hours: 36.4, color: '#a78bfa' }] },
                { mainL1: '生活', mainHours: 1246.4, parallelHours: 118, color: '#f59e0b', stacks: [{ name: '摸魚', hours: 26.4, color: '#7c3aed' }, { name: '閱讀', hours: 72, color: '#10b981' }] },
                { mainL1: '學習', mainHours: 230.8, parallelHours: 52, color: '#10b981', stacks: [{ name: '公眾號', hours: 48, color: '#34d399' }] }
            ],
            activityLegend: [
                { name: '摸魚', hours: 138.4, color: '#7c3aed' },
                { name: '公眾號', hours: 108.0, color: '#34d399' },
                { name: '閱讀', hours: 72.0, color: '#10b981' },
                { name: '臨時會議', hours: 36.4, color: '#a78bfa' }
            ]
        }
    }
};
