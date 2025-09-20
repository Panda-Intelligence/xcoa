import { drizzle } from 'drizzle-orm/d1';
import Database from 'better-sqlite3';
import { seedEcoaData } from './seed-ecoa-data';

async function runSeed() {
  console.log('🚀 开始运行 eCOA 种子数据脚本...');
  
  try {
    // 连接到本地 SQLite 数据库
    const sqlite = new Database('.wrangler/state/v3/d1/miniflare-D1DatabaseObject/85c660f8-f82e-4bdd-8cad-59b0d5110ef8.sqlite');
    const db = drizzle(sqlite);
    
    await seedEcoaData(db);
    
    sqlite.close();
    console.log('✅ 种子数据脚本运行完成！');
  } catch (error) {
    console.error('❌ 运行种子数据时出错:', error);
    process.exit(1);
  }
}

runSeed();