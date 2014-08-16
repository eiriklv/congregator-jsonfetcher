var read = require('node-read');
var async = require('async');
var debug = require('debug')('jsonfetcher:content-fetcher');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var util = require('util');
var helpers = require('./helpers');
var url = require('url');

exports = module.exports = function () {
    return function (mapping, entries, callback) {
        if (!mapping.body){
            callback(null, null);
            return;
        }

        if (!mapping.linkref){
            callback(null, null);
            return;
        }

        var processed = [];

        // loop through each entry and get the body content
        async.each(entries, function (item, callback) {
            process.nextTick(function () {
                var illegalDomain = helpers.containsIllegalDomain(item[mapping.linkref]);

                if (!item[mapping.linkref] || illegalDomain) {
                    debug('link contains illegal domain: ' + illegalDomain);
                    callback();
                    return;
                }

                read(item[mapping.linkref], { pool: this.agent, timeout: this.timeOut }, function (err, article, res) {
                    // override when error occurs
                    if (err) {
                        debug('got error for guid: ' + item.guid + ' - ' + util.inspect(err));
                        callback();
                        return;
                    }

                    // add content to item
                    item.content = {
                        title: article.title,
                        body: entities.decode(article.content),
                        image: helpers.fixRelativePath(helpers.getMetaImage(article.dom), item[mapping.linkref])
                    };

                    // add to result list
                    processed.push(item);

                    // callback
                    callback();
                }.bind(this));
            }.bind(this));
        }.bind(this),
        function (err) {
            if (err) debug(util.inspect(err));
            callback(err, processed);
        });
    };
};
