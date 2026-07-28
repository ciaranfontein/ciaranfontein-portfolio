// <wolf-sprite> — animated top-down pixel-art wolf mech.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground (show speckled ground + scroll)
(function(){
const W=140,H=200;
const INK='#1d1b16',HULL='#d9d2be',HULL_L='#ece6d6',HULL_S='#b3ab94',
ARM='#4a463a',ARM_S='#35322a',ARM_H='#5d584a',GRY='#8a8474',GRY_S='#6b6656',
AMB='#d9a441',AMB_S='#a87b1e',TEAL='#5ba8a0',TEAL_S='#3d7a73',
BG='#454034',DOT='#3b382e',SHDW='#39352a';
const cx=70;
const SP=[[52,54,13],[54,56,15],[56,60,17],[60,70,19],[70,78,16],[78,92,13],[92,104,13],[104,112,16],[112,126,17],[126,134,14],[134,140,10]];
class WolfSprite extends HTMLElement{
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
      for(let i=0;i<3;i++)R(x0-2+i*3+(front?1:0),py-6,2,4,HULL);
      O(x0,yTop-2,4,yH+2,ARM_S);
      O(bx+(s>0?hw+7:-(hw+12)),baseY-4+oy,5,9,GRY);
      O(bx+(s>0?hw+1:-(hw+9)),baseY-3+oy,8,6,ARM);
      const j0=bx+(s>0?hw-2:-(hw-2)-8);
      O(j0,baseY-4+oy,8,9,GRY);R(j0+(s>0?6:1),baseY-2+oy,1,5,GRY_S);
    };
    if(!HP('legsA')){leg(-1,70,st4[0],true,17);leg(1,70,st4[1],true,17);}
    if(!HP('legsB')){leg(-1,124,st4[2],false,17);leg(1,124,st4[3],false,17);}
    // tail
    if(!HP('tail')){let px=cx+swayX;
    for(let i=0;i<5;i++){const y=142+i*8+bob,w=6-i;const off=Math.round(tailS*(i+1)/5);
      O(px-w/2+off,y,w,8,i%2?GRY:ARM);R(px-w/2-1+off,y,w+2,2,ARM_S);
      if(i===4){const sx=px+off, ty=y+8;
        const tp=this.getAttribute('tail')||'spade';
        if(tp==='spade'){R(sx-4,ty+1,8,3,AMB_S);O(sx-3,ty,6,4,AMB);O(sx-2,ty+4,4,4,AMB);R(sx-1,ty+8,2,3,AMB_S);}
        else if(tp==='lance'){O(sx-2,ty,4,10,GRY);R(sx-1,ty,1,10,GRY_S);O(sx-2,ty+11,4,6,AMB);}
        else if(tp==='flail'){R(sx-1,ty+1,2,2,GRY);R(sx-1,ty+4,2,2,GRY);O(sx-5,ty+7,10,10,GRY_S);R(sx-3,ty+9,3,3,AMB);R(sx+1,ty+13,2,2,AMB);}
        else if(tp==='pincer'){O(sx-6,ty,4,12,ARM);O(sx+2,ty,4,12,ARM);R(sx-6,ty+12,3,4,HULL);R(sx+3,ty+12,3,4,HULL);}
        else if(tp==='rail'){O(sx-2,ty,4,11,GRY);R(sx-2,ty+4,4,3,AMB);O(sx-3,ty+12,6,4,TEAL);}
        else if(tp==='rudder'){O(sx-5,ty,10,3,HULL);R(sx-5,ty+2,10,1,HULL_S);O(sx-2,ty+3,4,6,HULL);R(sx,ty+3,2,6,HULL_S);O(sx-4,ty+9,8,3,AMB);R(sx-4,ty+11,8,1,AMB_S);}
      }}}
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
    O(cx-16+ox,106+oy,6,6,GRY);R(cx-14+ox,108+oy,2,2,AMB);
    O(cx+10+ox,106+oy,6,6,GRY);R(cx+12+ox,108+oy,2,2,AMB);
    O(cx-9+ox,130+oy,6,6,GRY);R(cx-8+ox,136+oy,4,2,TEAL);
    O(cx+3+ox,130+oy,6,6,GRY);R(cx+4+ox,136+oy,4,2,TEAL);
    // comm fins (symmetric)
    O(cx-24+ox,54+oy,5,16,GRY);R(cx-23+ox,52+oy,3,3,AMB);
    O(cx+19+ox,54+oy,5,16,GRY);R(cx+20+ox,52+oy,3,3,AMB);
}
    // head
    if(!HP('head')){
    const hb=this.hasAttribute('static')?0:(mode?Math.round(Math.sin(t*14)*1):Math.round(Math.sin(t*1.2)*1));
    const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
    O(cx-4+hx,46+hy,8,12,GRY_S);
    O(cx-11+hx,44+hy,22,7,ARM);R(cx-12+hx,49+hy,24,3,ARM_S);
    O(cx-8+hx,28+hy,16,17,HULL);R(cx+5+hx,28+hy,3,17,HULL_S);
    O(cx-6+hx,24+hy,12,6,HULL);
    O(cx-5+hx,18+hy,10,8,HULL);R(cx+3+hx,18+hy,2,8,HULL_S);
    const htp=this.getAttribute('head')||'optic';
    if(htp==='burrow'){
      O(cx-13+hx,21+hy,4,10,HULL_L);R(cx-12+hx,23+hy,2,6,HULL);
      O(cx+9+hx,21+hy,4,10,HULL_L);R(cx+10+hx,23+hy,2,6,HULL);
      O(cx-2+hx,14+hy,4,3,'#8B3A2E');
      R(cx-5+hx,27+hy,10,2,TEAL);R(cx-5+hx,28+hy,10,1,TEAL_S);
    }else if(htp==='whisker'){
      O(cx-15+hx,25+hy,7,6,HULL_L);R(cx-13+hx,27+hy,3,2,ARM);
      O(cx+8+hx,25+hy,7,6,HULL_L);R(cx+10+hx,27+hy,3,2,ARM);
      R(cx-11+hx,18+hy,5,1,HULL_L);R(cx+6+hx,18+hy,5,1,HULL_L);
      R(cx-12+hx,20+hy,4,1,HULL_S);R(cx+8+hx,20+hy,4,1,HULL_S);
      O(cx-2+hx,14+hy,4,3,AMB);
      R(cx-5+hx,27+hy,10,2,AMB);R(cx-5+hx,28+hy,10,1,AMB_S);
    }else{
      R(cx-3+hx,15+hy,6,4,ARM);R(cx-2+hx,16+hy,1,1,INK);R(cx+1+hx,16+hy,1,1,INK);
      R(cx-5+hx,27+hy,10,2,AMB);R(cx-5+hx,28+hy,10,1,AMB_S);
    }
    R(cx-1+hx,34+hy,2,9,ARM_S);
    }
  }
}
if(!customElements.get('wolf-sprite'))customElements.define('wolf-sprite',WolfSprite);
})();
