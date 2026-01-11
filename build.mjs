import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const isWatch = process.argv.includes('--watch');

// Build configuration
const buildOptions = {
  entryPoints: ['./src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  external: [],
  sourcemap: true,
};

async function build() {
  // Generate TypeScript declarations
  console.log('Generating .d.ts...');
  try {
    execSync('npx tsc --emitDeclarationOnly --declaration --outDir ./build', { stdio: 'inherit' });
  } catch (e) {
    // Continue even if there are type errors
  }

  // Build CommonJS
  console.log('Generating CJS build...');
  await esbuild.build({
    ...buildOptions,
    outfile: './build/index.js',
    format: 'cjs',
  });

  // Build ESM
  console.log('Generating ESM build...');
  await esbuild.build({
    ...buildOptions,
    outfile: './build/index.mjs',
    format: 'esm',
  });

  console.log('Done!');
}

if (isWatch) {
  const ctx = await esbuild.context({
    ...buildOptions,
    outfile: './build/index.js',
    format: 'cjs',
  });
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  build();
}
