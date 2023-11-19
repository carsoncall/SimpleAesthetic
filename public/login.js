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
    login(fields['username'], fields['password']);
});

//hostname for backend -- debugging purposes
import hostname from './hostname.js';

createNewAccountButton.addEventListener("click", (e) => {
    console.log('create new account button clicked');
    let fields = getTextFromFields();
    createAccount(fields['username'], fields['password']);
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
    return await fetch(`https://${hostname}/login`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Login data from server: ", data);
        writeToModal(data["result"], `username: ${username}, password: not telling ;)`);
        instructionModal.classList.add('visible');
    })
    .catch(error => {
        console.error('Login failed: ', error);
    });
}

async function createAccount(username, password) {
    return await fetch(`https://${hostname}/create-account`)
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then (data => {
        console.log("Account Creation data from server: ", data);
        writeToModal(data["result"], `username: ${username}, password: not telling ;)`);
        instructionModal.classList.add('visible');
    })
    .catch(error => {
        console.error('Login failed: ', error);
    });
}