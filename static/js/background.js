var storage = chrome.storage.local;
var subscribeData;

var pendingNotifications = {};

/* For demonstration purposes, the notification creation
 * is attached to the browser-action's `onClicked` event.
 * Change according to your needs. */
  alert(123);
    var dateStr = new Date().toUTCString();
    var details = {
        type:    "basic",
        iconUrl: "",
        title:   "REMINDER",
        message: dateStr + "\n\n"
                 + "There is one very important matter to attend to !\n"
                 + "Deal with it now ?",
        contextMessage: "Very important stuff...",
        buttons: [
            { title: "Yes" }, 
            { title: "No"  }
        ]
    };
    var listeners = {
        onButtonClicked: function(btnIdx) {
            if (btnIdx === 0) {
                console.log(dateStr + ' - Clicked: "yes"');
            } else if (btnIdx === 1) {
                console.log(dateStr + ' - Clicked: "no"');
            }
        },
        onClicked: function() {
            console.log(dateStr + ' - Clicked: "message-body"');
        },
        onClosed: function(byUser) {
            console.log(dateStr + ' - Closed: '
                        + (byUser ? 'by user' : 'automagically (!?)'));
        }
    };

    /* Create the notification */
    createNotification(details, listeners);

/* Create a notification and store references
 * of its "re-spawn" timer and event-listeners */
function createNotification(details, listeners, notifId) {
    (notifId !== undefined) || (notifId = "");
    chrome.notifications.create(notifId, details, function(id) {
        console.log('Created notification "' + id + '" !');
        if (pendingNotifications[id] !== undefined) {
            clearTimeout(pendingNotifications[id].timer);
        }

        pendingNotifications[id] = {
            listeners: listeners,
            timer: setTimeout(function() {
                console.log('Re-spawning notification "' + id + '"...');
                destroyNotification(id, function(wasCleared) {
                    if (wasCleared) {
                        createNotification(details, listeners, id);
                    }
                });
            }, 10000)
        };
    });
}

/* Completely remove a notification, cancelling its "re-spawn" timer (if any)
 * Optionally, supply it with a callback to execute upon successful removal */
function destroyNotification(notifId, callback) {

    /* Cancel the "re-spawn" timer (if any) */
    if (pendingNotifications[notifId] !== undefined) {
        clearTimeout(pendingNotifications[notifId].timer);
        delete(pendingNotifications[notifId]);
    }

    /* Remove the notification itself */
    chrome.notifications.clear(notifId, function(wasCleared) {
        console.log('Destroyed notification "' + notifId + '" !');

        /* Execute the callback (if any) */
        callback && callback(wasCleared);
    });
}

/* Respond to the user's clicking one of the buttons */
chrome.notifications.onButtonClicked.addListener(function(notifId, btnIdx) {
    if (pendingNotifications[notifId] !== undefined) {
        var handler = pendingNotifications[notifId].listeners.onButtonClicked;
        destroyNotification(notifId, handler(btnIdx));
    }
});

/* Respond to the user's clicking on the notification message-body */
chrome.notifications.onClicked.addListener(function(notifId) {
    if (pendingNotifications[notifId] !== undefined) {
        var handler = pendingNotifications[notifId].listeners.onClicked;
        destroyNotification(notifId, handler());
    }
});

/* Respond to the user's clicking on the small 'x' in the top right corner */
chrome.notifications.onClosed.addListener(function(notifId, byUser) {
    if (pendingNotifications[notifId] !== undefined) {
        var handler = pendingNotifications[notifId].listeners.onClosed;
        destroyNotification(notifId, handler(byUser));
    }
});

setInterval(function(){

  chrome.notifications.update(
  'name-for-notification',
  {   
    type: 'image', 
    iconUrl: 'http://thumb.comic.naver.net/webtoon/183559/thumbnail/title_thumbnail_20121228220750_t83x90.jpg',
    title: "This is a notification", 
    message: "hello there!" 
  },
  function() {} 
  	);
  /*storage.get('subscribeData', function (obj) {
    subscribeData = obj['subscribeData'];
    //alert(subscribeData);
  });

  for (var toon in subscribeData) {
  	alert(toon);
    var url = subscribeData[toon];

    var notification = webkitNotifications.createNotification(
      url,  // icon url - can be relative
      'Hello!',  // notification title
      'Lorem ipsum...'  // notification body text
    );

    notification.show();
    }*/
},5000);