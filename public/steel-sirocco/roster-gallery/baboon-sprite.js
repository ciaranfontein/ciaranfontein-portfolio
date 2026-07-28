// <baboon-sprite> — animated top-down pixel-art baboon mech (faction 9 · lavender/violet).
// Quadruped chassis with the baboon signature: high broad shoulders carrying a heavy mane ruff,
// narrow hips, long forward muzzle, and a tail that arcs out then kinks sharply down.
// No face features from directly above (top-down) — only shallow socket dimples.
// Layers: head / legsA / legsB / tail / frame
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=150,H=215;
const INK='#10002B',HULL='#B497BD',HULL_L='#D4C2DA',HULL_S='#8A6E96',
ARM='#3E2456',ARM_S='#26123A',ARM_H='#5A3878',GRY='#7A6288',GRY_S='#584467',
ACC='#9D4EDD',ACC_S='#6E2FA8',FUR='#C9B3D2',FUR_S='#9A82A6',
BEI='#E8DCC0',BEI_S='#B8A87E',
BG='#454034',DOT='#3b382e',SHDW='#08001A';
const cx=75;
// torso: broad high shoulders → narrow waist → compact hips
const SP=[[56,60,15],[60,70,19],[70,82,20],[82,94,17],[94,110,14],[110,122,15],[122,134,17],[134,144,14],[144,152,10]];
class BaboonSprite extends HTMLElement{
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
    let bob,swayX,tailS,st4,stA;
    if(mode===0){bob=Math.round(Math.sin(t*2)*1);swayX=0;tailS=Math.sin(t*1.3)*3;st4=[0,0,0,0];stA=[0,0];}
    else{const ph=t*6.4;bob=Math.round(Math.sin(ph*2)*2);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*2.4;
      this._scroll+=.55;
      const a=Math.round(Math.sin(ph)*7),b=Math.round(Math.sin(ph+Math.PI)*7);st4=[a,b,b,a];
      stA=[Math.round(Math.sin(ph)*9),Math.round(Math.sin(ph+Math.PI)*9)];}   // arms swing wider — monkey lope
    if(stat){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];stA=[0,0];}
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<80;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+swayX+3,y0+bob+4,hw*2,y1-y0,SHDW);}
    if(!HP('head')){for(const[y,hw]of[[36,11],[46,10]])R(cx-hw+3,y+4+bob,hw*2,10,SHDW);}
    // ---- limbs (bottom layer): long reaching arms in front, short legs behind ----
    const limb=(s,baseY,stride,arm,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+8:-(hw+12));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+4+(arm?8:0);
      const pw=arm?13:10;
      if(arm){
        const fcx=x0+2, fy0=py-8, r=5.5;                                               // closed knuckle-walking fist (fcx mirrors exactly)
        const fhw=(d)=>Math.round(Math.sqrt(Math.max(0,r*r-d*d)));
        for(let d=-5;d<=5;d++){const w=fhw(d);if(w<=0)continue;R(fcx-w-1,fy0+5+d,w*2+2,1,INK);}
        for(let d=-5;d<=5;d++){const w=fhw(d);if(w<=0)continue;R(fcx-w,fy0+5+d,w*2,1,d>2?ARM_S:ARM);}
        for(const ko of[-5,-2,1,4]){R(fcx+ko-1,fy0-1,4,4,INK);R(fcx+ko,fy0,2,3,FUR);R(fcx+ko,fy0,2,1,BEI);}  // four knuckles pressed down in front
        R(fcx-4,fy0+7,8,1,ARM_S);                                                      // folded-finger crease
        const to=s>0?-8:6;
        R(fcx+to,fy0+5,3,5,INK);R(fcx+to+(s>0?1:0),fy0+6,2,3,FUR);                     // thumb tucked on the inner side
      }else{
        O(x0-3,py-3,pw,9,ARM);R(x0-3,py+4,pw,2,ARM_S);
        for(let i=0;i<3;i++){const fx=x0-2+i*4;R(fx-1,py-8,5,7,INK);R(fx,py-7,3,6,FUR);R(fx,py-7,3,2,BEI);}   // chunky toes
      }
      O(x0,yTop-2-(arm?8:0),4,yH+2,ARM_S);                                           // forearm / shin
      O(bx+(s>0?hw+6:-(hw+11)),baseY-4+oy,5,9+(arm?4:0),GRY);                        // wrist / ankle
      O(bx+(s>0?hw:-(hw+8)),baseY-3+oy,8,6,ARM);                                     // upper arm / thigh
      const j0=bx+(s>0?hw-3:-(hw-3)-8);
      O(j0,baseY-4+oy,8,9,GRY);R(j0+(s>0?6:1),baseY-2+oy,1,5,GRY_S);                 // shoulder / hip joint
    };
    if(!HP('legsA')){limb(-1,80,stA[0],true,20);limb(1,80,stA[1],true,20);}
    if(!HP('legsB')){limb(-1,132,st4[2],false,17);limb(1,132,st4[3],false,17);}
    // ---- tail: smooth tapering curve back toward centre ----
    if(!HP('tail')){
      const rx=cx+swayX;
      const CP=[[0,148],[8,158],[12,170],[11,182],[5,191],[-3,194],[-11,189],[-14,178],[-9,170],[-2,170]];
      const pt=(f)=>{const n=CP.length-1,fi=Math.min(n-1,Math.floor(f*n)),u=f*n-fi;
        const[ax,ay]=CP[fi],[bx2,by2]=CP[fi+1];
        return [rx+sym(ax+(bx2-ax)*u+tailS*f*.8),Math.round(ay+(by2-ay)*u)+bob];};
      const N=64, [tx,ty]=pt(1);
      for(let i=0;i<=N;i++){const[x,y]=pt(i/N);R(x-3,y-3,7,7,INK);}                     // constant 7px — no width step, no notch
      for(let d=-3;d<=3;d++){const w=Math.round(Math.sqrt(Math.max(0,9-d*d)));if(w<=0)continue;R(tx-w,ty+d,w*2+1,1,INK);}  // tip ring, still in the outline pass
      for(let i=0;i<=N;i++){const f=i/N,[x,y]=pt(f);R(x-2,y-2,5,5,f<.6?HULL:HULL_S);}    // constant 5px fill
      for(let d=-2;d<=2;d++){const w=Math.round(Math.sqrt(Math.max(0,4-d*d)));if(w<=0)continue;R(tx-w,ty+d,w*2+1,1,HULL_S);}  // rounded tip fill
    }
    // ---- frame: torso, mane ruff, spine ----
    const ox=swayX,oy=bob;
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,1,y1-y0,HULL_L);}
      // heavy mane ruff — dense fur collar around the shoulder mass, ragged outer edge
      {const hwAt=(y)=>{for(const[y0,y1,hw]of SP)if(y>=y0&&y<y1)return hw;return 0;};
       const ruff=(y)=>{const f=(y-56)/42;let len=Math.round(11*Math.sin(f*Math.PI))+2;
         if(y%3===1)len-=2; if(y%4===2)len-=1; return len;};
       for(let y=56;y<98;y++){const len=ruff(y);if(len<=0)continue;const base=hwAt(y)-2;
         R(cx+ox+base-1,y+oy,len+2,1,INK);R(cx+ox-base-len-1,y+oy,len+2,1,INK);}
       for(let y=56;y<98;y++){const len=ruff(y);if(len<=0)continue;const base=hwAt(y)-2;
         R(cx+ox+base,y+oy,len,1,FUR);R(cx+ox-base-len,y+oy,len,1,FUR);
         for(let xo=0;xo<len;xo++){if((y+xo*2)%5>1)continue;                            // diagonal hatch → fur strands
           R(cx+ox+base+xo,y+oy,1,1,FUR_S);R(cx+ox-base-xo-1,y+oy,1,1,FUR_S);}}}
      R(cx-2+ox,56+oy,5,96,ARM);R(cx-1+ox,56+oy,3,96,ARM_H);                          // spine channel
      for(const y of[82,94,110,122,134])R(cx-11+ox,y+oy,22,1,HULL_S);                  // rib bars
      O(cx-19+ox,74+oy,5,12,GRY);R(cx-18+ox,76+oy,3,3,ACC);                            // shoulder vents
      O(cx+14+ox,74+oy,5,12,GRY);R(cx+15+ox,76+oy,3,3,ACC);
      O(cx-8+ox,140+oy,6,6,GRY);R(cx-7+ox,146+oy,4,2,ACC);                             // hip pods
      O(cx+2+ox,140+oy,6,6,GRY);R(cx+3+ox,146+oy,4,2,ACC);
    }
    // ---- head: long forward muzzle, brow ridges, small ears ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*13)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=ox+(mode?0:hb), hy=oy+(mode?hb:0);
      O(cx-5+hx,50+hy,10,10,GRY_S);                                                    // neck
      // skull
      const HS=[[34,42,11],[42,52,10]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-3+hx,y0+hy,3,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,3,y1-y0,HULL_S);}
      // long forward muzzle — broad boxy snout
      for(let i=0;i<=16;i++){const y=34-i,w=Math.max(9,Math.round(15-i*6/16)|1);
        R(cx-((w+2)>>1)+hx,y+hy,w+2,1,INK);}
      for(let i=0;i<=15;i++){const y=34-i,w=Math.max(9,Math.round(15-i*6/16)|1);
        R(cx-(w>>1)+hx,y+hy,w,1,i>12?BEI:HULL);
        R(cx-(w>>1)+hx,y+hy,2,1,HULL_S);R(cx+(w>>1)-1+hx,y+hy,2,1,HULL_S);}
      R(cx-3+hx,19+hy,7,3,ARM_S);R(cx-2+hx,20+hy,5,1,ARM);                             // nostril plate at the snout tip
      // brow ridge — angular step across the skull front
      R(cx-11+hx,33+hy,22,2,ARM);R(cx-11+hx,35+hy,22,1,ARM_H);
      // shallow socket dimples only (top-down: no eyes)
      R(cx-7+hx,38+hy,3,2,HULL_S);R(cx+4+hx,38+hy,3,2,HULL_S);
      // small ears on the skull sides
      for(const s of[-1,1]){
        const ex=cx+hx+(s>0?11:-14);
        O(ex,42+hy,3,6,FUR);R(ex,46+hy,3,1,FUR_S);
      }
      // crown fur seam
      R(cx-1+hx,44+hy,3,8,ARM);R(cx+hx,44+hy,1,8,ARM_H);
    }
  }
}
if(!customElements.get('baboon-sprite'))customElements.define('baboon-sprite',BaboonSprite);
})();
