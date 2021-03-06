'use strict';

var services = services || angular.module('mdwiki.services', []);

services.factory('PageService', ['$http', '$q', 'ApiUrlBuilderService', function ($http, $q, urlBuilder) {
  var updatePagesObservers = [];

  var getPage = function (page) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: urlBuilder.build('/api/', 'page/' + page),
      headers: { 'Content-Type': 'application/json' },
    })
    .success(function (data, status, headers, config) {
      deferred.resolve(data);
    })
    .error(function (data, status, headers, config) {
      var error = new Error();
      error.message = status === 404 ? 'Content not found' : 'Unexpected server error';
      error.code = status;
      deferred.reject(error);
    });

    return deferred.promise;
  };

  var getPages = function (settings) {
    var deferred = $q.defer();

    $http({
      method: 'GET',
      url: urlBuilder.build('/api/', 'pages', settings),
      headers: { 'Content-Type': 'application/json' }
    })
    .success(function (data, status, headers, config) {
      var pages = data || [];

      notifyObservers(pages);
      deferred.resolve(pages);
    })
    .error(function (data, status, headers, config) {
      var error = new Error();
      error.code = status;
      error.message = status === 404 ? 'Content not found' : 'Unexpected server error';
      deferred.reject(error);
    });

    return deferred.promise;
  };

  var findStartPage = function (pages) {
    var pagesToFind = ['index', 'home', 'readme'];

    for (var i = 0; i < pagesToFind.length ; i++) {
      var startPage = findPage(pages, pagesToFind[i]);
      if (startPage !== undefined && startPage.length > 0) {
        return startPage;
      }
    }
    return '';
  };

  var findPage = function (pages, pageName) {
    for (var i = 0; i < pages.length; i++) {
      if (pageName === pages[i].name.toLowerCase()) {
        return pages[i].name;
      }
    }
    return '';
  };

  var registerObserver = function (callback) {
    updatePagesObservers.push(callback);
  };

  var notifyObservers = function (pages) {
    angular.forEach(updatePagesObservers, function (callback) {
      callback(pages);
    });
  };

  return {
    findStartPage: findStartPage,
    getPage: getPage,
    getPages: getPages,
    registerObserver: registerObserver
  };
}]);
