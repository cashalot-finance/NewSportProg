package com.yogaflow.yogaapp;

import android.app.Activity;
import android.graphics.Color;
import android.opengl.GLES20;
import android.opengl.GLSurfaceView;
import android.opengl.Matrix;
import android.os.Bundle;
import android.view.Gravity;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.FloatBuffer;
import java.nio.ShortBuffer;
import java.util.ArrayList;
import java.util.List;
import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

public final class AvatarActivity extends Activity {
    private AvatarSurface surface;
    private TextView title, timer, counter;
    private Button play;
    private Session session;
    private int index=0;
    private float elapsed=0f;
    private boolean playing=true;
    private long lastMs=0;

    @Override protected void onCreate(Bundle state){
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(13,33,28));
        getWindow().setNavigationBarColor(Color.rgb(13,33,28));
        session=Session.parse(getIntent().getStringExtra("session"));
        buildUi();
    }

    private int dp(int v){return Math.round(v*getResources().getDisplayMetrics().density);}

    private TextView text(String s,int sp,int color){
        TextView t=new TextView(this);t.setText(s);t.setTextSize(sp);t.setTextColor(color);return t;
    }

    private Button button(String s){
        Button b=new Button(this);b.setText(s);b.setAllCaps(false);return b;
    }

    private void buildUi(){
        FrameLayout root=new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(13,33,28));

        surface=new AvatarSurface(this);
        root.addView(surface,new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,ViewGroup.LayoutParams.MATCH_PARENT));

        LinearLayout top=new LinearLayout(this);
        top.setOrientation(LinearLayout.HORIZONTAL);top.setGravity(Gravity.CENTER_VERTICAL);
        top.setPadding(dp(14),dp(12),dp(14),dp(8));
        top.setBackgroundColor(Color.argb(215,14,38,32));
        TextView brand=text("YogaFlow 3D",18,Color.WHITE);
        top.addView(brand,new LinearLayout.LayoutParams(0,dp(48),1));
        Button close=button("Закрыть"); close.setOnClickListener(v->finish());
        top.addView(close,new LinearLayout.LayoutParams(dp(110),dp(48)));
        FrameLayout.LayoutParams tp=new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(72),Gravity.TOP);
        root.addView(top,tp);

        LinearLayout panel=new LinearLayout(this);
        panel.setOrientation(LinearLayout.VERTICAL);panel.setGravity(Gravity.CENTER);
        panel.setPadding(dp(14),dp(10),dp(14),dp(14));
        panel.setBackgroundColor(Color.argb(232,14,38,32));

        title=text("",20,Color.WHITE);title.setGravity(Gravity.CENTER);
        panel.addView(title,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(34)));

        LinearLayout stats=new LinearLayout(this);stats.setGravity(Gravity.CENTER);
        timer=text("0:00",18,Color.rgb(228,236,232));timer.setGravity(Gravity.CENTER);
        counter=text("1/1",16,Color.rgb(177,199,189));counter.setGravity(Gravity.CENTER);
        stats.addView(timer,new LinearLayout.LayoutParams(0,dp(36),1));
        stats.addView(counter,new LinearLayout.LayoutParams(0,dp(36),1));
        panel.addView(stats,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(40)));

        LinearLayout controls=new LinearLayout(this);
        Button prev=button("←");play=button("Пауза");Button next=button("→");
        prev.setOnClickListener(v->{if(index>0){index--;elapsed=0;syncPose();}});
        next.setOnClickListener(v->{if(index<session.poses.size()-1){index++;elapsed=0;syncPose();}});
        play.setOnClickListener(v->{playing=!playing;play.setText(playing?"Пауза":"Продолжить");lastMs=System.currentTimeMillis();});
        controls.addView(prev,new LinearLayout.LayoutParams(0,dp(52),1));
        controls.addView(play,new LinearLayout.LayoutParams(0,dp(52),1.4f));
        controls.addView(next,new LinearLayout.LayoutParams(0,dp(52),1));
        panel.addView(controls,new LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(56)));

        FrameLayout.LayoutParams pp=new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT,dp(150),Gravity.BOTTOM);
        root.addView(panel,pp);

        setContentView(root);
        syncPose();
        lastMs=System.currentTimeMillis();
        panel.post(tick);
    }

    private final Runnable tick=new Runnable(){
        @Override public void run(){
            long now=System.currentTimeMillis();
            if(playing){
                elapsed+=(now-lastMs)/1000f;
                PoseItem p=session.poses.get(index);
                if(elapsed>=p.sec){
                    if(index<session.poses.size()-1){index++;elapsed=0;syncPose();}
                    else{elapsed=p.sec;playing=false;play.setText("Готово");}
                }
            }
            lastMs=now;
            PoseItem p=session.poses.get(index);
            timer.setText(format(Math.max(0,p.sec-elapsed)));
            surface.renderer.setBreath((float)((Math.sin(now/1100.0)+1)*.5));
            title.postDelayed(this,100);
        }
    };

    private String format(float s){int x=Math.max(0,Math.round(s));return (x/60)+":"+String.format("%02d",x%60);}

    private void syncPose(){
        PoseItem p=session.poses.get(index);
        title.setText(p.name);
        counter.setText((index+1)+"/"+session.poses.size());
        surface.renderer.setVisual(p.visual);
        timer.setText(format(p.sec));
    }

    @Override protected void onPause(){super.onPause();surface.onPause();}
    @Override protected void onResume(){super.onResume();surface.onResume();}
    @Override protected void onDestroy(){super.onDestroy();}

    static final class PoseItem{
        final String name,visual; final int sec;
        PoseItem(String n,String v,int s){name=n;visual=v;sec=Math.max(10,Math.min(50,s));}
    }

    static final class Session{
        final List<PoseItem> poses=new ArrayList<>();
        static Session parse(String raw){
            Session s=new Session();
            try{
                JSONObject o=new JSONObject(raw==null?"{}":raw);
                JSONArray a=o.optJSONArray("poses");
                if(a!=null)for(int i=0;i<a.length();i++){
                    JSONObject p=a.optJSONObject(i);if(p==null)continue;
                    s.poses.add(new PoseItem(p.optString("name","Асана"),p.optString("visual","standing"),p.optInt("sec",30)));
                }
            }catch(Throwable ignored){}
            if(s.poses.isEmpty()){
                s.poses.add(new PoseItem("Гора","standing",30));
                s.poses.add(new PoseItem("Воин II","warrior2",30));
                s.poses.add(new PoseItem("Треугольник","triangle",30));
                s.poses.add(new PoseItem("Шавасана","savasana",40));
            }
            return s;
        }
    }

    static final class AvatarSurface extends GLSurfaceView {
        final HumanRenderer renderer;
        private float lastX;
        AvatarSurface(Activity c){
            super(c);setEGLContextClientVersion(2);renderer=new HumanRenderer();setRenderer(renderer);
            setRenderMode(GLSurfaceView.RENDERMODE_CONTINUOUSLY);
        }
        @Override public boolean onTouchEvent(MotionEvent e){
            if(e.getAction()==MotionEvent.ACTION_DOWN){lastX=e.getX();return true;}
            if(e.getAction()==MotionEvent.ACTION_MOVE){float dx=e.getX()-lastX;lastX=e.getX();renderer.yaw+=dx/getWidth()*2.2f;return true;}
            return true;
        }
    }

    static final class HumanRenderer implements GLSurfaceView.Renderer {
        int program,aPos,aNorm,uMvp,uModel,uNormal,uColor,uLight;
        Sphere sphere;
        final float[] proj=new float[16],view=new float[16],vp=new float[16],model=new float[16],mvp=new float[16];
        volatile String visual="standing";
        volatile float breath=.5f;
        volatile float yaw=.35f;

        public void setVisual(String v){visual=v==null?"standing":v;}
        public void setBreath(float b){breath=b;}

        @Override public void onSurfaceCreated(GL10 unused,EGLConfig cfg){
            GLES20.glClearColor(.035f,.075f,.062f,1);
            GLES20.glEnable(GLES20.GL_DEPTH_TEST);GLES20.glEnable(GLES20.GL_CULL_FACE);
            String vs="attribute vec3 aPos;attribute vec3 aNorm;uniform mat4 uMvp;uniform mat4 uModel;uniform mat3 uNormal;varying vec3 vN;varying vec3 vP;void main(){vec4 w=uModel*vec4(aPos,1.0);vP=w.xyz;vN=normalize(uNormal*aNorm);gl_Position=uMvp*vec4(aPos,1.0);}";
            String fs="precision mediump float;varying vec3 vN;varying vec3 vP;uniform vec4 uColor;uniform vec3 uLight;void main(){vec3 n=normalize(vN);float d=max(dot(n,normalize(uLight)),0.0);float rim=pow(1.0-max(n.z,0.0),2.0);vec3 c=uColor.rgb*(0.32+0.64*d)+uColor.rgb*0.14*rim;gl_FragColor=vec4(c,uColor.a);}";
            program=link(vs,fs);aPos=GLES20.glGetAttribLocation(program,"aPos");aNorm=GLES20.glGetAttribLocation(program,"aNorm");
            uMvp=GLES20.glGetUniformLocation(program,"uMvp");uModel=GLES20.glGetUniformLocation(program,"uModel");uNormal=GLES20.glGetUniformLocation(program,"uNormal");uColor=GLES20.glGetUniformLocation(program,"uColor");uLight=GLES20.glGetUniformLocation(program,"uLight");
            sphere=new Sphere(20,14);
        }

        @Override public void onSurfaceChanged(GL10 u,int w,int h){
            GLES20.glViewport(0,0,w,h);Matrix.perspectiveM(proj,0,45f,(float)w/Math.max(1,h),.05f,20f);
        }

        @Override public void onDrawFrame(GL10 u){
            GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT|GLES20.GL_DEPTH_BUFFER_BIT);
            float ex=(float)Math.sin(yaw)*3.2f,ez=(float)Math.cos(yaw)*3.2f;
            Matrix.setLookAtM(view,0,ex,1.15f,ez,0,.86f,0,0,1,0);Matrix.multiplyMM(vp,0,proj,0,view,0);
            GLES20.glUseProgram(program);GLES20.glUniform3f(uLight,-.35f,.80f,.55f);
            J j=pose(visual);
            float[] skin={.72f,.43f,.31f,1},skin2={.82f,.52f,.38f,1},top={.08f,.30f,.24f,1},pants={.035f,.08f,.07f,1},hair={.035f,.02f,.015f,1},white={.95f,.95f,.93f,1},iris={.12f,.30f,.24f,1},lip={.48f,.14f,.15f,1};

            limb(j.hipL,j.lk,.085f,pants);limb(j.lk,j.lf,.068f,pants);limb(j.hipR,j.rk,.085f,pants);limb(j.rk,j.rf,.068f,pants);
            limb(j.ls,j.le,.064f,skin2);limb(j.le,j.lh,.050f,skin2);limb(j.rs,j.re,.064f,skin2);limb(j.re,j.rh,.050f,skin2);

            float[] torsoMid=mid(j.hip,j.neck);float torsoLen=dist(j.hip,j.neck);
            ellipsoid(torsoMid,.23f*(1+.02f*breath),torsoLen*.52f,.145f*(1+.035f*breath),top);
            ellipsoid(j.hip,.21f,.15f,.16f,pants);

            ellipsoid(j.head,.115f,.145f,.105f,skin);
            ellipsoid(add(j.head,0,.05f,-.015f),.118f,.090f,.108f,hair);
            ellipsoid(add(j.head,-.041f,.025f,.100f),.020f,.013f,.010f,white);
            ellipsoid(add(j.head,.041f,.025f,.100f),.020f,.013f,.010f,white);
            ellipsoid(add(j.head,-.041f,.025f,.110f),.008f,.008f,.005f,iris);
            ellipsoid(add(j.head,.041f,.025f,.110f),.008f,.008f,.005f,iris);
            ellipsoid(add(j.head,0,-.010f,.115f),.019f,.027f,.022f,skin2);
            ellipsoid(add(j.head,0,-.060f,.107f),.034f,.008f,.008f,lip);
            ellipsoid(j.lh,.060f,.035f,.075f,skin2);ellipsoid(j.rh,.060f,.035f,.075f,skin2);
            ellipsoid(j.lf,.072f,.035f,.13f,skin2);ellipsoid(j.rf,.072f,.035f,.13f,skin2);
        }

        void limb(float[] a,float[] b,float r,float[] c){
            float[] m=mid(a,b);float len=dist(a,b);float[] dir=norm(sub(b,a));
            float[] up={0,1,0},axis=cross(up,dir);float alen=(float)Math.sqrt(dot(axis,axis));float angle=(float)Math.toDegrees(Math.acos(clamp(dot(up,dir),-1,1)));
            Matrix.setIdentityM(model,0);Matrix.translateM(model,0,m[0],m[1],m[2]);
            if(alen>.0001f){axis=scale(axis,1f/alen);Matrix.rotateM(model,0,angle,axis[0],axis[1],axis[2]);}
            Matrix.scaleM(model,0,r,len*.52f,r);draw(c);
        }

        void ellipsoid(float[] c,float sx,float sy,float sz,float[] color){
            Matrix.setIdentityM(model,0);Matrix.translateM(model,0,c[0],c[1],c[2]);Matrix.scaleM(model,0,sx,sy,sz);draw(color);
        }

        void draw(float[] color){
            Matrix.multiplyMM(mvp,0,vp,0,model,0);
            float[] n={model[0],model[1],model[2],model[4],model[5],model[6],model[8],model[9],model[10]};
            GLES20.glUniformMatrix4fv(uMvp,1,false,mvp,0);GLES20.glUniformMatrix4fv(uModel,1,false,model,0);GLES20.glUniformMatrix3fv(uNormal,1,false,n,0);GLES20.glUniform4fv(uColor,1,color,0);
            sphere.draw(aPos,aNorm);
        }

        J pose(String v){
            J j=new J();
            if(v.contains("warrior2")||v.contains("goddess")){j.le=f(-.58f,1.43f,0);j.lh=f(-.87f,1.43f,0);j.re=f(.58f,1.43f,0);j.rh=f(.87f,1.43f,0);j.lk=f(-.35f,.54f,0);j.lf=f(-.62f,.05f,0);j.rk=f(.43f,.54f,0);j.rf=f(.75f,.05f,0);}
            else if(v.contains("warrior1")||v.contains("lunge")){j.lh=f(-.16f,1.90f,.02f);j.rh=f(.16f,1.90f,.02f);j.le=f(-.13f,1.67f,.01f);j.re=f(.13f,1.67f,.01f);j.lk=f(-.24f,.50f,.16f);j.lf=f(-.39f,.05f,.30f);j.rk=f(.25f,.44f,-.20f);j.rf=f(.42f,.05f,-.38f);}
            else if(v.contains("triangle")){j.lh=f(-.58f,.54f,0);j.le=f(-.44f,.92f,0);j.rh=f(.10f,1.86f,0);j.re=f(.02f,1.62f,0);j.head=f(-.16f,1.45f,0);j.neck=f(-.10f,1.32f,0);j.lk=f(-.35f,.50f,0);j.lf=f(-.62f,.05f,0);j.rk=f(.39f,.50f,0);j.rf=f(.70f,.05f,0);}
            else if(v.contains("tree")||v.contains("standing_balance")){j.rk=f(.30f,.74f,0);j.rf=f(-.02f,.50f,.02f);j.lh=f(-.08f,1.89f,0);j.rh=f(.08f,1.89f,0);j.le=f(-.15f,1.68f,0);j.re=f(.15f,1.68f,0);}
            else if(v.contains("chair")||v.contains("squat")){j.hip=f(0,.78f,.12f);j.resetHips();j.lk=f(-.16f,.42f,.30f);j.rk=f(.16f,.42f,.30f);j.lf=f(-.16f,.05f,.36f);j.rf=f(.16f,.05f,.36f);j.lh=f(-.12f,1.76f,.08f);j.rh=f(.12f,1.76f,.08f);}
            else if(v.contains("downdog")||v.contains("dolphin")){j.hip=f(0,1.05f,0);j.resetHips();j.neck=f(0,.62f,.48f);j.head=f(0,.53f,.58f);j.ls=f(-.20f,.64f,.44f);j.rs=f(.20f,.64f,.44f);j.le=f(-.28f,.34f,.64f);j.re=f(.28f,.34f,.64f);j.lh=f(-.31f,.05f,.79f);j.rh=f(.31f,.05f,.79f);j.lk=f(-.18f,.56f,-.12f);j.rk=f(.18f,.56f,-.12f);j.lf=f(-.23f,.05f,-.38f);j.rf=f(.23f,.05f,-.38f);}
            else if(v.contains("plank")||v.contains("chaturanga")){j.hip=f(0,.58f,0);j.resetHips();j.neck=f(0,.68f,.48f);j.head=f(0,.70f,.66f);j.lh=f(-.31f,.05f,.80f);j.rh=f(.31f,.05f,.80f);j.le=f(-.27f,.34f,.66f);j.re=f(.27f,.34f,.66f);j.lk=f(-.16f,.31f,-.28f);j.rk=f(.16f,.31f,-.28f);j.lf=f(-.16f,.05f,-.56f);j.rf=f(.16f,.05f,-.56f);}
            else if(v.contains("cobra")||v.contains("sphinx")||v.contains("locust")||v.contains("bow")){j.hip=f(0,.20f,-.10f);j.resetHips();j.neck=f(0,.70f,.40f);j.head=f(0,.89f,.48f);j.ls=f(-.23f,.65f,.31f);j.rs=f(.23f,.65f,.31f);j.le=f(-.28f,.28f,.43f);j.re=f(.28f,.28f,.43f);j.lh=f(-.30f,.05f,.54f);j.rh=f(.30f,.05f,.54f);j.lk=f(-.14f,.10f,-.42f);j.rk=f(.14f,.10f,-.42f);j.lf=f(-.14f,.04f,-.72f);j.rf=f(.14f,.04f,-.72f);}
            else if(v.contains("seated")||v.contains("butterfly")||v.contains("lotus")||v.contains("boat")){j.hip=f(0,.46f,0);j.resetHips();j.neck=f(0,1.02f,.03f);j.head=f(0,1.20f,.04f);j.ls=f(-.25f,.98f,.02f);j.rs=f(.25f,.98f,.02f);j.lk=f(-.40f,.23f,.24f);j.rk=f(.40f,.23f,.24f);j.lf=f(-.22f,.05f,.47f);j.rf=f(.22f,.05f,.47f);j.lh=f(-.30f,.37f,.32f);j.rh=f(.30f,.37f,.32f);}
            else if(v.contains("savasana")||v.contains("supine")||v.contains("figure4")||v.contains("knees_chest")||v.contains("constructive")){j.hip=f(0,.12f,0);j.resetHips();j.neck=f(0,.14f,.48f);j.head=f(0,.15f,.67f);j.ls=f(-.24f,.13f,.40f);j.rs=f(.24f,.13f,.40f);j.le=f(-.48f,.10f,.25f);j.re=f(.48f,.10f,.25f);j.lh=f(-.69f,.07f,.20f);j.rh=f(.69f,.07f,.20f);j.lk=f(-.18f,.09f,-.38f);j.rk=f(.18f,.09f,-.38f);j.lf=f(-.22f,.06f,-.72f);j.rf=f(.22f,.06f,-.72f);}
            else if(v.contains("bridge")||v.contains("wheel")){j.hip=f(0,.55f,.05f);j.resetHips();j.neck=f(0,.15f,.49f);j.head=f(0,.13f,.68f);j.lk=f(-.18f,.38f,-.12f);j.rk=f(.18f,.38f,-.12f);j.lf=f(-.20f,.05f,-.40f);j.rf=f(.20f,.05f,-.40f);j.lh=f(-.32f,.07f,.29f);j.rh=f(.32f,.07f,.29f);}
            else if(v.contains("headstand")||v.contains("handstand")||v.contains("forearm_stand")||v.contains("shoulderstand")){j.head=f(0,.18f,0);j.neck=f(0,.34f,0);j.hip=f(0,1.12f,0);j.resetHips();j.lk=f(-.10f,1.48f,0);j.rk=f(.10f,1.48f,0);j.lf=f(-.08f,1.84f,0);j.rf=f(.08f,1.84f,0);j.ls=f(-.24f,.40f,0);j.rs=f(.24f,.40f,0);j.le=f(-.30f,.20f,0);j.re=f(.30f,.20f,0);j.lh=f(-.30f,.05f,0);j.rh=f(.30f,.05f,0);}
            return j;
        }

        int link(String vs,String fs){int v=shader(GLES20.GL_VERTEX_SHADER,vs),f=shader(GLES20.GL_FRAGMENT_SHADER,fs),p=GLES20.glCreateProgram();GLES20.glAttachShader(p,v);GLES20.glAttachShader(p,f);GLES20.glLinkProgram(p);return p;}
        int shader(int type,String src){int s=GLES20.glCreateShader(type);GLES20.glShaderSource(s,src);GLES20.glCompileShader(s);return s;}
        static float clamp(float v,float a,float b){return Math.max(a,Math.min(b,v));}
        static float[] f(float x,float y,float z){return new float[]{x,y,z};}
        static float[] add(float[] a,float x,float y,float z){return new float[]{a[0]+x,a[1]+y,a[2]+z};}
        static float[] mid(float[] a,float[] b){return new float[]{(a[0]+b[0])*.5f,(a[1]+b[1])*.5f,(a[2]+b[2])*.5f};}
        static float[] sub(float[] a,float[] b){return new float[]{a[0]-b[0],a[1]-b[1],a[2]-b[2]};}
        static float dist(float[] a,float[] b){float x=a[0]-b[0],y=a[1]-b[1],z=a[2]-b[2];return (float)Math.sqrt(x*x+y*y+z*z);}
        static float dot(float[] a,float[] b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];}
        static float[] cross(float[] a,float[] b){return new float[]{a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]};}
        static float[] norm(float[] a){float l=(float)Math.sqrt(dot(a,a));if(l<.0001f)return new float[]{0,1,0};return new float[]{a[0]/l,a[1]/l,a[2]/l};}
        static float[] scale(float[] a,float s){return new float[]{a[0]*s,a[1]*s,a[2]*s};}
    }

    static final class J{
        float[] head=f(0,1.68f,0),neck=f(0,1.49f,0),hip=f(0,.93f,0),hipL=f(-.12f,.93f,0),hipR=f(.12f,.93f,0);
        float[] ls=f(-.27f,1.45f,0),le=f(-.52f,1.28f,0),lh=f(-.70f,1.10f,0),rs=f(.27f,1.45f,0),re=f(.52f,1.28f,0),rh=f(.70f,1.10f,0);
        float[] lk=f(-.13f,.50f,0),lf=f(-.13f,.05f,.05f),rk=f(.13f,.50f,0),rf=f(.13f,.05f,.05f);
        void resetHips(){hipL=f(hip[0]-.12f,hip[1],hip[2]);hipR=f(hip[0]+.12f,hip[1],hip[2]);}
        static float[] f(float x,float y,float z){return new float[]{x,y,z};}
    }

    static final class Sphere{
        final FloatBuffer vb,nb; final ShortBuffer ib; final int count;
        Sphere(int seg,int ring){
            float[] v=new float[(ring+1)*(seg+1)*3],n=new float[v.length];short[] idx=new short[ring*seg*6];int vi=0,ii=0;
            for(int y=0;y<=ring;y++){float ph=(float)Math.PI*y/ring;for(int x=0;x<=seg;x++){float th=(float)Math.PI*2*x/seg;float nx=(float)(Math.sin(ph)*Math.cos(th)),ny=(float)Math.cos(ph),nz=(float)(Math.sin(ph)*Math.sin(th));v[vi]=n[vi++]=nx;v[vi]=n[vi++]=ny;v[vi]=n[vi++]=nz;}}
            for(int y=0;y<ring;y++)for(int x=0;x<seg;x++){short a=(short)(y*(seg+1)+x),b=(short)(a+seg+1);idx[ii++]=a;idx[ii++]=b;idx[ii++]=(short)(a+1);idx[ii++]=b;idx[ii++]=(short)(b+1);idx[ii++]=(short)(a+1);}
            vb=ByteBuffer.allocateDirect(v.length*4).order(ByteOrder.nativeOrder()).asFloatBuffer();vb.put(v).position(0);
            nb=ByteBuffer.allocateDirect(n.length*4).order(ByteOrder.nativeOrder()).asFloatBuffer();nb.put(n).position(0);
            ib=ByteBuffer.allocateDirect(idx.length*2).order(ByteOrder.nativeOrder()).asShortBuffer();ib.put(idx).position(0);count=idx.length;
        }
        void draw(int aPos,int aNorm){
            vb.position(0);GLES20.glEnableVertexAttribArray(aPos);GLES20.glVertexAttribPointer(aPos,3,GLES20.GL_FLOAT,false,0,vb);
            nb.position(0);GLES20.glEnableVertexAttribArray(aNorm);GLES20.glVertexAttribPointer(aNorm,3,GLES20.GL_FLOAT,false,0,nb);
            ib.position(0);GLES20.glDrawElements(GLES20.GL_TRIANGLES,count,GLES20.GL_UNSIGNED_SHORT,ib);
        }
    }
}
