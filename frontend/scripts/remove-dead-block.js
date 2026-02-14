const fs = require('fs');
const path = require('path');
const p = process.argv[2] || path.resolve(__dirname, '../app/withdraw/page.tsx');
const content = fs.readFileSync(p, 'utf8');
const lines = content.split('\n');

// Remove TL order UI block: from "                                                    {false && (" to "                                                    )}" before "                                                    {/* Proof Error */}"
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('{false && (') && lines[i].trim().startsWith('{false')) {
        startIdx = i;
        break;
    }
}
if (startIdx >= 0) {
    for (let i = startIdx + 1; i < lines.length; i++) {
        if (lines[i].trim() === ')}' && lines[i + 1] && lines[i + 1].includes('Proof Error')) {
            endIdx = i;
            break;
        }
    }
}
if (startIdx === -1 || endIdx === -1) {
    console.log('TL block not found. startIdx=', startIdx, 'endIdx=', endIdx);
    process.exit(1);
}
const before = lines.slice(0, startIdx);
const after = lines.slice(endIdx + 1);
const newContent = before.join('\n') + '\n' + after.join('\n');
fs.writeFileSync(p, newContent);
console.log('Removed TL UI block lines', startIdx + 1, '-', endIdx + 1, ', total', lines.length, '->', before.length + after.length);
