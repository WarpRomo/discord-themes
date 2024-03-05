document.addEventListener("DOMContentLoaded", main);

let themeList = null;
let currentTheme = null;

function main(){

  colorisInit();

  menuInit()

  editorInit();

}

function menuInit(){

  let themeButtons = document.getElementById("themeButtons");

  let addTheme = document.createElement("button");
  addTheme.innerText = "Create New";
  addTheme.classList.add("addThemeButton");

  addTheme.addEventListener("click", createTheme)

  themeButtons.appendChild(addTheme);


  chrome.storage.local.get({themeList: null, currentTheme: null}, result => {

    themeList = result.themeList;
    currentTheme = result.currentTheme;

    console.log(themeList, currentTheme);

    for(var i = 0; i < themeList.length; i++){

      let themeId = themeList[i];
      createThemeButton(themeId)

    }

    console.log("load", currentTheme)

    loadThemeEditor(currentTheme);

  })

  let cantEdit = document.getElementById("cantEdit");
  let canEdit = document.getElementById("canEdit");

  cantEdit.hidden = true;
  canEdit.hidden = true;

}

function createThemeButton(themeId, change=false){
  let getObj = {};
  getObj[themeId] = null;

  chrome.storage.local.get(getObj, result => {

    console.log(result, getObj);

    let theme = result[themeId];
    let themeName = theme.name;

    let themeButton = document.createElement("button");
    themeButton.innerText = themeName;
    themeButton.classList.add("themeButton");

    if(themeId == currentTheme){
      themeButton.classList.add("currentThemeButton");
    }

    //themeButton.setAttribute("themeName", themeName)
    themeButton.setAttribute("themeId", themeId);

    themeButton.addEventListener("click", (event) => {

      loadThemeEditor(themeId);
      notifyTabs({image: true});

      let buttons = document.getElementsByClassName("themeButton");

      for(var i = 0; i < buttons.length; i++){

        let button = buttons[i];

        if(button.getAttribute("themeId") != themeId && button.classList.contains("currentThemeButton")){
          button.classList.remove("currentThemeButton");
        }
        if(button.getAttribute("themeId") == themeId){
          button.classList.add("currentThemeButton");
        }

      }


    })

    themeButtons.insertBefore(themeButton, themeButtons.lastChild);

    if(change) themeButton.click();

  });

}

function createTheme(color="rgb(0,0,30)", image=null, name){


  let themeId = (new Date().getTime())+"";

  let setObj = {};

  setObj[themeId] = {
    color: "rgb(0,0,30)",
    name: "Unnamed Theme",
    type: "user",
    blur: 0
  }
  setObj[themeId +"-image"] = null;

  themeList.push(themeId);

  setObj["themeList"] = themeList;

  chrome.storage.local.set(setObj).then(() => {

    createThemeButton(themeId, true);

  });

}

function loadThemeEditor(themeId){

  let toGet = {};
  toGet[themeId] = null;
  toGet[themeId + "-image"] = null;

  console.log("loading");

  let setObj = {};
  setObj["currentTheme"] = themeId;

  chrome.storage.local.set(setObj);

  chrome.storage.local.get(toGet, (results) => {

    console.log(results, themeId);

    let theme = results[themeId];

    currentTheme = themeId;

    let color = theme.color;
    let type = theme.type;
    let name = theme.name;
    let blur = theme.blur;

    let image = results[themeId+"-image"];

    let cantEdit = document.getElementById("cantEdit");
    let canEdit = document.getElementById("canEdit");

    cantEdit.hidden = true;
    canEdit.hidden = false;

    document.getElementById("themeName").value = name;
    document.getElementById("themeBlur").value = blur;
    document.getElementById("themeColor").value = color;
    document.getElementById("themeColor").dispatchEvent(new Event('input', { bubbles: true }));

    if(image != null){

      document.getElementById("themeImagePreview").src = image;
      document.getElementById("themeImagePreview").hidden = false;
      document.getElementById("themeBlur").disabled = false;
      //document.getElementById("noThemeImage").hidden = true;

    }
    else{

      document.getElementById("themeImagePreview").hidden = true;
      document.getElementById("themeBlur").disabled = true;
      //document.getElementById("noThemeImage").hidden = false;

    }

    if(type == "default"){


      document.getElementById("themeRemove").disabled = true;



    }
    else{

      document.getElementById("themeRemove").disabled = false;

    }



  })

}


function editorInit(){

  let imageSelect = document.getElementById("themeImage");

  imageSelect.addEventListener("change", () => {

    let file = imageSelect.files[0];
    var reader = new FileReader();

    reader.onload = imageLoad;
    reader.readAsDataURL(file);

  })

  let colorSelect = document.getElementById("themeColor");

  document.addEventListener("coloris:pick", (event) => {

    let myId = colorId;
    setTimeout(() => {colorChangeThrottle(myId, event)}, 250);

  })

  let nameInput = document.getElementById("themeName");
  nameInput.addEventListener("input", nameChange)

  let blurInput = document.getElementById("themeBlur");
  blurInput.addEventListener("input", blurChange)

  let deleteTheme = document.getElementById("themeRemove");
  deleteTheme.addEventListener("click", removeTheme);


}


function removeTheme(){

  let setObj = {};

  setObj[currentTheme] = null;
  setObj[currentTheme + "-image" ] = null;
  themeList.splice(themeList.indexOf(currentTheme), 1);
  setObj["themeList"] = themeList;

  console.log(currentTheme);

  let buttons = document.getElementsByClassName("themeButton");

  let beforeIndex = 0;

  for(var i = 0; i < buttons.length; i++){
    if(buttons[i].getAttribute("themeid") == currentTheme){
      buttons[i].remove();
      break;
    }
    beforeIndex = i;
  }

  console.log(beforeIndex);

  console.log(buttons);

  buttons[beforeIndex].click();

  console.log(setObj);

  chrome.storage.local.set(setObj);

}


function imageLoad(e){

  let url = e.target.result;

  let setObj = {};

  setObj[currentTheme + "-image"] = url;

  chrome.storage.local.set(setObj).then(() => {

    notifyTabs({theme: currentTheme, image: true})

  });

  loadThemeEditor(currentTheme)

}


function blurChange(event){

  console.log('change detected blur', currentTheme);

  let getObj = {};
  getObj[currentTheme] = null;

  chrome.storage.local.get(getObj, (results) => {

    console.log(results);

    console.log(event.target.value, "BLURRR");

    results[currentTheme].blur = event.target.value;

    console.log("SET IT", results);

    chrome.storage.local.set(results);

    notifyTabs({theme: currentTheme, image: false});

  })

}

let colorId = 0;

function colorChangeThrottle(id, event){

  if(id != colorId) return;
  colorId++;
  colorChange(event);

}

function colorChange(event){

  console.log('change detected', currentTheme);

  let getObj = {};
  getObj[currentTheme] = null;

  chrome.storage.local.get(getObj, (results) => {

    console.log(results);

    results[currentTheme].color = event.detail.color;

    console.log("SET IT", results);

    chrome.storage.local.set(results);

    notifyTabs({theme: currentTheme, image: false});

  })

}



function nameChange(event){

  console.log("name changed");

  let getObj = {};
  getObj[currentTheme] = null;

  let buttons = document.getElementsByClassName("themeButton");

  console.log(buttons);

  //event.target.value = event.target.value || "No Name";


  for(var i = 0; i < buttons.length; i++){

    let themeId = buttons[i].getAttribute("themeid");

    console.log(themeId);

    if(themeId == currentTheme){

      buttons[i].innerText = event.target.value;

    }

  }

  chrome.storage.local.get(getObj, (results) => {

      results[currentTheme].name = event.target.value

      chrome.storage.local.set(results);

  })

}


function colorisInit(){
  Coloris({
    // The default behavior is to append the color picker's dialog to the end of the document's
    // body. but it is possible to append it to a custom parent instead. This is especially useful
    // when the color fields are in a scrollable container and you want the color picker's dialog
    // to remain anchored to them. You will need to set the CSS position of the desired container
    // to "relative" or "absolute".
    // Note: This should be a scrollable container with enough space to display the picker.
    parent: '.container',

    // A custom selector to bind the color picker to. This must point to HTML input fields.
    el: '.color-field',

    // The bound input fields are wrapped in a div that adds a thumbnail showing the current color
    // and a button to open the color picker (for accessibility only). If you wish to keep your
    // fields unaltered, set this to false, in which case you will lose the color thumbnail and
    // the accessible button (not recommended).
    // Note: This only works if you specify a custom selector to bind the picker (option above),
    // it doesn't work on the default [data-coloris] attribute selector.
    wrap: true,

    // Set to true to activate basic right-to-left support.
    rtl: false,

    // Available themes: default, large, polaroid, pill (horizontal).
    // More themes might be added in the future.
    theme: 'default',

    // Set the theme to light or dark mode:
    // * light: light mode (default).
    // * dark: dark mode.
    // * auto: automatically enables dark mode when the user prefers a dark color scheme.
    themeMode: 'light',

    // The margin in pixels between the input fields and the color picker's dialog.
    margin: 2,

    // Set the preferred color string format:
    // * hex: outputs #RRGGBB or #RRGGBBAA (default).
    // * rgb: outputs rgb(R, G, B) or rgba(R, G, B, A).
    // * hsl: outputs hsl(H, S, L) or hsla(H, S, L, A).
    // * auto: guesses the format from the active input field. Defaults to hex if it fails.
    // * mixed: outputs #RRGGBB when alpha is 1; otherwise rgba(R, G, B, A).
    format: 'rgb',

    // Set to true to enable format toggle buttons in the color picker dialog.
    // This will also force the format option (above) to auto.
    formatToggle: false,

    // Enable or disable alpha support.
    // When disabled, it will strip the alpha value from the existing color string in all formats.
    alpha: true,

    // Set to true to always include the alpha value in the color value even if the opacity is 100%.
    forceAlpha: false,

    // Set to true to hide all the color picker widgets (spectrum, hue, ...) except the swatches.
    swatchesOnly: false,

    // Focus the color value input when the color picker dialog is opened.
    focusInput: true,

    // Select and focus the color value input when the color picker dialog is opened.
    selectInput: false,

    // Show an optional clear button
    clearButton: false,

    // Set the label of the clear button
    clearLabel: 'Clear',

    // Show an optional close button
    closeButton: false,

    // Set the label of the close button
    closeLabel: 'Close',

    // An array of the desired color swatches to display. If omitted or the array is empty,
    // the color swatches will be disabled.
    swatches: [
      '#264653',
      '#2a9d8f',
      '#e9c46a',
      'rgb(244,162,97)',
      '#e76f51',
      '#d62828',
      'navy',
      '#07b',
      '#0096c7',
      '#00b4d880',
      'rgba(0,119,182,0.8)'
    ],

    // Set to true to use the color picker as an inline widget. In this mode the color picker is
    // always visible and positioned statically within its container, which is by default the body
    // of the document. Use the "parent" option to set a custom container.
    // Note: In this mode, the best way to get the picked color, is listening to the "coloris:pick"
    // event and reading the value from the event detail (See example in the Events section). The
    // other way is to read the value of the input field with the id "clr-color-value".
    inline: false,

    // In inline mode, this is the default color that is set when the picker is initialized.
    defaultColor: '#000000',

    // A function that is called whenever a new color is picked. This defaults to an empty function,
    // but can be set to a custom one. The selected color is passed to the function as an argument.
    // Use in instances (described below) to perform a custom action for each instance.
    onChange: (color) => undefined
  });

}

function notifyTabs(message){

  chrome.tabs.query({}, function(tabs) {

    for(var i = 0; i < tabs.length; i++){

      if(!tabs[i].url.includes("discord.com/channels")) continue;

      chrome.tabs.sendMessage(tabs[i].id, message);

    }

  });

}


// @sourceURL=popup.js
