export default {
  moduleNameMapper: {
    // override `chalk'`s usage of `#ansi-styles` style import
    '#ansi-styles': '<rootDir>/node_modules/ansi-styles',
    '#supports-color': '<rootDir>/node_modules/supports-color',
  },
};
