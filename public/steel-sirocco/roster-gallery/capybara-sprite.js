// <capybara-sprite> — animated top-down pixel-art capybara mech (faction 10 · VAST tan / deep navy).
// Quadruped chassis shared with the wolf/boar/cougar, re-proportioned REAR-heavy: narrow shoulders
// widening to massive haunches, blunt rounded rump, very short stubby legs on webbed semi-aquatic
// feet, broad blunt skull with a big squared muzzle, small round ears set high and back. Vestigial
// tail (none drawn). Coarse bristly fur stippling. No face features (top-down view).
// Layers: head / legsA / legsB / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=150,H=200;
const INK='#1A2530',HULL='#D4B996',HULL_L='#EDE6DD',HULL_S='#A8906C',
ARM='#003049',ARM_S='#001E30',ARM_H='#0A4A6E',GRY='#8A7A66',GRY_S='#5C4F40',
BONE='#EDE6DD',BONE_S='#B8AC9E',
BG='#454034',DOT='#3b382e',SHDW='#0A1520';
const cx=75;
// rear-heavy barrel torso [y0,y1,halfw] — narrow shoulders swelling to big haunches, blunt rump
const SP=[[54,62,25],[62,74,28],[74,92,30],[92,112,31],[112,132,30],[132,144,26],[144,152,18]];
class CapybaraSprite extends HTMLElement{
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
    let bob,swayX,st4;
    if(mode===0){bob=Math.round(Math.sin(t*1.8)*1);swayX=0;st4=[0,0,0,0];}
    else{const ph=t*6;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);
      this._scroll+=.45;
      const a=Math.round(Math.sin(ph)*5),b=Math.round(Math.sin(ph+Math.PI)*5);st4=[a,b,b,a];}
    if(stat){bob=0;swayX=0;st4=[0,0,0,0];}
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){
      const spans=[[24,15],[42,18],[62,28],[92,31],[132,30],[144,24],[152,9]];
      for(let i=0;i<spans.length-1;i++){const[y0,hw]=spans[i],[y1]=spans[i+1];
        if(HP('head')&&y1<=58)continue;R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    }
    // legs — very short and stubby, ending in webbed feet (bottom layer)
    const leg=(s,baseY,stride,front,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+5:-(hw+9));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+3;
      const pw=front?13:14;
      // webbed foot: three blunt toes with membrane filling the gaps
      R(x0-5,py-2,pw+2,8,INK);
      R(x0-4,py-1,pw,6,GRY);                                         // web membrane
      for(let i=0;i<3;i++){const tx=x0-4+i*5;
        R(tx,py-6,4,7,INK);R(tx+(s>0?0:1),py-5,3,6,HULL);            // toe
        R(tx+(s>0?0:1),py-5,3,2,BONE_S);}                            // blunt nail
      R(x0-4,py+3,pw,2,GRY_S);                                       // shaded heel
      O(x0,yTop-2,6,yH+2,ARM_S);                                     // short shin
      O(bx+(s>0?hw+3:-(hw+9)),baseY-3+oy,6,8,GRY);                   // ankle
      O(bx+(s>0?hw-1:-(hw+8)),baseY-3+oy,9,7,ARM);                   // thigh
      const j0=bx+(s>0?hw-4:-(hw-4)-8);
      O(j0,baseY-4+oy,8,9,GRY);R(j0+(s>0?6:1),baseY-2+oy,1,5,GRY_S); // hip socket
    };
    if(!HP('legsA')){leg(-1,86,st4[0],true,29);leg(1,86,st4[1],true,29);}
    if(!HP('legsB')){leg(-1,128,st4[2],false,30);leg(1,128,st4[3],false,30);}
    // torso
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      R(cx-3+ox,54+oy,6,96,ARM);R(cx-3+ox,54+oy,2,96,ARM_H);          // dorsal spine channel
      // coarse bristly fur stippling across the back
      for(let y=66;y<146;y+=6){for(const c of[-21,-13,10,18])R(cx+c+ox,y+oy,3,1,HULL_S);
        for(const c of[-16,14])R(cx+c+ox,y+3+oy,2,1,GRY_S);}
      for(const y of[74,92,112,132])R(cx-15+ox,y+oy,30,1,HULL_S);      // plating seams
      R(cx-29+ox,78+oy,6,5,ARM);R(cx-29+ox,81+oy,6,2,ARM_S);          // flank intakes
      R(cx+23+ox,78+oy,6,5,ARM);R(cx+23+ox,81+oy,6,2,ARM_S);
      R(cx-30+ox,116+oy,6,5,ARM);R(cx-30+ox,119+oy,6,2,ARM_S);
      R(cx+24+ox,116+oy,6,5,ARM);R(cx+24+ox,119+oy,6,2,ARM_S);
      // haunch armor plates over the big rear legs
      for(const s of[-1,1]){
        const ie=cx+ox+s*24, oe=cx+ox+s*36, L=Math.min(ie,oe), wdt=Math.abs(oe-ie);
        O(L,112+oy,wdt,18,ARM);R(L,112+oy,wdt,2,ARM_H);
        R(s>0?oe-2:oe,112+oy,2,18,ARM_S);
        for(let v=0;v<3;v++)R(L+3,117+v*4+oy,wdt-6,2,BONE_S);
      }
      O(cx-9+ox,146+oy,6,5,GRY);O(cx+3+ox,146+oy,6,5,GRY);            // rump bolts (vestigial tail — none)
    }
    // head
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*12)*1):Math.round(Math.sin(t*1.1)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      O(cx-7+hx,46+hy,14,10,GRY_S);                                  // thick neck column
      O(cx-17+hx,42+hy,34,7,ARM);R(cx-18+hx,47+hy,36,3,ARM_S);        // collar
      // small round ears, high and set back on the skull
      for(const s of[-1,1]){const ex=cx+s*14+hx;
        for(const[d,w]of[[0,7],[-1,7],[-2,5],[-3,3]])R(ex-((w/2)|0)-1,28+d+hy,w+2,1,INK);
        for(const[d,w]of[[0,7],[-1,7],[-2,5]])R(ex-((w/2)|0),28+d+hy,w,1,HULL);
        R(ex-1,28+hy,2,1,GRY_S);}                                     // inner ear shading
      O(cx-15+hx,23+hy,30,21,HULL);R(cx+11+hx,23+hy,4,21,HULL_S);R(cx-15+hx,23+hy,1,21,HULL_L); // broad blunt skull
      R(cx-1+hx,27+hy,2,17,ARM_S);                                    // crest seam
      for(const s of[-1,1]){const dx2=cx+s*8+hx;                      // eye sockets — shallow dimples only
        R(dx2-(s>0?0:2),30+hy,3,2,HULL_S);R(dx2-(s>0?0:2),31+hy,3,1,GRY_S);}
      // big squared muzzle
      O(cx-11+hx,8+hy,22,16,HULL);R(cx+8+hx,8+hy,3,16,HULL_S);R(cx-11+hx,8+hy,1,16,HULL_L);
      R(cx-11+hx,8+hy,22,2,ARM_S);                                    // muzzle rim
      for(const c of[-6,3])R(cx+c+hx,11+hy,3,4,ARM_S);                // nostril slits
      R(cx-1+hx,16+hy,2,8,HULL_S);                                    // philtrum groove
    }
  }
}
if(!customElements.get('capybara-sprite'))customElements.define('capybara-sprite',CapybaraSprite);
})();
