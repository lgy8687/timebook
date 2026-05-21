/** 报表沙盘样本数据 — 并入主页后由 aggregate(logs, period, view) 替换 */
const REPORT_DATA = {
    month: {
        main: {
            meta: {
                title: '2026年4月',
                range: '2026年4月1日 → 4月30日',
                days: 30,
                records: 678,
                totalHours: 720.7,
                totalLabel: '主线总时长',
                sub: '日均 24.0h · 仅统计主线（parallel=false）',
                footnote: '主线时段互斥，单日合计不超过 24 小时。'
            },
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
            ],
            leaderboard: [
                { l2: '工作', l1: '上班', hours: 321.5, color: '#3b82f6' },
                { l2: '睡眠', l1: '生活', hours: 217.8, color: '#f59e0b' },
                { l2: '摸魚', l1: '生活', hours: 34.6, color: '#f59e0b' },
                { l2: '休息', l1: '生活', hours: 34.5, color: '#f59e0b' },
                { l2: '閱讀', l1: '學習', hours: 30.7, color: '#10b981' },
                { l2: '公眾號', l1: '學習', hours: 27.0, color: '#10b981' },
                { l2: '閱讀', l1: '生活', hours: 22.8, color: '#f59e0b' },
                { l2: '早午晚餐', l1: '餐飲', hours: 21.8, color: '#06b6d4' },
                { l2: '開車', l1: '交通', hours: 8.1, color: '#ef4444' },
                { l2: '鍛煉', l1: '生活', hours: 1.8, color: '#f59e0b' }
            ]
        },
        parallel: {
            meta: {
                title: '2026年4月',
                range: '2026年4月1日 → 4月30日',
                days: 30,
                records: 412,
                totalHours: 86.4,
                totalLabel: '并行总时长',
                sub: '日均 2.9h · 占主线 12.0%',
                ratioToMain: 0.12,
                footnote: '并行可从主线时段重叠累计，与主线不可相加。'
            },
            l1: [
                { name: '生活', hours: 38.2, color: '#f59e0b' },
                { name: '學習', hours: 39.1, color: '#10b981' },
                { name: '上班', hours: 9.1, color: '#3b82f6' }
            ],
            l2: [
                { l1: '生活', name: '摸魚', hours: 34.6, color: '#fcd34d' },
                { l1: '生活', name: '聽歌', hours: 3.6, color: '#fbbf24' },
                { l1: '學習', name: '公眾號', hours: 27.0, color: '#6ee7b7' },
                { l1: '學習', name: '閱讀', hours: 12.1, color: '#34d399' },
                { l1: '上班', name: '臨時會議', hours: 9.1, color: '#93c5fd' }
            ],
            leaderboard: [
                { l2: '摸魚', l1: '生活', hours: 34.6, color: '#f59e0b' },
                { l2: '公眾號', l1: '學習', hours: 27.0, color: '#10b981' },
                { l2: '閱讀', l1: '學習', hours: 12.1, color: '#10b981' },
                { l2: '臨時會議', l1: '上班', hours: 9.1, color: '#3b82f6' },
                { l2: '聽歌', l1: '生活', hours: 3.6, color: '#f59e0b' }
            ]
        }
    },
    day: {
        main: {
            meta: {
                title: '2026年5月20日',
                range: '00:00 → 24:00（北京时间）',
                days: 1,
                records: 42,
                totalHours: 23.6,
                totalLabel: '主线总时长',
                sub: '当日主线记录',
                footnote: '日报：24 小时时间轴将在下一步加入。'
            },
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
            ],
            leaderboard: [
                { l2: '工作', l1: '上班', hours: 10.5, color: '#3b82f6' },
                { l2: '睡眠', l1: '生活', hours: 7.0, color: '#f59e0b' },
                { l2: '休息', l1: '生活', hours: 2.2, color: '#f59e0b' },
                { l2: '閱讀', l1: '學習', hours: 2.4, color: '#10b981' },
                { l2: '早午晚餐', l1: '餐飲', hours: 1.2, color: '#06b6d4' },
                { l2: '開車', l1: '交通', hours: 0.3, color: '#ef4444' }
            ]
        },
        parallel: {
            meta: {
                title: '2026年5月20日',
                range: '00:00 → 24:00（北京时间）',
                days: 1,
                records: 18,
                totalHours: 3.2,
                totalLabel: '并行总时长',
                sub: '占主线 13.6%',
                ratioToMain: 0.136,
                footnote: '并行可从主线时段重叠累计。'
            },
            l1: [
                { name: '生活', hours: 2.1, color: '#f59e0b' },
                { name: '學習', hours: 1.1, color: '#10b981' }
            ],
            l2: [
                { l1: '生活', name: '摸魚', hours: 1.6, color: '#fcd34d' },
                { l1: '生活', name: '聽歌', hours: 0.5, color: '#fbbf24' },
                { l1: '學習', name: '公眾號', hours: 1.1, color: '#6ee7b7' }
            ],
            leaderboard: [
                { l2: '摸魚', l1: '生活', hours: 1.6, color: '#f59e0b' },
                { l2: '公眾號', l1: '學習', hours: 1.1, color: '#10b981' },
                { l2: '聽歌', l1: '生活', hours: 0.5, color: '#f59e0b' }
            ]
        }
    },
    week: {
        main: {
            meta: {
                title: '2026年第21周',
                range: '5月19日（周一）→ 5月25日（周日）',
                days: 7,
                records: 312,
                totalHours: 164.2,
                totalLabel: '主线总时长',
                sub: '日均 23.5h · 周一起算',
                footnote: '周报按周一至周日汇总（北京时间）。'
            },
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
                { l1: '生活', name: '休息', hours: 8.0, color: '#f59e0b' },
                { l1: '學習', name: '閱讀', hours: 8.2, color: '#6ee7b7' },
                { l1: '學習', name: '公眾號', hours: 6.0, color: '#34d399' },
                { l1: '餐飲', name: '早午晚餐', hours: 4.8, color: '#67e8f9' },
                { l1: '交通', name: '開車', hours: 0.6, color: '#fca5a5' }
            ],
            leaderboard: [
                { l2: '工作', l1: '上班', hours: 72.5, color: '#3b82f6' },
                { l2: '睡眠', l1: '生活', hours: 50.2, color: '#f59e0b' },
                { l2: '摸魚', l1: '生活', hours: 8.1, color: '#f59e0b' },
                { l2: '休息', l1: '生活', hours: 8.0, color: '#f59e0b' },
                { l2: '閱讀', l1: '學習', hours: 8.2, color: '#10b981' },
                { l2: '公眾號', l1: '學習', hours: 6.0, color: '#10b981' },
                { l2: '早午晚餐', l1: '餐飲', hours: 4.8, color: '#06b6d4' },
                { l2: '開車', l1: '交通', hours: 0.6, color: '#ef4444' }
            ]
        },
        parallel: {
            meta: {
                title: '2026年第21周',
                range: '5月19日（周一）→ 5月25日（周日）',
                days: 7,
                records: 198,
                totalHours: 19.8,
                totalLabel: '并行总时长',
                sub: '占主线 12.1%',
                ratioToMain: 0.121,
                footnote: '并行可从主线时段重叠累计。'
            },
            l1: [
                { name: '生活', hours: 9.2, color: '#f59e0b' },
                { name: '學習', hours: 9.6, color: '#10b981' },
                { name: '上班', hours: 1.0, color: '#3b82f6' }
            ],
            l2: [
                { l1: '生活', name: '摸魚', hours: 8.1, color: '#fcd34d' },
                { l1: '學習', name: '公眾號', hours: 6.0, color: '#6ee7b7' },
                { l1: '學習', name: '閱讀', hours: 3.6, color: '#34d399' },
                { l1: '上班', name: '臨時會議', hours: 1.0, color: '#93c5fd' }
            ],
            leaderboard: [
                { l2: '摸魚', l1: '生活', hours: 8.1, color: '#f59e0b' },
                { l2: '公眾號', l1: '學習', hours: 6.0, color: '#10b981' },
                { l2: '閱讀', l1: '學習', hours: 3.6, color: '#10b981' },
                { l2: '臨時會議', l1: '上班', hours: 1.0, color: '#3b82f6' }
            ]
        }
    },
    year: {
        main: {
            meta: {
                title: '2026年',
                range: '1月1日 → 12月31日（样本截至4月）',
                days: 120,
                records: 2140,
                totalHours: 2882.4,
                totalLabel: '主线总时长',
                sub: '样本期日均 24.0h',
                footnote: '年报样本仅含前四月，接入后按全年日志汇总。'
            },
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
                { l1: '生活', name: '休息', hours: 138.0, color: '#f59e0b' },
                { l1: '學習', name: '閱讀', hours: 122.8, color: '#6ee7b7' },
                { l1: '學習', name: '公眾號', hours: 108.0, color: '#34d399' },
                { l1: '餐飲', name: '早午晚餐', hours: 87.2, color: '#67e8f9' },
                { l1: '交通', name: '開車', hours: 32.4, color: '#fca5a5' }
            ],
            leaderboard: [
                { l2: '工作', l1: '上班', hours: 1286.0, color: '#3b82f6' },
                { l2: '睡眠', l1: '生活', hours: 871.2, color: '#f59e0b' },
                { l2: '摸魚', l1: '生活', hours: 138.4, color: '#f59e0b' },
                { l2: '休息', l1: '生活', hours: 138.0, color: '#f59e0b' },
                { l2: '閱讀', l1: '學習', hours: 122.8, color: '#10b981' },
                { l2: '公眾號', l1: '學習', hours: 108.0, color: '#10b981' },
                { l2: '早午晚餐', l1: '餐飲', hours: 87.2, color: '#06b6d4' },
                { l2: '開車', l1: '交通', hours: 32.4, color: '#ef4444' }
            ]
        },
        parallel: {
            meta: {
                title: '2026年',
                range: '1月1日 → 12月31日（样本截至4月）',
                days: 120,
                records: 1240,
                totalHours: 345.6,
                totalLabel: '并行总时长',
                sub: '占主线 12.0%',
                ratioToMain: 0.12,
                footnote: '并行可从主线时段重叠累计。'
            },
            l1: [
                { name: '生活', hours: 152.8, color: '#f59e0b' },
                { name: '學習', hours: 156.4, color: '#10b981' },
                { name: '上班', hours: 36.4, color: '#3b82f6' }
            ],
            l2: [
                { l1: '生活', name: '摸魚', hours: 138.4, color: '#fcd34d' },
                { l1: '學習', name: '公眾號', hours: 108.0, color: '#6ee7b7' },
                { l1: '學習', name: '閱讀', hours: 48.4, color: '#34d399' },
                { l1: '上班', name: '臨時會議', hours: 36.4, color: '#93c5fd' }
            ],
            leaderboard: [
                { l2: '摸魚', l1: '生活', hours: 138.4, color: '#f59e0b' },
                { l2: '公眾號', l1: '學習', hours: 108.0, color: '#10b981' },
                { l2: '閱讀', l1: '學習', hours: 48.4, color: '#10b981' },
                { l2: '臨時會議', l1: '上班', hours: 36.4, color: '#3b82f6' }
            ]
        }
    }
};
