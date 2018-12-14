/*eslint-disable*/
const dark = require('sass-extract-loader?{"includePaths":["./node_modules"],"plugins": ["sass-extract-js"]}!./stylesheets/themes/dark/_variables.scss');
const light = require('sass-extract-loader?{"includePaths":["./node_modules"],"plugins": ["sass-extract-js"]}!./stylesheets/themes/light/_variables.scss');
/*eslint-disable*/

export { dark, light };
