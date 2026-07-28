// <toad-sprite> — animated top-down pixel-art toad mech (faction 2 · ember corals).
// Squat wide tank: blunt head with fused eye bulges, warty hull, big folded rear
// haunches with webbed mitten feet. Walk = hop cycle (rear legs kick, body lunges).
// Layers: head / legsA (front) / legsB (rear haunches) / frame. No tail.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=150,H=210;
const INK='#2E2A28',HULL='#E76F51',HULL_L='#F0937C',HULL_S='#B85039',
ARM='#514843',ARM_S='#3B3430',ARM_H='#665A53',GRY='#8A7A72',GRY_S='#635850',
RED='#D62828',RED_S='#A31D1D',
BG='#454034',DOT='#3b382e',SHDW='#3a352f';
const cx=75;
// squat body spans [y0,y1,halfw]
const SP=[[58,66,17],[66,78,21],[78,96,24],[96,114,25],[114,130,23],[130,142,19],[142,150,13]];
class ToadSprite extends HTMLElement{
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
    // hop drive: k = 0 folded → 1 extended
    const ph=t*4;
    const k=stat?0:(mode?Math.max(0,Math.sin(ph)):0);
    const bob=stat?0:(mode?-Math.round(k*2):Math.round(Math.sin(t*1.5)*1));
    if(mode&&!stat)this._scroll+=k*.8;
    // idle throat pulse
    const p=stat?0:(mode?0:(Math.sin(t*2.4)>.3?1:0));
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('head')){for(const[y,hw]of[[28,9],[36,15],[46,17]]){R(cx-hw+2,y+3+bob,hw*2,10,SHDW);}}
    if(!HP('frame')){for(let i=0;i<SP.length;i++){const[y0,y1,hw]=SP[i];R(cx-hw+2,y0+bob+3,hw*2,y1-y0,SHDW);}}
    if(!HP('legsB')){R(cx-25-10+2,112+bob+3,12,22,SHDW);R(cx+25-2+2,112+bob+3,12,22,SHDW);}
    // ---- front legs: short props with small mitten feet ----
    const seg=(x0,y0,x1,y1,th,c)=>{
      const dx=x1-x0,dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy),1),o=Math.floor(th/2);
      for(let i=0;i<=n;i++){const x=Math.round(x0+dx*i/n),y=Math.round(y0+dy*i/n);R(x-o,y-o,th,th,c);}
    };
    if(!HP('legsA')){
      for(const s of[-1,1]){
        const lift=mode?-Math.round(k*1):0;
        const ax=cx+s*20, ly=70+bob;
        const fx=ax+s*6, fy=ly+9+lift;
        O(fx-4,fy-1,8,6,HULL);R(fx-4,fy+3,8,2,HULL_S);          // foot pad under limb
        O(fx-4,fy-4,3,3,HULL_L);O(fx,fy-4,3,3,HULL_L);          // two toe bumps forward
        seg(ax,ly,fx,fy,7,INK);seg(ax,ly,fx,fy,5,HULL);
        O(ax-2,ly-2,5,5,GRY);                                    // shoulder
      }
    }
    // ---- rear haunches: folded Z-legs, kick backward on hop ----
    if(!HP('legsB')){
      for(const s of[-1,1]){
        const ext=Math.round(k*6);
        const bx=cx+s*23+(s>0?-2:-10);
        const sx=cx+s*26+(s>0?-1:-6);
        const fx=cx+s*22, fy=136+ext+bob;
        // webbed mitten foot pointing back, under everything
        O(fx-5,fy-2,10,8,HULL);R(fx-5,fy+4,10,2,HULL_S);
        O(fx-5,fy+7,3,3,HULL_L);O(fx-1,fy+8,3,3,HULL_L);O(fx+3,fy+7,3,3,HULL_L); // toe scallops backward
        // shin
        O(sx,124+Math.round(ext*.5)+bob,7,8+Math.round(ext*.6),HULL_S);
        // thigh mass fused to the body side
        O(bx,110+bob,12,18,HULL);R(bx+(s>0?9:0),110+bob,3,18,HULL_S);R(bx+(s>0?0:11),110+bob,1,18,HULL_L);
        R(bx+2,118+bob,8,1,HULL_S);                              // thigh seam
        O(cx+s*21+(s>0?-2:-3),126+bob,5,5,GRY);                  // knee joint
      }
    }
    // ---- body ----
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1,y0-1+bob,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw,y0+bob,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3,y0+bob,3,y1-y0,HULL_S);R(cx-hw,y0+bob,1,y1-y0,HULL_L);}
      // spine channel
      R(cx-1,58+bob,3,88,ARM);R(cx-1,58+bob,1,88,ARM_H);
      // parotoid pair behind the head
      R(cx-12,64+bob,4,3,RED);R(cx-12,66+bob,4,1,RED_S);
      R(cx+8,64+bob,4,3,RED);R(cx+8,66+bob,4,1,RED_S);
      // warts: raised hull bumps
      for(const[wx,wy]of[[-14,84],[9,90],[-8,120],[13,108],[-16,102],[4,132]]){
        R(cx+wx,wy+bob,2,2,HULL_S);R(cx+wx,wy+bob,1,1,HULL_L);
      }
      // panel seams
      R(cx-12,78+bob,24,1,HULL_S);R(cx-12,114+bob,24,1,HULL_S);
    }
    // ---- head: wide blunt wedge with fused eye bulges ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(k*1):Math.round(Math.sin(t*1.1)*1));
      const hx=mode?0:hb, hy=bob+(mode?-hb:0);
      const HS=[[26,34,10],[34,42,14],[42,50,16],[50,58,16]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // fused eye bulges on the brow corners
      O(cx-17+hx,30+hy,5,8,HULL);R(cx-17+hx,31+hy,1,6,HULL_L);R(cx-14+hx,32+hy,2,2,HULL_S);
      O(cx+12+hx,30+hy,5,8,HULL);R(cx+16+hx,31+hy,1,6,HULL_S);R(cx+12+hx,32+hy,2,2,HULL_S);
      // nostrils
      R(cx-3+hx,28+hy,1,1,INK);R(cx+2+hx,28+hy,1,1,INK);
      // throat plate — pulses in idle
      R(cx-4-p+hx,52+hy,8+p*2,4,HULL_L);R(cx-4-p+hx,55+hy,8+p*2,1,HULL_S);
    }
  }
}
if(!customElements.get('toad-sprite'))customElements.define('toad-sprite',ToadSprite);
})();
