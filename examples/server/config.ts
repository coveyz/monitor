import { resolve } from 'path';

const resolveDirName = (target: string) => resolve(__dirname, target);

const JSFilePath = resolveDirName('../JS');

const WebFilePath = resolve('./packages/web/dist');

export const FilePath = {
    '/JS': JSFilePath,
    '/WebDist': WebFilePath
}

export const port = 3321;
