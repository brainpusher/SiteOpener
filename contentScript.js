
window.addEventListener("load", function(){
 	window.addEventListener("click",function(e){
		var divModal = document.getElementById('myModal');
    		if (e.target == divModal) {
        		divModal.style.display = "none";
        		var href = sessionStorage.getItem("responseHref");
        		var siteName = sessionStorage.getItem("responseSiteName");
        		chrome.runtime.sendMessage({message:"cookiesReady",hrefSite:href,siteNameResponse:siteName});
    		}
	});
});

chrome.runtime.sendMessage({message: "pageLoaded"}, function(response) {

     switch (response.msg) {

       case 'injectHtml':
       		var xmlHttp = new XMLHttpRequest();
        	xmlHttp.open( "GET", chrome.extension.getURL ("/modal.html"), true );
        	xmlHttp.send( null );
        	xmlHttp.onreadystatechange=function() {
            if (xmlHttp.readyState == 4 && xmlHttp.status == "200") {
                var inject  = document.createElement("div");
                inject.innerHTML = xmlHttp.responseText;
                document.body.insertBefore (inject, document.body.firstChild);
               	// document.body.innerHTML += inject;
 				var divModal = document.getElementById('myModal');
            	divModal.style.display = "block";

            	document.getElementById('myGorgeousParagraph').innerText = response.jsonObj.message;

            	var spanModal = document.getElementById('myCloseSpan');

            	sessionStorage.setItem("responseHref",response.href);
				sessionStorage.setItem("responseSiteName",response.jsonObj.name);

            	spanModal.addEventListener("click", function(){ 
            		divModal.style.display = "none";
            		chrome.runtime.sendMessage({message:"modalClosed",jsonObjDomain:response.jsonObj.domain})
            	}); 
            }
        	}
         break;
     }
  });

