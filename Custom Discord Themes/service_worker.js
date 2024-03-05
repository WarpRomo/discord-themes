let defaultStyleList = {

  "1": {
    "color": "rgba(36, 0, 0, 0.36)",
    "blur": 10,
    "type": "default",
    "name": "Default Theme 1"
  },
  "1-image": "background1.jpg",
  "2":{
    "color": "rgba(0, 0, 26, 0.68)",
    "type": "user",
    "blur": 5,
    "name": "Default Theme 2"
  },
  "2-image": "background2.jpg",
  "3":{
    "color": "rgba(122, 23, 111, 0.38)",
    "type": "user",
    "blur": 15,
    "name": "Default Theme 3"
  },
  "3-image": "background3.png",

}

let defaultTheme = "2";

let defaultThemeList = ["1", "2", "3"]
let toFix = ["1-image", "2-image", "3-image"];


let interval = setInterval(() => {

  for(var i = 0; i < toFix.length; i++){

    if(defaultStyleList[toFix[i]].length < 100) return;

  }

  chrome.storage.local.set(defaultStyleList);
  chrome.storage.local.set({currentTheme: defaultTheme});
  chrome.storage.local.set({themeList: defaultThemeList});

  clearInterval(interval);

}, 100)


initImages();

async function initImages(){

  for(var i = 0; i < toFix.length; i++){

    let imageURL = defaultStyleList[toFix[i]];

    let fullURL = chrome.runtime.getURL(imageURL);

    let myLoc = toFix[i];

    console.log(fullURL);

    let file = await getFileFromUrl(fullURL, toFix[i]);

    var reader = new FileReader();
    reader.onload = function(e) {

      let url = e.target.result;

      defaultStyleList[myLoc] = url;

    };
    reader.readAsDataURL(file)

  }

}

async function getFileFromUrl(url, name, defaultType = 'image/jpeg'){
  const response = await fetch(url);
  const data = await response.blob();
  return new File([data], name, {
    type: data.type || defaultType,
  });
}
