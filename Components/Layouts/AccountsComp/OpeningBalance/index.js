import { Row, Col, Table, Spinner } from "react-bootstrap";
import React, { useEffect, useState } from 'react';
import { Select, InputNumber, Input } from 'antd';
import Router from "next/router";
import axios from 'axios';
import { CloseCircleOutlined } from "@ant-design/icons";
import openNotification from "/Components/Shared/Notification";
import Cookies from "js-cookie";

const commas = (a) => a == 0 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const OpeningBalance = ({id, voucherData}) => {
  console.log(voucherData)

  const [ voucher_Id, setVoucher_Id ] = useState("");
  const [ load, setLoad ] = useState(false);
  const [ exRate, setExRate ] = useState("1");
  const [ accounts, setAccounts ] = useState([]);
  const [ currency, setCurrency ] = useState("PKR");
  const [ companyId, setCompanyId ] = useState("");
  const [ voucherAccounts, setVoucherAccounts ] = useState([]);

  const [ deleteList, setDeleteList ] = useState([]);

  useEffect(() => {
    if(id!="new"){
      setExRate(voucherData.exRate)
      setCurrency(voucherData.currency)
      setVoucher_Id(voucherData.voucher_Id)
      setCompanyId(parseInt(voucherData.CompanyId))
      setVoucherAccounts(voucherData.Voucher_Heads)
    }else if(voucherAccounts.length==0){
      setCompanyId(parseInt(Cookies.get("companyId")))
      let tempAccounts = [...voucherAccounts];
      tempAccounts.push({ defaultAmount:0.0, amount:0.00, type:"debit", narration:"", ChildAccountId:"" });
      tempAccounts.push({ defaultAmount:0.0, amount:0.00, type:"credit", narration:"", ChildAccountId:"" });
      setVoucherAccounts(tempAccounts);
    }
  }, [])

  useEffect(() => {
    if(companyId!="") {
      setLoad(true);
      axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_CHILD_ACCOUNTS,{
        headers:{ companyid: companyId }
      }).then((x) => {
        setAccounts(x.data.result);
        setLoad(false);
      })
    }
  }, [companyId]);

  const setVouchers = (e, i, name, condition)=> {
    
    let tempState = [...voucherAccounts];
    console.log("TempState",tempState)
    if(name!="ChildAccountId"){
      tempState.forEach((x, index)=>{
        tempState[index][name] = e;
        // condition?tempState[index][defaultAmount] = (parseFloat(e) * parseFloat(exRate)).toFixed(2):null;
        // condition?tempState[index].defaultAmount = (parseFloat(e) * parseFloat(exRate)).toFixed(2):null;
        if(condition){
          if(currency!='PKR'){
            tempState[index].defaultAmount = (parseFloat(e) * parseFloat(exRate)).toFixed(2)
          }else{
            tempState[index].defaultAmount = (parseFloat(e)).toFixed(2)
          }
        }
      })
    }else{
      tempState[i][name] = e;
      // condition?tempState[i][defaultAmount] = (parseFloat(e) * parseFloat(exRate)).toFixed(2):null;
      // condition?tempState[i].defaultAmount = (parseFloat(e) * parseFloat(exRate)).toFixed(2):null;
      if(condition){
        if(currency!='PKR'){
          tempState[i].defaultAmount = (parseFloat(e) * parseFloat(exRate)).toFixed(2)
        }else{
          tempState[i].defaultAmount = (parseFloat(e)).toFixed(2)
        }
      }
    }
    setVoucherAccounts(tempState);
  }

  const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  const submitData = async() => {
    setLoad(true)
    if(id=="new"){
      await axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CREATE_OPENING_BALANCE, {
        exRate, currency, companyId, vType:"OP", costCenter:"KHI", 
        type:"Opening Balance", Voucher_Heads:voucherAccounts
      }).then((x) => {
        if(x.data.status=="success"){
          // Router.push(`/accounts/openingBalance/list`)
          openNotification("Success", `Opening Balance Saved Successfully!`, "green")
          // Router.push(`/accounts/openingBalance/${x.data.result.id}`)
          Router.push(`/accounts/openingBalance/list`)
        }
      })
    }else{
      axios.post(process.env.NEXT_PUBLIC_CLIMAX_UPDATE_VOUCEHR, {        
        id:voucherData,id, exRate, currency,
        companyId, vType:"OP", costCenter:"KHI", 
        type:"Opening Balance", Voucher_Heads:voucherAccounts
      }).then((x)=>{
        if(x.data.status=="success"){
          openNotification("Success", `Opening Balance Updated Successfully!`, "green")
        }else{
          openNotification("Error", `Some Error Occured`, "red")
        }
        setLoad(false)
      })
    }
  }

  const removeList = (id) => {
    let tempList = [...voucherAccounts];
    tempList = tempList.filter((x)=>{
      return x.id!==id;
    })
    setVoucherAccounts(tempList);
  }

  return (
  <div className='base-page-layout fs-12' >
    <h5>{id=="new"?"Create An Opening":""}</h5>
    <Row>
      <Col md={2}>
        <div>Document #</div>
        <div style={{border:'1px solid silver', padding:3, paddingLeft:10, height:30, paddingTop:5}}>{voucher_Id}</div>
      </Col>
      <Col md={2}>
      <div>Company</div>
            <Select style={{width:"100%"}} value={companyId} disabled={id!="new"}
              options={[
                { value:1, label:'SEA NET LOGISTICS'  },
                { value:2, label:'CARGO LINKERS'      },
                { value:3, label:'AIR CARGO SERVICES' },
              ]}
              onChange={(e)=>{
                setCompanyId(e);
                if(voucherAccounts.length>0){
                  let tempState = [...voucherAccounts];
                  tempState.forEach((x)=>{
                    x.ChildAccountId = ""
                  })
                  setVoucherAccounts(tempState);
                }
            }}/>
      </Col>
      <Col md={2}>
      <div>Ex. Rate</div>
            <InputNumber style={{width:"100%"}} value={exRate} 
              min={0} disabled={currency=="PKR"}
              onChange={(e)=>{
                setExRate(e);
                if(voucherAccounts.length>0){
                  let tempState = [...voucherAccounts];
                  tempState.forEach((x)=>{
                    x.defaultAmount = parseFloat(x.amount) * parseFloat(e)
                  })
                  setVoucherAccounts(tempState);
                }
              }}
            />
      </Col>
      <Col md={2}>
      <div>Currency</div>
            <Select style={{width:"100%"}} value={currency} 
              onChange={(e)=>{
                setCurrency(e);
                if(id=='new'){
                  setExRate('1')
                }
              }}
              options={[
                { value:"PKR", label:"PKR"},
                { value:"USD", label:"USD"},
                { value:"EUR", label:"EUR"},
                { value:"GBP", label:"GBP"},
                { value:"AED", label:"AED"},             
                { value:"OMR", label:"OMR"},
                { value:"BDT", label:"BDT"},             
                { value:"CHF", label:"CHF"},
              ]}
            />
      </Col>
      <Col md={4}>
      <button style={{float:'right', backgroundColor: '#1d1d1f', color: '#d7d7d7', padding: '2.5px 25px', borderRadius: '15px', fontSize: '14px'}}
      onClick={() => Router.push(`/accounts/openingBalance/list`)}
      >Back</button>
      </Col>
      
      <Col md={12}>
      <hr/>
      <div>
      <Table bordered>
        <thead>
          <tr>
            <th style={{minWidth:300}}>Account</th>
            <th style={{width:100}}>Type</th>
            {currency!="PKR"&&<th style={{width:100}}>{currency}</th>}
            {currency=="PKR"&&<th style={{width:140}}>Amount</th>}
            {currency!="PKR"&&<th style={{width:140}}>Amount (LC)</th>}
            <th>Narration</th>
          </tr>
        </thead>
        <tbody>
          {voucherAccounts.map((x, i)=>{
            return(
              <tr key={i}>
              {console.log(x)}
              <td className='p-1'>
                {!load &&<Select style={{width:'100%'}} defaultValue={""} value={x.ChildAccountId} 
                  onChange={(e)=>setVouchers(e,i,'ChildAccountId')}
                  showSearch
                  filterOption={filterOption}
                  options={ accounts?.map((y) => {
                    return { label:`(${y.code}) ${y.title}`, value:y.id }
                  })}
                />}
                {load && <div className='text-center pt-2'><Spinner size='sm' /></div> }
              </td>
              <td className=''>
                <p style={{textAlign:"center", padding:"0px", margin:"0px", fontSize:"14px"}}>{x.type}</p>
              </td>
              {currency!="PKR" &&<td className='p-1'>
                <InputNumber style={{width:"100%"}} value={x.amount} onChange={(e)=>setVouchers(e,i,'amount',true)} min={"0.0"} />
              </td>}
              {currency=="PKR"&&<td className='p-1'>
                <InputNumber style={{width:"100%"}} value={x.amount} onChange={(e)=>setVouchers(e,i,'amount', true)} min={"0.0"} disabled={currency!="PKR"} />
              </td>}
              {currency!="PKR"&&<td style={{margin: 0, display: 'flex', alignContent: 'center', justifyContent: 'center', fontSize: '14px'}}>
                  {commas(x.amount*exRate)}
                </td>}
              <td className='p-1'>
                <Input style={{width:"100%"}} value={x.narration} onChange={(e)=>setVouchers(e.target.value,i,'narration')} />
              </td>
            </tr>
          )})}
        </tbody>
      </Table>
      </div>
      <button className='btn-custom' onClick={submitData} disabled={load}>{!load?"Save":<Spinner size="sm" className="mx-2" />}</button>
      </Col>
    </Row>
  </div>
)}

export default OpeningBalance;