// <hawk-sprite> — animated top-down pixel-art hawk mech (faction 4 · gold/purple raptor).
// Shape & features mirror the owl frame (shared bird chassis): wide spread wings with
// separated finger primaries and barred plumage, small body, fanned banded tail, tucked
// talons, tufted head. Wings flap in BOTH idle (slow glide-beat) and walk (full wingbeats).
// Head gyro-level in walk (no bob), no face from directly above. Layers: head/wings/legsA/tail/frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=170,H=134;
const INK='#240046',HULL='#FFC300',HULL_L='#FFE28A',HULL_S='#C6900A',
ARM='#FFD60A',ARM_S='#3D1466',ARM_H='#FFEC99',GRY='#4A2178',GRY_S='#240046',
FOOT='#FFD60A',FOOT_S='#B58900',
BG='#454034',DOT='#3b382e',SHDW='#1A0033';
const cx=85;
// sleek body [y0,y1,halfw] — rounded front shoulders, gentle symmetric taper to tail
const SP=[[44,46,6],[46,49,8],[49,60,9],[60,70,8],[70,78,6],[78,84,5]];
class HawkSprite extends HTMLElement{
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
    const seg=(x0,y0,x1,y1,th,c)=>{
      const dx=x1-x0,dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy),1),o=Math.floor(th/2);
      for(let i=0;i<=n;i++){const x=Math.round(x0+dx*i/n),y=Math.round(y0+dy*i/n);R(x-o,y-o,th,th,c);}
    };
    const ph=t*5.5;
    let bob,swayX,st2;
    if(mode===0){bob=Math.round(Math.sin(t*1.6)*1);swayX=0;st2=[0,0];}
    else{bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);
      this._scroll+=.5;
      st2=[Math.round(Math.sin(ph)*2),Math.round(Math.sin(ph+Math.PI)*2)];}
    if(stat){bob=0;swayX=0;st2=[0,0];}
    // wingbeat: slow glide-beat in idle, full beats in walk; tips travel most
    const fla=stat?0:(mode?Math.sin(ph*1.1):Math.sin(t*2.2));
    const amp=mode?6:3;
    const dy=(f)=>Math.round(fla*amp*f);
    // no head swivel: the face is not visible from directly above
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('head')){for(const[y,hw]of[[30,4],[35,6],[41,5]]){R(cx-hw+2,y+3,hw*2,8,SHDW);}}
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    // (wing + tail shadows are drawn inside their blocks, following the real geometry)
    // ---- wings (lowest layer, over nothing — body/tail paint above their roots) ----
    if(!HP('wings')){
      for(const s of[-1,1]){
        // mirror helpers: work in |x|-offset space, reflect per side (sign-symmetric)
        const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
        const px=(o)=>cx+(s>0?sym(o):-sym(o));
        const segTap=(o0,y0,o1,y1,th0,th1,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1);
          for(let i=0;i<=n;i++){const th=Math.max(1,Math.round(th0+(th1-th0)*i/n)),o=Math.floor(th/2),x=px(o0+dx*i/n),y=Math.round(y0+dyy*i/n);R(x-o,y-o,th,th,c);}};
        const yAt=(pts,x)=>{for(let j=0;j<pts.length-1;j++){const[ax,ay]=pts[j],[bx2,by2]=pts[j+1];
          if(x>=Math.min(ax,bx2)&&x<=Math.max(ax,bx2)&&ax!==bx2)return ay+(by2-ay)*(x-ax)/(bx2-ax);}return null;};
        const wob=dy(1);                                          // wingtip flap travel
        // broad shallow wing: leading (top) & trailing (bottom) edges, body(8) → tip(74)
        const lead=[[8,50],[40,53+dy(.3)],[74,56+wob]];
        const trail=[[8,66],[34,72+dy(.4)],[58,69+dy(.7)],[74,56+wob]];
        const xIn=8,xOut=74;
        // dark fingered primaries splaying wide & back off the wingtip — BEHIND the wing
        const FO=[52,56+dy(.5)];
        const fingers=[[80,60,1],[81,68,.9],[77,75,.78],[68,80,.62],[57,82,.45]];
        for(const[fx,fy,ff]of fingers)segTap(FO[0],FO[1]+bob,fx,fy+dy(ff)+bob,5,2,INK);
        for(const[fx,fy,ff]of fingers){
          const ty=fy+dy(ff)+bob;
          segTap(FO[0],FO[1]+bob,fx,ty,3,1,HULL_L);               // pale base
          const mx=FO[0]+(fx-FO[0])*.42, my=FO[1]+bob+(ty-FO[1]-bob)*.42;
          segTap(mx,my,fx,ty,2,1,ARM_S);                          // dark outer finger
          R(px(fx),ty-1,1,2,INK);                                 // sharp dark tip
        }
        for(let x=xIn;x<=xOut;x++){const ty=yAt(lead,x),by=yAt(trail,x);if(ty==null||by==null)continue;
          const t0=Math.round(ty),b0=Math.round(by);if(b0<t0)continue;R(px(x),t0-1+bob,1,(b0-t0)+3,INK);}         // outline
        for(let x=xIn;x<=xOut;x++){const ty=yAt(lead,x),by=yAt(trail,x);if(ty==null||by==null)continue;
          const t0=Math.round(ty),b0=Math.round(by);if(b0<t0)continue;
          R(px(x),t0+bob,1,(b0-t0)+1,HULL_L);                     // pale secondaries fill
          R(px(x),t0+bob,1,Math.max(1,Math.round((b0-t0)*.4)),HULL_S);} // darker leading-edge coverts
        const segF=(o0,y0,o1,y1,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1);for(let i=0;i<=n;i++)R(px(o0+dx*i/n),Math.round(y0+dyy*i/n)+bob,1,1,c);};
        for(let fx=14;fx<=68;fx+=5){const ty=yAt(lead,fx),by=yAt(trail,fx-3);if(ty==null||by==null)continue;segF(fx,ty+2,fx-3,by-1,GRY);}   // feather shafts all along
        for(let fx=13;fx<=70;fx+=5){const by=yAt(trail,fx);if(by==null)continue;R(px(fx),Math.round(by)+bob,1,2,INK);}                        // scalloped trailing edge
        {const jx=px(40),jy=Math.round(53+dy(.3))+bob;           // wrist joint knuckle on the leading edge
         R(jx-2,jy-2,5,4,INK);R(jx-1,jy-1,3,3,HULL_S);R(jx,jy,1,1,GRY);}
      }
    }
    // ---- tail: compact rounded feather fan ----
    if(!HP('tail')){
      const ox=swayX, rx=cx+ox, TT=84, TB=102, span=TB-TT;
      const hwAt=(y)=>{const d=y-TT;return d>span-3?Math.max(2,8-(d-(span-3))*2):2+d*6/(span-3);}; // widen→rounded tip
      for(let y=TT;y<=TB;y++){const hw=Math.round(hwAt(y));R(rx-hw-1,y+bob,hw*2+2,1,INK);}          // outline
      for(let y=TT;y<TB;y++){const hw=Math.round(hwAt(y));
        R(rx-hw,y+bob,hw*2,1,HULL_L);                                                               // pale fill
        R(rx-1,y+bob,2,1,HULL_S);}                                                                  // central shaft
      for(const k of[-6,-3,3,6])for(let y=TT+2;y<TB-2;y+=2){if(Math.abs(k)<Math.round(hwAt(y)))R(rx+k,y+bob,1,1,GRY);} // feather divisions
      // dark feather tips traced along the real bottom contour (never detached)
      for(let xo=-8;xo<=8;xo++){let edgeY=-1;
        for(let y=TT+2;y<TB;y++){if(Math.abs(xo)<Math.round(hwAt(y)))edgeY=y;}
        if(edgeY>=0){R(rx+xo,edgeY+bob,1,1,INK);if((xo+8)%2===0)R(rx+xo,edgeY-1+bob,1,1,ARM_S);}}
    }
    // ---- talons: tucked beside the tail root ----
    if(!HP('legsA')){
      for(const s of[-1,1]){
        const py=78+bob, x0=s>0?cx+4:cx-8;                       // exact mirror about cx
        O(x0,py,5,4,FOOT);R(x0,py+3,5,1,FOOT_S);
        for(let i=0;i<3;i++)R(x0+i*2,py+4,1,2,FOOT_S);           // claws trail backward
      }
    }
    // ---- frame: small flight body over the wing roots ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-2+ox,y0+oy,2,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,2,y1-y0,HULL_S);}  // symmetric edge shading
      // dark back barring — mirrored pairs
      for(const[bx,by]of[[-4,56],[-3,68]]){R(cx+bx+ox,by+oy,3,1,GRY);R(cx-bx-2+ox,by+oy,3,1,GRY);}
      R(cx-1+ox,44+oy,3,40,ARM);R(cx+ox,44+oy,1,40,ARM_H);       // centered bright spine line
    }
    // ---- head: round, tufted, gyro-level in walk ----
    if(!HP('head')){
      const hy=mode?0:bob;
      const HS=[[32,36,4],[36,41,6],[41,46,5]];
      // small hooked raptor beak (drawn first — head paints over its base)
      R(cx-2,29+hy,5,4,INK);R(cx-1,25+hy,3,5,INK);   // outline wedge
      R(cx-1,29+hy,3,3,HULL_S);                       // amber body
      R(cx,25+hy,1,5,ARM_S);R(cx,24+hy,1,2,ARM_S);   // ridge + dark hooked tip
      for(const[y0,y1,hw]of HS)R(cx-hw-1,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2,y0+hy,2,y1-y0,HULL_S);R(cx-hw,y0+hy,2,y1-y0,HULL_S);}  // symmetric edge shading
      // crown barring — mirrored pairs
      for(const[bx,by]of[[-4,34],[-3,40]]){R(cx+bx,by+hy,3,1,GRY);R(cx-bx-2,by+hy,3,1,GRY);}
    }
  }
}
if(!customElements.get('hawk-sprite'))customElements.define('hawk-sprite',HawkSprite);
})();
