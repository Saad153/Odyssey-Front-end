import React, { useState, useEffect } from 'react';
import { Row, Col, Spinner, Alert, Modal, Button } from 'react-bootstrap';
import axiosClient from 'apis/axiosClient';
import Router from 'next/router'
import Cookies from 'js-cookie';
import jwt_decode from 'jwt-decode'

const Login = ({sessionData}) => {

    useEffect(() => {
        if(sessionData.isLoggedIn==true){
          Router.push('/')
        }
      }, [sessionData]);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [reveal, setReveal] = useState(false);
    const [load, setLoad] = useState(false);
    const [error, setError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('Wrong username or password');
    const [showForceLoginModal, setShowForceLoginModal] = useState(false);
    const [forceLoginCreds, setForceLoginCreds] = useState({ username: '', password: '' });

    const handleForceLogin = () => {
        setLoad(true);
        setError(false);
        axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_POST_EMPLOYEE_LOGIN,{
          username: forceLoginCreds.username,
          password: forceLoginCreds.password,
          contact: '',
          force: true
        }).then((x)=>{
          if(x.data.message=='Success'){
            let token = jwt_decode(x.data.token);
            console.log(token)
            Cookies.set('token', x.data.token, { expires: 1 });
            Cookies.set('designation', token.designation, { expires: 1 });
            Cookies.set('username', token.username, { expires: 1 });
            Cookies.set('loginId', token.id, { expires: 1 });
            if(token.defaultCompanyId){
              Cookies.set('companyId', token.defaultCompanyId, { expires: 1000000000 });
            }
            setShowForceLoginModal(false);
            Router.push('/');
          }else{
            setLoad(false);
            setShowForceLoginModal(false);
            setErrorMessage('Login failed. Please try again.');
            setError(true);
          }
        }).catch((error)=>{
          setLoad(false);
          setShowForceLoginModal(false);
          setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
          setError(true);
        })
    }

    const handleSubmit = (e) =>{
        e.preventDefault(e);
        setLoad(true);
        setError(false);
        axiosClient.post(process.env.NEXT_PUBLIC_CLIMAX_POST_EMPLOYEE_LOGIN,{
          username:username,
          password:password,
          contact:''
        }).then((x)=>{
          if(x.data.message=='Success'){
            let token = jwt_decode(x.data.token);
            console.log(token)
            Cookies.set('token', x.data.token, { expires: 1 });
            Cookies.set('designation', token.designation, { expires: 1 });
            Cookies.set('username', token.username, { expires: 1 });
            Cookies.set('loginId', token.id, { expires: 1 });
            if(token.defaultCompanyId){
              Cookies.set('companyId', token.defaultCompanyId, { expires: 1000000000 });
            }
            // Cookies.set('access', JSON.stringify(token.access), { expires: 1 });
            Router.push('/');
          }else if(x.data.message=='Invalid'){
            setLoad(false);
            setErrorMessage('Wrong username or password');
            setError(true);
          }else{
            setLoad(false);
            setErrorMessage('Wrong username or password');
            setError(true);
          }
        }).catch((error)=>{
          setLoad(false);
          if(error.response?.status === 409){
            setForceLoginCreds({ username, password });
            setShowForceLoginModal(true);
          }else if(error.response?.status === 401 || error.response?.status === 400){
            setErrorMessage('Wrong username or password');
            setError(true);
          }else{
            setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
            setError(true);
          }
        })
    }

  return (
    <div className='bg-signin'>
      <Row className='my-5 py-5'>
        <Col md={6} className='p-5'>
        <img src={'/logistic vector.png'} />
        <p style={{color:'grey', fontSize:30, marginLeft:150}}>Logistics ERP System</p>
        </Col>
        <Col md={6} className='p-5'>
        <form onSubmit={handleSubmit}>
        <div style={{ textAlign:'center'}}>
          <div className='fs-65 fw-8' style={{marginBottom:'25px'}}>LOGIN</div>
          {error&&<Alert style={{marginLeft:'20%', marginRight:'20%'}} key={'danger'} variant={'danger'}>
            {errorMessage}
          </Alert>}
          <div className='mb-4'>
            <input className='login-inp' required placeholder='Enter your username...' value={username} onChange={(e)=>setUsername(e.target.value)} />
            <img src={'/username.png'} className='username-img' height={55} />
          </div>
          <div className='mt-4'>
            <input className='login-inp' placeholder='Enter your password...' required type={reveal?'text':'password'} value={password} onChange={(e)=>setPassword(e.target.value)} />
            <img src={reveal?'/pass.png':'/locked.png'} className='username-img' style={{cursor:'pointer'}} height={55} onClick={()=>setReveal(!reveal)} />
          </div>
          <div className='my-5'>
            <button type='submit' className='login-btn'>{load?<Spinner animation="border" className='mx-3' size='sm' variant="light" />:'LOGIN'}</button>
          </div>
        </div>
        </form>
        </Col>
      </Row>

      <Modal show={showForceLoginModal} onHide={() => setShowForceLoginModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>User Already Logged In</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>This account is currently logged in from another session. Do you want to force login and disconnect the other session?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowForceLoginModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleForceLogin} disabled={load}>
            {load ? <Spinner animation="border" size='sm' className='me-2' /> : ''}
            Force Login
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default Login