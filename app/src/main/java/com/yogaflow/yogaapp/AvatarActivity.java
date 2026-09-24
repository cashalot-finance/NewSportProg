package com.yogaflow.yogaapp;

import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public final class AvatarActivity extends Activity {
    private static final String TAG="YogaFlowAvatar";
    private WebView web;
    private String session="";

    @Override protected void onCreate(Bundle state){
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(14,36,30));
        getWindow().setNavigationBarColor(Color.rgb(14,36,30));
        session=getIntent().getStringExtra("session");
        if(session==null)session="";
        try{
            web=new WebView(this);
            WebSettings s=web.getSettings();
            s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setAllowFileAccess(true);s.setAllowContentAccess(false);
            s.setDatabaseEnabled(false);s.setSupportZoom(false);
            web.setBackgroundColor(Color.rgb(14,36,30));
            web.addJavascriptInterface(new AvatarBridge(),"YogaAvatarNative");
            web.setWebChromeClient(new WebChromeClient());
            web.setWebViewClient(new WebViewClient(){
                @Override public boolean onRenderProcessGone(WebView v,RenderProcessGoneDetail d){
                    Log.e(TAG,"avatar renderer gone");
                    runOnUiThread(()->finish());
                    return true;
                }
            });
            setContentView(web);
            web.loadUrl("file:///android_asset/avatar.htm");
        }catch(Throwable t){
            Log.e(TAG,"avatar startup",t);finish();
        }
    }

    public final class AvatarBridge{
        @JavascriptInterface public String getSession(){return session;}
        @JavascriptInterface public void close(){runOnUiThread(()->finish());}
    }

    @Override public void onBackPressed(){finish();}
    @Override protected void onDestroy(){
        if(web!=null){try{web.stopLoading();web.removeJavascriptInterface("YogaAvatarNative");web.destroy();}catch(Throwable ignored){}web=null;}
        super.onDestroy();
    }
}
