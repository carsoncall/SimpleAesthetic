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
    writeToModal("Congratulations! You have logged in", `username: ${fields['username']}, password: not telling ;)`);
    instructionModal.classList.add('visible');
    console.log(fields);

});

createNewAccountButton.addEventListener("click", (e) => {
    console.log('create new account button clicked');
    let fields = getTextFromFields();
    writeToModal("Congratulations! You have made an account", `username: ${fields['username']}, password: not telling ;)`);
    instructionModal.classList.add('visible');
    console.log(getTextFromFields());
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