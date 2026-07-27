import React, { useEffect } from 'react'
import { Col, Row } from "react-bootstrap";
import parse from "html-react-parser";
import ReactToPrint  from "react-to-print";
import { cleanNullParagraphs, formatPortForPrint } from './states';
import ports from '../../../../jsonData/ports'
import moment from 'moment';

const BlPrint = ({ caller, allValues, state, borders, heading, border, inputRef, stamps, line, grossWeight, netWeight,  containerData, formE, cbm}) => {
  const gross_weight = allValues?.Container_Infos?.[0]?.gross || 0

  return (
    <div style={{width: '10%', marginBottom: '10px'}}>
    <style>{`
      @media print {
        @page {
          size: auto;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
        .bl-section-container {
          page-break-after: auto;
        }
        .bl-description-section {
          page-break-inside: auto;
          orphans: 3;
          widows: 3;
        }
        .bl-fixed-section {
          page-break-before: avoid;
          page-break-inside: avoid;
        }
      }
    `}</style>
    {caller == true &&  <ReactToPrint
      content={() => inputRef}
      trigger={() => (<div className="div-btn-custom text-center p-2">Print</div>)}
    />}
    <div
      style={{
        width: "100%",
        border: "1px solid #000",
        boxSizing: "border-box",
        padding: "0mm",
        position: 'absolute',
        marginBottom: '10px',
        ...( caller ? { display: "none" } : {} )
      }}
    >
      <div style={{padding: '0', margin: '0'}} ref={(response) => (inputRef = response)}>
        <Row className="px-5" style={{ fontFamily: "serif", paddingTop: '10mm' }}>
          <Col md={12}>
            <div className="text-center fw-6 grey-txt" style={{ lineHeight: '3mm' }}>
              {borders?<>BILL OF LADING FOR COMBINED TRANSPORT SHIPMENT OR PORT TO PORT</>:<span style={{color:'white'}}>asd</span>}
            </div>
          </Col>
          {/* Bill of loading */}
          <Col md={12} style={{ borderTop: border }} className="fs-11">
            {/* 1st row  */}
            <Row>
              {/* 1st row left side block  */}
              <Col md={6} className="px-0 ">
                <div style={{ borderBottom: border, height: '30mm' }}>
                  <div className={`fw-5 ${heading}`} style={{ lineHeight:1.3 }}>
                    Shipper
                  </div>
                  <div className="bl-print mt-2">{parse(cleanNullParagraphs(state.shipperContent))}</div>
                </div>
                <div style={{ borderBottom: border, height: '30mm', position:"relative" }}>
                  <div className={`fw-5 ${heading}`} style={{ lineHeight:1.2 }}>Consignee Or Order</div>
                  <div className="bl-print" style={{marginTop:2}}>{parse(cleanNullParagraphs(state.consigneeContent))}</div>
                  <div className="bl-print" style={{position:"absolute", top:"75px", width: "250px"  }}> <b>  {!formE && allValues.formE ? `FORM E NUMBER : ${allValues.formE}`:null}</b> </div>
                  <div className="bl-print" style={{position:"absolute", top:"75px", left:"250px"  }}>
                    <b> {!formE && allValues.formEDate._i ? `DATE : ${allValues.formEDate._i?.slice(0, 10)}`:null}</b> 
                  </div>
                </div>
                <div className="pb-2" style={{ height: '30mm' }}>
                  <div className={`fw-5  ${heading}`} style={{ lineHeight:1.2}}>Notify Party / Address</div>
                  <div className="bl-print" style={{marginTop:5}}>{parse(cleanNullParagraphs(state.notifyOneContent))}</div>
                </div>
              </Col>
              {/*1st row right side block  */}
              <Col md={6} style={{ borderLeft: border }} className="px-0">
                <div style={{ borderBottom: border, height: '10mm' }} className="pb-3 px-2">
                  <span>
                    <span className={` ${heading}`}>Ref. # </span>
                    <span className="fw-7">{allValues.jobNo}</span>
                  </span>
                  <span className="mx-5 px-4">
                    <span className={` ${heading}`}>B/L # </span>
                    <span className="fw-7">{allValues.hbl}</span>
                  </span>
                </div>
                <div style={{ borderBottom: border, height: '10mm' }} className="pb-3 px-2">
                  <span>
                    <span className={` ${heading}`}> F/Agent Name & Ref. #{" "}</span>
                    <span className="fw-7"></span>
                  </span>
                </div>
                <div className="pb-2 text-center" style={{ paddingTop: "3%", height: '60mm' }}>
                  {borders?(
                    <div className="grey-txt">
                      <img src={"/seanet-logo.png"} height={120} className="invert"/>
                      <div style={{ fontFamily: "sans-serif" }} className="fs-15"> SHIPPING & LOGISTICS</div>
                      <div className="mt-2" style={{ lineHeight: 1.3 }}>House# A230, PECHS, Block 2,  Karachi</div>
                      <div style={{ lineHeight: 1.5 }}> Tel: {"("}92-21{")"} 34547575, 34395444, 34395444, 34395444</div>
                      <div style={{ lineHeight: 1.5 }}> Email info@seanetpk.com, URL www.seanetpk.com{" "}</div>
                    </div>
                  ):("")}
                </div>
              </Col>
            </Row>
            {/* 1st row ends*/}
            {/* 2nd row starts  */}
            <Row style={{ borderTop: border, height: '10mm' }}>
              <Col style={{ borderRight: border }} className="px-0">
                <div style={{ height: 10 }}>
                  <div className={` ${heading}`}>
                    Initial Carriage {"("}Mode{")"}
                  </div>
                </div>
              </Col>
              <Col style={{ borderRight: border }} className="px-0">
                <div  className="px-1">
                  <div className={` ${heading}`}>Initial Place Of Reciept</div>
                  <div className="fw-7" style={{marginTop: 5, marginBottom: 5, marginLeft: 15}}>
                    {(() => {
                      const port = ports.ports.find((x) => x.id == allValues.por);
                      return port ? formatPortForPrint(port) : allValues.por;
                    })()}
                  </div>
                </div>
              </Col>
              <Col className="px-0">
                <div  className="px-1">
                  <div className={` ${heading}`}>Port Of Discharge</div>
                  {/* <div className="fw-7" style={{marginTop:10}}>{ports.ports.filter((x)=>x.id==allValues.podTwo)[0]?.name || allValues.podTwo}</div> */}
                  <div className="fw-7" style={{marginTop: 5, marginBottom: 5, marginLeft: 15}}>
                    {(() => {
                      const port = ports.ports.find((x) => x.id == allValues.podTwo);
                      return port ? formatPortForPrint(port) : allValues.podTwo;
                    })()}
                  </div>
                </div>
              </Col>
            </Row>
            {/* 3rt row starts  */}
            <Row style={{ borderTop: border, height: '10mm' }}>
              <Col style={{ borderRight: border }} className="px-0">
                <div style={{ height: 42 }}>
                  <div className={` ${heading}`}>Vessel and Voyage</div>
                  <div className="fw-7" style={{marginTop:10}}>
                    <span className="fw-7">{allValues.vessel}</span>
                    <span className="mx-4"></span>
                    <span className="fw-7">{allValues.voyage}</span>
                  </div>
                </div>
              </Col>
              <Col style={{ borderRight: border }} className="px-0">
                <div  className="px-1">
                  <div className={` ${heading}`}>Port Of Loading</div>
                  {/* <div className="fw-7" style={{marginTop:10}}>{ports.ports.filter((x)=>x.id==allValues.polTwo)[0]?.name || allValues.polTwo}</div> */}
                  <div
                    className="fw-7"
                    style={{ marginTop: 5, marginBottom: 5, marginLeft: 15 }}
                  >
                    {(() => {
                      const port = ports.ports.find((x) => x.id == allValues.polTwo);
                      return port ? formatPortForPrint(port) : allValues.polTwo;
                    })()}
                  </div>
                </div>
              </Col>
              <Col className="px-0">
                <div style={{ height: 35 }} className="px-1">
                  <div className={` ${heading}`}>Place Of Delivery</div>
                  {/* <div className="fw-7" style={{marginTop:10}}>{ports.ports.filter((x)=>x.id==allValues.poDeliveryTwo)[0]?.name || allValues.poDeliveryTwo}</div> */}
                  <div className="fw-7" style={{marginTop: 5, marginBottom: 5, marginLeft: 15}}>
                    {(() => {
                      const port = ports.ports.find((x) => x.id == allValues.poDeliveryTwo);
                      return port ? formatPortForPrint(port) : allValues.poDeliveryTwo;
                    })()}
                  </div>
                </div>
              </Col>
            </Row>
            {/* 4th row starts - Description section with flexible height for page breaks */}
            <div style={{ minHeight: '85mm', pageBreakInside: 'auto' }}>
              <Row style={{ borderTop: border, minHeight: '10mm' }}>
                <Col style={{ borderRight: border, maxHeight: 5, minWidth: 170, maxWidth: 170 }} className="px-0">
                  <div style={{ height: 42 }}>
                    <div className={` ${heading} text-center`}>
                      Marks and Nos; Container Nos;
                    </div>
                  </div>
                </Col>
                <Col style={{ borderRight: border, maxHeight: 5, minWidth: 340, maxWidth: 340}} className="px-0">
                  <div style={{ height: 42 }} className="px-1">
                    <div className={` ${heading} text-center`}>
                      Number And Kind Of Packages; Description of Goods
                    </div>
                  </div>
                </Col>
                <Col className="px-0" style={{ borderRight: border, maxHeight: 5, minWidth: 130, maxWidth: 130 }}>
                  <div style={{ height: 42 }} className="px-1">
                    <div className={` ${heading} text-center`}>
                      `Weight (kg) of Cargo`
                    </div>
                  </div>
                </Col>
                <Col className="px-0" style={{ maxWidth: 90, maxHeight: 5 }}>
                  <div style={{ height: 42 }} className="px-1">
                    <div className={` ${heading} text-center`} style={{ lineHeight: 1 }}>
                      `Measurement (cbm) of Cargo`
                    </div>
                  </div>
                </Col>
              </Row>
              {/* 5th row  */}
              <Col className="bl-description-section">
                <Col style={{ display: "flex", color:"black", fontWeight:"600", marginTop:10 }}>
                  <Col md={2}>
                    <div className="bl-print" >{parse(cleanNullParagraphs(state.marksContent))}</div>
                    </Col>
                  <Col md={2}>{cleanNullParagraphs(state.noOfPckgs)}</Col>
                  <Col md={4} style={{ overflowWrap: 'break-word', wordBreak: 'break-word', pageBreakInside: 'auto' }}>
                      <div className="bl-print" >
                        {allValues.stamps?.length>0 && allValues.stamps.map((x)=> x?.stamp_group == "4"?stamps[Number(x.code)-1].label:"")}{parse(cleanNullParagraphs(state.descOfGoodsContent))}
                      </div>
                  </Col>
                  <Col md={1}></Col>
                  <Col md={2} style={{ fontWeight: "bold" }}>
                    <div >
                    <span>{!grossWeight && `${parseFloat(gross_weight).toFixed(3)} KGS`} </span> <br /> <br />

                    <span style={{ marginTop: "15px" }}>Net Weight:</span><br /> 
                    <span>{!netWeight &&  `${parseFloat(allValues.net).toFixed(3)} KGS`}</span> 
                    <div style={{ display: "flex", flexDirection: "column", marginTop: "15px"}}>
                      {console.log("Stamps:", allValues.stamps)}
                      <span style={{position: 'absolute'}}>
                        {allValues.stamps
                          ?.filter(x => x.stamp_group === "1" || x.stamp_group === "2")
                          .map((x, i) => (
                            <span key={i} style={{ marginRight: "60px" }}>
                              {stamps[Number(x.code) - 1]?.label}
                            </span>
                          ))
                        }
                      </span>
                      {/* <span>
                        {allValues.stamps?.length > 0 &&
                          allValues.stamps
                            .filter(x => x.stamp_group == "2" || x.stamp_group == "1")
                            .map(x => stamps[Number(x.code) - 1]?.label)
                            .join(" ")}
                      </span> */}
                      {/* <span>
                      {allValues.stamps?.length > 0 &&
                        allValues.stamps
                          .filter(x => x?.stamp_group == "1")
                          .map(x => stamps[Number(x.code) - 1]?.label)
                          .join(" ")}
                    </span> */}
                    </div>
                    </div>
                  </Col>
                  <Col md={2} style={{ fontWeight: "bold" }}>
                  <div >
                    {!cbm && `${parseFloat(allValues.cbm).toFixed(3)} CBM`}

                  </div>
                  </Col>
                </Col>
                <Col style={{ display: "flex", justifyContent: "space-between", marginTop: "20px"}} className="bl-fixed-section">
                  <Col md={3} className="bl-print" style={{marginTop: "50px"}} >
                    <p className="bl-print" style={{  borderBottom: border }}>CONTAINER NO .SIZE SEAL</p>
                    { !containerData &&
                      <p className="bl-print" style={{ color:"black" }}>
                        {state?.Container_Infos.slice(0, 4).map((x, i)=>{
                          return(
                            <Row key={i} style={{marginBottom:2, marginTop:2}}>
                              <Col md={5}>{x.no  }</Col>
                              <Col md={2}>{x.size}</Col>
                              <Col md={3}>{x.seal}</Col>
                            </Row>
                          )
                        })}
                    </p>
                    }
                  </Col>
                  <Col md={3} className="bl-print" style={{ textAlign: "center", width:"150px", marginBottom: "40px" }} >
                    <p style={{marginBottom:"15px", fontSize:"13px", color:"black", fontWeight:"600"}}>FREIGHT {  allValues.freightType?.toUpperCase()}</p>
                    <p style={{ fontStyle: "italic", marginBottom:"15px" }}>
                      All Terminal charge/Demurrage Etc. at the port of
                      discharge Destination as per Line’s Tariff & At the
                      Account of Consignee
                    </p>
                  <div style={{ color: "black", fontWeight: "600", fontSize: "12px" }}>
                    {allValues.stamps?.length > 0 &&
                      allValues.stamps
                        .filter(x => x?.stamp_group == "3")
                        .map(x => stamps[Number(x.code) - 1]?.label)
                        .join(" ")}
                  </div>
                  </Col>
                </Col>
              </Col>
            </div>
          </Col>
          {/* Bill of loading ends here */}
        </Row>
            {/* PARTICULARS blocks start here  */}
        <div style={{ position: "relative", height: '5mm'}}>
          <Row style={{ fontFamily: "serif" }}>
            <Col md={3}></Col>
            <Col md={6} className={`bl-print  ${heading} text-center fs-13 fw-7`}>
              <div>ABOVE PARTICULARS AS DECLARED BY SHIPPER</div>
            </Col>
            <Col md={3}>
              <div className={`${heading} fw-8 fs-19`} style={{ position: "relative", bottom: 5, right: 20 }}>NON NEGOTIABLE{" "}</div>
            </Col>
          </Row>
        </div>
        {/* 1st row starts */}
        <Row style={{ paddingLeft: 37, paddingRight: 37, fontFamily: "serif", height: '45mm' }}>
          <Col style={{ margin: 0, border: border, padding: 0, maxWidth: "46%" }}>
            <Row style={{ position: "relative", left: 10 }}>
              <Col style={{ maxWidth: "48%", margin: 0, borderRight: border, paddingTop: 7, paddingBottom: 3 }} className={` ${heading} fs-12 text-center`}>
                Freight & Charges
              </Col>
              <Col style={{ maxWidth: "22%", margin: 0, borderRight: border, paddingTop: 7, paddingBottom: 3}} className={` ${heading} fs-12 text-center`}>
                Prepaid
              </Col>
              <Col style={{ maxWidth: "30%", margin: 0, paddingTop: 7, paddingBottom: 3 }} className={` ${heading} fs-12 px-4`}>
                Collect
              </Col>
            </Row>
            <div style={{ height: 1, width: "100%", backgroundColor: line }}></div>
            <Row style={{ position: "relative", left: 10 }}>
              <Col style={{ maxWidth: "48%", margin: 0, borderRight: border, paddingTop: 7, paddingBottom: 3 }} className={` ${heading} fs-12`}>
                <div className="mb-3">Ocean Freight</div>
                <div className="my-3">Port Of Loading Charges</div>
                <div className="my-3">Port Of Discharge Charges</div>
                <div className="mt-3 mb-1">Inland Charges</div>
              </Col>
              <Col style={{ maxWidth: "22%", margin: 0, borderRight: border, paddingTop: 7, paddingBottom: 3}} className={` ${heading} fs-12 text-center`}></Col>
              <Col style={{ maxWidth: "30%", margin: 0, paddingTop: 7, paddingBottom: 3 }} className={` ${heading} fs-12 px-4`}></Col>
            </Row>
          </Col>
          <Col style={{ margin:0, border:border, borderLeft:"none", maxWidth:"54%", paddingLeft:1, paddingRight:1, paddingTop:0, paddingBottom:5 }}>
            {borders && <img src={"/disclaimer.PNG"} width={"100%"} />}
          </Col>
        </Row>
        {/* second row  */}
        <Row style={{ paddingLeft: 37, paddingRight: 37, fontFamily:"serif", height: '35mm'}}>
          <Col style={{ margin: 0, borderBottom: border, borderLeft: border, borderRight: border, maxWidth: "46%"}}>
            <div className={`${heading} fs-12`}>For Delivery Please Apply to: </div>
            <div style={{fontSize:10, lineHeight:1}}><b>{parse(cleanNullParagraphs(state.deliveryContent))}</b></div>
          </Col>
          <Col style={{ margin:0, borderRight: border, borderBottom: border, borderLeft: "none", maxWidth: "54%", paddingLeft: 1, paddingRight: 1, paddingTop: 0, paddingBottom: 5}}>
            <Row style={{ position:"relative", left:10 }}>
              <Col style={{ margin:0, borderRight:border, paddingBottom:3, height:52 }} className={` ${heading} fs-12`}>
                <div>Freight Payable at</div>
                <div style={{ color: "black" }} className="fw-7">
                  {allValues.freightPaybleAt=="DJDST"?"Destination":allValues.freightPaybleAt}
                </div>
              </Col>
              <Col style={{ margin:0, paddingBottom:3 }} className={`${heading} fs-11`}>
                Date & Place of issue
                <p  style={{color:'black', margin: '0px'}}><b>{moment(allValues?.issueDate).format('DD/MMM/YYYY') + " | " + allValues.issuePlace}</b></p>
              </Col>
            </Row>
            <div style={{ height: 1, width: "100%", backgroundColor: line }}></div>
            <Row>
              <Col md={4} style={{ margin: 0, borderRight: border, paddingBottom: 3, height: 68 }} className={` ${heading} fs-12`}>
                <div style={{ lineHeight: 1 }} className="mt-1 mx-2">
                  No Of Original Bills Of Lading<br/><b>{allValues.noBls} </b>
                </div>
              </Col>
              <Col style={{ margin: 0, paddingBottom: 3 }} className={`${heading} fs-12`}>
                <div style={{ lineHeight: 1 }} className="mt-1">
                  As Agent or on behalf or Carrier<br />
                  {allValues.stamps
                    ?.filter(x => x.stamp_group === "5")
                    .map(x => stamps[Number(x.code) - 1]?.label)
                  }
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
        {/* attach sheets part  */}
        {(state.marksContentTwo?.length>35 || state.descOfGoodsContentTwo?.length>35 || state?.Container_Infos?.length>4) 
        &&
        <div className='mt-5'>
        <Row style={{ fontFamily: "serif", paddingTop: 53 }} className='px-4'>
          <Col md={6}><div className='fs-45 stretch-y'><b>ATTACH SHEET</b></div></Col>
          <Col md={6}><span className="fw-7 px-5"><b>B/L NO: {allValues.hbl}</b></span></Col>
        </Row>
        <Row style={{ fontFamily: "serif", paddingTop: 33 }} className='px-4'>
          {state.marksContentTwo?.length>35 &&
          <Col md={4} className="fs-11">
              <p className="bl-print mb-2" style={{  borderBottom: border }}>MARKS & CONTAINER NO {"(Continued)"}</p>
              <div className="bl-print" style={{color:'black'}}>{parse(cleanNullParagraphs(state.marksContentTwo))}</div>
          </Col>
          }
          {state.descOfGoodsContentTwo?.length>35 &&
          <Col md={4} className="fs-11">
              <p className="bl-print mb-2" style={{  borderBottom: border }}>DESCRIPTION {"(Continued)"}</p>
              <div className="bl-print" style={{color:'black'}}>{parse(cleanNullParagraphs(state.descOfGoodsContentTwo))}</div>
          </Col>
          }
        </Row>
        {(!containerData && state.Container_Infos?.length>4) &&
        <Row style={{ fontFamily: "serif", paddingTop: 33 }} className='px-4'>
          <Col md={4} className="bl-print" style={{marginTop: "60px"}} >
            <p className="bl-print mb-2" style={{  borderBottom: border }}>CONTAINER NO .SIZE SEAL</p>
            <p className="bl-print" style={{ color:"black" }}>
              {state?.Container_Infos.slice(4).map((x, i)=>{
              return(
                <Row key={i} style={{marginBottom:2, marginTop:2}}>
                  <Col md={5}>{x.no  }</Col>
                  <Col md={2}>{x.size}</Col>
                  <Col md={3}>{x.seal}</Col>
                </Row>
              )})}
            </p>
            </Col>
            </Row>
          }
        </div>
        }
      </div>
    </div>
    </div>
  )
}

export default BlPrint
