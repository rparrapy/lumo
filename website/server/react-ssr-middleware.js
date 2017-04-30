import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FILE_SERVE_ROOT = path.join(PROJECT_ROOT, 'src');

function middleware(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const componentPath = path.join(FILE_SERVE_ROOT, req.url);
  const importPath = componentPath.replace(/\.([^\/]+)$/, '.js');

  import(importPath).then(x => {
    console.log(x);
    next();
  });
}

export default middleware;
