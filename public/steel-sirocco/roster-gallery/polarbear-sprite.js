// <polarbear-sprite> — animated top-down pixel-art polar bear mech (faction 3 · glacier blues).
// The faction heavy: massive broad hull, small round head with nub ears, thick stocky
// legs with big clawed paws, stub tail. Slow lumbering gait with a heavy shoulder roll.
// Layers: head / legsA / legsB / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=164,H=206;
const INK='#03045E',HULL='#CAF0F8',HULL_L='#EAFBFF',HULL_S='#93C9D8',
ARM='#0077B6',ARM_S='#02508A',ARM_H='#2B99D4',GRY='#5D89A8',GRY_S='#3A5F7D',
NOSE='#8B3A2E',NOSE_S='#5E2620',
BG='#454034',DOT='#3b382e',SHDW='#020338';
const cx=82;
// massive body spans [y0,y1,halfw] — true heavy: ~1.9:1 length-to-width
const SP=[[50,58,19],[58,72,25],[72,94,29],[94,120,30],[120,144,29],[144,166,25],[166,180,19]];
class PolarBearSprite extends HTMLElement{
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
    let bob,swayX,st4,wag;
    if(mode===0){bob=Math.round(Math.sin(t*1.4)*1);swayX=0;st4=[0,0,0,0];wag=0;}
    else{const ph=t*4.5;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*2);
      this._scroll+=.4;
      const a=Math.round(Math.sin(ph)*4),b=Math.round(Math.sin(ph+Math.PI)*4);st4=[a,b,b,a];wag=Math.round(Math.sin(ph)*1);}
    if(stat){bob=0;swayX=0;st4=[0,0,0,0];wag=0;}
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){
      const spans=[[18,7],[30,12],[46,15],[70,26],[110,30],[150,27],[168,22],[184,10],[190,5]];
      for(let i=0;i<spans.length-1;i++){const[y0,hw]=spans[i],[y1]=spans[i+1];if(HP('head')&&y1<=46)continue;R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    }
    // ---- legs (feet bottom layer): thick stumps, big clawed paws ----
    const leg=(s,baseY,stride,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+6:-(hw+16));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+4;
      O(x0-3,py-4,17,13,HULL);R(x0-3,py+7,17,2,HULL_S);
      for(let i=0;i<4;i++){const xc=x0-2+i*4;R(xc,py-7,3,3,GRY_S);R(xc+1,py-9,1,2,GRY_S);}
      O(x0+(s>0?3:-3),yTop-2,10,yH+2,HULL_S);
      O(bx+(s>0?hw-4:-(hw+10)),baseY-7+oy,14,14,GRY);
      const j0=bx+(s>0?hw-12:-(hw-12)-14);
      O(j0,baseY-7+oy,14,14,GRY);R(j0+(s>0?12:1),baseY-2+oy,1,8,GRY_S);
    };
    if(!HP('legsA')){leg(-1,66,st4[0],22);leg(1,66,st4[1],22);}
    if(!HP('legsB')){leg(-1,150,st4[2],22);leg(1,150,st4[3],22);}
    // ---- stub tail ----
    if(!HP('tail')){
      O(cx-4+wag+swayX,180+bob,8,7,HULL);
      R(cx+2+wag+swayX,180+bob,2,7,HULL_S);R(cx-4+wag+swayX,185+bob,8,2,HULL_S);
    }
    // ---- body ----
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      // spine channel — wide for the heavy frame
      R(cx-2+ox,50+oy,4,130,ARM);R(cx-2+ox,50+oy,1,130,ARM_H);
      // frost vents at the shoulders
      R(cx-18+ox,60+oy,6,3,ARM_H);R(cx-18+ox,62+oy,6,1,ARM_S);
      R(cx+12+ox,60+oy,6,3,ARM_H);R(cx+12+ox,62+oy,6,1,ARM_S);
      // hip discs
      O(cx-21+ox,142+oy,6,6,GRY);R(cx-19+ox,144+oy,2,2,ARM_H);
      O(cx+15+ox,142+oy,6,6,GRY);R(cx+17+ox,144+oy,2,2,ARM_H);
      // panel seams
      for(const y of[72,94,120,144,164])R(cx-18+ox,y+oy,36,1,HULL_S);
    }
    // ---- head: small, round, nub ears ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*9)*1):Math.round(Math.sin(t*1.1)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      // round nub ears first (skull overlaps bases)
      for(const s of[-1,1]){
        const ex=cx+s*13+(s>0?-2:-2)+hx;
        for(const[dy2,w2]of[[-1,4],[0,6],[1,6],[2,6],[3,6],[4,4]])R(ex-(w2-1)/2+1,37+dy2+hy,w2,1,INK);
        for(const[dy2,w2]of[[0,4],[1,4],[2,4],[3,4]])R(ex-(w2-1)/2+1,37+dy2+hy,w2,1,HULL);
        R(ex+1,39+hy,2,1,HULL_S);
      }
      const HS=[[16,22,7],[22,30,11],[30,42,13],[42,50,11]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // blunt nose
      R(cx-2+hx,13+hy,4,3,NOSE);R(cx-2+hx,15+hy,4,1,NOSE_S);
      // eye sockets: shadow recesses only, no dark pixels
      R(cx-8+hx,28+hy,2,2,HULL_S);R(cx-7+hx,30+hy,2,1,HULL_S);
      R(cx+6+hx,28+hy,2,2,HULL_S);R(cx+5+hx,30+hy,2,1,HULL_S);
      // muzzle seam
      R(cx-1+hx,33+hy,2,9,ARM_S);
    }
  }
}
if(!customElements.get('polarbear-sprite'))customElements.define('polarbear-sprite',PolarBearSprite);
})();
