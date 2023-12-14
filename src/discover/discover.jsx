import React, { useEffect } from 'react';
import hostname from '../assets/hostname.js';
import Aesthetic from '../assets/Aesthetic.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './discover.css';

export default function Discover() {
  const [loading, setLoading] = React.useState(false);
  const [allOut, setAllOut] = React.useState(false);
  const [loadedCardIDs, addLoadedCardID] = React.useState([]);
  const [items, setItems] = React.useState([]);
  const socketRef = React.useRef(null);
  const loaderRef = React.useRef(null);

  useEffect(() => {
    var options = {
      root: null,
      rootMargin: '20px',
      threshold: 1.0
    };
    const observer = new IntersectionObserver(handleObserver, options);
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
  }, []);

  useEffect(() => {
    if (loading) {
      loadCard();
    }
  }, [loading]);

  const handleObserver = (entities) => {
    const target = entities[0];
    if (target.isIntersecting) {
      setLoading(true);
    }
  }

  const addCardID = (item) => {
    addLoadedCardID([...loadedCardIDs, item]);
  }

  const addCard = (item) => {
    setItems([...items, item]);
  }

  function loadCard() {
    if (loading) {
      console.log("Already loading");
      return;
    } else {
      setLoading(true);
      console.log("sending message");
      try {
        socketRef.current.send(JSON.stringify({ req: "next-aesthetic", loadedIDs: loadedCardIDs }));
        console.log("Message sent");
      } catch (e) {
        console.log("Error sending message", e);
      }
    }
  }

  function putCard(resultJSON) {
    try {
      if (resultJSON["result"] === "success") {
        let aestheticObject = resultJSON["aestheticObject"];
        let aesthetic = new Aesthetic(aestheticObject);
        //let aestheticHTML = aesthetic.createCardHTML();
        addCard(aesthetic);
        addCardID(resultJSON["aestheticObject"]["_id"]);
        console.log("Loaded card with id: ", resultJSON["aestheticObject"]["_id"]);
      } else if (resultJSON["result"] === "all out") {
        setAllOut(true);
        console.log("All out of aesthetics to show :)");
      } else if (resultJSON["result"] === "error") {
        throw new Error("Backend failed to get a new card", resultJSON["error"]);
      } else {
        throw new Error("God only knows what happened");
      }
    } catch (e) {
      console.log("Error loading new card", e);
    } finally {
      setLoading(false);
    };
  }

  function configureWebSocket() {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    let socket = new WebSocket(`${protocol}://localhost:4000/ws`); //TODO: replace with ${window.location.host}
    socket.onopen = () => {
      console.log("WebSocket connection opened");
      socketRef.current = socket;
      loadCard();
    };
    socket.onclose = () => {
      console.log("WebSocket connection closed");
    };
    socket.onmessage = async (event) => {
      let nextAesthetic = JSON.parse(await event.data);
      console.log("WebSocket message received: ", nextAesthetic);
      putCard(nextAesthetic);
    };
    return socket;
  }
  configureWebSocket();

  function AestheticCard({ aestheticObject }) {
    return (
      <div className="card" id="card">
        <span id="card-title">{aestheticObject.aestheticTitle}</span>
        <img id="card-image" src={aestheticObject._aestheticImage.src}/>
        <div id="card-palette">
          <div class="card-palette-color" id="card-palette-color1" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[0]})` }} />
          <div class="card-palette-color" id="card-palette-color2" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[1]})` }} />
          <div class="card-palette-color" id="card-palette-color3" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[2]})` }} />
          <div class="card-palette-color" id="card-palette-color4" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[3]})` }} />
          <div class="card-palette-color" id="card-palette-color5" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[4]})` }} />
          <div class="card-palette-color" id="card-palette-color6" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[5]})` }} />
          <div class="card-palette-color" id="card-palette-color7" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[6]})` }} />
          <div class="card-palette-color" id="card-palette-color8" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[7]})` }} />
        </div>
      </div>
    );
  }

  return (
    <div className='container-fluid vh-100 bg-secondary text-center'>
      <div id="card-container" className=''>
        {items.map((item, index) => (
          <AestheticCard key={index} aestheticObject={item} />
        ))}
        {loading && <div>Loading...</div>}
        {allOut && <div>All out of aesthetics to show :)</div>}
      </div>
    </div>
  );
}