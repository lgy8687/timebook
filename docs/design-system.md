# Interface Rules

- Titles: 16px, weight 700. Body text, control labels and activity names: 14px, weight 600. Secondary descriptions: 12px, normal weight. Timers and primary totals may be larger; chart axes and compact clock captions may be smaller where geometry requires it.
- Use the system sans-serif stack throughout. Numeric times use tabular figures. Letter spacing is zero.
- Normal text is #334155, secondary text #64748b. Interaction accent is #526a91 with a light #edf2f8 surface. Red is reserved for destructive actions. Category and scene colors continue to represent the user's data.
- Segmented controls use one shared style for report periods, main/parallel views, category settings, summary settings and recording mode. Equal-width options, 36px minimum inner height, filled selected state.
- Regular actions are at least 40px high; modal confirmation buttons are 44px. Icon-only actions retain descriptive accessible labels.
- Keep 8/12/16/20px spacing. Category, main shortcut and parallel shortcut settings remain separate tabs. Shortcut selection continues to use the existing drawer.
- Shared rules live in design-system.css, loaded after page-specific styles. Theme defaults in ui-theme.js follow the same scale; explicit user appearance preferences remain supported.
- Check mobile widths 320px and 390px plus desktop. Verify populated and empty reports, category tabs, drawers and time-edit dialogs. Never resize or expose the swipe-action layer when adjusting row appearance.
