const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://raw.githubusercontent.com/ffxiv-teamcraft/ffxiv-teamcraft/staging/libs/data/src/lib/json';

const FILES = {
  items: `${BASE_URL}/items.json`,
  icons: `${BASE_URL}/item-icons.json`,
  recipes: `${BASE_URL}/recipes.json`,
  twItems: `${BASE_URL}/tw/tw-items.json`,
  zhItems: `${BASE_URL}/zh/zh-items.json`
};

const TEMP_DIR = path.resolve(__dirname, '../temp_raw_data');
const OUT_DIR = path.resolve(__dirname, '../public/data');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  try {
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR);
    if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

    console.log('Downloading raw data from Teamcraft...');
    for (const [key, url] of Object.entries(FILES)) {
      const dest = path.join(TEMP_DIR, `${key}.json`);
      console.log(`- Downloading ${key}...`);
      await download(url, dest);
    }

    console.log('Processing data...');
    const items = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, 'items.json'), 'utf8'));
    const icons = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, 'icons.json'), 'utf8'));
    const recipesArray = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, 'recipes.json'), 'utf8'));
    const twItems = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, 'twItems.json'), 'utf8'));
    const zhItems = JSON.parse(fs.readFileSync(path.join(TEMP_DIR, 'zhItems.json'), 'utf8'));

    const masterItems = {};
    const itemToRecipe = {};

    // 建立 Recipe 反查
    for (const r of recipesArray) {
      if (r && r.result) {
        itemToRecipe[r.result] = r.id;
      }
    }

    Object.keys(items).forEach(id => {
      const icon = icons[id];
      if (!icon) return;

      // 語系合併優先權: tw > zh > en
      const name = (twItems[id] && twItems[id].tw) || 
                   (zhItems[id] && zhItems[id].zh) || 
                   items[id].en;
      
      if (!name) return;

      masterItems[id] = {
        n: name,
        i: icon
      };

      if (itemToRecipe[id]) {
        masterItems[id].r = itemToRecipe[id];
      }
    });

    const masterRecipes = {};
    recipesArray.forEach(r => {
      if (!r || !r.result || !r.ingredients) return;
      // 以物品 ID 作為 Key，方便後台直接查詢「該物品如何製作」
      masterRecipes[r.result] = {
        ings: r.ingredients
          .filter(ing => ing.id > 0 && ing.amount > 0)
          .map(ing => ({ i: ing.id, a: ing.amount }))
      };
    });

    fs.writeFileSync(path.join(OUT_DIR, 'master_items.json'), JSON.stringify(masterItems));
    fs.writeFileSync(path.join(OUT_DIR, 'master_recipes.json'), JSON.stringify(masterRecipes));

    console.log('Build complete!');
    console.log(`- ${Object.keys(masterItems).length} items saved.`);
    console.log(`- ${Object.keys(masterRecipes).length} recipes saved.`);

    // 清理暫存
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
