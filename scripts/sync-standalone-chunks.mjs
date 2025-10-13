// Sync missing server chunk files from .next/server/chunks to
// .next/standalone/.next/server/chunks to work around a Next 15
// standalone output omission that breaks OpenNext copyTracedFiles.
//
// Safe to run multiple times. Copies only files that are missing in
// the standalone directory.
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const rootChunks = path.join(root, '.next', 'server', 'chunks');
const standaloneChunks = path.join(root, '.next', 'standalone', '.next', 'server', 'chunks');

function main() {
  if (!fs.existsSync(rootChunks)) {
    console.error(`[sync-standalone-chunks] Source not found: ${rootChunks}`);
    process.exit(0);
  }
  if (!fs.existsSync(standaloneChunks)) {
    console.error(`[sync-standalone-chunks] Destination not found: ${standaloneChunks}`);
    process.exit(0);
  }

  const srcFiles = fs.readdirSync(rootChunks).filter(f => f.endsWith('.js'));
  let copied = 0;
  for (const file of srcFiles) {
    const src = path.join(rootChunks, file);
    const dst = path.join(standaloneChunks, file);
    if (!fs.existsSync(dst)) {
      fs.copyFileSync(src, dst);
      copied++;
    }
  }
  console.log(`[sync-standalone-chunks] Copied ${copied} missing chunk file(s) to standalone.`);
}

main();

