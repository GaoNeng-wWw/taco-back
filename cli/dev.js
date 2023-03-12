/* eslint-disable @typescript-eslint/no-var-requires */
const dot = require('dotenv');
const { join } = require('path');
const concurrently = require('concurrently').default;

dot.config({ path: join(__dirname, '../.env') });
const args = process.argv;
args.shift();
args.shift();
const run = [];
args.forEach((arg) => {
  run.push(`"nest start ${arg} --watch"`);
});
concurrently(run);
