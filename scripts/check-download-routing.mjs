// Source-level routing checks. This is not browser automation or rendered UI QA.
import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const source=fs.readFileSync(new URL("../site.js",import.meta.url),"utf8");
const cases=[
  ["Chrome desktop","Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 Chrome/130.0.0.0 Safari/537.36","MacIntel",0,"chrome"],
  ["Edge desktop","Mozilla/5.0 (Windows NT 10.0) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0","Win32",0,"edge"],
  ["Firefox desktop","Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0","Linux x86_64",0,"firefox"],
  ["Safari desktop","Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15","MacIntel",0,""],
  ["iPhone Chrome","Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1.15 CriOS/130.0.0.0 Mobile/15E148 Safari/604.1","iPhone",5,""],
  ["iPad desktop mode","Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15","MacIntel",5,""],
  ["Android Chrome","Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36","Linux armv8l",5,""],
  ["Android Firefox","Mozilla/5.0 (Android 14; Mobile; rv:130.0) Gecko/130.0 Firefox/130.0","Linux armv8l",5,""],
  ["Unknown browser","ExampleBrowser/1.0","unknown",0,""]
];
for(const [name,userAgent,platform,maxTouchPoints,expected] of cases) {
  for(const lang of ["en","fr"]) {
    const original=`https://example.test/${lang==="fr"?"fr/installer.html":"install.html"}`;
    const anchor={href:original,textContent:"Static download link"};
    const context={URL,location:{hash:""},navigator:{userAgent,platform,maxTouchPoints},window:{},
      document:{documentElement:{lang,classList:{add(){}}},querySelector:()=>null,
        querySelectorAll:selector=>selector==="[data-browser-cta]"?[anchor]:[],addEventListener(){}}};
    vm.runInNewContext(source,context,{timeout:1000});
    assert.equal(anchor.href,original+(expected?`#platform-${expected}`:""),`${name} ${lang}`);
    if(expected) assert.match(anchor.textContent,lang==="fr"?/Préversion gratuite/:/free/);
    else assert.equal(anchor.textContent,"Static download link",`${name} must keep the cross-platform guide`);
  }
}
console.log(`PASS: ${cases.length*2} English/French browser-routing cases; mobile and unsupported browsers retain installation guidance.`);
