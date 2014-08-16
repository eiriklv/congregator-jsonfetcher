var async = require('async');
var debug = require('debug')('jsonfetcher:run');
var util = require('util');
var colors = require('colors');

exports = module.exports = function () {
    return function (callback) {
        async.parallel({
            getMappings: function (callback) {
                async.series({
                    getSourcesToProcess: function (callback) {
                        this.getSources({}, function (err, mappings) {
                            if (err) {
                                debug(util.inspect(err));
                                return callback();
                            }

                            this.mappings = mappings;
                            callback();
                        }.bind(this));
                    }.bind(this),
                    processMappings: function (callback) {
                        async.each(this.mappings, function (mapping, callback) {
                            async.waterfall([
                                // fetch mapping entries and parse them according to the template
                                function (callback) {
                                    this.fetch(mapping, callback);
                                }.bind(this),
                                // process entries
                                function (entries, callback) {
                                    entries ? this.process(mapping, entries, callback, '(initial)'.green) : callback();
                                }.bind(this),
                                // distribute new entries via event emitter
                                function (entries, callback) {
                                    entries ? this.distribute(mapping, entries, callback) : callback();
                                }.bind(this),
                                // get content for new entries
                                function (entries, callback) {
                                    entries ? this.content(mapping, entries, callback) : callback();
                                }.bind(this),
                                // process new entries with content attached
                                function (entries, callback) {
                                    entries ? this.process(mapping, entries, callback, '(content)'.green) : callback();
                                }.bind(this)
                            ], function (err, results) {
                                callback(err);
                            });
                        }.bind(this), function (err) {
                            var msg = err ? 'error: '.red + util.inspect(err) : 'all mappings done...'.green;
                            debug(msg);
                            callback();
                        });
                    }.bind(this),
                }, function (err, results) {
                    if (err) debug('error: ' + util.inspect(err));
                    callback();
                });
            }.bind(this),
            wait: function (callback) {
                setTimeout(function () {
                    debug('done waiting');
                    callback();
                }.bind(this), this.waitTime);
            }.bind(this)
        }, function (err, results) {
            var msg = err ? 'error: '.red + util.inspect(err) : '**json fetcher - done waiting - commensing new fetch..............**'.blue;
            debug(msg);
            if (callback) callback();
        });
    };
};
