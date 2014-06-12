'use strict';

var webtoonApp = angular.module('webtoonApp', ['ngRoute']);

var nBase = "http://comic.naver.com";
var nmBase = "http://m.comic.naver.com"
var nURL = nBase + "/webtoon/weekday.nhn";
var nmURL = nmBase + "/webtoon/weekday.nhn?week=";

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
  $scope.nList = {};

  $http.get(nURL).success(function(data) {
    $(data).find('.thumb a').each(function(){
      var img = $(this).find('img');
      var day = $(this).attr('href').split('=')[2];
      var id = $(this).attr('href').split('=')[1].split('&')[0];

      if ($scope.nList[id] != undefined) {
        $scope.nList[id]['days'].push(enToKoDay(day));
      } else {
        $scope.nList[id] = {
          'thumbUrl': img.attr('src'),
          'days': [ enToKoDay(day) ],
          'title': img.attr('alt'),
          'subscribe': false,
        };
      }
    }); 

    for (var day in enDay) {
      $http.get(nmURL + enDay[day]).success(function(data) {
        $(data).find('div.lst a').each(function(){
          var id = $(this).attr('href').split('=')[1].split('&')[0];
          var rating = $(this).find('span.st_r').text();
          var author = $(this).find('span.sub_info').text();

          if ($scope.nList[id] != undefined) {
            $scope.nList[id]['rating'] = rating;
            $scope.nList[id]['author'] = author;
          } else {
            alert("Error");
          }

          $('#star-'+id).raty(
            { path: '/static/img',
              readOnly: true,
              score: function() {
                return $(this).attr('score')/2;
              }
            });
        });
      });
    }

  });


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