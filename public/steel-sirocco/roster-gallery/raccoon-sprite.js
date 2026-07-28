// <raccoon-sprite> — animated top-down pixel-art raccoon mech (faction 8 · brown / taupe / sandy).
// Compact hunched quadruped: pointed snout, small round ears set wide, banded skull plating,
// four legs on dexterous five-digit hand-paws, and the signature THICK BUSHY RINGED TAIL.
// No face features (top-down view) — only plating seams, ear cups and shallow socket dimples.
// Layers: head / legsA / legsB / tail / frame
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=130,H=230;
const INK='#241813',HULL='#A1887F',HULL_L='#C4AFA4',HULL_S='#7A6258',
ARM='#5D4037',ARM_S='#3E2A22',ARM_H='#7B5344',
GRY='#8A7A70',GRY_S='#5F534C',
ACC='#F4A261',ACC_S='#C97F3E',
FUR='#D8C4B4',FUR_S='#A9927F',
BG='#454034',DOT='#3b382e',SHDW='#1A0E0A';
const cx=65;
// chunky pear torso [y0,y1,halfw] — widest at the hips, narrowing to the shoulders
const SP=[[48,56,17],[56,66,21],[66,78,25],[78,92,28],[92,108,30],[108,122,29],[122,134,24],[134,142,17]];
const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
class RaccoonSprite extends HTMLElement{
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
    let bob,swayX,tailS,st4;
    const ph=t*6.4;
    if(mode===0){bob=Math.round(Math.sin(t*2)*1);swayX=0;tailS=Math.sin(t*1.3)*4;st4=[0,0,0,0];}
    else{bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*3;
      this._scroll+=.5;
      const a=Math.round(Math.sin(ph)*6),b=Math.round(Math.sin(ph+Math.PI)*6);st4=[a,b,b,a];}
    if(stat){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+swayX+3,y0+bob+4,hw*2,y1-y0,SHDW);}
    // ---- legs: four limbs on dexterous five-digit hand-paws ----
    const leg=(s,baseY,stride,front,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=s>0?bx+hw+6:bx-hw-6-10;                             // block width 10 → exact mirror
      const pcx=x0+5, pcy=py+2, r=front?6:6.5;                     // round hand-pad
      for(let d=-r;d<=r;d++){const w=Math.round(Math.sqrt(Math.max(0,r*r-d*d)));if(w<=0)continue;
        R(pcx-w-1,pcy+d,w*2+2,1,INK);}
      for(let d=-r+1;d<=r-1;d++){const w=Math.round(Math.sqrt(Math.max(0,(r-1)*(r-1)-d*d)));if(w<=0)continue;
        R(pcx-w,pcy+d,w*2,1,d>r*.35?ARM_S:ARM);}
      for(const ko of[-5,-3,-1,1,3]){                              // five slim digits reaching forward
        R(pcx+ko,pcy-r-2,2,5,INK);R(pcx+ko,pcy-r-1,2,3,FUR);R(pcx+ko,pcy-r-1,2,1,GRY_S);}
      O(x0+2,py-13,6,15,ARM);R(x0+6,py-13,2,15,ARM_S);R(x0+2,py-13,1,15,ARM_H);   // lower limb
      R(x0+2,py-7,6,2,ARM_S);                                      // joint band
      O(s>0?bx+hw:bx-hw-11,baseY-17+oy,11,9,GRY);                  // shoulder / hip cap
      R(s>0?bx+hw+2:bx-hw-9,baseY-15+oy,7,2,GRY_S);
    };
    if(!HP('legsA')){leg(-1,80,st4[0],true,17);leg(1,80,st4[1],true,17);}
    if(!HP('legsB')){leg(-1,124,st4[2],false,19);leg(1,124,st4[3],false,19);}
    // ---- tail: thick bushy ringed tail — the signature ----
    if(!HP('tail')){
      const rx=cx+swayX, ty0=138;
      const pt=(f)=>{const y=ty0+f*44;
        return [rx+sym(tailS*f*.7), Math.round(y)+bob];};                 // straight centreline
      const thAt=(f)=>Math.round(15-Math.pow(f,1.25)*8)|1;                // odd widths → exact centring
      const N=44, yA=ty0+bob, yB=ty0+44+bob;
      const xAt=(f)=>rx+sym(tailS*f*.7);
      for(let y=yA;y<=yB;y++){const f=(y-yA)/44,th=thAt(f)+2;
        R(xAt(f)-((th/2)|0),y,th,1,INK);}                           // one row per y → no stale wider rows
      for(let y=yA;y<=yB;y++){const f=(y-yA)/44,th=thAt(f);
        const ring=Math.floor(f*9)%2===1;                           // five dark rings, edge to edge
        R(xAt(f)-((th/2)|0),y,th,1,ring?ARM:FUR);
        R(xAt(f)-((th/2)|0),y,2,1,ring?ARM_S:FUR_S);                // both edges shaded to match the row
        R(xAt(f)+((th/2)|0)-1,y,2,1,ring?ARM_S:FUR_S);}
      {const[tx,ty]=pt(1),cr=4;                                     // dark rounded tip
       for(let d=-cr;d<=cr;d++){const w=Math.round(Math.sqrt(Math.max(0,cr*cr-d*d)));if(w<=0)continue;
         R(tx-w,ty+d,w*2+1,1,INK);}
       for(let d=-3;d<=3;d++){const w=Math.round(Math.sqrt(Math.max(0,9-d*d)));if(w<=0)continue;
         R(tx-w,ty+d,w*2+1,1,ARM_S);}}
    }
    // ---- frame: hunched torso with plating seams ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-4+ox,y0+oy,4,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,4,y1-y0,HULL_S);}
      for(const y of[66,78,92,108,122])R(cx-18+ox,y+oy,37,1,HULL_S); // plating seams
      R(cx-3+ox,48+oy,7,92,ARM);R(cx-1+ox,48+oy,3,92,ARM_H);       // dorsal spine channel
      for(const[bx,by]of[[-16,72],[-13,88],[-15,102],[-12,118]]){   // fur stipple, mirrored pairs
        R(cx+bx+ox,by+oy,5,1,GRY_S);R(cx-bx-4+ox,by+oy,5,1,GRY_S);}
      O(cx-24+ox,60+oy,6,5,GRY);R(cx-23+ox,61+oy,4,2,ACC);         // shoulder vents
      O(cx+19+ox,60+oy,6,5,GRY);R(cx+20+ox,61+oy,4,2,ACC);
    }
    // ---- head: pointed snout, banded skull, small round ears ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*13)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=swayX+(mode?0:hb), hy=bob+(mode?hb:0);
      const HS=[[16,24,6],[24,32,11],[32,42,15],[42,50,15]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-3+hx,y0+hy,3,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,3,y1-y0,HULL_S);}
      // dark band across the skull — the mask, read as plating from above (under the ears)
      R(cx-14+hx,35+hy,29,3,ARM_S);R(cx-14+hx,35+hy,29,1,ARM);
      R(cx-14+hx,38+hy,29,1,GRY_S);
      // shallow socket dimples inside the band (no eye glow)
      for(const s of[-1,1]){const px2=(s>0?cx+sym(6):cx-sym(6))+hx;
        R(px2-1,36+hy,3,2,ARM);}
      // ears — pointed spars raking forward and out, drawn OVER the mask
      for(const s of[-1,1]){
        const bxw=(a,w)=>s>0?cx+a:cx-a-w+1;
        const e0=[12,42],e1=[16,37],n=6;
        for(let i=0;i<=n;i++){const u=i/n,th=Math.round(8-u*5),
          a=Math.round(e0[0]+(e1[0]-e0[0])*u)-((th/2)|0),y=Math.round(e0[1]+(e1[1]-e0[1])*u)-((th/2)|0);
          R(bxw(a,th)+hx,y+hy,th,th,INK);}
        for(let i=0;i<=n;i++){const u=i/n,th=Math.round(6-u*4),
          a=Math.round(e0[0]+(e1[0]-e0[0])*u)-((th/2)|0),y=Math.round(e0[1]+(e1[1]-e0[1])*u)-((th/2)|0);
          R(bxw(a,th)+hx,y+hy,th,th,u<.5?FUR:HULL_S);}
      }
      // snout: pale muzzle bridge + nose pad
      R(cx-3+hx,20+hy,7,10,FUR);R(cx-3+hx,20+hy,7,1,FUR_S);
      R(cx-2+hx,17+hy,5,3,INK);R(cx-1+hx,18+hy,3,2,ARM_S);         // nose
      for(const a of[-7,0,7]){const px2=cx+sym(a)+hx;R(px2-1,45+hy,3,1,HULL_S);}  // cheek seams
    }
  }
}
if(!customElements.get('raccoon-sprite'))customElements.define('raccoon-sprite',RaccoonSprite);
})();
