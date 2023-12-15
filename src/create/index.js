import { themes } from '../assets/themes.js'
//hostname for backend -- debugging purposes
import hostname from './assets/hostname.js';
import Aesthetic from '../assets/Aesthetic.js'

//page variables
const imageCanvas = document.getElementById('target-image');
const canvasContext = imageCanvas.getContext("2d");

const instructionModal = document.getElementById('modal');
const customThemeSelectorWrapper = document.getElementById('custom-theme-selector-wrapper');
const palette = document.getElementById('palette');
const imageButtons = document.getElementById('image-buttons');
const imageButtonsLoadingContainer = document.getElementById('image-buttons-loading-container');

//button variables
const uploadImageButton = document.getElementById('upload-image');
const convertImageButton = document.getElementById('convert-image');
const downloadImageButton = document.getElementById('download-image');
const undoChangesButton = document.getElementById('undo-changes');
const uploadImageSelector = document.getElementById('upload-image-selector');
const radioButtons = document.getElementsByName('theme-button');
const customThemeSelector = document.getElementById('custom-theme-selector');
const modalUnderstood = document.getElementById('modal-understood');
const shareAesethetic = document.getElementById('share-aesthetic');

//text field variables
const aestheticTitleInput = document.getElementById('aesthetic-title-input');

//global variable that holds the current aesthetic
const currentAesthetic = new Aesthetic();
let reload = true;

//Event listeners===========================================================================================================

window.addEventListener("load", async () => {
    if (reload) {
        resetPage();

        //load random picture from picsum third-party API
        
    }
});

//button event listener to make image file choice dialog appear
uploadImageButton.addEventListener("click", (event) => {
    event.preventDefault(); //prevent form from auto submitting
    reload = false;
    
});

//button event listener to call converter function
convertImageButton.addEventListener("click", async () => {
    reload = false;
    if (currentAesthetic.paletteColors.length === 0) {
        alert("No theme selected! Select a theme and try again.");
        console.log("No theme selected! Select a theme and try again.");
        return;
    } else {
        let imageData = canvasContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);

        imageButtons.classList.add('invisible');
        imageButtonsLoadingContainer.classList.add('visible');
        await currentAesthetic.convertImage(imageData, imageCanvas, canvasContext);

        imageButtons.classList.remove('invisible');
        imageButtonsLoadingContainer.classList.remove('visible');
    }
});

//button event listener to download currently displayed file
downloadImageButton.addEventListener("click", (e) => {
    let downloadLink = document.createElement("a");
    downloadLink.href = image.src;
    //extract the image type from the URL
    let fileExtension = downloadLink.href.split(';')[0].split(':')[1];
    downloadLink.download = "image." + fileExtension;
    downloadLink.click();
    console.log("image downloaded")
});

//button event listener to revert image
undoChangesButton.addEventListener("click", (event) => {
    currentAesthetic.loadImage("originalImage", imageCanvas, canvasContext);
});

//file selector listener to actually do something when an image file is selected
uploadImageSelector.addEventListener("change", (e) => {
    let selectedFile = e.target.files[0]; //gets the selected file
    if (selectedFile) {
        //use file reader to access the image data
        let reader = new FileReader();
        // file reader event listener
        reader.onload = (event) => {
            // image.src = event.target.result;
            // putImage(); // the something being done
            // console.log(imageURL);
            currentAesthetic.loadImage(event.target.result, "originalImage", imageCanvas, canvasContext);
            console.log("Image uploaded");
        }
        reader.readAsDataURL(selectedFile);
    }
});

//radio button listeners to determine which theme has been selected.
//if custom is selected, then make the file picker visible
radioButtons.forEach( (radioButton) => {
    console.log("adding event listeners");
    radioButton.addEventListener("change", () => {
        if (radioButton.checked) {
            currentAesthetic.paletteName = radioButton.value;
            console.log("Selected: " + currentAesthetic.paletteName);
            if (currentAesthetic.paletteName === "custom") {
                instructionModal.classList.add('visible');
                customThemeSelectorWrapper.classList.add('visible');
            } else {
                customThemeSelectorWrapper.classList.remove('visible');
                currentAesthetic.paletteColors = themes[currentAesthetic.paletteName];
                updatePalette();
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
    //TODO: verify file has at least two colors
    console.log('uploading custom theme')
    let selectedFile = e.target.files[0];
    if (selectedFile) {
        let reader = new FileReader();
        
        reader.onload = (event) => {
            let jsonString = event.target.result;
            try {
                let theme = JSON.parse(jsonString);
                
                // error checking 
                if (!(theme["name"] instanceof String)) {
                    throw new Error("Invalid name! Don't forget the quotes.");
                } 

                if (!Array.isArray(theme["theme"])) {
                    throw new Error("Theme is not an array! Pay attention to the example punctuation.");
                } else if (theme["theme"].length < 2) {
                    throw new Error("Theme must be 2 or more colors; a single color is just a rectangle!")
                }

                currentAesthetic.paletteName = theme["name"];
                currentAesthetic.paletteColors = theme["theme"];
                updatePalette();

            } catch(error) {
                console.error("Error parsing custom JSON theme: ", error);
                alert(error);
                customThemeSelector.value = null;
            }
        } 
        reader.readAsText(selectedFile);
    } 
})

//button event listener for sharing the aesthetic
shareAesethetic.addEventListener("click", (event) => {
    event.preventDefault();
    currentAesthetic.aestheticTitle = aestheticTitleInput.value;
    if (sessionStorage.getItem('sessionToken')) {
        uploadAesthetic()
            .then(response => {
                console.log(response);
                if (response["result"] === "success") {
                    alert("Aesthetic successfully uploaded!");
                } else {
                    throw new Error("Something went wrong with uploading the aesthetic");
                }
            })
            .catch(error => {
                console.error("Error uploading aesthetic: ", error);
            })
    } else {
        alert("You must be logged in to share an aesthetic!");
    }
})

//HTML Modifiers===================================================================================================================

//clears out previous selections
function resetPage() {
    customThemeSelector.value = null;
    uploadImageSelector.value = null;
    radioButtons.forEach((radioButton) => {
        radioButton.checked = false;
    });
    console.log("page reset");
}

//remakes the palette to reflect the selected theme
function updatePalette() {
    const paletteColors = currentAesthetic.paletteColors; // alias for readability

    //remove previous palette
    while (palette.firstChild) {
        palette.removeChild(palette.firstChild);
    }

    //put new palette
    for (let i = 0; i < paletteColors.length; i++) {
        const paletteSwatch = document.createElement('div');
        paletteSwatch.classList.add('palette-swatch');
        paletteSwatch.style.backgroundColor = `rgb(${paletteColors[i][0]}, ${paletteColors[i][1]}, ${paletteColors[i][2]})`;
        palette.appendChild(paletteSwatch);
    }
}



