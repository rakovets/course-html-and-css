/* Copyright 2017,2019 Oracle and/or its affiliates. All rights reserved.
 * Version: 2019.10.15
 * Legal Notices: http://docs.oracle.com/cd/E23003_01/html/en/cpyr.htm
 */

window.ohcglobal = "1.0.1";

(function () {

//for IE without debug console open
if (!window.console) {
  window.console = {
    log: function () {}
  };
}

//Central log function so I can enable/disable debug messages
function log(msg) {
  var debug = true;

  if (debug) {
    console.log(msg);
  }
}

//Test for http[s] so we can know if we are using other protocols like file://
function isHttp() {
  //return true;
  if(window.location.href.split('/')[0].indexOf("http") === 0) {
    return true;
  } else {
    return false;
  }
}

//Is current window not in a frame?
function isNotFramed() {
  try {
    //If the current window (self) is the same as the top window, then it is the main window
    return window.self === window.top;
  } catch (e) {
    return true;
  }
}

/* 
 * Currently only checking for frameset frames because regular hail mary takes care of other types
 * We are returning the last frame of largest area, but it isn't the "main" frame that doesn't
 * have -frame in its name. We only need special frame management because the main framset window
 * doesn't work when you place the Hail Mary footer on the main content window. We may have to
 * somehow discern between framesets that are used in different ways
 * 
 * Case in point: 10/15/2019: Added support for nested framesets 1 level deep using recursion
 */ 
function checkFramesetMainFrame(parentFrame, level) {
  //Set default values for top-level window
  var frameset = window.top.document.getElementsByTagName('frameset');
  var frames = window.top.frames;

  //If we passed in a parentFrame element, then let's check for nested frameset
  if (parentFrame) {
    frameset = parentFrame.document.getElementsByTagName('frameset');
    frames = parentFrame.frames;
  }
  
  //The default is no frames. We check here to see if the content tells us otherwise (frameset only)
  if (frameset.length > 0) {
    var savedArea = 0;
    var frame = null;
    //Find the LAST largest frame (by area)
    for (var i = 0; i < frames.length; i++) {
      try {
        var area = frames[i].innerWidth * frames[i].innerHeight;
        if (area >= savedArea) {
          savedArea = area;
          frame = frames[i];
        }
      } catch (error) {
        log("checkMainFrame(" + level + ") Skipping frame (" + frames[i] + ": i=" + i + ") because it might be CORS, or experienced other error: " + error);
      }
    } //Looping through frames

    var nestedDoc = null;
    //Check for nested frameset (Caution... recursion 1 level deep)
    if (level == 0) {
      nestedDoc = checkFramesetMainFrame(frame, level + 1);
    }

    log("Returning the main content frameset window. Level=" + level + ((level > 0) ? " NESTED": ""));
    if (nestedDoc) {
      //Nested main frame
      return nestedDoc;
    } else {
      //Main frame);
      return frame.document;
    }
  } //if in frameset

  log("Using main window / not a frameset");
  return null;
}

/* TODO: Change to match reality
 * Hail Mary 1 is used to place the footer at the bottom of the page (framed?) for
 * pages that we have determined we can reliably do so (Partially implemented so far)
 * 
 * Hail Mary 2 (the fixed banner) is used to place the footer at the bottom of the browser window,
 * no frames to cover all pages as much as possible when we have no way of identifying them
 */
function addFooterBannerHailMary() {
  var hailMary1 = false;
  var msg = '<ul><li><div id="teconsent"></div></li><li><a id="adchoices" class="new-window" target="_blank" href="https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12">Ad Choices</a></li></ul>';
  
  //null param means use top-level for frames, 0 means top-level of recursion
  var doc = checkFramesetMainFrame(null, 0);
  if (!doc) {
    //If not a frame, then work on main document
    doc = document;

    //Check certain Hail Mary 1 candidates
    if (doc.querySelector("a[href*='//www.bea.com/contact/index']")) {
      hailMary1 = true;
      log('BEA');
    }

    if (document.querySelector('#copyright a[href*="/docs/legal/copyright.html"]')) {
      hailMary1 = true;
      log('JavaSE docs/legal/copyright.html');
    }

    if (document.querySelector('a[href*="spec-frontmatter.html"]') ||
        document.querySelector('a[href*="jvms-0-front.html"]')) {
      hailMary1 = true;
      log('JavaSE specs');
    }
    //If no Hail Mary 1 candidates were detected, then we are doing Hail Mary 2
  } else {
    hailMary1 = true;
  }
  log("Using Hail Mary " + ((hailMary1 == true) ? "1" : "2"));

  //Check to see if Hail Mary footer is already present and bow out if it does
  if (doc.querySelector("#footer-banner")) {
    log("#footer-banner already exists. Skipping application");
    return;
  }

  var rules = "";
  rules += "#footer-banner ul li:nth-child(2) {";
  rules += "  margin-left: 0;";
  rules += "}";

  rules += "#footer-banner {";
  rules += "  z-index: 9999;";
  if (hailMary1) {
    //Hail Mary 1
    //Calculate banner width for HM
    var width = doc.body.clientWidth; //Width without considering padding
    width = width - 24; //Remove our padding
    log("banner width=" + width);
    rules += "  position: relative;";
    rules += "  margin: 10 auto 0 auto;";
    rules += "  width: " + width + "px;";
  } else {
    //Hail Mary 2
    rules += "  position: fixed;";
    rules += "  margin: 0 auto 0 auto;";
  }
  rules += "  bottom: 0; left: 0; right: 0;";
  rules += "  background-color: #EBEBEB !important;";
  rules += "  border-top: 1px solid #ACB7BF;";
  
  rules += "  color: #1958AA;";
  rules += "  padding: 0.0em 1em;";
  rules += "  text-align: center;";
  rules += "  font-size: 12px !important;";
  rules += "  line-height: 15px;";
  rules += "  font-weight: normal;";
  rules += "  font-family: Arial;";
  rules += "  clear: both;";
  rules += "}";
  
  rules += "#teconsent {";
  rules += "  display: inline-block;"; //Just in case because it gets autogenerated otherwise unpredictably
  rules += "}";
  
  rules += "#footer-banner ul {";
  rules += "  list-style: none;";
  rules += "  font-size: 12px !important;";
  rules += "  padding: 0;";
  rules += "  margin: 0;";
  rules += "  margin-right: 20px;";
  rules += "}";
  
  rules += "#footer-banner li {";
  rules += "  display: inline-block;"; //Ensures single line
  if (hailMary1) {
    rules += "  margin-top: 0;";
    rules += "  margin-bottom: 0;";
  }
  rules += "}";

  rules += "#footer-banner li + li:before {";
  rules += "  content: \"|\";";
  rules += "  margin-right: 4px;";
  rules += "  margin-left: 4px;";
  rules += "  color: #aaa;";
  rules += "}";

  rules += "#footer-banner a {";
  rules += "  color: #1958AA;";
  rules += "  text-decoration: none;";
  rules += "  font-size: 12px !important;";
  rules += "}";

  rules += "#footer-banner a:focus, #footer-banner a:hover {";
  rules += "  color: #1958AA;";
  rules += "  text-decoration: underline;";
  rules += "}";

  var myElem = document.getElementById('banner_footer_style');
  if (myElem === null) {
    addCss(doc, rules, "banner_footer_style");
  }

  myElem = document.getElementById('footer-banner');
  if (myElem === null) {
    modifyDocFooter(doc, msg);
  }

  window.top.disclaimerSet = true;
}

//Add CSS to target main content window only
function addCss(doc, rules, id) {
  if (!doc) { doc = document; }
  var style = doc.createElement('style');
  style.setAttribute("id", id);
  style.type = 'text/css';
  if (style.styleSheet) {
    style.styleSheet.cssText = rules;
  } else {
    style.appendChild(document.createTextNode(rules));
  }
  doc.getElementsByTagName("head")[0].appendChild(style);
}

//This is where we actually attach our footer to the page
function modifyDocFooter(doc, msg) {
  if (!doc) { doc = document; }
  var footerDiv = doc.createElement('div');
  footerDiv.setAttribute("id", "footer-banner");
  footerDiv.style.display = "inline-block";
  footerDiv.innerHTML = msg;
  doc.body.appendChild(footerDiv);
  applyConsent(doc);
}

//Places the cookie preference in place
function applyConsent(doc) {
  if (!doc) { doc = document; }
  var consentScript = doc.createElement('script');
  consentScript.type = "text/javascript";
  consentScript.src = "https://consent.truste.com/notice?domain=oracle.com&c=teconsent&js=bb&cdn=1&pcookie&noticeType=bb&text=true";
  doc.body.appendChild(consentScript);
}

//This is where we attach our site catalyst to the page
function addSiteCatalyst() {
  log("global.js site catalyst load");
  var oraScript = document.createElement('script');
  oraScript.type = "text/javascript";
  oraScript.src = "https://www.oracleimg.com/us/assets/metrics/ora_docs.js";
  document.getElementsByTagName('head')[0].appendChild(oraScript);
}

function checkCustomDocArchDisclaimer(doc) {
  //NEWER direct from DocArch custom libraries: <a href="http://www.oracle.com/pls/topic/lookup?ctx=cpyr&amp;id=en-US" target="_blank">Legal Notices</a>
  var customDocArchDisclaimer = doc.querySelector("a[href*='//www.oracle.com/pls/topic/lookup?ctx=cpyr']");
  if(customDocArchDisclaimer) {
    log("customDocArchDisclaimer");
    //Now find Privacy Notice (only searching for this if legal element is found)
    var privacy = customDocArchDisclaimer.parentElement.querySelector("a[href*='//www.oracle.com/us/legal/privacy/index.html']");
    var privacy2 = doc.querySelector("a[href*='//www.oracle.com/us/legal/privacy/index.html']");
    if (privacy || privacy2) {
      if (!privacy && privacy2) {
        privacy = privacy2;
      }
      log("customDocArchDisclaimer>privacy");
      var spanSeparator1 = doc.createElement("span");
      spanSeparator1.innerHTML = " | ";
      
      var cookieLink = doc.createElement("a");
      cookieLink.id = "teconsent";
      cookieLink.href = "#";
      
      var spanSeparator2 = doc.createElement("span");
      spanSeparator2.innerHTML = " | ";

      var adLink = doc.createElement("a");
      adLink.id = "adchoices";
      adLink.target = "_blank";
      adLink.href = "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12";
      adLink.innerHTML = 'Ad Choices';

      privacy.insertAdjacentElement('afterend', spanSeparator1);
      spanSeparator1.insertAdjacentElement('afterend', cookieLink);
      cookieLink.insertAdjacentElement('afterend', spanSeparator2);
      spanSeparator2.insertAdjacentElement('afterend', adLink);
      
      window.top.disclaimerSet = true;
      applyConsent(doc);
      return true;
    }
  }
  return false;
}

function tryFramedFooters() {
  //Always start from top window when doing this check because we may end up here from only a frame change
  var frames = window.top.frames;
  for (var i = 0; i < frames.length; i++) {
    try {
      //Bail if teconsent element already exists
      if (frames[i].document.getElementById('teconsent') !== null) return true;
      
      if (checkCustomDocArchDisclaimer(frames[i].document) == true) {
        return true;
      }
      
      //Product / version string "Custom libraries direct from DocArch"
      //NEWER direct from DocArch custom libraries: <a href="http://www.oracle.com/pls/topic/lookup?ctx=cpyr&amp;id=en-US" target="_blank">Legal Notices</a>
      var prodVerDocArchDisclaimer = frames[i].document.querySelector("a[href*='217488.htm']");
      if(prodVerDocArchDisclaimer) {
        log("prodVerDocArchDisclaimer");

        var AdChoiceMsg = '<a id="adchoices" target="_blank" href="https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12">Ad Choices</a>';
        var disclaimerLi = prodVerDocArchDisclaimer.parentElement;
        var disclaimerUl = prodVerDocArchDisclaimer.parentElement.parentElement;

        //Consent
        var li1 = frames[i].document.createElement("li");
        if (disclaimerLi.className !== "") li1.className = disclaimerLi.className;
        li1.id = "teconsent";
        disclaimerUl.appendChild(li1);

        //Some pages intentionally turn off last border and we need it back on
        disclaimerLi.style.removeProperty('border-right-style');

        //Ad
        var li2 = frames[i].document.createElement("li");
        if (disclaimerLi.className !== "") li2.className = disclaimerLi.className;
        li2.innerHTML = AdChoiceMsg;
        disclaimerUl.appendChild(li2);
        
        //We need to turn off last right border, like they originally did
        li2.style = "border-right-style: none;";

        window.top.disclaimerSet = true;
        applyConsent(frames[i].document);
        return true;
      }
    } catch (error) {
      log("tryFramedFooters() Skipping frame in parent (" + frames[i].parent.location + ": i=" + i + ") because it might be CORS, or experienced other error: " + error);
    }
  } //frames loop
  return false; //No custom frame solution applied
}

//runs after dom and after a 2 second delay to allow other scripts to finish
function delayedFunction() {
  //Only run on main frame
  if(isHttp() && (isNotFramed() || window.top.disclaimerSet == true)) {
    var consent = document.getElementById('teconsent');
    if (consent === null) {
      log("Trying known framed footers....");
      var framed = tryFramedFooters();

      //if (typeof window.top.disclaimerSet == 'undefined' || !window.top.disclaimerSet) {
      if (!framed) {
        log("Defaulting to fixed banner");
        addFooterBannerHailMary();
      }
    }

    //Detect if sitecatalyst is needed
    if (window.oraVersion == null) {
      addSiteCatalyst();
    }
  } else {
    log('Skipping delayedFunction processing')
  }
}

//Runs after dom
function onLoad() {
  log("global.js onLoad");
  log("window.top.location=" + window.top.location + " | window.location=" + window.location);
  var disclaimerSet = false;

  //See if existing teconsent element exists
  var consent = window.self.document.getElementById('teconsent');
  
  //For JavaDoc and PeopleSoft, we don't have any reported pre-existing
  //cookie prefs or ad choices so we treat it as all or nothing
  if (consent === null) {
    if (checkCustomDocArchDisclaimer(window.self.document) == true) {
      disclaimerSet = true;
      //Consent is already applied at lower level
    }

    var javaApiDisclaimer = window.self.document.querySelector("a[href*='//www.oracle.com/technetwork/java/redist-137594.html']");
    if(javaApiDisclaimer) {
      log("jd");
      var preCookieMsg = 'Modify ';
      var cookieMsg = '<a id="teconsent" href="#"></a>';
      var AdChoiceMsg = '. Modify <a id="adchoices" target="_blank" href="https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12">Ad Choices</a>.';
      var disclaimerElement = document.createElement('span');
      disclaimerElement.innerHTML = preCookieMsg + cookieMsg + AdChoiceMsg;
      javaApiDisclaimer.parentElement.appendChild(disclaimerElement);
      disclaimerSet = true;
      applyConsent();
    }

    var peopleSoftDisclaimer = window.self.document.querySelector("a.footerlink[href*='//www.oracle.com/us/legal/privacy/overview/index.html']");
    if(peopleSoftDisclaimer) {
      log("ps");
      var AdChoiceMsg = 'Ad Choices';
      var disclaimerDiv = peopleSoftDisclaimer.parentElement;
      var spanSeparator1 = document.createElement("span");
      var spanSeparator2 = document.createElement("span");
      spanSeparator1.className = "separator";
      spanSeparator1.id = "teconsent";
      spanSeparator2.className = "separator";
      var link = document.createElement("a");
      link.id = "adchoices";
      link.className = "footerlink";
      link.target = "_blank";
      link.href = "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12";
      link.innerHTML = AdChoiceMsg;
      disclaimerDiv.appendChild(spanSeparator1);
      disclaimerDiv.appendChild(spanSeparator2);
      spanSeparator2.appendChild(link);
      disclaimerSet = true;
      applyConsent();
    }

    /* 
     * Other types here:
     */

    //OLDER direct from DocArch custom libraries: <a href="dcommon/html/cpyr.htm">Legal Notices</a>
    //Note: There are older docs with dcommon/cpyr.htm, but they can't work with this code and would have to have their own
    //      handling or hail mary approach. This appears to have some font-size issues sometimes but works otherwise
    var oldCustomDocArchDisclaimer = window.self.document.querySelector("a[href*='dcommon/html/cpyr.htm']");
    var oldCustomDocArchDisclaimer2 = window.self.document.querySelector("#javasecopyright a[href*='legal/cpyr.htm']");
    if(oldCustomDocArchDisclaimer || oldCustomDocArchDisclaimer2) {
      if (!oldCustomDocArchDisclaimer && oldCustomDocArchDisclaimer2) {
        oldCustomDocArchDisclaimer = oldCustomDocArchDisclaimer2;
      }
      log("oldCustomDocArch");
      var cookieMsg = ' | <a id="teconsent" href="#"></a>';
      var AdChoiceMsg = ' | <a id="adchoices" target="_blank" href="https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12">Ad Choices</a>.';
      var disclaimerTd = oldCustomDocArchDisclaimer.parentElement;
      //Do extra font-size checks here
      var children = oldCustomDocArchDisclaimer.children;
      var font = null;
      if (children.length > 0) {
        for (var c = 0; c < children.length; c++) {
          if (children[c].tagName.toLowerCase() == "font") {
            var size = children[c].size;
            log('tag=' + children[c].tagName + " size=" + size);
            cookieMsg = '<font size="' + size + '">' + cookieMsg + '</font>';
            AdChoiceMsg = '<font size="' + size + '">' + AdChoiceMsg + '</font>';
          }
        }
      }
      var oldHtml = disclaimerTd.innerHTML;
      disclaimerTd.innerHTML = oldHtml + cookieMsg + AdChoiceMsg;
      disclaimerSet=true;
      applyConsent();
    }

    var zzLegalNoticeLink = window.self.document.querySelector("a.zz-legal-notice-link[href*='title.htm'");
    if(zzLegalNoticeLink) {
      log("zzLegalNotice");
      var AdChoiceMsg = 'Ad Choices';
      var linebreak = document.createElement("br");
      var separator = document.createTextNode(' | ');
      var disclaimerP = zzLegalNoticeLink.parentElement;
      var link1 = document.createElement("a");
      link1.id = "teconsent";
      link1.className = "zz-legal-notice-link";
      link1.href = "#";
      var link2 = document.createElement("a");
      link2.id = "adchoices";
      link2.className = "zz-legal-notice-link";
      link2.target = "_blank";
      link2.href = "https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12";
      link2.innerHTML = AdChoiceMsg;
      disclaimerP.appendChild(linebreak);
      disclaimerP.appendChild(link1);
      disclaimerP.appendChild(separator);
      disclaimerP.appendChild(link2);
      disclaimerSet = true;
      applyConsent();
    }
  }

  //APLG is special so is in its own process handling logic here
  //Targets many aplg era pubs with the US "Your Privacy Rights" link
  var aplgDisclaimer = window.self.document.querySelector("ul > li > a[href*='//www.oracle.com/us/legal/privacy/index.html']");
  if(aplgDisclaimer) {
    log("aplg");
    var AdChoiceMsg = '<a id="adchoices" target="_blank" href="https://www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12">Ad Choices</a>';
    var disclaimerLi = aplgDisclaimer.parentElement;
    var disclaimerUl = aplgDisclaimer.parentElement.parentElement;

    //Consent element doesn't exist at all
    if (consent === null) {  
      var li1 = window.self.document.createElement("li");
      if (disclaimerLi.className !== "") li1.className = disclaimerLi.className;
      li1.id = "teconsent";
      disclaimerUl.appendChild(li1);
      applyConsent();
    } else {
      //teconsent is present, if empty, apply consent where it stands
      if (consent.innerHTML === "") {
        applyConsent();
      }
    }
      
    //See if existing ad choices element exists
    var choices = window.self.document.querySelector('a[href*="//www.oracle.com/legal/privacy/marketing-cloud-data-cloud-privacy-policy.html#12"]');
    if (choices === null) {  
      //Ad choices doesn't exist so add it
      var li2 = document.createElement("li");
      if (disclaimerLi.className !== "") li2.className = disclaimerLi.className;
      li2.innerHTML = AdChoiceMsg;
      disclaimerUl.appendChild(li2);
    } 

    disclaimerSet = true;
  }

  //TODO: We may not need the if(!window.disclaimerSet) code below
  if(disclaimerSet) {
    window.top.disclaimerSet=true;
    log("Custom disclaimer set");
    //Detect if sitecatalyst is needed (TODO: may need to move location for this)
    if (window.oraVersion == null) {
      addSiteCatalyst();
    }
  } else if( window.location !== window.parent.location) {
    //Framed, we don't specifically address frames and fallback to hail mary on top window
    if (window.top.disclaimerSet) {
      log("delayedFunction for frames called");
      setTimeout(function(){
        //Handle left navigation invoked frame
        delayedFunction();
      }, 2000);
    }
  } else {
    //No disclaimer set so determine which hail mary to do
    if (!window.top.disclaimerSet) {
      log("delayedFunction for main window called");
      setTimeout(function(){
        //Hail Mary
        delayedFunction();
      }, 2000);
    }
  }
}

//Code below runs the onLoad method above after the dom is loaded
if (document.readyState == 'complete') {
  onLoad();
} else if (window.addEventListener) {
  window.addEventListener('load', onLoad, false);
}  else if (window.attachEvent) {
  window.attachEvent('onload', onLoad);
} else {
  window.onload = onLoad;
}

})();