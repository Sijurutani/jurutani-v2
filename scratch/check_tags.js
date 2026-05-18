import fs from 'fs';
const content = fs.readFileSync('app/components/features/messages/Chat.vue', 'utf-8');

const templateMatch = content.match(/<template>([\s\S]*?)<\/template>/);
if (!templateMatch) {
  console.log("No template found");
  process.exit(1);
}
const template = templateMatch[1];

let openDivs = 0;
let lines = template.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // count <div ...> but not <div ... />
  const opens = (line.match(/<div(?![^>]*\/>)[^>]*>/g) || []).length;
  // count </div>
  const closes = (line.match(/<\/div>/g) || []).length;
  
  openDivs += opens;
  openDivs -= closes;
  
  if (opens > 0 || closes > 0) {
    console.log(`Line ${i + 321}: opens ${opens}, closes ${closes}, balance ${openDivs}`);
  }
}

console.log("Final balance: ", openDivs);
