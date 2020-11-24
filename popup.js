var chart_config = null;

var MIN_POPUP_HEIGHT = 750;
var MIN_POPUP_WIDTH = 1200;

document.addEventListener('DOMContentLoaded', function () {

  document.getElementById("btnShow").addEventListener("click", function () {

    chrome.windows.getCurrent({}, function (win) {
      console.log(win);

      var width = win.width > MIN_POPUP_WIDTH ? win.width : MIN_POPUP_WIDTH;
      var height = win.height > MIN_POPUP_HEIGHT ? win.height : MIN_POPUP_HEIGHT

      chrome.windows.create({
        url: '/dialog.html',
        type: 'popup', width: width, height,
      }, function () {

        setTimeout(function () {
          chrome.runtime.sendMessage({
            action: "sendData",
            source: JSON.stringify(chart_config)
          });
        }, 1000);
      });

    })

  });

  var message = document.querySelector('#message');

});

chrome.runtime.onMessage.addListener(function (request, sender) {

  var btnOpen = document.querySelector('#btnShow');

  if (request.action == "getSource") {

    var source = JSON.parse(request.source)
    if (source.error) {
      message.innerText = source.error;
    } else if (source.chart) {

      message.style.display = 'none';
      btnOpen.style.display = 'block';
      chart_config = source;

    } else {
      message.innerText = "(1)Hata olustu!";
      console.log(source);
    }
  }
});

function onWindowLoad() {
  var message = document.querySelector('#message');

  chrome.tabs.executeScript(null, {
    file: "getPagesSource.js"
  }, function () {
    // If you try and inject into an extensions page or the webstore/NTP you'll get an error
    if (chrome.runtime.lastError) {
      message.innerText = '(2)Hata olustu : \n' + chrome.runtime.lastError.message;
      console.log(chrome.runtime.lastError);
    }
  });

}

window.onload = onWindowLoad;