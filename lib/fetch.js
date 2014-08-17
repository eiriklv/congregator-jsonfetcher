var debug = require('debug')('jsonfetcher:fetch');
var colors = require('colors');
var util = require('util');
var async = require('async');
var helpers = require('./helpers');

exports = module.exports = function (request) {
    return function (mapping, callback) {
        debug('beginning fetch for mapping: '.yellow + mapping.name.magenta);

        var ranking = 0; // rank the articles by position in feed
        var formattedPosts = []; // formatted posts holder

        var requestOptions = {
            url: mapping.url,
            headers: {
                'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36',
                'accept': 'text/html,application/xhtml+xml'
            },
            timeout: 10000,
            pool: false
        };

        async.waterfall([
            // fetch raw mapping entries
            function (callback) {
                request(requestOptions, function (error, response, body){
                    if(!error && response.statusCode == 200){
                        callback(null, body);
                    }
                    else if (error) {
                        callback(error);
                    }
                    else {
                        debug('error - status: ' + response.statusCode);
                        callback('could not fetch json endpoint');
                    }
                }.bind(this));
            }.bind(this),
            // handle and parse mapping entries
            function (body, callback) {
                var entries;

                try { entries = mapping.listref ? JSON.parse(body)[mapping.listref] : JSON.parse(body) }
                catch (e) { debug(util.inspect(e)); }
                finally { entries = entries || []; }

                async.eachSeries(entries, function (post, callback) {
                    var formattedPost = this.handler(post, mapping, ++ranking);
                    formattedPosts.push(formattedPost);
                    callback();
                }.bind(this), function (err) {
                    callback(err, formattedPosts);
                });
            }.bind(this)
        ], function (err, result) {
            callback(err, result);
        });
    };
};
