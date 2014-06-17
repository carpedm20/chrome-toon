'use strict';

var storage = chrome.storage.local;

var webtoonApp = angular.module('webtoonApp', ['ngRoute']).directive('myRepeatDirective', function() {
  return function(scope, element, attrs) {
    angular.element(element).css('color','blue');
    if (scope.$last){
      
      $('.raty').raty(
        { path: '/static/img',
          readOnly: true,
          score: function() {
            console.log($(this).attr('score'));
            return $(this).attr('score')/2;
          }
        });
      }
  };
});

var nBase = "http://comic.naver.com";
var nmBase = "http://m.comic.naver.com"
var nURL = nBase + "/webtoon/weekday.nhn"; // http://comic.naver.com/webtoon/weekday.nhn
var nmURL = nmBase + "/webtoon/weekday.nhn?week="; // http://m.comic.naver.com/webtoon/weekday.nhn?week=mon

var isParsedComplete = false;

var enDay=["sun","mon","tue","wed","thu","fri","sat"]
var koDay=["일","월","화","수","목","금","토"]

var enToKoDay = function(day) {
  return koDay[enDay.indexOf(day)];
}

var day = new Date();
var response,url,request = new XMLHttpRequest();
url = enDay[day.getDay()];

webtoonApp.config(function($routeProvider) {
  $routeProvider
    // route for the home page
    .when('/', {
      templateUrl : '/html/templates/main.html',
      controller  : 'webtoonController'
    })
});

webtoonApp.controller('webtoonController', function($scope, $http) {
  /* Webtoon parser */
  $scope.searchText = "";
  $scope.nList = [];
  $scope.loading = true;
  $scope.daum = true;
  $scope.naver = true;
  $scope.nComicUrl = nBase + "/webtoon/detail.nhn?titleId=";

  $scope.openTab = function(link) {
    chrome.tabs.create({ url: link });
  }

  $scope.refreshStar = function() {
    $('.raty').raty(
      { path: '/static/img',
        readOnly: true,
        score: function() {
          return $(this).attr('score')/2;
        }
      });
  }

  $scope.findToon = function(id) {
    for (var i in $scope.nList) {
      var toon = nList[i];
      if (toon['id'] == id)
        return toon;
    }

    return null;
  }

  $scope.titleFilter = function(toons) {
    var naver = $("#naver").hasClass("checked");
    console.log("naver : " + naver);
    var daum = $("#daum").hasClass("checked");
    console.log("daum : " + daum);

    var result = {};
    var previousLength = $(".toon-pub").length;

    angular.forEach(toons, function(value, key) {
      var toon = $scope.findToon(key);

      if (toon['title'].indexOf($scope.searchText) != -1) {
        if(!naver) {
          if (toon['pub']=="naver") {
            result[key] = toon;
          }
        } else if (!daum) {
          if (toon['pub']=="daum") {
            result[key] = toon;
          }
        } else {
          result[key] = toon;
        }
      }
    });

    return result;
  }

  $scope.changeSubscription = function (id) {
    $scope.findToon(id)['subscribe'] = !$scope.findToon(id)['subscribe'];
    
    storage.set({'nList': $scope.nList}, function() {
      if (chrome.extension.lastError) {
        //alert('An error occurred: ' + chrome.extension.lastError.message);
      }
    });
  }

  setTimeout(function() {
    $http.get(nURL).success(function(data) {
      $(data).find('.thumb a').each(function(){
        var img = $(this).find('img');
        var day = $(this).attr('href').split('=')[2];
        var id = $(this).attr('href').split('=')[1].split('&')[0];
        var toon = $scope.findToon(id);

        if (toon != null) {
          toon['days'].push(enToKoDay(day));
        } else {
          toon.push({
            'thumbUrl': img.attr('src'),
            'days': [ enToKoDay(day) ],
            'title': img.attr('alt'),
            'pub': 'naver',
            'subscribe': false
          });
        }
      });

      $("#spinner").remove();

      storage.get('nList', function (obj) {
        if (typeof obj['nList'] != 'undefined')
          $scope.nList = obj['nList'];
      });

      for (var day in enDay) {
        $http.get(nmURL + enDay[day]).success(function(data) {
          $(data).find('div.lst a').each(function(){
            var id = $(this).attr('href').split('=')[1].split('&')[0];
            var rating = $(this).find('span.st_r').text();
            var author = $(this).find('span.sub_info').text();
            var toon = $scope.findToon(id);

            if (toon != null) {
              toon['rating'] = rating;
              toon['author'] = author;
            } else {
              alert("Error");
            }
          });
        }).then(function(){
          $scope.refreshStar();
        });
      }
    });
  }, 1000);

  /*$http.get('/webtoones/webtoon_stops.json').success(function(data) {
    $scope.webtoonStops = data;
    $scope.selectwebtoonStop($scope.model.selectedIndex);
  });

  $http.get('/webtoones/webtoones.json').success(function(data) {
    $scope.webtoones = data;
  });*/
});

webtoonApp.directive('webtoonMenu', function() {
  return {
    restrict: 'E',
    templateUrl: '/html/templates/menu.html'
  };
});