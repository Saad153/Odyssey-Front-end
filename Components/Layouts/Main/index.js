"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- use this in Next.js 13+
import AuditLog from './AuditLog';
import UploadBackUp from './UploadBackUp';
import Cookies from 'js-cookie';
import OllamaChat from './ollama';
import jwt_decode from 'jwt-decode';

const Main = ({ sessionData }) => {
  const router = useRouter(); // get the router
  const username = Cookies.get('username');

  useEffect(() => {
    if (sessionData?.isLoggedIn == false) {
      router.push("/login"); // navigate using new router
    }
  }, [sessionData, router]);

  const ollama = async () => {
    const reply = await ollama();
    console.log(reply)
  } 

  const [ allow, setAllow ] = React.useState(false);
  const [ audit, setAudit ] = React.useState(false);

  useEffect(() => {
    if(username == 'isaadalam'){
      setAllow(true);
    }
  }, [username])
  useEffect(() => {
    let tempToken = Cookies.get('token');
    if(tempToken){
      let token = jwt_decode(tempToken);
      // console.log("Check Employee Access", token.access) 
      token.access.includes("admin") && setAudit(true);
    }
  }, [username])

  return (
    <div className="base-page-layout">
      {/* {username == 'Saad' && <VannaChat /> } */}
      {/* <OllamaChat/> */}
      {/* {username == 'Saad' && <UploadBackUp /> } */}
      {/* <UploadBackUp /> */}
      {audit && <AuditLog /> }
    </div>
  );
};

export default Main;
