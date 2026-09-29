// Split a tall screenshot into viewport-sized slices with puppeteer's own image pipeline (no PIL needed).
import puppeteer from "puppeteer";
const [,, url, out, w, h, ...rest] = process.argv;
const nogl = rest.includes("--nogl");
const b = await puppeteer.launch({executablePath:"/opt/pw-browsers/chromium-1194/chrome-linux/chrome",args:["--no-sandbox","--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"]});
const p = await b.newPage();
const W = Number(w), H = Number(h);
await p.setViewport({width:W,height:H,isMobile:W<600,hasTouch:W<600});
await p.goto(url + (nogl ? "?nogl" : ""),{waitUntil:"networkidle0"});
await new Promise(r=>setTimeout(r,1200));
const total = await p.evaluate(()=>document.documentElement.scrollHeight);
let i=0;
for (let y=0;y<total;y+=H){
  await p.evaluate((y)=>window.scrollTo(0,y),y);
  await new Promise(r=>setTimeout(r,250));
  await p.screenshot({path:`${out}-${String(i++).padStart(2,"0")}.png`});
}
console.log("slices",i,"height",total);
await b.close();
