const { extendDefaultPlugins } = require('svgo');

module.exports = {
  plugins: extendDefaultPlugins([
    {
      name: 'removeUnknownsAndDefaults',
      params: {
        keepDataAttrs: false,
      },
    },
  ]),
};
