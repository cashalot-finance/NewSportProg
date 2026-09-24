(function(root,factory){
const api=factory();if(typeof module!=="undefined"&&module.exports)module.exports=api;if(root)root.YogaEngine=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){"use strict";
const VERSION="1.0.0-rc1";
const STYLES={
hatha:{name:"Hatha",desc:"Спокойная силовая практика",hold:.98},
vinyasa:{name:"Vinyasa",desc:"Динамичная связная практика",hold:.80},
yin:{name:"Yin",desc:"Мягкие удержания в коротком формате",hold:1.14},
restorative:{name:"Restorative",desc:"Восстановительная практика",hold:1.12},
mobility:{name:"Mobility",desc:"Подвижность и контроль",hold:.88}
};
const GOALS={
balance:{name:"Баланс",tags:["balance","legs","core"]},
mobility:{name:"Мобильность",tags:["mobility","hips","spine","shoulders"]},
relax:{name:"Расслабление",tags:["relax","breath","restorative"]},
back:{name:"Мягкая работа со спиной",tags:["spine","core","mobility"]},
energy:{name:"Тонус",tags:["strength","flow","legs","core"]}
};
const HEALTH={
wrist:{name:"Запястья",blocks:["wrist_load"]},
knee:{name:"Колени",blocks:["deep_knee","knee_load"]},
back:{name:"Поясница",blocks:["lumbar_extension","deep_fold"]},
neck:{name:"Шея",blocks:["neck_load","deep_neck","shoulderstand"]},
balance:{name:"Нестабильный баланс",blocks:["single_leg","high_balance"]},
shoulder:{name:"Плечи",blocks:["shoulder_load","overhead_load"]}
};
const RED_FLAGS=["acute_pain","recent_surgery","pregnancy","cardio_restriction"];
const A="hatha,vinyasa,yin,restorative,mobility".split(",");
const D={
standing:["hatha","vinyasa","mobility"],ground:["hatha","yin","restorative","mobility"],flow:["hatha","vinyasa","mobility"],
strong:["hatha","vinyasa"],gentle:["hatha","yin","restorative","mobility"]
};
function p(id,name,phase,pos,diff,min,max,risks,visual,goals,styles,cue,bilateral){
 return {id,name,phase,pos,diff,min,max:Math.min(50,max),risks:risks||[],visual,goals:goals||[],styles:styles||A,cue:cue||"Дышите спокойно и сохраняйте комфортную амплитуду.",bilateral:!!bilateral};
}
const P=[
p("mountain","Гора","warm","standing",1,25,40,[],"standing",["balance","mobility"],A,"Стопы устойчивы, макушка тянется вверх."),
p("raised_arms","Вытяжение рук вверх","warm","standing",1,20,35,["overhead_load"],"reach",["mobility","shoulders"],D.standing,"Рёбра не выталкивайте вперёд."),
p("standing_side_bend","Боковое вытяжение стоя","warm","standing",1,20,35,["overhead_load"],"sidebend",["mobility","spine"],D.standing,"Вытягивайтесь вверх и только затем в сторону.",true),
p("forward_fold","Наклон стоя","warm","standing",2,20,40,["deep_fold"],"fold",["mobility","spine"],D.standing,"Колени можно согнуть, живот направляйте к бёдрам."),
p("half_lift","Полунаклон","warm","standing",1,20,35,["deep_fold"],"half_fold",["mobility","spine"],D.standing,"Спина длинная, шея продолжает позвоночник."),
p("chair","Стул","main","standing",3,20,40,["deep_knee","knee_load"],"chair",["strength","legs","core"],D.strong,"Таз назад, колени по линии стоп."),
p("chair_twist","Скрутка в стуле","main","standing",4,20,35,["deep_knee","knee_load"],"chair_twist",["strength","spine"],D.strong,"Сохраняйте длину позвоночника.",true),
p("warrior1","Воин I","main","standing",2,25,45,["knee_load","overhead_load"],"warrior1",["strength","legs","mobility"],D.standing,"Переднее колено направлено по линии стопы.",true),
p("warrior2","Воин II","main","standing",2,25,45,["knee_load"],"warrior2",["strength","legs","balance"],D.standing,"Плечи над тазом, взгляд мягкий.",true),
p("warrior3","Воин III","main","standing",4,20,35,["single_leg","high_balance"],"warrior3",["balance","core","strength"],D.strong,"Опорная нога устойчива, корпус длинный.",true),
p("reverse_warrior","Обратный воин","main","standing",3,20,35,["knee_load","lumbar_extension"],"reverse",["mobility","legs"],D.standing,"Не проваливайтесь в поясницу.",true),
p("extended_side_angle","Вытянутый боковой угол","main","standing",3,20,40,["knee_load"],"sideangle",["mobility","legs","strength"],D.standing,"Создайте одну длинную линию от стопы до пальцев.",true),
p("triangle","Треугольник","main","standing",2,25,45,["deep_fold"],"triangle",["mobility","balance","spine"],D.standing,"Опору можно поднять выше на голень или блок.",true),
p("revolved_triangle","Скрученный треугольник","main","standing",4,20,35,["deep_fold","high_balance"],"triangle_twist",["mobility","balance","spine"],D.strong,"Сначала вытянитесь, затем вращайтесь.",true),
p("pyramid","Пирамида","main","standing",3,20,40,["deep_fold"],"pyramid",["mobility","legs"],D.standing,"Таз направлен вперёд, колено можно смягчить.",true),
p("wide_fold","Широкий наклон","main","standing",2,25,45,["deep_fold"],"widefold",["mobility","relax"],D.standing,"Вес распределён по всей стопе."),
p("tree","Дерево","main","standing",3,20,40,["single_leg","knee_load"],"tree",["balance","legs"],D.standing,"Стопу не ставьте непосредственно на колено.",true),
p("eagle","Орёл","main","standing",4,20,35,["single_leg","deep_knee","shoulder_load"],"eagle",["balance","legs","shoulders"],D.strong,"Удерживайте устойчивый взгляд.",true),
p("dancer","Танцор","main","standing",5,15,30,["single_leg","high_balance","lumbar_extension","shoulder_load"],"dancer",["balance","strength","mobility"],D.strong,"Поднимайте ногу только в контролируемой амплитуде.",true),
p("half_moon","Полумесяц","main","standing",4,20,35,["single_leg","high_balance"],"halfmoon",["balance","core","legs"],D.strong,"Опорная ладонь может быть на блоке.",true),
p("revolved_half_moon","Скрученный полумесяц","main","standing",5,15,30,["single_leg","high_balance","deep_fold"],"halfmoon_twist",["balance","core","spine"],D.strong,"Держите таз под контролем.",true),
p("hand_to_big_toe","Захват большого пальца стоя","main","standing",5,15,30,["single_leg","high_balance","deep_fold"],"standing_balance",["balance","mobility"],D.strong,"Можно удерживать согнутое колено.",true),
p("standing_figure4","Фигура четыре стоя","main","standing",4,20,35,["single_leg","deep_knee"],"standing_figure4",["balance","hips"],D.standing,"Таз отводите назад без давления на колено.",true),
p("goddess","Богиня","main","standing",3,20,40,["deep_knee","knee_load"],"goddess",["strength","hips","legs"],D.standing,"Колени направлены вслед за стопами."),
p("high_lunge","Высокий выпад","main","standing",3,20,40,["knee_load","high_balance","overhead_load"],"lunge",["strength","legs","mobility"],D.standing,"Задняя пятка тянется назад.",true),
p("crescent_lunge","Полумесяц в выпаде","main","standing",3,20,40,["knee_load","overhead_load"],"lunge_reach",["strength","mobility"],D.standing,"Не сжимайте поясницу.",true),
p("skandasana","Боковой выпад","main","standing",4,20,35,["deep_knee","knee_load"],"skandasana",["mobility","hips","legs"],D.standing,"Оставайтесь в доступной глубине.",true),
p("garland","Гирлянда","main","standing",3,20,40,["deep_knee","knee_load"],"squat",["mobility","hips"],D.gentle,"Можно подложить опору под таз."),
p("toe_stand","Стойка на носках","main","standing",5,15,25,["single_leg","high_balance","deep_knee"],"toe_balance",["balance","legs"],D.strong,"Используйте стену для страховки.",true),
p("standing_backbend","Мягкий прогиб стоя","main","standing",2,15,30,["lumbar_extension","deep_neck","overhead_load"],"standing_backbend",["mobility","spine"],D.standing,"Прогиб распределяйте по всей спине."),
p("cat","Кошка","warm","kneeling",1,20,35,["wrist_load"],"table_round",["spine","mobility"],A,"Округляйте спину без давления на шею."),
p("cow","Корова","warm","kneeling",1,20,35,["wrist_load","lumbar_extension","deep_neck"],"table_arch",["spine","mobility"],A,"Прогиб мягкий, ключицы широкие."),
p("cat_cow","Кошка — корова","warm","kneeling",1,25,40,["wrist_load","lumbar_extension","deep_neck"],"tabletop",["spine","mobility"],A,"Двигайтесь в ритме дыхания."),
p("bird_dog","Птица-собака","main","kneeling",2,20,40,["wrist_load","high_balance"],"birddog",["balance","core","strength"],D.flow,"Таз остаётся ровным.",true),
p("tiger","Тигр","main","kneeling",3,20,35,["wrist_load","lumbar_extension"],"tiger",["strength","mobility"],D.flow,"Поднимайте ногу без переразгибания поясницы.",true),
p("thread_needle","Нить в иглу","warm","kneeling",1,20,35,["wrist_load","deep_neck"],"thread",["mobility","spine","relax"],D.gentle,"Вращение идёт из грудного отдела.",true),
p("puppy","Щенок","main","kneeling",2,20,40,["shoulder_load","lumbar_extension"],"puppy",["shoulders","spine","relax"],D.gentle,"Таз остаётся над коленями."),
p("child","Поза ребёнка","cool","kneeling",1,25,45,["deep_knee"],"child",["relax","spine"],A,"Лоб опирается удобно."),
p("hero","Герой","main","kneeling",2,20,40,["deep_knee","knee_load"],"hero",["mobility","hips"],D.gentle,"При дискомфорте сядьте выше на опору."),
p("camel","Верблюд","main","kneeling",4,15,30,["deep_knee","lumbar_extension","deep_neck","shoulder_load"],"camel",["mobility","spine","shoulders"],D.strong,"Грудная клетка поднимается, поясница не сжимается."),
p("half_camel","Полувéрблюд","main","kneeling",3,20,35,["deep_knee","lumbar_extension","deep_neck"],"half_camel",["mobility","spine"],D.standing,"Одна рука остаётся на тазу.",true),
p("gate","Засов","main","kneeling",2,20,40,["deep_knee","overhead_load"],"gate",["mobility","spine","hips"],D.gentle,"Вытягивайте бок корпуса.",true),
p("low_lunge","Низкий выпад","main","kneeling",2,20,40,["deep_knee","knee_load"],"low_lunge",["mobility","hips"],D.flow,"Подложите мягкую опору под колено.",true),
p("low_lunge_quad","Выпад с растяжением квадрицепса","main","kneeling",4,15,30,["deep_knee","knee_load","high_balance"],"low_lunge_quad",["mobility","hips"],D.flow,"Не тяните стопу через боль.",true),
p("half_split","Полушпагат","main","kneeling",2,20,40,["deep_fold","deep_knee"],"half_split",["mobility","legs"],D.gentle,"Спина остаётся длинной.",true),
p("splits","Шпагат","main","kneeling",5,15,30,["deep_fold","deep_knee"],"split",["mobility","hips"],["hatha","mobility"],"Используйте блоки и не форсируйте глубину.",true),
p("frog","Лягушка","main","kneeling",4,20,35,["deep_knee"],"frog",["mobility","hips"],D.gentle,"Остановитесь до ощущения боли."),
p("thunderbolt","Ваджрасана","warm","kneeling",1,20,40,["deep_knee"],"hero",["relax","breath"],D.gentle,"Сядьте на опору, если коленям тесно."),
p("kneeling_plank","Планка с колен","main","kneeling",2,20,35,["wrist_load","shoulder_load"],"kneeling_plank",["strength","core"],D.flow,"Корпус сохраняет одну линию."),
p("kneeling_side_plank","Боковая планка с колен","main","kneeling",3,20,35,["wrist_load","shoulder_load","high_balance"],"sideplank_knee",["strength","balance","core"],D.flow,"Опорное плечо стабильно.",true),
p("down_dog","Собака мордой вниз","main","inverted",2,20,40,["wrist_load","deep_fold","neck_load","shoulder_load"],"downdog",["mobility","strength","spine"],D.flow,"Колени можно согнуть."),
p("three_leg_dog","Трёхногая собака","main","inverted",3,20,35,["wrist_load","deep_fold","neck_load","shoulder_load","high_balance"],"three_dog",["strength","balance"],D.flow,"Таз сохраняйте максимально ровным.",true),
p("plank","Планка","main","prone",4,20,40,["wrist_load","shoulder_load","neck_load"],"plank",["strength","core"],D.strong,"Тело одной линией; удержание никогда не превышает 40 секунд."),
p("forearm_plank","Планка на предплечьях","main","prone",4,20,40,["shoulder_load","neck_load"],"forearm_plank",["strength","core"],D.strong,"Не провисайте в пояснице."),
p("side_plank","Боковая планка","main","side",5,15,30,["wrist_load","shoulder_load","high_balance"],"sideplank",["strength","balance","core"],D.strong,"Опорное плечо не поднимайте к уху.",true),
p("dolphin","Дельфин","main","inverted",3,20,40,["shoulder_load","neck_load","deep_fold"],"dolphin",["strength","shoulders","mobility"],D.flow,"Отталкивайтесь предплечьями от коврика."),
p("dolphin_plank","Планка-дельфин","main","prone",4,20,35,["shoulder_load","neck_load"],"forearm_plank",["strength","core"],D.strong,"Рёбра и таз собраны."),
p("chaturanga","Чатуранга","main","prone",5,10,20,["wrist_load","shoulder_load","neck_load"],"chaturanga",["strength","core"],["vinyasa","hatha"],"Локти близко к корпусу; при необходимости опустите колени."),
p("up_dog","Собака мордой вверх","main","prone",4,15,30,["wrist_load","shoulder_load","lumbar_extension","deep_neck"],"updog",["strength","spine"],D.flow,"Грудная клетка движется вперёд и вверх."),
p("cobra","Кобра","main","prone",2,15,35,["wrist_load","lumbar_extension","deep_neck"],"cobra",["spine","strength"],D.gentle,"Поднимайтесь за счёт спины, а не только рук."),
p("sphinx","Сфинкс","main","prone",1,25,45,["lumbar_extension"],"sphinx",["spine","relax"],D.gentle,"Локти под плечами."),
p("locust","Саранча","main","prone",4,15,30,["lumbar_extension","neck_load"],"locust",["strength","spine"],D.strong,"Шея продолжает линию позвоночника."),
p("bow","Лук","main","prone",5,15,25,["lumbar_extension","deep_knee","shoulder_load","deep_neck"],"bow",["strength","mobility"],D.strong,"Поднимайтесь плавно без рывка."),
p("crocodile","Крокодил","cool","prone",1,25,45,[],"crocodile",["relax","breath"],D.gentle,"Отпустите напряжение в спине."),
p("swimmer","Пловец","main","prone",3,20,35,["lumbar_extension","neck_load"],"locust",["strength","core"],D.flow,"Двигайте противоположными рукой и ногой.",true),
p("reverse_table","Обратный стол","main","seated",4,15,30,["wrist_load","shoulder_load","deep_neck"],"reverse_table",["strength","shoulders"],D.strong,"Ладони под плечами, таз поднимайте контролируемо."),
p("staff","Посох","warm","seated",1,20,40,[],"seated",["posture","core"],D.gentle,"Сядьте выше на опору при необходимости."),
p("seated_fold","Наклон сидя","main","seated",2,20,45,["deep_fold"],"seated_fold",["mobility","spine","relax"],D.gentle,"Колени можно согнуть."),
p("head_to_knee","Голова к колену","main","seated",2,20,40,["deep_fold","deep_knee"],"head_knee",["mobility","relax"],D.gentle,"Поворачивайте корпус к вытянутой ноге.",true),
p("revolved_head_to_knee","Скрученный наклон к ноге","main","seated",3,20,35,["deep_fold","deep_knee","overhead_load"],"head_knee_twist",["mobility","spine"],D.gentle,"Открывайте грудную клетку вверх.",true),
p("butterfly","Бабочка","main","seated",1,25,45,["deep_knee"],"butterfly",["mobility","hips","relax"],D.gentle,"Не давите руками на колени."),
p("wide_seated","Широкий угол сидя","main","seated",2,20,40,["deep_fold"],"wide_seated",["mobility","hips"],D.gentle,"Наклон начинается из тазобедренных суставов."),
p("half_lord_fishes","Полувластелин рыб","main","seated",2,20,40,["deep_knee"],"seated_twist",["spine","mobility"],D.gentle,"Сначала вытянитесь вверх, затем вращайтесь.",true),
p("easy_pose","Удобная поза","warm","seated",1,25,45,["deep_knee"],"cross_seated",["relax","breath"],D.gentle,"Сядьте на сложенное полотенце при необходимости."),
p("lotus","Лотос","main","seated",5,15,30,["deep_knee"],"lotus",["hips","balance"],["hatha","yin"],"Не форсируйте положение коленей."),
p("half_lotus","Полулотос","main","seated",3,20,35,["deep_knee"],"half_lotus",["hips","relax"],D.gentle,"Стопа лежит на бедре только без дискомфорта.",true),
p("cow_face","Коровья морда","main","seated",3,20,35,["deep_knee","shoulder_load"],"cowface",["hips","shoulders"],D.gentle,"Используйте ремень между руками.",true),
p("fire_log","Полено","main","seated",4,20,35,["deep_knee"],"firelog",["hips","mobility"],D.gentle,"Остановитесь при дискомфорте в колене.",true),
p("boat","Лодка","main","seated",4,15,30,["back_load"],"boat",["strength","core"],D.strong,"Поднимайте грудную клетку, не округляясь."),
p("half_boat","Полулодка","main","seated",3,20,35,["back_load"],"half_boat",["strength","core"],D.flow,"Колени можно оставить согнутыми."),
p("compass","Компас","main","seated",5,15,25,["deep_knee","shoulder_load","deep_fold"],"compass",["mobility","hips","shoulders"],["hatha","mobility"],"Работайте только в свободной амплитуде.",true),
p("crow","Ворона","main","armbalance",5,10,25,["wrist_load","shoulder_load","high_balance"],"crow",["strength","balance","core"],D.strong,"Смотрите вперёд и держите пальцы активными."),
p("seated_side_bend","Боковое вытяжение сидя","main","seated",1,20,40,["overhead_load"],"seated_side",["mobility","spine"],D.gentle,"Обе седалищные кости направлены к полу.",true),
p("scale","Весы","main","armbalance",5,10,20,["wrist_load","shoulder_load"],"armbalance",["strength","core"],["hatha"],"Поднимайтесь только при уверенной опоре."),
p("bridge","Мост","main","supine",2,20,40,["lumbar_extension","neck_load"],"bridge",["strength","spine"],D.gentle,"Колени направлены вперёд."),
p("wheel","Колесо","main","supine",5,10,25,["wrist_load","shoulder_load","lumbar_extension","deep_neck"],"wheel",["strength","mobility"],D.strong,"Используйте только при уверенной технике."),
p("supported_bridge","Поддержанный мост","cool","supine",1,25,45,["neck_load"],"supported_bridge",["relax","spine"],D.gentle,"Опора должна быть устойчивой."),
p("knees_chest","Колени к груди","cool","supine",1,20,40,["deep_knee"],"knees_chest",["relax","spine"],A,"Обнимите ноги без напряжения в шее."),
p("happy_baby","Счастливый ребёнок","cool","supine",1,20,40,["deep_knee"],"happybaby",["relax","hips"],D.gentle,"Крестец остаётся тяжёлым."),
p("reclined_figure4","Фигура четыре лёжа","cool","supine",1,20,40,["deep_knee"],"figure4",["hips","relax"],D.gentle,"Не тяните колено через боль.",true),
p("reclined_bound_angle","Бабочка лёжа","cool","supine",1,25,45,["deep_knee"],"reclined_bound",["relax","hips"],D.gentle,"Подложите опоры под колени при необходимости."),
p("reclined_big_toe","Захват стопы лёжа","cool","supine",2,20,40,["deep_fold"],"leg_raise",["mobility","legs"],D.gentle,"Используйте ремень и не выпрямляйте колено силой.",true),
p("supine_twist","Скрутка лёжа","cool","supine",1,20,40,["deep_knee"],"supine_twist",["relax","spine"],A,"Плечи остаются тяжёлыми.",true),
p("dead_bug","Мёртвый жук","main","supine",2,20,40,[],"deadbug",["core","coordination"],D.flow,"Поясница сохраняет нейтральное положение.",true),
p("fish","Рыба","main","supine",3,15,30,["deep_neck","lumbar_extension"],"fish",["mobility","spine"],D.standing,"Вес не переносите на макушку."),
p("shoulderstand","Стойка на плечах","main","inverted",5,10,25,["neck_load","shoulderstand","high_balance"],"shoulderstand",["balance","strength"],["hatha"],"Только при уверенной технике и без нагрузки на шею."),
p("plow","Плуг","main","inverted",5,10,25,["neck_load","shoulderstand","deep_fold"],"plow",["mobility","spine"],["hatha"],"Не поворачивайте голову в позе."),
p("legs_wall","Ноги на стене","cool","supine",1,30,50,[],"legs_wall",["relax","restorative"],D.gentle,"Расположитесь на комфортном расстоянии от стены."),
p("savasana","Шавасана","cool","supine",1,30,50,[],"savasana",["relax","restorative"],A,"Полностью отпустите мышечное усилие."),
p("constructive_rest","Конструктивный отдых","cool","supine",1,25,45,[],"constructive",["relax","spine"],D.gentle,"Стопы на коврике, колени могут соприкасаться."),
p("wind_relieving","Освобождение ветра","cool","supine",1,20,40,["deep_knee"],"knees_chest",["relax","spine"],D.gentle,"Подтягивайте бедро без давления на колено.",true),
p("reclined_hero","Герой лёжа","main","supine",4,15,30,["deep_knee","lumbar_extension"],"reclined_hero",["mobility","hips"],["hatha","yin"],"Используйте высокую опору под спиной."),
p("supine_eagle_twist","Скрутка орла лёжа","cool","supine",2,20,35,["deep_knee"],"supine_twist",["relax","spine"],D.gentle,"Опускайте колени только до комфортной точки.",true),
p("banana","Бананасана","cool","supine",1,20,40,[],"banana",["relax","mobility"],D.gentle,"Сдвигайте стопы и руки в одну сторону.",true),
p("headstand","Стойка на голове","main","inverted",5,10,20,["neck_load","shoulder_load","high_balance"],"headstand",["balance","strength"],["hatha"],"Только для подготовленных пользователей и с безопасной страховкой."),
p("handstand","Стойка на руках","main","inverted",5,10,20,["wrist_load","shoulder_load","high_balance"],"handstand",["balance","strength"],["hatha","vinyasa"],"Только при уверенной технике и безопасной страховке."),
p("forearm_stand","Стойка на предплечьях","main","inverted",5,10,20,["shoulder_load","neck_load","high_balance"],"forearm_stand",["balance","strength"],["hatha","vinyasa"],"Используйте стену и только при уверенной технике."),
p("rabbit","Кролик","main","kneeling",3,15,30,["deep_knee","neck_load","deep_fold"],"rabbit",["spine","mobility"],["hatha","yin"],"Не переносите вес на голову."),
p("lion","Лев","warm","kneeling",1,15,25,["deep_knee"],"hero",["breath","relax"],A,"Плечи мягкие, дыхание свободное."),
p("eagle_arms","Руки орла","warm","seated",1,20,35,["shoulder_load"],"eagle_arms",["shoulders","mobility"],A,"Поднимайте локти только до комфортной высоты."),
p("cowface_arms","Руки коровьей морды","warm","seated",2,20,35,["shoulder_load"],"cowface_arms",["shoulders","mobility"],D.gentle,"Используйте ремень, если ладони не встречаются."),
p("neck_release","Мягкое вытяжение шеи","warm","seated",1,15,25,["deep_neck"],"seated",["relax","mobility"],A,"Не тяните голову рукой."),
p("ankle_mobility","Мобилизация голеностопа","warm","kneeling",1,20,35,["deep_knee"],"half_split",["mobility","legs"],A,"Двигайтесь в небольшой безболезненной амплитуде.",true),
p("wrist_mobility","Мобилизация запястий","warm","kneeling",1,15,30,["wrist_load"],"tabletop",["mobility","wrists"],A,"Нагрузка минимальная, пальцы активны."),
p("standing_knee_hug","Колено к груди стоя","warm","standing",2,20,35,["single_leg","deep_knee"],"standing_balance",["balance","hips"],D.standing,"Используйте стену при необходимости.",true),
p("heel_to_glute","Пятка к ягодице стоя","warm","standing",2,15,30,["single_leg","deep_knee"],"dancer_prep",["balance","legs"],D.standing,"Колени остаются рядом.",true),
p("side_stretch_kneeling","Боковое вытяжение на колене","warm","kneeling",2,20,35,["deep_knee","overhead_load"],"gate",["mobility","spine"],D.gentle,"Опорное колено расположите на мягкой поверхности.",true)
];
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function uniq(a){return [...new Set(a)]}
const POS={standing:5,kneeling:4,seated:3,armbalance:3,inverted:3,prone:2,side:2,supine:1};
function healthBlocks(health){let out=[];(health||[]).forEach(h=>{if(HEALTH[h])out.push(...HEALTH[h].blocks)});return uniq(out)}
function blocked(pose,health){const b=healthBlocks(health);return pose.risks.some(r=>b.includes(r))}
function transitionScore(a,b,style){
 if(!a||!b)return 100;let s=100;
 s-=Math.abs((POS[a.pos]||3)-(POS[b.pos]||3))*8;
 s-=Math.abs(a.diff-b.diff)*5;
 if(a.pos!==b.pos)s-=4;
 if(a.visual===b.visual)s+=4;
 if(a.pos==="supine"&&b.pos==="standing")s-=16;
 if(a.pos==="prone"&&b.pos==="standing")s-=12;
 if((a.pos==="inverted")!==(b.pos==="inverted"))s-=7;
 if(style==="vinyasa"&&["standing","kneeling","prone","inverted"].includes(a.pos)&&["standing","kneeling","prone","inverted"].includes(b.pos))s+=6;
 return Math.round(clamp(s,35,100));
}
function goalScore(pose,goal){const g=GOALS[goal]||GOALS.mobility;return pose.goals.reduce((n,t)=>n+(g.tags.includes(t)?8:0),0)}
function allowedDifficulty(intensity){return intensity<=1?2:intensity===2?4:5}
function candidateScore(prev,p,opts,usage,index){
 let s=transitionScore(prev,p,opts.style)+goalScore(p,opts.goal)+(p.styles.includes(opts.style)?12:-12);
 s-=Math.max(0,p.diff-allowedDifficulty(opts.intensity))*30;
 s-=(usage[p.id]||0)*18;
 if(index>1&&prev&&prev.id===p.id)s-=100;
 if(p.phase===opts.phase)s+=12;
 return s;
}
function phaseForIndex(i,n){
 const r=i/Math.max(1,n-1);return r<.23?"warm":r>.80?"cool":"main";
}
function transitionSeconds(score){return score>=92?4:score>=82?5:score>=70?6:7}
function distributeHolds(seq,transitionSecs,total,style){
 const sf=(STYLES[style]||STYLES.hatha).hold;
 const min=seq.map(p=>Math.max(12,Math.min(50,p.min)));
 const max=seq.map(p=>Math.max(min[seq.indexOf(p)],Math.min(50,p.max)));
 const base=seq.map((p,i)=>clamp(Math.round(((p.min+p.max)/2)*sf),min[i],max[i]));
 const trans=transitionSecs.reduce((a,b)=>a+b,0);
 let target=Math.max(0,total-trans),sum=base.reduce((a,b)=>a+b,0),out=base.slice(),guard=0;
 while(sum<target&&guard++<100000){
   let changed=false;
   for(let i=0;i<out.length&&sum<target;i++){if(out[i]<max[i]){out[i]++;sum++;changed=true}}
   if(!changed)break;
 }
 guard=0;
 while(sum>target&&guard++<100000){
   let changed=false;
   for(let i=out.length-1;i>=0&&sum>target;i--){if(out[i]>min[i]){out[i]--;sum--;changed=true}}
   if(!changed)break;
 }
 return {holds:out,total:sum+trans,capacity:max.reduce((a,b)=>a+b,0)+trans};
}
function buildSequence(opts,totalSeconds){
 const maxDiff=allowedDifficulty(opts.intensity);
 let pool=P.filter(x=>!blocked(x,opts.health)&&x.diff<=maxDiff&&(x.styles.includes(opts.style)||x.phase!=="main"));
 if(pool.length<20)pool=P.filter(x=>!blocked(x,opts.health)&&x.diff<=maxDiff);
 let count=clamp(Math.ceil(totalSeconds/43),8,Math.min(92,Math.max(8,pool.length+15)));
 const usage={},seq=[];
 for(let i=0;i<count;i++){
   const phase=phaseForIndex(i,count);opts.phase=phase;const prev=seq[seq.length-1];
   let candidates=pool.filter(x=>phase==="main"?x.phase==="main":(x.phase===phase||x.phase==="main"));
   if(i===count-1)candidates=pool.filter(x=>x.id==="savasana");
   if(!candidates.length)candidates=pool;
   const rank=candidates.map(x=>({x,s:candidateScore(prev,x,opts,usage,i)})).sort((a,b)=>b.s-a.s);
   const chosen=rank[0].x;seq.push({...chosen});usage[chosen.id]=(usage[chosen.id]||0)+1;
 }
 return seq;
}
function scoreDifficulty(session){
 const poses=session.poses,totalHold=poses.reduce((a,p)=>a+p.sec,0)||1;
 const weighted=poses.reduce((a,p)=>a+p.diff*p.sec,0)/totalHold;
 const advanced=poses.filter(p=>p.diff>=4).length/Math.max(1,poses.length);
 const lowSmooth=Math.max(0,(82-session.smooth)/47);
 const holdLoad=poses.reduce((a,p)=>a+(p.sec/50)*(p.diff/5),0)/Math.max(1,poses.length);
 const raw=clamp(((weighted-1)/4)*62+advanced*18+lowSmooth*10+holdLoad*10,0,100);
 let level,label;if(raw<22){level=1;label="Лёгкая"}else if(raw<42){level=2;label="Умеренная"}else if(raw<62){level=3;label="Средняя"}else if(raw<80){level=4;label="Сложная"}else{level=5;label="Экспертная"}
 return {score:Math.round(raw),level,label};
}
function generate(input){
 const opts=Object.assign({style:"hatha",duration:20,intensity:2,goal:"mobility",health:[],redFlags:[]},input||{});
 opts.duration=clamp(Number(opts.duration)||20,8,90);opts.intensity=clamp(Number(opts.intensity)||2,1,3);opts.health=uniq(opts.health||[]);opts.redFlags=uniq(opts.redFlags||[]);
 const red=opts.redFlags.filter(x=>RED_FLAGS.includes(x));if(red.length)return {blocked:true,reason:"red_flag",redFlags:red,version:VERSION};
 const totalSeconds=Math.round(opts.duration*60);let seq=buildSequence(opts,totalSeconds),pass=0,holds=[],trans=[];
 while(pass++<20){
   trans=seq.slice(1).map((p,i)=>transitionSeconds(transitionScore(seq[i],p,opts.style)));
   const a=distributeHolds(seq,trans,totalSeconds,opts.style);holds=a.holds;
   if(a.total===totalSeconds)break;
   if(a.total<totalSeconds&&seq.length<96){const more=buildSequence(opts,Math.ceil((seq.length+1)*43));seq.push({...more[more.length-2]});continue}
   if(a.total>totalSeconds&&seq.length>8){seq.splice(Math.max(2,seq.length-2),1);continue}
   break;
 }
 seq.forEach((p,i)=>{p.sec=clamp(Math.round(holds[i]||p.min),12,50);p.transition=i?trans[i-1]:0});
 let current=seq.reduce((a,p)=>a+p.sec+p.transition,0),delta=totalSeconds-current,guard=0;
 while(delta!==0&&guard++<10000){
   let changed=false;
   for(let i=0;i<seq.length&&delta!==0;i++){
     if(delta>0&&seq[i].sec<Math.min(50,seq[i].max)){seq[i].sec++;delta--;changed=true}
     else if(delta<0&&seq[i].sec>Math.max(12,seq[i].min)){seq[i].sec--;delta++;changed=true}
   }
   if(!changed)break;
 }
 const transitions=seq.slice(1).map((p,i)=>transitionScore(seq[i],p,opts.style));
 const smooth=Math.round(transitions.reduce((a,b)=>a+b,0)/Math.max(1,transitions.length));
 const session={id:"yf-"+Date.now()+"-"+Math.random().toString(36).slice(2,7),version:VERSION,createdAt:new Date().toISOString(),style:opts.style,styleName:(STYLES[opts.style]||STYLES.hatha).name,duration:opts.duration,intensity:opts.intensity,goal:opts.goal,goalName:(GOALS[opts.goal]||GOALS.mobility).name,health:opts.health,poses:seq,smooth,transitions,totalSeconds};
 session.difficulty=scoreDifficulty(session);session.validation=validate(session,opts);session.valid=session.validation.ok;return session;
}
function validate(s,opts){
 const e=[];if(!s||!Array.isArray(s.poses)||s.poses.length<8)e.push("too_few_poses");
 const total=s&&s.poses?s.poses.reduce((a,p)=>a+(p.sec||0)+(p.transition||0),0):0,target=Math.round((s&&s.duration||0)*60);
 if(Math.abs(total-target)>1)e.push("duration_mismatch");
 if(s&&s.poses&&s.poses.some(p=>p.sec>50))e.push("hold_over_50s");
 if(s&&s.poses&&s.poses.some(p=>p.sec<10))e.push("hold_too_short");
 if(s&&s.poses&&s.poses.some(p=>blocked(p,(opts&&opts.health)||s.health||[])))e.push("health_filter_violation");
 if(!s||!s.difficulty||!Number.isFinite(s.difficulty.score))e.push("difficulty_missing");
 return {ok:e.length===0,errors:e,totalSeconds:total,targetSeconds:target};
}
return {VERSION,STYLES,GOALS,HEALTH,RED_FLAGS,POSES:P,generate,validate,transitionScore,scoreDifficulty};
});