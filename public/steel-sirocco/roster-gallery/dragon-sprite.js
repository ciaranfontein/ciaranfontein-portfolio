// <dragon-sprite> — animated top-down pixel-art dragon mech (faction 2 · ember corals).
// Heavy flagship: horned wedge head, folded serrated wings with red membrane (flare +
// flap in walk), four tucked claw legs, long tail ending in an arrowhead spade.
// Layers: head / wings / legsA / legsB / tail / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=170,H=320;
const INK='#2E2A28',HULL='#E76F51',HULL_L='#F0937C',HULL_S='#B85039',
ARM='#514843',ARM_S='#3B3430',ARM_H='#665A53',GRY='#8A7A72',GRY_S='#635850',
RED='#D62828',RED_S='#A31D1D',
BG='#454034',DOT='#3b382e',SHDW='#3a352f';
const cx=85;
// body spans [y0,y1,halfw]: shoulders at the wing root, waist, haunch
const SP=[[70,80,15],[80,96,20],[96,112,19],[112,132,16],[132,152,17],[152,172,18],[172,182,14],[182,190,10]];
// neck spans
const NK=[[52,60,7],[60,70,10]];
// tail halfwidths, y=190 step 8
const TW=[9,8,8,7,6,6,5,4,4,3,3,2,2];
// (wing geometry is computed per-frame from anchor points — see the wings block)
class DragonSprite extends HTMLElement{
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
    const seg=(x0,y0,x1,y1,th,c)=>{
      const dx=x1-x0,dy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dy),1),o=Math.floor(th/2);
      for(let i=0;i<=n;i++){const x=Math.round(x0+dx*i/n),y=Math.round(y0+dy*i/n);R(x-o,y-o,th,th,c);}
    };
    const ph=t*6;
    let bob,swayX,tailS,st4;
    if(mode===0){bob=Math.round(Math.sin(t*1.5)*1);swayX=0;tailS=Math.sin(t*1.1)*5;st4=[0,0,0,0];}
    else{bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);tailS=Math.sin(ph)*4;
      this._scroll+=.6;
      const a=Math.round(Math.sin(ph)*5),b=Math.round(Math.sin(ph+Math.PI)*5);st4=[a,b,b,a];}
    if(stat){bob=0;swayX=0;tailS=0;st4=[0,0,0,0];}
    // wing pose: relaxed drape with breathing in idle AND walk (spread keyframe kept for a future flight mode)
    const wu=stat?.1:.08+.04*Math.sin(t*1.3);
    // ember pulse
    const em=stat?false:Math.sin(t*2.2)>.2;
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dy,big]of this._dots){const yy=((dy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow
    if(!HP('head')){for(const[y,hw]of[[16,5],[24,9],[32,12],[42,10]]){R(cx-hw+swayX+2,y+3+bob,hw*2,9,SHDW);}}
    if(!HP('frame')){for(const sp of NK.concat(SP))R(cx-sp[2]+swayX+2,sp[0]+bob+3,sp[2]*2,sp[1]-sp[0],SHDW);}
    if(!HP('wings')){const w=30+Math.round(48*wu);R(cx-12-w,70+bob+3,w,84,SHDW);R(cx+12,70+bob+3,w,84,SHDW);}
    if(!HP('tail')){for(let i=0;i<TW.length;i++){const y=190+i*8,hw=TW[i];const off=Math.round(tailS*(i+1)/TW.length);R(cx-hw+off+swayX+2,y+bob+3,hw*2,8,SHDW);}}
    // ---- legs (bottom layer): stubby tucked claws ----
    const leg=(s,baseY,stride,hw)=>{
      const bx=cx+swayX, py=baseY+stride+bob, oy=bob;
      const x0=bx+(s>0?hw+1:-(hw+11));
      const yTop=Math.min(baseY+oy,py), yH=Math.abs(stride)+2;
      O(x0-1,py-2,10,9,ARM);R(x0-2,py+1,12,4,INK);R(x0-1,py+1,1,4,ARM);R(x0+8,py+1,1,4,ARM);
      R(x0-1,py+5,10,2,ARM_S);
      R(x0+1,py-5,2,4,HULL_L);R(x0+5,py-5,2,4,HULL_L);          // twin talons
      O(x0+1,yTop-1,7,yH+1,ARM_S);
      O(bx+(s>0?hw-3:-(hw+7)),baseY-5+oy,10,10,GRY);
      R(bx+(s>0?hw+4:-(hw-4)-1),baseY-2+oy,1,5,GRY_S);
    };
    if(!HP('legsA')){leg(-1,88,st4[0],21);leg(1,88,st4[1],21);}
    if(!HP('legsB')){leg(-1,164,st4[2],18);leg(1,164,st4[3],18);}
    // ---- wings (over the legs): keyframe lerp — relaxed drape ↔ spread flight pose ----
    if(!HP('wings')){
      const L=(a,b)=>a+(b-a)*wu;
      for(const s of[-1,1]){
        const E=[L(34,30),L(86,80)], C=[L(52,56),L(78,72)];
        const F1=[L(64,78),L(102,64)],F2=[L(60,72),L(128,88)],F3=[L(46,58),L(148,110)],F4=[L(30,36),L(160,128)];
        const A=[L(17,14),L(150,132)];
        const dip=L(.25,.35);
        const mid=(P,Q)=>[(P[0]+Q[0])/2+(C[0]-(P[0]+Q[0])/2)*dip,(P[1]+Q[1])/2+(C[1]-(P[1]+Q[1])/2)*dip];
        const env=[[15,94],C,F1,mid(F1,F2),F2,mid(F2,F3),F3,mid(F3,F4),F4,A];
        const outAt=(y)=>{let xo=0;for(let j=0;j<env.length-1;j++){const[ax,ay]=env[j],[bx2,by2]=env[j+1];
          if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)xo=Math.max(xo,ax+(bx2-ax)*(y-ay)/(by2-ay));}return xo;};
        // membrane never crosses forward of the leading-edge arm
        const innerAt=(y)=>{
          if(y>=94)return 8;
          const arm=[[15,94],E,C];
          for(let j=0;j<arm.length-1;j++){const[ax,ay]=arm[j],[bx2,by2]=arm[j+1];
            if(y<=Math.max(ay,by2)&&y>=Math.min(ay,by2)&&Math.abs(by2-ay)>.01)return ax+(bx2-ax)*(y-ay)/(by2-ay);}
          return C[0];
        };
        const yTop=Math.round(Math.min(C[1],F1[1]))-1, yBot=Math.min(158,Math.round(A[1])+8);
        for(let y=yTop;y<yBot;y+=3){const xi=Math.round(innerAt(y));const w=Math.max(0,Math.round(outAt(y))-xi);if(!w)continue;R(s>0?cx+xi:cx-xi-w-2,y+bob,w+2,3,INK);}
        for(let y=yTop;y<yBot;y+=3){const xi=Math.round(innerAt(y));const w=Math.max(0,Math.round(outAt(y))-xi-1);if(w<=0)continue;R(s>0?cx+xi:cx-xi-w,y+bob,w,3,Math.floor(y/3)%3===0?RED:RED_S);}
        const wr=[cx+s*C[0],C[1]+bob];
        seg(wr[0],wr[1],cx+s*F1[0],F1[1]+bob,3,ARM);                                       // leading finger
        for(const F of[F2,F3,F4])seg(wr[0],wr[1],cx+s*F[0],F[1]+bob,2,ARM);                // finger spars
        seg(cx+s*15,94+bob,cx+s*E[0],E[1]+bob,5,INK);seg(cx+s*E[0],E[1]+bob,wr[0],wr[1],5,INK);
        seg(cx+s*15,94+bob,cx+s*E[0],E[1]+bob,3,ARM);seg(cx+s*E[0],E[1]+bob,wr[0],wr[1],3,ARM); // arm + forearm
        O(wr[0]-2,wr[1]-2,5,5,GRY);                                                        // crook joint
        R(wr[0]+(s>0?1:-2),wr[1]-6,2,4,GRY_S);R(wr[0]+(s>0?3:-4),wr[1]-5,1,3,GRY_S);      // crook claw pair
        for(const F of[F1,F2,F3,F4])R(cx+s*F[0]+(s>0?0:-1),F[1]+bob,1,2,GRY_S);           // tip claws
      }
    }
    // ---- tail ----
    if(!HP('tail')){
      const px=cx+swayX;
      let tipX=px,tipY=190;
      for(let i=0;i<TW.length;i++){
        const y=190+i*8+bob,hw=TW[i];
        const off=Math.round(tailS*(i+1)/TW.length);
        O(px-hw+off,y,hw*2,8,i%2?HULL:HULL_L);
        R(px+hw-2+off,y,2,8,HULL_S);
        if(i%3===0)R(px-hw-1+off,y,hw*2+2,2,ARM_S);              // joint rings
        tipX=px+off;tipY=y+8;
      }
      // arrowhead spade tip
      R(tipX-5,tipY+1,10,3,RED_S);O(tipX-4,tipY,8,4,RED);O(tipX-2,tipY+4,4,5,RED);R(tipX-1,tipY+9,2,3,RED_S);
    }
    // ---- frame: neck + body ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const sp of NK.concat(SP))R(cx-sp[2]-1+ox,sp[0]-1+oy,sp[2]*2+2,sp[1]-sp[0]+2,INK);
      for(const sp of NK.concat(SP))R(cx-sp[2]+ox,sp[0]+oy,sp[2]*2,sp[1]-sp[0],HULL);
      for(const sp of NK.concat(SP)){R(cx+sp[2]-3+ox,sp[0]+oy,3,sp[1]-sp[0],HULL_S);R(cx-sp[2]+ox,sp[0]+oy,1,sp[1]-sp[0],HULL_L);}
      // neck rings
      R(cx-6+ox,58+oy,12,1,ARM_S);R(cx-8+ox,64+oy,16,1,ARM_S);
      // spine channel + dorsal ridge studs
      R(cx-2+ox,70+oy,4,120,ARM);R(cx-2+ox,70+oy,1,120,ARM_H);
      for(const y of[84,104,124,144,164]){R(cx-1+ox,y+oy,2,3,RED);R(cx-1+ox,y+2+oy,2,1,RED_S);}
      // ember chest vents
      R(cx-9+ox,86+oy,4,2,em?RED:RED_S);R(cx+5+ox,86+oy,4,2,em?RED:RED_S);
      R(cx-9+ox,88+oy,4,1,RED_S);R(cx+5+ox,88+oy,4,1,RED_S);
      // hip discs — below the wing trailing edge
      O(cx-13+ox,176+oy,6,6,GRY);R(cx-11+ox,178+oy,2,2,RED);
      O(cx+7+ox,176+oy,6,6,GRY);R(cx+9+ox,178+oy,2,2,RED);
      // panel seams
      for(const y of[96,132,172])R(cx-11+ox,y+oy,22,1,HULL_S);
    }
    // (frame + head paint over the wing roots; membrane stays visible in the outer sweep)
    // ---- head: horned wedge ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*12)*1):Math.round(Math.sin(t*1.1)*1));
      const hx=swayX+(mode?0:hb), hy=bob+(mode?hb:0);
      const HS=[[14,18,4],[18,24,7],[24,32,10],[32,42,12],[42,52,9]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // swept-back horns
      O(cx-13+hx,26+hy,3,5,ARM);O(cx-15+hx,30+hy,3,6,ARM);O(cx-16+hx,36+hy,2,5,GRY_S);
      O(cx+10+hx,26+hy,3,5,ARM);O(cx+12+hx,30+hy,3,6,ARM);O(cx+14+hx,36+hy,2,5,GRY_S);
      // brow ember eyes (inset)
      R(cx-8+hx,29+hy,2,2,RED);R(cx+6+hx,29+hy,2,2,RED);
      // nostril pits + ember flicker
      R(cx-2+hx,16+hy,1,1,INK);R(cx+1+hx,16+hy,1,1,INK);
      if(em){R(cx-2+hx,14+hy,1,1,RED);R(cx+1+hx,14+hy,1,1,RED);}
      // jaw stripe
      R(cx-1+hx,36+hy,2,8,ARM_S);
    }
  }
}
if(!customElements.get('dragon-sprite'))customElements.define('dragon-sprite',DragonSprite);
})();
