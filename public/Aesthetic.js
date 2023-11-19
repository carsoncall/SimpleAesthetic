//this class serves to define what an Aesthetic is, and to standardize interactions with it.
export default class Aesthetic {
    
    //This is a succinct representation of what data are necessary to make an Aesthetic.
    constructor() {
        this._originalImage = new Image();
        this._aestheticImage = new Image();
        this._originalImage.crossOrigin = "anonymous";
        this._aestheticImage.crossOrigin = "anonymous";

        this.paletteName = "";
        this.paletteColors = [];
        this._aestheticProminentColors = [];
        this._aestheticTitle = "";
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
            
            thisImage.onload = () => {
                try {
                    imageCanvas.width = thisImage.width;
                    imageCanvas.height = thisImage.height;
                    canvasContext.drawImage(thisImage, 0, 0);
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
                    this._aestheticImage.addEventListener("load", () => {
                        resolve();
                    });
                    this._aestheticImage.src = imageCanvas.toDataURL('image/png');
                }, 0);
            } catch (error) {
                reject(error);
            }
        });
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

            for (let k = 0; k < colorSize; k++) { //for each color in the tuple at paletteColors[colorNum]
                pixels[pixelIndex + k] = Math.min(255, Math.max(0, this.paletteColors[closestColorIndex][k])); //ensure values are between 0 and 255
            }
        }

        canvasContext.putImageData(imageData, 0, 0);
    }
    /**
     * Revert object to initial state when picture was uploaded
     */
    revert(imageCanvas, canvasContext) {
        this._aestheticImage = new Image();
        this._aestheticImage.crossOrigin = "anonymous";

        this.paletteName = "";
        this.paletteColors = [];
        this._aestheticProminentColors = [];
        this._aestheticTitle = "";

        try {
            canvasContext.drawImage(this._originalImage, 0, 0);
        } catch (e) {
            console.error("An error occurred while trying to revert to the original image");
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

    //getters and setters exist for clarity's sake

}

// let image = new Image();
// let imageURL;
// let oldImageDataURL;
// let themeArray = [];
// let prominentColors = [];