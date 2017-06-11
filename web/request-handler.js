var path = require('path');
var archive = require('../helpers/archive-helpers');
var helpers = require('./http-helpers');
var fs = require('fs');
var _ = require('underscore');
var urlParser = require('url');
// var url = require('url');
// require more modules/folders here!

exports.handleRequest = function (req, res)  {

  var urlPath = urlParser.parse(req.url).pathname;

  if (req.method === 'GET') {
    if (urlPath === '/') {
      urlPath = '/index.html';
    }
    fs.readFile(archive.paths.siteAssets + urlPath, 'utf8', function(err, data) {
      if (err) {
        fs.readFile(archive.paths.archivedSites + urlPath, 'utf8', function(err, data) {
          if (err) {
            if (urlPath[0] === '/') {
              urlPath = urlPath.slice(1);
            }
            archive.isUrlInList(urlPath, function(found) {
              if (found) {
                res.writeHead(200, exports.headers);
                res.end('/loading.html');
              } else {
                res.writeHead(404, exports.headers);
                res.end('404: Page not found');
              }
            });
          } else {
            res.writeHead(200, exports.headers);
            res.end(data);
          }
        });
      } else {
        res.writeHead(200, exports.headers);
        res.end(data);
      }
    });
      //   }
      //   res.writeHead(200, helpers.headers);
      //   res.end(data);
      // });
    // } else {
    //   archive.isUrlArchived(req.url, function(boolean) {
    //     if (!boolean) {
    //       res.writeHead(404, helpers.headers);
    //       res.end();
    //     } else {
    //       fs.readFile(archive.paths.archivedSites + req.url, 'utf8', function(err, data) {
    //         if (err) {
    //           throw err;
    //         }
    //         res.writeHead(200, helpers.headers);
    //         res.end(data);
    //       });
    //     }
    //   });
    // }

  } else if (req.method === 'POST') {
    var results = '';
    req.on('data', function(chunk) {
      results += chunk;
    });
    req.on('end', function() {
      var requestedUrl = results.substr(4);
      archive.isUrlInList(requestedUrl, function(listBoolean) {
        if (listBoolean) {
          archive.isUrlArchived(requestedUrl, function(archivedBoolean) {
            if (archivedBoolean) {
              res.writeHead(302, {Location: '/' + requestedUrl});
              res.end();
            } else {
              res.writeHead(302, {Location: '/loading.html'});
              res.end();
            }
          });
        } else {
          archive.addUrlToList(requestedUrl, function() {
            res.writeHead(302, {Location: '/loading.html'});
            res.end();
          });
        }
      });
    });
  } else {
    res.writeHead(404, exports.headers);
    res.end('404: Page not found');
  }
};
