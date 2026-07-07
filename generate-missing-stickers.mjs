import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('Falta OPENAI_API_KEY'); process.exit(1); }

const STYLE = "soft watercolor illustration for a children's picture book, gentle washes of color, loose painterly brushstrokes, warm pastel palette, cute and friendly character with simple rounded shapes, FULL BODY character centered on a plain white background, NO scenery, NO ground, NO shadows on the ground, no text, safe for children aged 4-10";

const POSES = {
  1: 'standing proudly, front view, smiling',
  2: 'in motion, mid-action, dynamic pose',
  3: 'surprised expression, reacting with hands up',
  4: 'celebrating happily, joyful pose',
};

const CHARACTERS = {
  'villain-rey':        'a silly bumbling king with a crooked golden crown and oversized red robe, confused expression, cartoonish and non-threatening',
  'friend-anciana':     'a kind elderly woman with white hair in a bun, round glasses, warm smile, cozy shawl, carrying a small basket',
  'villain-bruja':      'a quirky witch with a wobbly purple hat and striped socks, mischievous but harmless grin, holding a small wooden spoon',
  'hero-explorador':    'a young boy explorer with a green backpack, compass in hand, adventurous smile, explorer hat',
  'villain-maquina':    'a whimsical floating antique machine with a rounded copper body and a frowning clock-dial face, hovering gently in the air with soft magical sparkles underneath, NO wheels, NO legs, NO tracks, levitating, ethereal and dreamlike',
  'villain-sombra':     'a soft round shadow creature in deep indigo and purple watercolor, big expressive white eyes, grumpy but adorable, compact solid silhouette with smooth clean edges, slightly translucent at the top like mist',
};

const OUT = 'public/cards';
for (const [charId, desc] of Object.entries(CHARACTERS)) {
  for (const [v, pose] of Object.entries(POSES)) {
    const file = path.join(OUT, `${charId}-v${v}.png`);
    // OJO: maquina y sombra YA existen — borrarlas antes de correr (paso previo)
    if (fs.existsSync(file)) { console.log(`skip ${file}`); continue; }
    console.log(`Generando ${charId}-v${v}...`);
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `${STYLE}. Character: ${desc}. Pose: ${pose}`,
        size: '1024x1024',
        quality: 'low',
        n: 1,
      }),
    });
    const data = await resp.json();
    if (data.error) { console.error(`ERROR ${charId}-v${v}:`, data.error.message); continue; }
    fs.writeFileSync(file, Buffer.from(data.data[0].b64_json, 'base64'));
    console.log(`  → OK`);
  }
}
