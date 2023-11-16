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

    // setTimeout(() => { //dummy code taking place of loading content from server
    //     const newCard = document.createElement('div');
    //     newCard.className = 'card';
    //     newCard.innerHTML = `
    //     <span id="card-title">Example Aesthetic ${page}</span>
    //             <img id="card-image" src="assets/converted.png">
    //             <div id="card-palette">
    //                 <div class="card-palette-color" id="card-palette-color1" style="background-color: rgb(251, 241, 199);"></div>
    //                 <div class="card-palette-color" id="card-palette-color2" style="background-color: rgb(239, 219, 178);"></div>
    //                 <div class="card-palette-color" id="card-palette-color3" style="background-color: rgb(177, 98, 134);"></div>
    //                 <div class="card-palette-color" id="card-palette-color4" style="background-color: rgb(131, 165, 152);"></div>
    //                 <div class="card-palette-color" id="card-palette-color5" style="background-color: rgb(104, 157, 106);"></div>
    //                 <div class="card-palette-color" id="card-palette-color6" style="background-color: rgb(69, 133, 136);"></div>
    //                 <div class="card-palette-color" id="card-palette-color7" style="background-color: rgb(80, 73, 69);"></div>
    //                 <div class="card-palette-color" id="card-palette-color8" style="background-color: rgb(40, 40, 40);"></div>
    //             </div>
    //     `
    //     cardContainer.appendChild(newCard);
    //     page++;
    //     loader.remove();
    //     isLoading = false;
    // }, 1000);
    fetch("https://api.simpleaesthetic.carsonandkaitlyn.com/next-aesthetic")
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
