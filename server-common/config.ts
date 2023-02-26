import { ConfigStructre } from '@common/interface/config.interface';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
const configFile =
  process.env.NODE_ENV === 'production' ? 'production.yaml' : 'dev.yaml';
export default () => {
  return yaml.load(
    readFileSync(join('./server-common/env/', configFile), 'utf8'),
  ) as ConfigStructre;
};