//hostname for backend -- debugging purposes
import hostname from './assets/hostname.js';

import Aesthetic from './Aesthetic.js';

//page variables
const cardContainer = document.getElementById('card-container');
const loader = document.createElement('div');

loader.className = 'card';
cardContainer.appendChild(loader);
loader.textContent = 'Loading...';

let isLoading = false;
let loadedCardIDs = [];
let allOut = false;
let loadThreshold = 1000; //this is the number of pixels from the bottom that the user is before the next card loads

// //event listeners 
// cardContainer.addEventListener("scroll", () => {
//     const scrollHeight = cardContainer.scrollHeight;
//     const scrollTop = cardContainer.scrollTop;
//     const clientHeight = cardContainer.clientHeight;

//     if (scrollHeight - scrollTop <= clientHeight + loadThreshold
//         && !allOut) {
//         loadCard();
//     }
// });
const sentinel = document.createElement('div');
sentinel.innerHTML = "Loading...";
cardContainer.appendChild(sentinel);

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !allOut) {
            console.log("Loading next card");
            loadCard();
        } else {
            console.log("Not loading next card");
        }
    });
}, { root: cardContainer, threshold: 0.5 });

observer.observe(sentinel);

async function loadCard() {
    if (isLoading){
        cardContainer.appendChild(loader);
        console.log("Already loading");
        return;
    }

    isLoading = true;
    observer.unobserve(sentinel); // stop observing sentinel while loading
    fetch(`${hostname}/next-aesthetic?loadedIDs=${JSON.stringify(loadedCardIDs)}`)
    .then( async response => {
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        console.log("Response status: ", response.status);
        let responseJSON = await response.json();
        return responseJSON;
    })
    .then(resultJSON => {
        loader.remove();
        console.log("Discover::loadCard() result: ", resultJSON);

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
    })
    .catch(error => {
        console.log("Error loading new card", error);
    })
    .finally(() => {
        isLoading = false;
        console.log("isLoading: ", isLoading);
        observer.observe(sentinel); // start observing sentinel again
    });
}

loadCard(); 