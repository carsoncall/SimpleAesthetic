import React, { useEffect, useRef } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
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
    if (!aesthetic.current.paletteColors) {
      alert("No theme selected! Select a theme and try again.");
      console.log("No theme selected! Select a theme and try again.");
    } else {
      setLoading(true);
      let imageData = canvasContext.current.getImageData(0, 0, imageCanvas.current.width, imageCanvas.current.height);
      await aesthetic.current.convertImage(imageData, imageCanvas.current, canvasContext.current);
      setLoading(false);
    }
  }

  function downloadImageHandler() {
    console.log("download image clicked");
    if (aesthetic.current._aestheticImage.src === "") {
      alert("No image to download! Convert an image and try again.");
      console.log("No image to download! Convert an image and try again.");
      return;
    } else {
      let downloadLink = document.createElement("a");
      downloadLink.href = aesthetic.current._aestheticImage.src;
      downloadLink.download = "aesthetic.png";
      downloadLink.click();
    }
  }

  function undoChangesHandler() {
    console.log("undo changes clicked");
    aesthetic.current.loadImage(aesthetic.current._originalImage.src, "originalImage", imageCanvas.current, canvasContext.current);
  }

  function handleFilePickerChange(event) {
    let file = event.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onloadend = () => {
        aesthetic.current.loadImage(reader.result, "aestheticImage", imageCanvas.current, canvasContext.current);
      };
      reader.readAsDataURL(file);
    } else {
      console.log("No file selected");
    }
  }

  return (
    <>
      {loading ? <span>Loading...</span> :
        <div id="image-buttons" >
          <Button variant="success" id="upload-image" onClick={uploadImageHandler} className='m-2'>Upload Image</Button>
          <input ref={filePicker} type="file" id="upload-image-selector" onChange={handleFilePickerChange} accept=".jpg, .png" style={{ "display": "none" }} />
          <Button variant="success" id="convert-image" onClick={convertImageHandler} className='m-2'>Convert Image</Button>
          <Button variant="success" id="download-image" onClick={downloadImageHandler} className='m-2'>Download Image</Button>
          <Button variant="success" id="undo-changes" onClick={undoChangesHandler} className='m-2'>Undo Changes</Button>
        </div>
      }
    </>

  )
}

function Themes({ aesthetic }) {
  const [theme, setTheme] = React.useState("");
  const [displayPicker, setDisplayPicker] = React.useState(false);
  const [paletteColors, setPaletteColors] = React.useState([]);

  useEffect(() => {
    if (theme === "custom") {
      setDisplayPicker(true);
      //TODO: support file uploading
    } else {
      aesthetic.current.paletteName = theme;
      aesthetic.current.paletteColors = themes[theme];
      setPaletteColors(themes[theme]);
      setDisplayPicker(false);
      console.log("Theme selected: ", theme);
    }
  }, [theme]);

  return (
    <>
      <legend>
        <h5>Themes</h5>
      </legend>
      <ToggleButtonGroup type="radio" name="options" onChange={setTheme}>
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
      <h5>Palette </h5>
      {aesthetic.current.paletteColors ?
        <Row>
          {aesthetic.current.paletteColors.map((color, index) => (
            <Col key={index} style={{ backgroundColor: `rgb(${color[0]}, ${color[1]}, ${color[2]})`, height: '50px' }} />
          ))}
        </Row> : null}
    </>
  )
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

  function setTitle(event) {
    aesthetic.current.title = event.target.value;
  }

  function uploadAestheticHandler() {
    if (!aesthetic.current.title) {
      alert("You must give your aesthetic a title!");
      return;
    }
    if (sessionStorage.getItem('sessionToken')) {
      uploadAesthetic(aesthetic)
        .then(response => {
          console.log(response);
          if (response["result"] === "success") {
            alert("Aesthetic successfully uploaded!");
          } else {
            alert("Something went wrong with uploading the aesthetic");
            throw new Error("Something went wrong with uploading the aesthetic");
          }
        })
        .catch(error => {
          console.error("Error uploading aesthetic: ", error);
        })
    } else {
      alert("You must be logged in to share an aesthetic!");
    }
  }


  return (
    <div className='container-fluid vh-100 bg-secondary text-center'>
      <div>
        <h5>Upload an image (or use the provided random one), choose a theme, and create an Aesthetic</h5>
      </div>
      <div id="aesthetic-title" className='d-flex flex-column align-items-center'>
        <Form.Label htmlFor="aesthetic-title-input">Aesthetic Title: </Form.Label>
        <Form.Control type="text" onChange={setTitle} id="aesthetic-title-input" defaultValue="Untitled" style={{"width":"500px"}}/>
      </div>
      <div id="image-wrapper">
        <Canvas ref={imageCanvas} />
      </div>
      <ImageButtons aesthetic={aesthetic} imageCanvas={imageCanvas} canvasContext={canvasContext} />
      <div>
        <Themes aesthetic={aesthetic} />
        <br />
        <br />
        <Button variant="success" onClick={uploadAestheticHandler} id="share-aesthetic" className='m-2'>Share Aesthetic</Button>
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

async function uploadAesthetic(aesthetic) {
  let aestheticJSONString = JSON.stringify(aesthetic.current);
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
        console.log("Aesthetic successfully uploaded!");
        return data;
      } else if (data["result"] === "error") {
        console.log("Error uploading aesthetic: ", data["error"]);
        return data;
      }
    })
    .catch(error => {
      console.error("Error uploading aesthetic: ", error);
    });
}
