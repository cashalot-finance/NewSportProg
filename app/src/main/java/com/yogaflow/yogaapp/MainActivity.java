package com.yogaflow.yogaapp;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Build;
import android.util.Log;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import java.io.File;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.StringWriter;

public final class MainActivity extends Activity {
    private static final String TAG = "YogaFlowBoot";
    private WebView web;
    private String status = "Нативный Android-слой запущен";

    @Override protected void onCreate(Bundle state) {
        super.onCreate(state);
        installCrashRecorder();
        getWindow().setStatusBarColor(Color.rgb(244,241,233));
        getWindow().setNavigationBarColor(Color.rgb(244,241,233));
        showNativeHome();
    }

    private void installCrashRecorder() {
        final Thread.UncaughtExceptionHandler previous = Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread, error) -> {
            try {
                StringWriter sw = new StringWriter();
                error.printStackTrace(new PrintWriter(sw));
                try (FileWriter out = new FileWriter(new File(getFilesDir(),"last-crash.txt"), false)) {
                    out.write("YogaFlow 0.8\n");
                    out.write(sw.toString());
                }
            } catch (Throwable ignored) {}
            if (previous != null) previous.uncaughtException(thread,error);
        });
    }

    private int dp(int v){ return Math.round(v * getResources().getDisplayMetrics().density); }

    private TextView label(String value,float size,int color){
        TextView t=new TextView(this);
        t.setText(value); t.setTextSize(size); t.setTextColor(color); t.setGravity(Gravity.CENTER);
        return t;
    }

    private void showNativeHome(){
        destroyWeb();
        LinearLayout root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setGravity(Gravity.CENTER);
        root.setPadding(dp(28),dp(48),dp(28),dp(36));
        root.setBackgroundColor(Color.rgb(244,241,233));

        TextView title=label("YogaFlow AI",31,Color.rgb(24,55,47));
        root.addView(title,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView sub=label("Clean Android build 0.8",14,Color.rgb(86,108,98));
        sub.setPadding(0,dp(7),0,dp(18));
        root.addView(sub,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));

        TextView state=label(status,15,Color.rgb(70,91,82));
        state.setPadding(0,0,0,dp(24));
        root.addView(state,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));

        Button open=new Button(this);
        open.setText("Открыть YogaFlow");
        open.setAllCaps(false);
        open.setOnClickListener(v -> openCore());
        root.addView(open,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(56)));

        setContentView(root);
    }

    private void openCore(){
        try {
            if(Build.VERSION.SDK_INT>=26 && WebView.getCurrentWebViewPackage()==null){
                status="Android System WebView недоступен. Обновите WebView/Chrome.";
                showNativeHome(); return;
            }
            WebView candidate=new WebView(this);
            WebSettings s=candidate.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setDatabaseEnabled(false);
            s.setAllowFileAccess(true);
            s.setAllowContentAccess(false);
            s.setMediaPlaybackRequiresUserGesture(true);
            s.setSupportZoom(false);
            candidate.setBackgroundColor(Color.rgb(244,241,233));

            candidate.setWebChromeClient(new WebChromeClient(){
                @Override public boolean onConsoleMessage(ConsoleMessage m){
                    if(m!=null) Log.d(TAG,"JS "+m.messageLevel()+": "+m.message());
                    return true;
                }
            });

            candidate.setWebViewClient(new WebViewClient(){
                @Override public void onReceivedError(WebView v, WebResourceRequest req, WebResourceError err){
                    if(req!=null && req.isForMainFrame()){
                        status="Core не загрузился. Код "+(err!=null?err.getErrorCode():-1);
                        runOnUiThread(() -> showNativeHome());
                    }
                }
                @Override public boolean onRenderProcessGone(WebView v, RenderProcessGoneDetail detail){
                    status="WebView renderer остановлен безопасно.";
                    if(web==v) web=null;
                    try { v.destroy(); } catch(Throwable ignored){}
                    runOnUiThread(() -> showNativeHome());
                    return true;
                }
            });

            web=candidate;
            setContentView(web);
            web.loadUrl("file:///android_asset/core.htm");
        } catch(Throwable t){
            Log.e(TAG,"WebView startup failed",t);
            status="WebView не запустился: "+t.getClass().getSimpleName();
            showNativeHome();
        }
    }

    private void destroyWeb(){
        if(web!=null){
            try { web.stopLoading(); web.loadUrl("about:blank"); web.removeAllViews(); web.destroy(); } catch(Throwable ignored){}
            web=null;
        }
    }

    @Override public void onBackPressed(){
        if(web!=null){ showNativeHome(); } else { super.onBackPressed(); }
    }

    @Override protected void onDestroy(){ destroyWeb(); super.onDestroy(); }
}
