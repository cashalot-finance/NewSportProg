(function(root,factory){
  const api=factory();
  if(typeof module!=="undefined"&&module.exports) module.exports=api;
  if(root) root.YogaEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";

const VERSION="0.9.0";
const STYLES={
  hatha:{name:"Hatha",desc:"Спокойная силовая практика",pace:1.0,phases:{warm:.25,main:.50,cool:.25}},
  vinyasa:{name:"Vinyasa",desc:"Динамичная связная практика",pace:.78,phases:{warm:.22,main:.58,cool:.20}},
  yin:{name:"Yin",desc:"Длительные мягкие удержания",pace:2.15,phases:{warm:.18,main:.62,cool:.20}},
  restorative:{name:"Restorative",desc:"Восстановительная практика",pace:2.45,phases:{warm:.18,main:.52,cool:.30}},
  mobility:{name:"Mobility",desc:"Подвижность и контроль",pace:.92,phases:{warm:.30,main:.50,cool:.20}}
};
const GOALS={
  balance:{name:"Баланс",tags:["balance","legs","core"]},
  mobility:{name:"Мобильность",tags:["mobility","hips","spine","shoulders"]},
  relax:{name:"Расслабление",tags:["relax","breath","restorative"]},
  back:{name:"Мягкая работа со спиной",tags:["spine","core","mobility"]},
  energy:{name:"Тонус",tags:["strength","flow","legs"]}
};
const HEALTH={
  wrist:{name:"Запястья",blocks:["wrist_load"]},
  knee:{name:"Колени",blocks:["deep_knee","knee_load"]},
  back:{name:"Поясница",blocks:["lumbar_extension","deep_fold"]},
  neck:{name:"Шея",blocks:["neck_load","deep_neck"]},
  balance:{name:"Нестабильный баланс",blocks:["single_leg","high_balance"]}
};
const RED_FLAGS=["acute_pain","recent_surgery","pregnancy","cardio_restriction"];

function pose(id,name,phase,pos,intensity,base,risks,styles,goals,cues,visual,extra){
  return Object.assign({id,name,phase,pos,intensity,base,risks,styles,goals,cues,visual,level:1,orientation:"neutral",support:"wide"},extra||{});
}
const ALL_STYLES=Object.keys(STYLES);
const P=[
pose("mountain","Гора","warm","standing",1,45,[],ALL_STYLES,["balance","mobility","energy"],["Стопы устойчиво. Макушка тянется вверх.","Дыхание ровное и спокойное."],"standing"),
pose("breath_stand","Дыхание стоя","warm","standing",1,50,[],ALL_STYLES,["relax","mobility"],["Расширяйте рёбра на вдохе.","Плечи остаются мягкими."],"standing"),
pose("shoulder_roll","Круги плечами","warm","standing",1,45,[],["hatha","vinyasa","mobility"],["mobility","back"],["Двигайтесь без боли и рывков.","Шея остаётся длинной."],"standing"),
pose("side_reach","Боковое вытяжение","warm","standing",1,55,[],["hatha","vinyasa","mobility"],["mobility","back"],["Не сжимайте поясницу.","Рёбра вытягиваются вверх и в сторону."],"side"),
pose("half_fold","Полунаклон","warm","standing",1,45,["deep_fold"],["hatha","vinyasa","mobility"],["mobility","back"],["Спина длинная, колени можно согнуть.","Вес распределён по всей стопе."],"fold"),
pose("cat_cow","Кошка — корова","warm","kneeling",1,65,["wrist_load","lumbar_extension","deep_neck"],["hatha","vinyasa","mobility"],["mobility","back"],["Движение следует за дыханием.","Не уходите в болезненную амплитуду."],"quadruped"),
pose("thread_needle","Нить в иглу","warm","kneeling",1,60,["wrist_load","deep_neck"],["hatha","mobility"],["mobility","back","relax"],["Поворот идёт из грудного отдела.","Опорное плечо остаётся свободным."],"twist_kneel"),
pose("child","Поза ребёнка","warm","kneeling",1,75,["deep_knee"],ALL_STYLES,["relax","back"],["Лоб опирается удобно.","Не давите на колени."],"child"),
pose("low_lunge","Низкий выпад","main","kneeling",2,70,["deep_knee","knee_load"],["hatha","vinyasa","mobility"],["mobility","hips","energy"],["Переднее колено направлено по линии стопы.","Таз мягко движется вперёд."],"lunge",{orientation:"forward"}),
pose("high_lunge","Высокий выпад","main","standing",3,65,["knee_load","high_balance"],["vinyasa","hatha"],["energy","legs","balance"],["Задняя пятка тянется назад.","Корпус остаётся собранным."],"lunge",{orientation:"forward",support:"split"}),
pose("warrior1","Воин I — обе стороны","main","standing",2,95,["knee_load"],["hatha","vinyasa"],["energy","legs","mobility"],["Сделайте половину времени на каждую сторону.","Переднее колено не заваливается внутрь."],"warrior1",{orientation:"forward",support:"split",bilateral:true}),
pose("warrior2","Воин II — обе стороны","main","standing",2,100,["knee_load"],["hatha","vinyasa"],["energy","legs","balance"],["Сделайте половину времени на каждую сторону.","Плечи над тазом, взгляд мягкий."],"warrior2",{orientation:"side",support:"wide",bilateral:true}),
pose("reverse_warrior","Обратный воин — обе стороны","main","standing",3,90,["knee_load","lumbar_extension"],["vinyasa","hatha"],["energy","mobility"],["Не проваливайтесь в поясницу.","Сохраняйте устойчивость передней ноги."],"reverse",{orientation:"side",support:"wide",bilateral:true}),
pose("triangle","Треугольник — обе стороны","main","standing",2,100,["deep_fold"],["hatha","mobility"],["mobility","back","balance"],["Сделайте обе стороны.","Опора может быть выше: на голени или блоке."],"triangle",{orientation:"side",support:"wide",bilateral:true}),
pose("wide_fold","Широкий наклон","main","standing",2,75,["deep_fold","high_balance"],["hatha","mobility"],["mobility","relax"],["Колени можно слегка согнуть.","Длина позвоночника важнее глубины."],"widefold",{orientation:"forward",support:"wide"}),
pose("tree","Дерево — обе стороны","main","standing",2,85,["single_leg","knee_load"],["hatha","mobility"],["balance","legs"],["Стопу не ставьте прямо на колено.","Используйте стену при необходимости."],"tree",{support:"single",bilateral:true}),
pose("chair","Стул","main","standing",3,60,["deep_knee","knee_load"],["hatha","vinyasa"],["energy","legs","strength"],["Таз уходит назад.","Колени направлены по линии стоп."],"chair"),
pose("down_dog","Собака мордой вниз","main","inverted",2,65,["wrist_load","deep_fold","neck_load"],["hatha","vinyasa"],["energy","mobility","back"],["Можно согнуть колени.","Отталкивайте коврик ладонями."],"downdog",{orientation:"inverted"}),
pose("plank","Планка","main","prone",3,45,["wrist_load","neck_load"],["vinyasa","hatha"],["energy","core","strength"],["Тело одной линией.","Если тяжело — колени на коврик."],"plank",{orientation:"horizontal"}),
pose("knees_chest_prone","Колени-грудь-подбородок","main","prone",3,40,["wrist_load","deep_knee","neck_load"],["vinyasa"],["energy","strength"],["Локти близко к корпусу.","Используйте мягкую амплитуду."],"kneeschest",{orientation:"horizontal"}),
pose("cobra","Кобра","main","prone",2,50,["lumbar_extension","wrist_load","deep_neck"],["hatha","vinyasa"],["back","energy"],["Поднимайтесь за счёт спины, а не только рук.","Лобковая кость остаётся на коврике."],"cobra"),
pose("sphinx","Сфинкс","main","prone",1,75,["lumbar_extension"],["hatha","yin","restorative","mobility"],["back","relax"],["Локти под плечами.","Если поясница чувствительна — уменьшите прогиб."],"sphinx"),
pose("locust","Саранча","main","prone",3,55,["lumbar_extension","neck_load"],["hatha","vinyasa"],["back","energy","strength"],["Шея продолжает линию позвоночника.","Подъём небольшой, но активный."],"locust"),
pose("butterfly","Бабочка","main","seated",1,110,["deep_knee"],["hatha","yin","restorative","mobility"],["mobility","hips","relax"],["Подложите опоры под колени при необходимости.","Не давите на ноги руками."],"butterfly"),
pose("staff","Посох","main","seated",1,65,[],["hatha","yin","mobility"],["back","core","mobility"],["Сядьте выше на сложенное полотенце при необходимости.","Стопы активны."],"staff"),
pose("seated_fold","Наклон сидя","main","seated",2,120,["deep_fold"],["hatha","yin","mobility"],["mobility","back","relax"],["Колени можно согнуть.","Тянитесь животом к бёдрам, не головой к коленям."],"seatedfold"),
pose("seated_twist","Скрутка сидя — обе стороны","main","seated",1,95,["deep_knee"],["hatha","yin","mobility"],["back","mobility"],["Сделайте обе стороны.","Сначала вытянитесь вверх, затем вращайтесь."],"seatedtwist",{bilateral:true,orientation:"twist"}),
pose("figure4","Фигура четыре лёжа — обе стороны","main","supine",1,110,["deep_knee"],["yin","restorative","hatha"],["hips","relax","mobility"],["Сделайте обе стороны.","Не тяните колено через боль."],"figure4",{bilateral:true}),
pose("bridge","Мост","main","supine",2,65,["lumbar_extension","neck_load"],["hatha","vinyasa","mobility"],["back","core","energy"],["Колени смотрят вперёд.","Не поворачивайте голову в удержании."],"bridge"),
pose("happy_baby","Счастливый ребёнок","cool","supine",1,85,["deep_knee"],["hatha","yin","restorative"],["relax","hips"],["Крестец остаётся тяжёлым.","Держитесь за голени, если стопы далеко."],"happybaby"),
pose("knees_chest","Колени к груди","cool","supine",1,70,["deep_knee"],ALL_STYLES,["relax","back"],["Обнимите ноги без усилия в шее.","Дышите в задние рёбра."],"kneeschest_supine"),
pose("supine_twist","Скрутка лёжа — обе стороны","cool","supine",1,110,["deep_knee"],ALL_STYLES,["relax","back","mobility"],["Сделайте обе стороны.","Плечи тяжёлые, колени опускаются только комфортно."],"supinetwist",{bilateral:true,orientation:"twist"}),
pose("legs_wall","Ноги на стене","cool","supine",1,150,[],["yin","restorative","hatha"],["relax","restorative"],["Расположитесь на комфортном расстоянии от стены.","Дыхание свободное."],"legswall"),
pose("constructive_rest","Конструктивный отдых","cool","supine",1,120,[],["restorative","hatha","mobility"],["relax","back"],["Стопы на коврике, колени могут соприкасаться.","Отпустите усилие в животе."],"rest"),
pose("box_breath","Спокойное дыхание лёжа","cool","supine",1,90,[],ALL_STYLES,["relax","breath"],["Наблюдайте естественный вдох и выдох.","Не задерживайте дыхание, если это неприятно."],"rest"),
pose("savasana","Шавасана","cool","supine",1,180,[],ALL_STYLES,["relax","restorative"],["Позвольте телу стать тяжёлым.","Дыхание не нужно специально контролировать."],"savasana")
];

const POSITION_LEVEL={standing:4,kneeling:3,seated:2,prone:1,supine:1,inverted:3};
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function uniq(arr){return [...new Set(arr)]}
function blocked(p,health){
  const tags=[];
  (health||[]).forEach(h=>{ if(HEALTH[h]) tags.push(...HEALTH[h].blocks); });
  return p.risks.some(r=>tags.includes(r));
}
function transitionScore(a,b,style){
  if(!a||!b) return 100;
  let s=100;
  const dl=Math.abs((POSITION_LEVEL[a.pos]||2)-(POSITION_LEVEL[b.pos]||2));
  s-=dl*11;
  s-=Math.abs(a.intensity-b.intensity)*6;
  if(a.pos!==b.pos)s-=5;
  if(a.orientation!==b.orientation)s-=4;
  if(a.support!==b.support)s-=3;
  if(a.pos==="supine"&&b.pos==="standing" || a.pos==="prone"&&b.pos==="standing")s-=12;
  if(style==="vinyasa" && ["standing","kneeling","prone","inverted"].includes(a.pos) && ["standing","kneeling","prone","inverted"].includes(b.pos))s+=7;
  if(style==="yin"||style==="restorative"){
    if(b.intensity<=2)s+=5;
    if(b.pos===a.pos)s+=5;
  }
  return Math.round(clamp(s,35,100));
}
function goalScore(p,goal){
  const g=GOALS[goal]||GOALS.mobility;
  return p.goals.reduce((n,t)=>n+(g.tags.includes(t)?7:0),0);
}
function styleScore(p,style){return p.styles.includes(style)?10:0}
function candidateScore(prev,p,opts,used){
  let s=transitionScore(prev,p,opts.style)+goalScore(p,opts.goal)+styleScore(p,opts.style);
  if(used.has(p.id))s-=30;
  if(p.intensity>opts.intensity+1)s-=25;
  if(p.intensity===opts.intensity)s+=4;
  return s;
}
function pickPhase(pool,phase,count,seq,opts,used){
  const out=[];
  for(let i=0;i<count;i++){
    const candidates=pool.filter(p=>p.phase===phase && !used.has(p.id));
    if(!candidates.length)break;
    const prev=(out.length?out[out.length-1]:seq[seq.length-1])||null;
    const ranked=candidates.map(p=>({p,s:candidateScore(prev,p,opts,used)})).sort((a,b)=>b.s-a.s);
    const chosen=ranked[0].p;
    out.push(Object.assign({},chosen));
    used.add(chosen.id);
  }
  return out;
}
function phaseCounts(count,style){
  const ph=(STYLES[style]||STYLES.hatha).phases;
  let warm=Math.max(2,Math.round(count*ph.warm));
  let main=Math.max(2,Math.round(count*ph.main));
  let cool=Math.max(2,count-warm-main);
  while(warm+main+cool>count && main>2)main--;
  while(warm+main+cool<count)main++;
  return {warm,main,cool};
}
function allocateTime(seq,seconds,style){
  const pace=(STYLES[style]||STYLES.hatha).pace;
  let weights=seq.map(p=>Math.max(20,p.base*pace*(p.bilateral?1.18:1)));
  const sum=weights.reduce((a,b)=>a+b,0)||1;
  seq.forEach((p,i)=>p.sec=Math.max(20,Math.round((weights[i]*seconds/sum)/5)*5));
  let current=seq.reduce((a,p)=>a+p.sec,0);
  let diff=seconds-current;
  let i=seq.length-1;
  while(diff!==0&&seq.length){
    const step=Math.abs(diff)>=5?(diff>0?5:-5):diff;
    if(seq[i].sec+step>=20){seq[i].sec+=step;diff-=step}
    i=(i-1+seq.length)%seq.length;
  }
}
function generate(input){
  const opts=Object.assign({style:"hatha",duration:20,intensity:2,goal:"mobility",health:[],redFlags:[]},input||{});
  opts.duration=clamp(Number(opts.duration)||20,8,90);
  opts.intensity=clamp(Number(opts.intensity)||2,1,3);
  opts.health=uniq(opts.health||[]);
  opts.redFlags=uniq(opts.redFlags||[]);
  const red=opts.redFlags.filter(x=>RED_FLAGS.includes(x));
  if(red.length)return {blocked:true,reason:"red_flag",redFlags:red,version:VERSION};
  let pool=P.filter(p=>!blocked(p,opts.health)&&p.intensity<=opts.intensity+1&&(p.styles.includes(opts.style)||p.styles.length===ALL_STYLES.length));
  if(pool.filter(p=>p.phase==="main").length<3) pool=P.filter(p=>!blocked(p,opts.health)&&p.intensity<=opts.intensity+1);
  const seconds=Math.round(opts.duration*60);
  const avg=(opts.style==="yin"||opts.style==="restorative")?105:58;
  let targetCount=clamp(Math.round(seconds/avg)+2,6,18);
  const c=phaseCounts(targetCount,opts.style),used=new Set(),seq=[];
  seq.push(...pickPhase(pool,"warm",c.warm,seq,opts,used));
  seq.push(...pickPhase(pool,"main",c.main,seq,opts,used));
  seq.push(...pickPhase(pool,"cool",c.cool,seq,opts,used));
  const sava=P.find(p=>p.id==="savasana");
  if(sava && !blocked(sava,opts.health) && !seq.some(p=>p.id==="savasana")){
    if(seq.length>=targetCount)seq[seq.length-1]=Object.assign({},sava); else seq.push(Object.assign({},sava));
  }
  if(seq.length<5){
    P.filter(p=>!blocked(p,opts.health)).forEach(p=>{if(seq.length<6&&!seq.some(x=>x.id===p.id))seq.push(Object.assign({},p))});
  }
  allocateTime(seq,seconds,opts.style);
  const transitions=seq.slice(1).map((p,i)=>transitionScore(seq[i],p,opts.style));
  const smooth=Math.round(transitions.reduce((a,b)=>a+b,0)/Math.max(1,transitions.length));
  const session={
    id:"yf-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),
    version:VERSION,
    createdAt:new Date().toISOString(),
    style:opts.style,
    styleName:(STYLES[opts.style]||STYLES.hatha).name,
    duration:opts.duration,
    intensity:opts.intensity,
    goal:opts.goal,
    goalName:(GOALS[opts.goal]||GOALS.mobility).name,
    health:opts.health,
    poses:seq,
    smooth,
    transitions
  };
  const check=validate(session,opts);
  session.valid=check.ok;
  session.validation=check;
  return session;
}
function validate(session,opts){
  const errors=[];
  if(!session||!Array.isArray(session.poses)||session.poses.length<5)errors.push("too_few_poses");
  const sum=session&&session.poses?session.poses.reduce((a,p)=>a+(Number(p.sec)||0),0):0;
  const target=Math.round((session&&session.duration||0)*60);
  if(Math.abs(sum-target)>2)errors.push("duration_mismatch");
  if(session&&session.poses&&session.poses.some(p=>blocked(p,(opts&&opts.health)||session.health||[])))errors.push("health_filter_violation");
  if(session&&session.poses&&session.poses.some(p=>!Number.isFinite(p.sec)||p.sec<20))errors.push("invalid_timing");
  return {ok:errors.length===0,errors,totalSeconds:sum,targetSeconds:target};
}
function publicPose(p){
  return {id:p.id,name:p.name,phase:p.phase,pos:p.pos,intensity:p.intensity,sec:p.sec,visual:p.visual,cues:p.cues,bilateral:!!p.bilateral};
}
return {VERSION,STYLES,GOALS,HEALTH,RED_FLAGS,POSES:P,generate,validate,transitionScore,publicPose};
});