import { themes } from './themes.js'

//page variables
const imageBox = document.getElementById('target-image');

//button variables
const uploadImageButton = document.getElementById('upload-image');
const convertImageButton = document.getElementById('convert-image');
const downloadImageButton = document.getElementById('download-image');
const undoChangesButton = document.getElementById('undo-changes');
const uploadImageSelector = document.getElementById('upload-image-selector');
const radioButtons = document.getElementsByName('theme-button');
const customThemeSelector = document.getElementById('custom-theme-selector');

//global variables
let image = new Image();
let imageURL;
let modifiedImage = new Image();
let modifiedImageURL;
let themeName;
let theme = [];
let themeLength = 0;

//Event listeners===========================================================================================================

//button event listener to make file choice dialog appear
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
                customThemeSelector.click();
            }
        }
    });
});

//file selector listener for the custom theme button
customThemeSelector.addEventListener("change", (e) => {
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
        };
    }
    reader.readAsText(selectedFile);
})

//HTML Modifiers===================================================================================================================

//I bet you can guess what this does
function putImage(imageURL) {
    imageBox.setAttribute("src", imageURL);
    console.log("image displayed");
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



