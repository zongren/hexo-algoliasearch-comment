var processor = hexo.extend.processor;
var _ = require('lodash');
var hexoUtil = require('hexo-util');
var algoliasearch = require('algoliasearch');
var async = require('async');
var marked = require('marked');
var assign = require('object-assign');

var algoliaConfig = assign({
  enable: true
}, hexo.config.algolia_comment);
var fields = algoliaConfig.fields;
var enable = algoliaConfig.enable;
var log = hexo.log;
var comments = [];

var markedOptions = assign({
  gfm: true,
  pedantic: false,
  sanitize: false,
  tables: true,
  breaks: true,
  smartLists: true,
  smartypants: true,
  modifyAnchors: '',
  autolink: true
}, hexo.config.marked);

marked.setOptions(markedOptions);
/**
 * Process data of a comment
 * @param {Object} comment A comment of Hexo
 * @returns {Object} comment A comment of Hexo
 */
function processComment(comment) {
  var object = _.pick(comment, fields);
  if (typeof comment.replyTarget != "undefined" && comment.replyTarget.length > 0) {
    comment.message = "@" + comment.replyTarget + "&nbsp;&nbsp;&nbsp;&nbsp;" + comment.message;
  }
  object.message = marked(comment.message);
  object.objectID = comment._id;
  return object;
}

/**
 * Index comments
 * @param {String} index An index name
 * @param {Array} comments A list of comments
 * @returns {void}
 */
function indexComments(index, comments) {
  // split our results into chunks of 5,000 objects,
  // to get a good indexing/insert performance
  var chunkedComments = _.chunk(comments, algoliaConfig.chunkSize || 5000);

  log.info('Indexing comments on Algolia...');
  async.each(chunkedComments, index.saveObjects.bind(index), function (err) {
    if (err) {
      log.info('Error has occurred during indexing comments : ' + err);
      throw err;
    }
    log.info('Indexation done. ' + comments.length + ' comments indexed.');
  });
}
if (enable) {
  processor.register('_data/*path', function static_processor(data) {
    var comment = JSON.parse(data.readSync());
    var object = processComment(comment);
    if (typeof object.objectID != "undefined" && object.objectID.length > 0) {
      comments.push(object);
    }
  });

  hexo.on('generateBefore', function (post) {
    log.info("Start indexing comments.Comments length is " + comments.length);
    // init index
    var client = algoliasearch(algoliaConfig.appId, algoliaConfig.adminApiKey);
    var index = client.initIndex(algoliaConfig.indexName);

    index.clearIndex(function (err) {
      if (err) {
        log.info('Error has occurred during clearing index : ' + err);
        return err;
      }
      log.info('Index cleared');
      indexComments(index, comments);
    });
  });
}
