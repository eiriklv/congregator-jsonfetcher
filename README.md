Congregator JSON Fetcher and Mapper
===================================

#### Introduction:
Fetch JSON endpoint data and map them to your needs with templates. Also has the ability to visit urls and intelligently fetch content.

#### Built with:
* [node.js](http://www.nodejs.org/)
* [cheerio](http://github.com/cheeriojs/cheerio/)
* [node-read](http://github.com/bndr/node-read/)

#### Example use:
```js
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

var JsonFetcher = require('congregator-jsonfetcher');

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
```

#### Example template (see the `/example` folder for more elaborate templates):
```json
{
    "active": true,
    "origin": "json",
    "name": "Mashable",
    "url": "http://mashable.com/stories.json?hot_per_page=0&new_per_page=30&rising_per_page=0",
    "listref": "new",
    "linkref": "url",
    "category": ['technology', 'mashable'],
    "format": "desktop",
    "body": true,
    "template": {
        "elements": [
            {
                "name": "guid",
                "type": "url",
                "required": true,
                "items": [
                    {
                        "selector": "link"
                    }
                ]
            },
            {
                "name": "title",
                "required": true,
                "items": [
                    {
                        "selector": "title"
                    }
                ]
            },
            {
                "name": "url",
                "type": "url",
                "required": true,
                "items": [
                    {
                        "selector": "link"
                    }
                ]
            },
            {
                "name": "image",
                "type": "url",
                "items": [
                    {
                        "selector": "responsive_images[1].image"
                    },
                    {
                        "selector": "responsive_images[0].image"
                    }
                ],
                "fallback": "http://rack.1.mshcdn.com/assets/header_share_logo.v2-11a2e0632ddb46b143c85e63f590734d.png"
            }
        ]
    }
}
```

#### Example output:
```js
[
    {
        origin: 'json',
        source: 'http://mashable.com/stories.json?hot_per_page=0&new_per_page=30&rising_per_page=0',
        host: 'mashable.com',
        ranking: 29,
        category: ['technology', 'mashable'],
        guid: 'http://mashable.com/2014/08/13/ap-journalist-killed-in-gaza/',
        title: 'AP Journalist Killed in Gaza',
        url: 'http://mashable.com/2014/08/13/ap-journalist-killed-in-gaza/',
        image: 'http://rack.2.mshcdn.com/media/ZgkyMDE0LzA4LzEzL2Y4L1NpbW9uZUNhbWlsLjVkY2M5LmpwZwpwCXRodW1iCTM1MHgzNTAjCmUJanBn/6dc9e302/5cf/Simone-Camilli-AP.jpg',
        content: {
            title: 'AP Journalist Killed in Gaza',
            body: '<p>BEIT LAHIYA, Gaza Strip — An Associated Press video journalist was killed in an ordnance explosion in the Gaza Strip, together with a Palestinian translator and three members of the Gaza police.</p><p>Simone Camilli, 35, died Wednesday when Gaza police engineers were neutralizing unexploded ordnance in the Gaza town of Beit Lahiya left over from fighting between Israel and Islamic militants.</p><p>Camilli is the first foreign journalist killed in the <a href="http://mashable.com/category/israel-gaza-conflict/">Gaza conflict</a>, which took more than 1,900 Palestinian lives and 67 on the Israeli side.</p><p>Camilli and a translator working with the AP, Ali Shehda Abu Afash, were accompanying the ordnance team on assignment when the explosion occurred. The police said four other people were seriously injured, including AP photographer Hatem Moussa.</p><p>Camilli, an Italian national, had worked for The Associated Press since 2005.</p><p><em>Have something to add to this story? Share it in the comments.</em></p>',
            image: 'http://rack.0.mshcdn.com/media/ZgkyMDE0LzA4LzEzL2Y4L1NpbW9uZUNhbWlsLjVkY2M5LmpwZwpwCXRodW1iCTEyMDB4NjI3IwplCWpwZw/bcffb685/5cf/Simone-Camilli-AP.jpg'
        }
    },
    ....
]
```

#### TODO
* description of the templating system
* better description of how to use the module
* full test suite