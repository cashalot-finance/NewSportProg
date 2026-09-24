package com.yogaflow.yogaapp;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.graphics.Color;
import android.os.Bundle;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.print.PrintAttributes;
import android.print.PrintManager;
import android.util.Log;
import android.view.Gravity;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
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
    private static final String TAG="YogaFlowBoot";
    private WebView web;
    private String status="Нативный Android-слой готов";

    @Override protected void onCreate(Bundle state){
        super.onCreate(state);
        installCrashRecorder();
        getWindow().setStatusBarColor(Color.rgb(243,241,234));
        getWindow().setNavigationBarColor(Color.rgb(243,241,234));
        showNativeHome();

        // CI-only hook. Release builds ignore this extra because FLAG_DEBUGGABLE is not set.
        boolean debuggable=(getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE)!=0;
        if(debuggable && getIntent()!=null && getIntent().getBooleanExtra("avatarSmoke",false)){
            new Handler(Looper.getMainLooper()).postDelayed(()->{
                try{
                    Intent i=new Intent(MainActivity.this,AvatarActivity.class);
                    i.putExtra("session","");
                    startActivity(i);
                }catch(Throwable t){Log.e(TAG,"avatar smoke launch",t);}
            },900);
        }
    }

    private void installCrashRecorder(){
        final Thread.UncaughtExceptionHandler previous=Thread.getDefaultUncaughtExceptionHandler();
        Thread.setDefaultUncaughtExceptionHandler((thread,error)->{
            try{
                StringWriter sw=new StringWriter();
                error.printStackTrace(new PrintWriter(sw));
                try(FileWriter out=new FileWriter(new File(getFilesDir(),"last-crash.txt"),false)){
                    out.write("YogaFlow 1.0 RC1\n"); out.write(sw.toString());
                }
            }catch(Throwable ignored){}
            if(previous!=null)previous.uncaughtException(thread,error);
        });
    }

    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}
    private TextView label(String value,float size,int color){
        TextView t=new TextView(this);t.setText(value);t.setTextSize(size);t.setTextColor(color);t.setGravity(Gravity.CENTER);return t;
    }

    private void showNativeHome(){
        destroyWeb();
        LinearLayout root=new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);root.setGravity(Gravity.CENTER);
        root.setPadding(dp(28),dp(50),dp(28),dp(36));root.setBackgroundColor(Color.rgb(243,241,234));
        TextView title=label("YogaFlow AI",31,Color.rgb(23,54,45));
        root.addView(title,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));
        TextView sub=label("Production candidate 1.0 RC1",14,Color.rgb(96,113,105));
        sub.setPadding(0,dp(7),0,dp(12));root.addView(sub,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));
        TextView state=label(status,14,Color.rgb(72,92,83));state.setPadding(0,0,0,dp(24));
        root.addView(state,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.WRAP_CONTENT));
        Button open=new Button(this);open.setText("Открыть YogaFlow");open.setAllCaps(false);open.setOnClickListener(v->openCore());
        root.addView(open,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(56)));
        setContentView(root);
    }

    private void configureWeb(WebView v){
        WebSettings s=v.getSettings();
        s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(false);
        s.setAllowFileAccess(true);s.setAllowContentAccess(false);s.setSupportZoom(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        v.setBackgroundColor(Color.rgb(243,241,234));
        v.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onConsoleMessage(ConsoleMessage m){
                if(m!=null)Log.d(TAG,"JS "+m.messageLevel()+": "+m.message());
                return true;
            }
        });
        v.setWebViewClient(new WebViewClient(){
            @Override public void onReceivedError(WebView view,WebResourceRequest req,WebResourceError err){
                if(req!=null&&req.isForMainFrame()){
                    status="Core не загрузился: "+(err!=null?err.getErrorCode():-1);
                    runOnUiThread(()->showNativeHome());
                }
            }
            @Override public boolean onRenderProcessGone(WebView view,RenderProcessGoneDetail detail){
                status="WebView восстановлен после сбоя renderer.";
                if(web==view)web=null;
                try{view.destroy();}catch(Throwable ignored){}
                runOnUiThread(()->showNativeHome());
                return true;
            }
        });
    }

    private void openCore(){
        try{
            if(Build.VERSION.SDK_INT>=26&&WebView.getCurrentWebViewPackage()==null){
                status="Android System WebView недоступен.";showNativeHome();return;
            }
            WebView candidate=new WebView(this);configureWeb(candidate);
            candidate.addJavascriptInterface(new CoreBridge(),"YogaNative");
            web=candidate;setContentView(web);web.loadUrl("file:///android_asset/core.htm");
        }catch(Throwable t){
            Log.e(TAG,"core startup",t);status="Core не запустился: "+t.getClass().getSimpleName();showNativeHome();
        }
    }

    public final class CoreBridge{
        @JavascriptInterface public void openAvatar(String sessionJson){
            runOnUiThread(()->{
                try{
                    Intent i=new Intent(MainActivity.this,AvatarActivity.class);
                    i.putExtra("session",sessionJson==null?"":sessionJson);
                    startActivity(i);
                }catch(Throwable t){Log.e(TAG,"avatar launch",t);}
            });
        }
        @JavascriptInterface public void printPage(){
            runOnUiThread(()->{
                if(web==null)return;
                try{
                    PrintManager pm=(PrintManager)getSystemService(PRINT_SERVICE);
                    pm.print("YogaFlow AI",web.createPrintDocumentAdapter("YogaFlow AI"),new PrintAttributes.Builder().build());
                }catch(Throwable t){Log.e(TAG,"print",t);}
            });
        }
    }

    private void destroyWeb(){
        if(web!=null){
            try{web.stopLoading();web.loadUrl("about:blank");web.removeJavascriptInterface("YogaNative");web.removeAllViews();web.destroy();}catch(Throwable ignored){}
            web=null;
        }
    }

    @Override public void onBackPressed(){
        if(web!=null){showNativeHome();}else{super.onBackPressed();}
    }
    @Override protected void onDestroy(){destroyWeb();super.onDestroy();}
}
