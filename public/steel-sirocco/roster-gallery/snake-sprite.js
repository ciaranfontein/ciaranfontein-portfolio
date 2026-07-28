// <snake-sprite> — animated top-down pixel-art snake mech (faction 1 · rot greens).
// Long serpentine body driven by a traveling sine wave: gentle ripple in idle,
// full slither in walk. Layers: head / frame (body) / tail.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="head,frame,tail"
(function(){
const W=110,H=300;
const INK='#052E16',HULL='#7CB342',HULL_L='#9CCB6B',HULL_S='#5E8C32',
ARM='#33691E',ARM_S='#224712',ARM_H='#4A8629',GRY='#6F7F5C',GRY_S='#4E5A40',
ACC='#C9E265',ACC_S='#96AE3B',
BG='#454034',DOT='#3b382e',SHDW='#343c28';
const cx=55;
// body half-profile: segment widths, y=50..218 step 8
const BW=[14,16,18,20,21,22,22,22,22,21,20,19,18,17,16,15,14,13,12,12,12];
class SnakeSprite extends HTMLElement{
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
    // traveling wave: idle = faint ripple, walk = slither; damped toward the head
    const wave=(y)=>{
      if(stat)return 0;
      const amp=mode?8:2.5, k=mode?0.05:0.028, sp=mode?5.5:1.5;
      const damp=Math.min(1,.35+Math.max(0,y-30)/90*.65);
      return Math.sin(t*sp-y*k)*amp*damp;
    };
    if(mode&&!stat)this._scroll+=.5;
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (per layer, follows the wave)
    if(!HP('head')){for(const[y,hw]of[[14,4],[18,6],[24,9],[30,11],[36,8]]){const off=Math.round(wave(y));R(cx-hw+off+2,y+3,hw*2,6,SHDW);}}
    if(!HP('frame')){for(let i=0;i<BW.length;i++){const y=50+i*8,hw=BW[i]/2,off=Math.round(wave(y+4));R(cx-hw+off+2,y+3,BW[i],8,SHDW);}}
    if(!HP('tail')){for(let i=0;i<7;i++){const y=218+i*7,w=10-i*.9;const off=Math.round(wave(y+3)*(1+i*.12));R(cx-w/2+off+2,y+3,w,7,SHDW);}}
    // ---- tail (under body end) ----
    if(!HP('tail')){
      const idleSw=stat?0:(mode?0:Math.sin(t*1.1)*2);
      let tipX=cx,tipY=218;
      for(let i=0;i<7;i++){
        const y=218+i*7,w=Math.max(4,10-i);
        const off=Math.round(wave(y+3)*(1+i*.12)+idleSw*i/7);
        O(cx-w/2+off,y,w,7,i%2?GRY:HULL);
        R(cx-w/2-1+off,y,w+2,2,ARM_S);
        R(cx+w/2-1+off,y,1,7,HULL_S);
        tipX=cx+off;tipY=y+7;
      }
      // rattle: stacked dark segments, vibrates during slither
      const rx=stat?0:(mode?Math.round(Math.sin(t*28)):0);
      for(let i=0;i<3;i++){const w=7-i;O(tipX-w/2+rx,tipY+i*5,w,5,ARM);R(tipX-w/2+rx,tipY+i*5,1,5,ARM_H);}
      R(tipX-1+rx,tipY+15,2,2,ACC);
    }
    // ---- body ----
    if(!HP('frame')){
      for(let i=0;i<BW.length;i++){
        const y=50+i*8,w=BW[i],hw=w/2,off=Math.round(wave(y+4));
        O(cx-hw+off,y,w,8,HULL);
        R(cx+hw-3+off,y,3,8,HULL_S);
        R(cx-hw+off,y,1,8,HULL_L);
        // joint ring every 3rd segment
        if(i%3===0){R(cx-hw-1+off,y,w+2,2,ARM_S);R(cx-hw-1+off,y+2,w+2,1,ARM);}
        // panel hairline between rings
        else if(i%3===1&&w>14)R(cx-6+off,y+4,12,1,HULL_S);
        // spine channel
        R(cx-1+off,y,3,8,ARM);R(cx-1+off,y,1,8,ARM_H);
      }
    }
    // ---- head ----
    if(!HP('head')){
      const hoff=Math.round(wave(30)), noff=Math.round(wave(46));
      const hy=stat?0:(mode?Math.round(Math.cos(t*5.5)):0);
      // neck: hull taper bridging head rear into the first body segment
      for(const[y0,y1,hw]of[[42,46,6],[46,51,7]]){const no2=Math.round(wave(y0+2));R(cx-hw-1+no2,y0-1+hy,hw*2+2,y1-y0+2,INK);R(cx-hw+no2,y0+hy,hw*2,y1-y0,HULL);R(cx+hw-2+no2,y0+hy,2,y1-y0,HULL_S);R(cx-hw+no2,y0+hy,1,y1-y0,HULL_L);}
      // arrowhead wedge: smooth taper snout→wide rear flare, no muzzle step
      const HS=[[14,17,3],[17,20,5],[20,24,7],[24,28,9],[28,34,11],[34,38,10],[38,42,7]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hoff,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hoff,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hoff,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hoff,y0+hy,1,y1-y0,HULL_L);}
      R(cx-2+hoff,12+hy,4,3,ARM);                                       // nose tip
      R(cx-2+hoff,13+hy,1,1,INK);R(cx+1+hoff,13+hy,1,1,INK);            // pits
      R(cx-10+hoff,29+hy,2,3,ACC);R(cx+8+hoff,29+hy,2,3,ACC);           // eyes on the flare
      R(cx-7+hoff,33+hy,14,3,ACC);R(cx-7+hoff,35+hy,14,1,ACC_S);        // visor band
      R(cx-6+hoff,25+hy,12,1,HULL_S);                                   // brow seam
      R(cx-1+hoff,38+hy,2,5,ARM_S);                                     // head stripe
      // forked tongue flick
      const flick=stat?0:Math.sin(t*(mode?9:2.6));
      if(flick>.55){
        R(cx-1+hoff,9+hy,2,3,ACC_S);
        R(cx-2+hoff,6+hy,1,4,ACC);R(cx+1+hoff,6+hy,1,4,ACC);
      }
    }
  }
}
if(!customElements.get('snake-sprite'))customElements.define('snake-sprite',SnakeSprite);
})();
