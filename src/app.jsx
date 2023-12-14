import React, { useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Navbar, Nav, NavDropdown, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import './app.css'

import Login from './login/login.jsx'
import Discover from './discover/discover.jsx'
import Create from './create/create.jsx'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Navbar bg="dark" variant="dark" expand="lg">
          <Navbar.Brand>SimpleAesthetic</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ml-auto">
              <NavLink className="nav-link" to='login'>Login</NavLink>
              <NavLink className="nav-link" to='create'>Create</NavLink>
              <NavLink className="nav-link" to='discover'>Discover</NavLink>
            </Nav>
          </Navbar.Collapse>
        </Navbar>

        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/discover' element={<Discover />} />
          <Route path='/create' element={<Create />} />
          <Route path='*' element={<NotFound />} />
        </Routes>

        <Navbar bg="dark" variant="dark" className="footer">
          <Container className="d-flex justify-content-center">
            <Navbar.Brand href="https://github.com/carsoncall/SimpleAesthetic">Made by Carson Call | GitHub</Navbar.Brand>
          </Container>
        </Navbar>
      </BrowserRouter>
    </>
  )
}

function NotFound() {
  return <main className='container-fluid bg-secondary text-center'>404: Return to sender. Address unknown.</main>;
}