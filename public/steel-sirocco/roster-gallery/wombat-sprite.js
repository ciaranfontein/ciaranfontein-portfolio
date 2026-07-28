// <wombat-sprite> — animated top-down pixel-art wombat mech (faction 6 · cyan / deep navy).
// Quadruped chassis shared with the wolf/cougar, but squat and very broad: barrel torso, stubby
// legs with oversized digging claws, small round ears set wide, blunt broad muzzle, stub tail.
// Layers: head/legsA/legsB/tail/frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=152,H=152;
const INK='#01021F',HULL='#00B4D8',HULL_L='#63D9F0',HULL_S='#0080A0',
ARM='#03045E',ARM_S='#010333',ARM_H='#1A1C8A',GRY='#5A7A96',GRY_S='#3A5470',
ACC='#90E0EF',ACC_S='#5AB8CC',
BG='#454034',DOT='#3b382e',SHDW='#011024';
const cx=76;
// broad barrel torso [y0,y1,halfw]
const SP=[[46,50,16],[50,56,20],[56,64,24],[64,76,26],[76,92,27],[92,108,26],[108,118,23],[118,126,18],[126,132,12]];
class WombatSprite extends HTMLElement{
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
    else{const ph=t*6;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*1.5;
      this._scroll+=.45;
      const a=Math.round(Math.sin(ph)*5),b=Math.round(Math.sin(ph+Math.PI)*5);st4=[a,b,b,a];}
    if(this.hasAttribute('static')){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){
      const spans=[[20,13],[36,14],[46,20],[60,26],[92,27],[118,20],[132,12],[140,6]];
      for(let i=0;i<spans.length-1;i++){const[y0,hw]=spans[i],[y1]=spans[i+1];if(HP('head')&&y1<=46)continue;
        R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    }
    // legs — stubby, tucked under the broad body, oversized digging claws
    const leg=(s,baseY,stride,front,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+4:-(hw+12));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+4;
      const pw=front?12:11;
      O(x0-3,py-3,pw,8,ARM);R(x0-3,py+3,pw,2,ARM_S);                  // broad paw pad
      for(let i=0;i<3;i++){const clx=x0-2+i*4+(front?1:0),cly=py-8;   // big tapered digging claws
        R(clx,cly+3,3,3,ACC);R(clx+1,cly+1,2,2,ACC);R(clx+1,cly,1,1,INK);}
      O(x0+1,yTop-2,4,yH+2,ARM_S);                                    // short shin
      O(bx+(s>0?hw+2:-(hw+8)),baseY-4+oy,5,8,GRY);                    // ankle
      O(bx+(s>0?hw-3:-(hw+3)),baseY-3+oy,8,6,ARM);                    // stubby thigh
      const j0=bx+(s>0?hw-7:-(hw-7)-8);
      O(j0,baseY-4+oy,8,9,GRY);R(j0+(s>0?6:1),baseY-2+oy,1,5,GRY_S);  // hip disc
    };
    if(!HP('legsA')){leg(-1,66,st4[0],true,27);leg(1,66,st4[1],true,27);}
    if(!HP('legsB')){leg(-1,112,st4[2],false,27);leg(1,112,st4[3],false,27);}
    // tail — short flat stub
    if(!HP('tail')){const px=cx+swayX, ty=132, off=Math.round(tailS*0.6);
      O(px-6+off,ty+bob,12,8,HULL_S);
      R(px-6+off,ty+bob,12,2,HULL);
      R(px-3+off,ty+5+bob,6,3,ARM_S);}
    // torso
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      R(cx-3+ox,46+oy,6,86,ARM);R(cx-3+ox,46+oy,1,86,ARM_H);            // spine keel
      for(const y of[64,80,96,112])R(cx-16+ox,y+oy,32,1,HULL_S);        // rib bars
      // armored back plates — burrower's shell segments
      for(const[py2,hw2]of[[58,20],[78,23],[100,21]]){
        O(cx-hw2+ox,py2+oy,hw2*2,10,ARM);R(cx-hw2+ox,py2+oy,hw2*2,2,ARM_H);
        R(cx-hw2+ox,py2+8+oy,hw2*2,2,ARM_S);
        for(let v=0;v<4;v++)R(cx-hw2+5+v*((hw2*2-10)/4)+ox,py2+3+oy,3,4,ACC_S);}
      // shoulder vents
      R(cx-25+ox,52+oy,7,4,ACC);R(cx-25+ox,54+oy,7,2,ACC_S);
      R(cx+18+ox,52+oy,7,4,ACC);R(cx+18+ox,54+oy,7,2,ACC_S);
    }
    // head — broad and flat, small round ears set wide
    if(!HP('head')){
      const hb=this.hasAttribute('static')?0:(mode?Math.round(Math.sin(t*12)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      O(cx-6+hx,38+hy,12,10,GRY_S);                                     // neck
      O(cx-15+hx,36+hy,30,7,ARM);R(cx-16+hx,41+hy,32,3,ARM_S);          // shoulder collar
      for(const s of[-1,1]){const ex=cx+s*12+hx;                        // small round ears, set wide
        O(ex-4,17+hy,8,7,HULL);R(ex-2,19+hy,4,4,ACC_S);}
      O(cx-14+hx,19+hy,28,19,HULL);R(cx+11+hx,19+hy,3,19,HULL_S);R(cx-14+hx,19+hy,1,19,HULL_L); // broad flat skull
      O(cx-8+hx,10+hy,16,10,HULL);R(cx+5+hx,10+hy,3,10,HULL_S);         // blunt broad muzzle
      O(cx-4+hx,7+hy,8,4,ARM_S);R(cx-3+hx,8+hy,6,2,INK);                // big flat nose
      R(cx-9+hx,17+hy,4,2,ACC);R(cx+5+hx,17+hy,4,2,ACC);                // small eyes, set wide
      R(cx-1+hx,23+hy,2,14,ARM_S);                                      // crest seam
    }
  }
}
if(!customElements.get('wombat-sprite'))customElements.define('wombat-sprite',WombatSprite);
})();
