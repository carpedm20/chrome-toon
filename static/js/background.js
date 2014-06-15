/*
 * Created by carpedm20
 * reference: http://stackoverflow.com/questions/20326926/prevent-chrome-notifications-api-from-hiding-my-notification-after-a-few-seconds
 */

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

    console.log(id);

    var title = toon['title'];
    var thumbUrl = toon['thumbUrl'];

    var details = {
      type:    "basic",
      iconUrl: thumbUrl,
      title:   title,
      message: "우왕 떴닫!"
    };

    chrome.notifications.create(id, details, function(notifId) {
    });
  }
}, 10000);

function destroyNotification(notifId) {
  chrome.notifications.clear(notifId, function(wasCleared) {
    console.log('Destroyed notification "' + notifId + '" !');
  });
}

/* Respond to the user's clicking on the notification message-body */
chrome.notifications.onClicked.addListener(function(notifId) {
  notifId = notifId.toString();
  
  chrome.tabs.create({ url: nComicUrl+notifId });
  destroyNotification(notifId);
});

/* Respond to the user's clicking on the small 'x' in the top right corner */
chrome.notifications.onClosed.addListener(function(notifId, byUser) {
  notifId = notifId.toString();

  destroyNotification(notifId);
});