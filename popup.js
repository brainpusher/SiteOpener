
displayJsonData(localStorage.getItem("jsonData"));

window.addEventListener('click',function(e){
  if(e.target.href!==undefined){
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.runtime.sendMessage({message: "openSite", href:e.target.href});
    });
  }
});

function displayJsonData(jsonData) {
    // json.parse(response): to object, and then parse obj to array
    var arr = JSON.parse(JSON.parse(jsonData));
    
    var body = document.body;
    body.setAttribute("style","min-width: 300px");

    var divElem = document.getElementById('jsonLoad');
    var temAelem;
    for(var i = 0; i < arr.length; i++) {
        var href = 'https://www.' + arr[i].domain;
        temAelem = document.createElement('a');
        temAelem.setAttribute("href",href);
        temAelem.setAttribute("class","list-group-item list-group-item-action");
        temAelem.setAttribute("style"," text-align:center");
        temAelem.innerText = arr[i].name;
        divElem.appendChild(temAelem);
    }
}
