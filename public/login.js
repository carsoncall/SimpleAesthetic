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
import hostname from './assets/hostname.js';

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
    return await fetch(`${hostname}/login`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'username': username,
            'password': password
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Login data from server: ", data);
        if (data["result"] === "success") {
            writeToModal(data["result"], `${username} has successfully logged in`);
            if (!sessionStorage.getItem('sessionToken')) {
                sessionStorage.setItem('sessionToken', data["sessionToken"]);
            }
        } else if (data["result"] === "error") {
            writeToModal(data["result"], `The server sent back the following error: ${data["error"]}`);
        }
        instructionModal.classList.add('visible');
    })
    .catch(error => {
        console.log('Login failed: ', error);
    });
}

async function createAccount(username, password) {
    return await fetch(`${hostname}/create-account`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({username: username, password: password})
        })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then (data => {
        console.log("Account Creation data from server: ", data);
        if (data["result"] === "success") {
            writeToModal(data["result"], `${username}'s account has been created!`);
        } else if (data["result"] === "error") {
            writeToModal(data["result"], `The server sent back the following error: ${data["error"]}`);
        }
        instructionModal.classList.add('visible');
    })
    .catch(error => {
        console.error('Account creation failed: ', error);
    });
}