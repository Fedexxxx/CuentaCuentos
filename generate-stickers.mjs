import fs from 'fs';
import path from 'path';
import https from 'https';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ Falta OPENAI_API_KEY en las variables de entorno');
  process.exit(1);
}

// Estilo base: personaje solo, fondo blanco, watercolor infantil
// Sin rostros expresivos, formas simples y redondeadas
const STICKER_STYLE = "single character on a pure white background, soft watercolor children's book illustration, loose painterly style, warm pastel colors, simple rounded shapes, charming and friendly, NO facial details, NO expressive eyes or mouth, character recognizable by shape and accessories only, centered in frame with generous white space around, no shadows, no text, safe for children";

const STICKERS = [
  // HÉROES
  { file: 'sticker-hero-nina',
    prompt: 'a small girl wearing a red cape and a little explorer hat, seen from behind or side, simple rounded silhouette with cape flowing' },
  { file: 'sticker-hero-robot',
    prompt: 'a small round friendly robot with a round head, little antenna on top, chunky body and short arms, simple boxy silhouette' },
  { file: 'sticker-hero-zorro',
    prompt: 'a small fox with large triangular ears, fluffy tail, wearing a tiny hat, simple animal silhouette with warm orange fur' },
  { file: 'sticker-hero-bruja',
    prompt: 'a small friendly witch with a tall pointy hat, simple round body, holding a small wand with a star tip, whimsical not scary' },

  // AMIGOS
  { file: 'sticker-friend-dragon',
    prompt: 'a small baby dragon with little wings, round body, short tail and tiny horns, soft green and teal colors, chubby and cute silhouette' },
  { file: 'sticker-friend-fantasma',
    prompt: 'a small round ghost with a simple flowing bottom, tiny arms, soft white and lavender watercolor, glowing gently, no face details' },
  { file: 'sticker-friend-pulpo',
    prompt: 'a small octopus with eight curly tentacles, round head, soft pink and purple watercolor, cheerful round body shape' },
  { file: 'sticker-friend-robot',
    prompt: 'a small square robot different from the hero, rectangular body with little round wheels, one antenna, soft blue and silver colors' },

  // VILLANOS
  { file: 'sticker-villain-gigante',
    prompt: 'a very large round stone giant, simple boulder-like body with two big round legs, mossy texture, clearly clumsy and harmless looking' },
  { file: 'sticker-villain-maquina',
    prompt: 'a clunky old machine with mismatched gears sticking out, a chimney on top with a little puff of smoke, dials and levers, rusty orange and brown colors' },
  { file: 'sticker-villain-rey',
    prompt: 'a short chubby king with a wobbly oversized crown, round royal robes, holding a tiny scepter, clearly bumbling and non-threatening' },
  { file: 'sticker-villain-sombra',
    prompt: 'a soft fluffy dark purple shadow creature, round and cloud-like shape, no features, slightly grumpy silhouette with small pointy ears' },
];

const OUTPUT_DIR = './public/stickers';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateImage(sticker) {
  const fullPrompt = `${STICKER_STYLE}. Character: ${sticker.prompt}`;

  const body = JSON.stringify({
    model: 'gpt-image-1',
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'medium',
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.openai.com',
        path: '/v1/images/generations',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            if (json.error) return reject(new Error(json.error.message));
            const b64 = json.data[0].b64_json;
            const buffer = Buffer.from(b64, 'base64');
            const filePath = path.join(OUTPUT_DIR, `${sticker.file}.png`);
            fs.writeFileSync(filePath, buffer);
            resolve(filePath);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log(`🎨 Generando ${STICKERS.length} stickers de personajes...\n`);

  const BATCH = 2; // Más conservador para quality:medium
  for (let i = 0; i < STICKERS.length; i += BATCH) {
    const batch = STICKERS.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (sticker) => {
        const filePath = path.join(OUTPUT_DIR, `${sticker.file}.png`);
        if (fs.existsSync(filePath)) {
          console.log(`  ⏭️  ${sticker.file} ya existe, saltando`);
          return;
        }
        process.stdout.write(`  ⏳ ${sticker.file}...`);
        try {
          await generateImage(sticker);
          console.log(` ✅ guardado`);
        } catch (err) {
          console.log(` ❌ error: ${err.message}`);
        }
      })
    );
  }

  console.log('\n✨ ¡Listo! Revisá public/stickers/ y commiteá las imágenes a GitHub.');
  console.log('💡 Tip: si algún personaje quedó raro, borrá solo ese archivo y volvé a correr el script.');
}

main();
