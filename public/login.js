//page variables
let usernameField = document.getElementById('username');
let passwordField = document.getElementById('password');
let instructionModal = document.getElementById('modal');
let modalContent = document.getElementById('modal-content');
let modalTitle = document.getElementById('modal-title');
let modalText = document.getElementById('modal-text');

//buttons
let loginButton = document.getElementById('login');
let createNewAccountButton = document.getElementById('create-new-account');
let modalUnderstood = document.getElementById('modal-understood');

//event listeners
loginButton.addEventListener("click", (e) => {
    console.log("login button clicked");
    let fields = getTextFromFields();
    let result = login(fields['username'], fields['password']);
    console.log("test: ", result["result"]);
    writeToModal(result["result"], `username: ${fields['username']}, password: not telling ;)`);
    instructionModal.classList.add('visible');
    console.log("Login Fields: ", fields);

});

createNewAccountButton.addEventListener("click", (e) => {
    console.log('create new account button clicked');
    let fields = getTextFromFields();
    let result = createAccount(fields['username'], fields['password']);
    console.log("test: ", result["result"]);
    writeToModal(result["result"], `username: ${fields['username']}, password: not telling ;)`);
    instructionModal.classList.add('visible');
    console.log("Create Account Fields: ", fields);
});

modalUnderstood.addEventListener("click", (e) => {
    instructionModal.classList.remove('visible');
})

function getTextFromFields() {
    let username = usernameField.value;
    let password = passwordField.value;
    return {'username':username, 'password':password};
}

function writeToModal(title, text) {
    modalTitle.textContent = title;
    modalText.textContent = text;
}

async function login(username, password) {
    return await fetch('https://api.simpleaesthetic.carsonandkaitlyn.com/login')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Login failed: ', error);
    });
}

async function createAccount(username, password) {
    return await fetch('https://api.simpleaesthetic.carsonandkaitlyn.com/create-account')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then (data => {
        console.log(data);
    })
    .catch(error => {
        console.error('Login failed: ', error);
    });
}