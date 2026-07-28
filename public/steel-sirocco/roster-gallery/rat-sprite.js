// <rat-sprite> — animated top-down pixel-art rat mech.
// Pear-shaped: narrow nose/shoulders swelling into wide haunches, thin whip tail.
// Attributes: mode="idle"|"walk"|"cycle", ground, variant="a"|"b"|"c", hide="head,legsA,legsB,tail"
(function(){
const W=120,H=250;
const INK='#26150F',
HULL='#A1887F',HULL_L='#C4AC9F',HULL_S='#7D685D',
ARM='#5D4037',ARM_S='#3E2A23',ARM_H='#7A564B',
GRY='#8A7468',GRY_S='#5F4E44',
RUST='#8B4A2E',RUST_S='#5E301C',MET='#94948A',MET_S='#6B6B60',
ACC='#F4A261',ACC_S='#C77E3F',
BG='#0A1830',DOT='#122744',SHDW='#020338';
const cx=60;
// pear silhouette: [y0,y1,halfWidth] — narrow front, bulging haunch
const SPANS={
  a:[[54,59,7],[59,65,9],[65,75,11],[75,86,13],[86,99,17],[99,113,22],[113,128,26],[128,139,25],[139,147,20],[147,152,12]],
  b:[[54,60,8],[60,70,10],[70,83,12],[83,97,16],[97,112,21],[112,126,26],[126,137,25],[137,145,20],[145,150,13]],
  c:[[56,60,8],[60,68,10],[68,80,13],[80,92,17],[92,107,23],[107,123,28],[123,134,26],[134,142,20],[142,147,12]]
};
class RatSprite extends HTMLElement{
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
    const vr=this.getAttribute('variant')||'c';
    const SP=SPANS[vr]||SPANS.a;
    const hide=(this.getAttribute('hide')||'').split(',');
    const HP=(k)=>hide.indexOf(k)>=0;
    const t=performance.now()/1000;
    let mode=attr==='walk'?1:0;
    if(attr==='cycle'){if(t-this._last>4){this._mode=1-this._mode;this._last=t;}mode=this._mode;}
    const R=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h));};
    const O=(x,y,w,h,c)=>{R(x-1,y-1,w+2,h+2,INK);R(x,y,w,h,c);};
    let bob,swayX,tailS,st4;
    if(mode===0){bob=Math.round(Math.sin(t*1.6)*1);swayX=0;tailS=Math.sin(t*.9)*5;st4=[0,0,0,0];}
    else{const ph=t*5.5;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*4;
      this._scroll+=.38;
      const a=Math.round(Math.sin(ph)*4),b=Math.round(Math.sin(ph+Math.PI)*4);st4=[a,b,b,a];}
    if(this.hasAttribute('static')){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=17;for(let i=0;i<80;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    const last=SP[SP.length-1];
if(!HP('frame')){
    for(let i=0;i<SP.length-1;i++){const[y0,,hw]=SP[i];R(cx-hw+swayX+2,y0+bob+3,hw*2,SP[i+1][0]-y0,SHDW);}
    if(!HP('tail'))R(cx-8+swayX+2,last[0]+bob+3,16,14,SHDW);
}
    // legs (bottom layer) — front pair narrow, rear pair wide under the haunch
    const leg=(s,baseY,stride,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+2:-(hw+10));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+2;
      O(x0-1,py-2,8,8,ARM);R(x0-2,py,10,4,INK);R(x0-1,py,1,4,ARM);R(x0+6,py,1,4,ARM);
      R(x0-1,py+4,8,2,ARM_S);
      for(let i=0;i<3;i++)R(x0+i*3,py-4,2,3,HULL);
      O(x0+1,yTop-1,6,yH+1,ARM_S);
      O(bx+(s>0?hw-2:-(hw+6)),baseY-4+oy,8,8,GRY);
      const j0=bx+(s>0?hw-6:-(hw-6)-8);
      O(j0,baseY-4+oy,8,8,GRY);R(j0+(s>0?6:1),baseY-2+oy,1,4,GRY_S);
    };
    const frontHw=SP[2][2]+1, rearHw=SP[SP.length-4][2]+1;
    if(!HP('legsA')){leg(-1,73,st4[0],frontHw);leg(1,73,st4[1],frontHw);}
    if(!HP('legsB')){leg(-1,124,st4[2],rearHw);leg(1,124,st4[3],rearHw);}
    // tail — thin whip, kinked segments, accent-tipped
    if(!HP('tail')){let px=cx+swayX;
      const T0=last[0]+6;
      for(let i=0;i<10;i++){const y=T0+i*7+bob,w=Math.max(3,7-Math.floor(i*.5));const off=Math.round(tailS*(i+1)/10);
        const body=i>=8?ACC:(i%2?HULL:HULL_L);
        const edge=i>=8?ACC_S:HULL_S;
        O(px-w/2+off,y,w,7,body);R(px+w/2-1+off,y,1,7,edge);
        if(vr==='b'&&i%2)R(px-w/2+off,y+2,w,1,ARM_S);
        if(i===9){const sx=px+off,ty=y+7;const tp=this.getAttribute('tail')||'rudder';
          if(tp==='spade'){R(sx-3,ty+1,6,2,ACC_S);O(sx-2,ty,4,3,ACC);O(sx-1,ty+3,2,3,ACC);}
          else if(tp==='rail'){O(sx-1,ty,2,7,GRY);R(sx-1,ty+2,2,2,ACC);O(sx-2,ty+8,4,3,MET);}
          else if(tp==='keel'){O(sx-1,ty,2,7,GRY);R(sx-1,ty+2,2,2,ACC);O(sx-2,ty+8,4,3,MET);}
          else{O(sx-3,ty,6,2,HULL);R(sx-3,ty+1,6,1,HULL_S);O(sx-1,ty+2,2,4,ACC);R(sx-1,ty+5,2,2,ACC_S);}}
      }}
    // torso — pear hull
    const ox=swayX,oy=bob;
if(!HP('frame')){
    for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
    for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
    for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
    // haunch dome plating over the widest section
    const hy0=SP[4][0],hy1=SP[SP.length-2][1],hw2=SP[5][2];
    O(cx-hw2+2+ox,hy0+2+oy,hw2*2-4,hy1-hy0-6,HULL);
    R(cx-hw2+2+ox,hy0+2+oy,1,hy1-hy0-6,HULL_L);R(cx+hw2-5+ox,hy0+2+oy,3,hy1-hy0-6,HULL_S);
    if(vr==='a'){
      // patchwork: mismatched scavenged plates, odd sizes, bolt dots
      const patch=(px,py,pw,ph,c,cs)=>{O(px+ox,py+oy,pw,ph,c);R(px+ox,py+oy,pw,1,cs);R(px+ox,py+oy,1,ph,cs);R(px+ox,py+oy+ph-1,2,1,INK);R(px+ox+pw-2,py+oy,2,1,INK);};
      patch(cx-hw2+3,hy0+4,13,16,GRY,GRY_S);
      patch(cx+1,hy0+7,hw2-6,12,RUST,RUST_S);
      patch(cx-hw2+6,hy0+22,10,13,MET,MET_S);
      patch(cx-2,hy0+21,12,17,HULL_S,GRY_S);
      patch(cx+hw2-12,hy0+26,8,9,RUST,RUST_S);
      // bolts + weld stitches between plates
      for(const[bx,by]of[[cx-hw2+4,hy0+5],[cx+hw2-6,hy0+8],[cx-hw2+7,hy0+23],[cx+8,hy0+36]])R(bx+ox,by+oy,2,2,ACC);
      for(let i=0;i<5;i++)R(cx-1+ox,hy0+6+i*6+oy,3,2,i%2?INK:GRY_S);
    }else if(vr==='b'){
      // welded: one big rust slab, stitch-weld border, dents, loose cable
      O(cx-hw2+5+ox,hy0+5+oy,hw2*2-10,30,RUST);
      R(cx-hw2+5+ox,hy0+5+oy,1,30,RUST_S);R(cx+hw2-8+ox,hy0+5+oy,3,30,RUST_S);
      for(let i=0;i<7;i++){R(cx-hw2+6+i*4+ox,hy0+4+oy,2,1,MET);R(cx-hw2+6+i*4+ox,hy0+35+oy,2,1,MET);}
      for(const[dx2,dy2]of[[cx-6,hy0+11],[cx+5,hy0+18],[cx-9,hy0+26],[cx+9,hy0+29]])R(dx2+ox,dy2+oy,2,2,RUST_S);
      R(cx-3+ox,hy0+14+oy,6,2,MET);R(cx-3+ox,hy0+14+oy,2,2,MET_S);
      // cable from plate up to left shoulder stud
      for(let i=0;i<9;i++)R(cx-hw2+2+Math.round(Math.sin(i*.9)*2)+ox,hy0+4-i*2+oy,2,2,i%3===2?ACC_S:ARM_S);
    }else{
      // junk-strapped: salvaged gear + screws under crossed straps
      R(cx-hw2+2+ox,hy0+8+oy,hw2*2-4,3,ARM_S);R(cx-hw2+2+ox,hy0+27+oy,hw2*2-4,3,ARM_S);
      R(cx-hw2+2+ox,hy0+8+oy,hw2*2-4,1,ARM);R(cx-hw2+2+ox,hy0+27+oy,hw2*2-4,1,ARM);
      {const gr=Math.max(6,parseInt(this.getAttribute('gear')||'8',10));
        const twin=(this.getAttribute('gears')||'2')==='2';
        const rot=this._scroll*.12;
        const drawGear=(gx,gy,r,ang,dir)=>{
          const tt=Math.max(3,Math.round(r*.44));
          for(let a=0;a<8;a++){const an=a*Math.PI/4+ang*dir;const tx=Math.round(Math.cos(an)*(r+2)),ty=Math.round(Math.sin(an)*(r+2));O(gx+tx-Math.floor(tt/2),gy+ty-Math.floor(tt/2),tt,tt,MET);}
          for(let dy=-r-1;dy<=r+1;dy++){const w=Math.round(Math.sqrt(Math.max(0,(r+1)*(r+1)-dy*dy)));R(gx-w-1,gy+dy,w*2+2,1,INK);}
          for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy)));R(gx-w,gy+dy,w*2,1,MET);}
          for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(Math.max(0,r*r-dy*dy)));R(gx+w-3,gy+dy,3,1,MET_S);}
          const hr=Math.max(3,Math.round(r*.45));
          for(let dy=-hr;dy<=hr;dy++){const w=Math.round(Math.sqrt(Math.max(0,hr*hr-dy*dy)));R(gx-w,gy+dy,w*2,1,ARM_S);}
          // rotation marker on the disc face
          const mr=(r+hr)/2;
          R(gx+Math.round(Math.cos(ang*dir)*mr)-1,gy+Math.round(Math.sin(ang*dir)*mr)-1,2,2,ACC_S);
          R(gx-1,gy-1,3,3,INK);R(gx-1,gy-1,1,1,ACC);
        };
        if(twin){
          const r2=Math.max(5,Math.round(gr*.62));
          const an=-.9, dx2=Math.round(Math.cos(an)*(gr+r2+3)), dy2=Math.round(Math.sin(an)*(gr+r2+3));
          const gx=cx-3+ox, gy=hy0+23+oy;
          drawGear(gx+dx2,gy+dy2,r2,rot*gr/r2+Math.PI/8,-1);
          drawGear(gx,gy,gr,rot,1);
        }else{
          drawGear(cx+ox,hy0+19+oy,gr,rot,1);
        }}
      // screws scattered around the haunch
      const scr=(sx2,sy2)=>{O(sx2,sy2,3,3,MET);R(sx2+1,sy2,1,3,MET_S);R(sx2,sy2+1,3,1,MET_S);};
      scr(cx-hw2+4+ox,hy0+5+oy);scr(cx+hw2-8+ox,hy0+7+oy);scr(cx-hw2+6+ox,hy0+31+oy);scr(cx+hw2-7+ox,hy0+33+oy);
      O(cx-hw2+3+ox,hy0+14+oy,7,10,RUST);R(cx-hw2+3+ox,hy0+14+oy,1,10,RUST_S);
      R(cx+hw2-6+ox,hy0+36+oy,3,3,RUST);R(cx-hw2+5+ox,hy0+37+oy,2,2,MET);
    }
    // spine channel on the narrow front half — dented, patched
    R(cx-2+ox,57+oy,4,35,ARM);R(cx-2+ox,57+oy,1,35,ARM_H);
    R(cx-3+ox,68+oy,6,4,RUST);R(cx-3+ox,71+oy,6,1,RUST_S);
    R(cx+1+ox,83+oy,2,2,ARM_S);
    // shoulder studs
    O(cx-frontHw-2+ox,70+oy,4,16,ARM);O(cx+frontHw-2+ox,70+oy,4,16,ARM);
    // accent vents behind the head
    R(cx-9+ox,62+oy,5,3,ACC);R(cx+4+ox,62+oy,5,3,ACC);
    R(cx-9+ox,64+oy,5,1,ACC_S);R(cx+4+ox,64+oy,5,1,ACC_S);
}
    // head — small wedge, whisker sensors, accent nose
    if(!HP('head')){
      const hb=this.hasAttribute('static')?0:(mode?Math.round(Math.sin(t*10)*1):Math.round(Math.sin(t*.9)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      O(cx-4+hx,46+hy,8,10,GRY_S);
      O(cx-10+hx,43+hy,20,6,ARM);R(cx-11+hx,47+hy,22,2,ARM_S);
      O(cx-10+hx,30+hy,20,13,HULL);R(cx+6+hx,30+hy,3,13,HULL_S);R(cx-10+hx,30+hy,1,13,HULL_L);
      O(cx-7+hx,22+hy,14,8,HULL);R(cx+3+hx,22+hy,3,8,HULL_S);
      O(cx-4+hx,16+hy,8,6,HULL);R(cx+2+hx,16+hy,2,6,HULL_S);
      const htp=this.getAttribute('head')||'whisker';
      if(htp==='burrow'){O(cx-2+hx,12+hy,4,3,'#8B3A2E');R(cx-2+hx,14+hy,4,1,'#5E2620');}
      else if(htp==='optic'){R(cx-3+hx,12+hy,6,4,ARM);R(cx-2+hx,13+hy,1,1,INK);R(cx+1+hx,13+hy,1,1,INK);}
      else{O(cx-3+hx,12+hy,6,4,ACC);R(cx-3+hx,15+hy,6,1,ACC_S);}
      // big round ears on the back corners of the head (squashed to 3/4 height)
      const ear=(exc,eyc,s)=>{
        const r=6;
        for(let dy=-r-1;dy<=r+1;dy++){const w=Math.round(Math.sqrt(Math.max(0,(r+1)*(r+1)-dy*dy)));R(exc-w,eyc+Math.round(dy*.75),w*2,1,INK);}
        for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(r*r-dy*dy));R(exc-w,eyc+Math.round(dy*.75),w*2,1,HULL_L);}
        for(let dy=-r+2;dy<=r-2;dy++){const w=Math.round(Math.sqrt((r-2)*(r-2)-dy*dy));R(exc+(s>0?1:-w-1),eyc+Math.round(dy*.75),w,1,HULL);}
        R(exc+(s>0?-3:1),eyc+2,2,2,HULL_S);
      };
      if(htp==='whisker'){ear(cx-12+hx,43+hy,-1);ear(cx+12+hx,43+hy,1);}
      else if(htp==='burrow'){
        O(cx-15+hx,32+hy,4,10,HULL_L);R(cx-14+hx,34+hy,2,6,HULL);
        O(cx+11+hx,32+hy,4,10,HULL_L);R(cx+12+hx,34+hy,2,6,HULL);
      }
      // whisker sensor vanes
      if(htp==='whisker'){R(cx-12+hx,18+hy,5,1,HULL_L);R(cx+7+hx,18+hy,5,1,HULL_L);
      R(cx-13+hx,20+hy,4,1,HULL_S);R(cx+9+hx,20+hy,4,1,HULL_S);}
      // visor band
      R(cx-6+hx,32+hy,12,3,ACC);R(cx-6+hx,34+hy,12,1,ACC_S);
      R(cx-2+hx,36+hy,4,7,ARM_S);
    }
  }
}
if(!customElements.get('rat-sprite'))customElements.define('rat-sprite',RatSprite);
})();
