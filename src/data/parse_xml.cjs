const fs = require('fs');

const xmlPath = 'C:\\Users\\Holy_\\.gemini\\antigravity\\scratch\\holly-breath\\src\\data\\extracted_docx\\word\\document.xml';
const xmlContent = fs.readFileSync(xmlPath, 'utf8');

const paragraphs = xmlContent.split('</w:p>');
let lines = [];
for (let p of paragraphs) {
    let pText = '';
    const tTags = Array.from(p.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g));
    for (let t of tTags) {
        let text = t[1];
        if (text) pText += text;
    }
    lines.push(pText);
}
const fullText = lines.join('\n');
fs.writeFileSync('C:\\Users\\Holy_\\.gemini\\antigravity\\scratch\\holly-breath\\src\\data\\parsed_raw.txt', fullText, 'utf8');
console.log('Text extracted. Length:', fullText.length);
