// const { exec } = require('child_process');
// import concurrently from 'concurrently';
const concurrently = require('concurrently').default;

const args = process.argv;
args.shift();
args.shift();
const run = [];
args.forEach((arg) => {
  run.push(`"nest start ${arg} --watch"`);
});
concurrently(run);
