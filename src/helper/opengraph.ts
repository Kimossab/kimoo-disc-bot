import { goto } from 'puppeteer-bypass';
import Logger from './logger';

const _logger = new Logger('opengraph');

const execRegex = (body: string): string_object<string> => {
  const ogRegex = /property="og:([^"]*)"\scontent="([^"]*)/gm;
  const matches: string_object<string> = {};
  let m;
  while ((m = ogRegex.exec(body)) !== null) {
    if (m.index === ogRegex.lastIndex) {
      ogRegex.lastIndex++;
    }
    matches[m[1]] = m[2];
  }
  return matches;
}

const getOpenGraphInfo = async (url: string): Promise<Nullable<string_object<string>>> => {
  try {
    const response = await goto(url);
    
    return execRegex(response.body);
  } catch (error) {
    _logger.error('og request', error);
    return null
  }
}

export default getOpenGraphInfo;
