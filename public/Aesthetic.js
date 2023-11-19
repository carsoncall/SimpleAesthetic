//this class serves to define what an Aesthetic is, and to standardize interactions with it.
export default class Aesthetic {
    
    //This is a succinct representation of what data are necessary to make an Aesthetic.
    constructor() {
        this._originalImage = new Image();
        this._aestheticImage = new Image();
        this._paletteName = "";
        this._paletteColors = [];
        this._aestheticProminentColors = [];
        this._aestheticTitle = "";
    }

    //getters and setters exist for clarity's sake
    set originalImageDataURL(imageDataURL) {
        this._originalImage.src = imageDataURL;
    }

    get originalImageDataURL() {
        return this.
    }

    set aestheticImageDataURL(imageDataURL) {
        this._aestheticImageDataURL = imageDataURL;
    }

    get aestheticImageDataURL() {
        return this._aestheticImageDataURL
    }

    set aestheticColors(arrayOfColorTuples) {
        this._aestheticColors = arrayOfColorTuples;
    }
}

// let image = new Image();
// let imageURL;
// let oldImageDataURL;
// let themeArray = [];
// let prominentColors = [];