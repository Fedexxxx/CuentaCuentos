import fs from 'node:fs';
const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('Falta OPENAI_API_KEY'); process.exit(1); }

const resp = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-image-1',
    prompt: "a charming watercolor icon of an open storybook with golden magical sparkles and tiny stars rising from its pages, warm orange and honey palette, simple rounded shapes, children's book style, centered on a plain white background, no text",
    size: '1024x1024',
    quality: 'low',
    n: 1,
  }),
});
const data = await resp.json();
if (data.error) { console.error(data.error.message); process.exit(1); }
fs.writeFileSync('public/logo.png', Buffer.from(data.data[0].b64_json, 'base64'));
console.log('logo OK →', (fs.statSync('public/logo.png').size / 1024 | 0), 'KB');
