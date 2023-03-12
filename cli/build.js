/* eslint-disable @typescript-eslint/no-var-requires */
const concurrently = require('concurrently').default;
const config = require('../nest-cli.json');
const runs = [];
Object.keys(config.projects).forEach((arg) => {
  runs.push(`"nest build ${arg}"`);
});

concurrently(runs);
