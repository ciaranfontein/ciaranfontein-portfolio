// <firefly-sprite> — animated top-down pixel-art firefly mech (faction 4 · lantern yellows on night purple).
// Flight pose per reference, owl-style build: spread translucent membrane wings
// (flapping in idle AND walk), small banded body, antennae head, pulsing GLOW lantern.
// No legs. Layers: head / wings / tail (lantern) / frame.
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=170,H=100;
const INK='#160029',HULL='#3A1063',HULL_L='#54258A',HULL_S='#28093F',
ARM='#240046',ARM_S='#18002F',GRY='#6B5C85',GRY_S='#4A3D63',
MEM='#9C8FB8',MEM_S='#6E6288',
GLOW='#FFD60A',GLOW_H='#FFF3A8',ACC='#FFC300',ACC_S='#C79400',
BG='#454034',DOT='#3b382e',SHDW='#2e2a3a';
const cx=85;
// thorax + abdomen spans [y0,y1,halfw]
const SP=[[34,39,9],[39,45,10],[45,49,8],[49,53,8],[53,57,7],[57,61,7],[61,65,6]];
class FireflySprite extends HTMLElement{
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
    const ph=t*5.5;
    let bob;
    if(mode===0)bob=Math.round(Math.sin(t*1.6)*1);
    else{bob=Math.round(Math.sin(ph*2)*1);if(!stat)this._scroll+=.5;}
    if(stat)bob=0;
    // wingbeat (owl-style): slow in idle, stronger in walk; tips travel most
    const fla=stat?0:(mode?Math.sin(ph*1.1):Math.sin(t*2.2));
    const amp=mode?5:3;
    const dy=(f)=>Math.round(fla*amp*f);
    // lantern pulse
    const p=stat?.6:(mode?(Math.sin(t*5)+1)/2:(Math.sin(t*1.8)+1)/2);
    // ground / clear
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<70;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (body + lantern only)
    if(!HP('head')){for(const[y,hw]of[[20,4],[26,7]])R(cx-hw+2,y+3+bob,hw*2,7,SHDW);}
    if(!HP('frame')){for(const[y0,y1,hw]of SP)R(cx-hw+2,y0+bob+3,hw*2,y1-y0,SHDW);}
    if(!HP('tail')){for(const[y,hw]of[[65,6],[69,5],[73,4]])R(cx-hw+2,y+bob+3,hw*2,4,SHDW);}
    // ---- wings (lowest layer): twin pointed translucent blades per side ----
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
            if(y<=attachEnd)return 7;                            // short flank contact only
            const[ax,ay]=env[env.length-1],[bx2,by2]=env[env.length-2];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)return Math.max(7,ax+(bx2-ax)*(y-ay)/(by2-ay));
            return 7;
          };
          let ys=1e9,ye=-1e9;for(const[,vy]of env){ys=Math.min(ys,vy);ye=Math.max(ye,vy);}
          for(let y=Math.round(ys);y<=Math.round(ye);y+=2){const xi=Math.round(innerAt(y));const w=Math.round(outAt(y))-xi;if(w<=0)continue;R(s>0?cx+xi-1:cx-xi-w-1,y+bob,w+2,2,INK);}
          for(let y=Math.round(ys);y<=Math.round(ye);y+=2){const xi=Math.round(innerAt(y));const w=Math.round(outAt(y))-xi-1;if(w<=0)continue;R(s>0?cx+xi:cx-xi-w+1,y+bob,w,2,MEM);}
        };
        // upper blade: long, pointed, raked up-out — attach band meets the lower blade's at y48
        fill([[7,38],[66,30+dy(1)],[32,50+dy(.4)],[7,48]],38,48);
        // lower blade: shorter, raked down-out — attaches only y48–54
        fill([[7,48],[52,62+dy(.7)],[7,54]],48,54);
        // one straight vein per blade
        segS(7,40+bob,62,32+dy(.95)+bob,1,MEM_S);
        segS(7,50+bob,48,60+dy(.65)+bob,1,MEM_S);
      }
    }
    // ---- lantern (tail): pulsing glow tip ----
    if(!HP('tail')){
      const LS=[[65,69,6],[69,73,5],[73,77,4]];
      for(const[y0,y1,hw]of LS)R(cx-hw-1,y0-1+bob,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of LS)R(cx-hw,y0+bob,hw*2,y1-y0,p>.5?GLOW:ACC);
      for(const[y0,y1,hw]of LS)R(cx+hw-2,y0+bob,2,y1-y0,ACC_S);
      const core=2+Math.round(p*3);
      R(cx-core/2,67+bob,core,6,p>.3?GLOW_H:GLOW);
      if(p>.75){R(cx-8,69+bob,2,1,GLOW);R(cx+6,69+bob,2,1,GLOW);R(cx-1,79+bob,2,2,GLOW);}
    }
    // ---- frame: thorax + banded abdomen (paints over wing roots) ----
    if(!HP('frame')){
      for(const[y0,y1,hw]of SP)R(cx-hw-1,y0-1+bob,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of SP)R(cx-hw,y0+bob,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of SP){R(cx+hw-3,y0+bob,3,y1-y0,HULL_S);R(cx-hw,y0+bob,1,y1-y0,HULL_L);}
      // amber pronotum collar
      R(cx-8,36+bob,16,2,ACC);R(cx-8,38+bob,16,1,ACC_S);
      // abdomen band seams
      for(const y of[49,53,57,61])R(cx-6,y+bob,12,1,ARM_S);
    }
    // ---- head: small, antennae, compound eye shades ----
    if(!HP('head')){
      const hb=stat?0:(mode?Math.round(Math.sin(t*12)*1):Math.round(Math.sin(t*1.2)*1));
      const hx=mode?0:hb, hy=bob+(mode?hb:0);
      R(cx-4+hx,14+hy,1,4,GRY);R(cx-5+hx,11+hy,1,3,GRY);R(cx-6+hx,9+hy,1,2,GRY_S);
      R(cx+3+hx,14+hy,1,4,GRY);R(cx+4+hx,11+hy,1,3,GRY);R(cx+5+hx,9+hy,1,2,GRY_S);
      const HS=[[18,22,4],[22,28,7],[28,34,8]];
      for(const[y0,y1,hw]of HS)R(cx-hw-1+hx,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw+hx,y0+hy,hw*2,y1-y0,HULL);
      for(const[y0,y1,hw]of HS){R(cx+hw-2+hx,y0+hy,2,y1-y0,HULL_S);R(cx-hw+hx,y0+hy,1,y1-y0,HULL_L);}
      R(cx-6+hx,24+hy,2,3,HULL_S);R(cx+4+hx,24+hy,2,3,HULL_S);   // compound eye shades
      R(cx-2+hx,20+hy,4,1,ACC_S);                                 // amber brow tick
    }
  }
}
if(!customElements.get('firefly-sprite'))customElements.define('firefly-sprite',FireflySprite);
})();
