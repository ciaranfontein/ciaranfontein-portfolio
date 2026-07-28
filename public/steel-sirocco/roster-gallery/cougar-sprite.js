// <cougar-sprite> — animated top-down pixel-art cougar mech (faction 4 · tawny gold / purple).
// Quadruped chassis shared with the wolf: broad shoulders + haunches, narrow waist, but sleeker
// with rounded cat ears, a short muzzle, and a long heavy tail. Layers: head/legsA/legsB/tail/frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=140,H=210;
const INK='#2B0A3D',HULL='#E0A94E',HULL_L='#F5C878',HULL_S='#AE7C2C',
ARM='#4A2178',ARM_S='#2E0F4D',ARM_H='#6B3A9E',GRY='#8A7A9E',GRY_S='#5A4A6E',
AMB='#FFD60A',AMB_S='#B58900',TEAL='#B497D6',TEAL_S='#7D5AA8',
BG='#454034',DOT='#3b382e',SHDW='#2A2233';
const cx=70;
const SP=[[52,54,13],[54,56,15],[56,60,17],[60,70,19],[70,78,16],[78,92,13],[92,104,13],[104,112,16],[112,126,17],[126,134,14],[134,140,10]];
class CougarSprite extends HTMLElement{
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
    if(mode===0){bob=Math.round(Math.sin(t*2)*1);swayX=0;tailS=Math.sin(t*1.4)*3;st4=[0,0,0,0];}
    else{const ph=t*7;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*2;
      this._scroll+=.55;
      const a=Math.round(Math.sin(ph)*7),b=Math.round(Math.sin(ph+Math.PI)*7);st4=[a,b,b,a];}
    if(this.hasAttribute('static')){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
if(!HP('frame')){
    const spans=[[26,10],[44,17],[58,21],[78,17],[104,20],[134,14],[142,6]];
    for(let i=0;i<spans.length-1;i++){const[y0,hw]=spans[i],[y1]=spans[i+1];if(HP('head')&&y1<=58)continue;R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
}
    // legs (feet bottom layer)
    const leg=(s,baseY,stride,front,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+9:-(hw+13));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+4;
      const pw=front?11:10;
      O(x0-3,py-3,pw,9,ARM);R(x0-3,py+4,pw,2,ARM_S);
      for(let i=0;i<3;i++){const clx=x0-2+i*3+(front?1:0),cly=py-7;   // sharp tapered claws
        R(clx,cly+3,2,2,HULL);R(clx,cly+1,1,2,HULL_L);R(clx,cly,1,1,INK);}
      O(x0,yTop-2,4,yH+2,ARM_S);
      O(bx+(s>0?hw+7:-(hw+12)),baseY-4+oy,5,9,GRY);
      O(bx+(s>0?hw+1:-(hw+9)),baseY-3+oy,8,6,ARM);
      const j0=bx+(s>0?hw-2:-(hw-2)-8);
      O(j0,baseY-4+oy,8,9,GRY);R(j0+(s>0?6:1),baseY-2+oy,1,5,GRY_S);
    };
    if(!HP('legsA')){leg(-1,70,st4[0],true,17);leg(1,70,st4[1],true,17);}
    if(!HP('legsB')){leg(-1,124,st4[2],false,17);leg(1,124,st4[3],false,17);}
    // tail — long, heavy, banded; whips with a growing sway toward the dark furred tip
    if(!HP('tail')){const px=cx+swayX;
      const segs=[[140,7],[148,7],[156,7],[164,7],[172,6],[180,6],[188,5]];
      for(let i=0;i<segs.length;i++){const[y,hw]=segs[i];const off=Math.round(tailS*(i+1)/2.4);
        O(px-hw+off,y,hw*2,9,i%2?HULL:HULL_S);          // thick furred segment
        R(px-hw-1+off,y,hw*2+2,2,ARM_S);                // segment seam
        R(px-2+off,y+2,4,6,ARM);}                       // dorsal stripe
      const to=Math.round(tailS*8/2.4), ty=196;
      O(px-5+to,ty,10,8,ARM_S);R(px-3+to,ty+5,6,5,INK); // dark furred tip
    }
    // torso
    const ox=swayX,oy=bob;
if(!HP('frame')){
    for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
    for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
    for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
    R(cx-2+ox,52+oy,4,88,ARM);R(cx-2+ox,52+oy,1,88,ARM_H);
    for(const y of[70,92,104,126])R(cx-12+ox,y+oy,24,1,HULL_S);
    R(cx-17+ox,62+oy,6,4,TEAL);R(cx-17+ox,64+oy,6,2,TEAL_S);
    R(cx+11+ox,62+oy,6,4,TEAL);R(cx+11+ox,64+oy,6,2,TEAL_S);
    // shoulders — angular armored pauldrons (reused over front AND back legs)
    const pauldron=(topY)=>{for(const s of[-1,1]){
      const ie=cx+ox+s*15, oe=cx+ox+s*27, L=Math.min(ie,oe), wdt=Math.abs(oe-ie);
      O(L,topY+oy,wdt,16,ARM);                               // main pauldron plate
      R(L,topY+oy,wdt,2,ARM_H);                              // top-edge highlight
      R(s>0?oe-2:oe,topY+oy,2,16,ARM_S);                     // outer-edge shade
      for(let v=0;v<3;v++)R(L+3,topY+5+v*4+oy,wdt-6,2,AMB);  // heat-vent slits (amber glow)
      O(s>0?oe:oe-3,topY+6+oy,3,9,GRY_S);                    // thruster nub at outer tip
      R(s>0?oe+1:oe-2,topY+8+oy,1,5,AMB_S);
    }};
    pauldron(55);pauldron(113);
}
    // head
    if(!HP('head')){
    const hb=this.hasAttribute('static')?0:(mode?Math.round(Math.sin(t*14)*1):Math.round(Math.sin(t*1.2)*1));
    const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
    O(cx-4+hx,46+hy,8,12,GRY_S);
    O(cx-11+hx,44+hy,22,7,ARM);R(cx-12+hx,49+hy,24,3,ARM_S);           // shoulder collar
    // ears — outlined stepped triangles, drawn behind the skull
    for(const s of[-1,1]){const ex=cx+s*8+hx;
      O(ex-3,25+hy,6,4,HULL);O(ex-2,21+hy,4,4,HULL);O(ex-1,18+hy,2,3,HULL);  // 3-step triangle
      R(ex-1,24+hy,2,3,TEAL_S);}                                       // inner ear
    O(cx-9+hx,26+hy,18,19,HULL);R(cx+6+hx,26+hy,3,19,HULL_S);R(cx-9+hx,26+hy,1,19,HULL_L); // skull
    O(cx-5+hx,15+hy,10,12,HULL);R(cx+3+hx,15+hy,2,12,HULL_S);          // short muzzle
    O(cx-2+hx,12+hy,4,4,ARM_S);R(cx-1+hx,13+hy,2,2,INK);              // nose
    R(cx-1+hx,16+hy,2,6,ARM_S);                                       // muzzle seam
    R(cx-6+hx,24+hy,3,2,AMB);R(cx+3+hx,24+hy,3,2,AMB);               // amber eyes
    R(cx-1+hx,30+hy,2,13,ARM_S);                                     // crest seam
    }
  }
}
if(!customElements.get('cougar-sprite'))customElements.define('cougar-sprite',CougarSprite);
})();
