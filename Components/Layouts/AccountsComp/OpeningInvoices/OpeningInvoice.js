import React, { useEffect } from 'react'
import { Col, Row } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { DatePicker, InputNumber, Radio, Select } from 'antd'
import { setField, resetState } from '../../../../redux/openingInvoices/openingInvoicesSlice'
import axios from 'axios'
import Router from 'next/router'
import openNotification from "/Components/Shared/Notification";
import Cookies from 'js-cookie'
const commas = (a) => a == 0 ? '0' : parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")

const OpeningInvoice = (id) => {
  const dispatch = useDispatch();
  const state = useSelector((state) => state.openingInvoice);

  console.log("ID>>",id.id.id)

  const fetchAccounts = async () => {
    console.log(state.accountType)
    const accounts = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/misc/parties/getPartiesbyType`,
      { headers:{companyId: Cookies.get('companyId'), type: state.accountType} }
    ).then((x) => {
      console.log(">>", x.data.result)
      dispatch(setField({ field: 'accounts', value: x.data.result }));
    })
    await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ACCOUNT_FOR_TRANSACTION, {
      headers: {
        type: "Adjust",
        companyid: Cookies.get('companyId'),
      }
    }).then((x) => {
      console.log("Accounts:", x)
      dispatch(setField({ field: 'creditAccounts', value: x.data.result }));
    })
  }

  const deleteInvoice = async (id) => {
    try{
      console.log(id)
      axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/deleteOpeningInvoices`,
        {
          headers: {id: id}
        }
      )
    }catch(e){
      console.log(e)
    }
  }

  const fetchOpeningInvoice = async () => {
    try{
      console.log("Fetching Invoice")
      const result = await axios.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/getOpeningInvoice`, {
        headers: {
          id: id.id.id
        }
      })
      console.log("Voucher Heads",result.data.result.voucher.Voucher_Heads)
      dispatch(setField({ field: 'accountType', value: result.data.result.result.partyType }));
      dispatch(setField({ field: 'payType', value: result.data.result.result.payType }));
      result.data.result.result.payType=="Payble"?
      dispatch(setField({ field: 'type', value: "OB" })):
      dispatch(setField({ field: 'type', value: "OI" }));
      dispatch(setField({ field: 'operation', value: result.data.result.result.operation }));
      dispatch(setField({ field: 'currency', value: result.data.result.result.currency }));
      dispatch(setField({ field: 'ex_rate', value: result.data.result.result.ex_rate }));
      result.data.result.voucher.Voucher_Heads.forEach((x)=>{
        if(x.accountType=="payAccount"){
          dispatch(setField({ field: 'creditAccount', value: x.ChildAccountId }));
        }
        if(x.accountType=="partyAccount"){
          // dispatch(setField({ field: 'account', value: x.ChildAccountId }));
        }
      })
      dispatch(setField({ field: 'account', value: result.data.result.result.party_Id }));
      // dispatch(setField({ field: 'creditAccount', value: parseInt(result.data.result.result.party_Id) }));
      dispatch(setField({ field: 'total', value: parseInt(result.data.result.result.total) }));
      
      
      
    }catch(e){
      console.log(e)
    }
  }

  useEffect(() => {
    if(id.id.id!='new'){
      fetchOpeningInvoice(id.id.id)
      // dispatch(setField({ field: 'account', value: id.id.id }));
    }
  }, [id.id.id])

  useEffect(() => {
    fetchAccounts();
  }, [state.accountType])

  const save = async () => {
    if(id.id.id != "new"){
      await deleteInvoice(id.id.id)
    }
    if(state.currency!="PKR" && state.ex_rate<=100){
      openNotification("Error", `Invalid Exchange Rate`, "red")
    }else{
      const result = await axios.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/invoice/openingInvoice`, {
        party_Id: state.account,
        party_Name: state.accounts[0].Client_Associations?state.accounts.find((x) => x.Client_Associations[0].ChildAccountId === state.account)?.name || "N/A":state.accounts.find((x) => x.Vendor_Associations[0].ChildAccountId === state.account)?.name || "N/A",
        type: state.type,
        date: state.createdAt,
        amount: state.total,
        currency: state.currency,
        payType: state.payType,
        creditAccount: state.creditAccount,
        exRate: state.ex_rate,
        operation: state.operation,
        partyType: state.accountType,
        companyId: Cookies.get('companyId'),
      })
      console.log(result)
      if (result.data.status == 'success') {
        Router.push('/accounts/openingInvoices/list')
        dispatch(resetState())
      }
    }
  }

  console.log(state)


  return (
    <div className='base-page-layout'>
      <Row style={{width:'100%', margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <h5 style={{width:'30%', margin: 0}}>Opening Invoice</h5>
        <button style={{float:'right', width:'100px', display:'inline-block'}} className='btn-custom-green' 
          onClick={()=>{
            dispatch(resetState())
            Router.push('/accounts/openingInvoices/list')
          }}
        >Back</button>
      </Row>
      <hr></hr>
      <Row style={{width:'100%', margin: 0}}>
        <Col style={{ padding: 0 }} md={12}>
            <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
              <div style={{width:"10%"}}>
                Account Type
              </div>
              <Radio.Group style={{marginLeft: 10, display: 'flex', flexDirection: 'row', alignItems: 'center'}} value={state.accountType} onChange={(e)=>{
                if(e.target.value == 'client'){
                  dispatch(setField({ field: 'accountType', value: e.target.value }));
                  dispatch(setField({ field: 'payType', value: 'Recievable' }));
                  dispatch(setField({ field: 'currency', value: 'PKR' }));
                  dispatch(setField({ field: 'account', value: undefined}));
                  dispatch(setField({ field: 'type', value: 'OI'}));
                }
                if(e.target.value == 'vendor'){
                  dispatch(setField({ field: 'accountType', value: e.target.value }));
                  dispatch(setField({ field: 'payType', value: 'Payble' }));
                  dispatch(setField({ field: 'currency', value: 'PKR' }));
                  dispatch(setField({ field: 'type', value: 'OB' }));
                }
                if(e.target.value == 'agent'){
                  dispatch(setField({ field: 'accountType', value: e.target.value }));
                  dispatch(setField({ field: 'payType', value: 'Payble' }));
                  dispatch(setField({ field: 'currency', value: 'USD' }));
                  dispatch(setField({ field: 'account', value: undefined }));
                  dispatch(setField({ field: 'type', value: 'OB' }));
                }
              }}>
                <Radio value={'client'}>Client</Radio>
                <Radio value={'vendor'}>Vendor</Radio>
                <Radio value={'agent'}>Agent</Radio>
              </Radio.Group>
          </Row>
        </Col>
      </Row>
      <Row style={{width:'100%', margin: 0, paddingTop: '25px'}}>

        
        <Col style={{ padding: 0}} md={2}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"20%"}}>
              Type
            </div>
            <Select disabled style={{ width: '60%', marginLeft: '5%' }} value={state.type} onChange={(e) => dispatch(setField({ field: 'type', value: e }))}>
              <Select.Option value="OI">Opening Invoice</Select.Option>
              <Select.Option value="OB">Opening Bill</Select.Option>
              <Select.Option value="JI">Job Invoice</Select.Option>
              <Select.Option value="AI">Agent Invoice</Select.Option>
              <Select.Option value="JB">Job Bill</Select.Option>
              <Select.Option value="AB">Agent Bill</Select.Option>
            </Select>
          </Row>
        </Col>
        <Col style={{ padding: 0}} md={2}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"35%"}}>
              Pay Type
            </div>
            <Select style={{ width: '60%', marginLeft: '5%' }} value={state.payType} onChange={(e) => {dispatch(setField({ field: 'payType', value: e })); e==="Recievable"?dispatch(setField({ field: 'type', value: "OI" })):dispatch(setField({ field: 'type', value: "OB" }))}}>
              <Select.Option value="Recievable">Recievable</Select.Option>
              <Select.Option value="Payble">Payable</Select.Option>
            </Select>
          </Row>
        </Col>
        <Col style={{ padding: 0}} md={4}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"25%"}}>
              Settlement Account
            </div>
            <Select
              allowClear
              showSearch
              style={{ width: '70%' }}
              placeholder={`Select Account`}
              value={state.creditAccount}
              options={state.creditAccounts.map((account) => ({
                label: `(${account.code}) ${account.title}`,
                value: account.id,
              }))}
              filterOption={(input, option) =>
                option?.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(e) => {dispatch(setField({ field: 'creditAccount', value: e }))}}
            />
          </Row>
        </Col>
        
        
      </Row>
      <Row style={{width:'100%', margin: 0, paddingTop: '25px'}}>
      <Col style={{ padding: 0}} md={2}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"35%"}}>
              Operation
            </div>
            <Select style={{ width: '60%', marginLeft: '5%' }} value={state.operation} onChange={(e) => dispatch(setField({ field: 'operation', value: e }))}>
              <Select.Option value="AE">Air Export</Select.Option>
              <Select.Option value="AI">Air Import</Select.Option>
              <Select.Option value="SE">Sea Export</Select.Option>
              <Select.Option value="SI">Sea Import</Select.Option>
            </Select>
          </Row>
        </Col>
        <Col style={{ padding: 0}} md={2}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"20%"}}>
              Date
            </div>
            <DatePicker style={{ width: '65%', marginLeft: '5%' }} value={state.createdAt} onChange={(e) => dispatch(setField({ field: 'createdAt', value: e }))}>
            </DatePicker>
          </Row>
        </Col>
      </Row>
      <Row style={{ width: '100%', margin: 0, paddingTop: '25px'}}>
        
        <Col style={{ padding: 0}} md={2}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"35%"}}>
              Currency
            </div>
            <Select disabled={state.accountType!='agent'} style={{ width: '49%', marginLeft: '0.5%' }} value={state.currency} onChange={(e) => {dispatch(setField({ field: 'currency', value: e })); e=='PKR'?dispatch(setField({ field: 'ex_rate', value: 1.0 })):null}}>
              <Select.Option value="PKR">PKR</Select.Option>
              <Select.Option value="USD">USD</Select.Option>
              <Select.Option value="EUR">EUR</Select.Option>
              <Select.Option value="GBP">GBP</Select.Option>
              <Select.Option value="AED">AED</Select.Option>
              <Select.Option value="OMR">OMR</Select.Option>
              <Select.Option value="BDT">BDT</Select.Option>
              <Select.Option value="CHF">CHF</Select.Option>
            </Select>
          </Row>
        </Col>
        <Col style={{ padding: 0}} md={2}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"35%"}}>
              Ex. Rate
            </div>
            <InputNumber
              style={{width: '60%'}}
              value={state.ex_rate}
              disabled={state.currency == 'PKR' ? true : false}
              onChange={(e) => dispatch(setField({ field: 'ex_rate', value: e }))}
            />
          </Row>
        </Col>
        
      </Row>
      <Row style={{ width: '100%', margin: 0, paddingTop: '25px'}}>
      <Col style={{ padding: 0}} md={3}>
          <Row className='' style={{width:"100%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"30%"}}>
              Account
            </div>
            {console.log("Accounts>>>", state.accounts)}
            <Select
              allowClear
              showSearch
              style={{ width: '65%' }}
              placeholder="Select Account"
              value={state.account}
              options={state.accounts.map((account) => ({
                label: `(${account.code}) ${account.name}`,
                value: account.Client_Associations?account.Client_Associations[0].ChildAccountId:account?.Vendor_Associations[0]?.ChildAccountId,
              }))}
              filterOption={(input, option) =>
                option?.label?.toLowerCase().includes(input.toLowerCase())
              }
              onChange={(e) => {
                console.log("Selected Value:", e)
                dispatch(setField({ field: 'account', value: e }))
              }}
            />
          </Row>
        </Col>
        <Col style={{ padding: 0}} md={4}>
          <Row style={{width:"50%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
            <div style={{width:"35%"}}>
              Amount
            </div>
            <InputNumber
              style={{width: '60%'}}
              value={state.total}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') // Add commas as thousands separators
              }
              parser={(value) =>
                value?.replace(/,/g, '') // Remove commas for the actual value
              }
              onChange={(e) => dispatch(setField({ field: 'total', value: e }))}
            />
          </Row>
          <Row style={{width:"50%", margin: 0, display: 'flex', flexDirection: 'row', alignItems: 'center', paddingTop:'10px'}}>
            {state.currency!="PKR"&&
              <div>Local Amount: {commas(state.total*state.ex_rate)}</div>}
          </Row>
        </Col>
      </Row>
      <Col style={{marginTop: '25px'}}>
      <button style={{width: '5%', backgroundColor: '#1d1d1f', borderRadius: '25px', color: 'white'}}
      onClick={() => save()}
      >Save</button>
      </Col>
    </div>
  )
}

export default OpeningInvoice