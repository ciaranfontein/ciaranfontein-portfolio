// <wasp-sprite> — animated top-down pixel-art wasp mech (faction 4 · lantern yellows on night purple).
// Firefly-style flight build: twin pointed blade wings (continuous attach band, flapping
// in idle AND walk), banded warning abdomen behind a pinched waist, metallic stinger.
// No legs. Layers: head / wings / tail (stinger) / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=170,H=110;
const INK='#160029',HULL='#3A1063',HULL_L='#54258A',HULL_S='#28093F',
ARM='#240046',ARM_S='#18002F',GRY='#6B5C85',GRY_S='#4A3D63',
MEM='#9C8FB8',MEM_S='#6E6288',
GLOW='#FFD60A',GLOW_H='#FFF3A8',ACC='#FFC300',ACC_S='#C79400',
BG='#454034',DOT='#3b382e',SHDW='#2e2a3a';
const cx=85;
// thorax + waist pinch spans [y0,y1,halfw]
const TS=[[30,36,8],[36,46,10],[46,52,8],[52,58,3]];
// banded abdomen spans [y0,y1,halfw,yellow?]
const AB=[[58,64,7,1],[64,72,9,0],[72,80,8,1],[80,86,6,0]];
class WaspSprite extends HTMLElement{
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
    const ph=t*5.5;
    let bob;
    if(mode===0)bob=Math.round(Math.sin(t*1.7)*1);
    else{bob=Math.round(Math.sin(ph*2)*1);if(!stat)this._scroll+=.55;}
    if(stat)bob=0;
    const fla=stat?0:(mode?Math.sin(ph*1.15):Math.sin(t*2.3));
    const amp=mode?5:3;
    const dy=(f)=>Math.round(fla*amp*f);
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (body + stinger only)
    if(!HP('head')){for(const[y,hw]of[[16,4],[22,7]])R(cx-hw+2,y+3+bob,hw*2,7,SHDW);}
    if(!HP('frame')){for(const sp of TS.concat(AB))R(cx-sp[2]+2,sp[0]+bob+3,sp[2]*2,sp[1]-sp[0],SHDW);}
    if(!HP('tail')){R(cx-3+2,86+bob+3,6,10,SHDW);}
    // ---- wings (lowest layer): twin pointed blades, continuous attach band ----
    if(!HP('wings')){
      for(const s of[-1,1]){
        const sym=(v)=>Math.sign(v)*Math.round(Math.abs(v));
        const segS=(x0r,y0,x1r,y1,th,c)=>{const dx=x1r-x0r,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2);
          for(let i=0;i<=n;i++){const xa=sym(x0r+dx*i/n),y=Math.round(y0+dyy*i/n);R(cx+(s>0?xa:-xa)-o,y-o,th,th,c);}};
        const fill=(env,rootY,attachEnd)=>{
          const outAt=(y)=>{let xo=0;for(let j=0;j<env.length-1;j++){const[ax,ay]=env[j],[bx2,by2]=env[j+1];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)xo=Math.max(xo,ax+(bx2-ax)*(y-ay)/(by2-ay));}return xo;};
          const innerAt=(y)=>{
            if(y<rootY){
              const[ax,ay]=env[0],[bx2,by2]=env[1];
              if(Math.abs(by2-ay)<.01)return 7;
              return Math.max(7,ax+(bx2-ax)*(y-ay)/(by2-ay));
            }
            if(y<=attachEnd)return 7;
            const[ax,ay]=env[env.length-1],[bx2,by2]=env[env.length-2];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)return Math.max(7,ax+(bx2-ax)*(y-ay)/(by2-ay));
            return 7;
          };
          let ys=1e9,ye=-1e9;for(const[,vy]of env){ys=Math.min(ys,vy);ye=Math.max(ye,vy);}
          for(let y=Math.round(ys);y<=Math.round(ye);y+=2){const xi=Math.round(innerAt(y));const w=Math.round(outAt(y))-xi;if(w<=0)continue;R(s>0?cx+xi-1:cx-xi-w-1,y+bob,w+2,2,INK);}
          for(let y=Math.round(ys);y<=Math.round(ye);y+=2){const xi=Math.round(innerAt(y));const w=Math.round(outAt(y))-xi-1;if(w<=0)continue;R(s>0?cx+xi:cx-xi-w+1,y+bob,w,2,MEM);}
        };
        // upper blade: long, rounded tip (blunted point via tip facets)
        fill([[7,34],[54,27+dy(1)],[60,29+dy(1)],[62,32+dy(.9)],[60,36+dy(.75)],[52,41+dy(.6)],[30,44+dy(.4)],[7,42]],34,42);
        // lower blade: shorter, rounded tip — attach meets the upper's at y42
        fill([[7,42],[41,50+dy(.7)],[46,52+dy(.7)],[48,55+dy(.65)],[45,58+dy(.6)],[38,59+dy(.55)],[7,48]],42,48);
        segS(7,36+bob,54,29+dy(.95)+bob,1,MEM_S);
        segS(7,44+bob,40,52+dy(.65)+bob,1,MEM_S);
      }
    }
    // ---- stinger (tail layer): metallic taper to a point ----
    if(!HP('tail')){
      O(cx-3,86+bob,6,4,GRY);R(cx+1,86+bob,2,4,GRY_S);
      O(cx-2,90+bob,4,4,GRY_S);
      R(cx-1,94+bob,2,3,GRY_S);R(cx-1,97+bob,1,2,ACC_S);
      R(cx-3,86+bob,6,1,ACC_S);                                   // base ring
    }
    // ---- frame: thorax, waist pinch, banded abdomen ----
    if(!HP('frame')){
      for(const sp of TS)R(cx-sp[2]-1,sp[0]-1+bob,sp[2]*2+2,sp[1]-sp[0]+2,INK);
      for(const sp of TS)R(cx-sp[2],sp[0]+bob,sp[2]*2,sp[1]-sp[0],HULL);
      for(const sp of TS){R(cx+sp[2]-2,sp[0]+bob,2,sp[1]-sp[0],HULL_S);R(cx-sp[2],sp[0]+bob,1,sp[1]-sp[0],HULL_L);}
      R(cx-8,32+bob,16,2,ACC);R(cx-8,34+bob,16,1,ACC_S);          // amber collar
      for(const[y0,y1,hw,yel]of AB)R(cx-hw-1,y0-1+bob,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw,yel]of AB){
        R(cx-hw,y0+bob,hw*2,y1-y0,yel?GLOW:ARM);
        R(cx+hw-2,y0+bob,2,y1-y0,yel?ACC_S:ARM_S);
        R(cx-hw,y0+bob,1,y1-y0,yel?GLOW_H:HULL_L);
      }
    }
    // ---- head: small, eye shades ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*12)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=mode?0:hb, hy=bob+(mode?hb:0);
      const HS=[[14,18,7],[18,24,6],[24,30,6]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      R(cx-6+hx,20+hy,2,3,HULL_S);R(cx+4+hx,20+hy,2,3,HULL_S);    // eye shades
      // big buggy compound eyes — angled water-droplet shape (tip up-inner, bulb down-outer)
      for(const s of[-1,1]){
        const rows=[[13,3,1],[14,3,2],[15,3,3],[16,4,4],[17,4,5],[18,5,5],[19,5,5],[20,5,4],[21,6,3],[22,6,2]];
        const X0=(rx,rw)=>(s>0?cx+rx:cx-rx-rw)+hx;
        for(const[ry,rx,rw]of rows)R(X0(rx,rw)-1,ry-1+hy,rw+2,3,INK);
        for(const[ry,rx,rw]of rows)R(X0(rx,rw),ry+hy,rw,1,ARM);
        const gx=(s>0?cx+5:cx-8)+hx;                              // bulb gloss
        R(gx,17+hy,2,3,GLOW);R(gx+(s>0?0:1),17+hy,1,1,GLOW_H);
        R((s>0?cx+8:cx-9)+hx,20+hy,1,2,ARM_S);                    // outer shade
      }
    }
  }
}
if(!customElements.get('wasp-sprite'))customElements.define('wasp-sprite',WaspSprite);
})();
