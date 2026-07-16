import React from "react";
import ReactToPrint from "react-to-print";
import { cleanNullParagraphs, formatPortForPrint } from './states';
import parse from "html-react-parser";
import ports from '../../../../jsonData/ports'
import moment from "moment";
import { Col, Row } from "antd";

const BlPrintImage = ({ 
    allValues,
    state,
    borders,
    heading,
    border,
    inputRef,
    stamps,
    line,
    grossWeight,
    netWeight,
    containerData,
    formE,
    cbm,
    caller,
}) => {

const gross_weight = allValues?.Container_Infos?.[0]?.gross || 0

function pTagsToString(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("p"))
    .map(p => p.textContent.trim())
    .filter(text => {
      if (!text) return false;
      const lower = text.toLowerCase();
      return lower !== "null" && lower !== "tel" && !lower.includes("tel null");
    })
    .join("\n");
}

// Safely pulls the labels for a given stamp_group, regardless of whether
// allValues.stamps is currently an array, undefined, or something else.
const getStamp = (group) =>
  (Array.isArray(allValues.stamps) ? allValues.stamps : [])
    .filter(x => x?.stamp_group === group)
    .map(x => stamps[Number(x.code) - 1]?.label);

console.log(pTagsToString(state.notifyOneContent))


    console.log(state)
    console.log(allValues)
  return (
    <>
      {/* ✅ Print orientation control */}
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          @media screen {
            #bl-print-content {
              display: none;
            }
          }

          @media print {
            #bl-print-content {
              display: block;
            }
            body {
              -webkit-print-color-adjust: exact;
            }
          }
        `}
      </style>

      {/* Print Button */}
      {caller === true && (
        <ReactToPrint
          trigger={() => (
            <div className="div-btn-custom text-center p-2 mb-2" style={{ width: '120px' }}>
              Print
            </div>
          )}
          content={() => inputRef.current}
        />
      )}

      {/* Printable Area */}
      <div
        id="bl-print-content"
        ref={inputRef}
        style={{
          width: "216.3mm",
          minHeight: "305mm",
          backgroundColor: "white",
          fontFamily: "Times New Roman, serif",
          fontSize: "3mm",
          position: 'absolute',
          // marginTop: '7mm',
          // border: '1px solid black'
        }}
      >
        {/* Printed Values */}
        <div style={{
          zIndex: 1,
          position: 'absolute',
          top: borders ? '4mm' : '7mm',
          // top: '4mm',
          left: '3mm'
        }} zIndex={1}>
          {/*Shipper*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 17 : 17}mm`, left: '5mm', width: '93mm', height: '23mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.shipperContent)}</span>
          {/*Consignee*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 48 : 47}mm`, left: '5mm', width: '93mm', height: '23mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.consigneeContent)}</span>
          {/*Notify One*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 78 : 75}mm`, left: '5mm', width: '93mm', height: '20mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.notifyOneContent)}</span>
          {/*Job No*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 10 : 11}mm`, left: '115mm', width: '35mm', height: '5mm', fontWeight: 'bold' }}>{allValues.jobNo}</span>
          {/*HBL No*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 10 : 11}mm`, left: '163mm', width: '35mm', height: '5mm', fontWeight: 'bold' }}>{allValues.hbl}</span>
            {/* <span style={{ position: 'absolute', zIndex: 1, top: '112.5mm', left: '77mm', width: '55mm', height：'5mm', fontWeight: 'bold' }}>{(() => {
                const port = ports.ports.find((x) => x.id == allValues.por);
                return port ? `${port.name}` : allValues.por;
                })()}</span> */}
          {/*Initial Place of Reciept*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 103 : 101}mm`, left: '77mm', width: '55mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
              const port = ports.ports.find((x) => x.id == allValues.por);
              return port ? formatPortForPrint(port).toUpperCase() : allValues.por?.toUpperCase();
            })()}</span>
            {/*Port of Discharge*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 103 : 101}mm`, left: '140mm', width: '55mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
              const port = ports.ports.find((x) => x.id == allValues.podTwo);
              return port ? formatPortForPrint(port).toUpperCase() : allValues.podTwo?.toUpperCase();
            })()}</span>
            {/*Vessel*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 115 : 113}mm`, left: '7mm', width: '40mm', height: '5mm', fontWeight: 'bold' }}>{allValues.vessel}</span>
            {/*Voyage*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 115 : 113}mm`, left: '50mm', width: '22mm', height: '5mm', fontWeight: 'bold' }}>{allValues.voyage}</span>
            {/*Port of Loading*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 115 : 113}mm`, left: '77mm', width: '55mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
              const port = ports.ports.find((x) => x.id == allValues.polTwo);
              return port ? formatPortForPrint(port).toUpperCase() : allValues.polTwo?.toUpperCase();
            })()}</span>
            {/*Place of Delivery*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 115 : 113}mm`, left: '140mm', width: '55mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
              const port = ports.ports.find((x) => x.id == allValues.poDeliveryTwo);
              return port ? formatPortForPrint(port).toUpperCase() : allValues.poDeliveryTwo?.toUpperCase();
            })()}</span>
            {/*CBM*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 130 : 127}mm`, left: '182mm', width: '22mm', height: '5mm', fontWeight: 'bold' }}>{!cbm && `${parseFloat(allValues.cbm).toFixed(3)} CBM`}</span>
            {/*Marks and Nos;*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 130 : 127}mm`, left: '8mm', width: '30mm', height: '45mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.marksContent)}</span>
            {/*Container Nos;*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 130 : 127}mm`, left: '40mm', width: '20mm', height: '45mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.noOfPckgs)}</span>
            {/*Container No | Size | Seal*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 176 : 173}mm`, left: '8mm', width: '50mm', height: '30mm', fontWeight: 'bold' }}>
              <span style={{ padding: 0, margin: 0, lineHeight: 1.2 }}>CONTAINER NO .SIZE SEAL</span>
              {state?.Container_Infos.slice(0, 4).map((x, i)=>{
                return(
                  <Row key={i} style={{marginBottom:2, marginTop:2}}>
                    <Col md={10}>{x.no  }</Col>
                    <Col md={4}>{x.size}</Col>
                    <Col md={3}>{x.seal}</Col>
                  </Row>
                )
              })}
              </span>
            {/*Stamp No 1*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 155 : 152}mm`, left: '182mm', width: '20mm', height: '5mm', fontWeight: 'bold', fontSize: '4mm' }}>
              {getStamp("1").join(" ")}
            </span>
            {/*Stamp No 2*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 155 : 152}mm`, left: '147mm', width: '20mm', height: '5mm', fontWeight: 'bold', fontSize: '4mm' }}>
              {getStamp("2").join(" ")}
              </span>
            {/*Stamp No 4*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 191 : 188}mm`, left: '145mm', width: '55mm', height: '10mm', fontWeight: 'bold', fontSize: '4mm' }}>
              {borders && getStamp("4").join(" ")}
              </span>
            {/*Stamp No 4 & 5*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 127 : 124}mm`, left: '63mm', width: '72mm', height: '5mm', fontWeight: 'bold', fontSize: '4mm'}}>
              {!borders && getStamp("4").join(" ")}
            </span>
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 132 : 129}mm`, left: '65mm', width: '70mm', height: '5mm', fontWeight: 'bold', fontSize: '4mm' }}>
              {borders && getStamp("5").join(" ")}
            </span>
            {/*As agent or on behalf of Carrier*/}
            {console.log("AllValues: ",allValues)}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 286 : 279}mm`, left: '134mm', width: '68mm', height: '15mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2', fontSize: '4mm' }}>
              {borders && getStamp("5")}
            </span>
              {/*Gross Weight*/}
              <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 131 : 127}mm`, left: '147mm', width: '30mm', height: '10mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>
                Gross Weight
                <br/>
                {!grossWeight && `${parseFloat(gross_weight).toFixed(3)} KGS`}
              </span>
              {/*Net Weight*/}
              <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 140 : 136}mm`, left: '147mm', width: '30mm', height: '10mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>
                Net Weight
                <br/>
                {!netWeight && `${parseFloat(allValues.net).toFixed(3)} KGS`}
              </span>
              {/*Number and kind of Packages; Description of Goods*/}
              <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 137 : 134}mm`, left: '63mm', width: '72mm', height: '65mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.descOfGoodsContent)}</span>
              {/*Freight Perpaid / Collect*/}
              <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 169 : 166}mm`, left: '145mm', width: '55mm', height: '22mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2', textAlign: 'center' }}>
                <h6 style={{ margin: 0, padding: 0 }}><b>FREIGHT {allValues.freightType == '2' ? 'PREPAID' : allValues.freightType == '1' ? 'COLLECT' : allValues.freightType.toUpperCase()}</b></h6>
              </span>
              <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 176 : 171}mm`, left: '145mm', width: '55mm', height: '22mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2', textAlign: 'center' }}>
                {"All Terminal charge/Demurrage\nEtc. at the port of discharge\nDestination as per Line's Tariff &\nAt the Account of Consignee"}
              </span>
              {/*For Delivery Please Apply to*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 269 : 261}mm`, left: '8mm', width: '85mm', height: '24mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.deliveryContent)}</span>
              {/*Freight Payable At*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 269 : 261}mm`, left: '100mm', width: '50mm', height: '9mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{allValues.freightType == '2' ? 'KARACHI, PAKISTAN' : allValues.freightType == '1' ? 'DESTINATION' : allValues.freightType.toUpperCase() == 'PREPAID' ? 'KARACHI, PAKISTAN' : 'DESTINATION'}</span>
              {/*Date and Place of Issue*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 269 : 261}mm`, left: '151mm', width: '51mm', height: '9mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>
              {[
                allValues?.issueDate ? moment(allValues.issueDate).format('DD/MMM/YYYY') : null,
                allValues?.issuePlace || null
              ].filter(Boolean).join(' | ')}
            </span>
              {/*No of Original Bills of Lading*/}
            <span style={{ position: 'absolute', zIndex: 1, top: `${!borders ? 286 : 279}mm`, left: '100mm', width: '25mm', height: '10mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{allValues.noBls}</span>
        </div>
        {console.log("State in Print Image:", border)}
        <div style={{
            display: !borders ? "none" : "block",
          }}>
            <img style={{
              position: 'absolute',
              height: 'auto',
              width: '215.9mm',
              // top: '7mm',
              left: '0mm',
              // margin: '5mm'  
              }} src={"/OriginalBl.jpg"}/>
        </div>
        
      </div>
    </>
  );
};

export default BlPrintImage;