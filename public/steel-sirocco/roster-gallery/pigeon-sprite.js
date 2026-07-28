// <pigeon-sprite> — animated top-down pixel-art pigeon mech (faction 7 · orange/magenta).
// Hawk flight chassis reworked to a pigeon: plump rounded body, BROAD wings with blunt
// rounded primaries (no raptor fingers), wide squared tail fan, small round head with a
// short stubby beak + cere, iridescent magenta nape band, pink tucked feet.
// Wings flap in BOTH idle (slow glide-beat) and walk (full wingbeats).
// No face features (top-down). Layers: head / wings / legsA / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=170,H=140;
const INK='#262626',HULL='#FF5400',HULL_L='#FF8A4C',HULL_S='#C43A00',
ARM='#FF006E',ARM_S='#8F003C',ARM_H='#FF5C9E',GRY='#8A3D1A',GRY_S='#5A2410',
FOOT='#FF006E',FOOT_S='#8F003C',
BG='#454034',DOT='#3b382e',SHDW='#1A0A05';
const cx=85;
// plump body [y0,y1,halfw] — full round chest, gentle taper to the tail root
const SP=[[42,46,7],[46,50,10],[50,62,11],[62,72,10],[72,80,7],[80,86,5]];
class PigeonSprite extends HTMLElement{
  connectedCallback(){
    if(this._cv) return;
    const root=this.attachShadow({mode:'open'});
    const st=document.createElement('style');
    st.textContent=':host{display:inline-block;height:100%}canvas{image-rendering:pixelated;height:100%;display:block}';
    root.appendChild(st);
    this._cv=document.createElement('canvas');this._cv.width=W;this._cv.height=H;
    root.appendChild(this._cv);
    this._ctx=this._cv.getContext('2d');
    this._scroll=0;this._mode=0;this._last=0;
    const loop=()=>{if(this.isConnected){this._draw();this._raf=requestAnimationFrame(loop);}};
    loop();
  }
  disconnectedCallback(){cancelAnimationFrame(this._raf);}
  _draw(){
    const ctx=this._ctx, ground=this.hasAttribute('ground'), stat=this.hasAttribute('static');
    const attr=this.getAttribute('mode')||'idle';
    const hide=(this.getAttribute('hide')||'').split(',');
    const HP=(k)=>hide.indexOf(k)>=0;
    const t=performance.now()/1000;
    let mode=attr==='walk'?1:0;
    if(attr==='cycle'){if(t-this._last>4){this._mode=1-this._mode;this._last=t;}mode=this._mode;}
    const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const O=(x,y,w,h,c)=>{R(x-1,y-1,w+2,h+2,INK);R(x,y,w,h,c);};
    const ph=t*5.5;
    let bob,swayX;
    if(mode===0){bob=Math.round(Math.sin(t*1.6)*1);swayX=0;}
    else{bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);this._scroll+=.5;}
    if(stat){bob=0;swayX=0;}
    // wingbeat: slow glide-beat in idle, full beats in walk
    const fla=stat?0:(mode?Math.sin(ph*1.1):Math.sin(t*2.2));
    const amp=mode?6:3;
    const dy=(f)=>Math.round(fla*amp*f);
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (body only — a head shadow only shows as a sliver)
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    // ---- wings: broad, blunt-tipped (lowest layer) ----
    if(!HP('wings')){
      for(const s of[-1,1]){
        const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
        const px=(o)=>cx+(s>0?sym(o):-sym(o));
        const segTap=(o0,y0,o1,y1,th0,th1,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1);
          for(let i=0;i<=n;i++){const th=Math.max(1,Math.round(th0+(th1-th0)*i/n)),o=Math.floor(th/2),x=px(o0+dx*i/n),y=Math.round(y0+dyy*i/n);R(x-o,y-o,th,th,c);}};
        const yAt=(pts,x)=>{for(let j=0;j<pts.length-1;j++){const[ax,ay]=pts[j],[bx2,by2]=pts[j+1];
          if(x>=Math.min(ax,bx2)&&x<=Math.max(ax,bx2)&&ax!==bx2)return ay+(by2-ay)*(x-ax)/(bx2-ax);}return null;};
        const wob=dy(1);
        // broad wing, chord tapering to a narrow blunt end
        const lead=[[9,50],[38,53+dy(.3)],[68,61+wob]];
        const trail=[[9,70],[32,77+dy(.4)],[54,73+dy(.7)],[68,66+wob]];
        const xIn=9,xOut=68;
        // broad rounded primaries fanning off the wing end — BEHIND the wing
        const FO=[52,63+dy(.5)];
        const quills=[[80,63,1],[77,71,.92],[71,78,.8],[62,84,.65]];
        for(const[fx,fy,ff]of quills)segTap(FO[0],FO[1]+bob,fx,fy+dy(ff)+bob,6,5,INK);
        for(const[fx,fy,ff]of quills){
          const ty=fy+dy(ff)+bob;
          segTap(FO[0],FO[1]+bob,fx,ty,4,4,HULL);                 // broad feather body
          const mx=FO[0]+(fx-FO[0])*.55, my=FO[1]+bob+(ty-FO[1]-bob)*.55;
          segTap(mx,my,fx,ty,3,3,HULL_S);                         // darker outer half
          R(px(fx)-1,ty-1,3,2,GRY_S);                             // blunt rounded tip
        }
        for(let x=xIn;x<=xOut;x++){const ty=yAt(lead,x),by=yAt(trail,x);if(ty==null||by==null)continue;
          const t0=Math.round(ty),b0=Math.round(by);if(b0<t0)continue;R(px(x),t0-1+bob,1,(b0-t0)+3,INK);}
        for(let x=xIn;x<=xOut;x++){const ty=yAt(lead,x),by=yAt(trail,x);if(ty==null||by==null)continue;
          const t0=Math.round(ty),b0=Math.round(by);if(b0<t0)continue;
          R(px(x),t0+bob,1,(b0-t0)+1,HULL_L);                     // pale secondaries
          R(px(x),t0+bob,1,Math.max(1,Math.round((b0-t0)*.25)),HULL_S);}  // leading coverts
        // two dark wing bars — the pigeon signature (the only marking on the membrane)
        for(const f of[.52,.74]){
          for(let x=13;x<=58;x++){const ty=yAt(lead,x),by=yAt(trail,x);if(ty==null||by==null)continue;
            const yy=ty+(by-ty)*f;R(px(x),Math.round(yy)+bob,1,2,GRY_S);}
        }
        for(let fx=14;fx<=62;fx+=8){const by=yAt(trail,fx);if(by==null)continue;R(px(fx),Math.round(by)+bob,1,1,INK);}   // subtle scalloped trailing edge
        {const jx=px(38),jy=Math.round(53+dy(.3))+bob;            // wrist knuckle
         R(jx-2,jy-2,5,4,INK);R(jx-1,jy-1,3,3,HULL_S);R(jx,jy,1,1,GRY);}
      }
    }
    // ---- tail: 8 blunt feathers, identical build to the outer wing primaries ----
    if(!HP('tail')){
      const ox=swayX, rx=cx+ox, TT=86;
      const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
      const feath=(o0,y0,o1,y1,th,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2);
        for(let i=0;i<=n;i++){const xa=sym(o0+dx*i/n),y=Math.round(y0+dyy*i/n);R(rx+xa-o,y-o,th,th,c);}};
      const TF=[[2,110],[6,108],[10,105],[13,100]];               // mirrored pairs → 8 rectrices
      for(const s of[-1,1])for(const[ao,ty]of TF)feath(0,TT+bob,s*ao,ty+bob,5,INK);        // outline
      for(const s of[-1,1])for(const[ao,ty]of TF)feath(0,TT+bob,s*ao,ty+bob,4,HULL);       // broad feather body
      for(const s of[-1,1])for(const[ao,ty]of TF){const mo=s*ao*.55,my=TT+bob+(ty-TT)*.55;
        feath(mo,my,s*ao,ty+bob,3,HULL_S);}                                                // darker outer half
      for(const s of[-1,1])for(const[ao,ty]of TF)R(rx+sym(s*ao)-1,ty-1+bob,3,2,GRY_S);     // blunt rounded tip
    }
    // ---- feet: pink, tucked beside the tail root ----
    if(!HP('legsA')){
      for(const s of[-1,1]){
        const py=80+bob, x0=s>0?cx+4:cx-8;                        // exact mirror about cx
        O(x0,py,5,4,FOOT);R(x0,py+3,5,1,FOOT_S);
        for(let i=0;i<3;i++)R(x0+i*2,py+4,1,2,FOOT_S);
      }
    }
    // ---- frame: plump body over the wing roots ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-2+ox,y0+oy,2,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,2,y1-y0,HULL_S);}
      // iridescent magenta nape band across the shoulders
      R(cx-8+ox,44+oy,17,3,ARM);R(cx-8+ox,44+oy,17,1,ARM_H);R(cx-8+ox,46+oy,17,1,ARM_S);
      // mantle speckles — mirrored pairs
      for(const[bx,by]of[[-5,56],[-4,68]]){R(cx+bx+ox,by+oy,3,1,GRY);R(cx-bx-2+ox,by+oy,3,1,GRY);}
      R(cx-1+ox,48+oy,3,38,HULL_S);R(cx+ox,48+oy,1,38,HULL_L);   // centered spine line
    }
    // ---- head: small round, stubby beak with a cere ----
    if(!HP('head')){
      const hy=mode?0:bob;
      const HS=[[32,36,4],[36,42,6],[42,47,5]];
      // short blunt beak (drawn first — head paints over its base)
      R(cx-2,28+hy,5,6,INK);
      R(cx-1,29+hy,3,5,GRY_S);                                   // dark horn
      R(cx,28+hy,1,2,GRY);                                       // blunt tip
      for(const[y0,y1,hw]of HS)R(cx-hw-1,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2,y0+hy,2,y1-y0,HULL_S);R(cx-hw,y0+hy,2,y1-y0,HULL_S);}
      R(cx-2,33+hy,5,2,HULL_L);                                  // pale cere knob at the beak base
      // crown plating seams — mirrored pairs
      for(const[bx,by]of[[-4,38],[-3,44]]){R(cx+bx,by+hy,3,1,GRY);R(cx-bx-2,by+hy,3,1,GRY);}
    }
  }
}
if(!customElements.get('pigeon-sprite'))customElements.define('pigeon-sprite',PigeonSprite);
})();
