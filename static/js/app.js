'use strict';

var storage = chrome.storage.local;

var webtoonApp = angular.module('webtoonApp', ['ngRoute']).directive('myRepeatDirective', function() {
  return function(scope, element, attrs) {
    if (scope.$last){
      setTimeout(function() {
        $('.raty').raty(
          { path: '/static/img',
            readOnly: true,
            score: function() {
              return $(this).attr('score')/2;
            }
          });
      },100);
    }
  };
});

var nBase = "http://comic.naver.com";
var nmBase = "http://m.comic.naver.com"
var nURL = nBase + "/webtoon/weekday.nhn"; // http://comic.naver.com/webtoon/weekday.nhn
var nmURL = nmBase + "/webtoon/weekday.nhn?week="; // http://m.comic.naver.com/webtoon/weekday.nhn?week=mon

var dBase = "http://webtoon.daum.net";
var dURL = dBase + "/webtoon/week";

var isParsedComplete = false;

var enDay=["sun","mon","tue","wed","thu","fri","sat"]
var koDay=["일","월","화","수","목","금","토"]

var enToKoDay = function(day) {
  return koDay[enDay.indexOf(day)];
}

var koToEnDay = function(day) {
  for (var i in koDay) {
    if(day.indexOf(koDay[i]) != -1)
      return koDay[i];
  } 
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
  $scope.toonList = [];
  $scope.loading = true;
  $scope.daum = true;
  $scope.naver = true;
  $scope.nComicUrl = nBase + "/webtoon/detail.nhn?titleId=";
  $scope.dComicUrl = dBase + "/webtoon/view/";

  $scope.openTab = function(toon) {
    if (toon['pub'] == 'naver')
      var link = $scope.nComicUrl + toon['id'];
    else if (toon['pub'] == 'daum')
      var link = $scope.dComicUrl + toon['id'];

    var background = chrome.extension.getBackgroundPage();
    var newCount = background.newCount;

    if (toon['isThereNew']) {
      newCount -= 1;
      chrome.browserAction.setBadgeText({text: newCount+"+"});

      storage.set({'toonList': $scope.toonList});
    }

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
    for (var i in $scope.toonList) {
      var toon = $scope.toonList[i];
      if (toon['id'] == id)
        return toon;
    }

    return null;
  }

  $scope.titleFilter = function(toons) {
    alet(123);
  }

  $scope.changeSubscription = function (id) {
    var toon = $scope.findToon(id);

    toon['subscribe'] = !toon['subscribe'];
    
    storage.set({'toonList': $scope.toonList}, function() {
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
          $scope.toonList.push({
            'id': id,
            'thumbUrl': img.attr('src'),
            'days': [ enToKoDay(day) ],
            'title': img.attr('alt'),
            'pub': 'naver',
            'subscribe': false,
            'isThereNew': false,
          });
        }
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

    $http.get(dURL).success(function(data) {
      $(data).find('.bg_line li a').each(function(){
        var img = $(this).find('img');

        var dayStr = $(this).parent().parent().parent().find('h3').text();
        var day = koToEnDay(dayStr);
        var href = $(this).attr('href');
        var id = href.substr(href.indexOf("view/")+5);
        var toon = $scope.findToon(id);

        if (toon != null) {
          //toon['days'].push(enToKoDay(day));
        } else {
          $scope.toonList.push({
            'id': id,
            'thumbUrl': img.attr('src'),
            'days': [ day ],
            'title': img.attr('alt'),
            'pub': 'daum',
            'subscribe': false,
            'isThereNew': false,
          });
        }
      });

      $("#spinner").remove();

      storage.get('toonList', function (obj) {
        if (typeof obj['toonList'] != 'undefined')
          $scope.toonList = obj['toonList'];
      });
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