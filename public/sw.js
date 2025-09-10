if (!self.define) {
  let e,
    s = {}
  const c = (c, i) => (
    (c = new URL(c + '.js', i).href),
    s[c] ||
      new Promise((s) => {
        if ('document' in self) {
          const e = document.createElement('script')
          ;(e.src = c), (e.onload = s), document.head.appendChild(e)
        } else (e = c), importScripts(c), s()
      }).then(() => {
        let e = s[c]
        if (!e) throw new Error(`Module ${c} didn’t register its module`)
        return e
      })
  )
  self.define = (i, n) => {
    const a =
      e ||
      ('document' in self ? document.currentScript.src : '') ||
      location.href
    if (s[a]) return
    let t = {}
    const d = (e) => c(e, a),
      r = { module: { uri: a }, exports: t, require: d }
    s[a] = Promise.all(i.map((e) => r[e] || d(e))).then((e) => (n(...e), t))
  }
}
define(['./workbox-7c0e42fd'], function (e) {
  'use strict'
  importScripts(),
    self.skipWaiting(),
    e.clientsClaim(),
    e.precacheAndRoute(
      [
        {
          url: '/_next/app-build-manifest.json',
          revision: '56c32804d2475ea056c537f425b98a2f',
        },
        {
          url: '/_next/static/UTdW6GzexuH0b_5lhCjbQ/_buildManifest.js',
          revision: '7fc1cffeaa0c0d3f8da2638cba1b4528',
        },
        {
          url: '/_next/static/UTdW6GzexuH0b_5lhCjbQ/_ssgManifest.js',
          revision: 'b6652df95db52feb4daf4eca35380933',
        },
        {
          url: '/_next/static/chunks/271-14219c3d551b93f4.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/273-48a5c26863f111df.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/388-18a810d5e825de94.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/4bd1b696-7c031254ce4f2710.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/684-632d20101d7a40f5.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/723-340b28fe43a4ddb0.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/725-917496ababbd8997.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/824.9ff702af5411caa5.js',
          revision: '9ff702af5411caa5',
        },
        {
          url: '/_next/static/chunks/856-d44d21261ef6ea7c.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/916-eeb7208303b0d891.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/_not-found/page-13bda03fd3eedcd2.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/error-7309254e99f704ab.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/layout-122537a365b7e975.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/offline/page-ae4674ea6e5c7bcb.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/page-c26421dc929b5aa5.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/workouts/%5B...slug%5D/page-fc8af204bd456955.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/workouts/layout-7652426c7c0083c8.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/app/workouts/page-3ea38e1c98002509.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/framework-6d868e9bc95e10d8.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/main-1afe8f9ae4b55930.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/main-app-164fa2be789b976b.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/pages/_app-da15c11dea942c36.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/pages/_error-cc3f077a18ea1793.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/chunks/polyfills-42372ed130431b0a.js',
          revision: '846118c33b2c0e922d7b3a7676f81f6f',
        },
        {
          url: '/_next/static/chunks/webpack-a00326684ea4558d.js',
          revision: 'UTdW6GzexuH0b_5lhCjbQ',
        },
        {
          url: '/_next/static/css/5e955f266ad49835.css',
          revision: '5e955f266ad49835',
        },
        {
          url: '/_next/static/css/6bdb8f8f3cbeb297.css',
          revision: '6bdb8f8f3cbeb297',
        },
        {
          url: '/_next/static/css/a70d561fad5d5dba.css',
          revision: 'a70d561fad5d5dba',
        },
        {
          url: '/_next/static/media/046b90749014f852-s.woff2',
          revision: '19bf2a23f7f672153135a9d1918f6f9a',
        },
        {
          url: '/_next/static/media/26a46d62cd723877-s.woff2',
          revision: 'befd9c0fdfa3d8a645d5f95717ed6420',
        },
        {
          url: '/_next/static/media/55c55f0601d81cf3-s.woff2',
          revision: '43828e14271c77b87e3ed582dbff9f74',
        },
        {
          url: '/_next/static/media/581909926a08bbc8-s.woff2',
          revision: 'f0b86e7c24f455280b8df606b89af891',
        },
        {
          url: '/_next/static/media/67110d8fe39c5e84-s.woff2',
          revision: '91c073ec3046c2fc252900a89b6fc5d0',
        },
        {
          url: '/_next/static/media/6aacc40b7795b725-s.woff2',
          revision: '48e07fe2ca9c3bc32d09affb2ace8844',
        },
        {
          url: '/_next/static/media/848b99572ad207f3-s.woff2',
          revision: '31904e07bc2fac21149accd8a82eb1b1',
        },
        {
          url: '/_next/static/media/8e9860b6e62d6359-s.woff2',
          revision: '01ba6c2a184b8cba08b0d57167664d75',
        },
        {
          url: '/_next/static/media/97e0cb1ae144a2a9-s.woff2',
          revision: 'e360c61c5bd8d90639fd4503c829c2dc',
        },
        {
          url: '/_next/static/media/999e639cd9d85971-s.woff2',
          revision: '59533f46ae2b6e4fed5c133c03ea0608',
        },
        {
          url: '/_next/static/media/c97d4358b5ad6f1f-s.p.woff2',
          revision: '748da8fce84b0b6ee83bacd60aed2979',
        },
        {
          url: '/_next/static/media/df0a9ae256c0569c-s.woff2',
          revision: 'd54db44de5ccb18886ece2fda72bdfe0',
        },
        {
          url: '/_next/static/media/e4af272ccee01ff0-s.p.woff2',
          revision: '65850a373e258f1c897a2b3d75eb74de',
        },
        {
          url: '/_next/static/media/e6b5cfd5a74e1cae-s.woff2',
          revision: '8358e3d9b140dd03a59878681e98a5e4',
        },
        { url: '/favicon.ico', revision: 'c30c7d42707a47a3f4591831641e50dc' },
        {
          url: '/icons/add-shortcut.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-128x128.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-144x144.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-152x152.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-192x192.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-384x384.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-512x512.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-72x72.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-96x96.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/icon-base.svg',
          revision: '9c0491dc576d1c16208c132b66fee698',
        },
        {
          url: '/icons/screenshot-1.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/screenshot-2.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        {
          url: '/icons/workouts-shortcut.png',
          revision: 'd41d8cd98f00b204e9800998ecf8427e',
        },
        { url: '/manifest.json', revision: 'afaa0af5564b6a7771722634bea8c54b' },
        { url: '/next.svg', revision: '8e061864f388b47f33a1c3780831193e' },
        { url: '/robots.txt', revision: 'c705e80aec228cdbe7a3b7fd28e1ef08' },
        { url: '/vercel.svg', revision: '61c6b19abff40ea7acd577be818f3976' },
      ],
      { ignoreURLParametersMatching: [] }
    ),
    e.cleanupOutdatedCaches(),
    e.registerRoute(
      '/',
      new e.NetworkFirst({
        cacheName: 'start-url',
        plugins: [
          {
            cacheWillUpdate: async ({
              request: e,
              response: s,
              event: c,
              state: i,
            }) =>
              s && 'opaqueredirect' === s.type
                ? new Response(s.body, {
                    status: 200,
                    statusText: 'OK',
                    headers: s.headers,
                  })
                : s,
          },
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.googleapis\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https:\/\/fonts\.gstatic\.com\/.*/i,
      new e.CacheFirst({
        cacheName: 'google-fonts-static',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: 31536e3 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:js|css|woff|woff2|ttf|eot)$/i,
      new e.CacheFirst({
        cacheName: 'static-assets',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
      new e.CacheFirst({
        cacheName: 'images',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 86400 }),
        ],
      }),
      'GET'
    ),
    e.registerRoute(
      /^https?:\/\/[^\/]+\/(?!api\/).*/i,
      new e.CacheFirst({
        cacheName: 'pages-cache',
        plugins: [
          new e.ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: 86400 }),
          new e.CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
      }),
      'GET'
    )
})
