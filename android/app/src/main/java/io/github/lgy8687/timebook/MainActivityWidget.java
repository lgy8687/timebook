package io.github.lgy8687.timebook;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

public class MainActivityWidget extends AppWidgetProvider {
    private static final String PREFS = "main_widget";

    static void saveState(Context context, String name, long start) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        if (name.equals(prefs.getString("name", "")) && start == prefs.getLong("start", -1)) return;
        prefs.edit().putString("name", name).putLong("start", start).apply();
        AppWidgetManager manager = AppWidgetManager.getInstance(context);
        update(context, manager, manager.getAppWidgetIds(new ComponentName(context, MainActivityWidget.class)));
    }

    @Override public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        update(context, manager, ids);
    }

    private static void update(Context context, AppWidgetManager manager, int[] ids) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
        String name = prefs.getString("name", "打开应用同步主线");
        long start = prefs.getLong("start", 0);
        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.main_widget);
            views.setTextViewText(R.id.widget_name, name);
            views.setViewVisibility(R.id.widget_timer, start > 0 ? View.VISIBLE : View.GONE);
            if (start > 0) {
                long elapsed = Math.max(0, System.currentTimeMillis() - start);
                views.setChronometer(R.id.widget_timer, SystemClock.elapsedRealtime() - elapsed, null, true);
            }
            Intent open = new Intent(context, MainActivity.class);
            open.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent click = PendingIntent.getActivity(context, 0, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
            views.setOnClickPendingIntent(R.id.widget_root, click);
            manager.updateAppWidget(id, views);
        }
    }
}
