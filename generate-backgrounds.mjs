// generate-backgrounds.mjs — corre UNA vez, genera la biblioteca
import fs from 'node:fs';
import path from 'node:path';

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) { console.error('Falta OPENAI_API_KEY'); process.exit(1); }

const STYLE = "soft watercolor children's book illustration, loose painterly washes, warm pastel colors, magical and dreamy atmosphere, beautiful detailed scenery, NO characters, NO people, NO creatures, NO silhouettes, empty landscape only, no text, safe for children";

const SCENES = {
  bosque:    "a magical forest path with tall friendly trees, dappled golden light, mushrooms and fireflies",
  montana:   "rolling mountains with a winding path, soft clouds, morning light over green valleys",
  cueva:     "the inside of a cozy magical cave painted in loose soft watercolor washes on textured paper, warm golden lantern glow, gently rounded rock shapes in amber and ochre tones, a smooth flat sandy floor stretching across the entire lower third of the image, a few soft sparkles, dreamy and inviting, hand-painted children's book style",
  mar:       "a calm turquoise sea with gentle waves, a sandy shore, distant sailboat, warm sky",
  tormenta:  "a dramatic but soft stormy sky with rain clouds parting, a rainbow beginning to appear",
  laberinto: "a whimsical garden maze with tall green hedges, stone archways, golden afternoon light",
  puente:    "an old wooden bridge over a sparkling river, wildflowers on the banks, soft mist",
  castillo:  "a fairytale castle on a hill with turrets and flags, warm sunset colors",
  pueblo:    "a cozy storybook village with crooked houses, warm windows glowing, cobblestone streets",
  noche:     "a peaceful starry night sky with a big friendly moon over silhouetted hills",
  pradera:   "a sunny meadow full of colorful wildflowers, butterflies, distant hills, blue sky",
  maquinas:  "a whimsical inventor's workshop landscape with giant friendly gears and cogs, warm copper tones",
};

const VARIANTS = 3;
const OUT = 'public/backgrounds';
fs.mkdirSync(OUT, { recursive: true });

for (const [name, desc] of Object.entries(SCENES)) {
  for (let v = 1; v <= VARIANTS; v++) {
    const file = path.join(OUT, `${name}-${v}.webp`);
    if (fs.existsSync(file)) { console.log(`skip ${file}`); continue; }
    console.log(`Generando ${name}-${v}...`);
    const resp = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `${STYLE}. Scene: ${desc}`,
        size: '1024x1536',
        quality: 'medium',
        output_format: 'webp',
        output_compression: 80,
        n: 1,
      }),
    });
    const data = await resp.json();
    if (data.error) { console.error(`ERROR en ${name}-${v}:`, data.error.message); continue; }
    fs.writeFileSync(file, Buffer.from(data.data[0].b64_json, 'base64'));
    console.log(`  → ${file} (${(fs.statSync(file).size/1024)|0} KB)`);
  }
}
console.log('Biblioteca completa.');
