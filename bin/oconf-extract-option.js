#!/usr/bin/env node
// ex: filetype=javascript

var oconf = require('../lib/index'),
    util = require('util'),
    optimist = require('optimist');

var argp = optimist
            .options('j', {
                alias: 'json',
                default: false,
                description: 'Force JSON output'
            })
            .options('h', {
                alias: 'help',
                default: false,
            })
            .boolean(['j', 'h'])
            .demand(1)
            .usage('Usage: $0 <filename.cjson> <dotted.option.path>');
var argv = argp.argv;

if (argv.h) {
    argp.showHelp();
    process.exit();
}

function _getKey(keyname, testObj) {
    if (typeof keyname === 'string') {
        keyname = keyname.split(".");
    }

    // An non-existing key doesn't exist!
    if (keyname.length === 0) {
        return {error: 'Not found'};
    }

    var key = keyname.shift();

    // Is it an object -- and does it have the key
    if (testObj !== new Object(testObj) || !(key in testObj)) {
        throw new Error('Key ' + key + ' not found in ' + JSON.stringify(testObj));
    }

    // Try more!
    if (keyname.length >= 1) {
        return _getKey(keyname, testObj[key]);
    }

    // We're at the end.
    return testObj[key];
}

try {
    var data = oconf.load(argv._[0], 99, false);

    // Refine if we got a query
    if (argv._.length >= 2) {
        data = _getKey(argv._[1], data);
    }

    if (argv.json || (typeof data !== 'string' && typeof data !== 'number')) {
        data = JSON.stringify(data, 4, false);
    }

    util.puts(data);
} catch (error) {
    console.error("Error:", error.message);
}
