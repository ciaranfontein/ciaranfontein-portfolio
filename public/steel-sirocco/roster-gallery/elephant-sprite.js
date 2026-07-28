// <elephant-sprite> — animated top-down pixel-art elephant mech (faction 10 · desert tan / deep navy).
// Heaviest land frame: massive barrel body, huge fan ears flanking the skull, long tapering trunk
// with a slow side sway, paired ivory tusks, four pillar legs on round toenailed pads, short tail.
// No face features (top-down view) — only skull plating, ear veins and a shallow socket dimple.
// Layers: head / legsA / legsB / tail / frame
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=200,H=264;
const INK='#001B2A',HULL='#D4B996',HULL_L='#EDE6DD',HULL_S='#A88F6A',
ARM='#003049',ARM_S='#001B2A',ARM_H='#175C7E',GRY='#7C8B93',GRY_S='#4E5D66',
IVO='#F4EFE4',IVO_S='#C9BEA6',
BG='#454034',DOT='#3b382e',SHDW='#001019';
const cx=100;
// barrel torso [y0,y1,halfw]
const SP=[[80,88,30],[88,100,36],[100,120,40],[120,152,42],[152,182,40],[182,202,34],[202,214,26]];
// skull [y0,y1,halfw]
const HS=[[44,54,16],[54,66,20],[66,80,22]];
const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
class ElephantSprite extends HTMLElement{
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
    let bob,swayX,st4,earF,trunkS;
    if(mode===0){bob=Math.round(Math.sin(t*1.2)*1);swayX=0;st4=[0,0,0,0];
      earF=Math.sin(t*1.1);trunkS=Math.sin(t*.8)*4;}
    else{const ph=t*4;                                            // slow lumbering gait
      bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*2);
      this._scroll+=.45;
      const a=Math.round(Math.sin(ph)*8),b=Math.round(Math.sin(ph+Math.PI)*8);st4=[a,b,b,a];
      earF=Math.sin(ph*.9);trunkS=Math.sin(ph)*6;}
    if(stat){bob=0;swayX=0;st4=[0,0,0,0];earF=0;trunkS=0;}
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<110;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+swayX+3,y0+bob+4,hw*2,y1-y0,SHDW);}
    // ---- legs: four pillars on round toenailed pads ----
    const leg=(s,baseY,stride,d)=>{
      const bx=cx+swayX, py=baseY+stride+bob;
      const x0=s>0?bx+d:bx-d-12;                                  // block width 12 → exact mirror
      const fcx=x0+6, fcy=py+7, r=9;
      for(let d2=-r;d2<=r;d2++){const w=Math.round(Math.sqrt(Math.max(0,r*r-d2*d2)));if(w<=0)continue;
        R(fcx-w-1,fcy+d2,w*2+2,1,INK);}
      for(let d2=-r+1;d2<=r-1;d2++){const w=Math.round(Math.sqrt(Math.max(0,(r-1)*(r-1)-d2*d2)));if(w<=0)continue;
        R(fcx-w,fcy+d2,w*2,1,d2>r*.4?GRY_S:GRY);}                 // pad, heel shaded
      for(const ko of[-6,-3,2,5]){R(fcx+ko,fcy-r,2,5,INK);R(fcx+ko,fcy-r+1,2,3,IVO);}   // four flat toenails (mirror-exact)
      O(x0,py-16,12,20,ARM);R(x0+8,py-16,4,20,ARM_S);R(x0,py-16,2,20,ARM_H);   // thick pillar
      R(x0,py-9,12,2,ARM_S);                                      // knee band
      O(s>0?bx+d-3:bx-d-10,baseY-20+bob,13,10,GRY);               // shoulder / hip block
    };
    if(!HP('legsA')){leg(-1,120,st4[0],32);leg(1,120,st4[1],32);}
    if(!HP('legsB')){leg(-1,192,st4[2],34);leg(1,192,st4[3],34);}
    // ---- tail: short thin rope with a bristle tuft ----
    if(!HP('tail')){
      const rx=cx+swayX, sw=Math.round(Math.sin(t*1.5)*2)*(stat?0:1);
      for(let i=0;i<26;i++){const y=212+i+bob,x=rx+sym(sw*i/26);
        const th=i<18?5:4;R(x-((th/2)|0),y-((th/2)|0),th,th,INK);}
      for(let i=0;i<26;i++){const y=212+i+bob,x=rx+sym(sw*i/26);
        const th=i<18?3:2;R(x-((th/2)|0),y-((th/2)|0),th,th,i<18?HULL:HULL_S);}
      {const tx=rx+sym(sw),ty=238+bob;                            // bristle tuft
       for(const to of[-3,0,3]){R(tx+to-1,ty,3,7,INK);R(tx+to,ty+1,1,6,GRY);}}
    }
    // ---- frame: barrel torso with hide plating ----
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-4+ox,y0+oy,4,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,2,y1-y0,HULL_S);}  // symmetric edges
      R(cx-4+ox,80+oy,8,134,ARM);R(cx-2+ox,80+oy,4,134,ARM_H);    // spine ridge
      for(const y of[100,120,152,182])R(cx-26+ox,y+oy,52,2,HULL_S);   // hide fold bands
      for(let i=0;i<44;i++){const s2=(i*2654435761)%1000/1000, s3=((i*40503)%1000)/1000;
        const yy=88+Math.round(s2*120), hwv=SP.reduce((a,[a0,a1,h])=>(yy>=a0&&yy<a1?h:a),30);
        const xx=Math.round((s3*2-1)*(hwv-8));
        if(Math.abs(xx)>6)R(cx+xx+ox,yy+oy,2,1,HULL_S);}          // wrinkle stipple
      O(cx-40+ox,110+oy,7,14,GRY);R(cx-39+ox,112+oy,5,3,ARM_H);   // flank vents
      O(cx+33+ox,110+oy,7,14,GRY);R(cx+34+ox,112+oy,5,3,ARM_H);
    }
    // ---- head: skull, huge fan ears, tusks, trunk ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*8)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      // ears — narrow flaps raking out and back, per the top-down reference
      for(const s of[-1,1]){
        const flap=earF*(mode?3:1.5);
        const bxw=(a,w)=>s>0?cx+a:cx-a-w+1;                        // exact mirror for a w-wide block
        const ex0=14, ey0=36, ex1=46+flap, ey1=72;
        const n=Math.max(Math.abs(ex1-ex0),Math.abs(ey1-ey0));
        for(let i=0;i<=n;i++){const u=i/n,th=Math.round(12-u*7),
          px2=Math.round(ex0+(ex1-ex0)*u),py2=Math.round(ey0+(ey1-ey0)*u),a=px2-((th/2)|0);
          R(bxw(a,th)+hx,py2-((th/2)|0)+hy,th,th,INK);}
        for(let i=0;i<=n;i++){const u=i/n,th=Math.round(10-u*7),
          px2=Math.round(ex0+(ex1-ex0)*u),py2=Math.round(ey0+(ey1-ey0)*u),a=px2-((th/2)|0);
          R(bxw(a,th)+hx,py2-((th/2)|0)+hy,th,th,u<.45?HULL:HULL_S);}
        for(let i=3;i<n-2;i+=4){const u=i/n,                       // wrinkle ticks down the flap
          px2=Math.round(ex0+(ex1-ex0)*u),py2=Math.round(ey0+(ey1-ey0)*u);
          R(bxw(px2-1,2)+hx,py2+hy,2,1,HULL_S);}
      }
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-3+hx,y0+hy,3,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,3,y1-y0,HULL_S);}
      R(cx-3+hx,46+hy,6,32,ARM);R(cx-1+hx,46+hy,2,32,ARM_H);      // domed crown ridge
      for(const so of[-10,7])R(cx+so+hx,58+hy,3,2,HULL_S);        // socket dimples (no eyes)
      // tusks — ivory, curving forward and inward
      for(const s of[-1,1]){
        for(let i=0;i<30;i++){const f=i/29, y=Math.round(46-f*34)+hy,
          xo=sym(s*(13-f*f*7)), th=Math.max(2,Math.round(6-f*4));
          R(cx+xo+hx-((th+2)/2|0),y-((th+2)/2|0),th+2,th+2,INK);}
        for(let i=0;i<30;i++){const f=i/29, y=Math.round(46-f*34)+hy,
          xo=sym(s*(13-f*f*7)), th=Math.max(1,Math.round(4-f*3));
          R(cx+xo+hx-((th/2)|0),y-((th/2)|0),th,th,f<.6?IVO:IVO_S);}
      }
      // trunk — long tapering tube swaying at the tip
      const tN=44;
      for(let i=0;i<=tN;i++){const f=i/tN, y=Math.round(50-f*44)+hy,
        xo=sym(trunkS*f*f), th=Math.round(18-f*12);
        R(cx+xo+hx-((th+2)/2|0),y-1,th+2,2,INK);}
      for(let i=0;i<=tN;i++){const f=i/tN, y=Math.round(50-f*44)+hy,
        xo=sym(trunkS*f*f), th=Math.round(16-f*11);
        R(cx+xo+hx-((th/2)|0),y,th,1,HULL);
        R(cx+xo+hx+((th/2)|0)-2,y,2,1,HULL_S);
        if(i%3===0)R(cx+xo+hx-((th/2)|0),y,th,1,HULL_S);}          // ringed segments
      {const f=1,y=Math.round(50-44)+hy,xo=sym(trunkS);            // tip pad
       O(cx+xo+hx-3,y-3,6,4,HULL_S);R(cx+xo+hx-2,y-2,4,1,GRY_S);}
    }
  }
}
if(!customElements.get('elephant-sprite'))customElements.define('elephant-sprite',ElephantSprite);
})();
