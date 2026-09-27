(()=>{
  if(window.__RAR_USAGE_MONITOR__) return; window.__RAR_USAGE_MONITOR__=1;

  const CURRENT_VERSION='1.2.0';
  const VERSION_URL='https://raw.githubusercontent.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor/main/version.json';
  const RELEASES_URL='https://github.com/ruhulaminrevens/RAR-ChatGPT-Usage-Monitor/releases';
  const K='rar_usage_v12', U='rar_ui_v12', A='rar_alert_v12', V='rar_version_v12';
  const D={five:{percent:null,reset:'Unknown'},week:{percent:null,reset:'Unknown'},updated:null,status:'Waiting for valid sync…'};
  const UI={mode:'full',top:105,right:18,minutes:10,visual:true,sound:true,updateChecks:true,autoNavigate:false};
  const VS={latest:CURRENT_VERSION,checked:0,status:'Not checked',url:RELEASES_URL};

  let d={...D},ui={...UI},alerts={five:'normal',week:'normal'},versionState={...VS};
  let root,body,status,mini,settings,syncing=false,timer,versionTimer,userActivated=!!navigator.userActivation?.hasBeenActive;

  const $=(s,p=document)=>p.querySelector(s);
  const wait=m=>new Promise(r=>setTimeout(r,m));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const level=p=>typeof p!=='number'?'unknown':p<20?'critical':p<35?'warning':'normal';
  const get=k=>new Promise(r=>chrome.storage.local.get(k,r));
  const set=o=>new Promise(r=>chrome.storage.local.set(o,r));

  document.addEventListener('pointerdown',()=>{userActivated=true},{capture:true,once:true});
  document.addEventListener('keydown',()=>{userActivated=true},{capture:true,once:true});

  async function load(){
    const x=await get([K,U,A,V,'rar_usage_v11','rar_ui_v11','rar_alert_v11']);
    const oldD=x[K]||x.rar_usage_v11;
    const oldUI=x[U]||x.rar_ui_v11;
    const oldA=x[A]||x.rar_alert_v11;
    d={...D,...oldD};
    d.five={...D.five,...d.five}; d.week={...D.week,...d.week};
    ui={...UI,...oldUI}; alerts={five:'normal',week:'normal',...oldA};
    versionState={...VS,...x[V]};
    for(const key of ['five','week']){
      if(typeof d[key].reset!=='string'||d[key].reset.length>32||/Weekly limit|Updated:|Auto:/i.test(d[key].reset)) d[key].reset='Unknown';
    }
    if(d.five.percent==null&&d.week.percent==null&&d.status==='Synced') d.status='Waiting for valid sync…';
  }

  const save=()=>set({[K]:d,[U]:ui,[A]:alerts,[V]:versionState});

  const row=(name,x)=>{
    const p=x?.percent,lv=level(p);
    return `<section class="rar-metric rar-${lv}">
      <div class="rar-head"><b><i></i>${name}</b><strong>${p==null?'Unknown':p+'% left'}</strong></div>
      <small class="rar-reset">Resets in ${esc(x?.reset||'Unknown')}</small>
      <div class="rar-bar"><span style="width:${p??0}%"></span></div>
    </section>`;
  };

  function updateAvailable(){return compareVersions(versionState.latest,CURRENT_VERSION)>0}

  function render(){
    if(!root)return;
    root.style.top=ui.top+'px'; root.style.right=ui.right+'px'; root.dataset.mode=ui.mode;
    const levels=[level(d.five.percent),level(d.week.percent)];
    root.dataset.level=levels.includes('critical')?'critical':levels.includes('warning')?'warning':'normal';
    const badge=updateAvailable()?`<button class="rar-update-badge" id="rar-open-update" title="Open latest release">v${esc(versionState.latest)} available ↗</button>`:'';
    body.innerHTML=row('5-hour limit',d.five)+row('Weekly limit',d.week)+
      `<div class="rar-footer"><span>Updated: ${d.updated?new Date(d.updated).toLocaleString():'Never'}</span><span>Auto: ${ui.minutes} min</span></div>${badge}`;
    mini.innerHTML=`<b>RAR</b><span>5H <strong>${d.five.percent??'?'}%</strong></span><span>W <strong>${d.week.percent??'?'}%</strong></span>${updateAvailable()?'<em title="Update available">●</em>':''}`;
    status.textContent=d.status;
    $('#rar-refresh',root).disabled=syncing; $('#rar-refresh',root).textContent=syncing?'…':'↻';
    $('#rar-mode',root).textContent=ui.mode==='mini'?'▣':'—';
    $('#rar-open-update',root)?.addEventListener('click',openRelease);
    renderVersionStatus();
  }

  function renderVersionStatus(){
    if(!root)return;
    const el=$('#rar-version-status',root); if(!el)return;
    const checked=versionState.checked?new Date(versionState.checked).toLocaleString():'Never';
    if(updateAvailable()) el.innerHTML=`<strong>Update available: v${esc(versionState.latest)}</strong><span>Checked ${esc(checked)}</span>`;
    else el.innerHTML=`<strong>v${CURRENT_VERSION} · ${esc(versionState.status)}</strong><span>Checked ${esc(checked)}</span>`;
  }

  function mount(){
    if($('#rar-chatgpt-usage-widget'))return;
    root=document.createElement('div'); root.id='rar-chatgpt-usage-widget';
    root.innerHTML=`<div class="rar-card">
      <div class="rar-header" id="rar-drag"><div class="rar-title">ChatGPT Usage</div><div class="rar-mini"></div><div class="rar-nav">
        <button class="rar-btn" id="rar-refresh" title="Sync usage">↻</button><button class="rar-btn" id="rar-mode" title="Mini / full mode">—</button><button class="rar-btn" id="rar-settings-toggle" title="Settings">⚙</button>
      </div></div>
      <div class="rar-status"></div><div class="rar-main"></div>
      <div class="rar-aside" hidden>
        <label class="rar-setting-row">On-screen alerts <input id="rar-visual" type="checkbox"></label>
        <label class="rar-setting-row">Sound alert <input id="rar-sound" type="checkbox"></label>
        <label class="rar-setting-row">Auto refresh <select id="rar-mins">${[5,10,15,30].map(n=>`<option>${n}</option>`).join('')}</select></label>
        <label class="rar-setting-row">Auto-open Usage <input id="rar-auto-nav" type="checkbox"></label>
        <label class="rar-setting-row">Version checks <input id="rar-updates" type="checkbox"></label>
        <div class="rar-version-tools"><button id="rar-check-update" class="rar-check-btn">Check now</button><button id="rar-release-page" class="rar-check-btn rar-secondary">Releases ↗</button></div>
        <div id="rar-version-status" class="rar-version-status"></div>
        <small>Warning &lt;35% · Critical &lt;20% · v${CURRENT_VERSION}</small>
      </div>
    </div>`;
    document.body.append(root); body=$('.rar-main',root); status=$('.rar-status',root); mini=$('.rar-mini',root); settings=$('.rar-aside',root);
    $('#rar-refresh',root).onclick=()=>sync(true);
    $('#rar-mode',root).onclick=async()=>{ui.mode=ui.mode==='mini'?'full':'mini';await save();render()};
    $('#rar-settings-toggle',root).onclick=()=>{settings.hidden=!settings.hidden;syncSettingsControls();renderVersionStatus()};
    $('#rar-visual',root).onchange=async e=>{ui.visual=e.target.checked;await save()};
    $('#rar-sound',root).onchange=async e=>{ui.sound=e.target.checked;await save(); if(ui.sound) tone('warning',true)};
    $('#rar-mins',root).onchange=async e=>{ui.minutes=+e.target.value;await save();schedule();render()};
    $('#rar-auto-nav',root).onchange=async e=>{ui.autoNavigate=e.target.checked;await save();render()};
    $('#rar-updates',root).onchange=async e=>{ui.updateChecks=e.target.checked;await save();scheduleVersionChecks()};
    $('#rar-check-update',root).onclick=()=>checkVersion(true);
    $('#rar-release-page',root).onclick=openRelease;
    drag($('#rar-drag',root)); syncSettingsControls(); render();
  }

  function syncSettingsControls(){
    if(!root)return;
    $('#rar-visual',root).checked=ui.visual; $('#rar-sound',root).checked=ui.sound; $('#rar-mins',root).value=ui.minutes; $('#rar-auto-nav',root).checked=!!ui.autoNavigate; $('#rar-updates',root).checked=ui.updateChecks;
  }

  function drag(h){
    let state=null;
    h.addEventListener('pointerdown',e=>{
      if(e.button!==0||e.target.closest('button'))return;
      state={id:e.pointerId,x:e.clientX,y:e.clientY,top:ui.top,right:ui.right};
      try{h.setPointerCapture(e.pointerId)}catch{}
      const move=m=>{
        if(!state||m.pointerId!==state.id)return;
        ui.top=clamp(state.top+m.clientY-state.y,8,Math.max(8,innerHeight-60));
        ui.right=clamp(state.right-m.clientX+state.x,8,Math.max(8,innerWidth-100));
        root.style.top=ui.top+'px';root.style.right=ui.right+'px';
      };
      const end=async m=>{
        if(!state||m.pointerId!==state.id)return;
        h.removeEventListener('pointermove',move);
        h.removeEventListener('pointerup',end);
        h.removeEventListener('pointercancel',end);
        try{h.releasePointerCapture(m.pointerId)}catch{}
        state=null;await save();
      };
      h.addEventListener('pointermove',move);
      h.addEventListener('pointerup',end);
      h.addEventListener('pointercancel',end);
    });
  }

  function nativeUsageText(){
    const hasLimits=s=>/5[\s-]*hour(?:\s+limit)?/i.test(s)&&/weekly(?:\s+limit)?/i.test(s);
    const dialogs=[...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')];
    for(const n of dialogs){
      if(root&&root.contains(n))continue;
      const s=n?.innerText||'';
      if(hasLimits(s))return s;
    }
    const candidates=[...document.querySelectorAll('h1,h2,h3,h4,[role="heading"]')]
      .filter(n=>/(plan\s+limits?|usage\s+limits?)/i.test((n.textContent||'').trim()));
    for(const anchor of candidates){
      let n=anchor;
      for(let depth=0;n&&depth<10;depth++,n=n.parentElement){
        if(root&&root.contains(n))break;
        const s=n.innerText||'';
        if(hasLimits(s))return s;
      }
    }
    return '';
  }

  function parseUsageText(s){
    const text=String(s||'').replace(/\r/g,'');
    const section=(startRe,endRe)=>{
      const m=startRe.exec(text);if(!m)return null;
      const start=m.index,endMatch=endRe.exec(text.slice(start+m[0].length));
      const end=endMatch?start+m[0].length+endMatch.index:Math.min(text.length,start+700);
      const b=text.slice(start,end);
      const p=b.match(/(\d{1,3}(?:\.\d+)?)\s*%\s*(?:left|remaining)?/i);
      const r=b.match(/(?:resets?|reset)\s+(?:in\s+)?([^\n]{1,40})/i);
      const reset=r?r[1].replace(/\s+/g,' ').trim().replace(/[·|].*$/,'').trim():'Unknown';
      return {percent:p?clamp(Math.round(+p[1]),0,100):null,reset:reset||'Unknown'};
    };
    return {
      five:section(/5[\s-]*hour(?:\s+limit)?/i,/weekly(?:\s+limit)?/i),
      week:section(/weekly(?:\s+limit)?/i,/(?:usage\s+limit\s+resets?|reset\s+history|available\s+resets?)/i)
    };
  }

  function isUserBusy(){
    const a=document.activeElement;
    if(!a)return false;
    return !!(a.matches?.('textarea,input,[contenteditable="true"]')||a.closest?.('[contenteditable="true"]'));
  }

  async function applyUsageText(s){
    const parsed=parseUsageText(s),f=parsed.five,w=parsed.week;
    if(!f||!w||(f.percent==null&&w.percent==null))throw new Error('Native Usage values not readable');
    if(f)d.five=f;if(w)d.week=w;
    d.updated=Date.now();d.status=(d.five.percent!=null&&d.week.percent!=null)?'Synced':'Partially synced';
    await notify('five','5-hour limit',d.five.percent,level(d.five.percent));
    await notify('week','Weekly limit',d.week.percent,level(d.week.percent));
    await save();
  }

  async function notify(key,name,p,lv){
    const prev=alerts[key]||'normal',rank={normal:0,warning:1,critical:2,unknown:-1};
    if(rank[lv]>rank[prev]&&lv!=='normal'&&typeof p==='number'){
      if(ui.sound)tone(lv,false);
      if(ui.visual)showToast(lv==='critical'?'ChatGPT usage critically low':'ChatGPT usage getting low',`${name}: ${p}% remaining.`,lv);
    }
    alerts[key]=lv;await save();
  }

  function showToast(title,message,lv='normal'){
    try{let old=$('.rar-toast',root);if(old)old.remove();const t=document.createElement('div');t.className='rar-toast rar-toast-'+lv;t.innerHTML=`<b>${esc(title)}</b><span>${esc(message)}</span>`;root.appendChild(t);requestAnimationFrame(()=>t.classList.add('rar-toast-show'));setTimeout(()=>{t.classList.remove('rar-toast-show');setTimeout(()=>t.remove(),220)},4200)}catch{}
  }

  function tone(lv,fromGesture){
    if(!ui.sound)return;
    const allowed=fromGesture||userActivated||navigator.userActivation?.hasBeenActive;if(!allowed)return;
    try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const c=new C();const play=()=>{const o=c.createOscillator(),g=c.createGain();o.frequency.value=lv==='critical'?880:660;g.gain.value=.025;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.16);setTimeout(()=>c.close().catch(()=>{}),400)};if(c.state==='suspended')c.resume().then(play).catch(()=>c.close().catch(()=>{}));else play()}catch{}
  }

  async function sync(manual=false){
    if(syncing)return;
    if(!manual&&(document.hidden||isUserBusy())){d.status='Cached · auto-sync deferred';render();return}

    const passive=nativeUsageText();
    if(passive){
      syncing=true;d.status='Reading Usage…';render();
      try{await applyUsageText(passive)}
      catch(err){console.warn('[RAR Usage Monitor v1.2.0]',err);d.status='Usage panel found, but values could not be read';await save()}
      finally{syncing=false;render()}
      return;
    }

    if(!manual&&!ui.autoNavigate){
      d.status=d.updated?'Cached · tap ↻ to sync':'Tap ↻ to sync';
      render();
      return;
    }

    syncing=true;d.status=manual?'Opening native Usage…':'Background sync…';render();
    const oldHash=location.hash||'',alreadyOnUsage=oldHash.toLowerCase()==='#settings/usage',oldDisplay=root?.style.display||'';
    if(root)root.style.display='none';
    try{
      let s='';
      if(!alreadyOnUsage){
        for(const route of ['#settings/Usage','#settings/usage']){
          location.hash=route;
          for(let i=0;i<12;i++){await wait(300);s=nativeUsageText();if(s)break}
          if(s)break;
        }
      }else s=nativeUsageText();
      if(!s){
        for(let i=0;i<8;i++){await wait(300);s=nativeUsageText();if(s)break}
      }
      if(!s)throw new Error('Native Usage panel not found');
      await applyUsageText(s);
    }catch(err){
      console.warn('[RAR Usage Monitor v1.2.0]',err);
      d.status='Sync failed · open Settings › Usage once, then tap ↻';
      await save();
    }finally{
      if(!alreadyOnUsage){
        await wait(120);
        if(oldHash)location.hash=oldHash;
        else{location.hash='';await wait(60);history.replaceState(null,'',location.pathname+location.search)}
      }
      if(root)root.style.display=oldDisplay;
      syncing=false;render();
    }
  }

  function compareVersions(a,b){
    const pa=String(a||'0').replace(/^v/,'').split('.').map(n=>parseInt(n,10)||0),pb=String(b||'0').replace(/^v/,'').split('.').map(n=>parseInt(n,10)||0);
    for(let i=0;i<Math.max(pa.length,pb.length);i++){const x=pa[i]||0,y=pb[i]||0;if(x>y)return 1;if(x<y)return -1}return 0;
  }

  async function checkVersion(manual=false){
    if(!ui.updateChecks&&!manual)return;
    const btn=root?$('#rar-check-update',root):null;if(btn){btn.disabled=true;btn.textContent='Checking…'}
    try{
      const r=await fetch(VERSION_URL,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);const info=await r.json();
      versionState.latest=String(info.version||CURRENT_VERSION).replace(/^v/,'');versionState.url=info.release_url||RELEASES_URL;versionState.checked=Date.now();versionState.status='Up to date';
      if(updateAvailable()){versionState.status='Update available';if(ui.visual)showToast('Update available',`RAR Usage Monitor v${versionState.latest} is available.`,'warning')}
      else if(manual&&ui.visual)showToast('Up to date',`You are using v${CURRENT_VERSION}.`,'normal');
      await save();render();
    }catch(err){versionState.checked=Date.now();versionState.status='Check failed';await save();renderVersionStatus();if(manual&&ui.visual)showToast('Version check failed','Could not reach the GitHub version file.','warning')}
    finally{if(btn){btn.disabled=false;btn.textContent='Check now'}}
  }

  function openRelease(){
    const url=versionState.url||RELEASES_URL;window.open(url,'_blank','noopener,noreferrer');
  }

  function schedule(){clearInterval(timer);timer=setInterval(()=>sync(false),clamp(ui.minutes,5,60)*60000)}
  function clampWidgetToViewport(){
    ui.top=clamp(ui.top,8,Math.max(8,innerHeight-60));
    ui.right=clamp(ui.right,8,Math.max(8,innerWidth-100));
    if(root){root.style.top=ui.top+'px';root.style.right=ui.right+'px'}
  }
  function scheduleVersionChecks(){
    clearInterval(versionTimer);if(!ui.updateChecks)return;versionTimer=setInterval(()=>checkVersion(false),12*60*60*1000);
    if(!versionState.checked||Date.now()-versionState.checked>6*60*60*1000)setTimeout(()=>checkVersion(false),8000);
  }

  (async()=>{
    await load();mount();schedule();scheduleVersionChecks();clampWidgetToViewport();
    setTimeout(()=>sync(false),2500);
    const observer=new MutationObserver(()=>{if(!document.getElementById('rar-chatgpt-usage-widget'))mount()});
    observer.observe(document.documentElement,{childList:true,subtree:true});
    addEventListener('resize',clampWidgetToViewport,{passive:true});
    document.addEventListener('visibilitychange',()=>{
      if(!document.hidden&&d.updated&&Date.now()-d.updated>clamp(ui.minutes,5,60)*60000)setTimeout(()=>sync(false),1200);
    });
  })();
})();
