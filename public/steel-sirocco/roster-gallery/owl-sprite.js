// <owl-sprite> — animated top-down pixel-art snowy-owl mech (faction 3 · glacier blues).
// Flight pose per reference: wide spread wings with separated finger primaries and
// barred snowy plumage, small body, fanned banded tail, tucked talons. Wings flap in
// BOTH idle (slow glide-beat) and walk (full wingbeats). Head swivels in idle and is
// gyro-stabilized (no bob) in walk. Layers: head / wings / legsA / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=170,H=134;
const INK='#03045E',HULL='#CAF0F8',HULL_L='#EAFBFF',HULL_S='#93C9D8',
ARM='#0077B6',ARM_S='#02508A',ARM_H='#2B99D4',GRY='#5D89A8',GRY_S='#3A5F7D',
BEAK='#8B3A2E',BEAK_S='#5E2620',FOOT='#E8853B',FOOT_S='#B75E22',
BG='#454034',DOT='#3b382e',SHDW='#020338';
const cx=85;
// small flight body [y0,y1,halfw]
const SP=[[44,50,11],[50,60,14],[60,70,15],[70,78,13],[78,84,9]];
class OwlSprite extends HTMLElement{
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
    if(!HP('head')){for(const[y,hw]of[[27,7],[33,11],[40,10]]){R(cx-hw+2,y+3,hw*2,8,SHDW);}}
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    // (wing + tail shadows are drawn inside their blocks, following the real geometry)
    // ---- wings (lowest layer, over nothing — body/tail paint above their roots) ----
    if(!HP('wings')){
      for(const s of[-1,1]){
        // leading edge: root → wrist → tip; trailing sweeps back to the flank
        const LR=[14,52],LW=[38,46+dy(.5)],LT=[62,50+dy(1)];
        const T3=[34,70+dy(.3)],TA=[14,64];
        const env=[LR,LW,T3,TA];
        const outAt=(y)=>{let xo=0;for(let j=0;j<env.length-1;j++){const[ax,ay]=env[j],[bx2,by2]=env[j+1];
          if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)xo=Math.max(xo,ax+(bx2-ax)*(y-ay)/(by2-ay));}return xo;};
        const lead=[LR,LW,LT];
        const innerAt=(y)=>{
          if(y>=LR[1]&&y<=TA[1])return 9;                        // flank contact: only this short band
          const line=y<LR[1]?lead:[TA,T3];                       // above: leading edge · below: trailing edge
          let xi=null;
          for(let j=0;j<line.length-1;j++){const[ax,ay]=line[j],[bx2,by2]=line[j+1];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01){const v=ax+(bx2-ax)*(y-ay)/(by2-ay);xi=xi===null?v:Math.min(xi,v);}}
          return xi===null?9:xi;
        };
        const yTop=Math.min(LW[1],LT[1])-2, yBot=72;
        for(let y=yTop;y<yBot;y+=3){const xi=Math.round(innerAt(y));const w=Math.max(0,Math.round(outAt(y))-xi);if(!w)continue;R(s>0?cx+xi-1:cx-xi-w,y+bob,w+2,3,INK);}
        for(let y=yTop;y<yBot;y+=3){const xi=Math.round(innerAt(y));const w=Math.max(0,Math.round(outAt(y))-xi-1);if(w<=0)continue;
          R(s>0?cx+xi:cx-xi-w+1,y+bob,w,3,HULL);
          // snowy barring: staggered dark dashes on alternating rows
          if(Math.floor(y/3)%2===1){
            const b1=xi+Math.round(w*.3),b2=xi+Math.round(w*.62),b3=xi+Math.round(w*.85);
            R(s>0?cx+b1:cx-b1-2,y+bob+1,3,1,ARM_S);
            R(s>0?cx+b2:cx-b2-2,y+bob,3,1,GRY);
            if(w>26)R(s>0?cx+b3:cx-b3-1,y+bob+1,2,1,ARM_S);
          }
        }
        // mirror-exact spars: positions computed in |x| space, then reflected
        const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
        const segS=(x0r,y0,x1r,y1,th,c)=>{const dx=x1r-x0r,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2);
          for(let i=0;i<=n;i++){const xa=sym(x0r+dx*i/n),y=Math.round(y0+dyy*i/n);R(cx+(s>0?xa:-xa)-o,y-o,th,th,c);}};
        const prim=[[62,46,1],[65,54,.97],[66,62,.93],[64,70,.88],[60,78,.8],[54,86,.7],[46,92,.58],[38,96,.45],[30,98,.35],[22,96,.25]];
        for(const[pxx,pyy,f]of prim)segS(LW[0],LW[1]+bob,pxx,pyy+dy(f)+bob,5,INK);
        for(const[pxx,pyy,f]of prim){
          const ty=pyy+dy(f)+bob;
          segS(LW[0],LW[1]+bob,pxx,ty,3,HULL_L);
          const bxa=sym(LW[0]+(pxx-LW[0])*.78), by2=Math.round(LW[1]+bob+(ty-LW[1]-bob)*.78);
          R(cx+(s>0?bxa:-bxa)-1,by2-1,3,2,GRY_S);                 // dark band
          const txa=sym(pxx);
          R(cx+(s>0?txa-1:-txa),ty-1,2,2,ARM_S);                  // dark tip
        }
        segS(LR[0],LR[1]+bob,LW[0],LW[1]+bob,3,HULL_S);           // leading-edge coverts
        segS(LW[0],LW[1]+bob,LT[0],LT[1]+bob,3,HULL_S);
        {const wxa=sym(LW[0]),jx=cx+(s>0?wxa:-wxa),jy=LW[1]+bob;
         for(const[dyy,w]of[[-3,3],[-2,5],[-1,7],[0,7],[1,7],[2,5],[3,3]])R(jx-(w-1)/2,jy+dyy,w,1,INK);
         for(const[dyy,w]of[[-2,3],[-1,5],[0,5],[1,5],[2,3]])R(jx-(w-1)/2,jy+dyy,w,1,GRY);
         R(jx,jy,1,1,GRY_S);} // wrist joint — round
      }
    }
    // ---- tail: banded feather fan ----
    if(!HP('tail')){
      const ox=swayX;
      // solid short feather fan: filled wedge + quill lines + band + scalloped dark edge
      for(let y=84;y<102;y++){const hw=5+Math.round((y-84)*7/18);R(cx-hw-1+ox,y+bob,hw*2+2,1,INK);}
      for(let y=84;y<102;y++){const hw=4+Math.round((y-84)*7/18);R(cx-hw+ox,y+bob,hw*2,1,HULL);R(cx+hw-2+ox,y+bob,2,1,HULL_S);}
      for(const k of[-2,-1,1,2])seg(cx+k*2+ox,86+bob,cx+k*5+ox,99+bob,1,GRY);      // quill separations
      for(const k of[-2,-1,0,1,2]){const by=99+(2-Math.abs(k))+bob;O(cx+k*5-2+ox,by,4,4,HULL);R(cx+k*5-2+ox,by+3,4,1,ARM_S);} // scalloped tips
    }
    // ---- talons: tucked beside the tail root ----
    if(!HP('legsA')){
      for(const[s,st]of[[-1,st2[0]],[1,st2[1]]]){
        const py=78+st+bob, x0=cx+s*6+(s>0?-2:-3);
        O(x0-1,py,5,4,FOOT);R(x0-1,py+3,5,1,FOOT_S);
        for(let i=0;i<3;i++)R(x0+i*2,py+4,1,2,FOOT_S);            // claws trail backward
      }
    }
    // ---- frame: small flight body over the wing roots ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      // snowy back barring
      for(const[bx,by]of[[-6,52],[3,58],[-2,64],[5,70]])R(cx+bx+ox,by+oy,3,1,GRY);
      R(cx-1+ox,44+oy,3,40,HULL_S);R(cx-1+ox,44+oy,1,40,HULL_L);  // spine quill line
    }
    // ---- head: round, tufted, gyro-level in walk ----
    if(!HP('head')){
      const hy=mode?0:bob;
      const HS=[[26,30,7],[30,38,11],[38,46,10]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2,y0+hy,2,y1-y0,HULL_S);R(cx-hw,y0+hy,1,y1-y0,HULL_L);}
      O(cx-9,23+hy,3,4,ARM);R(cx-8,21+hy,1,2,ARM);                // ear tufts
      O(cx+6,23+hy,3,4,ARM);R(cx+7,21+hy,1,2,ARM);
      // crown barring + speckles — no face features from the top-down view
      for(const[bx,by,w2]of[[-5,30,4],[3,32,3],[-3,36,4],[4,40,3]])R(cx+bx,by+hy,w2,1,GRY);
      R(cx-3,27+hy,2,1,GRY);R(cx+2,26+hy,2,1,GRY);
    }
  }
}
if(!customElements.get('owl-sprite'))customElements.define('owl-sprite',OwlSprite);
})();
