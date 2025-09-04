import http from 'http';
import express from 'express';
import open from 'open';

import { FilePath, port } from './config';

const app = express();
const url = `http://localhost:${port}/JS/index.html`;

/** 🏂 静态文件 */
Object.entries(FilePath).forEach(([route, path]) => {
  app.use(route, express.static(path));
})

const server = http.createServer(app);

server.listen(port, () => {
  if (process.env.NODE_ENV === 'demo') {
    console.log(`Server is running on http://localhost:${port}`);
    open(url);
  }
});
