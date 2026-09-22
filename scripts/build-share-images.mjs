import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";
const root=fileURLToPath(new URL("..",import.meta.url));
const font=process.argv[2] || "/System/Library/Fonts/Supplemental/Arial.ttf";
if(!fs.existsSync(font)) throw new Error("Pass an installed TrueType font path: node scripts/build-share-images.mjs /path/to/font.ttf");
for(const lang of ["en","fr"]) {
  const source=path.join(root,`assets/share-${lang}.svg`);
  const icon=fs.readFileSync(path.join(root,"assets/icon-128.png")).toString("base64");
  fs.writeFileSync(source,fs.readFileSync(source,"utf8").replace(/data:image\/png;base64,[^"]+/,`data:image/png;base64,${icon}`));
  execFileSync("magick",["-font",font,"-background","white",source,"-strip",`PNG24:${path.join(root,`assets/share-${lang}.png`)}`],{stdio:"inherit"});
}
console.log("Exported both 1200×630 sharing images from their editable SVG sources.");
