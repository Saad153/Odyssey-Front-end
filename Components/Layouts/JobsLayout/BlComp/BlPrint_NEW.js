import React from "react";
import ReactToPrint from "react-to-print";
import { cleanNullParagraphs } from './states';
import parse from "html-react-parser";
import ports from '../../../../jsonData/ports'

const BlPrintNEW = ({ 
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

    
function pTagsToString(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll("p"))
    .map(p => p.textContent.trim())
    .filter(text => text && text !== "null")
    .join("\n");
}

console.log(pTagsToString(state.notifyOneContent))


    console.log(state)
  return (
    <>
      {/* ✅ Print orientation control */}
      <style>
        {`
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          @media print {
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
            <div className="div-btn-custom text-center p-2 mb-2" style={{ width: '120px'}}>
              Print
            </div>
          )}
          content={() => inputRef.current}
        />
      )}

      {/* Printable Area */}
      <div
        ref={inputRef}
        style={{
          width: "213mm",
          minHeight: "300mm",
          backgroundColor: "white",
          fontFamily: "Times New Roman, serif",
          fontSize: "3mm",
          position: 'absolute',
          padding: '7mm',
        }}
      >
        {/* Printed Values */}
        <div>
            <span style={{ position: 'absolute', top: '21mm', left: '7mm', width: '95mm', height: '23mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.shipperContent)}</span>
            <span style={{ position: 'absolute', top: '52mm', left: '7mm', width: '95mm', height: '23mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.consigneeContent)}</span>
            <span style={{ position: 'absolute', top: '82mm', left: '7mm', width: '95mm', height: '24mm', fontWeight: 'bold', whiteSpace: 'pre-line', lineHeight: '1.2' }}>{pTagsToString(state.notifyOneContent)}</span>
            <span style={{ position: 'absolute', top: '17mm', left: '117mm', width: '35mm', height: '5mm', fontWeight: 'bold' }}>{allValues.jobNo}</span>
            <span style={{ position: 'absolute', top: '17mm', left: '165mm', width: '35mm', height: '5mm', fontWeight: 'bold' }}>{allValues.hbl}</span>
            <span style={{ position: 'absolute', top: '112.5mm', left: '77mm', width: '55mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
                const port = ports.ports.find((x) => x.id == allValues.por);
                return port ? `${port.name}` : allValues.por;
            })()}</span>
            <span style={{ position: 'absolute', top: '112.5mm', left: '145mm', width: '55mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
                const port = ports.ports.find((x) => x.id == allValues.podTwo);
                return port ? `${port.name}` : allValues.podTwo;
            })()}</span>
            <span style={{ position: 'absolute', top: '123mm', left: '9mm', width: '40mm', height: '5mm', fontWeight: 'bold' }}>{allValues.vessel}</span>
            <span style={{ position: 'absolute', top: '123mm', left: '50mm', width: '22mm', height: '5mm', fontWeight: 'bold' }}>{allValues.voyage}</span>
            <span style={{ position: 'absolute', top: '123mm', left: '77mm', width: '62mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
                const port = ports.ports.find((x) => x.id == allValues.polTwo);
                return port ? `${port.name}` : allValues.polTwo;
            })()}</span>
            <span style={{ position: 'absolute', top: '123mm', left: '145mm', width: '62mm', height: '5mm', fontWeight: 'bold' }}>{(() => {
                const port = ports.ports.find((x) => x.id == allValues.poDeliveryTwo);
                return port ? `${port.name}` : allValues.poDeliveryTwo;
            })()}</span>
        </div>
        <div style={{}}>
        <h6 style={{ fontWeight: 'bold', textAlign: 'center', color: 'grey', marginTop: '2mm' }}>BILL OF LADING FOR COMBINED TRANSPORT SHIPMENT OR PORT TO PORT SHIPMENT</h6>
        <table style={{borderTop: border, width: '100%', marginTop: '2mm', height: '92mm'}}>
            <tbody>
                <tr style={{height: '10mm'}}>
                    <td rowSpan={3} style={{borderRight: border, width: '50%', padding: 0, alignContent: 'start'}}>
                        <div style={{ margin: 0, padding: 0}}>Shipper</div>
                        {/* <div style={{fontWeight: 'bold'}}>{parse(cleanNullParagraphs(state.shipperContent))}</div> */}
                    </td>
                    <td style={{ borderBottom: border, width: '50%'}}>
                        <p style={{position: 'relative', top: '-2mm', left: '2mm', margin: 0, padding: 0}}><span style={{marginRight: '40mm'}}>Ref. #</span><span style={{marginRight: '10mm'}}>B/L #</span></p>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{ width: '50%', padding: 0, alignContent: 'start', borderBottom: border}}>
                        <div style={{ marginLeft: '2.5mm', padding: 0}}>F/Agent Name & Ref. #</div>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{ width: '50%', padding: 0, alignContent: 'center', textAlign: 'center', borderBottom: border}} rowSpan={7}>
                        <img src={"/seanet-logo.png"} height={120} className="invert"/>
                        <div style={{ fontFamily: "sans-serif" }} className="fs-15"> SHIPPING & LOGISTICS</div>
                        <div className="mt-2" style={{ lineHeight: 1.3 }}>House# D-213, DMCHS, Siraj Ud Daula Road, Karachi</div>
                        <div style={{ lineHeight: 1.5 }}> Tel: {"("}92-21{")"} 34547575, 34395444, 34395444, 34395444</div>
                        <div style={{ lineHeight: 1.5 }}> Email info@seanetpk.com, URL www.seanetpk.com{" "}</div>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{borderTop: border, width: '50%', padding: 0, alignContent: 'start', borderRight: border}} rowSpan={3}>
                        <div style={{ margin: 0, padding: 0}}>Consignee or Order</div>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{borderTop: border, width: '50%', padding: 0}} rowSpan={4}>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{borderTop: border, width: '50%', padding: 0}}>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{borderBottom: border, borderTop: border, width: '50%', padding: 0, borderRight: border, alignContent: 'start'}} rowSpan={3}>
                        <div style={{ margin: 0, padding: 0}}>Notify Party / Address</div>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{borderTop: border, width: '50%', padding: 0}}>
                    </td>
                </tr>
                <tr style={{height: '10mm'}}>
                    <td style={{borderTop: border, width: '50%', padding: 0}}>
                    </td>
                </tr>
            </tbody>
        </table>
        <table style={{ width: '100%', height: '22mm' }}>
            <tbody>
                <tr style={{ borderBottom: border, height: '10mm' }}>
                    <td style={{ borderRight: border, padding: 0, alignContent: 'start', width: '33%' }}>
                        <span style={{ margin: 0, padding: 0}}>Initial Carriage (Mode)</span>
                    </td>
                    <td style={{ borderRight: border, padding: 0, alignContent: 'start', width: '33%' }}>
                        <span style={{ margin: 0, padding: 0, marginLeft: '2mm'}}>Initial Place of Receipt</span>
                    </td>
                    <td style={{ padding: 0, alignContent: 'start', width: '33%' }}>
                        <span style={{ margin: 0, padding: 0, marginLeft: '2mm'}}>Port of Discharge</span>
                    </td>
                </tr>
                <tr style={{ borderBottom: border, height: '10mm' }}>
                    <td style={{ borderRight: border, padding: 0, alignContent: 'start', width: '33%' }}>
                        <span style={{ margin: 0, padding: 0}}>Vessel and Voy</span>
                    </td>
                    <td style={{ borderRight: border, padding: 0, alignContent: 'start', width: '33%' }}>
                        <span style={{ margin: 0, padding: 0, marginLeft: '2mm'}}>Port of Loading</span>
                    </td>
                    <td style={{ padding: 0, alignContent: 'start', width: '33%' }}>
                        <span style={{ margin: 0, padding: 0, marginLeft: '2mm'}}>Place of Delivery</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <table style={{ width: '100%', tableLayout: "fixed", borderCollapse: "collapse", lineHeight: 1 }}>
            <tbody>
                <tr style={{ height: '5mm' }}>
                    <td style={{ padding: 0, alignContent: 'center', textAlign: 'center', width: '25%', borderRight: border }}>
                        <span style={{ margin: 0, padding: 0 }}>Marks and Nos; Container Nos;</span>
                    </td>
                    <td style={{ padding: 0, alignContent: 'center', textAlign: 'center', width: '47.5%', borderRight: border }}>
                        <span style={{ margin: 0, padding: 0 }}>Number and kind of Packages; Description of Goods</span>
                    </td>
                    <td style={{ padding: 0, alignContent: 'center', textAlign: 'center', width: '17.5%', borderRight: border }}>
                        <span style={{ margin: 0, padding: 0 }}>Weight (kg) of Cargo</span>
                    </td>
                    <td style={{ padding: 0, alignContent: 'center', textAlign: 'center' }}>
                        <span style={{ margin: 0, padding: 0 }}>Measurement</span>
                    </td>
                </tr>
            </tbody>
        </table>
        <span style={{ margin: 0, padding: 0, float: 'right', marginRight: '1mm', marginTop: '-1mm' }}>(cbm) of Cargo</span>
        <div style={{ width: '100%', height: '83mm' }}></div>   
        <div
        style={{
            position: "absolute",
            bottom: "82.5mm",
            left: "0",
            width: "100%",
            fontWeight: "bold",
            pointerEvents: "none", // optional, print-safe
        }}
        >
        {/* Center text across full width */}
        <div
            style={{
            position: "absolute",
            left: "0",
            width: "100%",
            textAlign: "center",
            fontSize: "3.5mm",
            bottom: '0mm',
            lineHeight: 1,
            }}
        >
            ABOVE PARTICULARS AS DECLARED BY SHIPPER
        </div>

        {/* Right-aligned text */}
        <div
            style={{
            position: "absolute",
            right: "8mm",
            textAlign: "right",
            bottom: '0mm',
            fontSize: "5mm",
            padding: 0,
            margin: 0,
            lineHeight: 1,
            }}
        >
            NON NEGOTIABLE
        </div>
        </div>
        <table style={{ width: '100%', height: '75mm', border: border }}>
            <tbody>
                <tr>
                    <td style={{ width: '50%', border: border }}>
                        <table style={{ width: '100%', height: '100%' }}>
                            <tbody>
                                <tr>
                                    <table style={{ width: '100%' }}>
                                        <tbody>
                                            <tr style={{ height: '8mm', textAlign: 'center', borderBottom: border }}>
                                                <td style={{ width: '45%', borderRight: border }}> Freight & Charges Detail</td>
                                                <td style={{ width: '27.5%', borderRight: border }}>Prepaid</td>
                                                <td style={{ width: '27.5%' }}>Collect</td>
                                            </tr>
                                            <tr style={{ height: '8mm', textAlign: 'start' }}>
                                                <td style={{ width: '45%', borderRight: border, paddingLeft: '2mm' }}>Ocean Freight</td>
                                                <td style={{ width: '27.5%', borderRight: border }}></td>
                                                <td style={{ width: '27.5%' }}></td>
                                            </tr>
                                            <tr style={{ height: '8mm', textAlign: 'start' }}>
                                                <td style={{ width: '45%', borderRight: border, paddingLeft: '2mm' }}>Port of Loading Charges</td>
                                                <td style={{ width: '27.5%', borderRight: border }}></td>
                                                <td style={{ width: '27.5%' }}></td>
                                            </tr>
                                            <tr style={{ height: '8mm', textAlign: 'start' }}>
                                                <td style={{ width: '45%', borderRight: border, paddingLeft: '2mm' }}>Port of Discharge Charges</td>
                                                <td style={{ width: '27.5%', borderRight: border }}></td>
                                                <td style={{ width: '27.5%' }}></td>
                                            </tr>
                                            <tr style={{ height: '8mm', textAlign: 'start', borderBottom: border }}>
                                                <td style={{ width: '45%', borderRight: border, paddingLeft: '2mm' }}>Inland Charges</td>
                                                <td style={{ width: '27.5%', borderRight: border }}></td>
                                                <td style={{ width: '27.5%' }}></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div style={{ padding: '1mm' }}>
                                        For Delivery Please Apply to:
                                    </div>
                                </tr>
                                <tr></tr>
                            </tbody>
                        </table>
                    </td>
                    <td style={{ alignContent: 'start' }}>
                        <div style={{ height: '40mm', borderBottom: border, padding: '1mm' }}>
                            {/* <img src={"/disclaimer.PNG"} width={"100%"} /> */}                      
                        <span
                        style={{
                            display: "block",        // ✅ CRITICAL
                            fontSize: "2.5mm",
                            lineHeight: "2.7mm",     // ✅ explicit units
                            textAlign: "justify",
                        }}
                        >
                        RECEIVED by the Carrier the Goods as specified above in apparent good order
                        and condition unless otherwise stated, to be transported to such place as
                        agreed, authorised or permitted herein and subject to all the terms and
                        conditions appearing on the front and reverse of this Bill of Lading, any local Privileges and customs not withstanding.
                        </span>
                        <span
                        style={{
                            display: "block",        // ✅ CRITICAL
                            fontSize: "2.5mm",
                            lineHeight: "2.7mm",     // ✅ explicit units
                            textAlign: "justify",
                            marginTop: '1.5mm'
                        }}
                        >
                        The Particulars given above as stated by the shipper and the weight, measure, quantity, condition, contents and value of the Goods are unknown to the Carrier.
                        </span>
                        <span
                        style={{
                            display: "block",        // ✅ CRITICAL
                            fontSize: "2.5mm",
                            lineHeight: "2.7mm",     // ✅ explicit units
                            textAlign: "justify",
                        }}
                        >
                            in WITNESS WHEREOF, the number of Origins stated below have been issued, one of which being accomplished and the other(S) to be void.
                        </span>
                        <span
                        style={{
                            display: "block",        // ✅ CRITICAL
                            fontSize: "2.5mm",
                            lineHeight: "2.7mm",     // ✅ explicit units
                            textAlign: "justify",
                            marginTop: '1.5mm'
                        }}
                        >
                            LAW AND JURISDICATION CLAUSE
                        </span>
                        <span
                        style={{
                            display: "block",        // ✅ CRITICAL
                            fontSize: "2.5mm",
                            lineHeight: "2.7mm",     // ✅ explicit units
                            textAlign: "justify",
                        }}
                        >
                            The Contract evidenced by or contained in this Bill of Lading is governed by the law of Pakistan and any claim or dispute arising hereunder or in connection herewith shall (without prejudice to the Carrier's right to commence proceeding in any other jurisdication) be subject to the jurisdication of the Courts of Pakistan.
                        </span>
                        </div>
                        <div style={{ height: '17.5mm', borderBottom: border, display: 'flex' }}>
                            <div style={{ width: '50%', height: '100%', borderRight: border, paddingLeft: '1mm' }}>Freight payable at</div>
                            <div style={{ height: '100%', paddingLeft: '1mm' }}>Date and Place of issue</div>
                        </div>
                        <div style={{ height: '17.5mm', borderBottom: border, display: 'flex' }}>
                            <div style={{ width: '30%', height: '100%', borderRight: border, paddingLeft: '1mm' }}>Number of Original Bills of Lading</div>
                            <div style={{ height: '100%', paddingLeft: '1mm' }}>As agent or on behalf of Carrier</div>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
        </div>
        
      </div>
    </>
  );
};

export default BlPrintNEW;
