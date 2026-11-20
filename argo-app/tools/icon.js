// genera le icone dell'app (nucleo ARGO) con Chromium
const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const p=await b.newPage();
for (const s of [180,192,512]){
 await p.setViewportSize({width:s,height:s});
 await p.setContent(`<body style="margin:0"><canvas id=c width=${s} height=${s}></canvas><script>
 const c=document.getElementById('c').getContext('2d'),S=${s},R=S*.40;c.fillStyle='#03070d';c.fillRect(0,0,S,S);c.translate(S/2,S/2);
 const g=c.createRadialGradient(0,0,0,0,0,R);g.addColorStop(0,'rgba(255,226,180,.95)');g.addColorStop(.3,'rgba(95,230,255,.55)');g.addColorStop(1,'rgba(95,230,255,0)');c.fillStyle=g;c.beginPath();c.arc(0,0,R,0,7);c.fill();
 const ring=(r,w,n,gap,col,o=0)=>{c.strokeStyle=col;c.lineWidth=w;for(let i=0;i<n;i++){const a=i/n*6.283+o;c.beginPath();c.arc(0,0,r,a,a+6.283/n-gap);c.stroke();}};
 ring(R*.95,S*.022,3,.5,'#5fe6ff',.3);ring(R*.78,S*.01,12,.18,'#ffae3d');ring(R*.64,S*.03,8,.32,'rgba(95,230,255,.6)',.2);
 c.strokeStyle='#ffe6be';c.lineWidth=S*.016;c.beginPath();for(let i=0;i<3;i++){const a=i/3*6.283-1.5708;c.lineTo(Math.cos(a)*R*.36,Math.sin(a)*R*.36);}c.closePath();c.stroke();
 c.fillStyle='#fffaf0';c.beginPath();c.arc(0,0,R*.1,0,7);c.fill();</script></body>`);
 await p.locator('#c').screenshot({path:`public/icon-${s}.png`});}
await b.close();})();
