"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // <-- use this in Next.js 13+
import AuditLog from './AuditLog';
import UploadBackUp from './UploadBackUp';
import Cookies from 'js-cookie';
import OllamaChat from './ollama';
import jwt_decode from 'jwt-decode';

const Main = ({ sessionData, chartData }) => {
  const router = useRouter(); // get the router
  const username = Cookies.get('username');

  useEffect(() => {
    if (!sessionData?.isLoggedIn) {
      router.push("/login"); // navigate using new router
    }
    // const ws = new WebSocket("http://localhost:8000/api/vanna/v2/chat_websocket");
    // ws.onopen = () => console.log("connected");
    // ws.onmessage = (msg) => console.log("message", msg.data);
    // ws.onerror = (err) => console.log("error", err);
    // ws.onclose = () => console.log("closed");
  }, [sessionData, router]);

  const ollama = async () => {
    const reply = await ollama();
    console.log(reply)
  } 

  const [ allow, setAllow ] = React.useState(false);
  const [ audit, setAudit ] = React.useState(false);

  useState(() => {
    if(username == 'isaadalam'){
      setAllow(true);
    }
  })
  useState(() => {
    let tempToken = Cookies.get('token');
    if(tempToken == Cookies.get('token')){
      let token = jwt_decode(tempToken);
      console.log("Check Employee Access", token.access) 
      token.access.includes("admin") && setAudit(true);
    }
  })

  return (
    <div className="base-page-layout">
      {/* {username == 'Saad' && <VannaChat /> } */}
      {/* <OllamaChat/> */}
      {/* {username == 'Saad' && <UploadBackUp /> } */}
      {allow &&<UploadBackUp />}
      {audit && <AuditLog /> }
    </div>
  );
};

export default Main;
