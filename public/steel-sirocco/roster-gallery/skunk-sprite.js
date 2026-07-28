// <skunk-sprite> — animated top-down pixel-art skunk mech (faction 1 · rot greens).
// Dark hull with the signature pale dorsal stripe: nose → crown → V over the
// shoulders → twin body stripes → broad plume stripe. Huge fluffy tail.
// Layers: head / legsA / legsB / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=130,H=250;
const INK='#052E16',HULL='#33691E',HULL_L='#4A8629',HULL_S='#224712',
PALE='#E8F2D8',PALE_S='#BFD3A6',GRY='#6F7F5C',GRY_S='#4E5A40',
ACC='#C9E265',ACC_S='#96AE3B',
BG='#454034',DOT='#3b382e',SHDW='#343c28';
const cx=65;
// body silhouette spans [y0,y1,halfw] — low pear, widest over the haunch
const SP=[[48,54,12],[54,62,15],[62,74,17],[74,90,19],[90,108,20],[108,124,19],[124,134,16],[134,142,11]];
// tail plume segment widths, y=142 step 8
const TW=[14,18,22,26,28,28,26,22,16,10];
class SkunkSprite extends HTMLElement{
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
    if(mode===0){bob=Math.round(Math.sin(t*1.7)*1);swayX=0;tailS=Math.sin(t*1.2)*5;st4=[0,0,0,0];}
    else{const ph=t*6;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*3;
      this._scroll+=.42;
      const a=Math.round(Math.sin(ph)*4),b=Math.round(Math.sin(ph+Math.PI)*4);st4=[a,b,b,a];}
    if(stat){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('head')){for(const[y,hw]of[[16,4],[24,7],[32,9]]){R(cx-hw+swayX+2,y+3+bob,hw*2,8,SHDW);}}
    if(!HP('frame')){for(let i=0;i<SP.length-1;i++){const[y0,,hw]=SP[i];R(cx-hw+swayX+2,y0+bob+3,hw*2,SP[i+1][0]-y0,SHDW);}}
    if(!HP('tail')){for(let i=0;i<TW.length;i++){const y=142+i*8,hw=TW[i]/2;const off=Math.round(tailS*(i+1)/TW.length);R(cx-hw+off+swayX+2,y+bob+3,TW[i],8,SHDW);}}
    // legs (bottom layer) — stubby scurriers tucked under the body
    const leg=(s,baseY,stride,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+1:-(hw+11));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+2;
      O(x0-2,py-2,10,9,HULL);R(x0-3,py+1,12,4,INK);R(x0-2,py+1,1,4,HULL);R(x0+7,py+1,1,4,HULL);
      R(x0-2,py+5,10,2,HULL_S);
      for(let i=0;i<3;i++)R(x0+i*3,py-4,2,3,PALE);
      O(x0,yTop-1,8,yH+1,HULL_S);
      O(bx+(s>0?hw-3:-(hw+7)),baseY-5+oy,10,10,GRY);
      const j0=bx+(s>0?hw-7:-(hw-7)-10);
      O(j0,baseY-5+oy,10,10,GRY);R(j0+(s>0?8:1),baseY-3+oy,1,6,GRY_S);
    };
    if(!HP('legsA')){leg(-1,66,st4[0],18);leg(1,66,st4[1],18);}
    if(!HP('legsB')){leg(-1,120,st4[2],20);leg(1,120,st4[3],20);}
    // ---- tail: huge plume, pale stripe down the center, pale tip ----
    if(!HP('tail')){
      const px=cx+swayX;
      for(let i=0;i<TW.length;i++){
        const y=142+i*8+bob,w=TW[i],hw=w/2;
        const off=Math.round(tailS*(i+1)/TW.length);
        O(px-hw+off,y,w,8,HULL);
        R(px+hw-3+off,y,3,8,HULL_S);R(px-hw+off,y,1,8,HULL_L);
        // fluff notches on alternating flanks
        if(i%2){R(px-hw-2+off,y+2,2,4,HULL);R(px-hw-3+off,y+3,1,2,INK);}
        else if(i>0){R(px+hw+off,y+2,2,4,HULL);R(px+hw+2+off,y+3,1,2,INK);}
        // center stripe — broadens with the plume, pale tip
        const sw=i>=TW.length-2?w-4:Math.min(10,Math.max(4,w-16)+4);
        R(px-sw/2+off,y,sw,8,i>=TW.length-2?PALE:PALE);
        R(px-sw/2+off,y,1,8,PALE_S);R(px+sw/2-1+off,y,1,8,PALE_S);
      }
    }
    // ---- body ----
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      // panel seams
      for(const y of[62,90,124])R(cx-10+ox,y+oy,20,1,HULL_S);
      // dorsal V: merged at the neck, splitting into twin stripes
      R(cx-4+ox,48+oy,8,6,PALE);
      R(cx-6+ox,54+oy,4,4,PALE);R(cx+2+ox,54+oy,4,4,PALE);
      R(cx-8+ox,58+oy,4,80,PALE);R(cx+4+ox,58+oy,4,80,PALE);
      R(cx-8+ox,58+oy,1,80,PALE_S);R(cx+7+ox,58+oy,1,80,PALE_S);
      // stripes converge at the tail root
      R(cx-6+ox,134+oy,4,8,PALE);R(cx+2+ox,134+oy,4,8,PALE);
      // spray nozzles: inset studs flanking the tail root
      O(cx-13+ox,130+oy,4,4,GRY);R(cx-12+ox,131+oy,2,2,ACC);
      O(cx+9+ox,130+oy,4,4,GRY);R(cx+10+ox,131+oy,2,2,ACC);
    }
    // ---- head ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*11)*1):Math.round(Math.sin(t*1.1)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      // wedge skull
      const HS=[[16,20,4],[20,26,6],[26,34,8],[34,40,9],[40,48,7]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // rounded ears at the top-back corners
      O(cx-9+hx,36+hy,4,4,HULL);R(cx-9+hx,36+hy,2,2,HULL_L);
      O(cx+5+hx,36+hy,4,4,HULL);R(cx+7+hx,36+hy,2,2,HULL_L);
      // nose + crown stripe
      R(cx-1+hx,13+hy,3,3,HULL_S);
      R(cx-1+hx,16+hy,3,10,PALE);R(cx-2+hx,26+hy,4,22,PALE);R(cx-2+hx,26+hy,1,22,PALE_S);
      // eyes + visor band
      R(cx-6+hx,27+hy,2,2,ACC);R(cx+4+hx,27+hy,2,2,ACC);
      R(cx-7+hx,31+hy,5,2,ACC);R(cx+2+hx,31+hy,5,2,ACC);
      R(cx-7+hx,32+hy,5,1,ACC_S);R(cx+2+hx,32+hy,5,1,ACC_S);
    }
  }
}
if(!customElements.get('skunk-sprite'))customElements.define('skunk-sprite',SkunkSprite);
})();
