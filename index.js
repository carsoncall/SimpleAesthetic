import { themes } from './themes.js'

//page variables
const imageCanvas = document.getElementById('target-image');
const instructionModal = document.getElementById('modal');
const customThemeSelectorWrapper = document.getElementById('custom-theme-selector-wrapper');
const palette = document.getElementById('palette');
//button variables
const uploadImageButton = document.getElementById('upload-image');
const convertImageButton = document.getElementById('convert-image');
const downloadImageButton = document.getElementById('download-image');
const undoChangesButton = document.getElementById('undo-changes');
const uploadImageSelector = document.getElementById('upload-image-selector');
const radioButtons = document.getElementsByName('theme-button');
const customThemeSelector = document.getElementById('custom-theme-selector');
const modalUnderstood = document.getElementById('modal-understood');

//global variables
let image = new Image();
let imageURL;
let modifiedImage = new Image();
let modifiedImageURL;
let themeArray = [];


//canvas context
const ctx = imageCanvas.getContext("2d");

//Event listeners===========================================================================================================

//when the page is loaded, clear previously uploaded images and custom themes
window.addEventListener("load", () => {
    customThemeSelector.value = null;
    uploadImageSelector.value = null;
    radioButtons.forEach((radioButton) => {
        radioButton.checked = false;
        console.log('resetting radio buttons');
    });
})

//button event listener to make image file choice dialog appear
uploadImageButton.addEventListener("click", (event) => {
    event.preventDefault(); //prevent form from auto submitting
    uploadImageSelector.click();
    console.log("upload-image clicked");
});

//button event listener to call converter function
convertImageButton.addEventListener("click", (event) => {
    if (themeArray.length === 0) {
        alert("No theme selected!");
        console.log("conversion failed: no theme selected");
        return;
    } else {
        let imageData = ctx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
        convertImage(imageData, themeArray);
        console.log("image conversion called")
    }
});

//button event listener to download currently displayed file
downloadImageButton.addEventListener("click", (e) => {
    let downloadLink = document.createElement("a");
    downloadLink.href = imageBox.getAttribute("src");
    //extract the image type from the URL
    let fileExtension = downloadLink.href.split(';')[0].split(':')[1];
    downloadLink.download = "image." + fileExtension;
    downloadLink.click();
    console.log("image downloaded")
});

//button event listener to revert image
undoChangesButton.addEventListener("click", (event) => {
    putImage(imageURL);
});

//file selector listener to actually do something when an image file is selected
uploadImageSelector.addEventListener("change", (e) => {
    let selectedFile = e.target.files[0]; //gets the selected file
    if (selectedFile) {
        //use file reader to access the image data
        let reader = new FileReader();
        // file reader event listener
        reader.onload = (event) => {
            imageURL = event.target.result;
            putImage(imageURL); // the something being done
            console.log(imageURL);
        }
        reader.readAsDataURL(selectedFile);
    }
});

//radio button listeners to determine which theme has been selected.
//if custom is selected, then make the file picker visible
radioButtons.forEach( (radioButton) => {
    console.log("adding event listeners");
    radioButton.addEventListener("change", (e) => {
        if (radioButton.checked) {
            let themeName = radioButton.value;
            console.log("Selected: " + themeName);
            if (themeName === "custom") {
                instructionModal.classList.add('visible');
                customThemeSelectorWrapper.classList.add('visible');
            } else {
                customThemeSelectorWrapper.classList.remove('visible');
                themeArray = themes[themeName];
                putPalette(themeArray);
            }
        }
    });
});

//event listener to dismiss modal and open file selector
modalUnderstood.addEventListener("click", (e) => {
    instructionModal.classList.remove('visible');
    customThemeSelector.click();
})

//file selector listener for the custom theme button
customThemeSelector.addEventListener("change", (e) => {
    console.log("Files.length: " + customThemeSelector.files.length);
    console.log(customThemeSelector.files);
    console.log('uploading custom theme')
    let selectedFile = e.target.files[0];
    if (selectedFile) {
        let reader = new FileReader();
        reader.onload = (event) => {
            let jsonString = event.target.result;
            try {
                theme = JSON.parse(jsonString);
                themeLength = theme.length;
                console.log(theme);
                putPalette(theme);
            } catch(error) {
                console.error("Error parsing custom JSON theme: ", error);
            }
        } 
        reader.readAsText(selectedFile);
    } 
})

//HTML Modifiers===================================================================================================================

//I bet you can guess what this does
function putImage(imageURL) {
    image.src = imageURL;
    image.onload = () => {
        imageCanvas.width = image.width;
        imageCanvas.height = image.height;
        ctx.drawImage(image, 0, 0);
    }
    console.log("image displayed");
}

//remakes the palette to reflect the selected theme
function putPalette(themeArray) {
    //remove previous palette
    while (palette.firstChild) {
        palette.removeChild(palette.firstChild);
    }

    //put new palette
    for (let i = 0; i < themeArray.length; i++) {
        const paletteSwatch = document.createElement('div');
        paletteSwatch.classList.add('palette-swatch');
        paletteSwatch.style.backgroundColor = `rgb(${themeArray[i][0]}, ${themeArray[i][1]}, ${themeArray[i][2]})`;
        palette.appendChild(paletteSwatch);
    }
}

//Conversion functions =======================================================================================================

//converts image to the palette colors
function convertImage(imageData, themeArray){
    let pixels = imageData.data;
    //for each pixel in the image
    for (let i = 0; i < pixels.length; i+=4) {
        let minimum = 0;
        let lens = []; //lens is an array of tuples where [themeArrayIndex (aka j), distanceFromPixel]

        //for each color in theme
        for (let j = 0; j < themeArray.length; j++) {
            //3D (euclidean) distance from color -- not particulary great but good enough; other algorithms potentially worth 
            //implementing in the future
            let distanceFromPixel = (Math.sqrt(Math.pow(pixels[i]-themeArray[j][0], 2) 
                                        + Math.pow(pixels[i+1]-themeArray[j][1], 2) 
                                        + Math.pow(pixels[i+2]-themeArray[j][2], 2)));
            let lensEntry = [j, distanceFromPixel];
            lens.push(lensEntry);
        }
        //sort distances from pixels and find the smallest
        //sort the array from least to greatest
        lens.sort((a,b) => a[1]-b[1]);

        let colorNum = lens[0][0]; //this is the index of the closest color to the pixel
        for (let k = 0; k < 3; k++) {
            pixels[i+k] = themeArray[colorNum][k];
        }
    }
    ctx.putImageData(imageData, 0, 0);
}


//Other==========================================================================================================================

