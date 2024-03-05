var r = document.querySelector(':root');
var rs = getComputedStyle(r);
//--__header-bar-background
let goalStyling = null;

console.log("content loaded");
initStyling(true);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

      initStyling(request.image);

    }
)


console.log(" im in");

function initStyling(changeImage=false){

  chrome.storage.local.get({currentTheme: null}, (results) => {

    let currentTheme = results.currentTheme;

    let getObj = {};
    getObj[currentTheme] = null;
    if(changeImage) getObj[currentTheme + "-image"] = null;

    chrome.storage.local.get(getObj, results => {

      let color = results[currentTheme].color;
      let blur = results[currentTheme].blur;
      let image = null;
      if(changeImage) image = results[currentTheme + "-image"] || "none";

      //console.log(image, image!=null);

      setColor(color, image != null)
      setBlur(blur)
      setImage(image);

    })

  })


}

function setBlur(blur){

  let interval = setInterval(() => {
    try{
      let element = document.body.children[0].children[3].children[0].children[0].children[0].children[0];
      element.style.filter = `blur(${blur}px)`;
      clearInterval(interval);
    }
    catch(err){
      //console.log(err);
    }

  }, 100)

}

function setColor(baseColor, hasImage){

  goalStyling = {
      "--background-primary": scaleAlpha(baseColor, 0.75), //chat background
      "--bg-overlay-chat": scaleAlpha(baseColor, 0.75),

      "--background-secondary": scaleAlpha(baseColor, 0.75), //friends list
      "--bg-overlay-3": scaleAlpha(baseColor, 0.75),

      "--background-secondary-alt": scaleAlpha(baseColor, 0.75), //bottom left profile background
      "--bg-overlay-1": scaleAlpha(baseColor, 0.75),

      "--channeltextarea-background": scaleAlpha(baseColor, 0.75), //messagebox
      "--bg-overlay-3": scaleAlpha(baseColor, 0.75),

      "--scrollbar-auto-scrollbar-color-thumb": scaleAlpha(baseColor, 1),
      "--scrollbar-auto-scrollbar-color-track": scaleAlpha(baseColor, 0.1),
      "--scrollbar-thin-thumb": scaleAlpha(baseColor, 1),
      "--scrollbar-thin-track": scaleAlpha(baseColor, 0.1),

      "--background-tertiary": scaleAlpha(baseColor, 1.2), //server panel left side
      "--bg-overlay-app-frame": scaleAlpha(baseColor, 1.2),
      "--bg-overlay-4": scaleAlpha(baseColor, 1.2),

      "--bg-overlay-2": scaleAlpha(baseColor, 0.75), //add friende blocked pending all
      "--primary-800": scaleAlpha(baseColor, 0.75),
      "--primary-630": scaleAlpha(baseColor, 0.75),

      "--background-modifier-selected": scaleAlpha(baseColor, 2),
      "--bg-overlay-selected": scaleAlpha(baseColor, 2),

      "--background-modifier-hover": scaleAlpha(baseColor, 1.2),
      "--bg-overlay-hover": scaleAlpha(baseColor, 1.2),

      "--background-modifier-active": scaleAlpha(baseColor, 2),
      "--bg-overlay-active": scaleAlpha(baseColor, 2)

      //"--profile-gradient-primary-color": scaleAlpha(baseColor, 0.2),
      //"--profile-gradient-primary-color": scaleAlpha(baseColor, 1)
      //"--interactive-active": scaleAlpha(baseColor, 0.5)

  }

  mutationDetected();

}

function scaleAlpha(rgba, factor){

  let vals = rgba.match(/[+-]?\d+(\.\d+)?/g).map(parseFloat);

  if(vals.length == 3) vals.push(1);

  return `rgba(${vals[0]}, ${vals[1]}, ${vals[2]}, ${vals[3] * factor})`

}



function setImage(image){

  let interval = setInterval(() => {
    try{
      let element = document.body.children[0].children[3].children[0].children[0].children[0].children[0];
      if(image != null) document.body.children[0].children[3].children[0].children[0].children[0].children[0].style.background = `center / cover url("${image}")`;
      clearInterval(interval);
    }
    catch(err){
      //console.log(err);
    }

  }, 100)

}

function mutationDetected(mutations){

  if(goalStyling == null) return;

  let keys = Object.keys(goalStyling);

  for(var i = 0; i < keys.length; i++){

      let currentValue = rs.getPropertyValue(keys[i]);
      if(currentValue != goalStyling[keys[i]]){

          r.style.setProperty(keys[i], goalStyling[keys[i]]);

      }

  }

}

const styleObserver = new MutationObserver(mutationDetected);

styleObserver.observe(document.querySelector(':root'), {
  attributes: true,
  attributeFilter: ['style'],
});

mutationDetected();
