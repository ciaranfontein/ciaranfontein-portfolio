// <ant-sprite> — animated top-down pixel-art ant mech (faction 8 · earth brown / sandy accents).
// Three-part chassis: armoured head with mandible pincers (no antennae), humped mesosoma, narrow
// petiole node, big teardrop gaster. Six legs in an alternating tripod gait.
// No face features (top-down view) — only plating seams and shallow socket dimples.
// Layers: head / legsA / legsB / tail / frame
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=150,H=200;
const INK='#1A0F0A',HULL='#5D4037',HULL_L='#8A6350',HULL_S='#3E2620',
ARM='#A1887F',ARM_S='#6D584F',ARM_H='#C4AFA4',GRY='#7A6155',GRY_S='#4A362E',
ACC='#F4A261',ACC_S='#B87333',
BG='#454034',DOT='#3b382e',SHDW='#120A06';
const cx=75;
// mesosoma (thorax) spans [y0,y1,halfw]
const MS=[[50,58,9],[58,70,15],[70,92,18],[92,106,15],[106,116,10]];
// six legs — [rootY, kneeXoff, kneeY, footXoff, footY] in half-space (mirrored)
const LEGS=[
  [60,34,50,54,66],
  [80,34,70,54,86],
  [100,34,90,54,106],
];
class AntSprite extends HTMLElement{
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
    const ph=t*4.6;
    let bob,swayX,triA,triB,flexA,flexB,ant;
    if(mode===0){bob=Math.round(Math.sin(t*1.8)*1);swayX=0;triA=0;triB=0;
      flexA=Math.sin(t*1.6)*.25;flexB=-flexA;ant=Math.sin(t*2.4)*2;}
    else{bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);
      this._scroll+=.6;
      triA=Math.sin(ph)*3.5;triB=Math.sin(ph+Math.PI)*3.5;
      flexA=Math.cos(ph);flexB=Math.cos(ph+Math.PI);ant=Math.sin(ph*.7)*2.5;}
    if(stat){bob=0;swayX=0;triA=0;triB=0;flexA=0;flexB=0;ant=0;}
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame'))for(const[y0,y1,hw]of MS)R(cx-hw+swayX+3,y0+bob+4,hw*2,y1-y0,SHDW);
    // ---- legs: alternating tripod, drawn under the body ----
    const legPair=(li,s,stride,flex)=>{
      const px=(o)=>s>0?cx+sym(o)+swayX:cx-sym(o)+swayX;
      const segL=(o0,y0,o1,y1,th,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2);
        for(let i=0;i<=n;i++){R(px(o0+dx*i/n)-o,Math.round(y0+dyy*i/n)-o,th,th,c);}};
      const[ry,kx,ky,fx,fy]=LEGS[li];
      const p=stride/3.5;                                                       // -1..1 fore/aft
      const kx2=kx+flex*5, ky2=ky-p*4;                                          // femur folds in / extends out
      const fx2=fx+flex*4, fy2=fy-p*10;                                         // tibia swings through the stride
      segL(9,ry+bob,kx2,ky2+bob,5,INK);segL(kx2,ky2+bob,fx2,fy2+bob,4,INK);      // outline
      segL(9,ry+bob,kx2,ky2+bob,3,ARM);segL(kx2,ky2+bob,fx2,fy2+bob,2,ARM_S);    // femur / tibia
      R(px(kx2)-2,ky2+bob-2,4,4,INK);R(px(kx2)-1,ky2+bob-1,2,2,GRY);             // knee joint
      R(px(fx2)-1,fy2+bob-1,3,3,INK);R(px(fx2)-1,fy2+bob,2,2,ACC_S);             // clawed foot
    };
    if(!HP('legsA')){legPair(0,-1,triA,flexA);legPair(0,1,triB,flexB);legPair(1,-1,triB,flexB);legPair(1,1,triA,flexA);}
    if(!HP('legsB')){legPair(2,-1,triA,flexA);legPair(2,1,triB,flexB);}
    // ---- tail: teardrop gaster on a petiole node ----
    if(!HP('tail')){
      const ox=swayX+Math.round(Math.sin(t*1.5)*(mode?1.5:.8)), gy=128;
      O(cx-3+swayX,116+bob,6,8,ARM);R(cx-3+swayX,121+bob,6,2,ARM_S);            // petiole
      O(cx-5+ox,122+bob,10,8,HULL);R(cx-5+ox,128+bob,10,2,HULL_S);             // post-petiole node
      const ghw=(y)=>{const u=(y-gy)/46;if(u<0||u>=1)return 0;
        const swell=Math.sin(Math.PI*Math.pow(u,.55));
        return Math.max(2,Math.round(5*(1-u)+15*swell*(1-u*.25)));};   // starts at the node's width, swells, tapers to a point
      for(let y=gy;y<gy+58;y++){const hw=ghw(y);if(hw<=0)continue;R(cx-hw-1+ox,y+bob,hw*2+2,1,INK);}
      for(let y=gy;y<gy+58;y++){const hw=ghw(y);if(hw<=0)continue;
        R(cx-hw+ox,y+bob,hw*2,1,HULL);
        R(cx+hw-3+ox,y+bob,3,1,HULL_S);R(cx-hw+ox,y+bob,3,1,HULL_S);}          // symmetric rim shading
      for(const gyy of[136,146,156,166]){const hw=ghw(gyy);if(hw<=2)continue;  // tergite bands
        R(cx-hw+3+ox,gyy+bob,hw*2-6,1,HULL_S);R(cx-hw+3+ox,gyy+1+bob,hw*2-6,1,HULL_L);}
      R(cx-1+ox,gy+2+bob,3,40,HULL_L);                                          // dorsal midline
      R(cx-2+ox,170+bob,5,4,ACC_S);R(cx-1+ox,172+bob,3,3,ACC);                  // acidopore tip
    }
    // ---- frame: humped mesosoma ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      O(cx-5+ox,44+oy,10,10,HULL);                                              // neck bridging head → thorax
      R(cx+2+ox,44+oy,3,10,HULL_S);R(cx-5+ox,44+oy,3,10,HULL_S);
      for(const[y0,y1,hw]of MS)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of MS)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of MS){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,3,y1-y0,HULL_S);}
      for(const y of[64,78,88])R(cx-9+ox,y+oy,19,1,HULL_S);                     // segment seams
      R(cx-2+ox,50+oy,5,46,ARM);R(cx-1+ox,50+oy,3,46,ARM_H);                    // spine ridge
      for(const s of[-1,1]){const px2=s>0?cx+sym(10)+ox:cx-sym(10)-3+ox;        // propodeal spines
        R(px2,84+oy,4,7,INK);R(px2+(s>0?0:1),85+oy,3,5,ARM);}
    }
    // ---- head: mandible pincers, no face features ----
    if(!HP('head')){
      const hb=stat?0:(mode?0:Math.round(Math.sin(t*1.4)*1));
      const hx=swayX+(mode?0:hb), hy=bob+(mode?hb:0);
      const HS=[[20,26,9],[26,38,13],[38,46,10]];
      // mandibles — paired curved blades meeting at the front
      for(const s of[-1,1]){
        const px=(o)=>s>0?cx+sym(o)+hx:cx-sym(o)+hx;
        for(const[o,y,w,h]of[[6,14,4,5],[7,11,3,4],[6,8,3,3],[4,6,3,3],[2,5,3,2]]){
          const a=s>0?o:o;R(px(a)-((w/2)|0)-1,y+hy-1,w+2,h+2,INK);}
        for(const[o,y,w,h,c]of[[6,14,2,5,ARM],[7,11,2,4,ARM],[6,8,2,3,ARM_H],[4,6,2,3,ARM_H],[2,5,2,2,ACC]]){
          R(px(o)-((w/2)|0),y+hy,w,h,c);}
      }
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-3+hx,y0+hy,3,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,3,y1-y0,HULL_S);}
      R(cx-2+hx,20+hy,5,26,ARM);R(cx-1+hx,20+hy,3,26,ARM_H);                    // crown ridge
      for(const s of[-1,1]){const px2=(s>0?cx+sym(7):cx-sym(7))+hx;             // shallow socket dimples
        R(px2-1,29+hy,3,2,HULL_S);}
      for(const s of[-1,1]){const px2=(s>0?cx+sym(9):cx-sym(9))+hx;             // cheek plating
        R(px2-1,36+hy,3,4,HULL_L);}
    }
  }
}
if(!customElements.get('ant-sprite'))customElements.define('ant-sprite',AntSprite);
})();
