package io.github.lgy8687.timebook;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.HashSet;
import java.util.Set;

public class WidgetSettingsActivity extends Activity {
    @Override protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        android.content.SharedPreferences prefs = getSharedPreferences(MainActivityWidget.PREFS, MODE_PRIVATE);
        JSONArray rows;
        try { rows = new JSONObject(prefs.getString("daily", "{}")).optJSONArray("rows"); } catch (Exception e) { rows = null; }
        if (rows == null || rows.length() == 0) {
            new AlertDialog.Builder(this).setMessage("请先打开应用，获取活动列表。")
                .setPositiveButton("知道了", (d, w) -> finish()).setOnCancelListener(d -> finish()).show();
            return;
        }
        String[] labels = new String[rows.length()];
        String[] ids = new String[rows.length()];
        boolean[] checked = new boolean[rows.length()];
        Set<String> old = prefs.getStringSet("selected", null);
        for (int i = 0; i < rows.length(); i++) {
            JSONObject row = rows.optJSONObject(i);
            ids[i] = row.optString("id");
            labels[i] = row.optString("category") + " · " + row.optString("name");
            checked[i] = old == null || old.contains(ids[i]);
        }
        new AlertDialog.Builder(this).setTitle("选择桌面显示的活动")
            .setMultiChoiceItems(labels, checked, (d, index, value) -> checked[index] = value)
            .setPositiveButton("完成", (d, w) -> {
                Set<String> selected = new HashSet<>();
                for (int i = 0; i < ids.length; i++) if (checked[i]) selected.add(ids[i]);
                prefs.edit().putStringSet("selected", selected).apply();
                MainActivityWidget.refresh(this);
                finish();
            }).setNegativeButton("取消", (d, w) -> finish()).setOnCancelListener(d -> finish()).show();
    }
}
