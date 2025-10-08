import React, { useEffect, useState } from 'react';
import { Col, Row, Table } from "react-bootstrap";
import numToWords from '/functions/numToWords';
import Cookies from 'js-cookie';
import moment from 'moment';

const Print = ({ compLogo, voucherData }) => {

  const [ debitTotal, setDebitTotal ] = useState(null);
  const [creditTotal, setCreditTotal] = useState(null);
  const paraStyles = { lineHeight: 1.2, fontSize: 11 };

  const heading = { lineHeight: 1, fontSize: 11, fontWeight: '800', paddingBottom: 5 };
  const border = "1px solid black";

  const Line = () => <div style={{ backgroundColor: "grey", height: 1, position: 'relative', top: 12 }}></div>
  const fomratedDate = moment(voucherData?.createdAt).format("DD-MM-YYYY");
  const formattedDate = moment(voucherData?.chequeDate).format("DD-MM-YYYY");
//   const narration = voucherData.Voucher_Heads[0].accountType == 'payAccount'? voucherData.Voucher_Heads[0].narration : voucherData.Voucher_Heads[1].narration
//   console.log("Data:", voucherData.Voucher_Heads[0].accountType == 'payAccount'? voucherData.Voucher_Heads[0].narration : voucherData.Voucher_Heads[1].narration);
  const commas = (a) => a < 1 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ");
  let debitSum = 0;
  let creditSum = 0;

  const calculateTotal = () => {
    const { Voucher_Heads } = voucherData;
    Voucher_Heads?.forEach((x) => {
      if (x.type == "debit") {
        debitSum += parseFloat(x.amount);
      } else {
        creditSum += parseFloat(x.amount)
      }
      setDebitTotal(debitSum);
      setCreditTotal(creditSum);
    });
  };

  console.log(voucherData)
  // useEffect(() => {
  //     console.log(voucherData)
  // }, []);

  useEffect(() => {
    calculateTotal();
  }, [voucherData])

  return (
    <div className='pb-5 px-5 pt-4'>
      <Row>
        <Col md={4} className='text-center'>
          {compLogo == "1" &&
            <>
              <img src={'/seanet-logo.png'} style={{ filter: `invert(0.5)` }} height={100} />
              <div>SHIPPING & LOGISTICS</div>
            </>
          }
          {compLogo == "3" &&
            <>
              <img src={'/aircargo-logo.png'} style={{ filter: `invert(0.5)` }} height={100} />
            </>
          }
        </Col>
        <Col className='mt-4'>
          <div className='text-center '>
            <div style={{ fontSize: 20 }}><b>{compLogo == "1" ? "SEA NET SHIPPING & LOGISTICS" : "AIR CARGO SERVICES"}</b></div>
            <div style={paraStyles}>House# D-213, DMCHS, Siraj Ud Daula Road, Karachi</div>
            <div style={paraStyles}>Tel: 9221 34395444-55-66   Fax: 9221 34385001</div>
            <div style={paraStyles}>Email: {compLogo == "1" ? "info@seanetpk.com" : "info@acs.com.pk"}   Web: {compLogo == "1" ? "www.seanetpk.com" : "www.acs.com.pk"}</div>
            <div style={paraStyles}>NTN # {compLogo == "1" ? "8271203-5" : "0287230-7"}</div>
          </div>
        </Col>
      </Row>
      <Row className='my-2'>
        <Col md={4}><Line /></Col>
        <Col md={4}>
          <div className='text-center fs-15' style={{ whiteSpace: 'nowrap' }}>
            <strong>
            {voucherData.vType == "SI" ?
              "Settlemen Inovice" :
              voucherData.vType == "PI" ?
                "Payble Inovice" :
                voucherData.vType == "JV" ?
                  "General Voucher" :
                  voucherData.vType == "BPV" ?
                    "Bank Payment Voucher" :
                    voucherData.vType == "BRV" ?
                      "Bank Recieve Voucher" :
                      voucherData.vType == "CRV" ?
                        "Cash Recieve Voucher" :
                        voucherData.vType == "CPV" ?
                          "Cash Payment Voucher" :
                          "Undefined Type"
            }
            </strong>
          </div>
        </Col>
        <Col md={4}><Line /></Col>
      </Row>
      <Row className="my-2">
        <Col md={4}>
            <div style={{ display: "flex", alignItems: "center" }}>
            <label
                className="font-bold fs-10"
                style={{ width: "100px", marginRight: "8px", whiteSpace: "nowrap" }}
            >
                Voucher #:
            </label>
            <input
                readOnly
                type="text"
                className="border-top-0 border-start-0 border-end-0 fs-10"
                style={{
                outline: "none",
                width: "100%",
                padding: 0,
                margin: 0,
                textAlign: "center",
                }}
                value={voucherData.voucher_Id}
            />
            </div>
        </Col>

        <Col md={4}>
            <div style={{ display: "flex", alignItems: "center" }}>
            <label
                className="font-bold fs-10"
                style={{ width: "100px", marginRight: "8px", whiteSpace: "nowrap" }}
            >
                Source No #:
            </label>
            <input
                readOnly
                type="text"
                className="border-top-0 border-start-0 border-end-0 fs-10"
                style={{
                outline: "none",
                width: "100%",
                padding: 0,
                margin: 0,
                textAlign: "center",
                }}
                value={voucherData.sourceNo || ""}
            />
            </div>
        </Col>

        <Col md={4}>
            <div style={{ display: "flex", alignItems: "center" }}>
            <label
                className="font-bold fs-10"
                style={{ width: "100px", marginRight: "8px", whiteSpace: "nowrap" }}
            >
                Date:
            </label>
            <input
                readOnly
                type="text"
                className="border-top-0 border-start-0 border-end-0 fs-10"
                style={{
                outline: "none",
                width: "100%",
                padding: 0,
                margin: 0,
                textAlign: "center",
                }}
                value={formattedDate}
            />
            </div>
        </Col>
        </Row>

        <Row className="my-2">
        <Col md={4}>
            <div style={{ display: "flex", alignItems: "center" }}>
            <label
                className="font-bold fs-10"
                style={{ width: "100px", marginRight: "8px", whiteSpace: "nowrap" }}
            >
                Cheque No:
            </label>
            <input
                readOnly
                type="text"
                className="border-top-0 border-start-0 border-end-0 fs-10"
                style={{
                outline: "none",
                width: "100%",
                padding: 0,
                margin: 0,
                textAlign: "center",
                }}
                value={voucherData.chequeNo || ""}
            />
            </div>
        </Col>

        <Col md={4}></Col>

        <Col md={4}>
            <div style={{ display: "flex", alignItems: "center" }}>
            <label
                className="font-bold fs-10"
                style={{ width: "100px", marginRight: "8px", whiteSpace: "nowrap" }}
            >
                Cheque Date:
            </label>
            <input
                readOnly
                type="text"
                className="border-top-0 border-start-0 border-end-0 fs-10"
                style={{
                outline: "none",
                width: "100%",
                padding: 0,
                margin: 0,
                textAlign: "center",
                }}
                value={formattedDate}
            />
            </div>
        </Col>
        </Row>

      <Row className='my-2'>
        <Col md={12}>
            <Row>
                <Col md={1}>
                    <label className=' mt-2 font-bold fs-10'>Pay to:</label>
                </Col>
                {/* {console.log(voucherData)} */}
            <input
                readOnly
                style={{ outline: "none", width: "90%" }}
                type='text'
                className='border-top-0 border-start-0 border-end-0 fs-10'
                defaultValue={voucherData?.Voucher_Heads?.length>1? voucherData.Voucher_Heads[0]?.accountType == 'payAccount'? voucherData.Voucher_Heads[0].narration : voucherData.Voucher_Heads[1].narration: ""}
            />
            </Row>
        </Col>
      </Row>
      <Row>
            <Col md={12}>
                <Row>
                    
                    <Col md={1}>
                        <label className='mt-2 font-bold fs-10'>Narration:</label>
                    </Col>
                    <input
                        readOnly
                        style={{ outline: "none", width: "90%", }}
                        type='text'
                        className='border-top-0 border-start-0 border-end-0 fs-10'
                        defaultValue={voucherData?.Voucher_Heads?.length>1? voucherData.Voucher_Heads[0]?.accountType == 'payAccount'? voucherData.Voucher_Heads[0].narration : voucherData.Voucher_Heads[1].narration: ""}
                    />
                </Row>
            </Col>
      </Row>
      <div className='mt-4' style={{ maxHeight: 500, overflowY: 'auto' }}>
            <Table bordered className='tableFixHead'>
            <thead style={{ fontSize: "10px" }}>
                <tr>
                <th>Code</th>
                <th>Head of Account</th>
                <th>Cost Center</th>
                <th>Debit</th>
                <th>Credit</th>
                </tr>
            </thead>
            <tbody>
                {voucherData?.Voucher_Heads?.map((x, index) => {
                return (
                <tr key={index} className='fs-10' >
                    <td>{index + 1}</td>
                    <td>
                    <span className=''>
                        {x.Child_Account?.title}<br/>
                        {x.narration && <span style={{fontSize:10, color:'grey'}}>{"( "}{x.narration}{" )"}</span>}
                    </span>
                    </td>
                    <td>
                    <span className=''>{"KHI"}</span>
                    </td>
                    <td className='text-end'>
                    <span>{x.type === "debit" ? commas(x.amount) : ""}</span>
                    </td>
                    <td className='text-end'>
                    <span>{x.type === "credit" ? commas(x.amount) : ""}</span>
                    </td>
                </tr>
                )})}
                <tr className='text-end fw-bold fs-10'>
                    <td colSpan={3} >
                        Total
                    </td>
                    <td>
                        {commas(debitTotal)}
                    </td>
                    <td>
                        {commas(creditTotal)}
                    </td>
                </tr>
            </tbody>
            </Table>
      </div>
      <Row className='my-2'>
            <Col md={12}>
                <label className='fs-10'>Total amount in words :</label>
                <input
                    type='text'
                    style={{ width: 100, outline: "none" }}
                    className='w-75 border-top-0 border-start-0 border-end-0 fs-10'
                    readOnly
                    defaultValue={numToWords(creditTotal)}
                />
            </Col>
      </Row>
      <Row
        style={{
            width: "95%",
            marginTop: "100px",
            marginLeft: "auto",
            marginRight: "auto", // ✅ this centers the Row horizontally
            display: "flex",
            justifyContent: "center" // ✅ centers columns inside the row
        }}
        >
        <Col md={3}>
          <div className='d-flex flex-column justify-content-center'>
                <input
                  style={{ outline: "none" }}
                  type='text'
                  className='border-top-0 border-start-0 border-end-0 fs-10'
                  readOnly
                />
                <label className='text-center fs-10 fw-bold'>Prepared by</label>
          </div>
        </Col>
        <Col md={3}>
          <div className='d-flex flex-column justify-content-center'>
                <input
                  style={{ outline: "none" }}
                  type='text'
                  className='border-top-0 border-start-0 border-end-0 fs-10'
                  readOnly
                />
                <label className='text-center fs-10 fw-bold'>Checked by</label>
          </div>
        </Col>
        <Col md={3}>
              <div className='d-flex flex-column justify-content-center'>
                <input
                  style={{ outline: "none" }}
                  type='text'
                  className='border-top-0 border-start-0 border-end-0 fs-10'
                  readOnly
                />
                <label className='text-center fs-10 fw-bold'>Approved by</label>
              </div>
        </Col>
        <Col md={3}>
              <div className='d-flex flex-column justify-content-center'>
                <input
                  style={{ outline: "none" }}
                  type='text'
                  className='border-top-0 border-start-0 border-end-0 fs-10'
                  readOnly
                />
                <label className='text-center fs-10 fw-bold'>Received by</label>
              </div>
        </Col>
      </Row>
      <Row style={{ marginTop: "20px", position: "fixed", bottom: 20, width: "90%" }}>
            <Col md={6}>
                <div className='text-start'>
                    <span className='fs-10'>Printed on : {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' })} at {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </Col>
            <Col md={6}>
                <div className='text-end'>
                    <span className='fs-10'>Printed by :{Cookies.get("username")} </span>
                </div>
            </Col>
      </Row>
    </div>
  )
}

export default React.memo(Print)