// <bat-sprite> — animated top-down pixel-art bat mech (faction 5 · crimson/bone).
// Flight pose: broad membrane wings stretched between bone finger-struts, scalloped trailing
// edge, small body, big ears. Wings flap in BOTH idle (slow) and walk (full).
// Layers: head / wings / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=214,H=124;
const INK='#1A0308',
MEM='#4A0D18',MEM_L='#641220',MEM_S='#340A12',
HULL='#7A1626',HULL_L='#A02234',HULL_S='#520E1B',
BONE='#EFE6DD',BONE_S='#C4B8AC',
ARM='#E01E37',ARM_H='#F0455A',GRY='#7A5560',GRY_S='#553A44',
BG='#454034',DOT='#3b382e',SHDW='#150406';
const cx=107;
// slim body [y0,y1,halfw]
const SP=[[42,47,7],[47,55,9],[55,62,9],[62,68,7],[68,72,5]];
class BatSprite extends HTMLElement{
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
    const ph=t*5.5;
    let bob,swayX;
    if(mode===0){bob=Math.round(Math.sin(t*1.6)*1);swayX=0;}
    else{bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);this._scroll+=.5;}
    if(stat){bob=0;swayX=0;}
    // wingbeat: slow glide-beat in idle, full beats in walk; tips travel most
    const fla=stat?0:(mode?Math.sin(ph*1.1):Math.sin(t*2.2));
    const amp=mode?7:3;
    const dy=(f)=>Math.round(fla*amp*f);
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (body)
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+swayX+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    // ---- wings (lowest layer: membrane behind, body/head paint over roots) ----
    if(!HP('wings')){
      for(const s of[-1,1]){
        const seg=(o0,y0,o1,y1,th,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2);
          for(let i=0;i<=n;i++){const x=cx+(s>0?sym(o0+dx*i/n):-sym(o0+dx*i/n)),y=Math.round(y0+dyy*i/n);R(x-o,y-o,th,th,c);}};
        // wing outline polygon — swept batwing: high outer peak + four scalloped lobes
        const wrist=[34,40+dy(.35)];
        const peak=[98,16+dy(1)];   // 1st bone (leading finger to the top corner) extended +10px
        const L1=[86,60+dy(.9)],L2=[76,70+dy(.8)],L3=[60,76+dy(.68)],L4=[44,84+dy(.56)];
        // curved trailing edge — each flap between finger tips bows inward toward the wrist (concave scallop)
        const outerTip=[92,36+dy(.95)];
        const tips=[peak,outerTip,L1,L2,L3,L4,[8,58]];
        const trail=[];
        for(let ti=0;ti<tips.length-1;ti++){const A=tips[ti],B=tips[ti+1];
          const mxp=(A[0]+B[0])/2,myp=(A[1]+B[1])/2;
          const pull=ti===0?0.47:0.34;   // deeper concave scallop between the 1st and 2nd bone
          const cpx=mxp+(wrist[0]-mxp)*pull,cpy=myp+(wrist[1]-myp)*pull;   // control pulled toward wrist
          const steps=6;
          for(let j=(ti?1:0);j<=steps;j++){const u=j/steps,iu=1-u;
            trail.push([iu*iu*A[0]+2*iu*u*cpx+u*u*B[0], iu*iu*A[1]+2*iu*u*cpy+u*u*B[1]]);}}
        const env=[[8,54],wrist,...trail];   // leading edge rides ON the forearm + peak bone (trail now starts at the peak)
        const poly=env.map(([ox,oy])=>[cx+(s>0?sym(ox):-sym(ox)),Math.round(oy+bob)]);
        // membrane fill (even-odd scanline)
        let minY=1e9,maxY=-1e9;for(const p of poly){minY=Math.min(minY,p[1]);maxY=Math.max(maxY,p[1]);}
        for(let y=minY;y<=maxY;y++){const xs=[];
          for(let i=0;i<poly.length;i++){const[x1,y1]=poly[i],[x2,y2]=poly[(i+1)%poly.length];
            if((y1<=y&&y2>y)||(y2<=y&&y1>y))xs.push(x1+(x2-x1)*(y-y1)/(y2-y1));}
          xs.sort((a,b)=>a-b);
          for(let k=0;k+1<xs.length;k+=2){const xa=Math.round(xs[k]),xb=Math.round(xs[k+1]);if(xb>=xa)R(xa,y,xb-xa+1,1,y<58?MEM_L:MEM);}}
        // membrane outline
        for(let i=0;i<poly.length-1;i++){const[x1,y1]=poly[i],[x2,y2]=poly[i+1];
          const dx=x2-x1,dyy=y2-y1,n=Math.max(Math.abs(dx),Math.abs(dyy),1);
          for(let j=0;j<=n;j++)R(Math.round(x1+dx*j/n),Math.round(y1+dyy*j/n),1,1,INK);}
        // finger bones (over membrane): forearm + struts to the peak and both lobe points
        seg(8,52,wrist[0],wrist[1],3,INK);seg(8,52,wrist[0],wrist[1],1,BONE);            // forearm
        for(const tp of[peak,outerTip,L1,L2,L3,L4]){seg(wrist[0],wrist[1],tp[0],tp[1],2,INK);seg(wrist[0],wrist[1],tp[0],tp[1],1,BONE_S);
          R(cx+(s>0?sym(tp[0]):-sym(tp[0]))-1,Math.round(tp[1]+bob)-1,2,2,BONE);}          // claw nub at each tip
        O(cx+(s>0?sym(wrist[0]):-sym(wrist[0]))-1,Math.round(wrist[1]+bob)-1,3,3,BONE_S);   // wrist knuckle
        seg(wrist[0],wrist[1],wrist[0]+6,wrist[1]-6,2,INK);seg(wrist[0],wrist[1],wrist[0]+6,wrist[1]-6,1,BONE); // thumb
      }
    }
    // ---- frame: small body over the wing roots ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-2+ox,y0+oy,2,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      R(cx-1+ox,42+oy,2,30,ARM);R(cx-1+ox,42+oy,1,30,ARM_H);        // spine keel
      for(const y of[52,59,66])R(cx-6+ox,y+oy,12,1,HULL_S);          // rib bars
      // twin glowing sensor ports (round, concentric — replaces the square bolts)
      for(const p of[cx-6,cx+6]){
        R(p-1+ox,49+oy,3,1,INK); R(p-2+ox,50+oy,5,3,INK); R(p-1+ox,53+oy,3,1,INK);  // round INK housing
        R(p-1+ox,50+oy,3,3,GRY); R(p-1+ox,50+oy,1,1,BONE_S);                          // steel ring + top highlight
        R(p+ox,51+oy,1,1,ARM_H);                                                       // glowing core
      }
      R(cx-3+ox,57+oy,1,1,ARM); R(cx+2+ox,57+oy,1,1,ARM);                              // status pips
    }
    // ---- head: armored skull flanked by ears (top-down — no face) ----
    if(!HP('head')){
      const hy=mode?0:bob;
      const HS=[[34,38,4],[38,43,6],[43,47,5]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2,y0+hy,2,y1-y0,HULL_S);R(cx-hw,y0+hy,1,y1-y0,HULL_L);}
      // ears — two sleek symmetric points (sign-mirrored, smooth taper)
      for(let r=0;r<11;r++){
        const yy=34-r+hy, inner=2, outer=Math.max(inner,6-Math.floor(r*0.5)), fw=outer-inner;
        R(cx+inner-1,yy,fw+2,1,INK);   R(cx-outer,yy,fw+2,1,INK);     // outlines (right, left mirror)
        if(fw>0){R(cx+inner,yy,fw,1,MEM_L); R(cx-outer+1,yy,fw,1,MEM_L);}
      }
      // top-down view: no eyes or mouth — armored crown plating + dorsal ridge
      R(cx-1,36+hy,2,11,ARM);R(cx-1,36+hy,1,11,ARM_H);
      for(const[bx,by]of[[-4,38],[2,38],[-3,44],[1,44]])R(cx+bx,by+hy,2,1,HULL_S);
    }
  }
}
if(!customElements.get('bat-sprite'))customElements.define('bat-sprite',BatSprite);
})();
