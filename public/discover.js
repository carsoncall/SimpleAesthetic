//page variables
const cardContainer = document.getElementById('card-container');
const loader = document.createElement('div');


loader.className = 'card';
cardContainer.appendChild(loader);
loader.textContent = 'Loading...';

let isLoading = false;
let page = 3;
let loadThreshold = 100; //this is the number of pixels from the bottom that the user is before the next card loads

//event listeners 
cardContainer.addEventListener("scroll", () => {
    const scrollHeight = cardContainer.scrollHeight;
    const scrollTop = cardContainer.scrollTop;
    const clientHeight = cardContainer.clientHeight;

    if (scrollHeight - scrollTop <= clientHeight + loadThreshold) {
        loadCard();
    }
});

function loadCard() {
    if (isLoading){
        cardContainer.appendChild(loader);
        return;
    }

    isLoading = true;
    fetch("https://simpleaesthetic.carsonandkaitlyn.com/next-aesthetic")
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        return response.text();
    })
    .then(htmlString => {
        const newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.innerHTML = htmlString;
        cardContainer.appendChild(newCard);
        loader.remove();
        isLoading = false;
    })
    .catch(error => {
        console.error("Error loading new card", error);
    });
}
loadCard();
