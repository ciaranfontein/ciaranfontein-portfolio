// <beetle-sprite> — animated top-down pixel-art rhinoceros-beetle mech (faction 7 · orange/magenta).
// Build: big pincer fangs, small head, armored pronotum, hard domed elytra with a centre seam and
// longitudinal striations, six thick clawed legs (alternating tripod gait in walk).
// No face features — top-down view shows only plating, seams and the fangs.
// Layers: head / legsA (front) / legsB (mid) / legsC (rear) / frame
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=130,H=170;
const INK='#1A0A05',HULL='#FF5400',HULL_L='#FF8A3D',HULL_S='#B83500',
ARM='#262626',ARM_S='#141414',ARM_H='#3D3D3D',GRY='#6B5A50',GRY_S='#3F332C',
ACC='#FF006E',ACC_S='#B00049',BEI='#E8DCC0',BEI_S='#A8956E',
BG='#454034',DOT='#3b382e',SHDW='#120603';
const cx=65;
// armored pronotum (thorax plate) [y0,y1,halfw]
const PN=[[46,54,13],[54,64,17],[64,72,19]];
// hard domed elytra (wing cases) [y0,y1,halfw]
const EL=[[70,78,18],[78,88,23],[88,104,26],[104,120,25],[120,134,21],[134,146,15]];
// small head [y0,y1,halfw]
const HD=[[34,40,8],[40,48,10]];
// six legs — [rootXoff,rootY, kneeXoff,kneeY, footXoff,footY]
const LEGS=[
  [13,60, 27,48, 36,33],   // front — reach forward
  [17,90, 32,86, 43,95],   // mid — straight out
  [15,122, 29,131, 37,148],// rear — trail back
];
class BeetleSprite extends HTMLElement{
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
    const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
    let bob,swayX,ph;
    if(mode===0){bob=Math.round(Math.sin(t*1.8)*1);swayX=0;ph=t*1.8;}
    else{ph=t*6.5;bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);this._scroll+=.5;}
    if(stat){bob=0;swayX=0;}
    // alternating tripod gait: front+rear of one side move with mid of the other
    const strideOf=(s,pair)=>{if(stat)return 0;
      const tri=(pair===1?-s:s);                       // mid leg opposes its own side's outer legs
      return mode?Math.round(Math.sin(ph+(tri>0?0:Math.PI))*4):Math.round(Math.sin(t*1.8+pair)*1);};
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){for(const[y0,y1,hw]of PN.concat(EL))R(cx-hw+swayX+3,y0+bob+4,hw*2,y1-y0,SHDW);}
    // ---- legs (bottom layer) ----
    const legPair=(pair,key)=>{
      if(HP(key))return;
      const[rxo,ry,kxo,ky,fxo,fy]=LEGS[pair];
      for(const s of[-1,1]){
        const stx=strideOf(s,pair);
        const px=(o)=>cx+swayX+(s>0?sym(o):-sym(o));
        const segL=(o0,y0,o1,y1,th,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2),
          adj=(th%2===0&&s<0)?1:0;                                                    // even widths need a 1px shift to mirror exactly
          for(let i=0;i<=n;i++){R(px(o0+dx*i/n)-o+adj,Math.round(y0+dyy*i/n)-o,th,th,c);}};
        const ky2=ky+stx, fy2=fy+stx*1.6;
        {const fx2=px(fxo),fyy=fy2+bob;                                              // paired hooked claws — drawn UNDER the limb
         const dx=fxo-kxo,dyy=fy2-ky2,n=Math.max(Math.abs(dx),Math.abs(dyy),1);
         const hux=dx/n,huy=dyy/n,hpx=-huy,hpy=hux;                                  // heading + perpendicular, half-space
         const tips=[-1,1].map(side=>{const oxh=hux*4.5+hpx*side*4.5,oyh=huy*4.5+hpy*side*4.5;
           return [fx2+(s>0?oxh:-oxh), fyy+oyh];});
         const claw=(tx,ty,c,th)=>{const dxc=tx-fx2,dyc=ty-fyy,nn=Math.max(Math.abs(dxc),Math.abs(dyc),1),o=(th-1)/2;
           for(let i=0;i<=nn;i++)R(Math.round(fx2+dxc*i/nn)-o,Math.round(fyy+dyc*i/nn)-o,th,th,c);};
         for(const[tx,ty]of tips)claw(tx,ty,INK,3);                                   // outlines first
         for(const[tx,ty]of tips){claw(tx,ty,GRY,1);R(Math.round(tx),Math.round(ty),1,1,BEI_S);}
         R(fx2-1,fyy-1,3,3,INK);R(fx2,fyy,1,1,ARM_H);}                                // ankle knuckle
        segL(rxo,ry+bob,kxo,ky2+bob,6,INK);segL(kxo,ky2+bob,fxo,fy2+bob,5,INK);      // outline
        segL(rxo,ry+bob,kxo,ky2+bob,4,ARM);segL(kxo,ky2+bob,fxo,fy2+bob,3,ARM_H);    // femur / tibia
        segL(rxo,ry+bob,kxo,ky2+bob,2,ARM_S);                                        // femur shading
        {const jx=px(kxo),jy=ky2+bob;R(jx-3,jy-3,7,7,INK);R(jx-2,jy-2,5,5,GRY);R(jx,jy,1,1,GRY_S);}  // knee
      }
    };
    legPair(0,'legsA');legPair(1,'legsB');legPair(2,'legsC');
    // ---- frame: pronotum + hard elytra shell ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const[y0,y1,hw]of PN.concat(EL))R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of PN)R(cx-hw+ox,y0+oy,hw*2,y1-y0,ARM);                    // dark chitin pronotum
      for(const[y0,y1,hw]of PN){R(cx+hw-3+ox,y0+oy,3,y1-y0,ARM_S);R(cx-hw+ox,y0+oy,2,y1-y0,ARM_H);}
      for(const[y0,y1,hw]of EL)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);                   // orange elytra
      for(const[y0,y1,hw]of EL){R(cx+hw-4+ox,y0+oy,4,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,2,y1-y0,HULL_L);}
      // pronotum plating seams + magenta vents
      for(const y of[52,60,68])R(cx-11+ox,y+oy,22,1,ARM_S);
      R(cx-15+ox,58+oy,5,5,ACC);R(cx-15+ox,61+oy,5,2,ACC_S);
      R(cx+10+ox,58+oy,5,5,ACC);R(cx+10+ox,61+oy,5,2,ACC_S);
      // elytra centre seam (the wing-case split) — dark channel with a bright catch edge
      R(cx-2+ox,70+oy,4,76,ARM);R(cx-2+ox,70+oy,1,76,ARM_H);R(cx+1+ox,70+oy,1,76,ARM_S);
      // longitudinal striations, mirrored
      for(const so of[8,14,20]){for(let y=76;y<142;y+=3){
        const hw=(()=>{for(const[y0,y1,h]of EL)if(y>=y0&&y<y1)return h;return 0;})();
        if(so<hw-3){R(cx+sym(so)+ox,y+oy,1,2,HULL_S);R(cx-sym(so)+ox,y+oy,1,2,HULL_S);}}}
      // shoulder bolts on the elytra front edge
      O(cx-16+ox,74+oy,5,5,GRY);R(cx-15+ox,75+oy,3,3,ACC);
      O(cx+11+ox,74+oy,5,5,GRY);R(cx+12+ox,75+oy,3,3,ACC);
      // abdomen tip peeking past the shell
      R(cx-7+ox,145+oy,14,7,INK);R(cx-6+ox,146+oy,12,5,ARM);R(cx-6+ox,146+oy,12,2,ARM_H);
    }
    // ---- head + fangs (drawn over the pronotum) ----
    if(!HP('head')){
      const hy=mode?0:bob, hx=swayX;
      // chelicerae plate under the head front
      O(cx-8+hx,40+hy,16,4,GRY_S);R(cx-8+hx,40+hy,16,1,GRY);
      for(const[y0,y1,hw]of HD)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HD)R(cx-hw+hx,y0+hy,hw*2,y1-y0,ARM);
      for(const[y0,y1,hw]of HD){R(cx+hw-3+hx,y0+hy,3,y1-y0,ARM_S);R(cx-hw+hx,y0+hy,2,y1-y0,ARM_H);}
      R(cx-6+hx,42+hy,12,1,ARM_S);                                        // clypeus seam
      // two big paired pincer fangs — same build as the spider: deep outward bow curling
      // back to forward venom points between the tips
      for(const s of[-1,1]){
        const X=(o,w)=>cx+hx+(s>0?o:-o-w);
        R(X(8,8),31+hy,8,8,INK);R(X(12,6),25+hy,6,8,INK);R(X(12,5),22+hy,5,4,INK);
        R(X(10,5),19+hy,5,4,INK);R(X(9,4),17+hy,4,3,INK);R(X(8,4),15+hy,4,3,INK);
        R(X(9,6),32+hy,6,6,BEI);                                          // heavy base, flaring outward
        R(X(13,4),26+hy,4,7,BEI);                                         // thick widest point of the bow
        R(X(13,3),23+hy,3,4,BEI);                                         // curl back inward
        R(X(11,3),20+hy,3,4,BEI_S);
        R(X(10,2),18+hy,2,3,BEI_S);
        R(X(9,2),16+hy,2,3,BEI_S);
        R(X(10,1),33+hy,1,5,BEI_S);R(X(14,1),27+hy,1,5,BEI_S);            // hard shading down the outer edge
        R(X(9,2),15+hy,2,1,ACC);R(X(10,1),17+hy,1,2,ACC);                 // venom on the inner face
      }
    }
  }
}
if(!customElements.get('beetle-sprite'))customElements.define('beetle-sprite',BeetleSprite);
})();
