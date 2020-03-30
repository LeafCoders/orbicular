module.exports = {
  staticFileGlobs: [
    'manifest.json',
    'orbicular-app.js'
  ],
  runtimeCaching: [
    {
      urlPattern: /\/@webcomponents\/webcomponentsjs\//,
      handler: 'fastest'
    },
    {
      urlPattern: /^__rosetteBaseUrl__\/api\/slideShows\/public/,
      handler: 'fastest'
    }
  ]
};
