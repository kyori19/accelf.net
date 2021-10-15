export default {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removesUnknownsAndDefaults: {
            keepDataAttrs: false,
          },
        },
      },
    },
  ],
};
