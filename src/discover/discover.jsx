import React, { useEffect } from 'react';
import hostname from '../assets/hostname.js';
import Aesthetic from '../assets/Aesthetic.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import './discover.css';
import { Card } from 'react-bootstrap';

export default function Discover() {
  const [socket, setSocket] = React.useState(null);
  const loaded = React.useRef(false);

  function configureWebSocket() {
    return new Promise((resolve, reject) => {
      const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
      let socket = new WebSocket(`${protocol}://localhost:4000/ws`); //TODO: replace with ${window.location.host}

      socket.onopen = () => {
        console.log("WebSocket connection opened");
        setSocket(socket);
        console.log("socketRef.current: ", socket);
        resolve();
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed");
        setSocket(null);
      };

      socket.onerror = (error) => {
        reject(error);
      };
    });
  }

  async function startPage() {
    console.log("configuring websocket");
    await configureWebSocket();
  }

  useEffect(() => {
    if (!loaded.current) {
      console.log("starting page");
      startPage();
      loaded.current = true;
    }
  }, []);

  return (
    <div className='container-fluid vh-100 bg-secondary text-center'>
      {socket && <CardContainer socketRef={socket} />}
    </div>
  );
}

function CardContainer({ socketRef }) {
  const [loading, setLoading] = React.useState(false);
  const [allOut, setAllOut] = React.useState(false);
  const [waiting, setWaiting] = React.useState(false);
  const [items, setItems] = React.useState([]);
  const loadedCardIDs = React.useRef([]);
  const loaderRef = React.useRef(null);
  const observerRef = React.useRef(null);
  

  socketRef.onmessage = async (event) => {
    setWaiting(false);
    let nextAesthetic = JSON.parse(await event.data);
    console.log("WebSocket message received: ", nextAesthetic);
    putCard(nextAesthetic);
  };

  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleObserver, { root: null, rootMargin: "20px", threshold: 1.0 });
    observerRef.current.observe(loaderRef.current);
    console.log("observerRef.current: ", observerRef.current);
  }, []);

  const handleObserver = (entities) => {
    const target = entities[0];
    if (target.isIntersecting) {
      if (socketRef) {
        setLoading(true);
        console.log("socketRef.current is not null, setting loading to True");
      } else {
        console.log("tried to load, but socketRef.current is null");
      }
    }
  }

  const addCard = (item) => {
    setItems([...items, item]);
  }

  const addCardID = (item) => {
    loadedCardIDs.current = ([...loadedCardIDs.current, item]);
  }

  useEffect(() => {
    console.log("loading: ", loading);
    if (!loading && !allOut) {
      loadCard();
      setLoading(true);
    };
  }, [loading]);


  function loadCard() {
    console.log("sending message");
    try {
      if (!waiting) {
      socketRef.send(JSON.stringify({ req: "next-aesthetic", loadedIDs: loadedCardIDs.current }));
      console.log("Message sent");
      setWaiting(true);
      }
    } catch (e) {
      console.log("Error sending message", e);
      setLoading(false);
    }
  }

  function putCard(resultJSON) {
    try {
      if (resultJSON["result"] === "success") {
        let aestheticObject = resultJSON["aestheticObject"];
        let aesthetic = new Aesthetic(aestheticObject);
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

  return (
    <div id="card-container" className=''>
      {items.map((item, index) => (
        <AestheticCard key={index} aestheticObject={item} />
      ))}
      {!allOut && <div ref={loaderRef}>Loading...</div>}
      {allOut && <div>All out of aesthetics to show :)</div>}
    </div>
  )
};

function AestheticCard({ aestheticObject }) {
  return (
    <div className="card" id="card">
      <span id="card-title">{aestheticObject.aestheticTitle}</span>
      <img id="card-image" src={aestheticObject._aestheticImage.src} />
      <div id="card-palette">
        <div className="card-palette-color" id="card-palette-color1" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[0]})` }} />
        <div className="card-palette-color" id="card-palette-color2" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[1]})` }} />
        <div className="card-palette-color" id="card-palette-color3" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[2]})` }} />
        <div className="card-palette-color" id="card-palette-color4" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[3]})` }} />
        <div className="card-palette-color" id="card-palette-color5" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[4]})` }} />
        <div className="card-palette-color" id="card-palette-color6" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[5]})` }} />
        <div className="card-palette-color" id="card-palette-color7" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[6]})` }} />
        <div className="card-palette-color" id="card-palette-color8" style={{ backgroundColor: `rgb(${aestheticObject._aestheticProminentColors[7]})` }} />
      </div>
    </div>
  );
}