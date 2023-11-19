//page variables
const cardContainer = document.getElementById('card-container');
const loader = document.createElement('div');

//hostname for backend -- debugging purposes
import hostname from './hostname.js';

loader.className = 'card';
cardContainer.appendChild(loader);
loader.textContent = 'Loading...';

let isLoading = false;
let loadedCardIDs = [];
let allOut = false;
let page = 3;
let loadThreshold = 100; //this is the number of pixels from the bottom that the user is before the next card loads

//event listeners 
cardContainer.addEventListener("scroll", () => {
    const scrollHeight = cardContainer.scrollHeight;
    const scrollTop = cardContainer.scrollTop;
    const clientHeight = cardContainer.clientHeight;

    if (scrollHeight - scrollTop <= clientHeight + loadThreshold
        && !allOut) {
        loadCard();
    }
});

async function loadCard() {
    if (isLoading){
        cardContainer.appendChild(loader);
        return;
    }

    isLoading = true;
    fetch(`http://${hostname}/next-aesthetic`)
    .then( async response => {
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        console.log("Response status: ", response.status);
        let responseJSON = await response.json();
        console.log(responseJSON);
        return responseJSON;
    })
    .then(resultJSON => {
        loader.remove();
        console.log(resultJSON);

        if (resultJSON["result"] === "success") {
            const newCard = document.createElement('div');
            newCard.className = 'card';
            newCard.innerHTML = resultJSON["aesthetic"];
            cardContainer.appendChild(newCard);
        } else if (resultJSON["result"] === "all out") {
            const allOutDiv = document.createElement('div');
            allOutDiv.textContent = "All out of aesthetics to show :)";
            cardContainer.appendChild(allOutDiv);
            allOut = true;
        } else if (resultJSON["result"] === "error") {
            throw new Error("Backend failed to get a new card", resultJSON["error"]);
        } else {
            throw new Error("God only knows what happened");
        }
        isLoading = false;
    })
    .catch(error => {
        console.error("Error loading new card", error);
    });
}
loadCard();
