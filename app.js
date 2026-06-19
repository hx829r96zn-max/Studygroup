function renderLiveTimeline(){
  var myT=getTSecs(),myH=Math.floor(myT/3600),myM=Math.floor((myT%3600)/60),myS=Math.floor(myT%60);
  var myDot=document.getElementById('liveMyDot'),mySubjEl=document.getElementById('liveMySubj');
  var myTimeEl=document.getElementById('liveMyTime'),myBar=document.getElementById('liveMyBar'),myNameEl=document.getElementById('liveMyName');
  if(myNameEl)myNameEl.textContent=prof.name||'나';
  if(aId&&aStart){
    var sub=subjs.find(function(s){return s.id===aId;});
    if(myDot)myDot.style.background=sub?sub.color:'var(--acc)';
    if(mySubjEl)mySubjEl.innerHTML='<span style="background:'+(sub?sub.color:'var(--acc)')+';color:#fff;padding:2px 7px;border-radius:10px;font-size:.65rem;font-weight:700">'+(sub?sub.name:'공부 중')+'</span> 공부 중';
  }else{if(myDot)myDot.style.background='#ddd';if(mySubjEl)mySubjEl.textContent='공부 중 아님';}
  if(myTimeEl)myTimeEl.textContent=myH+'h '+String(myM).padStart(2,'0')+'m '+String(myS).padStart(2,'0')+'s';
  var goalSecs=(prof.goal||6.5)*3600;
  if(myBar)myBar.style.width=Math.min(100,Math.round(myT/goalSecs*100))+'%';
  var fw=document.getElementById('liveFriendTimelines');if(!fw)return;
  // sg_connected + frds 합쳐서 모든 친구 목록 구성
  var allCodes={};
  var connected=JSON.parse(localStorage.getItem('sg_connected')||'[]');
  connected.forEach(function(c){if(c.code)allCodes[c.code]=c;});
  frds.forEach(function(f){if(f.shareCode&&!allCodes[f.shareCode])allCodes[f.shareCode]={code:f.shareCode,name:f.name,color:f.color||'#5b4fcf'};});
  var codes=Object.keys(allCodes);
  fw.innerHTML='';
  if(!codes.length){fw.innerHTML='<div style="font-size:.78rem;color:var(--ink3);padding:8px 0;text-align:center">연동된 친구 없음</div>';return;}
  codes.forEach(function(code){
    var c=allCodes[code];
    var d=_friendData[code]||{};
    // 데이터 없으면 즉시 가져오기
    if(!d.lastFetch)fetchFriendLatest(code);
    var fSecs=getFriendLiveSecs(code);
    var fH=Math.floor(fSecs/3600),fM2=Math.floor((fSecs%3600)/60);
    var isLive=d.live&&d.live.active;
    var frd=frds.find(function(x){return x.shareCode===code;});
    var fColor=(frd&&frd.color)||c.color||'#5b4fcf';
    var nm=d.name||c.name||'친구';
    var wrap=document.createElement('div');wrap.style.cssText='margin-bottom:12px';
    var topRow=document.createElement('div');topRow.style.cssText='display:flex;align-items:center;gap:7px;margin-bottom:5px';
    var dot=document.createElement('div');dot.style.cssText='width:8px;height:8px;border-radius:50%;background:'+(isLive?fColor:'#ddd')+';flex-shrink:0';
    var nmEl=document.createElement('div');nmEl.style.cssText='font-size:.8rem;font-weight:700';nmEl.textContent=nm;
    var timeEl=document.createElement('div');timeEl.style.cssText='margin-left:auto;font-family:monospace;font-size:.78rem;font-weight:600;color:var(--green)';
    timeEl.textContent=fH+'h '+String(fM2).padStart(2,'0')+'m'+(isLive?' 🔴':'');
    topRow.appendChild(dot);topRow.appendChild(nmEl);topRow.appendChild(timeEl);
    var barBg=document.createElement('div');barBg.style.cssText='height:10px;background:var(--bg);border-radius:5px;overflow:hidden';
    var barFill=document.createElement('div');barFill.style.cssText='height:100%;border-radius:5px;background:'+fColor+';width:'+Math.min(100,Math.round(fSecs/goalSecs*100))+'%;transition:width .5s';
    barBg.appendChild(barFill);wrap.appendChild(topRow);wrap.appendChild(barBg);fw.appendChild(wrap);
  });
}
// ══════════════════════════════════════════════
// FIREBASE 설정 & 초기화
// ══════════════════════════════════════════════
var _FB_CFG={apiKey:"AIzaSyAn8xDsf1WM0jXQyBqTsCJizA8rzFBO2pc",authDomain:"studygroup-app-81786.firebaseapp.com",databaseURL:"https://studygroup-app-81786-default-rtdb.firebaseio.com",projectId:"studygroup-app-81786",storageBucket:"studygroup-app-81786.firebasestorage.app",messagingSenderId:"800017756511",appId:"1:800017756511:web:d1c81b7ce8853db66386ea"};
window._fbReady=false;window._fbDB=null;window._fbAuth=null;window._fbUser=null;
window._fbSet=function(){return Promise.resolve();};window._fbGet=function(){return Promise.resolve(null);};window._fbUpdate=function(){return Promise.resolve();};window._fbListen=function(){return function(){};};
function _loadFirebase(){function loadScript(url,cb){var s=document.createElement('script');s.src=url;s.onload=cb;s.onerror=function(){cb&&cb();};document.head.appendChild(s);}loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',function(){loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',function(){loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js',function(){loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js',function(){_initFirebase();});});});});}
function _initFirebase(){try{if(typeof firebase==='undefined'){setTimeout(_initFirebase,300);return;}var app=firebase.apps&&firebase.apps.length>0?firebase.apps[0]:firebase.initializeApp(_FB_CFG);var db=firebase.database(app);var auth=firebase.auth(app);window._fbDB=db;window._fbAuth=auth;window._fbReady=true;window._fbSet=function(p,d){return db.ref(p).set(d);};window._fbGet=function(p){return db.ref(p).get();};window._fbUpdate=function(p,d){return db.ref(p).update(d);};window._fbListen=function(p,cb){var r=db.ref(p);r.on('value',function(s){cb(s.val());});return function(){r.off('value');};};var el=document.getElementById('fbStatus');if(el){el.textContent='🟢 Firebase 연결됨';el.style.color='#16734a';}var _resolved=false;auth.onAuthStateChanged(function(user){if(_resolved)return;_resolved=true;if(user){window._fbUser=user;_doLogin(user);}else if(localStorage.getItem('sg_authchoice')==='offline'){useOfflineMode(true);}else{_showLogin();}});}catch(e){console.warn('[Firebase] 실패:',e.message);_showLogin();}}
function _showLogin(){var ls=document.getElementById('loginScreen');if(ls)ls.style.display='flex';var nav=document.querySelector('nav');if(nav)nav.style.display='none';document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on');});}
function _isInAppBrowser(){var ua=navigator.userAgent||'';return /KAKAOTALK|Instagram|FBAN|FBAV|Line\/|NAVER\(|everytimeApp|; ?wv\)/i.test(ua);}
function _copyAppLink(){var url=location.href.split('?')[0];function done(){toast('🔗 링크가 복사되었습니다 — 브라우저에 붙여넣어 열어주세요');}function fallback(){toast(url);}if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(done).catch(fallback);}else{fallback();}}
if(_isInAppBrowser()){var _wvWarn=document.getElementById('loginWebviewWarn');if(_wvWarn)_wvWarn.style.display='block';}
function _restoreLastTab(){var validTabs=['home','timer','room','stats','mock','settings'];var last=localStorage.getItem('sg_lasttab')||'home';if(validTabs.indexOf(last)<0)last='home';setTimeout(function(){go(last);document.documentElement.removeAttribute('data-boot-tab');},80);}
function _doLogin(user){window._fbUser=user;localStorage.setItem('sg_authchoice','google');document.documentElement.removeAttribute('data-new-user');var ls=document.getElementById('loginScreen');if(ls)ls.style.display='none';var nav=document.querySelector('nav');if(nav)nav.style.display='flex';if(!prof.name&&user.displayName){prof.name=user.displayName;svp();}localStorage.setItem('sg_mycode',user.uid.substring(0,6).toUpperCase());loadUserDataFromFirebase(user.uid);updateAccountUI(user);setTimeout(function(){startFbSync();resumeFbSubscriptions();checkJoinParam();},500);setTimeout(function(){renderProfUI();renderHBet();buildStreak();buildHm('hmHome');},200);_restoreLastTab();}
function loginWithGoogle(){if(!window._fbAuth){toast('잠시 후 다시 시도해주세요');return;}var errEl=document.getElementById('loginError');if(errEl)errEl.style.display='none';var provider=new firebase.auth.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});window._fbAuth.signInWithPopup(provider).then(function(r){if(r.user)_doLogin(r.user);}).catch(function(e){if(errEl){errEl.textContent=e.code==='auth/popup-blocked'?'팝업이 차단됐습니다':e.code==='auth/popup-closed-by-user'?'로그인 창이 닫혔습니다':'로그인 실패: '+e.message;errEl.style.display='block';}});}
function useOfflineMode(silent){window._offlineMode=true;localStorage.setItem('sg_authchoice','offline');document.documentElement.removeAttribute('data-new-user');var ls=document.getElementById('loginScreen');if(ls)ls.style.display='none';var nav=document.querySelector('nav');if(nav)nav.style.display='flex';setTimeout(function(){renderProfUI();renderHBet();buildStreak();buildHm('hmHome');},200);setTimeout(function(){startFbSync();resumeFbSubscriptions();checkJoinParam();},500);if(!silent)toast('오프라인 모드로 시작합니다');_restoreLastTab();}
function logoutUser(){if(!confirm('로그아웃 할까요?'))return;saveUserDataToFirebase();if(window._fbAuth)window._fbAuth.signOut().then(function(){window._fbUser=null;updateAccountUI(null);window.location.reload();});}
function loadUserDataFromFirebase(uid){if(!window._fbReady)return;window._fbGet('userdata/'+uid).then(function(snap){if(!snap)return;var data=snap.val?snap.val():null;if(!data)return;if(data.prof&&data.prof.name){prof=data.prof;svp();}if(data.subjs&&data.subjs.length){subjs=data.subjs;sv();}if(data.ctr&&data.ctr.rules){ctr=data.ctr;svc();}if(data.frds&&data.frds.length){frds=data.frds;svf();}if(data.bets&&data.bets.length){bets=data.bets;svb();}if(data.cfg){cfg=data.cfg;svcfg();applyAllTheme();}if(data.todos){todos=data.todos;svTodos();}if(data.planCells&&data.planCells.date===today()&&data.planCells.cells){planCells=data.planCells.cells;svPlanLocal();var _tp=document.getElementById('pg-timer');if(_tp&&_tp.classList.contains('on')){renderTL();}}
  // 순공시간 기록(sess)은 절대 덮어쓰지 않고 항상 병합만 함 (로컬 저장소가 비어도 클라우드 백업으로 복원)
  var changed=false;
  if(data.sessBackup&&data.sessBackup.length&&mergeSessArray(data.sessBackup))changed=true;
  if(data.todaySess&&data.todaySess.length&&mergeSessArray(data.todaySess))changed=true;
  if(changed){svSess();renderTL();updateHome();}
  renderProfUI();updateHome();renderHBet();buildStreak();buildHm('hmHome');if(data.prof&&data.prof.name)toast('🔄 기록 복원됨!');}).catch(function(e){console.warn('복원 실패:',e);});}
function saveUserDataToFirebase(){if(!window._fbReady||!window._fbUser)return;var uid=window._fbUser.uid;if(uid.indexOf('offline_')===0)return;var todaySess=sess.filter(function(s){return studyDayOf(new Date(s.start))===today();});var cutoff=Date.now()-90*24*3600*1000;var sessBackup=sess.filter(function(s){return s.start>=cutoff;});return window._fbSet('userdata/'+uid,{prof:prof,subjs:subjs,ctr:ctr,frds:frds,bets:bets,cfg:cfg,todaySess:todaySess,todayDate:today(),planCells:{date:today(),cells:planCells},todos:todos,sessBackup:sessBackup,lastSaved:Date.now()});}
function updateAccountUI(user){var nE=document.getElementById('accountName'),eE=document.getElementById('accountEmail'),aE=document.getElementById('accountAvatar'),lB=document.getElementById('loginBtn'),oB=document.getElementById('logoutBtn');if(user&&user.email){if(nE)nE.textContent=user.displayName||prof.name||'사용자';if(eE)eE.textContent=user.email;if(aE)aE.textContent=(user.displayName||'?')[0].toUpperCase();if(lB)lB.style.display='none';if(oB)oB.style.display='flex';}else{if(nE)nE.textContent='오프라인 모드';if(eE)eE.textContent='로그인하면 기기간 동기화 가능';if(aE)aE.textContent='?';if(lB)lB.style.display='flex';if(oB)oB.style.display='none';}}
window.addEventListener('load',function(){setTimeout(_loadFirebase,100);});

// ══════════════════════════════════════════════
// DATA
// ══════════════════════════════════════════════
var COLORS=['#ff6b9d','#ff9a3c','#a78bfa','#34d399','#38bdf8','#f59e0b','#f472b6','#fb7185','#4ade80','#60a5fa','#ef4444','#f97316','#84cc16','#06b6d4','#8b5cf6','#10b981','#6366f1','#f43f5e','#0ea5e9','#d946ef'];
var DEF_SUBJS=[{id:'s1',name:'국어',color:'#ff6b9d'},{id:'s2',name:'영어',color:'#38bdf8'},{id:'s3',name:'수학',color:'#a78bfa'},{id:'s4',name:'사회',color:'#34d399'},{id:'s5',name:'과학',color:'#f59e0b'},{id:'s6',name:'한국사',color:'#fb7185'}];
var subjs=JSON.parse(localStorage.getItem('sg_s')||'null')||DEF_SUBJS.map(function(s){return{id:s.id,name:s.name,color:s.color};});
var sess=JSON.parse(localStorage.getItem('sg_ss')||'[]');
function svSess(){localStorage.setItem('sg_ss',JSON.stringify(sess));}
function mergeSessArray(extra){ // start 타임스탬프 기준 중복 제거 후 합치기만 함 (절대 교체하지 않음)
  if(!extra||!extra.length)return false;
  var seen={};sess.forEach(function(s){if(s&&s.start!=null)seen[s.start]=true;});
  var added=false;
  extra.forEach(function(s){if(s&&s.start!=null&&!seen[s.start]){sess.push(s);seen[s.start]=true;added=true;}});
  if(added)sess.sort(function(a,b){return a.start-b.start;});
  return added;
}
var ctr=JSON.parse(localStorage.getItem('sg_c')||'{}');
var frds=JSON.parse(localStorage.getItem('sg_f')||'[]');
var bets=JSON.parse(localStorage.getItem('sg_b')||'[]');
var prof=JSON.parse(localStorage.getItem('sg_p')||'{}');
var cfg=JSON.parse(localStorage.getItem('sg_cfg')||'{}');
var pdata=JSON.parse(localStorage.getItem('sg_pd')||'{}');
var alertCfg=JSON.parse(localStorage.getItem('sg_alert')||'{"on":false,"times":[],"msg":"지금 공부할 시간이야!"}');
var todos=JSON.parse(localStorage.getItem('sg_todos')||'{}'); // { dateKey: { subjId: [{text,done}] } } - dateKey는 today()의 study-day 기준
var todoOpenSubjId=null;
function svTodos(){localStorage.setItem('sg_todos',JSON.stringify(todos));}
function todoDateKeyFor(y,mo,d){return new Date(y,mo,d).toDateString();}
function getTodoList(dateKey,subjId){return(todos[dateKey]&&todos[dateKey][subjId])||[];}
(function _migrateTodos(){ // 과목별(예전) 구조 → 날짜별 구조로 1회 이전
  var keys=Object.keys(todos);
  var isOld=keys.some(function(k){return Array.isArray(todos[k]);});
  if(isOld){var migrated={};migrated[today()]=todos;todos=migrated;svTodos();}
})();
var aId=null,aStart=null,aInt=null,selId=null;
var _pomoSaved=JSON.parse(localStorage.getItem('sg_pomo_state')||'null');
var pRun=false,pFocus=_pomoSaved?_pomoSaved.pFocus:true;
var pSec=(cfg.pf||70)*60,pBrk=(cfg.pb||10)*60;
var pCur=_pomoSaved?_pomoSaved.pCur:0,pSN=_pomoSaved?_pomoSaved.pSN:0,pInt=null;
function svPomoState(){localStorage.setItem('sg_pomo_state',JSON.stringify({pFocus:pFocus,pCur:pCur,pSN:pSN}));}
function clearPomoState(){localStorage.removeItem('sg_pomo_state');}
var ncRules=[],pickedC=COLORS[0];
var calY=new Date().getFullYear(),calM=new Date().getMonth(),_pickY=new Date().getFullYear();
var ROW_H=36,NCOLS=6,COL_MINS=10,AXIS_W=28,GRID_START_HOUR=5;
function hourToRow(h){return(h-GRID_START_HOUR+24)%24;}
function rowToHour(r){return(r+GRID_START_HOUR)%24;}
var PCIRC=848.2;
var _pendingCode=null,_alertInts=[],_fbSyncInt=null,_fbListeners={};
var ALERT_PRESETS=['지금 당장 공부해!','핸드폰 내려놓고 책 펴!','오늘 목표 달성했어?','잠깐 쉬었으면 이제 시작해!','집중할 시간이야 📖','파이팅! 조금만 더 하자!'];

// SAVE
function sv(){localStorage.setItem('sg_s',JSON.stringify(subjs));svSess();}
function svc(){localStorage.setItem('sg_c',JSON.stringify(ctr));}
function svf(){var clean=frds.map(function(f){var c=Object.assign({},f);delete c.fbLiveTimer;return c;});localStorage.setItem('sg_f',JSON.stringify(clean));}
function svb(){localStorage.setItem('sg_b',JSON.stringify(bets));}
function svp(){localStorage.setItem('sg_p',JSON.stringify(prof));}
function svcfg(){localStorage.setItem('sg_cfg',JSON.stringify(cfg));}
function svpd(){localStorage.setItem('sg_pd',JSON.stringify(pdata));}

// HELPERS
function getResetHour(){var h=cfg&&cfg.resetHour;return(h===0||h)?h:5;}
function studyDayOf(date){var d=new Date(date.getTime());d.setHours(d.getHours()-getResetHour());return d.toDateString();}
function today(){return studyDayOf(new Date());}
function f3(s){var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return String(h).padStart(2,'0')+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0');}
function fmtHM(s){var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=Math.floor(s%60);return h+'H '+String(m).padStart(2,'0')+'M '+String(sec).padStart(2,'0')+'S';}
function fmtSh(s){var h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?h+':'+String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'):m+':'+String(sec).padStart(2,'0');}
function fmtLiveSecs(secs){var h=Math.floor(secs/3600),m=Math.floor((secs%3600)/60),s=Math.floor(secs%60);return h+'h '+String(m).padStart(2,'0')+'m '+String(s).padStart(2,'0')+'s';}
function goal(){return(prof.goal||6.5)*3600;}
function getTSecs(){var ss=sess.filter(function(s){return studyDayOf(new Date(s.start))===today();});var t=ss.reduce(function(a,s){return a+(s.end-s.start)/1000;},0);if(aId&&aStart)t+=(Date.now()-aStart)/1000;return Math.floor(t);}
function getSecs(id){var ss=sess.filter(function(s){return s.subjectId===id&&studyDayOf(new Date(s.start))===today();});var t=ss.reduce(function(a,s){return a+(s.end-s.start)/1000;},0);if(aId===id&&aStart)t+=(Date.now()-aStart)/1000;return Math.floor(t);}
function getSecsDate(y,mo,d){var key=new Date(y,mo,d).toDateString();return sess.filter(function(s){return studyDayOf(new Date(s.start))===key;}).reduce(function(a,s){return a+(s.end-s.start)/1000;},0);}

// NAV
function go(id){
  // 그룹 전체화면 열려있으면 먼저 닫기
  var rv=document.getElementById('pg-roomview');if(rv&&rv.style.display==='flex')closeRoomView();
  localStorage.setItem('sg_lasttab',id);
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('on');});
  document.querySelectorAll('.ntab,.tbtab').forEach(function(t){t.classList.remove('on');});
  var pg=document.getElementById('pg-'+id);if(pg)pg.classList.add('on');
  var map={home:0,timer:1,room:2,stats:3,mock:4,settings:5};
  if(map[id]!==undefined){var tabs=document.querySelectorAll('.ntab');if(tabs[map[id]])tabs[map[id]].classList.add('on');var tbs=document.querySelectorAll('.tbtab');if(tbs[map[id]])tbs[map[id]].classList.add('on');}
  if(id==='timer'){renderTH();renderSL();setTimeout(function(){renderTL();scrollNow();renderTodoPanel();},80);}
  if(id==='home'){updateHome();renderHBet();renderDdayCard();renderHomeSubjGrid();if(pCur<=0)pCur=pSec;updatePUI();}
  if(id==='stats'){renderCal();updateStats();}
  if(id==='settings')renderSet();
  if(id==='mock')renderMockPage();
  if(id==='room')renderRoom();
}
function toast(msg){var el=document.getElementById('toastEl');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('show');},2400);}
function openModal(id){var el=document.getElementById(id);if(el)el.classList.add('open');}
function closeModal(id){var el=document.getElementById(id);if(el)el.classList.remove('open');}

// POMO
function updatePUI(){var fSecs=pFocus?pCur:pSec,bSecs=pFocus?pBrk:pCur;var nf=document.getElementById('pNumFocus');if(nf)nf.textContent=String(Math.floor(fSecs/60)).padStart(2,'0')+':'+String(fSecs%60).padStart(2,'0');var nb=document.getElementById('pNumBreak');if(nb)nb.textContent=String(Math.floor(bSecs/60)).padStart(2,'0')+':'+String(bSecs%60).padStart(2,'0');var fr=document.getElementById('pFocusRow'),br=document.getElementById('pBreakRow');if(fr&&br){if(pFocus){fr.classList.remove('dim');br.classList.add('dim');}else{fr.classList.add('dim');br.classList.remove('dim');}}var prog=document.getElementById('pProg');if(prog){var tot=pFocus?pSec:pBrk;prog.style.strokeDashoffset=PCIRC*(1-pCur/tot);}}
var _pomoStartAt=null;
function togglePomo(){if(pRun)pomoPause();else pomoResume();}
function pomoPause(){
  clearInterval(pInt);pRun=false;_pomoStartAt=null;var pb=document.getElementById('pBtn');if(pb){pb.textContent='▶ 계속';pb.classList.remove('running');}svPomoState();if(aId&&aId===pomoSubjId)stopSubj();renderHomeSubjGrid();
}
function pomoResume(){
  if(!pomoSubjId){toast('먼저 과목을 선택하세요');return;}pRun=true;if(pCur<=0)pCur=pFocus?pSec:pBrk;var startCur=pCur;_pomoStartAt=Date.now();var pb2=document.getElementById('pBtn');if(pb2){pb2.textContent='⏸ 멈춤';pb2.classList.add('running');}if(pFocus&&aId!==pomoSubjId)startSubj(pomoSubjId);renderHomeSubjGrid();svPomoState();
    pInt=setInterval(function(){var elapsed=Math.floor((Date.now()-_pomoStartAt)/1000);pCur=Math.max(0,startCur-elapsed);if(pCur<=0){if(pFocus){pSN++;var dot=document.querySelectorAll('.p-dot')[pSN-1];if(dot)dot.classList.add('done');pFocus=false;pCur=pBrk;startCur=pBrk;_pomoStartAt=Date.now();svPomoState();if(aId===pomoSubjId)stopSubj();if(navigator.vibrate)navigator.vibrate([400,100,400,100,200]);toast('집중 완료 · 휴식 시작');}else{pFocus=true;pCur=pSec;startCur=pSec;_pomoStartAt=Date.now();svPomoState();if(pomoSubjId&&aId!==pomoSubjId)startSubj(pomoSubjId);if(navigator.vibrate)navigator.vibrate([200,100,200]);toast('휴식 끝 · 집중 시작');}renderHomeSubjGrid();}else{svPomoState();}updatePUI();},500);
}
var HOME_SUBJ_ORDER=['국어','영어','수학','사회','과학','한국사'];
function ensureHomeSubjs(){if(!subjs.length){subjs=DEF_SUBJS.map(function(s){return{id:s.id,name:s.name,color:s.color};});sv();}}
function renderHomeSubjGrid(){var el=document.getElementById('homeSubjGrid');if(!el)return;ensureHomeSubjs();var ordered=[];HOME_SUBJ_ORDER.forEach(function(nm){var f=subjs.find(function(s){return s.name===nm;});if(f)ordered.push(f);});subjs.forEach(function(s){if(HOME_SUBJ_ORDER.indexOf(s.name)<0)ordered.push(s);});el.innerHTML='';ordered.forEach(function(s){var b=document.createElement('button');var cls='subj-btn';if(aId===s.id)cls+=' studying';else if(pomoSubjId===s.id)cls+=' sel';b.className=cls;b.textContent=s.name;b.onclick=function(){pomoSubjId=s.id;localStorage.setItem('sg_pomosubj',s.id);updatePomoSubjLabel();renderHomeSubjGrid();};el.appendChild(b);});}
function resetPomo(){clearInterval(pInt);pRun=false;pFocus=true;pCur=pSec;pSN=0;clearPomoState();document.querySelectorAll('.p-dot').forEach(function(d){d.classList.remove('done');});var pb=document.getElementById('pBtn');if(pb){pb.textContent='▶ 시작';pb.classList.remove('running');}if(aId===pomoSubjId)stopSubj();renderHomeSubjGrid();updatePUI();}

// D-DAY
var ddayList=JSON.parse(localStorage.getItem('sg_dday')||'[]');
function svDday(){localStorage.setItem('sg_dday',JSON.stringify(ddayList));}
function getDdayDiff(dateStr){var now=new Date();now.setHours(0,0,0,0);var t=new Date(dateStr);t.setHours(0,0,0,0);return Math.ceil((t-now)/(1000*60*60*24));}
// ── 시간표 ──
var _ttRows_=JSON.parse(localStorage.getItem('sg_ttrows')||'{}');
var _ttStatuses=JSON.parse(localStorage.getItem('sg_ttst')||'{}');
var _ttHistory=[],_ttFuture=[],_ttPickRow=null,_ttFocusRow=null;
var _ttDate=today();
// 구버전 sg_tts 마이그레이션
(function(){
  var old=JSON.parse(localStorage.getItem('sg_tts')||'{}');
  Object.keys(old).forEach(function(dk){
    if(_ttRows_[dk])return;
    _ttRows_[dk]=(old[dk]||[]).map(function(r){return r.subjId||null;});
    (old[dk]||[]).forEach(function(r){
      if(!r.subjId||!(r.todos||[]).length)return;
      if(!todos[dk])todos[dk]={};
      if(!todos[dk][r.subjId]){
        todos[dk][r.subjId]=(r.todos||[]).map(function(t){return{text:t.text,done:t.status==='O'};});
        svTodos();
      }
    });
  });
  if(Object.keys(old).length){localStorage.setItem('sg_ttrows',JSON.stringify(_ttRows_));localStorage.removeItem('sg_tts');}
})();
function _ttKey(){return _ttDate;}
function _ttGetRows(){
  if(!_ttRows_[_ttKey()]){_ttRows_[_ttKey()]=[];for(var i=0;i<5;i++)_ttRows_[_ttKey()].push(null);}
  return _ttRows_[_ttKey()];
}
function _ttGetSt(subjId,idx){
  var dk=_ttKey();
  if(!_ttStatuses[dk])_ttStatuses[dk]={};
  if(!_ttStatuses[dk][subjId])_ttStatuses[dk][subjId]=[];
  return _ttStatuses[dk][subjId][idx]||'X';
}
function _ttSetSt(subjId,idx,st){
  var dk=_ttKey();
  if(!_ttStatuses[dk])_ttStatuses[dk]={};
  if(!_ttStatuses[dk][subjId])_ttStatuses[dk][subjId]=[];
  _ttStatuses[dk][subjId][idx]=st;
  localStorage.setItem('sg_ttst',JSON.stringify(_ttStatuses));
  var list=getTodoList(dk,subjId);
  if(list[idx])list[idx].done=(st==='O');
  svTodos();
}
function svTTRows(){localStorage.setItem('sg_ttrows',JSON.stringify(_ttRows_));}
function _ttSnap(){_ttHistory.push(JSON.stringify({r:JSON.parse(JSON.stringify(_ttRows_)),s:JSON.parse(JSON.stringify(_ttStatuses))}));if(_ttHistory.length>40)_ttHistory.shift();_ttFuture=[];}
function ttUndo(){if(!_ttHistory.length)return;_ttFuture.push(JSON.stringify({r:JSON.parse(JSON.stringify(_ttRows_)),s:JSON.parse(JSON.stringify(_ttStatuses))}));var snap=JSON.parse(_ttHistory.pop());_ttRows_=snap.r;_ttStatuses=snap.s;svTTRows();localStorage.setItem('sg_ttst',JSON.stringify(_ttStatuses));renderTT();}
function ttRedo(){if(!_ttFuture.length)return;_ttHistory.push(JSON.stringify({r:JSON.parse(JSON.stringify(_ttRows_)),s:JSON.parse(JSON.stringify(_ttStatuses))}));var snap=JSON.parse(_ttFuture.pop());_ttRows_=snap.r;_ttStatuses=snap.s;svTTRows();localStorage.setItem('sg_ttst',JSON.stringify(_ttStatuses));renderTT();}
function _ttDateLabel(){var dt=new Date(_ttDate);var days=['일','월','화','수','목','금','토'];return(dt.getMonth()+1)+'월 '+dt.getDate()+'일 ('+days[dt.getDay()]+')';}
function goTimetable(){_ttDate=today();_ttFocusRow=null;var pg=document.getElementById('pg-timetable');if(pg)pg.style.display='flex';var pt=document.getElementById('pg-timer');if(pt){pt.style.display='none';pt.classList.remove('on');}renderTT();var ttBtn=document.getElementById('ttBtn');if(ttBtn)ttBtn.textContent='플래너';_bindTTSwipe();}
function goPlanner(){var pg=document.getElementById('pg-timetable');if(pg)pg.style.display='none';var pt=document.getElementById('pg-timer');if(pt){pt.style.display='flex';pt.classList.add('on');}var ttBtn=document.getElementById('ttBtn');if(ttBtn)ttBtn.textContent='시간표';}
function ttGoDate(offset){var dt=new Date(_ttDate);dt.setDate(dt.getDate()+offset);_ttDate=new Date(dt).toDateString();_ttFocusRow=null;renderTT();}
function ttGoToday(){_ttDate=today();_ttFocusRow=null;renderTT();}
function ttPickDate(){var inp=document.createElement('input');inp.type='date';var dt=new Date(_ttDate);inp.value=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');inp.style.cssText='position:fixed;opacity:0;top:40px;left:50%;';document.body.appendChild(inp);inp.onchange=function(){if(inp.value){var p=inp.value.split('-');_ttDate=new Date(+p[0],+p[1]-1,+p[2]).toDateString();_ttFocusRow=null;renderTT();}document.body.removeChild(inp);};inp.focus();inp.click();}
var _ttSwipeBound=false;
function _bindTTSwipe(){if(_ttSwipeBound)return;_ttSwipeBound=true;var body=document.getElementById('ttBody');if(!body)return;var sx=0,moved=false;body.addEventListener('pointerdown',function(e){sx=e.clientX;moved=false;},{passive:true});body.addEventListener('pointermove',function(e){if(Math.abs(e.clientX-sx)>8)moved=true;},{passive:true});body.addEventListener('pointerup',function(e){if(!moved)return;var dx=e.clientX-sx;if(Math.abs(dx)>50)ttGoDate(dx<0?1:-1);},{passive:true});}
function renderTT(){
  var rowSubjs=_ttGetRows();
  var lbl=document.getElementById('ttDateLabel');if(lbl)lbl.textContent=_ttDateLabel();
  var todayBtn=document.getElementById('ttTodayBtn');if(todayBtn)todayBtn.style.display=(_ttDate===today())?'none':'inline-block';
  var el=document.getElementById('ttBody');if(!el)return;
  el.innerHTML='';
  rowSubjs.forEach(function(subjId,ri){
    var sub=subjId?subjs.find(function(s){return s.id===subjId;}):null;
    var dk=_ttKey();
    var todoList=sub?getTodoList(dk,subjId):[];
    var hasFocus=(_ttFocusRow===ri);

    // 과목 헤더 (가로선)
    var hdr=document.createElement('div');
    hdr.style.cssText='display:flex;align-items:center;gap:8px;padding:9px 12px 4px;cursor:pointer;'+(ri>0?'border-top:1px solid #2a2a2a;':'');
    if(sub){
      hdr.innerHTML='<div style="width:8px;height:8px;border-radius:50%;background:'+sub.color+';flex-shrink:0"></div>'
        +'<span style="font-size:.8rem;font-weight:800;color:'+sub.color+'">'+escapeHtml(sub.name)+'</span>'
        +'<div style="flex:1;height:1px;background:#2a2a2a;margin-left:4px"></div>';
    }else{
      hdr.innerHTML='<span style="font-size:.75rem;color:#555;font-weight:600">+ 과목 선택</span>'
        +'<div style="flex:1;height:1px;background:#222;margin-left:6px"></div>';
    }
    hdr.onclick=function(e){e.stopPropagation();_ttPickRow=ri;openTTSubjPicker();};
    el.appendChild(hdr);

    // 할일 줄마다
    todoList.forEach(function(t,ti){
      var line=document.createElement('div');
      line.style.cssText='display:flex;align-items:center;padding:5px 10px 5px 26px;border-bottom:1px solid #1a1a1a;min-height:36px;';
      var st=_ttGetSt(subjId,ti);
      var txt=document.createElement('div');
      txt.style.cssText='flex:1;font-size:.82rem;color:'+(st==='O'?'rgba(255,255,255,.4)':'#fff')+';line-height:1.5;cursor:pointer;user-select:none;text-decoration:'+(st==='O'?'line-through':'none')+';';
      txt.textContent=t.text;
      txt.ondblclick=function(e){e.stopPropagation();
        var inp=document.createElement('input');inp.value=t.text;
        inp.style.cssText='flex:1;width:100%;font-size:.82rem;background:transparent;border:none;border-bottom:1px solid '+(sub?sub.color:'#555')+';color:#fff;padding:1px 0;outline:none;';
        inp.onblur=function(){var v=inp.value.trim();if(v&&v!==t.text){t.text=v;svTodos();renderTT();if(todoOpenSubjId===subjId)renderTodoPanel();}else renderTT();};
        inp.onkeydown=function(e2){if(e2.key==='Enter'||e2.key==='Escape')inp.blur();e2.stopPropagation();};
        txt.parentNode.replaceChild(inp,txt);inp.focus();inp.select();
      };
      // 세로 구분선
      var sep=document.createElement('div');sep.style.cssText='width:1px;background:#2a2a2a;align-self:stretch;flex-shrink:0;margin:0 6px;';
      // 상태 (텍스트만, 동그라미 없음)
      var stColor=st==='O'?'#22c55e':st==='△'?'#eab308':'#ef4444';
      var stBtn=document.createElement('div');
      stBtn.style.cssText='font-size:.9rem;font-weight:900;color:'+stColor+';cursor:pointer;padding:4px 6px;user-select:none;flex-shrink:0;min-width:24px;text-align:center;';
      stBtn.textContent=st;
      var _hold=null;
      (function(sId,idx){
        stBtn.addEventListener('pointerdown',function(){_hold=setTimeout(function(){_hold=null;var cur=_ttGetSt(sId,idx);_ttSetSt(sId,idx,cur==='△'?'X':'△');renderTT();if(todoOpenSubjId===sId)renderTodoPanel();},800);});
        stBtn.addEventListener('pointerup',function(){if(_hold){clearTimeout(_hold);_hold=null;var cur=_ttGetSt(sId,idx);_ttSetSt(sId,idx,cur==='X'?'O':cur==='O'?'X':'X');renderTT();if(todoOpenSubjId===sId)renderTodoPanel();}});
        stBtn.addEventListener('pointerleave',function(){if(_hold){clearTimeout(_hold);_hold=null;}});
      })(subjId,ti);
      // 삭제 (간격 넓게)
      var delBtn=document.createElement('div');
      delBtn.style.cssText='font-size:.6rem;color:#333;cursor:pointer;padding:4px 4px 4px 18px;flex-shrink:0;';
      delBtn.textContent='✕';
      delBtn.onclick=function(){todoList.splice(ti,1);if(_ttStatuses[dk]&&_ttStatuses[dk][subjId])_ttStatuses[dk][subjId].splice(ti,1);svTodos();localStorage.setItem('sg_ttst',JSON.stringify(_ttStatuses));renderTT();if(todoOpenSubjId===subjId)renderTodoPanel();};
      line.appendChild(txt);line.appendChild(sep);line.appendChild(stBtn);line.appendChild(delBtn);
      el.appendChild(line);
    });

    // 입력칸 (포커스 행)
    if(hasFocus&&sub){
      var addLine=document.createElement('div');addLine.style.cssText='display:flex;align-items:center;padding:5px 10px 5px 26px;border-bottom:1px solid #1a1a1a;';
      var addInp=document.createElement('input');addInp.placeholder='할 일 입력...';addInp.className='tt-add-inp';addInp.dataset.ri=ri;
      addInp.style.cssText='flex:1;font-size:.8rem;background:transparent;border:none;border-bottom:1px dashed #444;color:#fff;padding:2px 0;outline:none;';
      addInp.onkeydown=function(e){
        e.stopPropagation();
        if(e.key==='Enter'){
          var v=addInp.value.trim();
          if(v){if(!todos[dk])todos[dk]={};if(!todos[dk][subjId])todos[dk][subjId]=[];todos[dk][subjId].push({text:v,done:false});svTodos();if(todoOpenSubjId===subjId)renderTodoPanel();}
          _ttFocusRow=ri;renderTT();
          setTimeout(function(){el.querySelectorAll('.tt-add-inp').forEach(function(i2){if(i2.dataset.ri==ri)i2.focus();});},20);
        }else if(e.key==='Escape'){_ttFocusRow=null;renderTT();}
      };
      addInp.onblur=function(){setTimeout(function(){if(document.activeElement&&document.activeElement.className==='tt-add-inp'&&document.activeElement.dataset.ri==ri)return;_ttFocusRow=null;renderTT();},160);};
      addLine.appendChild(addInp);el.appendChild(addLine);
      setTimeout(function(){el.querySelectorAll('.tt-add-inp').forEach(function(i2){if(i2.dataset.ri==ri)i2.focus();});},20);
    }else{
      var addBtn=document.createElement('div');addBtn.style.cssText='padding:4px 10px 6px 26px;color:#444;font-size:.7rem;cursor:text;';
      addBtn.textContent='+ 추가';
      addBtn.onclick=function(){if(!sub){toast('먼저 과목을 선택하세요');return;}_ttFocusRow=ri;renderTT();setTimeout(function(){el.querySelectorAll('.tt-add-inp').forEach(function(i2){if(i2.dataset.ri==ri)i2.focus();});},20);};
      el.appendChild(addBtn);
    }
  });

  var addSec=document.createElement('div');addSec.style.cssText='display:flex;align-items:center;padding:14px 12px;cursor:pointer;color:#444;font-size:.78rem;gap:6px;border-top:1px solid #1a1a1a;';
  addSec.innerHTML='<span style="font-size:1rem;font-weight:700;color:#555">＋</span> 과목 추가';
  addSec.onclick=function(){_ttGetRows().push(null);svTTRows();_ttPickRow=rowSubjs.length;openTTSubjPicker();};
  el.appendChild(addSec);
}
function openTTSubjPicker(){
  var list=document.getElementById('ttSubjPickerList');if(!list)return;list.innerHTML='';
  subjs.forEach(function(s){
    var btn=document.createElement('button');
    btn.style.cssText='display:flex;align-items:center;gap:10px;width:100%;padding:11px 14px;background:#111;border:1px solid '+s.color+';border-radius:10px;cursor:pointer;font-family:inherit;margin-bottom:6px;';
    btn.innerHTML='<div style="width:10px;height:10px;border-radius:50%;background:'+s.color+'"></div><div style="font-size:.85rem;font-weight:700;color:#fff">'+escapeHtml(s.name)+'</div>';
    btn.onclick=function(){var rows2=_ttGetRows();if(_ttPickRow!=null)rows2[_ttPickRow]=s.id;svTTRows();closeModal('ttSubjPickerM');_ttFocusRow=_ttPickRow;renderTT();};
    list.appendChild(btn);
  });
  openModal('ttSubjPickerM');
}
// 플래너 todo 변경시 시간표 동기화 (시간표가 열려있을 때만)
function _syncTTIfOpen(subjId){var pg=document.getElementById('pg-timetable');if(pg&&pg.style.display==='flex'&&_ttDate===today())renderTT();}

function renderDdayCard(){var el=document.getElementById('ddayCard');if(!el)return;if(!ddayList.length){el.style.display='none';return;}el.style.display='block';el.innerHTML='';ddayList.slice().sort(function(a,b){return getDdayDiff(a.date)-getDdayDiff(b.date);}).forEach(function(d,i){var diff=getDdayDiff(d.date),label=diff>0?'D-'+diff:diff===0?'D-DAY':'D+'+Math.abs(diff),urgent=diff>=0&&diff<=7;var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:'+(ddayList.length===1?'4px 0':'6px 0')+';'+(i<ddayList.length-1?'border-bottom:1px solid rgba(255,255,255,.08);':'');row.innerHTML='<div style="display:flex;align-items:center;gap:8px"><div style="font-size:.82rem;font-weight:700;color:#fff">'+d.name+'</div>'+(d.date?'<div style="font-size:.68rem;color:rgba(255,255,255,.4)">'+d.date.slice(5).replace('-','/')+'</div>':'')+'</div><div style="display:flex;align-items:center;gap:6px"><div style="font-family:monospace;font-size:'+(ddayList.length===1?'1.6rem':'1.2rem')+';font-weight:800;color:'+(diff<0?'rgba(255,255,255,.35)':urgent?'#f97316':'#fff')+'">'+label+'</div><button onclick="removeDday('+i+')" style="background:none;border:none;color:rgba(255,255,255,.25);cursor:pointer;font-size:.75rem;padding:2px 4px">✕</button></div>';el.appendChild(row);});}
function removeDday(i){ddayList.splice(i,1);svDday();renderDdayCard();}
function openDdayModal(){var m=document.getElementById('ddayModalBg');if(m){m.classList.add('open');var n=document.getElementById('dday_name'),dt=document.getElementById('dday_date');if(n)n.value='';if(dt)dt.value='';}}
function closeDdayModal(){var m=document.getElementById('ddayModalBg');if(m)m.classList.remove('open');}
function addDdayItem(){var n=(document.getElementById('dday_name')||{}).value.trim(),dt=(document.getElementById('dday_date')||{}).value;if(!n||!dt){toast('이름과 날짜를 입력해주세요');return;}ddayList.push({name:n,date:dt});svDday();renderDdayCard();closeDdayModal();toast('D-day 추가됨 📅');}

// HOME
function syncAllScreens(){var t=getTSecs();updateHome();var tt=document.getElementById('timerTotal');if(tt)tt.textContent=fmtHM(t);renderSL();renderTL();checkStreakPoints();checkGoalBonus();if(Math.floor(Date.now()/1000)%30===0)pushAgeData();if(frds.some(function(f){return f.fbLiveTimer&&f.fbLiveTimer.active;}))renderConnectedMembers();}
function updateHome(){var t=getTSecs(),h=Math.floor(t/3600),m=Math.floor((t%3600)/60),sec=Math.floor(t%60);var ht=document.getElementById('homeTotal');if(ht)ht.innerHTML=h+'<span style="font-size:.85rem;color:var(--ink2)">h</span>'+String(m).padStart(2,'0')+'<span style="font-size:.85rem;color:var(--ink2)">m</span>'+String(sec).padStart(2,'0')+'<span style="font-size:.85rem;color:var(--ink2)">s</span>';var pct=Math.min(100,Math.round(t/goal()*100));var hb=document.getElementById('homeBar');if(hb)hb.style.width=pct+'%';var hp=document.getElementById('homePct');if(hp)hp.textContent=pct+'%';var gl=document.getElementById('goalLbl');if(gl){var gh=Math.floor(goal()/3600),gm=Math.floor((goal()%3600)/60);gl.textContent='목표 '+gh+'h'+(gm>0?' '+gm+'m':'');}var bars=document.getElementById('homeSubjBars');if(!bars)return;bars.innerHTML='';var mx=1;subjs.forEach(function(s){var sc=getSecs(s.id);if(sc>mx)mx=sc;});subjs.forEach(function(sub){var st=getSecs(sub.id);if(!st)return;var sh=Math.floor(st/3600),sm=Math.floor((st%3600)/60),ss2=st%60;var ts=sh>0?sh+':'+String(sm).padStart(2,'0')+':'+String(ss2).padStart(2,'0'):sm+':'+String(ss2).padStart(2,'0');var r=document.createElement('div');r.style.cssText='display:flex;align-items:center;gap:6px;margin-bottom:5px';r.innerHTML='<div style="width:34px;font-size:.68rem;font-weight:600;color:'+sub.color+';overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+sub.name+'</div><div style="flex:1;height:5px;background:var(--line);border-radius:3px;overflow:hidden"><div style="height:100%;border-radius:3px;background:'+sub.color+';width:'+Math.round(st/mx*100)+'%"></div></div><div style="font-family:monospace;font-size:.63rem;color:var(--ink2);width:40px;text-align:right">'+ts+'</div>';bars.appendChild(r);});}
function renderHBet(){var el=document.getElementById('homeBetContent');if(!el)return;var act=bets.filter(function(b){return b.status!=='done';});if(!act.length){el.innerHTML='<div style="font-size:.76rem;color:var(--ink3);padding:7px 0;text-align:center">진행 중인 내기 없음</div>';return;}el.innerHTML='';act.forEach(function(b){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:7px;padding:8px 0;border-bottom:1px solid var(--line)';row.innerHTML='<div style="flex:1"><div style="font-size:.83rem;font-weight:700">vs '+b.opp+'</div><div style="font-size:.68rem;color:var(--ink2);margin-top:1px">'+b.cl+' · '+b.s+'~'+b.e+'</div></div><div style="text-align:right"><div style="font-family:monospace;font-size:.88rem;color:var(--green)">'+Number(b.amt).toLocaleString()+'원</div></div>';el.appendChild(row);});}

// TIMER
function renderTH(){var now=new Date(),days=['일','월','화','수','목','금','토'];var td=document.getElementById('timerDay');if(td)td.textContent=now.getFullYear()+'. '+(now.getMonth()+1)+'. '+now.getDate()+' ('+days[now.getDay()]+')';var tt=document.getElementById('timerTotal');if(tt)tt.textContent=fmtHM(getTSecs());}
function renderSL(){var w=document.getElementById('subjList');if(!w)return;w.innerHTML='';subjs.forEach(function(sub){var sc=getSecs(sub.id),isSel=selId===sub.id;var r=document.createElement('div');r.className='sr'+(isSel?' sel':'');r.innerHTML='<div class="sdot" style="background:'+sub.color+'"></div><div class="sname">'+sub.name+'</div><div class="stime">'+fmtSh(sc)+'</div>';r.onclick=(function(id){return function(){clickSubj(id);};})(sub.id);w.appendChild(r);});var add=document.createElement('div');add.className='add-s';add.innerHTML='+ 추가';add.onclick=openAddSM;w.appendChild(add);}
function selSubj(id){selId=id;var sub=subjs.find(function(s){return s.id===id;});var btn=document.getElementById('tcBtn');if(!btn)return;btn.disabled=false;btn.style.background=sub.color;btn.textContent=aId===id?'■ 정지':'▶ '+sub.name;// 뽀모도로 과목도 동기화
pomoSubjId=id;localStorage.setItem('sg_pomosubj',id);updatePomoSubjLabel();renderHomeSubjGrid();renderSL();}
var _lastSubjClick={id:null,time:0};
function clickSubj(id){
  selSubj(id);
  if(planMode)return;
  var now=Date.now();
  if(_lastSubjClick.id===id&&(now-_lastSubjClick.time)<350){
    todoOpenSubjId=(todoOpenSubjId===id)?null:id;
    renderTodoPanel();
    _lastSubjClick={id:null,time:0};
  }else{
    _lastSubjClick={id:id,time:now};
  }
}
function toggleSubj(){if(!selId)return;if(aId===selId){var sid=selId;stopSubj();if(cfg.linkPomoStop!==false&&pRun&&pomoSubjId===sid)pomoPause();}else{startSubj(selId);if(cfg.linkPomoStart!==false&&!pRun&&pomoSubjId===selId)pomoResume();}}
function stopSubjBtn(){var sid=aId;stopSubj();if(cfg.linkPomoStop!==false&&pRun&&pomoSubjId===sid)pomoPause();}
function updatePomoSubjBadge(){var el=document.getElementById('pomoSubjBadge');if(!el)return;if(aId){var sub=subjs.find(function(s){return s.id===aId;});if(sub){el.textContent=sub.name;el.style.background=sub.color;el.style.display='block';return;}}el.style.display='none';}
function startSubj(id){if(aId)_stopSil(aId);aId=id;aStart=Date.now();var sub=subjs.find(function(s){return s.id===id;});var bar=document.getElementById('activeBar');if(bar)bar.classList.add('on');var ad=document.getElementById('adot');if(ad)ad.style.background=sub.color;var an=document.getElementById('aname');if(an)an.textContent=sub.name;restartFbSync();clearInterval(aInt);aInt=setInterval(function(){var at=document.getElementById('atime');if(at)at.textContent=f3(Math.floor((Date.now()-aStart)/1000));syncAllScreens();},500);var ts=document.getElementById('tcStop');if(ts)ts.style.display='flex';selSubj(id);renderTL();updatePomoSubjBadge();}
function stopSubj(){if(!aId)return;var endT=Date.now();var sub=subjs.find(function(s){return s.id===aId;});sess.push({subjectId:aId,color:(sub&&sub.color)||'#888',start:aStart,end:endT});svSess();var sid=aId;aId=null;aStart=null;clearInterval(aInt);var bar=document.getElementById('activeBar');if(bar)bar.classList.remove('on');var ts=document.getElementById('tcStop');if(ts)ts.style.display='none';var at=document.getElementById('atime');if(at)at.textContent='00:00:00';selSubj(sid);renderTL();renderTH();updateHome();fbPushMyData();saveUserDataToFirebase();restartFbSync();updatePomoSubjBadge();toast('⏱ '+fmtHM(getSecs(sid)));}
function _stopSil(id){sess.push({subjectId:id,color:(subjs.find(function(s){return s.id===id;})||{}).color||'#888',start:aStart,end:Date.now()});sv();}

// PLANNER
function planHex(){return(cfg&&cfg.themeC&&cfg.themeC['--plan'])||'#60a5fa';}
function hexToRGBA(hex,a){hex=(hex||'#60a5fa').replace('#','');if(hex.length===3)hex=hex.split('').map(function(x){return x+x;}).join('');var r=parseInt(hex.substr(0,2),16),g=parseInt(hex.substr(2,2),16),b=parseInt(hex.substr(4,2),16);return'rgba('+r+','+g+','+b+','+a+')';}
function currentPlanColor(){if(selId){var s=subjs.find(function(x){return x.id===selId;});if(s)return s.color;}return planHex();}
function cellColor(v){return(v&&typeof v==='string')?v:planHex();}
var planMode=false;
function planKey(){return'sg_plancells_'+today();}
var _planHistory=[],_planRedo=[];
function pushPlanHistory(){_planHistory.push(JSON.stringify(planCells));if(_planHistory.length>50)_planHistory.shift();_planRedo=[];updateUndoBtn();}
function undoPlan(){if(!_planHistory.length){toast('되돌릴 작업이 없습니다');return;}_planRedo.push(JSON.stringify(planCells));planCells=JSON.parse(_planHistory.pop());svPlan();renderTL();updateUndoBtn();toast('되돌렸습니다');}
function redoPlan(){if(!_planRedo.length){toast('다시 실행할 작업이 없습니다');return;}_planHistory.push(JSON.stringify(planCells));planCells=JSON.parse(_planRedo.pop());svPlan();renderTL();updateUndoBtn();toast('다시 실행했습니다');}
function updateUndoBtn(){var b=document.getElementById('planUndoBtn');if(b)b.style.opacity=_planHistory.length?'1':'.35';var r=document.getElementById('planRedoBtn');if(r)r.style.opacity=_planRedo.length?'1':'.35';}
var planCells=JSON.parse(localStorage.getItem(planKey())||'{}');
function svPlanLocal(){localStorage.setItem(planKey(),JSON.stringify(planCells));}
var _planPushTimer=null;
function pushPlanToFirebase(){if(!window._fbReady||!window._fbUser)return;var uid=window._fbUser.uid;if(uid.indexOf('offline_')===0)return;clearTimeout(_planPushTimer);_planPushTimer=setTimeout(function(){window._fbSet('userdata/'+uid+'/planCells',{date:today(),cells:planCells});},800);}
function svPlan(){svPlanLocal();pushPlanToFirebase();}
function reloadPlanForToday(){try{planCells=JSON.parse(localStorage.getItem(planKey())||'{}');}catch(e){planCells={};}}
function togglePlanMode(){planMode=!planMode;var btn=document.getElementById('planToggle'),sbtn=document.getElementById('planSaveBtn'),ubtn=document.getElementById('planUndoBtn'),pg=document.getElementById('pg-timer');if(btn){btn.classList.toggle('active',planMode);btn.textContent=planMode?'계획 수정 중':'계획짜기';}if(sbtn)sbtn.style.display=planMode?'inline-block':'none';if(ubtn)ubtn.style.display=planMode?'inline-block':'none';var rbtn=document.getElementById('planRedoBtn');if(rbtn)rbtn.style.display=planMode?'inline-block':'none';if(pg)pg.classList.toggle('plan-mode',planMode);if(planMode){_planHistory=[];_planRedo=[];updateUndoBtn();todoOpenSubjId=null;renderTodoPanel();}renderTL();toast(planMode?'계획 모드: 왼쪽 과목을 고르면 그 색으로 칠해집니다':'계획 모드 종료');}
function savePlan(){svPlan();planMode=false;var btn=document.getElementById('planToggle'),sbtn=document.getElementById('planSaveBtn'),pg=document.getElementById('pg-timer');if(btn){btn.classList.remove('active');btn.textContent='계획짜기';}if(sbtn)sbtn.style.display='none';var ub=document.getElementById('planUndoBtn');if(ub)ub.style.display='none';var rb=document.getElementById('planRedoBtn');if(rb)rb.style.display='none';if(pg)pg.classList.remove('plan-mode');renderTL();toast('계획이 저장되었습니다');}
function cellIdxFromEvent(grid,e){var pt=e.touches&&e.touches[0]?e.touches[0]:(e.changedTouches&&e.changedTouches[0]?e.changedTouches[0]:e);if(!pt)return-1;var rect=grid.getBoundingClientRect();var x=pt.clientX-rect.left,y=pt.clientY-rect.top;var gw=rect.width||window._planGridW||grid.offsetWidth||220;if(x<AXIS_W)return-1;var cellW=(gw-AXIS_W)/NCOLS;var col=Math.floor((x-AXIS_W)/cellW);var dispRow=Math.floor(y/ROW_H);if(col<0)col=0;if(col>=NCOLS)col=NCOLS-1;if(dispRow<0||dispRow>=24)return-1;return rowToHour(dispRow)*NCOLS+col;}
function paintQuickState(grid,idx,filled,color){var cell=grid.querySelector('[data-cell="'+idx+'"]');if(!cell)return;if(filled){var col=color||currentPlanColor();cell.style.background=hexToRGBA(col,.30);cell.style.border='1px solid '+hexToRGBA(col,.6);}else{cell.style.background='transparent';cell.style.border='1px dashed rgba(255,255,255,.12)';}}
function bindPlanDrag(grid){if(grid._planDragBound)return;grid._planDragBound=true;var sx=0,sy=0,startIdx=-1,dir=null,paintErase=false,histDone=false,active=false;function start(e){if(!planMode)return;var pt=e.touches&&e.touches[0]?e.touches[0]:e;startIdx=cellIdxFromEvent(grid,e);sx=pt.clientX;sy=pt.clientY;dir=null;histDone=false;active=true;paintErase=startIdx>=0?!!planCells[startIdx]:false;}function move(e){if(!planMode||!active)return;var pt=e.touches&&e.touches[0]?e.touches[0]:e;var dx=pt.clientX-sx,dy=pt.clientY-sy;if(dir===null){if(Math.abs(dx)<8&&Math.abs(dy)<8)return;dir=Math.abs(dx)>Math.abs(dy)?'h':'v';if(dir==='v'){active=false;return;}if(!histDone){pushPlanHistory();histDone=true;}if(startIdx>=0){var pc=currentPlanColor();if(paintErase)delete planCells[startIdx];else planCells[startIdx]=pc;paintQuickState(grid,startIdx,!paintErase,pc);}}if(dir==='h'){e.preventDefault();var idx=cellIdxFromEvent(grid,e);if(idx>=0){var pc2=currentPlanColor();if(paintErase)delete planCells[idx];else planCells[idx]=pc2;paintQuickState(grid,idx,!paintErase,pc2);}}}function end(e){if(!planMode){active=false;return;}if(active&&dir==='h'){svPlan();renderTL();}else if(active&&dir===null&&startIdx>=0){if(!histDone)pushPlanHistory();var nowFill=!planCells[startIdx];var pc3=currentPlanColor();if(nowFill)planCells[startIdx]=pc3;else delete planCells[startIdx];paintQuickState(grid,startIdx,nowFill,pc3);svPlan();updatePlanStat();}active=false;dir=null;startIdx=-1;}grid.addEventListener('mousedown',start);grid.addEventListener('mousemove',move);window.addEventListener('mouseup',end);grid.addEventListener('touchstart',start,{passive:true});grid.addEventListener('touchmove',move,{passive:false});window.addEventListener('touchend',end);window.addEventListener('touchcancel',end);}
function planTargetMins(){return Object.keys(planCells).length*COL_MINS;}
function updatePlanStat(){var tgt=planTargetMins(),th=Math.floor(tgt/60),tm=tgt%60;var te=document.getElementById('planTarget');if(te)te.textContent=th+'h '+String(tm).padStart(2,'0')+'m';var actSec=getTSecs(),ah=Math.floor(actSec/3600),am=Math.floor((actSec%3600)/60);var ae=document.getElementById('planActual');if(ae)ae.textContent=ah+'h '+String(am).padStart(2,'0')+'m';var pct=tgt>0?Math.round(actSec/60/tgt*100):0;var pe=document.getElementById('planPct');if(pe)pe.textContent=pct+'%';}
function renderTL(){var grid=document.getElementById('pGrid');if(!grid)return;var gr=grid.getBoundingClientRect();var wrap=document.getElementById('pScroll');var gridW=gr.width||grid.clientWidth||grid.offsetWidth||(wrap?wrap.clientWidth:220);if(gridW<20)gridW=220;window._planGridW=gridW;var colW=Math.floor((gridW-AXIS_W)/NCOLS);if(colW<4)colW=4;var totalH=24*ROW_H;grid.style.height=totalH+'px';grid.innerHTML='';for(var i=0;i<24;i++){var rowY=i*ROW_H;var hline=document.createElement('div');hline.style.cssText='position:absolute;left:'+AXIS_W+'px;right:0;top:'+rowY+'px;height:1px;background:#2c2c2c;z-index:1;pointer-events:none;';grid.appendChild(hline);var lbl=document.createElement('div');lbl.style.cssText='position:absolute;left:0;width:'+AXIS_W+'px;top:'+(rowY+1)+'px;height:10px;display:flex;align-items:center;justify-content:center;font-family:monospace;font-size:.58rem;font-weight:600;color:rgba(255,255,255,.5);z-index:3;pointer-events:none;';lbl.textContent=rowToHour(i);grid.appendChild(lbl);}var bot=document.createElement('div');bot.style.cssText='position:absolute;left:'+AXIS_W+'px;right:0;top:'+(24*ROW_H)+'px;height:1px;background:#2c2c2c;';grid.appendChild(bot);for(var c2=0;c2<=NCOLS;c2++){var vl=document.createElement('div');vl.style.cssText='position:absolute;top:0;bottom:0;left:'+(AXIS_W+c2*colW)+'px;width:1px;background:#2c2c2c;z-index:1;pointer-events:none;';grid.appendChild(vl);}
  (function drawNowLine(){var now=new Date();var h=now.getHours(),min=now.getMinutes(),sec=now.getSeconds();var xPx=AXIS_W+(min+sec/60)/60*(gridW-AXIS_W);var row=hourToRow(h);var yPx=row*ROW_H;var line=document.createElement('div');line.style.cssText='position:absolute;top:'+yPx+'px;height:'+ROW_H+'px;left:'+xPx+'px;width:2px;background:#ef4444;z-index:10;pointer-events:none;';var dot=document.createElement('div');dot.style.cssText='position:absolute;top:'+(yPx+ROW_H/2-4)+'px;left:'+(xPx-4)+'px;width:8px;height:8px;border-radius:50%;background:#ef4444;z-index:11;pointer-events:none;';grid.appendChild(line);grid.appendChild(dot);})();var tSess=sess.filter(function(s){return studyDayOf(new Date(s.start))===today();});function drawCont(startMs,endMs,color){var st=new Date(startMs),en=new Date(endMs);var stMin=st.getHours()*60+st.getMinutes()+st.getSeconds()/60;var enMin=en.getHours()*60+en.getMinutes()+en.getSeconds()/60;if(enMin<=stMin)return;for(var h=Math.floor(stMin/60);h<=Math.min(23,Math.floor(enMin/60));h++){var rowMin=h*60;var segS=Math.max(stMin,rowMin),segE=Math.min(enMin,rowMin+60);if(segE<=segS)continue;var x1=Math.round((segS-rowMin)*(gridW-AXIS_W)/60),x2=Math.round((segE-rowMin)*(gridW-AXIS_W)/60);var blk=document.createElement('div');blk.style.cssText='position:absolute;top:'+(hourToRow(h)*ROW_H+1)+'px;height:'+(ROW_H-2)+'px;left:'+(AXIS_W+x1)+'px;width:'+Math.max(1,x2-x1)+'px;background:'+color+';z-index:2;';grid.appendChild(blk);}}var cellW2=(gridW-AXIS_W)/NCOLS;for(var h2=0;h2<24;h2++){var dRow=hourToRow(h2);for(var c3=0;c3<NCOLS;c3++){var idx=h2*NCOLS+c3;var cv=planCells[idx];var filled=!!cv;if(!filled&&!planMode)continue;var cell=document.createElement('div');var baseStyle='position:absolute;top:'+(dRow*ROW_H+1)+'px;height:'+(ROW_H-2)+'px;left:'+(AXIS_W+c3*cellW2)+'px;width:'+cellW2+'px;box-sizing:border-box;';if(filled){var col=cellColor(cv);cell.style.cssText=baseStyle+'background:'+hexToRGBA(col,.30)+';border:1px solid '+hexToRGBA(col,.6)+';'}else{cell.style.cssText=baseStyle+'background:transparent;border:1px dashed rgba(255,255,255,.12);'}if(planMode){cell.style.cursor='pointer';cell.style.zIndex='6';cell.setAttribute('data-cell',idx);cell.className='plan-cell';}else{cell.style.zIndex=filled?'1':'4';cell.style.pointerEvents='none';}grid.appendChild(cell);}}tSess.forEach(function(s){drawCont(s.start,s.end||Date.now(),s.color);});if(aId&&aStart){var ac=(subjs.find(function(x){return x.id===aId;})||{}).color||'#a78bfa';drawCont(aStart,Date.now(),ac);}bindPlanDrag(grid);updatePlanStat();}
function scrollNow(){var sc=document.getElementById('pScroll');if(!sc)return;var now=new Date();sc.scrollTop=Math.max(0,(hourToRow(now.getHours())+now.getMinutes()/60)*ROW_H-160);}

// TODO 패널 (플래너 - 과목별)
function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function renderTodoPanel(){
  var panel=document.getElementById('todoPanel');if(!panel)return;
  if(!todoOpenSubjId){
    panel.classList.remove('show');
    setTimeout(function(){if(!todoOpenSubjId)panel.innerHTML='';},300);
    return;
  }
  var sub=subjs.find(function(s){return s.id===todoOpenSubjId;});
  if(!sub){todoOpenSubjId=null;panel.classList.remove('show');setTimeout(function(){if(!todoOpenSubjId)panel.innerHTML='';},300);return;}
  var list=getTodoList(today(),todoOpenSubjId);
  var html='<div class="todo-hd" style="color:'+sub.color+'">'+sub.name+' TODO</div>';
  html+='<div class="todo-add"><input class="todo-input" id="todoNewInput" placeholder="할 일 추가" onkeydown="if(event.key===\'Enter\')addTodo()"><button class="todo-add-btn" onclick="addTodo()">+</button></div>';
  html+='<div class="todo-list">';
  if(!list.length){html+='<div style="font-size:.72rem;color:rgba(255,255,255,.3);text-align:center;padding:14px 0">할 일이 없습니다</div>';}
  list.forEach(function(t,i){html+='<div class="todo-item'+(t.done?' done':'')+'"><div class="todo-circle'+(t.done?' done':'')+'" onclick="toggleTodo('+i+')">'+(t.done?'✓':'')+'</div><div class="todo-text" id="todoText_'+i+'" ondblclick="startEditTodo('+i+')">'+escapeHtml(t.text)+'</div><button class="todo-del" onclick="delTodo('+i+')">✕</button></div>';});
  html+='</div>';
  panel.innerHTML=html;
  panel.classList.add('show');
  _bindTodoSwipeClose(panel);
}
// 오른쪽으로 밀면(스와이프) todo 패널 닫기 — 속도 기반 판정 + rAF 적용
function _bindTodoSwipeClose(panel){
  if(panel._swipeBound)return;
  panel._swipeBound=true;
  var startX=0,startY=0,lastX=0,lastT=0,dx=0,vx=0,dragging=false,deciding=true,isHorizontal=false,rafId=null;
  function pt(e){return e.touches&&e.touches[0]?e.touches[0]:e;}
  function setTransform(x){
    if(rafId)return;
    rafId=requestAnimationFrame(function(){panel.style.transform='translateX('+x+'px)';rafId=null;});
  }
  function onMove(e){
    if(!dragging)return;
    var p=pt(e),now=performance.now();
    var ddx=p.clientX-startX,ddy=p.clientY-startY;
    if(deciding){
      if(Math.abs(ddx)<4&&Math.abs(ddy)<4)return;
      isHorizontal=ddx>0&&Math.abs(ddx)>Math.abs(ddy)*1.3;
      deciding=false;
      if(!isHorizontal){onEnd();return;}
      panel.classList.add('dragging');
    }
    if(!isHorizontal)return;
    if(e.cancelable)e.preventDefault();
    var w=panel.offsetWidth||1;
    dx=Math.max(0,Math.min(w,ddx));
    var dt=now-lastT;
    if(dt>0)vx=(p.clientX-lastX)/dt;
    lastX=p.clientX;lastT=now;
    setTransform(dx);
  }
  function onEnd(){
    if(!dragging)return;
    dragging=false;
    panel.classList.remove('dragging');
    document.removeEventListener('touchmove',onMove);
    document.removeEventListener('touchend',onEnd);
    document.removeEventListener('mousemove',onMove);
    document.removeEventListener('mouseup',onEnd);
    if(rafId){cancelAnimationFrame(rafId);rafId=null;}
    var w=panel.offsetWidth||1;
    var shouldClose=isHorizontal&&(dx>w*0.3||vx>0.6);
    panel.style.transform='';
    if(shouldClose){todoOpenSubjId=null;renderTodoPanel();}
  }
  function onStart(e){
    var p=pt(e);
    startX=lastX=p.clientX;startY=p.clientY;lastT=performance.now();
    dx=0;vx=0;dragging=true;deciding=true;isHorizontal=false;
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('touchend',onEnd);
    document.addEventListener('mousemove',onMove);
    document.addEventListener('mouseup',onEnd);
  }
  panel.addEventListener('touchstart',onStart,{passive:true});
  panel.addEventListener('mousedown',onStart);
}
function startEditTodo(i){
  var el=document.getElementById('todoText_'+i);if(!el)return;
  var list=getTodoList(today(),todoOpenSubjId);var t=list[i];if(!t)return;
  var inp=document.createElement('input');
  inp.value=t.text;inp.className='todo-input';inp.style.cssText='flex:1;font-size:.8rem;padding:2px 4px;border-radius:6px;border:1px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff;';
  function save(){var v=inp.value.trim();if(v&&v!==t.text){t.text=v;svTodos();pushPlanToFirebase();}renderTodoPanel();}
  inp.onblur=save;inp.onkeydown=function(e){if(e.key==='Enter'||e.key==='Escape')inp.blur();e.stopPropagation();};
  el.parentNode.replaceChild(inp,el);inp.focus();inp.select();
}
function addTodo(){var inp=document.getElementById('todoNewInput');var v=(inp&&inp.value||'').trim();if(!v||!todoOpenSubjId)return;var dk=today();if(!todos[dk])todos[dk]={};if(!todos[dk][todoOpenSubjId])todos[dk][todoOpenSubjId]=[];todos[dk][todoOpenSubjId].push({text:v,done:false});svTodos();renderTodoPanel();saveUserDataToFirebase();_syncTTIfOpen(todoOpenSubjId);}
function toggleTodo(idx){var dk=today();if(!todoOpenSubjId||!todos[dk]||!todos[dk][todoOpenSubjId]||!todos[dk][todoOpenSubjId][idx])return;todos[dk][todoOpenSubjId][idx].done=!todos[dk][todoOpenSubjId][idx].done;svTodos();renderTodoPanel();saveUserDataToFirebase();_syncTTIfOpen(todoOpenSubjId);}
function delTodo(idx){var dk=today();if(!todoOpenSubjId||!todos[dk]||!todos[dk][todoOpenSubjId])return;todos[dk][todoOpenSubjId].splice(idx,1);svTodos();renderTodoPanel();saveUserDataToFirebase();_syncTTIfOpen(todoOpenSubjId);}

// 과목 드래그 순서변경
var _scDrag={active:false,idx:-1,el:null};
function _bindScDrag(hdl,idx){var _lp=null;function start(e){_scDrag.active=true;_scDrag.idx=idx;var list=document.getElementById('scList');if(list)list.querySelectorAll('[data-sc-idx]').forEach(function(r){if(parseInt(r.getAttribute('data-sc-idx'))===idx){r.style.opacity='0.45';r.style.background='rgba(79,70,229,.07)';r.style.borderRadius='10px';_scDrag.el=r;}});if(navigator.vibrate)navigator.vibrate(40);document.addEventListener('touchmove',_onScDragMove,{passive:false});document.addEventListener('touchend',_onScDragEnd);document.addEventListener('mousemove',_onScDragMove);document.addEventListener('mouseup',_onScDragEnd);}hdl.addEventListener('touchstart',function(e){_lp=setTimeout(function(){start(e);},350);},{passive:true});hdl.addEventListener('touchend',function(){clearTimeout(_lp);});hdl.addEventListener('touchcancel',function(){clearTimeout(_lp);});hdl.addEventListener('mousedown',function(e){e.preventDefault();_lp=setTimeout(function(){start(e);},350);});hdl.addEventListener('mouseup',function(){clearTimeout(_lp);});}
function _getScRowAtY(y){var list=document.getElementById('scList');if(!list)return-1;var rows=list.querySelectorAll('[data-sc-idx]');for(var i=0;i<rows.length;i++){var r=rows[i],rect=r.getBoundingClientRect();if(y>=rect.top&&y<=rect.bottom)return parseInt(r.getAttribute('data-sc-idx'));}return-1;}
function _onScDragMove(e){if(!_scDrag.active)return;e.preventDefault();var pt=e.touches?e.touches[0]:e;var overIdx=_getScRowAtY(pt.clientY);if(overIdx>=0&&overIdx!==_scDrag.idx){var tmp=subjs[_scDrag.idx];subjs[_scDrag.idx]=subjs[overIdx];subjs[overIdx]=tmp;_scDrag.idx=overIdx;sv();renderScList();renderSL();renderHomeSubjGrid();renderTL();var list=document.getElementById('scList');if(list)list.querySelectorAll('[data-sc-idx]').forEach(function(r){if(parseInt(r.getAttribute('data-sc-idx'))===_scDrag.idx){r.style.opacity='0.45';r.style.background='rgba(79,70,229,.07)';r.style.borderRadius='10px';_scDrag.el=r;}});}}
function _onScDragEnd(){if(_scDrag.el){_scDrag.el.style.opacity='';_scDrag.el.style.background='';_scDrag.el.style.borderRadius='';}  _scDrag.active=false;_scDrag.idx=-1;_scDrag.el=null;document.removeEventListener('touchmove',_onScDragMove);document.removeEventListener('touchend',_onScDragEnd);document.removeEventListener('mousemove',_onScDragMove);document.removeEventListener('mouseup',_onScDragEnd);}

// 과목 추가
function openAddSM(){var cg=document.getElementById('colGrid');if(!cg)return;cg.innerHTML='';cg.style.cssText='display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-bottom:4px;';pickedC=COLORS[0];var old=document.getElementById('_freePickWrap');if(old)old.remove();COLORS.forEach(function(c,i){var d=document.createElement('div');d.style.cssText='aspect-ratio:1;border-radius:50%;background:'+c+';cursor:pointer;border:2.5px solid '+(i===0?'var(--ink)':'transparent')+';transition:.1s;';d.onclick=(function(col,el){return function(){cg.querySelectorAll('div').forEach(function(x){x.style.borderColor='transparent';});el.style.borderColor='var(--ink)';pickedC=col;var fp=document.getElementById('_freePick');if(fp)fp.value=col;};})(c,d);cg.appendChild(d);});var fw=document.createElement('div');fw.id='_freePickWrap';fw.style.cssText='display:flex;align-items:center;gap:9px;margin-top:10px;margin-bottom:10px;';var fl=document.createElement('span');fl.style.cssText='font-size:.72rem;color:var(--ink2);flex-shrink:0;font-weight:600;';fl.textContent='직접 선택';var fp=document.createElement('input');fp.type='color';fp.id='_freePick';fp.value=COLORS[0];fp.style.cssText='width:38px;height:38px;border:none;border-radius:12px;cursor:pointer;padding:2px;background:none;flex-shrink:0;';fp.oninput=function(){pickedC=fp.value;cg.querySelectorAll('div').forEach(function(x){x.style.borderColor='transparent';});};var fh=document.createElement('span');fh.style.cssText='font-size:.66rem;color:var(--ink3);';fh.textContent='원하는 색 직접 선택';fw.appendChild(fl);fw.appendChild(fp);fw.appendChild(fh);cg.parentNode.insertBefore(fw,cg.nextSibling);var ni=document.getElementById('nSubjN');if(ni)ni.value='';openModal('addSM');}
function addSubj(){var n=(document.getElementById('nSubjN')||{}).value;if(n)n=n.trim();if(!n){toast('과목 이름을 입력해주세요');return;}subjs.push({id:'s'+Date.now(),name:n,color:pickedC});sv();closeModal('addSM');renderScList();renderSL();renderHomeSubjGrid();renderTL();toast(n+' 추가됨!');}
function renderScList(){var l=document.getElementById('scList');if(!l)return;l.innerHTML='';subjs.forEach(function(s,i){var row=document.createElement('div');row.setAttribute('data-sc-idx',i);row.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 0;border-bottom:1px solid var(--line);transition:background .12s,opacity .12s;';var hdl=document.createElement('div');hdl.title='꾹 누르고 드래그하면 순서 변경';hdl.style.cssText='flex-shrink:0;width:18px;display:flex;flex-direction:column;gap:3px;justify-content:center;cursor:grab;padding:4px 2px;touch-action:none;opacity:.4;';hdl.innerHTML='<div style="height:2px;border-radius:1px;background:var(--ink2)"></div><div style="height:2px;border-radius:1px;background:var(--ink2)"></div><div style="height:2px;border-radius:1px;background:var(--ink2)"></div>';var pick=document.createElement('input');pick.type='color';pick.value=s.color;pick.title='색 변경';pick.style.cssText='width:28px;height:28px;border:none;border-radius:50%;cursor:pointer;padding:0;background:none;flex-shrink:0;';(function(sid){pick.oninput=function(){var f=subjs.find(function(x){return x.id===sid;});if(f){f.color=pick.value;sv();renderSL();renderHomeSubjGrid();renderTL();}};})(s.id);var nm=document.createElement('div');nm.style.cssText='flex:1;font-size:.88rem;font-weight:600;color:var(--ink)';nm.textContent=s.name;var del=document.createElement('button');del.textContent='삭제';del.style.cssText='background:none;border:1px solid #fecaca;color:#b91c1c;border-radius:8px;padding:4px 10px;font-size:.72rem;cursor:pointer;font-family:inherit;flex-shrink:0;';(function(sid,snm){del.onclick=function(){if(!confirm('"'+snm+'" 과목을 삭제할까요?\n공부 기록은 유지됩니다.'))return;subjs=subjs.filter(function(x){return x.id!==sid;});sv();renderScList();renderSL();renderHomeSubjGrid();renderTL();toast(snm+' 삭제됨');};})(s.id,s.name);row.appendChild(hdl);row.appendChild(pick);row.appendChild(nm);row.appendChild(del);l.appendChild(row);_bindScDrag(hdl,i);});var addWrap=document.createElement('div');addWrap.style.cssText='padding:10px 0';var addBtn=document.createElement('button');addBtn.textContent='+ 과목 추가';addBtn.style.cssText='background:none;border:1.5px dashed var(--line);color:var(--ink2);border-radius:10px;padding:9px 16px;font-size:.82rem;cursor:pointer;font-family:inherit;width:100%';addBtn.onclick=function(){openAddSM();};addWrap.appendChild(addBtn);l.appendChild(addWrap);}

// STREAK & HM
function buildStreak(){var sg=document.getElementById('streakGrid');if(!sg)return;sg.innerHTML='';var now=new Date(),strk=0;for(var i=13;i>=0;i--){var d=new Date(now);d.setDate(d.getDate()-i);var sc=getSecsDate(d.getFullYear(),d.getMonth(),d.getDate());var isT=i===0,done=sc>0;if(done||(isT&&aId))strk++;else if(i>0)strk=0;var el=document.createElement('div');el.className='sd'+(isT?' today':done?' done':'');el.textContent=['일','월','화','수','목','금','토'][d.getDay()];sg.appendChild(el);}var sn=document.getElementById('strkNum');if(sn)sn.textContent=strk+'일';var ss=document.getElementById('stStrk');if(ss)ss.textContent=strk+'일';}
function buildHm(id){var el=document.getElementById(id);if(!el)return;el.innerHTML='';var now=new Date(),yr=now.getFullYear(),mo=now.getMonth();var firstDay=new Date(yr,mo,1).getDay(),dim=new Date(yr,mo+1,0).getDate();['일','월','화','수','목','금','토'].forEach(function(d,i){var h=document.createElement('div');h.style.cssText='text-align:center;font-size:.45rem;color:'+(i===0?'var(--red)':i===6?'#2563eb':'var(--ink3)')+';font-weight:700;padding-bottom:2px;';h.textContent=d;el.appendChild(h);});for(var i=0;i<firstDay;i++){var empty=document.createElement('div');empty.className='hmc';empty.style.background='transparent';el.appendChild(empty);}for(var d=1;d<=dim;d++){var sc=getSecsDate(yr,mo,d),hrs=sc/3600,lv=0;if(sc>0){if(hrs>=6)lv=4;else if(hrs>=4)lv=3;else if(hrs>=2)lv=2;else lv=1;}var c=document.createElement('div');c.className='hmc'+(lv>0?' lv'+lv:'');c.style.cssText+='font-size:.5rem;font-weight:700;color:'+(lv>0?'rgba(255,255,255,.9)':'var(--ink3)')+';display:flex;align-items:center;justify-content:center;';c.textContent=String(d);if(d===now.getDate())c.style.outline='1.5px solid var(--acc)';el.appendChild(c);}}

// CALENDAR
function calNav(dir){calM+=dir;if(calM<0){calM=11;calY--;}if(calM>11){calM=0;calY++;}renderCal();}
function openCalPicker(){_pickY=calY;renderCalPicker();openModal('calPickM');}
function calPickYear(dir){_pickY+=dir;renderCalPicker();}
function renderCalPicker(){var lbl=document.getElementById('calPickYearLbl');if(lbl)lbl.textContent=_pickY+'년';var grid=document.getElementById('calPickMonths');if(!grid)return;var mn=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];grid.innerHTML='';mn.forEach(function(m,i){var btn=document.createElement('button');btn.style.cssText='padding:10px 4px;border-radius:9px;border:1.5px solid var(--line);background:'+(calY===_pickY&&calM===i?'var(--acc)':'var(--bg)')+';color:'+(calY===_pickY&&calM===i?'#fff':'var(--ink)')+';font-size:.82rem;font-weight:700;cursor:pointer;';btn.textContent=m;(function(yr,mo){btn.onclick=function(){calY=yr;calM=mo;renderCal();closeModal('calPickM');};}(_pickY,i));grid.appendChild(btn);});}
function renderCal(){var grid=document.getElementById('calGrid'),title=document.getElementById('calTitle');if(!grid||!title)return;var mn=['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];title.textContent=calY+'년 '+mn[calM];var now=new Date(),fd=new Date(calY,calM,1).getDay(),dim=new Date(calY,calM+1,0).getDate();grid.innerHTML='';for(var i=0;i<fd;i++){var c=document.createElement('div');c.className='cal-c empty';grid.appendChild(c);}for(var d=1;d<=dim;d++){var sc=getSecsDate(calY,calM,d),hrs=sc/3600,isT=calY===now.getFullYear()&&calM===now.getMonth()&&d===now.getDate(),isF=new Date(calY,calM,d)>now&&!isT;var lv='lv0';if(!isF&&sc>0){if(hrs>=7)lv='lv4';else if(hrs>=5)lv='lv3';else if(hrs>=3)lv='lv2';else lv='lv1';}if(isF)lv='future';var c2=document.createElement('div');c2.className='cal-c '+lv+(isT?' today':'');var hd=Math.floor(hrs),md=Math.floor((hrs%1)*60);c2.innerHTML='<div class="cal-d">'+d+'</div>'+(!isF&&sc>0?'<div class="cal-h">'+hd+'h'+(md>0?String(md).padStart(2,'0')+'m':'')+'</div>':'');(function(cy,cm,cd){c2.onclick=function(){openDayDetail(cy,cm,cd);};})(calY,calM,d);grid.appendChild(c2);}}
function updateStats(){var t=getTSecs(),h=Math.floor(t/3600),m=Math.floor((t%3600)/60);var el=document.getElementById('stTotal');if(el)el.textContent=h+'h'+(m>0?' '+m+'m':'');var el3=document.getElementById('stAvg');if(el3){var now2=new Date(),yr2=now2.getFullYear(),mo2=now2.getMonth(),dim2=new Date(yr2,mo2+1,0).getDate(),daysPassed=now2.getDate();var moTotal=0;for(var _d=1;_d<=daysPassed;_d++)moTotal+=getSecsDate(yr2,mo2,_d);var moAvg=daysPassed>0?moTotal/daysPassed:0;el3.textContent=(Math.floor(moAvg/3600*10)/10)+'h';}buildHm('hmHome');buildStreak();updateStreakBanner();renderAgeCompare();pushAgeData();loadDailyEval();}

// ROOM
// ROOM (그룹)
var myRooms=JSON.parse(localStorage.getItem('sg_myrooms')||'[]'); // [{code,name,maxMembers,ownerCode,ownerName,memberCount,attendPct}]
var currentRoom=null;
var _roomFeedListener=null;
function svMyRooms(){localStorage.setItem('sg_myrooms',JSON.stringify(myRooms));}
function onRoomJoinInput(el){el.value=(el.value||'').toUpperCase();var btn=document.getElementById('roomJoinBtn');if(btn){if(el.value.length===6){btn.disabled=false;btn.style.opacity='1';}else{btn.disabled=true;btn.style.opacity='.4';}}}
function openCreateRoomM(){
  var created=(myRooms||[]).filter(function(r){return r.ownerCode===getMyCode();}).length;
  if(created>=2){toast('방은 최대 2개까지 만들 수 있어요');return;}
  var n=document.getElementById('newRoomName');if(n)n.value='';
  var m=document.getElementById('newRoomMax');if(m)m.value='';
  var box=document.getElementById('newRoomCodeBox');if(box)box.style.display='none';
  var cb=document.getElementById('createRoomBtn');if(cb){cb.disabled=true;cb.style.opacity='.4';}
  window._newRoomCode=null;
  openModal('createRoomM');
}
function generateRoomCode(){
  var code=Math.random().toString(36).substring(2,8).toUpperCase();
  window._newRoomCode=code;
  var box=document.getElementById('newRoomCodeBox');if(box)box.style.display='block';
  var val=document.getElementById('newRoomCodeVal');if(val)val.textContent=code;
  var cb=document.getElementById('createRoomBtn');if(cb){cb.disabled=false;cb.style.opacity='1';}
  if(window._fbReady){window._fbGet('rooms/'+code).then(function(d){if(d){generateRoomCode();}}).catch(function(){});}
}
function createRoom(){
  var name=((document.getElementById('newRoomName')||{}).value||'').trim();
  var max=parseInt((document.getElementById('newRoomMax')||{}).value);
  var code=window._newRoomCode;
  if(!name){toast('방 이름을 입력하세요');return;}
  if(!max||max<2||max>8){toast('최대 인원은 2~8명으로 입력하세요');return;}
  if(!code){toast('코드를 먼저 생성하세요');return;}
  var myCode=getMyCode(),myName=prof.name||'나';
  var roomData={name:name,maxMembers:max,ownerCode:myCode,ownerName:myName,createdAt:Date.now(),members:{}};
  roomData.members[myCode]={name:myName,joinedAt:Date.now()};
  if(window._fbReady)window._fbSet('rooms/'+code,roomData);
  myRooms.push({code:code,name:name,maxMembers:max,ownerCode:myCode,ownerName:myName,memberCount:1,attendPct:0});
  svMyRooms();closeModal('createRoomM');renderRoomList();toast('✅ 그룹이 생성되었습니다');
}
function joinRoom(){
  var inp=document.getElementById('roomJoinCode');
  var code=((inp||{}).value||'').toUpperCase();
  if(code.length!==6)return;
  if(myRooms.find(function(r){return r.code===code;})){toast('이미 참여 중인 그룹입니다');openRoom(code);return;}
  if(!window._fbReady){toast('연결 후 다시 시도해주세요');return;}
  window._fbGet('rooms/'+code).then(function(d){
    if(!d){toast('존재하지 않는 코드입니다');return;}
    var members=d.members||{};var codes=Object.keys(members);
    if(codes.indexOf(myCode)<0&&codes.length>=(d.maxMembers||8)){toast('그룹 인원이 가득 찼습니다 (최대 '+(d.maxMembers||8)+'명)');return;}
    var myCode=getMyCode(),myName=prof.name||'나';
    window._fbSet('rooms/'+code+'/members/'+myCode,{name:myName,joinedAt:Date.now()});
    myRooms.push({code:code,name:d.name,maxMembers:d.maxMembers,ownerCode:d.ownerCode,ownerName:d.ownerName,memberCount:codes.length+1,attendPct:0});
    svMyRooms();if(inp)inp.value='';onRoomJoinInput(inp||{value:''});renderRoomList();toast('✅ 그룹에 입장했습니다');
  }).catch(function(){toast('연결 오류');});
}
function renderRoomList(){
  var el=document.getElementById('myRoomList');if(!el)return;
  if(!myRooms.length){el.innerHTML='<div style="font-size:.78rem;color:var(--ink3);text-align:center;padding:18px 0">참여한 그룹이 없습니다</div>';return;}
  el.innerHTML='';
  myRooms.forEach(function(r){
    var card=document.createElement('div');card.className='card';card.style.marginBottom='10px';card.style.cursor='pointer';
    card.onclick=function(){openRoom(r.code);};
    card.innerHTML='<div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div style="font-weight:800;font-size:.9rem">'+escapeHtml(r.name||'')+'</div><div style="font-size:.72rem;color:var(--ink2);margin-top:3px">'+escapeHtml(r.ownerName||'')+'</div><div style="font-size:.72rem;color:var(--ink3);margin-top:1px" id="roomcnt-'+r.code+'">'+(r.memberCount||1)+'/'+(r.maxMembers||0)+'명</div></div><div style="font-size:.72rem;font-weight:700;color:var(--green)" id="roomattend-'+r.code+'">출석률 '+(r.attendPct!=null?r.attendPct:0)+'%</div></div>';
    el.appendChild(card);
  });
  myRooms.forEach(refreshRoomCard);
}
function refreshRoomCard(r){
  if(!window._fbReady)return;
  window._fbGet('rooms/'+r.code).then(function(d){
    if(!d)return;
    var members=d.members||{};var codes=Object.keys(members);
    r.memberCount=codes.length||1;r.ownerName=d.ownerName||r.ownerName;r.name=d.name||r.name;r.maxMembers=d.maxMembers||r.maxMembers;
    var cntEl=document.getElementById('roomcnt-'+r.code);if(cntEl)cntEl.textContent=r.memberCount+'/'+(r.maxMembers||0)+'명';
    svMyRooms();
    var proms=codes.map(function(c){return window._fbGet('users/'+c).then(function(u){return!!(u&&u.todayStudy&&u.todayStudy.secs>=7200);}).catch(function(){return false;});});
    Promise.all(proms).then(function(results){
      var present=results.filter(Boolean).length;
      r.attendPct=codes.length?Math.round(present/codes.length*100):0;
      var aEl=document.getElementById('roomattend-'+r.code);if(aEl)aEl.textContent='출석률 '+r.attendPct+'%';
      svMyRooms();
    });
  }).catch(function(){});
}
function openRoom(code){
  currentRoom=myRooms.find(function(r){return r.code===code;});
  if(!currentRoom)return;
  var t=document.getElementById('rvTitle');if(t)t.textContent=currentRoom.name;
  var c=document.getElementById('rvCode');if(c){c.style.display=cfg.grpHideCode===true?'none':'block';c.textContent='코드: '+code;}
  var pg=document.getElementById('pg-roomview');if(pg)pg.style.display='flex';
  var nv=document.querySelector('nav');if(nv)nv.style.display='none';
  currentRoom._feedData={};
  renderRoomFeed();subscribeRoomFeed(code);renderRoomTodoPreview();
}
function closeRoomView(){
  var pg=document.getElementById('pg-roomview');if(pg)pg.style.display='none';
  var nv=document.querySelector('nav');if(nv)nv.style.display='flex';
  if(_roomFeedListener){try{_roomFeedListener();}catch(e){}_roomFeedListener=null;}
  currentRoom=null;renderRoomList();
}
function subscribeRoomFeed(code){
  if(_roomFeedListener){try{_roomFeedListener();}catch(e){}_roomFeedListener=null;}
  if(!window._fbReady)return;
  _roomFeedListener=window._fbListen('rooms/'+code+'/feed',function(data){if(currentRoom){currentRoom._feedData=data||{};renderRoomFeed();}});
}
function renderRoomFeed(){
  var el=document.getElementById('rvFeed');if(!el||!currentRoom)return;
  var data=currentRoom._feedData||{};
  var items=Object.keys(data).map(function(k){return data[k];});
  items.sort(function(a,b){return(a.ts||0)-(b.ts||0);});
  if(!items.length){el.innerHTML='<div style="font-size:.78rem;color:var(--ink3);text-align:center;padding:30px 0">아직 공유된 기록이 없습니다</div>';return;}
  el.innerHTML='';
  items.forEach(function(it){
    var card=document.createElement('div');card.className='card';card.style.marginBottom='10px';
    var head='<div style="display:flex;align-items:center;gap:7px;margin-bottom:8px"><div style="width:26px;height:26px;border-radius:50%;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700">'+((it.name||'?')[0])+'</div><div style="font-size:.8rem;font-weight:700">'+(it.name||'')+'</div><div style="margin-left:auto;font-size:.66rem;color:var(--ink3)">'+timeAgo(it.ts)+'</div></div>';
    card.innerHTML=head;
    if(it.type==='photo'){
      var im=document.createElement('img');im.src=it.img;im.style.cssText='width:100%;border-radius:10px;display:block;cursor:pointer';
      im.onclick=function(){var pv=document.getElementById('photoViewImg');if(pv)pv.src=it.img;openModal('photoViewM');};
      card.appendChild(im);
    }else{
      var box=document.createElement('div');box.style.cssText='background:#111;border-radius:10px;padding:12px;color:#fff';
      var bars='';(it.segs||[]).forEach(function(g){var left=g.s/1440*100,w=Math.max(0.5,(g.e-g.s)/1440*100);bars+='<div style="position:absolute;top:0;bottom:0;left:'+left+'%;width:'+w+'%;background:'+(g.c||'#a78bfa')+';border-radius:2px"></div>';});
      var boxHtml='<div style="font-size:.7rem;color:rgba(255,255,255,.5);margin-bottom:6px">오늘 순공 '+(it.total||'')+'</div><div style="position:relative;height:22px;background:#222;border-radius:4px;overflow:hidden">'+bars+'</div>';
      if(it.todoSummary&&it.todoSummary.length){
        boxHtml+='<div style="margin-top:10px">';
        it.todoSummary.forEach(function(g){
          boxHtml+='<div style="display:flex;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.08)"><div style="width:8px;height:8px;border-radius:50%;background:'+g.color+';flex-shrink:0;margin-top:4px"></div><div style="flex:1;min-width:0"><div style="font-size:.72rem;font-weight:700;color:#fff;margin-bottom:3px">'+escapeHtml(g.name)+'</div>';
          (g.items||[]).forEach(function(t){boxHtml+='<div style="display:flex;justify-content:space-between;gap:6px;font-size:.7rem;padding:1px 0"><span style="color:'+(t.done?'rgba(255,255,255,.35)':'rgba(255,255,255,.8)')+';text-decoration:'+(t.done?'line-through':'none')+'">'+escapeHtml(t.text)+'</span><span style="font-weight:800;flex-shrink:0;color:'+(t.done?'#22c55e':'#ef4444')+'">'+(t.done?'O':'X')+'</span></div>';});
          boxHtml+='</div></div>';
        });
        boxHtml+='</div>';
      }
      box.innerHTML=boxHtml;card.appendChild(box);
    }
    el.appendChild(card);
  });
  el.scrollTop=el.scrollHeight;
}
function renderRoomTodoPreview(){
  var el=document.getElementById('rvTodoPreview');if(!el)return;
  var dateKey=today();
  var totalSec=getTSecs();var h=Math.floor(totalSec/3600),m=Math.floor((totalSec%3600)/60);
  var total=(h>0?h+'h ':'')+String(m).padStart(2,'0')+'m';
  var html='<div style="font-size:.66rem;color:rgba(255,255,255,.5);margin-bottom:5px">오늘 순공 '+total+'</div>';
  if(cfg.grpHideTodo===true){
    html+='<div style="font-size:.64rem;color:rgba(255,255,255,.4)">TODO 비공개</div>';
  }else{
    var any=false;
    subjs.forEach(function(sub){
      var list=getTodoList(dateKey,sub.id);if(!list.length)return;any=true;
      html+='<div style="font-size:.66rem;font-weight:700;color:'+sub.color+';margin-top:4px">'+escapeHtml(sub.name)+'</div>';
      list.forEach(function(t){html+='<div style="display:flex;justify-content:space-between;gap:5px;font-size:.64rem;color:'+(t.done?'rgba(255,255,255,.35)':'rgba(255,255,255,.8)')+';text-decoration:'+(t.done?'line-through':'none')+'"><span>'+escapeHtml(t.text)+'</span><span style="font-weight:800;color:'+(t.done?'#22c55e':'#ef4444')+'">'+(t.done?'O':'X')+'</span></div>';});
    });
    if(!any)html+='<div style="font-size:.64rem;color:rgba(255,255,255,.3)">등록된 TODO 없음</div>';
  }
  el.innerHTML=html;
}
function shareToRoom(){
  if(!currentRoom)return;
  var dateKey=today();
  var daySess=sess.filter(function(s){return studyDayOf(new Date(s.start))===dateKey;});
  var segs=daySess.map(function(s){var st=new Date(s.start),en=new Date(s.end||Date.now());var sMin=st.getHours()*60+st.getMinutes(),eMin=en.getHours()*60+en.getMinutes()+(en.getSeconds()>0||en.getMinutes()===st.getMinutes()?1:0);if(eMin<=sMin)eMin=sMin+1;return{s:sMin,e:Math.min(1440,eMin),c:s.color||'#a78bfa'};});
  var totalSec=getTSecs();var h=Math.floor(totalSec/3600),m=Math.floor((totalSec%3600)/60);
  var total=(h>0?h+'h ':'')+String(m).padStart(2,'0')+'m';
  var todoSummary=[];
  if(cfg.grpHideTodo!==true){subjs.forEach(function(sub){var list=getTodoList(dateKey,sub.id);if(list.length)todoSummary.push({name:sub.name,color:sub.color,items:list});});}
  var item={type:'record',name:prof.name||'나',code:getMyCode(),ts:Date.now(),segs:segs,total:total,todoSummary:todoSummary};
  if(window._fbReady)window._fbSet('rooms/'+currentRoom.code+'/feed/'+Date.now(),item);
  toast('📤 공유했습니다');
}
function rvCapturePhoto(){
  if(!currentRoom)return;
  var inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.capture='environment';
  inp.onchange=function(e){
    var f=e.target.files[0];if(!f)return;
    var r=new FileReader();
    r.onload=function(ev){
      var img=new Image();
      img.onload=function(){
        var cv=document.createElement('canvas');var mx=600,sc=Math.min(1,mx/Math.max(img.width,img.height));
        cv.width=img.width*sc;cv.height=img.height*sc;cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        var item={type:'photo',name:prof.name||'나',code:getMyCode(),ts:Date.now(),img:cv.toDataURL('image/jpeg',0.7)};
        if(window._fbReady)window._fbSet('rooms/'+currentRoom.code+'/feed/'+Date.now(),item);
        toast('📷 사진을 공유했습니다');
      };
      img.src=ev.target.result;
    };
    r.readAsDataURL(f);
  };
  inp.click();
}
function retakePhoto(){closeModal('photoViewM');rvCapturePhoto();}
function openRoomSettings(){var t1=document.getElementById('grpHideTodo');if(t1)t1.checked=cfg.grpHideTodo===true;var t2=document.getElementById('grpHideCode');if(t2)t2.checked=cfg.grpHideCode===true;openModal('roomSettingsM');}
function saveGroupSettings(){var t1=document.getElementById('grpHideTodo'),t2=document.getElementById('grpHideCode');cfg.grpHideTodo=t1?t1.checked:false;cfg.grpHideCode=t2?t2.checked:false;svcfg();renderRoomTodoPreview();if(currentRoom){var c=document.getElementById('rvCode');if(c)c.style.display=cfg.grpHideCode===true?'none':'block';}toast('저장됨');}
function leaveCurrentRoom(){
  if(!currentRoom)return;
  if(!confirm('"'+currentRoom.name+'" 그룹에서 나갈까요?'))return;
  var code=currentRoom.code;
  if(window._fbReady)window._fbSet('rooms/'+code+'/members/'+getMyCode(),null);
  myRooms=myRooms.filter(function(r){return r.code!==code;});
  svMyRooms();closeModal('roomSettingsM');closeRoomView();toast('그룹에서 나갔습니다');
}
function timeAgo(ts){var d=Math.floor((Date.now()-ts)/1000);if(d<60)return'방금';if(d<3600)return Math.floor(d/60)+'분 전';if(d<86400)return Math.floor(d/3600)+'시간 전';return Math.floor(d/86400)+'일 전';}

// ACADEMY
function rTab(id){document.querySelectorAll('#pg-room .rtab').forEach(function(t,i){t.classList.toggle('on',['live','contract','bet','group'][i]===id);});document.querySelectorAll('#pg-room .rpanel').forEach(function(p){p.classList.remove('on');});var rp=document.getElementById('rp-'+id);if(rp)rp.classList.add('on');if(id==='live'){renderMemberCards();frds.forEach(function(f){if(f.shareCode)fetchFriendLatest(f.shareCode);});renderLiveTimeline();}if(id==='contract')renderContractTab();if(id==='bet'){renderBetList();renderBetStats();}if(id==='group')renderRoomList();}
function renderRoom(){var rm=document.getElementById('roomMeta');if(rm)rm.textContent='멤버 '+(1+frds.length)+'명';renderPenPanel();renderMemberCards();renderLiveTimeline();renderContractTab();renderBetStats();}
function renderPenPanel(){var pp=document.getElementById('penPanel');if(!pp)return;pp.innerHTML=ctr.penaltyDesc?'<div style="font-size:.8rem;color:var(--ink2);font-weight:600">⚠ 벌점 '+(ctr.threshold||5)+'점 누적 시 → '+ctr.penaltyDesc+'</div>':'<div style="font-size:.78rem;color:var(--ink3)">계약서를 먼저 작성해주세요</div>';}
function renderMemberCards(){var wrap=document.getElementById('memberCards');if(!wrap)return;var myT=getTSecs(),myH=Math.floor(myT/3600),myM2=Math.floor((myT%3600)/60),myS2=Math.floor(myT%60);var allMembers=[{name:prof.name||'나',school:prof.school||'',grade:prof.grade||'',color:'#4f46e5',isMe:true,studyStr:myH+'h '+String(myM2).padStart(2,'0')+'m '+String(myS2).padStart(2,'0')+'s'}];frds.forEach(function(f){var fSecs=getFriendLiveSecs(f.shareCode);var fd=_friendData[f.shareCode]||{};var isLive=fd.live&&fd.live.active;allMembers.push({name:f.name,school:f.school||'',grade:f.grade||'',color:f.color||'#888',isMe:false,studyStr:fSecs>0?(isLive?'🔴 ':'')+fmtLiveSecs(fSecs):'-'});});wrap.innerHTML='';allMembers.forEach(function(m){var card=document.createElement('div');card.className='card';card.style.marginBottom='10px';var top=document.createElement('div');top.style.cssText='display:flex;align-items:center;gap:10px;margin-bottom:10px';var av=document.createElement('div');av.className='mcav';av.style.cssText='background:'+m.color+';color:#fff;width:38px;height:38px;font-size:.95rem';av.textContent=(m.name||'?')[0];var info=document.createElement('div');info.style.flex='1';var nameRow=document.createElement('div');nameRow.style.cssText='font-weight:800;font-size:.9rem';nameRow.textContent=m.name;if(m.isMe){var meTag=document.createElement('span');meTag.style.cssText='font-size:.65rem;background:#ede9fe;color:#4f46e5;padding:2px 6px;border-radius:10px;margin-left:5px';meTag.textContent='나';nameRow.appendChild(meTag);}var subRow=document.createElement('div');subRow.style.cssText='font-size:.72rem;color:var(--ink2);margin-top:1px';subRow.textContent=[m.school,m.grade].filter(Boolean).join(' · ');info.appendChild(nameRow);info.appendChild(subRow);var timeDiv=document.createElement('div');timeDiv.style.textAlign='right';var timeBig=document.createElement('div');timeBig.style.cssText='font-family:monospace;font-size:.95rem;font-weight:600;color:var(--green)';timeBig.textContent=m.studyStr;timeDiv.appendChild(timeBig);top.appendChild(av);top.appendChild(info);top.appendChild(timeDiv);card.appendChild(top);if(m.isMe){var penBtn=document.createElement('button');penBtn.className='btn btn-ol btn-sm';penBtn.style.width='100%';penBtn.style.fontSize='.72rem';penBtn.textContent='⚠ 벌점 신고';penBtn.onclick=function(){openPenM();};card.appendChild(penBtn);}wrap.appendChild(card);});}

// CONTRACT
function openNewContract(){var now=new Date(),fmt=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};var ns=document.getElementById('nc_s');if(ns)ns.value=ctr.start||fmt(now);var ne=document.getElementById('nc_e');if(ne){var en=new Date(now);en.setMonth(en.getMonth()+3);ne.value=ctr.end||fmt(en);}var ng=document.getElementById('nc_g');if(ng)ng.value=ctr.goal||'';var nt=document.getElementById('nc_th');if(nt)nt.value=ctr.threshold||5;var np=document.getElementById('nc_pd');if(np)np.value=ctr.penaltyDesc||'';ncRules=[...(ctr.rules||[]).map(function(r){return{name:r.name,pts:r.pts};})];renderNCRules();openModal('newCtrM');}
function renderNCRules(){var l=document.getElementById('ncRuleList');if(!l)return;if(!ncRules.length){l.innerHTML='<div style="font-size:.73rem;color:var(--ink3);padding:5px 0 8px">규칙이 없습니다.</div>';return;}l.innerHTML='';ncRules.forEach(function(r,i){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:6px;padding:7px 9px;background:var(--bg);border-radius:7px;margin-bottom:5px;font-size:.78rem';var nm=document.createElement('div');nm.style.flex='1';nm.textContent=r.name;var pts=document.createElement('div');pts.style.cssText='font-family:monospace;font-size:.73rem;color:var(--red);width:30px;flex-shrink:0';pts.textContent='-'+r.pts+'점';var db=document.createElement('button');db.style.cssText='background:none;border:none;color:var(--ink3);cursor:pointer;font-size:.88rem;padding:0';db.textContent='✕';(function(idx){db.onclick=function(){rmCRule(idx);};})(i);row.appendChild(nm);row.appendChild(pts);row.appendChild(db);l.appendChild(row);});}
function addCRule(){var n=(document.getElementById('nc_rn')||{}).value;var p=parseInt((document.getElementById('nc_rp')||{}).value)||1;if(n)n=n.trim();if(!n){toast('내용을 입력해주세요');return;}ncRules.push({name:n,pts:p});var ni=document.getElementById('nc_rn');if(ni)ni.value='';renderNCRules();}
function rmCRule(i){ncRules.splice(i,1);renderNCRules();}
function saveCtr(){if(!ncRules.length){toast('규칙을 1개 이상 추가해주세요');return;}var nd={start:(document.getElementById('nc_s')||{}).value||'',end:(document.getElementById('nc_e')||{}).value||'',goal:(document.getElementById('nc_g')||{}).value||'6시간 30분',rules:ncRules.slice(),threshold:parseInt((document.getElementById('nc_th')||{}).value)||5,penaltyDesc:(document.getElementById('nc_pd')||{}).value||'패널티'};if(ctr.rules&&ctr.rules.length){window._pc=nd;closeModal('newCtrM');openModal('ctrConM');}else{ctr=nd;svc();renderSet();closeModal('newCtrM');toast('✅ 계약서 저장됨!');}}
function confirmCtrUpd(){if(window._pc){ctr=window._pc;svc();renderSet();window._pc=null;}closeModal('ctrConM');toast('✅ 계약서 수정됨');}
function openPenM(){var sel=document.getElementById('penSel');if(!sel)return;sel.innerHTML='<option value="">-- 위반 항목 선택 --</option>';(ctr.rules||[]).forEach(function(r,i){var opt=document.createElement('option');opt.value=i;opt.textContent=r.name+' (-'+r.pts+'점)';sel.appendChild(opt);});if(!(ctr.rules&&ctr.rules.length))sel.innerHTML='<option>계약서에 규칙이 없습니다</option>';var prev=document.getElementById('penPrev');sel.onchange=function(){if(!prev)return;var i=parseInt(sel.value);if(isNaN(i)){prev.style.display='none';return;}var r=ctr.rules[i];prev.style.display='block';prev.innerHTML='<strong>'+r.name+'</strong> → 벌점 <strong>-'+r.pts+'점</strong>';};if(prev)prev.style.display='none';openModal('penM');}
function submitPen(){var sel=document.getElementById('penSel');var i=parseInt((sel||{}).value);if(isNaN(i)){toast('항목을 선택해주세요');return;}toast('벌점 -'+ctr.rules[i].pts+'점: '+ctr.rules[i].name);closeModal('penM');}
function renderContractTab(){var cpset=document.getElementById('cpset'),rulesList=document.getElementById('contractRulesList'),penPanel=document.getElementById('penPanel');if(!ctr.rules||!ctr.rules.length){if(cpset)cpset.innerHTML='<div style="color:var(--ink3);font-size:.82rem">아직 계약서가 없습니다.</div>';if(penPanel)penPanel.innerHTML='<div style="font-size:.78rem;color:var(--ink3)">계약서를 먼저 작성해주세요</div>';return;}if(cpset)cpset.innerHTML='<div style="background:var(--bg);padding:9px;border-radius:9px"><div style="font-size:.65rem;color:var(--ink3)">기간</div><div style="font-size:.82rem;font-weight:700;margin-top:2px">'+(ctr.start||'-')+' ~ '+(ctr.end||'-')+'</div></div>';if(rulesList){rulesList.innerHTML='';ctr.rules.forEach(function(r){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:9px 11px;background:var(--bg);border-radius:9px;margin-bottom:5px';row.innerHTML='<div style="font-size:.83rem;font-weight:700">'+r.name+'</div><span style="font-size:.75rem;font-weight:700;color:var(--red);font-family:monospace">-'+r.pts+'점</span>';rulesList.appendChild(row);});}renderPenPanel();}

// BETS
function openBetModal(){var sel=document.getElementById('betOpp');if(sel){sel.innerHTML='';if(!frds.length){sel.innerHTML='<option>친구를 먼저 추가해주세요</option>';}else{frds.forEach(function(f){var opt=document.createElement('option');opt.value=f.name;opt.textContent=f.name;sel.appendChild(opt);});}}var now=new Date(),fmt=function(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');};var bs=document.getElementById('betS');if(bs&&!bs.value)bs.value=fmt(now);var be=document.getElementById('betE');if(be&&!be.value){var en=new Date(now);en.setDate(en.getDate()+3);be.value=fmt(en);}openModal('betM');}
function renderBetList(){var el=document.getElementById('betList');if(!el)return;if(!bets.length){el.innerHTML='<div style="font-size:.76rem;color:var(--ink3);padding:5px 0">내기 없음</div>';return;}el.innerHTML='';bets.forEach(function(b,i){var card=document.createElement('div');card.style.cssText='background:var(--bg);border-radius:9px;padding:10px;margin-bottom:7px;border:1px solid var(--line)';card.innerHTML='<div style="font-size:.83rem;font-weight:700">vs '+b.opp+' · '+Number(b.amt).toLocaleString()+'P</div>';var btnRow=document.createElement('div');btnRow.style.cssText='display:flex;align-items:center;gap:6px;margin-top:4px';var stSpan=document.createElement('span');stSpan.style.cssText='font-size:.63rem;padding:2px 7px;border-radius:20px;background:'+(b.status==='done'?'var(--line)':b.status==='active'?'var(--gbg)':'var(--ybg)')+';color:'+(b.status==='done'?'var(--ink3)':b.status==='active'?'var(--green)':'#d4820a');stSpan.textContent=b.status==='done'?'✅ 완료':b.status==='active'?'🔴 진행중':'⏳ 대기';btnRow.appendChild(stSpan);if(b.status==='active'){var sb=document.createElement('button');sb.className='btn btn-ac btn-sm';sb.textContent='정산';(function(idx){sb.onclick=function(){settleBet(idx);};})(i);btnRow.appendChild(sb);}card.appendChild(btnRow);el.appendChild(card);});}
function submitBet(){var amt=parseInt((document.getElementById('betAmt')||{}).value)||0;if(amt<10){toast('최소 10P');return;}var crit=(document.getElementById('betCrit')||{}).value||'score';var cmap={score:'시험 점수 합산',grade:'등급 합산',study:'순공시간'};var oppName=(document.getElementById('betOpp')||{}).value||'';bets.push({opp:oppName,amt:amt,crit:crit,cl:cmap[crit],s:(document.getElementById('betS')||{}).value||'',e:(document.getElementById('betE')||{}).value||'',status:'pending',ct:Date.now()});svb();renderBetList();renderHBet();closeModal('betM');toast('내기 신청 완료!');}
function settleBet(i){openModal('settlM');var si=document.getElementById('settlIdx');if(si)si.value=i;var b=bets[i];var sm=document.getElementById('settlMeta');if(sm)sm.textContent='vs '+b.opp+' · '+Number(b.amt).toLocaleString()+'P · '+b.cl;}
function confirmSettl(){var i=parseInt((document.getElementById('settlIdx')||{}).value),mine=parseFloat((document.getElementById('settlMine')||{}).value),opp=parseFloat((document.getElementById('settlOpp')||{}).value);if(isNaN(mine)||isNaN(opp)){toast('점수를 입력해주세요');return;}var win=mine>opp;bets[i].status='done';bets[i].result=win?'승':'패';svb();renderBetList();renderHBet();closeModal('settlM');toast(win?'승리!':'패배');}
function renderBetStats(){var we=document.getElementById('betWins');if(we)we.textContent=bets.filter(function(b){return b.status==='done'&&b.result==='승';}).length;var le=document.getElementById('betLosses');if(le)le.textContent=bets.filter(function(b){return b.status==='done'&&b.result==='패';}).length;}

// FRIENDS
function addFriend(){var n=(document.getElementById('fr_name')||{}).value;if(n)n=n.trim();if(!n){toast('이름을 입력해주세요');return;}var c=(document.getElementById('fr_color')||{}).value||'#5b4fcf';var fc=(document.getElementById('fr_code')||{}).value;if(fc)fc=fc.trim().toUpperCase();frds.push({id:'f'+Date.now(),name:n,phone:(document.getElementById('fr_phone')||{}).value||'',color:c,shareCode:fc||'',status:fc?'connected':'pending'});svf();if(fc){try{subscribeToFriend(fc);fbPushMyData();}catch(e){}}closeModal('addFrM');renderSet();toast(n+' 추가됨!');}
function renderFriendList(){var el=document.getElementById('friendList');if(!el)return;if(!frds.length){el.innerHTML='<div style="font-size:.76rem;color:var(--ink3);padding:5px 0">등록된 친구 없음</div>';return;}el.innerHTML='';frds.forEach(function(f,i){var row=document.createElement('div');row.className='frow';var av=document.createElement('div');av.className='fav';av.style.background=f.color||'#5b4fcf';av.style.color='#fff';av.textContent=(f.name||'?')[0];var inf=document.createElement('div');inf.className='finf';var nm=document.createElement('div');nm.className='fn';nm.textContent=f.name||'';var st=document.createElement('div');st.className='fs';st.textContent=f.status==='connected'?'🟢 연동됨':'연동 대기';inf.appendChild(nm);inf.appendChild(st);var btn=document.createElement('button');btn.className='btn btn-ol btn-sm';btn.textContent='삭제';(function(idx){btn.onclick=function(){rmFr(idx);};})(i);row.appendChild(av);row.appendChild(inf);row.appendChild(btn);el.appendChild(row);});}
function rmFr(i){if(confirm('삭제?')){frds.splice(i,1);svf();renderSet();}}

// SETTINGS
function saveProfile(){var ni=document.getElementById('s_name');if(ni&&ni.value.trim())prof.name=ni.value.trim();var si=document.getElementById('s_school');if(si&&si.value.trim())prof.school=si.value.trim();var gi=document.getElementById('s_grade');if(gi&&gi.value.trim())prof.grade=gi.value.trim();var ai=document.getElementById('s_age');if(ai&&ai.value)prof.age=parseInt(ai.value)||prof.age||0;var go2=document.getElementById('s_goal');if(go2&&go2.value)prof.goal=parseFloat(go2.value)||prof.goal||6.5;var pi=document.getElementById('s_phone');if(pi&&pi.value.trim())prof.phone=pi.value.trim();svp();renderProfUI();document.getElementById('profEdit').style.display='none';document.getElementById('profView').style.display='block';document.getElementById('profEditBtn').textContent='수정';toast('프로필 저장됨! ✅');fbPushMyData();}
function toggleProfileEdit(){var view=document.getElementById('profView'),edit=document.getElementById('profEdit'),btn=document.getElementById('profEditBtn');if(!view||!edit)return;if(edit.style.display!=='none'){edit.style.display='none';view.style.display='block';if(btn)btn.textContent='수정';}else{['s_name','s_school','s_grade'].forEach(function(id){var el=document.getElementById(id);if(el)el.value=prof[id.replace('s_','')]||'';});var ai=document.getElementById('s_age');if(ai)ai.value=prof.age||'';var go2=document.getElementById('s_goal');if(go2)go2.value=prof.goal||6.5;var pi=document.getElementById('s_phone');if(pi)pi.value=prof.phone||'';edit.style.display='block';view.style.display='none';if(btn)btn.textContent='닫기';}}
function savePomoSet(){var pf=parseInt((document.getElementById('s_pf')||{}).value)||70,pb=parseInt((document.getElementById('s_pb')||{}).value)||10;var rh=parseInt((document.getElementById('s_reset')||{}).value);if(isNaN(rh)||rh<0||rh>11)rh=5;cfg.pf=pf;cfg.pb=pb;cfg.resetHour=rh;svcfg();pSec=pf*60;pBrk=pb*60;resetPomo();reloadPlanForToday();updateHome();_lastStudyDay=today();if(todoOpenSubjId)renderTodoPanel();toast('저장됨 · 초기화 새벽 '+rh+'시');}
function saveLinkSettings(){var s1=document.getElementById('s_linkstop'),s2=document.getElementById('s_linkstart');cfg.linkPomoStop=s1?s1.checked:true;cfg.linkPomoStart=s2?s2.checked:true;svcfg();toast('저장됨');}
function renderProfUI(){var n=prof.name||'나';['profAv','myAv'].forEach(function(id){var el=document.getElementById(id);if(el)el.textContent=n[0]||'나';});var pn=document.getElementById('profName');if(pn)pn.textContent=n;var sv2=document.getElementById('profSchoolView');if(sv2)sv2.textContent=prof.school||'학교 미입력';var gv=document.getElementById('profGradeView');if(gv)gv.textContent=prof.grade||'학년 미입력';var phv=document.getElementById('profPhoneView');if(phv)phv.textContent=prof.phone||'연락처 미입력';}
function applyTheme(k,v){document.documentElement.style.setProperty(k,v);if(!cfg.themeC)cfg.themeC={};cfg.themeC[k]=v;svcfg();}
function switchColorTab(n){var p1=document.getElementById('colorPane1'),p2=document.getElementById('colorPane2');if(p1)p1.style.display=n===1?'block':'none';if(p2)p2.style.display=n===2?'block':'none';var b1=document.getElementById('colorTab1'),b2=document.getElementById('colorTab2');if(b1){b1.style.background=n===1?'var(--acc)':'transparent';b1.style.color=n===1?'#fff':'var(--ink)';}if(b2){b2.style.background=n===2?'var(--acc)':'transparent';b2.style.color=n===2?'#fff':'var(--ink)';}}
function resetTheme(){var def={'--green':'#16734a','--acc':'#4f46e5','--bg':'#f0eff6','--plan':'#60a5fa','--streak':'#1a1a1a','--streak2':'#2a2a2a'};cfg.themeC=def;svcfg();Object.keys(def).forEach(function(k){document.documentElement.style.setProperty(k,def[k]);});renderSet();toast('초기화됨');}
function applyAllTheme(){var tc=cfg.themeC||{};Object.keys(tc).forEach(function(k){document.documentElement.style.setProperty(k,tc[k]);});}
function exportData(){var blob=new Blob([JSON.stringify({subjs:subjs,sess:sess,ctr:ctr,frds:frds,bets:bets,prof:prof,pdata:pdata},null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='sg_data.json';a.click();toast('내보내기 완료');}
function renderSet(){var fields={s_name:prof.name,s_school:prof.school,s_grade:prof.grade,s_goal:prof.goal,s_phone:prof.phone,s_pf:cfg.pf||70,s_pb:cfg.pb||10,s_reset:(cfg.resetHour===0||cfg.resetHour)?cfg.resetHour:5};Object.keys(fields).forEach(function(id){var el=document.getElementById(id);if(el&&fields[id]!==undefined)el.value=fields[id];});var ls1=document.getElementById('s_linkstop');if(ls1)ls1.checked=cfg.linkPomoStop!==false;var ls2=document.getElementById('s_linkstart');if(ls2)ls2.checked=cfg.linkPomoStart!==false;renderProfUI();renderFriendList();renderScList();renderBetList();renderShareCode();renderAlertSettings();var tc=cfg.themeC||{};var picks={'tc_g':'--green','tc_a':'--acc','tc_b':'--bg','tc_plan':'--plan','tc_streak':'--streak'};Object.keys(picks).forEach(function(id){var el=document.getElementById(id);if(el)el.value=tc[picks[id]]||getComputedStyle(document.documentElement).getPropertyValue(picks[id]).trim();});}

// SHARE CODE & FB SYNC
function getMyCode(){var c=localStorage.getItem('sg_mycode');if(!c){c=Math.random().toString(36).substring(2,8).toUpperCase();localStorage.setItem('sg_mycode',c);}return c;}
function renderShareCode(){var el=document.getElementById('myShareCode');if(el)el.textContent=getMyCode();var st=document.getElementById('fbStatus');if(st){st.textContent=window._fbReady?'🟢 Firebase 연결됨 — 실시간 동기화 활성':'🔴 오프라인 모드';st.style.color=window._fbReady?'#16734a':'#b91c1c';}renderConnectedMembers();}
function copyShareCode(){var code=getMyCode();var url=window.location.href.split('?')[0]+'?join='+code;if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){toast('링크 복사됨 🔗');});}else{var t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();document.execCommand('copy');document.body.removeChild(t);toast('링크 복사됨 🔗');}}
function connectByCode(){var inp=document.getElementById('friendCodeInp');var code=inp?(inp.value.trim().toUpperCase()):'';if(code.length!==6){toast('6자리 코드를 입력해주세요');return;}if(code===getMyCode()){toast('내 코드는 입력할 수 없어요');return;}if(window._fbReady){toast('🔍 확인 중...');window._fbGet('users/'+code).then(function(snap){var data=snap?snap.val():null;showConnectConfirm(code,data?data.name:'코드 '+code,data);});}else{showConnectConfirm(code,'코드 '+code,null);}}
function showConnectConfirm(code,name,fbData){window._pendingCode2=code;window._pendingFbData=fbData;var infoEl=document.getElementById('connectInfo');if(infoEl)infoEl.innerHTML='<div style="font-size:2rem;margin-bottom:8px">🤝</div><div style="font-size:1.05rem;font-weight:900;margin-bottom:4px">'+(name||'이름없음')+'</div><div style="font-size:.68rem;color:var(--ink3)">코드: '+code+'</div>';openModal('connectConfirmM');}
function confirmConnect(){if(!window._pendingCode2)return;var code=window._pendingCode2,fbData=window._pendingFbData;var name=fbData&&fbData.name?fbData.name:'친구('+code+')';var connected=JSON.parse(localStorage.getItem('sg_connected')||'[]');connected.push({code:code,name:name,color:'#5b4fcf',ts:Date.now()});localStorage.setItem('sg_connected',JSON.stringify(connected));var existing=frds.find(function(f){return f.shareCode===code;});if(!existing){frds.push({id:'f'+Date.now(),name:name,phone:'',color:'#5b4fcf',shareCode:code,status:'connected'});}else{existing.status='connected';existing.shareCode=code;}svf();subscribeToFriend(code);fbPushMyData();if(window._fbReady){try{window._fbSet('users/'+code+'/incoming/'+getMyCode(),{name:prof.name||'나',code:getMyCode(),color:FRIEND_AUTO_COLORS[Math.floor(Math.random()*FRIEND_AUTO_COLORS.length)],ts:Date.now()});}catch(e){}}window._pendingCode2=null;window._pendingFbData=null;closeModal('connectConfirmM');renderConnectedMembers();renderFriendList();var inp=document.getElementById('friendCodeInp');if(inp)inp.value='';toast('✅ '+name+' 님과 연동됨!');}
var FRIEND_AUTO_COLORS=['#5b4fcf','#22c55e','#f59e0b','#ef4444','#0ea5e9','#a855f7','#ec4899','#14b8a6'];
function listenForIncomingConnections(){
  if(!window._fbReady){setTimeout(listenForIncomingConnections,1000);return;}
  var myCode=getMyCode();
  var key='_incoming_'+myCode;
  if(_fbListeners[key])return;
  _fbListeners[key]=window._fbListen('users/'+myCode+'/incoming',function(data){
    if(!data)return;
    var changed=false;
    Object.keys(data).forEach(function(code){
      if(code===myCode)return;
      var entry=data[code]||{};
      var existing=frds.find(function(f){return f.shareCode===code;});
      if(!existing){
        var nm=entry.name||('친구('+code+')');
        frds.push({id:'f'+Date.now()+Math.floor(Math.random()*1000),name:nm,phone:'',color:entry.color||'#5b4fcf',shareCode:code,status:'connected'});
        var connected=JSON.parse(localStorage.getItem('sg_connected')||'[]');
        if(!connected.find(function(c){return c.code===code;})){connected.push({code:code,name:nm,color:entry.color||'#5b4fcf',ts:Date.now()});localStorage.setItem('sg_connected',JSON.stringify(connected));}
        subscribeToFriend(code);
        changed=true;
        toast('🤝 '+nm+'님과 자동으로 연동되었습니다');
      }
      try{window._fbSet('users/'+myCode+'/incoming/'+code,null);}catch(e){}
    });
    if(changed){svf();renderConnectedMembers();renderFriendList();var pg=document.querySelector('.page.on');if(pg&&pg.id==='pg-room'){try{renderMemberCards();}catch(e){}renderLiveTimeline();}}
  });
}
function renderConnectedMembers(){var el=document.getElementById('connectedMembers');if(!el)return;var connected=JSON.parse(localStorage.getItem('sg_connected')||'[]');el.innerHTML='';if(!connected.length){el.innerHTML='<div style="font-size:.78rem;color:var(--ink3);padding:4px 0">연동된 멤버 없음</div>';return;}connected.forEach(function(c){var f=frds.find(function(x){return x.shareCode===c.code;});var fSecs=getFriendLiveSecs(c.code);var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)';var av=document.createElement('div');av.style.cssText='width:34px;height:34px;border-radius:50%;background:'+(c.color||'#5b4fcf')+';color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem';av.textContent=(c.name||'?')[0];row.appendChild(av);var info=document.createElement('div');info.style.flex='1';info.innerHTML='<div style="font-size:.85rem;font-weight:700">'+c.name+'</div><div style="font-size:.68rem;color:var(--ink3)">'+(fSecs>0?fmtLiveSecs(fSecs):'-')+'</div>';row.appendChild(info);var btn=document.createElement('button');btn.style.cssText='background:none;border:none;color:var(--ink3);font-size:.9rem;cursor:pointer;padding:4px 6px';btn.textContent='✕';(function(code2){btn.onclick=function(){disconnectFriend(code2);};})(c.code);row.appendChild(btn);el.appendChild(row);});}
function disconnectFriend(code){if(!confirm('연동을 해제할까요?'))return;var connected=JSON.parse(localStorage.getItem('sg_connected')||'[]').filter(function(c){return c.code!==code;});localStorage.setItem('sg_connected',JSON.stringify(connected));frds=frds.filter(function(f){return f.shareCode!==code;});svf();if(_fbListeners[code]){_fbListeners[code]();delete _fbListeners[code];}renderConnectedMembers();renderFriendList();toast('연동 해제됨');}
function checkJoinParam(){var params=new URLSearchParams(window.location.search);var joinCode=params.get('join');if(joinCode&&joinCode.length===6){joinCode=joinCode.toUpperCase();if(joinCode!==getMyCode()){setTimeout(function(){go('settings');var inp=document.getElementById('friendCodeInp');if(inp){inp.value=joinCode;connectByCode();}},1000);}}}
function fbPushMyData(){if(!window._fbReady)return;var code=getMyCode(),myT=getTSecs(),now=Date.now();window._fbUpdate('users/'+code,{name:prof.name||'이름없음',school:prof.school||'',grade:prof.grade||'',code:code,todayStudy:{h:Math.floor(myT/3600),m:Math.floor((myT%3600)/60),s:Math.floor(myT%60),secs:myT,date:new Date().toISOString().split('T')[0]},lastSeen:now,live:aId&&aStart?{active:true,baseSecs:myT,baseAt:now}:{active:false,baseSecs:myT,baseAt:now}});}
function startFbSync(){if(!window._fbReady){setTimeout(startFbSync,1000);return;}fbPushMyData();pushFcmTokenIfReady();window._fbSet('users/'+getMyCode()+'/alertCfg',alertCfg);if(_fbSyncInt)clearInterval(_fbSyncInt);_fbSyncInt=setInterval(function(){fbPushMyData();},aId?3000:15000);}
function restartFbSync(){if(_fbSyncInt)clearInterval(_fbSyncInt);_fbSyncInt=null;startFbSync();}
// 친구 실시간 데이터 캐시 (frds 의존 없음, 코드 키로 직접 저장)
var _friendData={};
function _storeFriendData(code,data){
  if(!code||!data)return;
  if(!_friendData[code])_friendData[code]={};
  var d=_friendData[code];
  d.name=data.name||d.name||'친구';
  d.todayStudy=data.todayStudy||d.todayStudy||null;
  d.live=data.live||null;
  d.lastFetch=Date.now();
  // frds에도 반영 (있을 경우)
  var f=frds.find(function(x){return x.shareCode===code;});
  if(f){f.fbStudy=d.todayStudy;f.fbLiveTimer=d.live;svf();}
}
function fetchFriendLatest(code){
  if(!code||!window._fbReady)return;
  // 5초 이내 가져왔으면 스킵
  if(_friendData[code]&&_friendData[code].lastFetch&&Date.now()-_friendData[code].lastFetch<5000)return;
  window._fbGet('users/'+code).then(function(data){
    if(!data)return;
    _storeFriendData(code,data);
    renderLiveTimeline();
  }).catch(function(){});
}
function subscribeToFriend(code){
  if(!code)return;
  if(!window._fbReady){setTimeout(function(){subscribeToFriend(code);},1000);return;}
  if(_fbListeners[code])return;
  _fbListeners[code]=window._fbListen('users/'+code,function(data){
    if(!data)return;
    _storeFriendData(code,data);
    // frds에 없으면 추가
    var f=frds.find(function(x){return x.shareCode===code;});
    if(!f){
      var conn=JSON.parse(localStorage.getItem('sg_connected')||'[]').find(function(c){return c.code===code;});
      var nm=data.name||(conn&&conn.name)||'친구('+code+')';
      var cl=(conn&&conn.color)||'#5b4fcf';
      frds.push({id:'f'+Date.now(),name:nm,phone:'',color:cl,shareCode:code,status:'connected'});
      if(!conn){var connected=JSON.parse(localStorage.getItem('sg_connected')||'[]');connected.push({code:code,name:nm,color:cl,ts:Date.now()});localStorage.setItem('sg_connected',JSON.stringify(connected));}
      svf();
    }
    try{renderConnectedMembers();}catch(e){}
    renderLiveTimeline();
  });
}
function resumeFbSubscriptions(){
  if(!window._fbReady){setTimeout(resumeFbSubscriptions,1000);return;}
  var codes={};
  JSON.parse(localStorage.getItem('sg_connected')||'[]').forEach(function(c){if(c.code){codes[c.code]=true;subscribeToFriend(c.code);}});
  frds.forEach(function(f){if(f.shareCode&&!codes[f.shareCode]){codes[f.shareCode]=true;subscribeToFriend(f.shareCode);}});
  listenForIncomingConnections();
}
function getFriendLiveSecs(code){
  var d=_friendData[code]||{};
  var lt=d.live;
  if(!lt)return d.todayStudy?(d.todayStudy.secs||0):0;
  if(!lt.active)return lt.baseSecs||(d.todayStudy?d.todayStudy.secs:0);
  return(lt.baseSecs||0)+Math.max(0,Math.floor((Date.now()-(lt.baseAt||Date.now()))/1000));
}


// 알림
function svAlertCfg(){localStorage.setItem('sg_alert',JSON.stringify(alertCfg));if(window._fbReady)window._fbSet('users/'+getMyCode()+'/alertCfg',alertCfg);}
function saveAlertSet(){var onEl=document.getElementById('alertOn');var msgEl=document.getElementById('alertMsgCustom');alertCfg.on=onEl?onEl.checked:false;if(msgEl&&msgEl.value.trim())alertCfg.msg=msgEl.value.trim();svAlertCfg();startAlertSchedule();renderAlertSettings();toast('알림 설정 저장됨!');}
function addAlertTime(){var now=new Date();var inp=document.getElementById('alertTimeInput');if(inp)inp.value=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');var presets=document.getElementById('alertTimePresets');if(presets){presets.innerHTML='';['07:00','08:00','09:00','14:00','16:00','20:00','21:00','22:00','23:00'].forEach(function(t){var btn=document.createElement('button');btn.className='btn btn-ol btn-sm';btn.textContent=t;btn.onclick=function(){var i2=document.getElementById('alertTimeInput');if(i2)i2.value=t;};presets.appendChild(btn);});}openModal('alertTimeM');}
function confirmAddAlertTime(){var inp=document.getElementById('alertTimeInput');var t=inp?inp.value.trim():'';if(!t){toast('시간을 선택해주세요');return;}if(!alertCfg.times)alertCfg.times=[];if(alertCfg.times.indexOf(t)>=0){toast('이미 추가된 시간이에요');closeModal('alertTimeM');return;}alertCfg.times.push(t);alertCfg.times.sort();svAlertCfg();renderAlertSettings();closeModal('alertTimeM');toast(t+' 알림 추가됨 ⏰');}
function removeAlertTime(i){alertCfg.times.splice(i,1);svAlertCfg();renderAlertSettings();}
function setAlertMsg(msg){alertCfg.msg=msg;svAlertCfg();var inp=document.getElementById('alertMsgCustom');if(inp)inp.value=msg;renderAlertSettings();}
function renderAlertSettings(){var onEl=document.getElementById('alertOn');if(onEl)onEl.checked=alertCfg.on||false;var tList=document.getElementById('alertTimeList');if(tList){tList.innerHTML='';(alertCfg.times||[]).forEach(function(t,i){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:7px 10px;background:var(--bg);border-radius:8px;margin-bottom:5px';var tl=document.createElement('div');tl.style.cssText='font-family:monospace;font-size:.9rem;font-weight:700';tl.textContent=t;var db=document.createElement('button');db.style.cssText='background:none;border:none;color:var(--ink3);cursor:pointer;font-size:.9rem';db.textContent='✕';(function(idx){db.onclick=function(){removeAlertTime(idx);};})(i);row.appendChild(tl);row.appendChild(db);tList.appendChild(row);});if(!(alertCfg.times||[]).length)tList.innerHTML='<div style="font-size:.75rem;color:var(--ink3);padding:4px 0">알림 시간 없음</div>';}var pGrid=document.getElementById('alertMsgPresets');if(pGrid){pGrid.innerHTML='';ALERT_PRESETS.forEach(function(p){var btn=document.createElement('button');btn.style.cssText='padding:7px 6px;border-radius:8px;border:1.5px solid var(--line);background:'+(alertCfg.msg===p?'var(--acc)':'var(--bg)')+';color:'+(alertCfg.msg===p?'#fff':'var(--ink)')+';font-size:.7rem;cursor:pointer;font-family:sans-serif;text-align:left;line-height:1.3';btn.textContent=p;(function(msg){btn.onclick=function(){setAlertMsg(msg);};})(p);pGrid.appendChild(btn);});}var inp=document.getElementById('alertMsgCustom');if(inp&&ALERT_PRESETS.indexOf(alertCfg.msg)<0)inp.value=alertCfg.msg||'';
  var pushEl=document.getElementById('pushStatus');
  if(pushEl){
    var st=pushPermStatus();
    var hasToken=!!localStorage.getItem('sg_fcmtoken');
    if(st==='granted'&&hasToken){pushEl.innerHTML='<div style="font-size:.74rem;color:var(--green);font-weight:700;padding:8px 10px;background:var(--gbg);border-radius:8px">🔔 폰 푸시 알림 켜짐 — 앱이 꺼져있어도 설정한 시간에 알림이 와요</div>';}
    else if(st==='denied'){pushEl.innerHTML='<div style="font-size:.74rem;color:var(--red);padding:8px 10px;background:var(--rbg);border-radius:8px;margin-bottom:6px">알림 권한이 거부되어 있습니다. 브라우저 설정에서 알림 권한을 허용해주세요.</div>';}
    else{pushEl.innerHTML='<button class="btn btn-dk btn-sm" style="width:100%" onclick="requestPushPermission()">📱 폰 푸시 알림 켜기</button>';}
  }
}
function startAlertSchedule(){_alertInts.forEach(function(id){clearInterval(id);});_alertInts=[];if(!alertCfg.on)return;var id=setInterval(function(){var now=new Date();var hhmm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');if((alertCfg.times||[]).indexOf(hhmm)>=0)showAlertBanner(alertCfg.msg||'지금 공부할 시간이야!');},60000);_alertInts.push(id);}
function showAlertBanner(msg){var banner=document.getElementById('alertBanner');var msgEl=document.getElementById('alertMsg');var subEl=document.getElementById('alertSub');if(!banner)return;if(msgEl)msgEl.textContent=msg;if(subEl){var now=new Date();subEl.textContent='StudyGroup · '+now.getHours()+':'+String(now.getMinutes()).padStart(2,'0');}banner.classList.add('show');if(navigator.vibrate)navigator.vibrate([300,100,300]);setTimeout(function(){banner.classList.remove('show');},8000);}
function dismissAlert(){var banner=document.getElementById('alertBanner');if(banner)banner.classList.remove('show');}

// ── 폰 푸시 알림 (FCM) ──
// Firebase 콘솔 > 프로젝트 설정 > Cloud Messaging > 웹 푸시 인증서에서 발급받은 키를 아래에 입력하세요.
var FCM_VAPID_KEY='여기에_VAPID_키_입력';
function pushPermStatus(){
  if(!('Notification' in window))return'unsupported';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}
function requestPushPermission(){
  if(!('Notification' in window)||!navigator.serviceWorker){toast('이 브라우저는 푸시 알림을 지원하지 않습니다');return;}
  if(FCM_VAPID_KEY==='여기에_VAPID_키_입력'){toast('VAPID 키가 설정되지 않았습니다 (app.js 상단 참고)');return;}
  Notification.requestPermission().then(function(perm){
    renderAlertSettings();
    if(perm!=='granted'){toast('알림 권한이 거부되었습니다');return;}
    navigator.serviceWorker.register('/firebase-messaging-sw.js').then(function(reg){
      if(typeof firebase==='undefined'||!firebase.messaging){toast('Firebase Messaging 로드 실패');return;}
      var messaging=firebase.messaging();
      messaging.getToken({vapidKey:FCM_VAPID_KEY,serviceWorkerRegistration:reg}).then(function(token){
        if(!token){toast('토큰을 발급받지 못했습니다');return;}
        localStorage.setItem('sg_fcmtoken',token);
        if(window._fbReady)window._fbSet('users/'+getMyCode()+'/fcmToken',token);
        toast('🔔 폰 푸시 알림이 켜졌습니다');
        renderAlertSettings();
      }).catch(function(e){toast('토큰 발급 실패: '+e.message);});
    }).catch(function(e){toast('서비스워커 등록 실패: '+e.message);});
  });
}
function pushFcmTokenIfReady(){
  var token=localStorage.getItem('sg_fcmtoken');
  if(token&&window._fbReady)window._fbSet('users/'+getMyCode()+'/fcmToken',token);
}

// 뽀모도로 과목 연동
var pomoSubjId=localStorage.getItem('sg_pomosubj')||null;
function renderPomoSubjList(){var el=document.getElementById('pomoSubjList');if(!el)return;el.innerHTML='';subjs.forEach(function(s){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;margin-bottom:6px;cursor:pointer;border:2px solid '+(pomoSubjId===s.id?'var(--acc)':'var(--line)')+';background:'+(pomoSubjId===s.id?'#ede9fe':'var(--bg)')+';';var dot=document.createElement('div');dot.style.cssText='width:12px;height:12px;border-radius:50%;background:'+s.color+';flex-shrink:0;';var nm=document.createElement('div');nm.style.cssText='font-size:.88rem;font-weight:700;flex:1;';nm.textContent=s.name;row.appendChild(dot);row.appendChild(nm);if(pomoSubjId===s.id){var ck=document.createElement('div');ck.textContent='✓';ck.style.color='var(--acc)';ck.style.fontWeight='700';row.appendChild(ck);}(function(id){row.onclick=function(){pomoSubjId=id;localStorage.setItem('sg_pomosubj',id);updatePomoSubjLabel();renderPomoSubjList();};})(s.id);el.appendChild(row);});}
function clearPomoSubj(){pomoSubjId=null;localStorage.removeItem('sg_pomosubj');updatePomoSubjLabel();closeModal('pomoSubjM');toast('과목 선택 해제됨');}
function updatePomoSubjLabel(){var el=document.getElementById('pomoSubjLabel');if(!el)return;if(pomoSubjId){var s=subjs.find(function(x){return x.id===pomoSubjId;});if(s){el.textContent='● '+s.name;el.style.color=s.color;return;}}el.textContent='과목 미선택';el.style.color='rgba(255,255,255,.5)';}
var _origOpenModal=openModal;
openModal=function(id){if(id==='pomoSubjM')renderPomoSubjList();_origOpenModal(id);};

// 일일 평가
var dailyEvals=JSON.parse(localStorage.getItem('sg_evals')||'{}');
function todayEvalKey(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function saveDailyEval(){var inp=document.getElementById('dailyEvalInput');if(!inp)return;dailyEvals[todayEvalKey()]=inp.value;localStorage.setItem('sg_evals',JSON.stringify(dailyEvals));}
function loadDailyEval(){var inp=document.getElementById('dailyEvalInput');var lbl=document.getElementById('evalDateLbl');if(!inp)return;var d=new Date();if(lbl)lbl.textContent=(d.getMonth()+1)+'월 '+d.getDate()+'일';inp.value=dailyEvals[todayEvalKey()]||'';}

// 날짜 상세 (최신)
var _detailYear=0,_detailMonth=0,_detailDay=0;
function openDayDetail(y,m,d){_detailYear=y;_detailMonth=m;_detailDay=d;renderDayDetail();openModal('dayDetailM');_bindDayDetailSwipe();}
function _advanceDayDetail(dir){var dt=new Date(_detailYear,_detailMonth,_detailDay+dir);_detailYear=dt.getFullYear();_detailMonth=dt.getMonth();_detailDay=dt.getDate();}
function dayDetailNav(dir){
  _advanceDayDetail(dir);
  var body=document.getElementById('dayDetailBody');
  if(body){
    body.style.transition='none';
    body.style.transform='translateX('+(dir>0?-22:22)+'px)';
    body.style.opacity='0.35';
    renderDayDetail();
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        body.style.transition='transform .2s cubic-bezier(.32,.72,0,1),opacity .2s';
        body.style.transform='translateX(0)';
        body.style.opacity='1';
      });
    });
  }else{renderDayDetail();}
}
// 날짜 상세 모달 - 좌우 스와이프로 이전/다음 날짜 이동 (손가락 따라 부드럽게 이동 + 속도 감지)
function _bindDayDetailSwipe(){
  var body=document.getElementById('dayDetailBody');
  if(!body||body._swipeBound)return;
  body._swipeBound=true;
  var startX=0,startY=0,lastX=0,lastT=0,dx=0,vx=0,dragging=false,deciding=true,isHorizontal=false,rafId=null,pid=null;
  function setLive(x){
    if(rafId)return;
    rafId=requestAnimationFrame(function(){
      var w=body.offsetWidth||300;
      body.style.transform='translateX('+x+'px)';
      body.style.opacity=String(Math.max(.45,1-Math.abs(x)/w*0.6));
      rafId=null;
    });
  }
  function reset(){
    dragging=false;deciding=true;isHorizontal=false;
    if(rafId){cancelAnimationFrame(rafId);rafId=null;}
    if(pid!==null){try{body.releasePointerCapture(pid);}catch(e){}pid=null;}
  }
  function onMove(e){
    if(!dragging||(pid!==null&&e.pointerId!==pid))return;
    var now=performance.now();
    var ddx=e.clientX-startX,ddy=e.clientY-startY;
    if(deciding){
      if(Math.abs(ddx)<8&&Math.abs(ddy)<8)return;
      isHorizontal=Math.abs(ddx)>=Math.abs(ddy);
      deciding=false;
      if(!isHorizontal){reset();return;}
      body.style.transition='none';
      try{body.setPointerCapture(pid);}catch(err){}
    }
    if(!isHorizontal)return;
    dx=ddx;
    var dt=now-lastT;
    if(dt>0)vx=(e.clientX-lastX)/dt;
    lastX=e.clientX;lastT=now;
    setLive(dx);
  }
  function onEnd(e){
    if(!dragging||(pid!==null&&e.pointerId!==pid))return;
    var wasHorizontal=isHorizontal,curDx=dx,curVx=vx;
    reset();
    if(!wasHorizontal){body.style.transition='';body.style.transform='';body.style.opacity='';return;}
    var w=body.offsetWidth||300;
    var shouldNav=Math.abs(curDx)>w*0.18||Math.abs(curVx)>0.4;
    if(shouldNav){
      var dir=curDx<0?1:-1; // 왼쪽으로 스와이프 -> 다음 날
      body.style.transition='transform .18s cubic-bezier(.32,.72,0,1),opacity .18s';
      body.style.transform='translateX('+(dir>0?-w:w)+'px)';
      body.style.opacity='0';
      setTimeout(function(){
        _advanceDayDetail(dir);
        body.style.transition='none';
        body.style.transform='translateX('+(dir>0?w*0.4:-w*0.4)+'px)';
        renderDayDetail();
        requestAnimationFrame(function(){
          requestAnimationFrame(function(){
            body.style.transition='transform .2s cubic-bezier(.32,.72,0,1),opacity .2s';
            body.style.transform='translateX(0)';
            body.style.opacity='1';
          });
        });
      },180);
    }else{
      body.style.transition='transform .2s cubic-bezier(.32,.72,0,1),opacity .2s';
      body.style.transform='translateX(0)';
      body.style.opacity='1';
    }
  }
  body.addEventListener('pointerdown',function(e){
    if(e.pointerType==='mouse'&&e.button!==0)return;
    pid=e.pointerId;startX=lastX=e.clientX;startY=e.clientY;lastT=performance.now();
    dx=0;vx=0;dragging=true;deciding=true;isHorizontal=false;
  });
  body.addEventListener('pointermove',onMove);
  body.addEventListener('pointerup',onEnd);
  body.addEventListener('pointercancel',onEnd);
}
function renderDayDetail(){
  var y=_detailYear,m=_detailMonth,d=_detailDay;
  var dt=new Date(y,m,d);var days=['일','월','화','수','목','금','토'];
  var titleEl=document.getElementById('dayDetailTitle');if(titleEl)titleEl.textContent=(m+1)+'월 '+d+'일 ('+days[dt.getDay()]+')';
  var sc=getSecsDate(y,m,d),sh=Math.floor(sc/3600),sm2=Math.floor((sc%3600)/60),ss2=Math.floor(sc%60);
  var secEl=document.getElementById('dayDetailSecs');if(secEl)secEl.textContent=sc>0?(sh+'h '+String(sm2).padStart(2,'0')+'m '+String(ss2).padStart(2,'0')+'s'):'기록 없음';
  // resetHour 기준 스터디데이로 세션 필터
  var dayKey=new Date(y,m,d).toDateString();
  var daySess=sess.filter(function(s){return studyDayOf(new Date(s.start))===dayKey;});
  var subjSecs={};daySess.forEach(function(s){var dur=Math.floor(((s.end||Date.now())-s.start)/1000);subjSecs[s.subjectId]=(subjSecs[s.subjectId]||0)+dur;});
  var evalKey=y+'-'+String(m+1).padStart(2,'0')+'-'+String(d).padStart(2,'0');
  var evalText=dailyEvals[evalKey]||'';
  var subjBarsHTML='';
  subjs.forEach(function(sub){var sec=subjSecs[sub.id]||0;if(!sec)return;var sh2=Math.floor(sec/3600),sm3=Math.floor((sec%3600)/60);var ts=sh2>0?sh2+'h '+String(sm3).padStart(2,'0')+'m':sm3+'m';subjBarsHTML+='<div class="dd-subj-row"><div class="dd-subj-dot" style="background:'+sub.color+'"></div><div class="dd-subj-name">'+escapeHtml(sub.name)+'</div><div class="dd-subj-time">'+ts+'</div></div>';});
  // 미니 격자: 플래너와 동일하게 GRID_START_HOUR(rowToHour) 기준
  function miniGridHTML(){
    var W=140,H=260,AX=18,GW=W-AX,RH=H/24;
    var html='<svg width="'+W+'" height="'+H+'" style="display:block;overflow:visible">';
    for(var i=0;i<24;i++){
      var hr=rowToHour(i);
      html+='<text x="'+(AX/2)+'" y="'+(i*RH+RH/2+3)+'" text-anchor="middle" font-size="6" fill="rgba(255,255,255,.3)">'+hr+'</text>';
      html+='<line x1="'+AX+'" x2="'+W+'" y1="'+(i*RH)+'" y2="'+(i*RH)+'" stroke="rgba(255,255,255,.06)" stroke-width="0.5"/>';
    }
    for(var c=0;c<=6;c++){html+='<line x1="'+(AX+c*(GW/6))+'" x2="'+(AX+c*(GW/6))+'" y1="0" y2="'+H+'" stroke="rgba(255,255,255,.05)" stroke-width="0.5"/>';}
    daySess.forEach(function(s){
      var st2=new Date(s.start),en2=new Date(s.end||Date.now());
      var stMin=st2.getHours()*60+st2.getMinutes()+st2.getSeconds()/60;
      var enMin=en2.getHours()*60+en2.getMinutes()+en2.getSeconds()/60;
      for(var row=0;row<24;row++){
        var hr2=rowToHour(row);
        var rowStart=hr2*60,rowEnd=rowStart+60;
        var segS=Math.max(stMin,rowStart),segE=Math.min(enMin,rowEnd);
        if(segE<=segS)continue;
        var x1=Math.round((segS-rowStart)*(GW/60)),x2=Math.round((segE-rowStart)*(GW/60));
        html+='<rect x="'+(AX+x1)+'" y="'+(row*RH+0.5)+'" width="'+Math.max(1,x2-x1)+'" height="'+(RH-1)+'" fill="'+(s.color||'#a78bfa')+'"/>';
      }
    });
    return html+'</svg>';
  }
  var tlEl=document.getElementById('dayDetailTimeline');
  if(tlEl)tlEl.innerHTML=daySess.length?miniGridHTML():'<div style="display:flex;align-items:center;justify-content:center;height:100%;color:rgba(255,255,255,.35);font-size:.75rem;flex-direction:column;gap:6px"><div style="font-size:1.5rem">😴</div>공부 기록 없음</div>';
  var evalEl=document.getElementById('dayDetailEval');if(evalEl){evalEl.textContent=evalText||'기록 없음';evalEl.style.color=evalText?'var(--ink)':'var(--ink3)';}
  var todoEl=document.getElementById('dayDetailTodos');
  if(todoEl){
    var todoHtml='';var ddKey=todoDateKeyFor(y,m,d);
    subjs.forEach(function(sub){var list=getTodoList(ddKey,sub.id);if(!list.length)return;todoHtml+='<div class="dd-todo-subj"><div class="dd-todo-subj-hd" style="color:'+sub.color+'">'+escapeHtml(sub.name)+'</div><div class="dd-todo-list">';list.forEach(function(t){todoHtml+='<div class="dd-todo-row"><div class="dd-todo-text'+(t.done?' done':'')+'">'+escapeHtml(t.text)+'</div><div class="dd-todo-mark '+(t.done?'done':'undone')+'">'+(t.done?'O':'X')+'</div></div>';});todoHtml+='</div></div>';});
    todoEl.innerHTML=todoHtml||'<div style="font-size:.78rem;color:var(--ink3);text-align:center;padding:10px 0">등록된 TODO가 없습니다</div>';
  }
  var subjContainer=document.querySelector('#dayDetailM .dd-subj-bars');if(subjContainer)subjContainer.innerHTML='<div class="dd-subj-hd">과목별 공부시간</div>'+(subjBarsHTML||'<div style="font-size:.76rem;color:var(--ink3);text-align:center;padding:6px 0">기록 없음</div>');
}

// 실시간 타임라인
function renderLiveTimeline(){
  var myT=getTSecs(),myH=Math.floor(myT/3600),myM=Math.floor((myT%3600)/60),myS=Math.floor(myT%60);
  var myDot=document.getElementById('liveMyDot'),mySubjEl=document.getElementById('liveMySubj'),myTimeEl=document.getElementById('liveMyTime'),myBar=document.getElementById('liveMyBar'),myNameEl=document.getElementById('liveMyName');
  if(myNameEl)myNameEl.textContent=prof.name||'나';
  if(aId&&aStart){var sub=subjs.find(function(s){return s.id===aId;});if(myDot)myDot.style.background=sub?sub.color:'var(--acc)';if(mySubjEl)mySubjEl.innerHTML='<span style="background:'+(sub?sub.color:'var(--acc)')+';color:#fff;padding:2px 7px;border-radius:10px;font-size:.65rem;font-weight:700">'+(sub?sub.name:'공부 중')+'</span> 공부 중';}else{if(myDot)myDot.style.background='#ddd';if(mySubjEl)mySubjEl.textContent='공부 중 아님';}
  if(myTimeEl)myTimeEl.textContent=myH+'h '+String(myM).padStart(2,'0')+'m '+String(myS).padStart(2,'0')+'s';
  var goalSecs=(prof.goal||6.5)*3600;
  if(myBar)myBar.style.width=Math.min(100,Math.round(myT/goalSecs*100))+'%';
  var fw=document.getElementById('liveFriendTimelines');if(!fw)return;
  var connected=JSON.parse(localStorage.getItem('sg_connected')||'[]');
  frds.forEach(function(f){if(f.shareCode&&!connected.find(function(c){return c.code===f.shareCode;}))connected.push({code:f.shareCode,name:f.name,color:f.color||'#5b4fcf'});});
  fw.innerHTML='';
  if(!connected.length){fw.innerHTML='<div style="font-size:.78rem;color:var(--ink3);padding:8px 0;text-align:center">연동된 친구 없음</div>';return;}
  connected.forEach(function(c){
    var f=frds.find(function(x){return x.shareCode===c.code;});
    if(!f||(!f.fbStudy&&!f.fbLiveTimer))fetchFriendLatest(c.code);
    var fSecs=getFriendLiveSecs(c.code);
    var fH=Math.floor(fSecs/3600),fM2=Math.floor((fSecs%3600)/60);
    var isLive=f&&f.fbLiveTimer&&f.fbLiveTimer.active;
    var fColor=(f&&f.color)||c.color||'#5b4fcf';
    var wrap=document.createElement('div');wrap.style.cssText='margin-bottom:12px';
    var topRow=document.createElement('div');topRow.style.cssText='display:flex;align-items:center;gap:7px;margin-bottom:5px';
    var dot=document.createElement('div');dot.style.cssText='width:8px;height:8px;border-radius:50%;background:'+(isLive?fColor:'#ddd')+';flex-shrink:0';
    var nm=document.createElement('div');nm.style.cssText='font-size:.8rem;font-weight:700';nm.textContent=(f&&f.name)||c.name||'친구';
    var timeEl=document.createElement('div');timeEl.style.cssText='margin-left:auto;font-family:monospace;font-size:.78rem;font-weight:600;color:var(--green)';
    timeEl.textContent=fH+'h '+String(fM2).padStart(2,'0')+'m';
    topRow.appendChild(dot);topRow.appendChild(nm);topRow.appendChild(timeEl);
    var barBg=document.createElement('div');barBg.style.cssText='height:10px;background:var(--bg);border-radius:5px;overflow:hidden';
    var barFill=document.createElement('div');barFill.style.cssText='height:100%;border-radius:5px;background:'+fColor+';width:'+Math.min(100,Math.round(fSecs/goalSecs*100))+'%;transition:width .5s';
    barBg.appendChild(barFill);wrap.appendChild(topRow);wrap.appendChild(barBg);fw.appendChild(wrap);
  });
}

// 또래 비교 / 스트릭
function pushAgeData(){if(!window._fbReady||!prof.age)return;window._fbSet('ageStats/'+prof.age+'/'+getMyCode(),{secs:getTSecs(),date:new Date().toISOString().split('T')[0],code:getMyCode()});}
function renderAgeCompare(){var contentEl=document.getElementById('ageCompareContent');if(!contentEl)return;if(!prof.age){contentEl.innerHTML='<div style="font-size:.78rem;color:var(--ink3);text-align:center;padding:10px 0">설정에서 나이를 입력하면 같은 나이 학생들과 비교할 수 있어요</div>';return;}contentEl.innerHTML='<div style="font-size:.78rem;color:var(--ink3);text-align:center;padding:10px 0">데이터 수집 중...</div>';}
function updateStreakBanner(){var n=streak3h();var el=document.getElementById('streakDays');if(el)el.textContent=n;var ss=document.getElementById('stStrk');if(ss)ss.textContent=n+'일';}
function streak3h(){var base=new Date(today()),strk=0;for(var i=60;i>=0;i--){var d=new Date(base);d.setDate(d.getDate()-i);var sc=getSecsDate(d.getFullYear(),d.getMonth(),d.getDate());if(sc>=3*3600||(i===0&&aId))strk++;else if(i>0)strk=0;}return strk;}
function checkStreakPoints(){}
function checkGoalBonus(){}

// 모의고사
var mockScores=JSON.parse(localStorage.getItem('sg_mock')||'[]');
function svMock(){localStorage.setItem('sg_mock',JSON.stringify(mockScores));try{window._fbSet('mockScores/'+getMyCode(),mockScores);}catch(e){}}
function subscribeMockScores(){if(!window._fbReady){setTimeout(subscribeMockScores,1000);return;}try{window._fbListen('mockScores/'+getMyCode(),function(data){if(!data)return;var arr=Array.isArray(data)?data:Object.keys(data).map(function(k){return data[k];});arr=arr.filter(function(x){return x&&x.year;});if(!arr.length)return;arr.forEach(function(ext){var idx=mockScores.findIndex(function(s){return s.year===ext.year&&s.month===ext.month;});if(idx<0)mockScores.push(ext);else if((ext.ts||0)>=(mockScores[idx].ts||0))mockScores[idx]=ext;});mockScores.sort(function(a,b){return(a.year*100+a.month)-(b.year*100+b.month);});localStorage.setItem('sg_mock',JSON.stringify(mockScores));var mp=document.getElementById('pg-mock');if(mp&&mp.classList.contains('on'))renderMockPage();});}catch(e){}}
var GRADE_CUTS={'화작':[93,85,76,66,55,43,32,22],'언매':[91,84,75,65,54,42,31,21],'국어공통':[92,85,76,66,55,43,32,22],'확통':[92,83,73,62,50,38,28,18],'미적':[85,77,67,56,45,34,25,16],'기하':[91,82,72,61,49,37,27,17],'수학공통':[88,80,70,59,48,36,26,17],'english':[90,80,70,60,50,40,30,20],'exp':[45,42,38,33,28,22,17,12],'history':[40,35,30,25,20,15,10,5],'society':[45,40,35,29,23,17,12,8],'science':[45,40,35,29,23,17,12,8]};
function cutsKeyFor(subject,subtype){if(subject==='korean'){if(subtype==='화작')return'화작';if(subtype==='언매')return'언매';return'국어공통';}if(subject==='math'){if(subtype==='확통')return'확통';if(subtype==='미적')return'미적';if(subtype==='기하')return'기하';return'수학공통';}return subject==='english'?'english':subject==='history'?'history':subject==='society'?'society':subject==='science'?'science':null;}
function calcGrade(subject,score,subtype,grade,year,month){score=parseInt(score);if(isNaN(score)||score<=0)return null;var key=cutsKeyFor(subject,subtype),cuts=GRADE_CUTS[key];if(!cuts)return null;var off=(subject==='korean'||subject==='math')?(({'1':2,'2':1,'3':0})[String(grade)]||0):0;for(var g=0;g<cuts.length;g++){if(score>=(cuts[g]+off))return g+1;}return 9;}
function gradeColor(g){if(!g)return'var(--ink3)';if(g===1)return'#ef4444';if(g===2)return'#f97316';if(g===3)return'#eab308';if(g<=5)return'var(--green)';return'var(--ink3)';}
function effGrade(s,base){if(s[base+'Real']!=null)return s[base+'Real'];if(s[base+'Est']!=null)return s[base+'Est'];if(s[base+'Grade']!=null)return s[base+'Grade'];return null;}
function hasRealGrade(s){return['korean','math','english'].some(function(b){return s[b+'Real']!=null;});}
function previewGrade(subj,val){var gradeLvl=parseInt((document.getElementById('mock_grade')||{}).value)||2;var yr=parseInt((document.getElementById('mock_year')||{}).value)||0,mo=parseInt((document.getElementById('mock_month')||{}).value)||0;var grade=calcGrade(subj,val,null,gradeLvl,yr,mo);var el=document.getElementById('grade_'+subj);if(el){el.textContent=grade?grade+'등급':'-';el.style.color=grade?gradeColor(grade):'var(--ink3)';}var k=parseInt((document.getElementById('mock_korean')||{}).value)||0,m=parseInt((document.getElementById('mock_math')||{}).value)||0,e=parseInt((document.getElementById('mock_english')||{}).value)||0,e1=parseInt((document.getElementById('mock_history')||{}).value)||0,e2=parseInt((document.getElementById('mock_society')||{}).value)||0;var tp=document.getElementById('mock_total_preview');if(tp)tp.textContent=(k+m+e+e1+e2>0?k+m+e+e1+e2+'점':'-');}
function saveMockScore(){var year=parseInt((document.getElementById('mock_year')||{}).value)||new Date().getFullYear();var month=parseInt((document.getElementById('mock_month')||{}).value)||3;function iv(id){var v=parseInt((document.getElementById(id)||{}).value);return isNaN(v)?0:v;}var k=iv('mock_korean'),m=iv('mock_math'),e=iv('mock_english'),hist=iv('mock_history'),soc=iv('mock_society'),sci=iv('mock_science');if(!k&&!m&&!e&&!hist&&!soc&&!sci){toast('점수를 입력해주세요');return;}var grade=parseInt((document.getElementById('mock_grade')||{}).value)||2;var idx=mockScores.findIndex(function(s){return s.year===year&&s.month===month;});var prev=idx>=0?mockScores[idx]:{};var score={id:(prev.id)||('s'+Date.now()),year:year,month:month,grade:grade,korean:k,math:m,english:e,history:hist,society:soc,science:sci,koreanGradeEst:calcGrade('korean',k,'공통',grade,year,month),mathGradeEst:calcGrade('math',m,'공통',grade,year,month),englishGradeEst:calcGrade('english',e,null,grade,year,month),historyGradeEst:calcGrade('history',hist,null,grade,year,month),societyGradeEst:calcGrade('society',soc,null,grade,year,month),scienceGradeEst:calcGrade('science',sci,null,grade,year,month),koreanGradeReal:prev.koreanGradeReal||null,mathGradeReal:prev.mathGradeReal||null,englishGradeReal:prev.englishGradeReal||null,historyGradeReal:prev.historyGradeReal||null,societyGradeReal:prev.societyGradeReal||null,scienceGradeReal:prev.scienceGradeReal||null,koreanType:'공통',mathType:'공통',total:k+m+e+hist+soc+sci,ts:Date.now()};if(idx>=0)mockScores[idx]=score;else mockScores.push(score);mockScores.sort(function(a,b){return(a.year*100+a.month)-(b.year*100+b.month);});svMock();closeModal('addMockM');renderMockPage();toast('성적이 저장되었습니다');}
function mockTab(id){document.querySelectorAll('#pg-mock .rtab').forEach(function(t,i){t.classList.toggle('on',['table','chart'][i]===id);});document.querySelectorAll('#pg-mock .rpanel').forEach(function(p){p.classList.remove('on');});var rp=document.getElementById('mtp-'+id);if(rp)rp.classList.add('on');if(id==='table')renderGradeTable();if(id==='chart')renderCurveCharts();}
function renderMockPage(){var yr=document.getElementById('mock_year');if(yr&&!yr.options.length){var now=new Date().getFullYear();for(var y=now;y>=2025;y--){var op=document.createElement('option');op.value=y;op.textContent=y+'년';yr.appendChild(op);}}renderGradeTable();renderCurveCharts();}
var GRADE_COLS=[{base:'korean',name:'국어'},{base:'math',name:'수학'},{base:'english',name:'영어'},{base:'history',name:'한국사'},{base:'society',name:'통합사회'},{base:'science',name:'통합과학'}];
var show3Sum=false;
function toggle3Sum(){show3Sum=!show3Sum;var b=document.getElementById('sum3Btn');if(b)b.classList.toggle('btn-ac',show3Sum);renderGradeTable();}
function openMockEdit(id){var s=mockScores.find(function(x){return x.id===id;});if(!s)return;document.getElementById('editMockId').value=id;var mn=s.month===11?'수능':s.month+'월';document.getElementById('editMockTitle').textContent=s.year+'년 '+mn+' (고'+(s.grade||3)+')';var subs=[{base:'korean',name:'국어',score:s.korean},{base:'math',name:'수학',score:s.math},{base:'english',name:'영어',score:s.english},{base:'history',name:'한국사',score:s.history},{base:'society',name:'통합사회',score:s.society},{base:'science',name:'통합과학',score:s.science}];var html='';subs.forEach(function(sub){if(!sub.score)return;var est=s[sub.base+'GradeEst']!=null?s[sub.base+'GradeEst']:'-';var real=s[sub.base+'GradeReal']!=null?s[sub.base+'GradeReal']:'';html+='<div style="display:flex;align-items:center;gap:8px;margin-bottom:9px"><div style="width:48px;font-size:.82rem;font-weight:700">'+sub.name+'</div><div style="font-size:.72rem;color:var(--ink3);width:74px">예상 '+est+'등급</div><input class="inp" id="real_'+sub.base+'" type="number" min="1" max="9" placeholder="실제등급" value="'+real+'" style="margin:0;flex:1;text-align:center"></div>';});document.getElementById('editMockRows').innerHTML=html;openModal('editMockM');}
function saveRealGrades(){var id=document.getElementById('editMockId').value;var s=mockScores.find(function(x){return x.id===id;});if(!s)return;['korean','math','english','history','society','science'].forEach(function(b){var el=document.getElementById('real_'+b);if(!el)return;var v=parseInt(el.value);s[b+'GradeReal']=(v>=1&&v<=9)?v:null;});svMock();closeModal('editMockM');renderMockPage();toast('실제 등급이 저장되었습니다');}
function deleteMockFromEdit(){var id=document.getElementById('editMockId').value;if(!confirm('이 성적을 삭제할까요?'))return;mockScores=mockScores.filter(function(x){return x.id!==id;});svMock();closeModal('editMockM');renderMockPage();toast('삭제되었습니다');}
function renderGradeTable(){var tbl=document.getElementById('gradeTable'),empty=document.getElementById('gradeTableEmpty');if(!tbl)return;if(!mockScores.length){tbl.innerHTML='';if(empty)empty.style.display='block';return;}if(empty)empty.style.display='none';var rows=mockScores.slice().sort(function(a,b){return(b.year*100+b.month)-(a.year*100+a.month);});var html='<thead><tr><th class="gt-when">시험</th>';GRADE_COLS.forEach(function(c){html+='<th>'+c.name+'</th>';});if(show3Sum)html+='<th class="gt-sum">3합</th>';html+='</tr></thead><tbody>';rows.forEach(function(s){var mn=s.month===11?'수능':s.month+'월';var realTag=hasRealGrade(s)?'<span style="font-size:.54rem;color:#16734a;font-weight:700"> 실제</span>':'<span style="font-size:.54rem;color:var(--ink3);font-weight:600"> 예상</span>';html+='<tr onclick="openMockEdit(\''+s.id+'\')" style="cursor:pointer"><td class="gt-when">'+(s.year%100)+"' "+mn+realTag+'</td>';GRADE_COLS.forEach(function(c){var g=effGrade(s,c.base),isReal=(s[c.base+'GradeReal']!=null);html+=g?'<td><span class="gt-g" style="background:'+gradeColor(g)+(isReal?'':';opacity:.78')+'">'+g+'</span></td>':'<td><span class="gt-empty">-</span></td>';});if(show3Sum){var sum3=(effGrade(s,'korean')||0)+(effGrade(s,'math')||0)+(effGrade(s,'english')||0);html+='<td class="gt-sum"><b>'+(sum3||'-')+'</b></td>';}html+='</tr>';});html+='</tbody>';tbl.innerHTML=html;}
function gradeSumOf(s){var sum=0,cnt=0;GRADE_COLS.forEach(function(c){var g=effGrade(s,c.base);if(g){sum+=g;cnt++;}});return cnt?sum:null;}
function sum3Of(s){var k=effGrade(s,'korean'),m=effGrade(s,'math'),e=effGrade(s,'english');if(!k||!m||!e)return null;return k+m+e;}
function renderCurveCharts(){var data=mockScores.slice().sort(function(a,b){return(a.year*100+a.month)-(b.year*100+b.month);});drawGradeLine('chartTotalWrap',data,gradeSumOf,'#4f46e5','등급합');drawGradeLine('chart3Wrap',data,sum3Of,'#16734a','3합');renderSubjPicker();if(_subjChartKey)drawSubjBar(_subjChartKey);}
var _subjChartKey=null;
var SUBJ_CHART=[{key:'korean',base:'korean',name:'국어',color:'#ff6b9d'},{key:'math',base:'math',name:'수학',color:'#a78bfa'},{key:'english',base:'english',name:'영어',color:'#38bdf8'},{key:'history',base:'history',name:'한국사',color:'#fb7185'},{key:'society',base:'society',name:'통합사회',color:'#34d399'},{key:'science',base:'science',name:'통합과학',color:'#f59e0b'}];
function renderSubjPicker(){var el=document.getElementById('subjChartPick');if(!el)return;el.innerHTML='';SUBJ_CHART.forEach(function(s){var b=document.createElement('button');b.textContent=s.name;if(_subjChartKey===s.key)b.className='on';b.onclick=function(){_subjChartKey=s.key;renderSubjPicker();drawSubjBar(s.key);var l=document.getElementById('subjChartLbl');if(l)l.textContent=s.name+' 원점수';};el.appendChild(b);});}
function drawSubjBar(key){var info=SUBJ_CHART.find(function(s){return s.key===key;});var wrap=document.getElementById('chartSubjWrap');if(!wrap||!info)return;var data=mockScores.slice().sort(function(a,b){return(a.year*100+a.month)-(b.year*100+b.month);}).filter(function(s){return s[key]>0;});if(!data.length){wrap.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink3);font-size:.82rem">'+info.name+' 데이터가 없습니다</div>';return;}wrap.innerHTML='';var W=wrap.offsetWidth||320,H=210,PAD={l:30,r:12,t:30,b:30},cW=W-PAD.l-PAD.r,cH=H-PAD.t-PAD.b;var isExp=(key==='history'||key==='society'||key==='science'),maxScore=isExp?50:100;var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width',W);svg.setAttribute('height',H);svg.style.cssText='display:block;overflow:visible';(isExp?[0,10,20,30,40,50]:[0,20,40,60,80,100]).forEach(function(v){var y=PAD.t+cH-(v/maxScore)*cH;var ln=document.createElementNS('http://www.w3.org/2000/svg','line');ln.setAttribute('x1',PAD.l);ln.setAttribute('x2',W-PAD.r);ln.setAttribute('y1',y);ln.setAttribute('y2',y);ln.setAttribute('stroke','rgba(0,0,0,.06)');ln.setAttribute('stroke-width','1');svg.appendChild(ln);var tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('x',PAD.l-4);tx.setAttribute('y',y+3);tx.setAttribute('text-anchor','end');tx.setAttribute('font-size','9');tx.setAttribute('fill','#94a3b8');tx.textContent=v;svg.appendChild(tx);});var n=data.length,slot=cW/n,bw=Math.min(38,slot*0.6);data.forEach(function(s,i){var val=s[key],g=effGrade(s,info.base),x=PAD.l+slot*i+slot/2,bh=(val/maxScore)*cH,y=PAD.t+cH-bh;var rectEl=document.createElementNS('http://www.w3.org/2000/svg','rect');rectEl.setAttribute('x',x-bw/2);rectEl.setAttribute('y',y);rectEl.setAttribute('width',bw);rectEl.setAttribute('height',Math.max(1,bh));rectEl.setAttribute('rx','4');rectEl.setAttribute('fill',info.color);svg.appendChild(rectEl);var gl=document.createElementNS('http://www.w3.org/2000/svg','text');gl.setAttribute('x',x);gl.setAttribute('y',y-13);gl.setAttribute('text-anchor','middle');gl.setAttribute('font-size','10');gl.setAttribute('font-weight','800');gl.setAttribute('fill',gradeColor(g));gl.textContent=g?g+'등급':'-';svg.appendChild(gl);var sc=document.createElementNS('http://www.w3.org/2000/svg','text');sc.setAttribute('x',x);sc.setAttribute('y',y-2);sc.setAttribute('text-anchor','middle');sc.setAttribute('font-size','8.5');sc.setAttribute('fill','#64748b');sc.textContent=val;svg.appendChild(sc);var mn=s.month===11?'수능':s.month+'월';var xt=document.createElementNS('http://www.w3.org/2000/svg','text');xt.setAttribute('x',x);xt.setAttribute('y',H-8);xt.setAttribute('text-anchor','middle');xt.setAttribute('font-size','8.5');xt.setAttribute('fill','#94a3b8');xt.textContent=(s.year%100)+"'"+mn;svg.appendChild(xt);});wrap.appendChild(svg);}
function drawGradeLine(wrapId,data,valFn,color,unit){var wrap=document.getElementById(wrapId);if(!wrap)return;var pts=data.map(function(s){return{v:valFn(s),s:s};}).filter(function(p){return p.v!=null;});if(pts.length<1){wrap.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--ink3);font-size:.82rem">데이터 없음</div>';return;}wrap.innerHTML='';var W=wrap.offsetWidth||320,H=200,PAD={l:34,r:14,t:22,b:26},cW=W-PAD.l-PAD.r,cH=H-PAD.t-PAD.b;var vals=pts.map(function(p){return p.v;}),maxV=Math.max.apply(null,vals),minV=Math.min.apply(null,vals);var yMin=Math.max(0,minV-2),yMax=maxV+2;if(yMax-yMin<4)yMax=yMin+4;function xP(i){return PAD.l+(pts.length<=1?cW/2:(i/(pts.length-1))*cW);}function yP(v){return PAD.t+((v-yMin)/(yMax-yMin))*cH;}var svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('width',W);svg.setAttribute('height',H);svg.style.cssText='display:block;overflow:visible';for(var g=0;g<=4;g++){var vv=yMin+(yMax-yMin)*g/4,y=yP(vv);var ln=document.createElementNS('http://www.w3.org/2000/svg','line');ln.setAttribute('x1',PAD.l);ln.setAttribute('x2',W-PAD.r);ln.setAttribute('y1',y);ln.setAttribute('y2',y);ln.setAttribute('stroke','rgba(0,0,0,.07)');ln.setAttribute('stroke-width','1');svg.appendChild(ln);var tx=document.createElementNS('http://www.w3.org/2000/svg','text');tx.setAttribute('x',PAD.l-4);tx.setAttribute('y',y+3);tx.setAttribute('text-anchor','end');tx.setAttribute('font-size','9');tx.setAttribute('fill','#94a3b8');tx.textContent=Math.round(vv);svg.appendChild(tx);}if(pts.length>=2){var d2='M '+xP(0)+','+yP(pts[0].v);pts.forEach(function(p,i){if(i>0)d2+=' L '+xP(i)+','+yP(p.v);});var path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d2);path.setAttribute('fill','none');path.setAttribute('stroke',color);path.setAttribute('stroke-width','2.5');path.setAttribute('stroke-linejoin','round');svg.appendChild(path);}pts.forEach(function(p,i){var x=xP(i),y=yP(p.v);var c=document.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','5');c.setAttribute('fill',color);c.setAttribute('stroke','#fff');c.setAttribute('stroke-width','2');svg.appendChild(c);var vt=document.createElementNS('http://www.w3.org/2000/svg','text');vt.setAttribute('x',x);vt.setAttribute('y',y-10);vt.setAttribute('text-anchor','middle');vt.setAttribute('font-size','10');vt.setAttribute('font-weight','700');vt.setAttribute('fill',color);vt.textContent=p.v;svg.appendChild(vt);var mn=p.s.month===11?'수능':p.s.month+'월';var xt=document.createElementNS('http://www.w3.org/2000/svg','text');xt.setAttribute('x',x);xt.setAttribute('y',H-6);xt.setAttribute('text-anchor','middle');xt.setAttribute('font-size','9');xt.setAttribute('fill','#94a3b8');xt.textContent=(p.s.year%100)+"'"+mn;svg.appendChild(xt);});wrap.appendChild(svg);}

// INIT
applyAllTheme();
pSec=(cfg.pf||70)*60;pBrk=(cfg.pb||10)*60;
if(!_pomoSaved){pCur=pSec;}else{
  pRun=false;
  var pb0=document.getElementById('pBtn');
  if(pb0&&pCur>0&&pCur<(pFocus?pSec:pBrk))pb0.textContent='▶ 계속';
  if(pSN>0){var dots0=document.querySelectorAll('.p-dot');for(var _di=0;_di<pSN&&_di<dots0.length;_di++)dots0[_di].classList.add('done');}
}
updatePUI();renderHomeSubjGrid();buildHm('hmHome');buildStreak();updateHome();renderHBet();renderDdayCard();renderProfUI();updatePomoSubjLabel();
startAlertSchedule();subscribeMockScores();

var _lastStudyDay=today();
var _lastCalDay=new Date().toDateString();
setInterval(function(){var td=today();if(td!==_lastStudyDay){_lastStudyDay=td;if(aId)stopSubj();reloadPlanForToday();updateHome();renderTL();buildHm('hmHome');buildStreak();if(todoOpenSubjId)renderTodoPanel();toast('새로운 하루가 시작되었습니다');}var cd=new Date().toDateString();if(cd!==_lastCalDay){_lastCalDay=cd;renderDdayCard();}buildHm('hmHome');buildStreak();var sp=document.getElementById('pg-stats');if(sp&&sp.classList.contains('on'))renderCal();},30000);

setInterval(function(){if(aId&&aStart){var hp=document.getElementById('pg-home');if(hp&&hp.classList.contains('on'))updateHome();var tp=document.getElementById('pg-timer');if(tp&&tp.classList.contains('on'))updatePlanStat();}var rp=document.getElementById('pg-room');if(rp&&rp.classList.contains('on')){var lp=document.getElementById('rp-live');if(lp&&lp.classList.contains('on')){try{renderMemberCards();}catch(e){}}}renderLiveTimeline();updatePomoSubjBadge();},1000);

setTimeout(checkJoinParam,1000);

window.addEventListener('beforeunload',function(){if(aId&&aStart)sess.push({subjectId:aId,color:(subjs.find(function(s){return s.id===aId;})||{}).color||'#888',start:aStart,end:Date.now()});localStorage.setItem('sg_s',JSON.stringify(subjs));svSess();localStorage.setItem('sg_c',JSON.stringify(ctr));localStorage.setItem('sg_f',JSON.stringify(frds));localStorage.setItem('sg_b',JSON.stringify(bets));localStorage.setItem('sg_p',JSON.stringify(prof));localStorage.setItem('sg_cfg',JSON.stringify(cfg));try{saveUserDataToFirebase();}catch(e){}});

setInterval(function(){svSess();saveUserDataToFirebase();},30000);
