
(function(){
  var v=document.querySelector('.hero__video'),fb=document.querySelector('.video-fallback');
  if(v){
    v.addEventListener('playing',function(){fb.style.display='none'});
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){v.removeAttribute('autoplay');v.pause()}
    else{var pr=v.play();if(pr&&pr.catch)pr.catch(function(){})}
  }
  var px=document.querySelector('[data-parallax]');
  if(px&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    var tick=false;
    function par(){
      var r=px.parentNode.getBoundingClientRect(),vh=window.innerHeight;
      if(r.bottom>0&&r.top<vh){
        var mx=(px.offsetHeight-r.height)/2;
        var pr=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height)));
        var off=(pr*2-1)*mx;
        px.style.transform='translate3d(0,calc(-50% + '+off.toFixed(1)+'px),0)';
      }
      tick=false;
    }
    window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(par)}},{passive:true});
    window.addEventListener('resize',par);par();
  }
  (function(){
    var env=document.querySelector('.envelope');if(!env)return;
    var els=[].slice.call(env.querySelectorAll('.pc'));
    // sx/sy: scatter centre (fraction of half viewport width / viewport height, relative to envelope top)
    // ex/top: resting spot inside the envelope (px at 760px wide); sr/er rotation; ss/es scale; d: stagger delay
    var cfg=[
     {n:'edge',w:200,h:283,X:-0.4363,Y:-0.5111,s0:1.480,r0:-22,ex:-205.206,top:-594.763,er:-6.982,es:1.52,ex2:-149,top2:90,es2:1.4,d:0.0},
     {n:'stripes',w:200,h:283,X:-0.4163,Y:-0.3126,s0:1.480,r0:-22,ex:-200.5,top:-391,er:-8.2,es:1.48,ex2:-149,top2:90,es2:1.4,d:0.02},
     {n:'brief',w:200,h:283,X:-0.1632,Y:-0.1316,s0:1.480,r0:-21.5,ex:-130,top:-139,er:-5,es:1.48,ex2:-149,top2:90,es2:1.3,d:0.08},
     {n:'wamberal',w:200,h:283,X:0.0100,Y:-0.3126,s0:1.480,r0:-6,ex:101,top:-386,er:-2.5,es:1.48,ex2:-149,top2:90,es2:1.3,d:0.05},
     {n:'samuel',w:200,h:283,X:0.3368,Y:-0.4732,s0:1.480,r0:26,ex:75,top:-480,er:-3,es:1.48,ex2:-149,top2:90,es2:1.3,d:0.02},
     {n:'join',w:200,h:283,X:0.3074,Y:-0.3116,s0:1.480,r0:26,ex:45,top:-450,er:-12,es:1.3,ex2:-149,top2:90,es2:1.3,d:0},
     {n:'hodges',w:200,h:283,X:0.3632,Y:-0.2289,s0:1.650,r0:26,ex:212.657,top:-322.816,er:8.186,es:1.485,ex2:-149,top2:90,es2:1.3,d:0.12},
     {n:'jellis',w:270,h:190,X:-0.2347,Y:-0.3353,s0:1.230,r0:3,ex:-20,top:-150,er:0,es:1.3,ex2:-149,top2:90,es2:1.1,d:0.04},
     {n:'tindals',w:270,h:190,X:-0.1463,Y:-0.2921,s0:1.200,r0:-17.6,ex:-29.428,top:115.995,er:0.781,es:1.131,ex2:178,top2:46,es2:1.2,d:0.1},
     {n:'bridgewater',w:270,h:190,X:0.1058,Y:-0.3611,s0:1.230,r0:10,ex:-24.022,top:127.38,er:14.352,es:1.341,ex2:-165,top2:46,es2:1.23,d:0.06},
     {n:'latitude',w:200,h:283,X:0.0374,Y:-0.0921,s0:1.480,r0:7.8,ex:121.197,top:-172.164,er:2.89,es:1.49,ex2:147,top2:46,es2:1.48,d:0.14},
     {n:'easter',w:300,h:133,X:0.3237,Y:-0.1263,s0:1.100,r0:20,ex:80.323,top:132.336,er:-0.115,es:1.041,ex2:-149,top2:90,es2:1.0,d:0.16},
     {n:'yamba',w:300,h:133,X:-0.3247,Y:-0.1579,s0:1.100,r0:-7.6,ex:-118.5,top:-168,er:-2,es:1.15,ex2:-149,top2:90,es2:1.0,d:0.15},
     {n:'willow',w:200,h:283,X:0.1489,Y:-0.2074,s0:1.480,r0:16,ex:5.33,top:-285.021,er:6.087,es:1.501,ex2:-149,top2:54,es2:1.48,d:0.03}
    ];
    // stacking order measured from the reference (bridgewater/easter sit under their neighbours)
    var Z={edge:2,stripes:3,hodges:4,easter:5,bridgewater:6,brief:7,jellis:8,tindals:9,samuel:10,join:11,wamberal:12,latitude:13,yamba:14,edge:15,willow:16};els.forEach(function(el,i){el.style.zIndex=Z[cfg[i].n]});
    els.forEach(function(el,i){el.style.width=cfg[i].w+'px';el.style.height=cfg[i].h+'px'});
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function lerp(a,b,t){return a+(b-a)*t}
    function ease(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
    function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
    var queued=false,sev=null;
    var SPX=1.3,SPY=1.45,YM=-.33,EV0=1.45,EV1=.435,EV2=.205;
    function render(){
      queued=false;
      var vw=window.innerWidth,vh=window.innerHeight,s=env.offsetWidth/760;
      var sm=env.closest('.sample'),sr=sm.getBoundingClientRect(),evT=(sr.top+parseFloat(getComputedStyle(sm).paddingTop)+40)/vh;
      if(sev===null||reduce)sev=evT;sev+=(evT-sev)*.35;var ev=sev;
      var A=reduce?1:clamp((EV0-ev)/(EV0-EV1),0,1),B=reduce?1:clamp((EV1-ev)/(EV1-EV2),0,1),pre=reduce?0:clamp(ev-EV0,0,2.2);
      var hs=document.querySelector('.houses');
      if(hs){
        if(!hs._m){hs._m={b:hs.querySelector('.h-b'),w:hs.querySelector('.h-w'),t1:hs.querySelector('.h-t1'),t2:hs.querySelector('.h-t2')}}
        var hw=hs.offsetWidth;
        // houses slide outward from behind the envelope as the section scrolls in (0 = tucked in, 1 = resting spot)
        var hp=reduce?1:ease(clamp((1.0-ev)/(1.0-0.25),0,1)),qq=1-hp;
        hs._m.b.style.transform='translateX('+(qq*.035*hw).toFixed(1)+'px)';
        hs._m.w.style.transform='translateX('+(-qq*.035*hw).toFixed(1)+'px)';
        hs._m.t1.style.transform='translateX('+(qq*.025*hw).toFixed(1)+'px)';
        hs._m.t2.style.transform='translateX('+(-qq*.025*hw).toFixed(1)+'px)';
      }
      els.forEach(function(el,i){
        var c=cfg[i],ea=clamp((A-c.d)/(1-c.d),0,1),eb=clamp((B-c.d*.5)/(1-c.d*.5),0,1);
        var k=c.X<0?-1:1,dp=.12+(i%5)*.07;
        var x0=c.X*SPX*vw+k*pre*vw*.14*(1+dp),y0=(YM+(c.Y-YM)*SPY)*vw+pre*vh*(.2+dp),r0=c.r0+k*pre*14;
        var S1=c.es*s,S2=c.es2*s;
        var x1=c.ex*s,y1=c.top*s+c.h*S1/2,x2=c.ex2*s,y2=c.top2*s+c.h*S2/2;
        var x=lerp(lerp(x0,x1,ea),x2,eb),y=lerp(lerp(y0,y1,ea),y2,eb);
        var rot=lerp(lerp(r0,c.er,ea),0,eb),sc=lerp(lerp(c.s0*.9,S1,ea),S2,eb);
        el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px) translate(-50%,-50%) rotate('+rot.toFixed(2)+'deg) scale('+sc.toFixed(3)+')';
      });
      var pcs=env.querySelector('.pieces'),cb=B*B*B;
      pcs.style.clipPath=B<=0?'':'inset('+lerp(-1200,58*s,cb).toFixed(1)+'px '+lerp(-vw,50*s,cb).toFixed(1)+'px 3px '+lerp(-vw,49*s,cb).toFixed(1)+'px)';
      if(Math.abs(evT-sev)>.0004)q();else sev=evT;
    }
    function q(){if(!queued){queued=true;requestAnimationFrame(render)}}
    window.addEventListener('scroll',q,{passive:true});window.addEventListener('resize',q);render();
  })();

  (function(){
    var on=false,box=null;
    function draw(){
      var env=document.querySelector('.envelope'),pcs=[].slice.call(env.querySelectorAll('.pc'));
      if(!box){box=document.createElement('div');box.style.cssText='position:fixed;inset:0;z-index:999;pointer-events:none;font:11px/1.2 monospace';document.body.appendChild(box)}
      var er=env.getBoundingClientRect(),vw=window.innerWidth,html='';
      var R=pcs.map(function(p){var r=p.getBoundingClientRect();return {n:p.getAttribute('src').replace(/^.*\//,'').replace(/\..*$/,'').slice(0,12),l:r.left,t:r.top,w:r.width,h:r.height,cx:r.left+r.width/2,cy:r.top+r.height/2}});
      R.forEach(function(r,i){
        html+='<div style="position:absolute;left:'+r.l+'px;top:'+r.t+'px;width:'+r.w+'px;height:'+r.h+'px;outline:1px dashed #f0f"></div>';
        html+='<div style="position:absolute;left:'+(r.cx-2)+'px;top:'+(r.cy-2)+'px;width:5px;height:5px;background:#f0f"></div>';
        html+='<div style="position:absolute;left:'+(r.cx+6)+'px;top:'+(r.cy-6)+'px;background:#000;color:#fff;padding:1px 3px">'+(i+1)+' '+r.n+' ('+Math.round(r.cx-vw/2)+','+Math.round(r.cy-er.top)+')</div>';
        if(i){var q=R[i-1];html+='<svg style="position:absolute;left:0;top:0;width:100%;height:100%"><line x1="'+q.cx+'" y1="'+q.cy+'" x2="'+r.cx+'" y2="'+r.cy+'" stroke="#0af" stroke-width="1"/></svg>';
          html+='<div style="position:absolute;left:'+((q.cx+r.cx)/2)+'px;top:'+((q.cy+r.cy)/2)+'px;background:#0af;color:#000;padding:0 3px">'+Math.round(Math.hypot(r.cx-q.cx,r.cy-q.cy))+'px</div>'}
      });
      box.innerHTML=html;
    }
    function loop(){if(on){draw();requestAnimationFrame(loop)}else if(box){box.innerHTML=''}}
    window.addEventListener('keydown',function(e){if(e.key==='d'||e.key==='D'){on=!on;loop()}});
  })();
  (function(){
    var sec=document.querySelector('.sample');
    if(!sec||!('IntersectionObserver' in window)){if(sec)sec.classList.add('in-view');return}
    new IntersectionObserver(function(es){es.forEach(function(e){sec.classList.toggle('in-view',e.isIntersecting)})},{threshold:0.05}).observe(sec);
  })();
  var nav=document.querySelector('.nav');
  function onS(){nav.classList.toggle('scrolled',window.scrollY>40)}
  window.addEventListener('scroll',onS,{passive:true});onS();
  var b=document.querySelector('.burger'),m=document.getElementById('menu');
  b.addEventListener('click',function(){
    var o=m.classList.toggle('open');b.setAttribute('aria-expanded',o);
  });
  m.addEventListener('click',function(e){if(e.target.tagName==='A'){m.classList.remove('open');b.setAttribute('aria-expanded','false')}});
})();
