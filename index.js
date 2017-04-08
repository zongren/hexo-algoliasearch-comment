var processor = hexo.extend.processor;
var _ = require('lodash');
var hexoUtil = require('hexo-util');
var algoliasearch = require('algoliasearch');
var async = require('async');
var algoliaConfig = hexo.config.algolia_comment;
var fields = algoliaConfig.fields;
var log = hexo.log;
var comments = [];

/**
 * Process data of a comment
 * @param {Object} comment A comment of Hexo
 * @returns {Object} comment A comment of Hexo
 */
function processComment(comment) {
  var object = _.pick(comment, fields);

  // define objectID for Algolia
  object.message = hexoUtil.stripHTML(object.message);
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
  async.each(chunkedComments, index.saveObjects.bind(index), function(err) {
    if (err) {
      log.info('Error has occurred during indexing comments : ' + err);
      throw err;
    }
    log.info('Indexation done. ' + comments.length + ' comments indexed.');
  });
}

processor.register('_data/*path', function static_processor(data) {
  var comment = JSON.parse(data.readSync());
  comment = processComment(comment);
  if(typeof comment.objectID != "undefined" && comment.objectID.length > 0){
    comments.push(comment);
  }
});

hexo.on('generateAfter', function(post){
  log.info("Start indexing comments.Comments length is "+comments.length);
  // init index
  var client = algoliasearch(algoliaConfig.appId, algoliaConfig.adminApiKey);
  var index = client.initIndex(algoliaConfig.indexName);
  
  index.clearIndex(function(err) {
    if (err) {
      log.info('Error has occurred during clearing index : ' + err);
      return err;
    }
    log.info('Index cleared');
    indexComments(index, comments);
  });
});