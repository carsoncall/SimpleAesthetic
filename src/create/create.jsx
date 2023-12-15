import React, { useEffect, useRef } from 'react';
import { Button } from 'react-bootstrap';
import { themes } from '../assets/themes.js'
//hostname for backend -- debugging purposes
import hostname from '../assets/hostname.js';
import Aesthetic from '../assets/Aesthetic.js'

import { ToggleButton, ToggleButtonGroup, Form } from 'react-bootstrap';

const Canvas = React.forwardRef(({ }, ref) => {
  return (
    <canvas ref={ref} style={{ "height": "500px", "width": "500px" }} />
  )
});

function ImageButtons({ aesthetic, imageCanvas, canvasContext }) {
  const [loading, setLoading] = React.useState(false);
  const filePicker = React.useRef(null);

  function uploadImageHandler() {
    console.log("upload image clicked");
    filePicker.current.click();
  }

  async function convertImageHandler() {
    console.log("convert image clicked");
    if (aesthetic.paletteColors.length === 0) {
      alert("No theme selected! Select a theme and try again.");
      console.log("No theme selected! Select a theme and try again.");
      return;
    } else {
      setLoading(true);
      let imageData = canvasContext.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
      await aesthetic.convertImage(imageData, imageCanvas, canvasContext);
      setLoading(false);
    }
  }

  function downloadImageHandler() {
    console.log("download image clicked");
    if (aesthetic._aestheticImage.src === "") {
      alert("No image to download! Convert an image and try again.");
      console.log("No image to download! Convert an image and try again.");
      return;
    } else {
      let downloadLink = document.createElement("a");
      downloadLink.href = aesthetic._aestheticImage.src;
      downloadLink.download = "aesthetic.png";
      downloadLink.click();
    }
  }

  function undoChangesHandler() {
    console.log("undo changes clicked");
    currentAesthetic.loadImage("originalImage", imageCanvas, canvasContext);
  }

  return (
    <>
      {loading ? <span>Loading...</span> :
        <div id="image-buttons" >
          <Button variant="success" id="upload-image" onClick={uploadImageHandler} className='m-2'>Upload Image</Button>
          <input ref={filePicker} type="file" id="upload-image-selector" accept=".jpg, .png" style={{ "display": "none" }} />
          <Button variant="success" id="convert-image" onClick={convertImageHandler} className='m-2'>Convert Image</Button>
          <Button variant="success" id="download-image" onClick={downloadImageHandler} className='m-2'>Download Image</Button>
          <Button variant="success" id="undo-changes" onClick={undoChangesHandler} className='m-2'>Undo Changes</Button>
        </div>
      }
    </>

  )
}

function Themes() {
  const [theme, setTheme] = React.useState("gruvbox");
  const [displayPicker, setDisplayPicker] = React.useState(false);

  useEffect(() => {
    if (theme === "custom") {
      setDisplayPicker(true);
    } else {
      setDisplayPicker(false);
    }
  }, [theme]);

  return (
    <>
      <legend>
        <h5>Themes</h5>
      </legend>
      <ToggleButtonGroup type="radio" name="options" defaultValue="gruvbox" onChange={setTheme}>
        <ToggleButton id="gruvbox" value="gruvbox">gruvbox</ToggleButton>
        <ToggleButton id="solarized" value="solarized">solarized</ToggleButton>
        <ToggleButton id="catpuccin" value="catpuccin">catpuccin</ToggleButton>
        <ToggleButton id="dracula" value="dracula">dracula</ToggleButton>
        <ToggleButton id="nord" value="nord">nord</ToggleButton>
        <ToggleButton id="custom" value="custom">custom</ToggleButton>
      </ToggleButtonGroup>
      {displayPicker ?
        <div id="custom-theme-selector-wrapper">
          <input type="file" id="custom-theme-selector" accept=".json" />
        </div> : null}
    </>
  )
}

function Palette() {
  return (
    <>
      <div id="palette-title">
        <h5>Palette </h5>
      </div>
      <div id="palette"></div>
    </>
  );
}


export default function Create() {
  const aesthetic = React.useRef(new Aesthetic());
  const imageCanvas = useRef(null);
  const canvasContext = useRef(null);

  useEffect(() => {
    async function loadRandomURL() {
      try {
        let randomImageURL = await fetchRandomImageURL();
        canvasContext.current = imageCanvas.current.getContext("2d");
        console.log("canvasContext is ", canvasContext.current);
        aesthetic.current.loadImage(randomImageURL, "originalImage", imageCanvas.current, canvasContext.current);
      } catch (error) {
        console.error("Error loading random image: ", error);
      }
    }
    loadRandomURL();
  }, []);


  return (
    <div className='container-fluid vh-100 bg-secondary text-center'>
      <div>
        <h5>Upload an image (or use the provided random one), choose a theme, and create an Aesthetic</h5>
      </div>
      <div id="aesthetic-title">
        <Form.Label htmlFor="aesthetic-title-input">Aesthetic Title: </Form.Label>
        <Form.Control type="text" id="aesthetic-title-input" defaultValue="Untitled" />
      </div>
      <div id="image-wrapper">
        <Canvas ref={imageCanvas} />
      </div>
      <ImageButtons aesthetic={aesthetic.current} imageCanvas={imageCanvas.current} canvasContext={canvasContext.current} />
      <div>
        <Themes aesthetic={aesthetic} />
        <br />
        <br />
        <Palette aesthetic={aesthetic} />
        <br />
        <br />
        <Button variant="success" id="create-aesthetic" className='m-2'>Create Aesthetic</Button>
        <br />
        <br />
        <br />
      </div>
    </div>
  );
}
// Remote resource fetchers=========================================================================================================

async function fetchRandomImageURL() {
  return await fetch("https://picsum.photos/1000")
    .then(async (response) => {
      if (!response) {
        throw new Error("Failed to fetch random image url");
      }
      console.log("Image URL query response: ", response);
      const blob = await response.blob();
      return new Promise(async (resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    })
    .catch(error => {
      throw error;
    })
}

async function uploadAesthetic() {
  let aestheticJSONString = JSON.stringify(currentAesthetic);
  console.log("Uploading the following JSON:", aestheticJSONString);
  return await fetch(`${hostname}/upload-aesthetic`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'sessionToken': sessionStorage.getItem('sessionToken')
    },
    body: aestheticJSONString
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      if (data["result"] === "success") {
        alert("Aesthetic successfully uploaded!");
      } else if (data["result"] === "error") {
        alert(`The server sent back the following error: ${data["error"]}`);
      }
    })
    .catch(error => {
      console.error("Error uploading aesthetic: ", error);
    });
}
