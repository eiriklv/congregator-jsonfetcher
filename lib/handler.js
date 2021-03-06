var cheerio = require('cheerio');
var url = require('url');
var Entities = require('html-entities').AllHtmlEntities;
var entities = new Entities();
var helpers = require('./helpers');

// helper to access nested objects with string literals as object key. Example -> Object.byString(someObj, 'part3[0].name');
Object.byString = helpers.byString;

exports = module.exports = function () {
    return function (post, mapping, ranking) {
        var valid = true;

        var entry = {
            origin: mapping.origin,
            source: mapping.url,
            host: url.parse(mapping.url).host,
            ranking: ranking,
            category: mapping.category || []
        };

        mapping.template.elements.forEach(function (element) {
            var holder;

            if (element.required) {
                valid = false;
            }

            element.items.forEach(function (item) {
                var active = false;
                // get the entry element
                if (item.scrape) {
                    var $ = cheerio.load(Object.byString(post, item.selector));
                    holder = $(item.scrape.selector).attr(item.scrape.attribute);
                }
                else if (item.decode) {
                    holder = entities.decode(Object.byString(post, item.selector));
                }
                else {
                    holder = Object.byString(post, item.selector);
                }

                // set item if it has been found
                if (holder && !entry[element.name]) {
                    entry[element.name] = holder;
                    active = true;
                }
            });

            // add fallback if supplied
            if (element.fallback && !entry[element.name]) {
                entry[element.name] = element.fallback;
            }

            if (entry[element.name] && (element.type == 'url')) {
                entry[element.name] = helpers.fixRelativePath(entry[element.name], entry.source);
            }

            // check if item is required for entry to be valid, and then check if item is set
            if (element.required && entry[element.name]) {
                valid = true;
            }
        });

        entry = valid ? entry : null;
        return entry;
    };
};
