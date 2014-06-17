/*
 * Created by carpedm20
 * reference: http://stackoverflow.com/questions/20326926/prevent-chrome-notifications-api-from-hiding-my-notification-after-a-few-seconds
 */

var script = document.createElement('script');
script.src = '/static/js/jquery-1.8.3.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

var storage = chrome.storage.local;
var nList;

var nBase = "http://comic.naver.com";
var nComicUrl = nBase + "/webtoon/detail.nhn?titleId=";

setInterval(function() {
  console.log("start");
  var timeInterval = 10000;

  storage.get('nList', function (obj) {
    nList = obj['nList'];
  });

  for (var id in nList) {
    var toon = nList[id];

    if (toon['subscribe'] == false)
      continue;

    $.ajax(
      { url: 'http://comic.naver.com/webtoon/list.nhn?titleId=' + id,
        success: function(data) {
          var href = nBase + $(($(data).find(".title a"))[0]).attr('href');
          var id = href.split('=')[1].split('&')[0];

          storage.get(id, function (obj) {
            if (typeof obj[id] != 'undefined') {
              console.log("check : " + id);

              if (href != obj[id]) {
                console.log("NEW : " + id + " - " + href);

                var title = toon['title'];
                var thumbUrl = toon['thumbUrl'];

                console.log("thumb : " + title + " - " + thumbUrl);

                var obj = {};
                obj[id] = href;

                storage.set(obj);

                var details = {
                  type:    "basic",
                  iconUrl: thumbUrl,
                  title:   title,
                  message: "우왕 떴닫!"
                };

                chrome.notifications.create(id, details, function(notifId) {
                  setTimeout(function() {
                    destroyNotification(notifId);
                  }, 3500);
                });
              }
            } else {
              var obj = {};
              obj[id] = href;

              storage.set(obj);
            }
          });
        }
      });
  }
}, 10000);


function destroyNotification(notifId) {
  chrome.notifications.clear(notifId, function(wasCleared) {
    console.log('Destroyed notification "' + notifId);

    console.log("destroyed : " + notifId);
  });
}

/*
chrome.notifications.onClicked.addListener(function(notifId) {
  notifId = notifId.toString();
  
  chrome.tabs.create({ url: nComicUrl+notifId });
  destroyNotification(notifId);
});

chrome.notifications.onClosed.addListener(function(notifId, byUser) {
  notifId = notifId.toString();

  destroyNotification(notifId);
});


var title = "test";
var thumbUrl = "http://thumb.comic.naver.net/webtoon/622648/thumbnail/title_thumbnail_20140511233526_t83x90.JPG";

var details = {
  type:    "basic",
  iconUrl: thumbUrl,
  title:   title,
  message: "우왕 떴닫!"
};

chrome.notifications.create("123", details, function(notifId) {
  setTimeout(function() {
    destroyNotification(notifId);
  }, 3500);
});

var notification = new Notification(title, {
  body: "by ",
  icon: thumbUrl
});

setTimeout(function() {
  notification.close();
}, 3500);


var notification = new Notification(title, {
  type: "basic",
  body: "by ",
  title: title,
  icon: thumbUrl
});

setTimeout(function() {
  notification.close();
}, 3500);
*/