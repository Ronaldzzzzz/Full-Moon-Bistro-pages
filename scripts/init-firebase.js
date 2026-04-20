import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function sha256(msg) {
  return crypto.createHash('sha256').update(msg).digest('hex');
}

async function init() {
  console.log('--- 月圓餐館 (Full-Moon-Bistro) 初始化開始 ---');

  // 1. 設定管理員密碼: moonlight2026
  const password = 'moonlight2026';
  const hash = await sha256(password);
  await setDoc(doc(db, 'adminPasswords', hash), {
    role: 'owner',
    label: '主廚密碼'
  });
  console.log(`[OK] 管理員密碼已設定 (明碼為: ${password})`);

  // 2. 注入範例菜單
  const menuItems = [
    { category: 'main', name: '秘製月圓燉肉', description: '選用在地食材，搭配濃郁紅酒醬汁長時間慢火熬煮。', price: 280, available: true, order: 1, imageUrl: '' },
    { category: 'drink', name: '月下沁涼麥酒', description: '口感清爽，帶有淡淡花香的自家釀造麥酒。', price: 120, available: true, order: 2, imageUrl: '' },
    { category: 'dessert', name: '滿月乳酪塔', description: '口感綿密的濃郁起司，象徵滿月的圓滿。', price: 150, available: true, order: 3, imageUrl: '' }
  ];

  for (const item of menuItems) {
    await addDoc(collection(db, 'menuItems'), item);
  }
  console.log('[OK] 範例菜單已注入');

  // 3. 注入歡迎留言
  await addDoc(collection(db, 'messages'), {
    authorId: '遊吟詩人',
    serverName: 'Gaia',
    isAnonymous: false,
    content: '很高興來到月圓餐館，這裡的音樂與氛圍讓人流連忘返！',
    timestamp: serverTimestamp(),
    likes: 1,
    dislikes: 0
  });
  console.log('[OK] 歡迎留言已注入');

  console.log('--- 初始化完成！現在請執行 npm run dev 預覽網頁 ---');
  process.exit(0);
}

init().catch(err => {
  console.error('[Error] 初始化失敗:', err);
  process.exit(1);
});
