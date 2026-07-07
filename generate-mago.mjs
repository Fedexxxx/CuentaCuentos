import fs from 'node:fs';

const KEY = process.env.OPENAI_API_KEY;
const CARD_STYLE = "soft watercolor illustration for a children's picture book, gentle washes of color, loose painterly brushstrokes, warm pastel palette, white paper texture showing through, cute and friendly character with simple rounded shapes, no text, no dark elements, safe for children aged 4-10, square composition with subject centered, plenty of white space around edges";
const MAGO = "a mysterious young wizard with a deep blue robe covered in tiny golden stars, tall pointed blue hat, holding a glowing wooden staff, gentle wise smile, watercolor children illustration";

const resp = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: 'gpt-image-1',
    prompt: `${CARD_STYLE}. Subject: ${MAGO}`,
    size: '1024x1024', quality: 'low', n: 1,
  }),
});
const data = await resp.json();
if (data.error) { console.error(data.error.message); process.exit(1); }
fs.writeFileSync('public/cards/hero-mago.png', Buffer.from(data.data[0].b64_json, 'base64'));
console.log('hero-mago.png OK');
