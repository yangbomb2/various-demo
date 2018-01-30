/*
  Post css
  https:// github.com/postcss/postcss
  TODO: postcss not using this. Make it work
  @author: min
 */

// const precss = require('precss');
// const autoprefixer = require('autoprefixer');
// const stylelint = require('stylelint');

// see package.json for browsers
// module.exports = {
//   ident: 'postcss',
//   parser: 'postcss-scss',
//   plugins: {
//     'precss': {},
//     'stylelint' : {},
//     'autoprefixer': {
//       browsers: ['last 2 version', 'ie >= 10'], // https://github.com/postcss/autoprefixer
//     },
//     // 'postcss-import': { root: file.dirname },
//     // 'postcss-cssnext': options.cssnext ? options.cssnext : false,
//     // 'cssnano': env === 'production' ? options.cssnano : false
//
//   },
// }

module.exports = ({ file, options, env }) => ({
  syntax: 'postcss-scss',
  parser: 'postcss-scss',
  plugins: {
    'postcss-import': { root: file.dirname },
    'precss': {},
    'stylelint' : {},
    'autoprefixer': env === 'production'? options.autoprefixer : false,
  },
});
