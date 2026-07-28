// <moth-sprite> — animated top-down pixel-art moth mech (faction 9 · lavender/violet).
// Flight build: four broad membrane wings (large forewing + rounded hindwing per side) with
// banded markings and a ringed eyespot, small furry thorax, tapering abdomen, plumose antennae.
// Wings flap in BOTH idle (slow) and walk (faster). No face features (top-down view). No legs.
// Layers: head / wings / frame
// Attributes: mode="idle" | "walk" | "cycle" (default idle), ground, static, hide="..."
(function(){
const W=190,H=140;
const INK='#10002B',HULL='#B497BD',HULL_L='#D6C4DC',HULL_S='#8A6E9C',
ARM='#9D4EDD',ARM_S='#5A2E8A',ARM_H='#C89BF5',GRY='#6B5A7A',GRY_S='#463A52',
MEM='#EDE3F2',MEM_S='#BCA9C8',MEM_D='#9B85AC',FUR='#CDBBD8',
BG='#454034',DOT='#3b382e',SHDW='#0A0018';
const cx=95;
// furry thorax [y0,y1,halfw]
const TS=[[30,36,7],[36,44,10],[44,52,9]];
// tapering abdomen [y0,y1,halfw, banded?]
const AB=[[52,60,8,1],[60,68,7,0],[68,76,6,1],[76,84,5,0],[84,92,4,1],[92,98,2,0]];
class MothSprite extends HTMLElement{
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
    const ph=t*6;
    let bob,swayX;
    if(mode===0){bob=Math.round(Math.sin(t*1.8)*1);swayX=0;}
    else{bob=Math.round(Math.sin(ph*2)*1);swayX=Math.round(Math.sin(ph)*1);this._scroll+=.5;}
    if(stat){bob=0;swayX=0;}
    const fla=stat?0:(mode?Math.sin(ph*1.15):Math.sin(t*2.1));
    const amp=mode?7:4;
    const dy=(f)=>Math.round(fla*amp*f);
    ctx.clearRect(0,0,W,H);
    if(ground){R(0,0,W,H,BG);
      if(!this._dots){this._dots=[];let s=7;for(let i=0;i<80;i++){s=(s*16807)%2147483647;const x=s%W;s=(s*16807)%2147483647;const y=s%H;s=(s*16807)%2147483647;this._dots.push([x,y,s%3===0]);}}
      for(const[dx,dyy,big]of this._dots){const yy=((dyy+Math.round(this._scroll))%H+H)%H;R(dx,yy,big?2:1,big?2:1,DOT);}}
    // shadow (body only)
    if(!HP('frame')){for(const sp of TS.concat(AB))R(cx-sp[2]+2,sp[0]+bob+3,sp[2]*2,sp[1]-sp[0],SHDW);}
    // ---- wings: broad forewing + rounded hindwing per side ----
    if(!HP('wings')){
      for(const s of[-1,1]){
        const px=(o)=>cx+(s>0?sym(o):-sym(o));
        const segS=(o0,y0,o1,y1,th,c)=>{const dx=o1-o0,dyy=y1-y0,n=Math.max(Math.abs(dx),Math.abs(dyy),1),o=Math.floor(th/2);
          for(let i=0;i<=n;i++){R(px(o0+dx*i/n)-o,Math.round(y0+dyy*i/n)-o,th,th,c);}};
        const build=(env,rootY,attachEnd,inX,edges)=>{
          const IX=inX||7;
          const outAt=(y)=>{let xo=0;for(let j=0;j<env.length-1;j++){const[ax,ay]=env[j],[bx2,by2]=env[j+1];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)xo=Math.max(xo,ax+(bx2-ax)*(y-ay)/(by2-ay));}return xo;};
          const innerAt=(y)=>{
            if(y<rootY){const[ax,ay]=env[0],[bx2,by2]=env[1];if(Math.abs(by2-ay)<.01)return IX;return Math.max(IX,ax+(bx2-ax)*(y-ay)/(by2-ay));}
            if(y<=attachEnd)return IX;
            const[ax,ay]=env[env.length-1],[bx2,by2]=env[env.length-2];
            if(y>=Math.min(ay,by2)&&y<=Math.max(ay,by2)&&Math.abs(by2-ay)>.01)return Math.max(IX,ax+(bx2-ax)*(y-ay)/(by2-ay));
            return IX;
          };
          let ys=1e9,ye=-1e9;for(const[,vy]of env){ys=Math.min(ys,vy);ye=Math.max(ye,vy);}
          const y0=Math.round(ys),y1=Math.round(ye);
          for(let y=y0;y<=y1;y++){const xi=Math.round(innerAt(y)),w=Math.round(outAt(y))-xi-1;if(w<=0)continue;
            R(s>0?cx+xi-1:cx-xi-w-1,y+bob,w+2,1,INK);}   // same width basis as the fill, so no bare INK rows
          for(let y=y0;y<=y1;y++){const xi=Math.round(innerAt(y)),w=Math.round(outAt(y))-xi-1;if(w<=0)continue;
            R(s>0?cx+xi:cx-xi-w+1,y+bob,w,1,MEM);
            R(s>0?cx+xi+Math.round(w*.62):cx-xi-w+1+Math.round(w*.24),y+bob,Math.max(1,Math.round(w*.16)),1,MEM_S); // soft shading toward the trailing half
          }
          return{outAt,innerAt,y0,y1};
        };
        // hindwing first — its root tucks under the forewing, so no moving sliver shows between them
        build([[2,50],[26,68+dy(.44)],[47,73+dy(.6)],[53,83+dy(.54)],[46,93+dy(.46)],[28,96+dy(.4)],[2,62]],50,62,2,'bottom');
        // forewing — big swept triangle with a rounded outer corner, painted over the hindwing root
        const FW=build([[7,34],[42,26+dy(1)],[64,28+dy(1)],[76,37+dy(.92)],[79,50+dy(.82)],[71,63+dy(.66)],[50,71+dy(.52)],[26,68+dy(.44)],[7,52]],34,52,7,'top');
        // dark outer band across the forewing (classic moth marking)
        for(let y=FW.y0;y<=FW.y1;y++){const xi=Math.round(FW.innerAt(y)),xo=Math.round(FW.outAt(y));
          const w=xo-xi;if(w<12)continue;const bs=xi+Math.round(w*.68),bw=Math.max(3,Math.round(w*.14));
          R(s>0?cx+bs:cx-bs-bw,y+bob,bw,1,ARM_S);}
        // veins fanning from the root
        for(const[vo,vy,vf]of[[70,34,.9],[74,46,.82],[64,60,.62],[42,67,.5]])segS(9,40+bob,vo,vy+dy(vf)+bob,1,MEM_S);
        for(const[vo,vy,vf]of[[46,78,.58],[40,90,.44]])segS(14,66+bob,vo,vy+dy(vf)+bob,1,MEM_S);
        // ringed eyespot on the forewing — concentric discs anchored on the mirrored centre
        {const ex=50,ey=46+dy(.8)+bob,ecx=px(ex);
         const disc=(r,c)=>{for(let d=-r;d<=r;d++){const hw=Math.round(Math.sqrt(Math.max(0,r*r-d*d)));
           if(hw<=0)continue;R(ecx-hw,ey+d,hw*2+1,1,c);}};
         disc(6,INK);disc(5,ARM_S);disc(3,MEM_S);disc(2,ARM);
         R(ecx,ey,1,1,INK);R(ecx-1,ey-2,1,1,ARM_H);}
      }
    }
    // ---- frame: furry thorax + banded abdomen ----
    if(!HP('frame')){
      const ox=swayX,oy=bob;
      for(const[y0,y1,hw]of TS)R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of TS)R(cx-hw+ox,y0+oy,hw*2,y1-y0,FUR);
      for(const[y0,y1,hw]of TS){R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,2,y1-y0,HULL_S);}
      // fur tufts across the thorax
      for(const[fx,fy]of[[-6,38],[2,40],[-3,46],[4,48],[-7,44]])R(cx+fx+ox,fy+oy,3,1,HULL_L);
      for(const[y0,y1,hw,band]of AB){
        R(cx-hw-1+ox,y0-1+oy,hw*2+2,y1-y0+2,INK);
        R(cx-hw+ox,y0+oy,hw*2,y1-y0,HULL);
        R(cx+hw-3+ox,y0+oy,3,y1-y0,HULL_S);R(cx-hw+ox,y0+oy,2,y1-y0,HULL_S);
        if(band)R(cx-hw+ox,y0+oy,hw*2,2,ARM_S);                    // dark abdominal band
      }
      R(cx-1+ox,30+oy,3,22,ARM);R(cx-1+ox,30+oy,1,22,ARM_H);      // thorax dorsal accent
    }
    // ---- head: small, with big plumose antennae ----
    if(!HP('head')){
      const hy=mode?0:bob;
      const HS=[[22,26,4],[26,32,6]];
      // plumose antennae — feathered combs sweeping forward and out
      for(const s of[-1,1]){
        const px=(o)=>cx+(s>0?sym(o):-sym(o));
        const A0=[4,24],A1=[22,6];
        const n=Math.max(Math.abs(A1[0]-A0[0]),Math.abs(A1[1]-A0[1]));
        for(let i=0;i<=n;i++){const u=i/n,ax=A0[0]+(A1[0]-A0[0])*u,ay=A0[1]+(A1[1]-A0[1])*u;
          R(px(ax)-1,Math.round(ay)+hy-1,3,3,INK);}
        for(let i=0;i<=n;i++){const u=i/n,ax=A0[0]+(A1[0]-A0[0])*u,ay=A0[1]+(A1[1]-A0[1])*u;
          R(px(ax),Math.round(ay)+hy,1,1,i>n*.6?ARM_H:GRY);}
        for(let k=2;k<n-1;k+=2){const u=k/n,ax=A0[0]+(A1[0]-A0[0])*u,ay=A0[1]+(A1[1]-A0[1])*u;
          const tl=Math.round(4-u*1.5);
          for(let j=1;j<=tl;j++)R(px(ax+j*.9),Math.round(ay+j*.55)+hy,1,1,MEM_S);   // comb teeth trailing outward
          for(let j=1;j<=tl-1;j++)R(px(ax-j*.35),Math.round(ay-j*.9)+hy,1,1,MEM_S); // and inward
        }
      }
      for(const[y0,y1,hw]of HS)R(cx-hw-1,y0-1+hy,hw*2+2,y1-y0+2,INK);
      for(const[y0,y1,hw]of HS)R(cx-hw,y0+hy,hw*2,y1-y0,FUR);
      for(const[y0,y1,hw]of HS){R(cx+hw-2,y0+hy,2,y1-y0,HULL_S);R(cx-hw,y0+hy,2,y1-y0,HULL_S);}
      R(cx-3,24+hy,7,1,HULL_L);R(cx-2,28+hy,5,1,HULL_L);           // furry crown tufts
      O(cx-1,32+hy,3,4,GRY);R(cx,33+hy,1,2,GRY_S);                 // coiled proboscis stub
    }
  }
}
if(!customElements.get('moth-sprite'))customElements.define('moth-sprite',MothSprite);
})();
