(()=>{
  if(window.__RAR_USAGE_MONITOR__) return; window.__RAR_USAGE_MONITOR__=1;

  const K='rar_usage_v11', U='rar_ui_v11', A='rar_alert_v11';
  const D={five:{percent:null,reset:'Unknown'},week:{percent:null,reset:'Unknown'},updated:null,status:'Waiting for valid sync…'};
  const UI={mode:'full',top:105,right:18,minutes:10,desktop:true,sound:true};

  let d={...D},ui={...UI},alerts={five:'normal',week:'normal'},root,body,status,mini,syncing=false,timer;

  const $=(s,p=document)=>p.querySelector(s);
  const wait=m=>new Promise(r=>setTimeout(r,m));
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  const esc=s=>String(s??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
  const level=p=>typeof p!=='number'?'unknown':p<20?'critical':p<35?'warning':'normal';
  const get=k=>new Promise(r=>chrome.storage.local.get(k,r));
  const set=o=>new Promise(r=>chrome.storage.local.set(o,r));

  async function load(){
    const x=await get([K,U,A]);
    d={...D,...x[K]};
    d.five={...D.five,...d.five};
    d.week={...D.week,...d.week};
    ui={...UI,...x[U]};
    alerts={five:'normal',week:'normal',...x[A]};

    // v1.1 could accidentally capture this widget's own text as the reset value.
    // Clean any obviously corrupted legacy value before rendering.
    for(const key of ['five','week']){
      if(typeof d[key].reset!=='string' || d[key].reset.length>32 || /Weekly limit|Updated:|Auto:/i.test(d[key].reset)){
        d[key].reset='Unknown';
      }
    }
    if(d.five.percent==null && d.week.percent==null && d.status==='Synced'){
      d.status='Waiting for valid sync…';
    }
  }

  const save=()=>set({[K]:d,[U]:ui,[A]:alerts});

  const row=(name,x)=>{
    let p=x?.percent,lv=level(p);
    return `<section class="rar-metric rar-${lv}">
      <div class="rar-head"><b><i></i>${name}</b><strong>${p==null?'Unknown':p+'% left'}</strong></div>
      <small class="rar-reset">Resets in ${esc(x?.reset||'Unknown')}</small>
      <div class="rar-bar"><span style="width:${p??0}%"></span></div>
    </section>`;
  };

  function render(){
    if(!root)return;
    root.style.top=ui.top+'px';
    root.style.right=ui.right+'px';
    root.dataset.mode=ui.mode;

    const levels=[level(d.five.percent),level(d.week.percent)];
    root.dataset.level=levels.includes('critical')?'critical':levels.includes('warning')?'warning':'normal';

    body.innerHTML=row('5-hour limit',d.five)+row('Weekly limit',d.week)+
      `<footer>Updated: ${d.updated?new Date(d.updated).toLocaleString():'Never'}<span>Auto: ${ui.minutes} min</span></footer>`;

    mini.innerHTML=`<b>RAR</b><span>5H <strong>${d.five.percent??'?'}%</strong></span><span>W <strong>${d.week.percent??'?'}%</strong></span>`;
    status.textContent=d.status;

    $('#rar-refresh',root).disabled=syncing;
    $('#rar-refresh',root).textContent=syncing?'…':'↻';
    $('#rar-mode',root).textContent=ui.mode==='mini'?'▣':'—';
  }

  function mount(){
    if($('#rar-chatgpt-usage-widget'))return;

    root=document.createElement('div');
    root.id='rar-chatgpt-usage-widget';
    root.innerHTML=`<div class="rar-card">
      <header id="rar-drag">
        <div class="rar-title">ChatGPT Usage</div>
        <div class="rar-mini"></div>
        <nav>
          <button id="rar-refresh" title="Sync usage">↻</button>
          <button id="rar-mode" title="Mini / full mode">—</button>
          <button id="rar-settings" title="Settings">⚙</button>
        </nav>
      </header>
      <div class="rar-status"></div>
      <main></main>
      <aside hidden>
        <label>Desktop alerts <input id="rar-desktop" type="checkbox"></label>
        <label>Sound alert <input id="rar-sound" type="checkbox"></label>
        <label>Auto refresh <select id="rar-mins">${[5,10,15,30].map(n=>`<option>${n}</option>`).join('')}</select></label>
        <small>Warning &lt;35% · Critical &lt;20%</small>
      </aside>
    </div>`;

    document.body.append(root);
    body=$('main',root);
    status=$('.rar-status',root);
    mini=$('.rar-mini',root);

    $('#rar-refresh',root).onclick=()=>sync(true);
    $('#rar-mode',root).onclick=async()=>{ui.mode=ui.mode==='mini'?'full':'mini';await save();render()};
    $('#rar-settings',root).onclick=()=>{
      let a=$('aside',root);
      a.hidden=!a.hidden;
      $('#rar-desktop',root).checked=ui.desktop;
      $('#rar-sound',root).checked=ui.sound;
      $('#rar-mins',root).value=ui.minutes;
    };
    $('#rar-desktop',root).onchange=async e=>{ui.desktop=e.target.checked;await save()};
    $('#rar-sound',root).onchange=async e=>{ui.sound=e.target.checked;await save()};
    $('#rar-mins',root).onchange=async e=>{ui.minutes=+e.target.value;await save();schedule();render()};

    drag($('#rar-drag',root));
    render();
  }

  function drag(h){
    let on=0,x=0,y=0,t=0,r=0;
    h.onmousedown=e=>{
      if(e.target.closest('button'))return;
      on=1;x=e.clientX;y=e.clientY;t=ui.top;r=ui.right;
      document.onmousemove=m=>{
        if(!on)return;
        ui.top=clamp(t+m.clientY-y,8,innerHeight-60);
        ui.right=clamp(r-m.clientX+x,8,innerWidth-100);
        root.style.top=ui.top+'px';
        root.style.right=ui.right+'px';
      };
      document.onmouseup=async()=>{
        on=0;
        document.onmousemove=document.onmouseup=null;
        await save();
      };
    };
  }

  // IMPORTANT: v1.1 searched the whole page, so it could "find" its own widget.
  // v1.1.1 only accepts the native ChatGPT Usage panel, identified by "Plan limits".
  function nativeUsageText(){
    const dialogs=[...document.querySelectorAll('[role="dialog"],[aria-modal="true"]')];
    for(const n of dialogs){
      if(root && root.contains(n)) continue;
      const s=n?.innerText||'';
      if(s.includes('Plan limits') && s.includes('5-hour limit') && s.includes('Weekly limit')) return s;
    }

    // Fallback for a future ChatGPT markup change where Settings is not role="dialog".
    const candidates=[...document.querySelectorAll('h1,h2,h3,h4,[role="heading"],div,span,p')]
      .filter(n=>(n.textContent||'').trim()==='Plan limits');

    for(const anchor of candidates){
      let n=anchor;
      for(let depth=0; n && depth<9; depth++, n=n.parentElement){
        if(root && root.contains(n)) break;
        const s=n.innerText||'';
        if(s.includes('5-hour limit') && s.includes('Weekly limit')) return s;
      }
    }
    return '';
  }

  function parseSection(s,label,nextLabel){
    const i=s.indexOf(label);
    if(i<0)return null;
    let end=nextLabel?s.indexOf(nextLabel,i+label.length):-1;
    if(end<0) end=Math.min(s.length,i+500);
    const b=s.slice(i,end);

    const p=b.match(/(\d{1,3})%\s*left/i);
    const r=b.match(/Resets in\s+((?:\d+\s*d(?:\s+\d+\s*h)?(?:\s+\d+\s*m)?)|(?:\d+\s*h(?:\s+\d+\s*m)?)|(?:\d+\s*m))/i);

    return {
      percent:p?clamp(+p[1],0,100):null,
      reset:r?r[1].replace(/\s+/g,' ').trim():'Unknown'
    };
  }

  async function notify(key,name,p,lv){
    let prev=alerts[key]||'normal',rank={normal:0,warning:1,critical:2,unknown:-1};
    if(rank[lv]>rank[prev]&&lv!=='normal'&&typeof p==='number'){
      if(ui.sound)tone(lv);
      if(ui.desktop)chrome.runtime.sendMessage({
        type:'RAR_USAGE_NOTIFY',
        level:lv,
        title:lv==='critical'?'ChatGPT usage critically low':'ChatGPT usage getting low',
        message:`${name}: ${p}% remaining.`
      });
    }
    alerts[key]=lv;
    await save();
  }

  function tone(lv){
    try{
      let C=window.AudioContext||window.webkitAudioContext,c=new C,o=c.createOscillator(),g=c.createGain();
      o.frequency.value=lv==='critical'?880:660;
      g.gain.value=.025;
      o.connect(g);g.connect(c.destination);
      o.start();o.stop(c.currentTime+.18);
      setTimeout(()=>c.close(),400);
    }catch{}
  }

  async function sync(manual=false){
    if(syncing)return;
    syncing=true;
    d.status=manual?'Opening native Usage…':'Checking native Usage…';
    render();

    const oldHash=location.hash||'';
    const alreadyOnUsage=oldHash.toLowerCase()==='#settings/usage';
    const oldDisplay=root?.style.display||'';

    // Hide our own widget while scanning so its labels can never be mistaken
    // for the native Usage panel.
    if(root) root.style.display='none';

    if(!alreadyOnUsage) location.hash='#settings/Usage';

    try{
      let s='';
      for(let i=0;i<30;i++){
        await wait(350);
        s=nativeUsageText();
        if(s)break;
      }

      if(!s) throw new Error('Native Usage panel not found');

      const f=parseSection(s,'5-hour limit','Weekly limit');
      const w=parseSection(s,'Weekly limit','Usage limit resets');

      if(!f || !w || (f.percent==null && w.percent==null)){
        throw new Error('Native Usage values not readable');
      }

      if(f)d.five=f;
      if(w)d.week=w;

      d.updated=Date.now();
      d.status=(d.five.percent!=null && d.week.percent!=null)?'Synced':'Partially synced';

      await notify('five','5-hour limit',d.five.percent,level(d.five.percent));
      await notify('week','Weekly limit',d.week.percent,level(d.week.percent));
      await save();
    }catch(err){
      console.warn('[RAR Usage Monitor v1.1.1]',err);
      d.status='Sync failed — open Settings › Usage once, then tap ↻';
      await save();
    }finally{
      if(!alreadyOnUsage){
        await wait(200);
        if(oldHash){
          location.hash=oldHash;
        }else{
          location.hash='';
          await wait(80);
          history.replaceState(null,'',location.pathname+location.search);
        }
      }

      if(root) root.style.display=oldDisplay;
      syncing=false;
      render();
    }
  }

  function schedule(){
    clearInterval(timer);
    timer=setInterval(()=>sync(false),clamp(ui.minutes,5,60)*60000);
  }

  (async()=>{
    await load();
    mount();
    schedule();
    setTimeout(()=>sync(false),2500);
    setInterval(mount,3000);
  })();
})();
