// <boar-sprite> — animated top-down pixel-art boar mech (faction 7 · ember orange / magenta).
// Quadruped chassis shared with the wolf/cougar, re-proportioned front-heavy: massive shoulder
// hump with a bristly mane ridge, narrow hindquarters, stubby legs on cloven hooves, broad snout
// disc flanked by big curving bone tusks. No face features (top-down view).
// Layers: head / legsA / legsB / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=140,H=200;
const INK='#262626',HULL='#E04A0A',HULL_L='#FF7A3D',HULL_S='#A63305',
ARM='#3A1520',ARM_S='#262626',ARM_H='#5A2030',GRY='#8A6A5A',GRY_S='#5A4038',
MAG='#FF006E',MAG_S='#B00048',TUSK='#EFE6DD',TUSK_S='#B8AC9E',
BG='#454034',DOT='#3b382e',SHDW='#1A1214';
const cx=70;
// front-heavy boar torso [y0,y1,halfw] — big shoulder hump, taper to small haunches
const SP=[[52,56,17],[56,62,21],[62,74,24],[74,86,22],[86,98,19],[98,110,17],[110,122,18],[122,132,15],[132,138,10]];
class BoarSprite extends HTMLElement{
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
    const ctx=this._ctx, ground=this.hasAttribute('ground');
    const attr=this.getAttribute('mode')||'idle';
    const hide=(this.getAttribute('hide')||'').split(',');
    const HP=(k)=>hide.indexOf(k)>=0;
    const t=performance.now()/1000;
    let mode=attr==='walk'?1:0;
    if(attr==='cycle'){if(t-this._last>4){this._mode=1-this._mode;this._last=t;}mode=this._mode;}
    const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const O=(x,y,w,h,c)=>{R(x-1,y-1,w+2,h+2,INK);R(x,y,w,h,c);};
    let bob,swayX,tailS,st4;
    if(mode===0){bob=Math.round(Math.sin(t*2)*1);swayX=0;tailS=Math.sin(t*1.4)*2;st4=[0,0,0,0];}
    else{const ph=t*7;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*1.5;
      this._scroll+=.55;
      const a=Math.round(Math.sin(ph)*6),b=Math.round(Math.sin(ph+Math.PI)*6);st4=[a,b,b,a];}
    if(this.hasAttribute('static')){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){
      const spans=[[26,10],[44,15],[58,21],[74,19],[98,15],[122,14],[138,6]];
      for(let i=0;i<spans.length-1;i++){const[y0,hw]=spans[i],[y1]=spans[i+1];
        if(HP('head')&&y1<=58)continue;R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    }
    // legs (stubby, cloven hooves — bottom layer)
    const leg=(s,baseY,stride,front,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+6:-(hw+10));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+4;
      const pw=front?10:9;
      O(x0-3,py-3,pw,8,ARM);R(x0-3,py+3,pw,2,ARM_S);                  // fetlock pad
      for(const c of[-2,2]){R(x0+c,py-7,3,5,GRY_S);R(x0+c,py-8,3,2,INK);}  // cloven hoof (two toes)
      O(x0,yTop-2,4,yH+2,ARM_S);                                      // shin
      O(bx+(s>0?hw+4:-(hw+9)),baseY-4+oy,5,8,GRY);                    // knee
      O(bx+(s>0?hw:-(hw+8)),baseY-3+oy,8,6,ARM);                      // thigh
      const j0=bx+(s>0?hw-3:-(hw-3)-8);
      O(j0,baseY-4+oy,8,9,GRY);R(j0+(s>0?6:1),baseY-2+oy,1,5,GRY_S);  // hip socket
    };
    if(!HP('legsA')){leg(-1,78,st4[0],true,24);leg(1,78,st4[1],true,24);}
    if(!HP('legsB')){leg(-1,118,st4[2],false,19);leg(1,118,st4[3],false,19);}
    // tail — one single coil of a corkscrew: a single helix revolution (sweeps right, then back left).
    // The half travelling away from the viewer is shaded darker, which is what makes it read as
    // going AROUND rather than just waving side to side.
    if(!HP('tail')){
      const cxs=cx+swayX, sy=139+bob, A=4.5, HT=13, N=34;
      R(cxs-1,137+bob,3,3,INK);R(cxs,137+bob,1,3,HULL);                  // stub at the rump
      const pt=(i)=>{const f=i/N, a=f*Math.PI*2;
        return [Math.round(cxs+Math.sin(a)*A+tailS*f*.5),Math.round(sy+f*HT),Math.cos(a)>=0];};
      for(let i=0;i<=N;i++){const[x,y]=pt(i);const th2=i>N*.8?1:3;const o=th2>1?1:0;
        R(x-o,y-o,th2,th2,INK);}                                         // outline, tapering at the tip
      for(let i=0;i<=N;i++){const[x,y,front]=pt(i);R(x,y,1,1,front?HULL:HULL_S);}
    }
    // torso
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      // bristly mane ridge over the shoulder hump
      R(cx-3+ox,52+oy,6,62,ARM);R(cx-3+ox,52+oy,2,62,ARM_H);
      for(let y=54;y<112;y+=5)R(cx-6+ox,y+oy,12,2,ARM_S);
      R(cx-2+ox,114+oy,4,24,ARM);R(cx-2+ox,114+oy,1,24,ARM_H);        // thinner spine aft
      for(const y of[86,98,110,122])R(cx-11+ox,y+oy,22,1,HULL_S);     // plating seams
      R(cx-19+ox,66+oy,6,4,MAG);R(cx-19+ox,68+oy,6,2,MAG_S);         // flank vents
      R(cx+13+ox,66+oy,6,4,MAG);R(cx+13+ox,68+oy,6,2,MAG_S);
      // shoulder pauldrons over the front legs only (the hump carries the armor)
      for(const s of[-1,1]){
        const ie=cx+ox+s*17, oe=cx+ox+s*29, L=Math.min(ie,oe), wdt=Math.abs(oe-ie);
        O(L,62+oy,wdt,16,ARM);R(L,62+oy,wdt,2,ARM_H);
        R(s>0?oe-2:oe,62+oy,2,16,ARM_S);
        for(let v=0;v<3;v++)R(L+3,67+v*4+oy,wdt-6,2,MAG);            // heat-vent slits
        O(s>0?oe:oe-3,68+oy,3,9,GRY_S);R(s>0?oe+1:oe-2,70+oy,1,5,MAG_S);
      }
    }
    // head
    if(!HP('head')){
      const hb=this.hasAttribute('static')?0:(mode?Math.round(Math.sin(t*14)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      O(cx-5+hx,46+hy,10,12,GRY_S);                                   // neck column
      O(cx-13+hx,43+hy,26,8,ARM);R(cx-14+hx,49+hy,28,3,ARM_S);        // heavy collar
      // ear nubs — small stepped triangles behind the skull
      for(const s of[-1,1]){const ex=cx+s*9+hx;
        O(ex-3,27+hy,6,4,HULL);O(ex-2,24+hy,4,3,HULL);
        R(ex-1,28+hy,2,2,ARM_S);}
      O(cx-11+hx,26+hy,22,18,HULL);R(cx+8+hx,26+hy,3,18,HULL_S);R(cx-11+hx,26+hy,1,18,HULL_L); // broad skull
      R(cx-1+hx,30+hy,2,13,ARM_S);                                    // crest seam
      // broad snout disc
      O(cx-8+hx,13+hy,16,14,HULL);R(cx+5+hx,13+hy,3,14,HULL_S);R(cx-8+hx,13+hy,1,14,HULL_L);
      R(cx-8+hx,13+hy,16,2,ARM_S);                                    // snout rim
      for(const c of[-4,2])R(cx+c+hx,16+hy,3,3,ARM_S);               // nostril slits
      R(cx-1+hx,20+hy,2,6,HULL_S);                                    // snout centre groove
      // tusks — erupt from the sides of the mouth, curving out then forward and up
      for(const s of[-1,1]){
        const half=(o,w)=>s>0?cx+hx+o:cx+hx-o-w+1;
        const TS=[[8,23,5,3],[10,20,4,3],[10,17,3,3],[9,15,2,2]];   // short stubby tusks, not bull horns
        for(const[o,y,w,h]of TS)R(half(o,w)-1,y+hy-1,w+2,h+2,INK);
        for(const[o,y,w,h]of TS)R(half(o,w),y+hy,w,h,TUSK);
        for(const[o,y,w,h]of TS)if(w>1)R(half(o,w)+(s>0?w-1:0),y+hy,1,h,TUSK_S);
      }
    }
  }
}
if(!customElements.get('boar-sprite'))customElements.define('boar-sprite',BoarSprite);
})();
