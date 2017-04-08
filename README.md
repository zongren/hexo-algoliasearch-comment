# hexo-algoliasearch

A plugin to index comments of your Hexo blog on Algolia

## Installation

```
npm install hexo-algoliasearch-comment --save
```

If Hexo detect automatically all plugins, that's all.  

If that is not the case, register the plugin in your `_config.yml` file :
```
plugins:
  - hexo-algoliasearch-comment
```

## Configuration

You can configure this plugin in your `_config.yml` file :

``` yml
algolia_comment:
  appId: "Z7A3XW4R2I"
  apiKey: "12db1ad54372045549ef465881c17e743"
  adminApiKey: "40321c7c207e7f73b63a19aa24c4761b"
  chunkSize: 5000
  indexName: "my-hexo-blog"
  fields:
    - name
    - message
    - path
    - date
    - url
```

| Key            | Type   | Default | Description |
| -------------- | ------ | ------- | ----------- |
| appId          | String |         | Your application ID. |
| apiKey         | String |         | Your API key (read only). It is use to search in an index. |
| adminApiKey    | String |         | Your adminAPI key. It is use to create, delete, update your indexes |
| chunkSize      | Number | 5000    | Records/comments are split in chunks to upload them. Algolia recommend to use `5000` for best performance. Be careful, if you are indexing comment content, It can fail because of size limit. To overcome this, decrease size of chunks until it pass. |
| indexName      | String |         | The name of the index in which comments are stored. |
| fields         | List   |         | The list of the field names to index. |

## Usage

```
hexo algoliaComment
```

#### Options

| Options        | Description |
| -------------- | ----------- |
| -n, --no-clear | Does not clear the existing index |
