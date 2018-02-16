function onWindowLoad() {
    chrome.runtime.onMessage.addListener(function (request, sender) {
        if (request.action == "sendData") {
            console.log(request.source);

            var chart_config = JSON.parse(request.source);
        
            new Treant(chart_config);
        }
    })
}

window.onload = onWindowLoad