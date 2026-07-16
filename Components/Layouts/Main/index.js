"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Row, Col } from 'react-bootstrap';
import AuditLog from './AuditLog';
import DashboardStats from './DashboardStats';
import ChartComp from './ChartComp';
import PendingInvoices from 'Components/Layouts/Dashboard/Home/Accounts';
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
    <div className="base-page-layout home-styles dashboard-home-styles">
      {/* {username == 'Saad' && <VannaChat /> } */}
      {/* <OllamaChat/> */}
      {/* {username == 'Saad' && <UploadBackUp /> } */}
      {/* <UploadBackUp /> */}
      {audit && <>
        <DashboardStats />
        <Row className="mt-2">
          <Col md={6} className="mb-3">
            <div className="wh-bg-round">
              <ChartComp type="One" />
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <div className="wh-bg-round">
              <ChartComp type="Two" />
            </div>
          </Col>
        </Row>
        <Row className="mt-2">
          <Col md={7} className="mb-3">
            <div className="wh-bg-round" style={{ height: '100%' }}>
              <PendingInvoices />
            </div>
          </Col>
          <Col md={5} className="mb-3">
            <AuditLog />
          </Col>
        </Row>
      </> }
    </div>
  );
};

export default Main;
