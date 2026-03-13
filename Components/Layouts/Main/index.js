"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // <-- use this in Next.js 13+
import VannaChat from './VannaChat';
import UploadBackUp from './UploadBackUp';
import Cookies from 'js-cookie';
import OllamaChat from './ollama';

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


  return (
    <div className="base-page-layout">
      {/* {username == 'Saad' && <VannaChat /> } */}
      {/* <OllamaChat/> */}
      {/* {username == 'Saad' && <UploadBackUp /> } */}
      {/* <UploadBackUp /> */}
    </div>
  );
};

export default Main;
