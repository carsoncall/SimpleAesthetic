//hostname for backend -- debugging purposes
import hostname from './assets/hostname.js';
import Aesthetic from './Aesthetic.js';

//page variables
const cardContainer = document.getElementById('card-container');
const loader = document.createElement('div');

let isLoading = false;
let loadedCardIDs = [];
let allOut = false;
let websocket;

const sentinel = document.createElement('div');
sentinel.innerHTML = "Loading...";
cardContainer.appendChild(sentinel);

function configureWebSocket() {
    const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
    let socket = new WebSocket(`${protocol}://${window.location.host}/ws`);
    socket.onopen = (event) => {
        console.log("WebSocket connection opened");
        websocket = socket;
        loadCard();
    };
    socket.onclose = (event) => {
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


const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !allOut && websocket) {
            console.log("Loading next card");
            loadCard();
        } else {
            console.log("Not loading next card");
        }
    });
}, { root: cardContainer, threshold: 0.5 });

observer.observe(sentinel);

function loadCard() {
    if (isLoading) {
        console.log("Already loading");
        return;
    } else {
        isLoading = true;
        observer.unobserve(sentinel); // stop observing sentinel while loading
        console.log("sending message");
        try {
            websocket.send(JSON.stringify({req: "next-aesthetic", loadedIDs: loadedCardIDs}));
        } catch (e) {
            console.log("Error sending message", e);
        }
        
    }
}

/**
 *  Takes the response JSON from the backend and creates a new card in the card container.
 *  @param {JSON} resultJSON the JSON response from the backend
 * */
function putCard(resultJSON) {
    try {
        if (resultJSON["result"] === "success") {
            let aestheticObject = resultJSON["aestheticObject"];
            let aesthetic = new Aesthetic(aestheticObject);
            let aestheticHTML = aesthetic.createCardHTML();
            cardContainer.insertBefore(aestheticHTML, sentinel);
            loadedCardIDs.push(resultJSON["aestheticObject"]["_id"]);
            console.log("Loaded card with id: ", resultJSON["aestheticObject"]["_id"]);
        } else if (resultJSON["result"] === "all out") {
            const allOutDiv = document.createElement('div');
            allOutDiv.textContent = "All out of aesthetics to show :)";
            sentinel.remove();
            cardContainer.appendChild(allOutDiv);
            allOut = true;
            console.log("All out of aesthetics to show :)");
        } else if (resultJSON["result"] === "error") {
            throw new Error("Backend failed to get a new card", resultJSON["error"]);
        } else {
            throw new Error("God only knows what happened");
        }
    } catch (e) {
        console.log("Error loading new card", e);
    } finally {
        isLoading = false;
        console.log("isLoading: ", isLoading);
        observer.observe(sentinel); // start observing sentinel again
    };
}