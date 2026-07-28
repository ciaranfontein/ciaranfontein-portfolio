// <stoat-sprite> — animated top-down pixel-art stoat mech.
// Long, low, tube-bodied silhouette with stubby legs and a slender black-tipped tail.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, tail="brush"|"spade"|"lance"|"rail"
(function(){
const W=110,H=300;
const INK='#03045E',
HULL='#CAF0F8',HULL_L='#EAFBFF',HULL_S='#93C9D8',
ARM='#0077B6',ARM_S='#02508A',ARM_H='#2B99D4',
GRY='#5D89A8',GRY_S='#3A5F7D',
ACC='#CAF0F8',ACC_S='#0077B6',
BG='#0A1830',DOT='#122744',SHDW='#020338',NOSE='#8B3A2E',NOSE_S='#5E2620',
TIP=['#8FB4C4','#5D7F92','#33505F','#14232E'],TIP_S=['#6B8C9C','#3F5F70','#22333F','#0A141B'];
const cx=55;
// long tube body: narrow shoulders, slight mid bulge, tapering haunch
const SP=[[52,58,13],[58,66,15],[66,78,17],[78,96,18],[96,120,17],[120,150,16],[150,178,16],[178,196,17],[196,210,18],[210,220,15],[220,228,11]];
class StoatSprite extends HTMLElement{
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
    if(mode===0){bob=Math.round(Math.sin(t*1.8)*1);swayX=0;tailS=Math.sin(t*1.1)*4;st4=[0,0,0,0];}
    else{const ph=t*6.5;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*3;
      this._scroll+=.5;
      const a=Math.round(Math.sin(ph)*5),b=Math.round(Math.sin(ph+Math.PI)*5);st4=[a,b,b,a];}
    if(this.hasAttribute('static')){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=11;for(let i=0;i<90;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
if(!HP('frame')){
    const spans=[[28,10],[52,15],[78,19],[130,17],[196,18],[220,14],[232,7]];
    for(let i=0;i<spans.length-1;i++){const[y0,hw]=spans[i],[y1]=spans[i+1];if(HP('head')&&y1<=52)continue;R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
}
    // legs — short, stubby, tucked against the body (bottom layer)
    const leg=(s,baseY,stride,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+3:-(hw+11));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+2;
      O(x0-1,py-2,8,9,ARM);R(x0-2,py,10,5,INK);R(x0-1,py,1,5,ARM);R(x0+6,py,1,5,ARM);
      R(x0-1,py+5,8,2,ARM_S);R(x0-1,py+4,8,1,ARM_S);
      for(let i=0;i<3;i++)R(x0+i*3,py-4,2,3,HULL);
      O(x0+1,yTop-1,6,yH+1,ARM_S);
      O(bx+(s>0?hw-1:-(hw+7)),baseY-4+oy,8,9,GRY);
      const j0=bx+(s>0?hw-6:-(hw-6)-9);
      O(j0,baseY-4+oy,9,9,GRY);R(j0+(s>0?7:1),baseY-2+oy,1,5,GRY_S);
    };
    if(!HP('legsA')){leg(-1,80,st4[0],17);leg(1,80,st4[1],17);}
    if(!HP('legsB')){leg(-1,198,st4[2],17);leg(1,198,st4[3],17);}
    // tail — long, slender, black-tipped
    if(!HP('tail')){let px=cx+swayX;
    for(let i=0;i<8;i++){const y=228+i*8+bob,w=13-Math.floor(i*.55);const off=Math.round(tailS*(i+1)/8);
      const fade=i>=5?i-5:-1;
      const body=fade<0?(i%2?HULL:HULL_L):TIP[fade];
      const edge=fade<0?HULL_S:TIP_S[fade];
      const hi=fade<0?HULL_L:TIP[fade];
      O(px-w/2+off,y,w,8,body);R(px-w/2-1+off,y,w+2,2,edge);
      R(px-w/2+off,y,1,8,hi);R(px+w/2-2+off,y,2,8,edge);
      const tw=w+4;R(px-tw/2+off,y+1,2,3,body);R(px+tw/2-2+off,y+1,2,3,body);
      R(px-tw/2-1+off,y+2,1,2,INK);R(px+tw/2+off,y+2,1,2,INK);
      if(i===7){const sx=px+off, ty=y+8;
        const tp=this.getAttribute('tail')||'brush';
        if(tp==='brush'){O(sx-6,ty,12,15,TIP[3]);R(sx-6,ty,1,15,TIP[2]);R(sx+3,ty,3,15,TIP_S[3]);R(sx-8,ty+2,2,4,TIP[3]);R(sx+6,ty+2,2,4,TIP[3]);O(sx-3,ty+16,6,5,TIP_S[3]);R(sx-3,ty+16,1,5,TIP[3]);}
        else if(tp==='spade'){R(sx-4,ty+1,8,3,ACC_S);O(sx-3,ty,6,4,ACC);O(sx-2,ty+4,4,4,ACC);R(sx-1,ty+8,2,3,ACC_S);}
        else if(tp==='lance'){O(sx-2,ty,4,12,GRY);R(sx-1,ty,1,12,GRY_S);O(sx-2,ty+13,4,6,ACC);}
        else if(tp==='rail'){O(sx-2,ty,4,13,GRY);R(sx-2,ty+5,4,3,ACC);O(sx-3,ty+14,6,4,ARM_H);}
        else if(tp==='rudder'){O(sx-5,ty,10,3,HULL);R(sx-5,ty+2,10,1,HULL_S);O(sx-2,ty+3,4,6,HULL);R(sx,ty+3,2,6,HULL_S);O(sx-4,ty+9,8,3,ACC);R(sx-4,ty+11,8,1,ACC_S);}
      }}}
    // torso
    const ox=swayX,oy=bob;
if(!HP('frame')){
    for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
    for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
    for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
    // spine channel down the long back
    R(cx-2+ox,52+oy,5,172,ARM);R(cx-2+ox,52+oy,1,172,ARM_H);
    for(const y of[78,96,120,150,178,196,210])R(cx-12+ox,y+oy,24,1,HULL_S);
    // shoulder + haunch plating (low profile, hugging the tube)
    O(cx-19+ox,64+oy,4,26,ARM);R(cx-19+ox,64+oy,1,26,ARM_H);R(cx-19+ox,74+oy,4,1,HULL_S);
    O(cx+15+ox,64+oy,4,26,ARM);R(cx+18+ox,64+oy,1,26,ARM_H);R(cx+15+ox,74+oy,4,1,HULL_S);
    O(cx-18+ox,190+oy,4,22,ARM);R(cx-18+ox,190+oy,1,22,ARM_H);R(cx-18+ox,200+oy,4,1,HULL_S);
    O(cx+14+ox,190+oy,4,22,ARM);R(cx+17+ox,190+oy,1,22,ARM_H);R(cx+14+ox,200+oy,4,1,HULL_S);
    // vents + hardpoints along the spine
    R(cx-17+ox,104+oy,6,4,ARM_H);R(cx-17+ox,106+oy,6,2,ARM_S);
    R(cx+11+ox,104+oy,6,4,ARM_H);R(cx+11+ox,106+oy,6,2,ARM_S);
    O(cx-15+ox,132+oy,6,6,GRY);R(cx-13+ox,134+oy,3,3,ACC);
    O(cx+9+ox,132+oy,6,6,GRY);R(cx+11+ox,134+oy,3,3,ACC);
    O(cx-15+ox,164+oy,6,6,GRY);R(cx-13+ox,166+oy,3,3,ACC);
    O(cx+9+ox,164+oy,6,6,GRY);R(cx+11+ox,166+oy,3,3,ACC);
}
    // head — small, rounded, low
    if(!HP('head')){
    const hb=this.hasAttribute('static')?0:(mode?Math.round(Math.sin(t*12)*1):Math.round(Math.sin(t*1.1)*1));
    const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
    O(cx-5+hx,44+hy,10,12,GRY_S);
    O(cx-12+hx,41+hy,24,7,ARM);R(cx-13+hx,46+hy,26,3,ARM_S);
    O(cx-13+hx,28+hy,25,14,HULL);R(cx+8+hx,28+hy,4,14,HULL_S);R(cx-13+hx,28+hy,1,14,HULL_L);
    O(cx-11+hx,21+hy,22,7,HULL);R(cx+7+hx,21+hy,4,7,HULL_S);R(cx-11+hx,21+hy,22,1,HULL);
    R(cx-10+hx,20+hy,20,1,HULL);R(cx-10+hx,19+hy,20,1,INK);
    O(cx-8+hx,15+hy,16,6,HULL);R(cx+4+hx,15+hy,4,6,HULL_S);R(cx-8+hx,15+hy,16,1,HULL);
    R(cx-7+hx,14+hy,13,1,HULL);R(cx-7+hx,13+hy,13,1,INK);
    O(cx-4+hx,10+hy,8,4,HULL);R(cx+1+hx,10+hy,3,4,HULL_S);
    const htp=this.getAttribute('head')||'burrow';
    const ear=(ex)=>{
      R(ex,29+hy,4,11,INK);R(ex-1,31+hy,6,7,INK);
      R(ex,31+hy,4,7,HULL_L);R(ex+1,30+hy,2,10,HULL_L);
    };
    if(htp==='burrow'){
      O(cx-3+hx,8+hy,5,2,NOSE);O(cx-2+hx,7+hy,3,1,NOSE);R(cx-3+hx,9+hy,5,1,NOSE_S);
      ear(cx-16+hx);ear(cx+12+hx);
      R(cx-8+hx,23+hy,16,3,ACC);R(cx-8+hx,25+hy,16,1,ACC_S);
    }else if(htp==='whisker'){
      O(cx-3+hx,8+hy,5,3,ACC);R(cx-3+hx,10+hy,5,1,ACC_S);
      O(cx-17+hx,25+hy,8,6,HULL_L);R(cx-15+hx,27+hy,3,2,ARM);
      O(cx+9+hx,25+hy,8,6,HULL_L);R(cx+11+hx,27+hy,3,2,ARM);
      R(cx-13+hx,14+hy,5,1,HULL_L);R(cx+8+hx,14+hy,5,1,HULL_L);
      R(cx-14+hx,16+hy,4,1,HULL_S);R(cx+10+hx,16+hy,4,1,HULL_S);
      R(cx-8+hx,23+hy,16,3,ACC);R(cx-8+hx,25+hy,16,1,ACC_S);
    }else{
      R(cx-3+hx,7+hy,6,4,ARM);R(cx-2+hx,8+hy,1,1,INK);R(cx+1+hx,8+hy,1,1,INK);
      R(cx-10+hx,22+hy,20,3,ACC);R(cx-10+hx,25+hy,20,1,ACC_S);
    }
    R(cx-2+hx,31+hy,4,11,ARM_S);
    }
  }
}
if(!customElements.get('stoat-sprite'))customElements.define('stoat-sprite',StoatSprite);
})();
