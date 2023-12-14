import React from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'

//hostname for backend -- debugging purposes
import hostname from '../assets/hostname.js';

export default function Login() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [show, setShow] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState('');
  const [modalText, setModalText] = React.useState('');

  const handleLogin = () => {
    login(username, password);
  }
  const handleCreate = () => {
    createAccount(username, password);
  }
  const handleShow = () => setShow(true);
  const handleClose = () => setShow(false);

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
          setModalTitle(data["result"]);
          setModalText(`${username} has successfully logged in`);
          if (!sessionStorage.getItem('sessionToken')) { //TODO: implement backend not allowing multiple sessions
            sessionStorage.setItem('sessionToken', data["sessionToken"]);
          }
        } else if (data["result"] === "error") {
          setModalTitle(data["result"]);
          setModalText(`The server sent back the following error: ${data["error"]}`);
        }
        handleShow();
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
      body: JSON.stringify({ username: username, password: password })
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log("Account Creation data from server: ", data);
        if (data["result"] === "success") {
          //writeToModal(data["result"], `${username}'s account has been created!`);
          setModalTitle(data["result"]);
          setModalText(`${username}'s account has been created!`);
        } else if (data["result"] === "error") {
          //writeToModal(data["result"], `The server sent back the following error: ${data["error"]}`);
          setModalTitle(data["result"]);
          setModalText(`The server sent back the following error: ${data["error"]}`);
        }
        //instructionModal.classList.add('visible');
        handleShow();
      })
      .catch(error => {
        console.error('Account creation failed: ', error);
      });
  }

  return (
    <div className='d-flex flex-column justify-content-center vh-100 bg-secondary text-center'>
      <h3>Login to save your Aesthetics and upload them to the Discovery queue</h3>
      <Form id="login-fields">
        <Form.Group controlId="username">
          <div className="col-6 mx-auto">
            <Form.Label>Username:</Form.Label>
            <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
        </Form.Group>
        <Form.Group controlId="password">
          <div className="col-6 mx-auto">
            <Form.Label>Password:</Form.Label>
            <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </Form.Group>
      </Form>
      <div id="login-buttons">
        <Button variant="primary" type="submit" id="login" onClick={handleLogin}>Login</Button>
        <Button variant="secondary" type="submit" id="create-new-account" onClick={handleCreate}>Create New Account</Button>
      </div>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalText}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}