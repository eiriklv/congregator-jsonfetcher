var debug = require('debug')('jsonfetcher:testapp');
var util = require('util');
var events = require('events');
var ipc = new events.EventEmitter();

function isActive (element) {
    return element.active;
}

var handleEntry = function (item, callback) {
    debug(util.inspect(item, { colors: true }));
    callback(null, item);
};

var getMappings = function (options, callback) {
    var mappings = require('./template');
    callback(null, mappings.filter(isActive));
};

var JsonFetcher = require('../lib');

var jsonFetcher = new JsonFetcher({
    getSources: getMappings,
    handleEntry: handleEntry,
    ipc: ipc,
    sockets: 15,
    waitTime: 10000,
    timeOut: 5000
});

console.log('running json-fetcher');

jsonFetcher.run();