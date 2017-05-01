import path from 'path';
import url from 'url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const FILE_SERVE_ROOT = path.join(PROJECT_ROOT, 'src');

const consts = {
  LEADING_SLASH_RE: /^\//,
  INDEX_JS_SUFFIX_RE: /\/index\.js[^\/]*$/,

  HAS_EXT_RE: /\.[^\/]*$/,
  // Captures the set of tags and extension in parens ()
  ALL_TAGS_AND_EXT_RE: /\.([^\/]+)$/,

  // URL bundle-routing scheme:
  // localhost:8080/path/to/Root.x.y.z.a.b.c.d.e.f.g.bundle
  //                             \----- tags ------/ \type/
  // Route types:
  PAGE_EXT_RE: /\.html$/,

  BUNDLE_EXT: '.bundle',
  BUNDLE_EXT_RE: /\.bundle$/,

  MAP_EXT: '.map',
  MAP_EXT_RE: /\.map$/,

  // Route tags:
  INCLUDE_REQUIRE_TAG: 'includeRequire',
  RUN_MODULE_TAG: 'runModule',

  // Misc:
  JS_SRC_EXT: '.js',
  JS_SRC_EXT_RE: /\.js[^\/]*$/,
};

function middleware(req, res, next) {
  if (req.method !== 'GET') {
    return next();
  }

  const reqPath = url.parse(req.url).pathname;
  const isComponent =
    consts.PAGE_EXT_RE.test(reqPath) || !consts.HAS_EXT_RE.test(reqPath);

  if (!isComponent) {
    return next();
  }

  const componentPath = path.join(FILE_SERVE_ROOT, reqPath);
  const importPath = componentPath.replace(/\.([^\/]+)$/, '.js');

  // TODO: transform /foo into either /foo or /foo/index.html
  // TODO: guard against static resources (not React components)
  const modulePath = require.resolve(importPath);
  const moduleCache = require.cache[modulePath];
  const hnav = require.resolve(
    path.join(PROJECT_ROOT, 'components/nav/HeaderNav'),
  );
  const hnaven = require.cache[hnav];
  const md = require('module-deps');

  if (moduleCache != null) {
    for (const moduleId of Object.keys(require.cache)) {
      delete require.cache[moduleId];
    }
    // delete require.cache[require.resolve(importPath)];
    // delete require.cache[hnav];
    // delete require.cache[
    //   require.resolve(path.join(PROJECT_ROOT, 'components/Site'))
    // ];
  }
  console.log('LAL', hnaven);
  import(importPath)
    .then(({ default: component }) => {
      const markup = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(React.createElement(component))}`;

      res.setHeader('Date', new Date().toUTCString());
      // Always assume we had compiled something that may have changed.
      res.setHeader('Last-Modified', new Date().toUTCString());
      res.setHeader('Content-Length', Buffer.byteLength(markup, 'utf8'));
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(markup);
    })
    .catch(e => {
      next(e);
    });
}

export default middleware;
