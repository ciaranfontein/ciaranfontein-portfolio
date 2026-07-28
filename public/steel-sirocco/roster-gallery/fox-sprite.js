// <fox-sprite> — animated top-down pixel-art arctic fox mech (faction 3 · glacier blues).
// Same build as the Lancer (wolf) at 80% scale in glacier colors, with a slightly
// longer snout, swept ears, and the approved brush tail (white-tipped, tufted).
// Layers: head / legsA / legsB / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=112,H=200;
const INK='#03045E',HULL='#CAF0F8',HULL_L='#EAFBFF',HULL_S='#93C9D8',
ARM='#0077B6',ARM_S='#02508A',ARM_H='#2B99D4',GRY='#5D89A8',GRY_S='#3A5F7D',
NOSE='#8B3A2E',NOSE_S='#5E2620',TIP='#FBFFFF',
BG='#454034',DOT='#3b382e',SHDW='#020338';
const cx=56;
// wolf torso spans at 80% [y0,y1,halfw]
const SP=[[42,43,10],[43,45,11],[45,48,12],[48,56,13],[56,62,12],[62,74,10],[74,83,10],[83,90,13],[90,101,14],[101,107,11],[107,112,8]];
// approved brush tail halfwidths, y=112 step 8
const TW=[6,9,11,12,12,11,10,8,6,4];
class FoxSprite extends HTMLElement{
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
    // true filled triangle (per-scanline edges) + outlined variant
    const tri=(x1,y1,x2,y2,x3,y3,c)=>{
      const ys=Math.min(y1,y2,y3),ye=Math.max(y1,y2,y3);
      for(let y=Math.round(ys);y<=Math.round(ye);y++){
        let lo=null,hi=null;
        for(const[ax2,ay2,bx2,by2]of[[x1,y1,x2,y2],[x2,y2,x3,y3],[x3,y3,x1,y1]]){
          if(y>=Math.min(ay2,by2)&&y<=Math.max(ay2,by2)&&Math.abs(by2-ay2)>.001){
            const xx=ax2+(bx2-ax2)*(y-ay2)/(by2-ay2);
            lo=lo===null?xx:Math.min(lo,xx);hi=hi===null?xx:Math.max(hi,xx);
          }
        }
        if(lo!==null)R(Math.round(lo),y,Math.max(1,Math.round(hi)-Math.round(lo)+1),1,c);
      }
    };
    const triO=(x1,y1,x2,y2,x3,y3,c)=>{
      const gx=(x1+x2+x3)/3,gy=(y1+y2+y3)/3;
      const e=(vx,vy)=>[vx+(vx>gx?1:vx<gx?-1:0),vy+(vy>gy?1:vy<gy?-1:0)];
      const[e1,e2,e3]=[e(x1,y1),e(x2,y2),e(x3,y3)];
      tri(e1[0],e1[1],e2[0],e2[1],e3[0],e3[1],INK);
      tri(x1,y1,x2,y2,x3,y3,c);
    };
    let bob,swayX,tailS,st4;
    if(mode===0){bob=Math.round(Math.sin(t*2)*1);swayX=0;tailS=Math.sin(t*1.1)*6;st4=[0,0,0,0];}
    else{const ph=t*7;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*4;
      this._scroll+=.55;
      const a=Math.round(Math.sin(ph)*6),b=Math.round(Math.sin(ph+Math.PI)*6);st4=[a,b,b,a];}
    if(stat){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){
      const spans=[[21,8],[35,12],[46,14],[62,12],[83,16],[107,11],[114,5]];
      for(let i=0;i<spans.length-1;i++){const[y0,hw]=spans[i],[y1]=spans[i+1];if(HP('head')&&y1<=46)continue;R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    }
    if(!HP('tail')){for(let i=0;i<TW.length;i++){const y=112+i*8,hw=TW[i];const off=Math.round(tailS*(i+1)/TW.length);R(cx-hw+off+swayX+2,y+bob+3,hw*2,8,SHDW);}}
    // ---- legs (feet bottom layer) — wolf limbs at 80% ----
    const leg=(s,baseY,stride,front,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+7:-(hw+10));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+3;
      const pw=front?9:8;
      O(x0-2,py-2,pw,7,ARM);R(x0-2,py+3,pw,2,ARM_S);
      for(let i=0;i<3;i++)R(x0-1+i*3+(front?1:0),py-5,2,3,HULL);
      O(x0,yTop-2,3,yH+2,ARM_S);
      O(bx+(s>0?hw+5:-(hw+9)),baseY-3+oy,4,7,GRY);
      O(bx+(s>0?hw+1:-(hw+7)),baseY-2+oy,6,5,ARM);
      const j0=bx+(s>0?hw-2:-(hw-2)-6);
      O(j0,baseY-3+oy,6,7,GRY);R(j0+(s>0?4:1),baseY-1+oy,1,4,GRY_S);
    };
    if(!HP('legsA')){leg(-1,56,st4[0],true,12);leg(1,56,st4[1],true,12);}
    if(!HP('legsB')){leg(-1,99,st4[2],false,14);leg(1,99,st4[3],false,14);}
    // ---- approved brush tail: fluffy, tufted, bright tip ----
    if(!HP('tail')){
      const px=cx+swayX;
      for(let i=0;i<TW.length;i++){
        const y=112+i*8+bob,hw=TW[i];
        const off=Math.round(tailS*(i+1)/TW.length);
        const bright=i>=TW.length-2;
        O(px-hw+off,y,hw*2,8,bright?TIP:(i%2?HULL:HULL_L));
        R(px+hw-2+off,y,2,8,bright?HULL_L:HULL_S);
        if(!bright&&i>0)R(px-hw+off,y+2,1,4,HULL_L);
        // fluff tufts on alternating flanks (stoat-style)
        if(i%2){R(px-hw-3+off,y+1,3,5,bright||i>=TW.length-3?TIP:HULL);R(px-hw-4+off,y+2,1,3,INK);}
        else if(i>0){R(px+hw+off,y+1,3,5,bright||i>=TW.length-3?TIP:HULL);R(px+hw+3+off,y+2,1,3,INK);}
        if(i===TW.length-3)R(px-hw+off,y+7,hw*2,1,HULL_S);        // tip boundary seam
      }
      const tp=Math.round(tailS);
      O(cx-2+tp+swayX,112+TW.length*8+bob,4,4,TIP);               // rounded tip nub
    }
    // ---- torso (wolf at 80%) ----
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      R(cx-2+ox,42+oy,3,70,ARM);R(cx-2+ox,42+oy,1,70,ARM_H);      // spine
      for(const y of[56,74,83,101])R(cx-9+ox,y+oy,18,1,HULL_S);   // panel lines
      R(cx-12+ox,50+oy,5,3,ARM_H);R(cx-12+ox,52+oy,5,1,ARM_S);    // vents
      R(cx+8+ox,50+oy,5,3,ARM_H);R(cx+8+ox,52+oy,5,1,ARM_S);
      O(cx-13+ox,85+oy,5,5,GRY);R(cx-11+ox,86+oy,2,2,ARM_H);      // hip discs
      O(cx+8+ox,85+oy,5,5,GRY);R(cx+10+ox,86+oy,2,2,ARM_H);
      O(cx-7+ox,104+oy,5,5,GRY);R(cx-6+ox,109+oy,3,2,ARM_H);      // thrusters
      O(cx+3+ox,104+oy,5,5,GRY);R(cx+4+ox,109+oy,3,2,ARM_H);
      // (clean shoulders — no fins)
      // tech flavour beyond the Lancer: diamond sensor node, cryo pods, radiator ticks
      for(const[dy2,wq]of[[45,1],[46,3],[47,5],[48,3],[49,1]])R(cx-(wq-1)/2+ox,dy2+oy,wq,1,dy2===47?ARM_H:ARM);
      R(cx+ox,47+oy,1,1,HULL_L);
      O(cx-8+ox,64+oy,4,9,GRY);R(cx-8+ox,64+oy,4,2,HULL_L);R(cx-8+ox,71+oy,4,2,GRY_S);
      O(cx+4+ox,64+oy,4,9,GRY);R(cx+4+ox,64+oy,4,2,HULL_L);R(cx+4+ox,71+oy,4,2,GRY_S);
      for(const y of[92,96,100]){R(cx-4+ox,y+oy,8,1,ARM_H);R(cx-4+ox,y+1+oy,8,1,ARM_S);}
    }
    // ---- head: wolf skull at 80% + longer snout + swept ears ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*14)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      // fox ears top-down: swept petal triangles, tips raking forward-out (scalene: 9/10/14 sides)
      triO(cx-5+hx,26+hy,cx-9+hx,34+hy,cx-14+hx,21+hy,HULL);
      R(cx-7+hx,28+hy,2,2,ARM_S);R(cx-13+hx,22+hy,1,1,ARM_H);
      triO(cx+5+hx,26+hy,cx+9+hx,34+hy,cx+14+hx,21+hy,HULL);
      R(cx+6+hx,28+hy,2,2,ARM_S);R(cx+13+hx,22+hy,1,1,ARM_H);
      O(cx-3+hx,37+hy,6,10,GRY_S);                                 // neck
      O(cx-9+hx,35+hy,18,6,ARM);R(cx-10+hx,39+hy,20,2,ARM_S);      // mane
      O(cx-6+hx,22+hy,13,14,HULL);R(cx+4+hx,22+hy,2,14,HULL_S);    // skull
      O(cx-5+hx,19+hy,10,4,HULL);
      // longer snout: two tapering reaches
      O(cx-4+hx,12+hy,8,8,HULL);R(cx+2+hx,12+hy,2,8,HULL_S);
      O(cx-3+hx,8+hy,6,5,HULL);R(cx+1+hx,8+hy,2,5,HULL_S);
      R(cx-1+hx,6+hy,3,2,NOSE);R(cx-1+hx,7+hy,3,1,NOSE_S);         // nose
      // eye sockets: shallow top-down recesses instead of a visor bar
      R(cx-4+hx,21+hy,2,2,HULL_S);R(cx-4+hx,23+hy,2,1,ARM_S);
      R(cx+2+hx,21+hy,2,2,HULL_S);R(cx+2+hx,23+hy,2,1,ARM_S);
      R(cx-1+hx,27+hy,2,7,ARM_S);                                  // head stripe
    }
  }
}
if(!customElements.get('fox-sprite'))customElements.define('fox-sprite',FoxSprite);
})();
