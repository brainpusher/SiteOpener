// listen for extension install or update
//load json data for the first use
chrome.runtime.onInstalled.addListener(loadJSON);
chrome.runtime.onInstalled.addListener(SwitchJsonUpdateOn);
chrome.alarms.onAlarm.addListener(loadJSON);

function loadJSON() {   
    //create new XMLHttpRequest object
    var xmlhttp = new XMLHttpRequest(); 
    xmlhttp.overrideMimeType("application/json");
    //declare url
    var url = "http://www.softomate.net/ext/employees/list.json"; 
    //configuring xmlhttp object ( true for asynchronous mode)
    xmlhttp.open("GET", url, true);
    //sending a query
    xmlhttp.send();
    xmlhttp.onreadystatechange=function() {
          if (xmlhttp.readyState == 4 && xmlhttp.status == "200") {
            var jsonString = JSON.stringify(xmlhttp.responseText);
            //chrome.storage.local.set({'jsonData': jsonString});
            localStorage.setItem("jsonData",jsonString);
            //console.log("JSON LOADED " + Date());
          }
    };

}

function SwitchJsonUpdateOn() {
     chrome.alarms.create('jsonUpdate', {
     periodInMinutes: 1,
     delayInMinutes:  60
    });
}

var requestedHref="";
var closedModalSites = [];
var sitesWithFullCookies =[];

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch(request.message){
        case "openSite":
            openWebSite(request.href);
            break;
        case "pageLoaded":
            var siteRootDomain = extractRootDomain(requestedHref);
            if(!closedModalSites.includes(siteRootDomain) && !sitesWithFullCookies.includes(siteRootDomain)){;
                var jsonObjFromHref = getJsonObjectByUrl(requestedHref);
                sendResponse({msg:"injectHtml",jsonObj:jsonObjFromHref, href:requestedHref});
            } /*else {
                closedModalSites.splice(closedModalSites.indexOf(siteRootDomain),1);
            }  */ /*<-------Раскомментировать, если 6 пункт задания подразумевает, что окно не нужно открывать
                            только при следующей загрузке страницы, а при второй загрузке открывать нужно.*/
            break;
        case "modalClosed":
            closedModalSites.push(request.jsonObjDomain);
            break;
        case "cookiesReady":
            getCookies(request.hrefSite, request.siteNameResponse, function(val) {
                    if(val == 3){
                        sitesWithFullCookies.push(extractRootDomain(request.hrefSite));
                    }
                    if(val == null){
                        //init cookies
                        var num = 2;
                        var numStr = num.toString();
                        chrome.cookies.set({
                            "url": request.hrefSite,
                            "name": request.siteNameResponse,
                            "value": numStr
                        });
                        //console.log(val);
                    } else {
                        var num = parseInt(val);
                        num = num + 1;
                        var numStr = num.toString();
                        chrome.cookies.set({
                            "url": request.hrefSite,
                            "name": request.siteNameResponse,
                            "value": numStr
                        });
                        //console.log(val);
                    }

            });

            break;
    }
  });

function getCookies(domain, name, callback) {
    chrome.cookies.get({"url": domain, "name": name}, function(cookie) {
        if(callback) {
            callback(cookie ? cookie.value : null);
        }
    });
}

function openWebSite(urlHref){
    requestedHref = urlHref;
    chrome.tabs.create({url:urlHref});
}

function getJsonObjectByUrl(url){
  var arr = JSON.parse(JSON.parse(localStorage.getItem("jsonData")));;

  var rootDomain = extractRootDomain(url);
  for(var i = 0; i < arr.length; i++){
      if(arr[i].domain === rootDomain){
        return arr[i];
      }
  }
}

function extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}

function extractRootDomain(url) {
    var domain = extractHostname(url),
        splitArr = domain.split('.'),
        arrLen = splitArr.length;

    //extracting the root domain here
    //if there is a subdomain 
    if (arrLen > 2) {
        domain = splitArr[arrLen - 2] + '.' + splitArr[arrLen - 1];
        //check to see if it's using a Country Code Top Level Domain (ccTLD) (i.e. ".me.uk")
        if (splitArr[arrLen - 2].length == 2 && splitArr[arrLen - 1].length == 2) {
            //this is using a ccTLD
            domain = splitArr[arrLen - 3] + '.' + domain;
        }
    }
    return domain;
}