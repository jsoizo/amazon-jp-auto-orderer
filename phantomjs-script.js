var system = require('system'),
    args = system.args;

function exitWithErrorMsg(message) {
  system.stderr.write(message);
  phantom.exit();
}

// validate arguments
if (args.length !== 5) {
  exitWithErrorMsg("Try to pass some arguments when invoking this script!'");
}

var email = args[1],
    password = args[2],
    itemUrl = args[3],
    captureImagePath = args[4];

// Status
var currentUrl = "",
    stepIndex = 0,
    loadInProgress = false;

// Initialize browser
var page = require('webpage').create();
page.viewportSize = { width: 1920, height: 1080 };
page.settings.userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36";

var steps = [
  function() {
    console.log("### Open Top Page ###");
    page.open("https://amazon.co.jp", function(status){})
  },
  function() {
    console.log("### Click Signin Button ###");
    page.evaluate(function(){
      document.getElementById("nav-link-yourAccount").click();
    });
  },
  function() {
    console.log("### Submit Login Form ###");
    page.evaluate(function(email, password){
      document.getElementById("ap_email").value = email;
      document.getElementById("ap_password").value = password;
      document.getElementsByName('signIn')[0].submit();
    }, email, password);
  },
  function() {
    console.log("### Open Item Page ###");
    page.open(itemUrl, function(status){})
  },
  function() {
    console.log("### Add To Cart ###");
    page.evaluate(function(){
      document.getElementById("add-to-cart-button").click();
    })
  },
  function() {
    console.log("### Proceed To Payment ###");
    page.evaluate(function(){
      document.getElementById("hlb-ptc-btn-native").click();
    })
  },
  function() {
    console.log("### Confirm Payment ###");
    page.evaluate(function(){
      document.getElementById("spc-form").submit();
    })
  },
  function() {
    page.render(captureImagePath);
  }
];

page.onLoadStarted = function() {
  loadInProgress = true;
  currentUrl = page.evaluate(function() {
    return window.location.href;
  });
  console.log("load started : " + currentUrl);
};

page.onLoadFinished = function(status) {
  loadInProgress = false;
  console.log("load finished: " + status);
  if (status !== "success") {
    exitWithErrorMsg("Page Open Error!\npage: "+currentUrl);
  }
};

page.onConsoleMessage = function(msg) {
  console.log(message);
};

interval = setInterval(executeRequestsStepByStep, 500);
function executeRequestsStepByStep(){
  if (loadInProgress == false && typeof steps[stepIndex] == "function") {
      console.log("step " + (stepIndex + 1));
      steps[stepIndex]();
      stepIndex++;
  }
  if (typeof steps[stepIndex] != "function") {
      console.log("test complete!");
      phantom.exit();
  }
}
