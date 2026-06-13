import fs from 'fs';
import path from 'path';
import https from 'https';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ Falta OPENAI_API_KEY en las variables de entorno');
  process.exit(1);
}

const CARD_STYLE = "soft watercolor illustration for a children's picture book, gentle washes of color, loose painterly brushstrokes, warm pastel palette, white paper texture showing through, cute and friendly character with simple rounded shapes, no text, no dark elements, safe for children aged 4-10, square composition with subject centered, plenty of white space around edges";

const CARDS = [
  // HÉROE
  { file: 'hero-nina',       prompt: 'a brave little girl explorer with a red cape and big curious eyes, watercolor children illustration' },
  { file: 'hero-dragon',     prompt: 'a small friendly baby dragon with soft green scales and a big smile, watercolor children illustration' },
  { file: 'hero-zorro',      prompt: 'a clever little fox wearing a tiny hat, sitting upright and looking curious, watercolor children illustration' },
  { file: 'hero-robot',      prompt: 'a small round cheerful robot with glowing eyes and little antenna, watercolor children illustration' },
  { file: 'hero-explorador', prompt: 'a young boy explorer with a backpack and compass, adventurous expression, watercolor children illustration' },

  // AMIGO
  { file: 'friend-pulpo',    prompt: 'a happy little octopus playing a tiny guitar with colorful tentacles, watercolor children illustration' },
  { file: 'friend-anciana',  prompt: 'a kind elderly woman with white hair and a warm smile, carrying a basket, watercolor children illustration' },
  { file: 'friend-fantasma', prompt: 'a friendly cute ghost with a big smile and rosy cheeks, glowing softly, watercolor children illustration' },
  { file: 'friend-robot2',   prompt: 'a tiny cute robot with big round eyes and small arms waving hello, watercolor children illustration' },

  // VILLANO
  { file: 'villain-rey',     prompt: 'a silly bumbling king with a crooked crown looking confused, cartoonish and non-threatening, watercolor children illustration' },
  { file: 'villain-maquina', prompt: 'a clunky old machine with mismatched gears and a frowning dial face, clearly harmless and funny, watercolor children illustration' },
  { file: 'villain-bruja',   prompt: 'a quirky witch with a wobbly hat stirring a colorful potion, whimsical not scary, watercolor children illustration' },
  { file: 'villain-sombra',  prompt: 'a soft fluffy shadow creature with big round eyes looking grumpy but cute, watercolor children illustration' },
  { file: 'villain-gigante', prompt: 'a big friendly-looking stone giant with a puzzled expression, clearly gentle, watercolor children illustration' },

  // OBSTÁCULO
  { file: 'obstacle-laberinto', prompt: 'a colorful hedge maze seen from above with flowers and butterflies, cheerful and inviting, watercolor children illustration' },
  { file: 'obstacle-tormenta',  prompt: 'a small fluffy storm cloud with a grumpy face dropping rain and lightning bolts, cute not scary, watercolor children illustration' },
  { file: 'obstacle-secreto',   prompt: 'a glowing old treasure chest locked with a golden key beside it, mysterious and magical, watercolor children illustration' },
  { file: 'obstacle-puente',    prompt: 'a broken wooden bridge over a gentle stream with flowers on both sides, watercolor children illustration' },
  { file: 'obstacle-mar',       prompt: 'gentle icy blue ocean waves with snowflakes and a friendly seal poking out, watercolor children illustration' },

  // DESENLACE
  { file: 'outcome-amistad',   prompt: 'two small animals hugging each other surrounded by hearts and colorful flowers, watercolor children illustration' },
  { file: 'outcome-valentia',  prompt: 'a little character standing tall on a hilltop with arms raised in triumph, sunrise behind, watercolor children illustration' },
  { file: 'outcome-astucia',   prompt: 'a small clever character with a lightbulb above their head, surrounded by stars and sparkles, watercolor children illustration' },
  { file: 'outcome-sacrificio', prompt: 'a character offering a glowing gift to a friend, warm golden light between them, watercolor children illustration' },
  { file: 'outcome-perdon',    prompt: 'two characters facing each other with a dove flying between them and soft rainbow colors, watercolor children illustration' },
];

const OUTPUT_DIR = './public/cards';
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function generateImage(card) {
  const fullPrompt = `${CARD_STYLE}. Subject: ${card.prompt}`;

  const body = JSON.stringify({
    model: 'gpt-image-1',
    prompt: fullPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'low',
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
            const filePath = path.join(OUTPUT_DIR, `${card.file}.png`);
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
  console.log(`🎨 Generando ${CARDS.length} cards en estilo watercolor...\n`);

  // De a 3 en paralelo para no saturar la API
  const BATCH = 3;
  for (let i = 0; i < CARDS.length; i += BATCH) {
    const batch = CARDS.slice(i, i + BATCH);
    await Promise.all(
      batch.map(async (card) => {
        const filePath = path.join(OUTPUT_DIR, `${card.file}.png`);
        if (fs.existsSync(filePath)) {
          console.log(`  ⏭️  ${card.file} ya existe, saltando`);
          return;
        }
        process.stdout.write(`  ⏳ ${card.file}...`);
        try {
          await generateImage(card);
          console.log(` ✅ guardado`);
        } catch (err) {
          console.log(` ❌ error: ${err.message}`);
        }
      })
    );
  }

  console.log('\n✨ ¡Listo! Revisá public/cards/ y commiteá las imágenes a GitHub.');
}

main();
