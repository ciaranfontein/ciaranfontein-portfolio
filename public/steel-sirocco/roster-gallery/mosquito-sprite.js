// <mosquito-sprite> — animated top-down pixel-art mosquito mech (faction 5 · blood reds on bone).
// Wasp-style flight build reworked to a mosquito: long needle proboscis + palps, small head with
// big compound eyes, humped thorax, one pair
// one pair of narrow swept wings (flap in idle AND walk). No legs.
// Layers: head / wings / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=170,H=140;
const INK='#1A0308',HULL='#641220',HULL_L='#8A2233',HULL_S='#42000C',
ARM='#4A0D18',ARM_S='#2C0710',GRY='#8A6672',GRY_S='#5A414B',
MEM='#EFE6DD',MEM_S='#C4B8AC',
GLOW='#E01E37',GLOW_H='#FF5F70',ACC='#E01E37',ACC_S='#A01323',
BG='#454034',DOT='#3b382e',SHDW='#2a1418';
const cx=85;
// humped thorax spans [y0,y1,halfw]
const TS=[[38,44,7],[44,50,9],[50,58,7],[58,64,5]];
class MosquitoSprite extends HTMLElement{
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
    let bob;
    if(mode===0)bob=Math.round(Math.sin(t*1.7)*1);
    else{bob=Math.round(Math.sin(ph*2)*1);if(!stat)this._scroll+=.55;}
    if(stat)bob=0;
    const fla=stat?0:(mode?Math.sin(ph*1.3):Math.sin(t*2.6));   // fast whining wingbeat
    const amp=mode?6:4;
    const dy=(f)=>Math.round(fla*amp*f);
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    ctx.save();ctx.translate(0,20);   // center the whole mech vertically in the canvas
    // shadow (body only)
    if(!HP('frame')){for(const sp of TS)R(cx-sp[2]+2,sp[0]+bob+3,sp[2]*2,sp[1]-sp[0],SHDW);}
    // ---- wings (over legs, under body): wasp twin-blade wings ----
    if(!HP('wings')){
      for(const s of[-1,1]){
        const segS=(x0r,y0,x1r,y1,th,c)=>{const dx=x1r-x0r,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2);
          for(let i=0;i<=n;i++){const xa=sym(x0r+dx*i/n),y=Math.round(y0+dyy*i/n);R(cx+(s>0?xa:-xa)-o,y-o,th,th,c);}};
        const fill=(env,rootY,attachEnd)=>{
          const outAt=(y)=>{let xo=0;for(let j=0;j<env.length-1;j++){const[ax,ay]=env[j],[bx2,by2]=env[j+1];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)xo=Math.max(xo,ax+(bx2-ax)*(y-ay)/(by2-ay));}return xo;};
          const innerAt=(y)=>{
            if(y<rootY){const[ax,ay]=env[0],[bx2,by2]=env[1];if(Math.abs(by2-ay)<.01)return 7;return Math.max(7,ax+(bx2-ax)*(y-ay)/(by2-ay));}
            if(y<=attachEnd)return 7;
            const[ax,ay]=env[env.length-1],[bx2,by2]=env[env.length-2];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)return Math.max(7,ax+(bx2-ax)*(y-ay)/(by2-ay));
            return 7;
          };
          let ys=1e9,ye=-1e9;for(const[,vy]of env){ys=Math.min(ys,vy);ye=Math.max(ye,vy);}
          for(let y=Math.round(ys);y<=Math.round(ye);y+=2){const xi=Math.round(innerAt(y));const w=Math.round(outAt(y))-xi;if(w<=0)continue;R(s>0?cx+xi-1:cx-xi-w-1,y+bob,w+2,2,INK);}
          for(let y=Math.round(ys);y<=Math.round(ye);y+=2){const xi=Math.round(innerAt(y));const w=Math.round(outAt(y))-xi-1;if(w<=0)continue;R(s>0?cx+xi:cx-xi-w+1,y+bob,w,2,MEM);}
        };
        // upper blade — rounder and shorter
        fill([[7,44],[34,38+dy(1)],[43,41+dy(.95)],[45,45+dy(.85)],[43,49+dy(.72)],[33,53+dy(.55)],[20,54+dy(.42)],[7,52]],44,52);
        // lower blade — rounder and shorter
        fill([[7,52],[29,58+dy(.7)],[36,61+dy(.65)],[37,64+dy(.6)],[34,67+dy(.55)],[24,68+dy(.5)],[7,58]],52,58);
        segS(7,46+bob,42,41+dy(.9)+bob,1,MEM_S);
        segS(7,54+bob,32,60+dy(.6)+bob,1,MEM_S);
      }
    }
    // ---- tail: round-bottom flask, transparent glass, half-filled with oil ----
    if(!HP('tail')){
      const oy=bob;
      const bcy=76, r=11;                                       // glass ball tucked right under the body
      const hwB=(y)=>Math.round(Math.sqrt(Math.max(0,r*r-(y-bcy)*(y-bcy))));
      // glass ring — edges only, so the empty upper half stays transparent
      for(let y=bcy-r;y<=bcy+r;y++){const hw=hwB(y);if(hw<=0)continue;
        R(cx-hw-1,y+oy,2,1,INK);R(cx+hw-1,y+oy,2,1,INK);}
      // oil fill — column surface that swishes side to side
      const swon=this.hasAttribute('static')?0:1;
      const slope=Math.sin(t*1.9)*0.42*swon, sbob=Math.sin(t*1.9+1)*0.6*swon;
      for(let x=-(r-1);x<=r-1;x++){
        const colH=Math.round(Math.sqrt(Math.max(0,r*r-x*x)));if(colH<=1)continue;
        const bBot=bcy+colH-1, bTop=bcy-colH+1;
        let surf=Math.round(bcy+slope*x+sbob);if(surf>bBot)continue;if(surf<bTop)surf=bTop;
        const xx=cx+x, dark=x>=r-3;
        for(let y=surf;y<=bBot;y++)R(xx,y+oy,1,1,dark?'#141005':'#2A2410');
        R(xx,surf+oy,1,1,'#6B5A22');                            // bright swishing meniscus
        if(surf+1<=bBot)R(xx,surf+1+oy,1,1,'#3E3416');          // meniscus shadow
      }
      R(cx-5,72+oy,1,7,'#FFFFFF');                              // glass specular streak
    }
    // ---- frame: thorax, long engorged abdomen, pointed tip ----
    if(!HP('frame')){
      for(const sp of TS)R(cx-sp[2]-1,sp[0]-1+bob,sp[2]*2+2,sp[1]-sp[0]+2,INK);
      for(const sp of TS)R(cx-sp[2],sp[0]+bob,sp[2]*2,sp[1]-sp[0],HULL);
      for(const sp of TS){R(cx+sp[2]-2,sp[0]+bob,2,sp[1]-sp[0],HULL_S);R(cx-sp[2],sp[0]+bob,1,sp[1]-sp[0],HULL_L);}
      R(cx-7,40+bob,14,2,ACC_S);                                   // thorax seam
    }
    // ---- head: small, big compound eyes, long proboscis + palps ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*12)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=mode?0:hb, hy=bob+(mode?hb:0);
      // proboscis needle (drawn first, points forward/up) + flanking palps
      O(cx-1+hx,6+hy,2,24,GRY_S);R(cx-1+hx,5+hy,2,3,ACC);          // dark needle w/ blood-red tip
      R(cx-4+hx,24+hy,1,8,GRY_S);R(cx+3+hx,24+hy,1,8,GRY_S);       // maxillary palps
      const HS=[[30,34,6],[34,40,6]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      // big wrap-around compound eyes (dark red kidney with a bright gloss)
      for(const s of[-1,1]){
        const rows=[[29,4,3],[30,4,4],[31,4,5],[32,5,5],[33,5,5],[34,5,4],[35,6,3]];
        const X0=(rx,rw)=>(s>0?cx+rx:cx-rx-rw)+hx;
        for(const[ry,rx,rw]of rows)R(X0(rx,rw)-1,ry-1+hy,rw+2,3,INK);
        for(const[ry,rx,rw]of rows)R(X0(rx,rw),ry+hy,rw,1,ARM);
        const gx=(s>0?cx+5:cx-7)+hx;
        R(gx,30+hy,2,2,GLOW);R(gx+(s>0?0:1),30+hy,1,1,GLOW_H);     // gloss
      }
    }
    ctx.restore();
  }
}
if(!customElements.get('mosquito-sprite'))customElements.define('mosquito-sprite',MosquitoSprite);
})();
