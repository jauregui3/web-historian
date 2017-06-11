var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var request = require('request');
var Promise = require('bluebird');

/*
 * You will need to reuse the same paths many times over in the course of this sprint.
 * Consider using the `paths` object below to store frequently used file paths. This way,
 * if you move any files, you'll only need to change your code in one place! Feel free to
 * customize it in any way you wish.
 */

exports.paths = {
  siteAssets: path.join(__dirname, '../web/public'),
  archivedSites: path.join(__dirname, '../archives/sites'),
  list: path.join(__dirname, '../archives/sites.txt')
};

// Used for stubbing paths for tests, do not modify
exports.initialize = function(pathsObj) {
  _.each(pathsObj, function(path, type) {
    exports.paths[type] = path;
  });
};

// The following function names are provided to you to suggest how you might
// modularize your code. Keep it clean!

exports.readListOfUrls = function() {
  return new Promise(function(resolve, reject) {
    fs.readFile(exports.paths.list, 'utf8', function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data.split('\n'));
      }
    });
  });
};

exports.isUrlInList = function(url) {
  return new Promise(function(resolve, reject) {
    exports.readListOfUrls()
    .then(function(list) {
      if (!list.includes(url)) {
        reject(false);
      } else {
        resolve(true);
      }
    })
    .catch(function(err) {
      reject(err);
    });
  });
};

exports.addUrlToList = function(url) {
  return new Promise(function(resolve, reject) {
    fs.appendFile(exports.paths.list, url + '\n', 'utf8', function(err) {
      if (err) {
        reject(err);
      } else {
        resolve('Successfully added URL to list');
      }
    });
  });
};

exports.isUrlArchived = function(url) {
  return new Promise(function(resolve, reject) {
    var archived = fs.existsSync(exports.paths.archivedSites +  '/' + url);
    if (!archived) {
      reject(false);
    } else {
      resolve(true);
    }
  });
};

exports.downloadUrls = function(urls) {
  urls.forEach(function(url) {
    if (!url) {return;}
    request('http://' + url).pipe(fs.createWriteStream(exports.paths.archivedSites + '/' + url));
  });
};