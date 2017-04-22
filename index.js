'use strict';
var algoliaComment = require('./lib/algoliaComment');

// register `hexo algoliaComment` command
hexo.extend.console.register('algoliaComment', 'Index your comments on Algolia', {
  options: [{
    name: '-n, --no-clear', desc: 'Does not clear the existing index'
  }]
}, algoliaComment);
