import { themes } from './themes.js'

//page variables
const imageBox = document.getElementById('target-image');
const instructionModal = document.getElementById('modal');
const customThemeSelectorWrapper = document.getElementById('custom-theme-selector-wrapper');
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
let themeName;
let theme = [];
let themeLength = 0;

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
    convertImage(imageURL, palette)
    console.log("image converting")
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

//file selector listener to actually do something when a file is selected
uploadImageSelector.addEventListener("change", (e) => {
    let selectedFile = e.target.files[0]; //gets the selected file
    if (selectedFile) {
        //use file reader to access the image data
        let reader = new FileReader();
        // file reader event listener
        reader.onload = (event) => {
            imageURL = event.target.result;
            putImage(imageURL); // the something being done 
        }
        reader.readAsDataURL(selectedFile);
    }
});

//radio button listeners to determine which theme has been selected
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
                console.log(theme);
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
    imageBox.setAttribute("src", imageURL);
    console.log("image displayed");
}

//remakes the palette to reflect the selected theme
function putPalette(palette) {

}

//Conversion functions =======================================================================================================

//takes in imageData, determines image type, and calls the appropriate converter
function convertImage(imageData, palette) {

}

//converts PNG to the palette colors
function convertPNGImage(imageData, palette){

}

//converts JPEG to the palette colors
function convertJPEGImage(imageData, palette){

}

//Other==========================================================================================================================

