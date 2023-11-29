//this class serves to define what an Aesthetic is, and to standardize interactions with it.
import ImageInfo from './ImageInfo.js';
export default class Aesthetic {
    
    //This is a succinct representation of what data are necessary to make an Aesthetic.
    constructor(data) {
        if (data) {
            this._originalImage = data._originalImage;
            this._aestheticImage = data._aestheticImage;
            this.paletteName = data.paletteName;
            this.paletteColors = data.paletteColors;
            this._aestheticProminentColors = data._aestheticProminentColors;
            this._aestheticTitle = data._aestheticTitle;
        } else {
            this._originalImage = new ImageInfo();
            this._aestheticImage = new ImageInfo();
            this.paletteName = "";
            this.paletteColors = [];
            this._aestheticProminentColors = [];
            this._aestheticTitle = "";
        }
    }

    //this function takes care of all the HTML Image -related stuff.
    /**
     * 
     * @param {string} imageDataURL - a string encoding of an image, which has been already validated.
     * @param {"originalImage" | "aestheticImage"} image - which image to load
     * @param {HTMLCanvasElement} imageCanvas - the canvas to which the image will be loaded
     * @param {CanvasRenderingContext2D} canvasContext - the context of the canvas element.
     */
    loadImage(imageDataURL, image, imageCanvas, canvasContext) {
        const thisImage = this[`_${image}`];
        if (!thisImage) {
            throw new Error(`loadImage() failed because the param:image was not \"originalImage\" | \"aestheticImage\". image = ${image}`);
        }

        if (this.isValidDataURL(imageDataURL)) {
            thisImage.src = imageDataURL;

            let imageToLoad = new Image();
            imageToLoad.crossOrigin = "anonymous";
            imageToLoad.src = imageDataURL;
            
            imageToLoad.onload = () => {
                try {
                    thisImage.width = imageToLoad.width;
                    thisImage.height = imageToLoad.height;

                    imageCanvas.width = thisImage.width;
                    imageCanvas.height = thisImage.height;
                    canvasContext.drawImage(imageToLoad, 0, 0);
                } catch (e) {
                    console.error("An error occurred during the loadImage() image.onload callback: ", e);
                }
            };
        } else {
            throw new Error(`loadImage() failed because the param:imageDataURL was invalid. imageDataURL = ${imageDataURL}`);
        }
    }
    /**
     * Converts the image to the given theme.
     * 
     * @param {string} paletteName - The name of the palette 
     * @param {Array<Array<number>>} paletteColors - An array of tuples of three numbers, which represent R, G, and B.
     * @param {ImageData} imageData - an ImageData object (derived from canvasContext.getImageData())
     */
    convertImage(imageData, imageCanvas, canvasContext) {
        if (!(imageData instanceof ImageData)) {
            throw new Error("convertImage() failed because the param:imageData was not of type ImageData");
        }
          
        return new Promise((resolve, reject) => {
            try {
                setTimeout(() => {
                    this._euclideanDistanceConverter(imageData, canvasContext);
                    let aestheticSrc = imageCanvas.toDataURL('image/png');
                    this._aestheticImage.src = aestheticSrc;
                    this._aestheticImage.width = imageCanvas.width;
                    this._aestheticImage.height = imageCanvas.height;
                    console.log("Original Image: ", this._originalImage);
                    console.log("Aesthetic Image: ", this._aestheticImage);
                    resolve();
                }, 0);
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Creates the inner HTML of the card.
     * @returns {Node} the card HTML, in a div Node of class 'card'.
     */
    createCardHTML() {
        let card = document.createElement('div');
        card.classList.add('card');
        let cardHTML = `
                        <span id="card-title">${this._aestheticTitle}</span>
                        <img id="card-image" src="${this._aestheticImage.src}">
                        <div id="card-palette">
                            <div class="card-palette-color" id="card-palette-color1" style="background-color: rgb(${this._aestheticProminentColors[0]})">
                            </div>
                            <div class="card-palette-color" id="card-palette-color2" style="background-color: rgb(${this._aestheticProminentColors[1]});">
                            </div>
                            <div class="card-palette-color" id="card-palette-color3" style="background-color: rgb(${this._aestheticProminentColors[2]});">
                            </div>
                            <div class="card-palette-color" id="card-palette-color4" style="background-color: rgb(${this._aestheticProminentColors[3]});">
                            </div>
                            <div class="card-palette-color" id="card-palette-color5" style="background-color: rgb(${this._aestheticProminentColors[4]});">
                            </div>
                            <div class="card-palette-color" id="card-palette-color6" style="background-color: rgb(${this._aestheticProminentColors[5]});">
                            </div>
                            <div class="card-palette-color" id="card-palette-color7" style="background-color: rgb(${this._aestheticProminentColors[6]});">
                            </div>
                            <div class="card-palette-color" id="card-palette-color8" style="background-color: rgb(${this._aestheticProminentColors[7]});">
                            </div>
                        </div>
                        `;
        card.innerHTML = cardHTML;
        return card;
    }

    /**
     * 3D (euclidean) distance from color -- not particulary great but good enough; other algorithms potentially worth implementing in the future
     * 
     * @param {Uint8ClampedArray} pixels - the pixel values of the image to be converted
     * @returns A blob with type 'image/png'
     */
    _euclideanDistanceConverter(imageData, canvasContext) {
        let pixelSize = 4; // pixel is four numbers R,G,B,A in this format
        let colorSize = 3; // colors are provided as three numbers R,G,B
        let pixels = imageData.data;
        let prominentColorCounter = {}; //dictionary of color:count pairs

        for (let pixelIndex = 0; pixelIndex < pixels.length; pixelIndex+=pixelSize) { // for each pixel in pixels 
            let lens = []; //lens is an array of tuples where [paletteColorsIndex (aka j), distanceFromPixel]

            for (let paletteIndex = 0; paletteIndex < this.paletteColors.length; paletteIndex++) { // for each color in paletteColors
                let distanceFromPixel = (Math.sqrt(Math.pow(pixels[pixelIndex]-this.paletteColors[paletteIndex][0], 2) 
                                            + Math.pow(pixels[pixelIndex+1]-this.paletteColors[paletteIndex][1], 2) 
                                            + Math.pow(pixels[pixelIndex+2]-this.paletteColors[paletteIndex][2], 2)));
                let lensEntry = [paletteIndex, distanceFromPixel];
                lens.push(lensEntry);
            }

            //sort distances from pixels and find the smallest
            lens.sort((a,b) => a[1]-b[1]); //sort the array from least to greatest

            let closestColorIndex = lens[0][0]; //this is the index of the closest color to the pixel
            prominentColorCounter[closestColorIndex] = (prominentColorCounter[closestColorIndex] || 0) + 1; //increment the count of the closest color

            for (let k = 0; k < colorSize; k++) { //for each color in the tuple at paletteColors[colorNum]
                pixels[pixelIndex + k] = Math.min(255, Math.max(0, this.paletteColors[closestColorIndex][k])); //ensure values are between 0 and 255
            }
        }
        canvasContext.putImageData(imageData, 0, 0);
        let pairs = Object.entries(prominentColorCounter);
        pairs.sort((a,b) => b[1]-a[1]); //sort the array from greatest to least
        let topEight = pairs.slice(0,8).map(pair => this.paletteColors[pair[0]]); //get the top 8 colors
        this._aestheticProminentColors = topEight;
    }
    /**
     * Revert object to initial state when picture was uploaded
     */
    revert(imageCanvas, canvasContext) {
        this._aestheticImage = new ImageInfo();

        this.paletteName = "";
        this.paletteColors = [];
        this._aestheticProminentColors = [];
        this._aestheticTitle = "";

        try {
            drawImage(imageCanvas, canvasContext, this._originalImage.src);
        } catch (e) {
            console.error("An error occurred while trying to revert to the original image");
        }
    }

    /**
     * Draws the image to the canvas. Handles creating the Image() object and setting the onload callback.
     * @param {HTMLCanvasElement} imageCanvas - the canvas to which the image will be loaded
     * @param {CanvasRenderingContext2D} canvasContext - the context of the canvas element.
     * @param {string} src - the source of the image to be drawn
     */
    drawImage(imageCanvas, canvasContext, src) {
        let imageToDraw = new Image();
        imageToDraw.crossOrigin = "anonymous";
        imageToDraw.src = src
        imageToDraw.onload = () => {
            imageCanvas.width = imageToDraw.width;
            imageCanvas.height = imageToDraw.height;
            canvasContext.drawImage(imageToDraw, 0, 0);
        }
    }

    /**
     * Regular expression for matching data URLs
     * @param {string} dataURL 
     * @returns boolean representing validity
     */
    isValidDataURL(dataURL) {
        const dataURLPattern = /^data:image\/(?:png|jpeg);base64,([a-zA-Z0-9+/]+={0,2})$/;
        return dataURLPattern.test(dataURL);
    }
}