var path = require('path');
var archive = require('../helpers/archive-helpers');
var helpers = require('./http-helpers');
var fs = require('fs');
var _ = require('underscore');
var urlParser = require('url');
// var url = require('url');
// require more modules/folders here!

exports.handleRequest = function (req, res)  {

  var parts = urlParser.parse(req.url).pathname.substr(1);

  if (req.method === 'GET') {
    if (req.url === '/') {
      fs.readFile(__dirname + '/public/index.html', 'utf8', function(err, data) {
        if (err) {
          throw err;
        }
        res.writeHead(200, helpers.headers);
        res.end(data);
      });
    } else {
      archive.isUrlArchived(req.url, function(boolean) {
        if (!boolean) {
          res.writeHead(404, helpers.headers);
          res.end();
        } else {
          fs.readFile(archive.paths.archivedSites + req.url, 'utf8', function(err, data) {
            if (err) {
              throw err;
            }
            res.writeHead(200, helpers.headers);
            res.end(data);
          });
        }
      });
    }

  } else if (req.method === 'POST') {
    var results = '';
    req.on('data', function(chunk) {
      results += chunk;
    });
    req.on('end', function() {
      var requestedUrl = results.substr(4);
      archive.isUrlInList(requestedUrl, function(boolean) {
        if (!boolean) {
          archive.addUrlToList(requestedUrl, function() {
            res.writeHead(302, helpers.headers);
            res.end();
          });
        }
      });
    });
  }
};
