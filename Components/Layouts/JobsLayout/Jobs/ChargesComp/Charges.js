import { useWatch } from "react-hook-form";
import { CloseCircleOutlined, RightCircleOutlined } from '@ant-design/icons';
import SelectSearchComp from "/Components/Shared/Form//SelectSearchComp";
import InputNumComp from "/Components/Shared/Form/InputNumComp";
import { Select, Modal, Tag, InputNumber } from 'antd';
import { getVendors, getClients } from '../states';
import SelectComp from "/Components/Shared/Form/SelectComp";
import { Row, Col, Table, Spinner } from 'react-bootstrap';
import PopConfirm from '/Components/Shared/PopConfirm';
import React, { useEffect, useState } from 'react';
import PartySearch from './PartySearch';
import { saveHeads, calculateChargeHeadsTotal, makeInvoice, getHeadsNew, approveHeads, autoInvoice } from "../states";
import { v4 as uuidv4 } from 'uuid';
import openNotification from '/Components/Shared/Notification';
import { checkEditAccess } from "../../../../../functions/checkEditAccess";
import InputNumberComp from "../../../../Shared/Form/InputNumberComp";
import { delay } from "/functions/delay";



const ChargesList = ({state, dispatch, type, append, reset, fields, chargeList, remove, control, setValue, register, companyId, operationType, allValues, chargesData}) => {

  const { permissions } = state;
  const permissionAssign = (perm, x) => x.Invoice?.approved=="1"? true : false;
  const [generate, setGenerate] = useState(false);
  const [InvoiceBuffer, setInvoiceBuffer] = useState(false);

  const commas = (a) =>  { return parseFloat(a).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ", ")};

  useEffect(() => {
    if(chargeList){
      let list = chargeList.filter((x)=>x.check);
      dispatch({
        type:'set', payload:{
        selection:{
          InvoiceId:list.length>0?list[0].InvoiceId:null,
          partyId:list.length>0? list[0].partyId:null
        }}
      })
    }
    chargeList?.length>0?calculate1():null
  }, [chargeList]);

  const calculate  = () => {
    let tempChargeList = [...chargeList];
    for(let i = 0; i<tempChargeList.length; i++){
      if(tempChargeList[i].charge!=""){
        let amount = tempChargeList[i].amount*tempChargeList[i].rate_charge - tempChargeList[i].discount;
        let tax = 0.00;
        if(tempChargeList[i].tax_apply==true){
          tax = (amount/100.00) * tempChargeList[i].taxPerc;
          tempChargeList[i].tax_amount = tax;
          tempChargeList[i].net_amount =( amount + tax ) * parseFloat(tempChargeList[i].qty);
        } else {
          tempChargeList[i].net_amount = (amount * parseFloat(tempChargeList[i].qty));
        }
        if(tempChargeList[i].currency=="PKR"){
          tempChargeList[i].local_amount = (tempChargeList[i].net_amount*1.00);
        } else {
          tempChargeList[i].local_amount = (tempChargeList[i].net_amount*tempChargeList[i].ex_rate);
        }
      }
    }
    let tempChargeHeadsArray = calculateChargeHeadsTotal(tempChargeList, 'full');
    dispatch({type:'set', payload:{...tempChargeHeadsArray}})
    reset({ chargeList: tempChargeList });
  };
  const calculate1  = () => {
    let tempChargeList = [...chargeList];
    for(let i = 0; i<tempChargeList.length; i++){
      if(tempChargeList[i].charge!=""){
        let amount = tempChargeList[i].amount*tempChargeList[i].rate_charge - tempChargeList[i].discount;
        let tax = 0.00;
        if(tempChargeList[i].tax_apply==true){
          tax = (amount/100.00) * tempChargeList[i].taxPerc;
          tempChargeList[i].tax_amount = tax;
          tempChargeList[i].net_amount =( amount + tax ) * parseFloat(tempChargeList[i].qty);
        } else {
          tempChargeList[i].net_amount = (amount * parseFloat(tempChargeList[i].qty)).toFixed(2);
        }
        if(tempChargeList[i].currency=="PKR"){
          tempChargeList[i].local_amount = (tempChargeList[i].net_amount*1.00).toFixed(2);
        } else {
          tempChargeList[i].local_amount = (tempChargeList[i].net_amount*tempChargeList[i].ex_rate).toFixed(2);
        }
      }
    }
    let tempChargeHeadsArray = calculateChargeHeadsTotal(tempChargeList, 'full');
    dispatch({type:'set', payload:{...tempChargeHeadsArray}})
    // reset({ chargeList: tempChargeList });
  };
    
  const saveCharges = async () => {
    if(!state.chargeLoad){
      await calculate()
      await dispatch({type:'toggle', fieldName:'chargeLoad', payload:true})
      await saveHeads(chargeList, state, dispatch, reset);
      //chargesData.refetch();
    }
  };
  const approveCharges = async () => {
    if(!state.chargeLoad){
      let charges = []
      console.log(chargeList)
      chargeList.forEach((x) => {
        console.log(x.check)
        if(x.check){
          charges.push(x)
        }
      });
      console.log(charges)
      await calculate()
      await dispatch({type:'toggle', fieldName:'chargeLoad', payload:true})
      await approveHeads(charges, state, dispatch, reset);
      //chargesData.refetch();
    }
  };

  const appendCharge = ()=>{
    if(!state.chargeLoad){
    append({
      type:type, description:'', basis:'', key_id:uuidv4(),
      new:true,  ex_rate: parseFloat(state.exRate), pp_cc:'PP', 
      local_amount: 0,  size_type:'40HC', dg_type:state.selectedRecord.dg=="Mix"?"DG":state.selectedRecord.dg, 
      qty:1, rate_charge:1, currency:'USD', amount:1, check: false, bill_invoice: '', charge: 0, particular: '',
      discount:0, tax_apply:false, taxPerc:0.00, tax_amount:0, net_amount:0, invoiceType:"", name: "", 
      partyId:"", sep:false, status:'0', approved_by:'', approval_date:'', InvoiceId:null, 
      SEJobId:state.selectedRecord.id
    })}
  };

  useEffect(() => {
    let allCheckedAreStatusOne = true;
    let anyChecked = false;
  
    chargeList?.forEach((x) => {
      if (x.check === true) {
        anyChecked = true;
        if (x.status !== '1') {
          allCheckedAreStatusOne = false;
        }
      }
    });
  
    if (anyChecked && allCheckedAreStatusOne) {
      setGenerate(true);
    } else {
      setGenerate(false);
    }
  }, [chargeList]);

  let invoicetemp = false
  

  const generateInvoice = async () => {
    calculate()
    console.log("Generate function called")
    if (!state.chargeLoad) {
      dispatch({ type: 'toggle', fieldName: 'chargeLoad', payload: true });
      let abc = false;
      let charges = [];
  
      chargeList?.forEach(x => {
        if (x.check === true) {
          if (x.status !== '1') {
            abc = false;
            // return; // Exit the loop early if any checked item is not approved
          } else {
            abc = true;
            charges.push(x);
          }
        }
      });
      // Check if `charges` contains items and `abc` is true
      if (charges.length > 0 && abc) {
        console.log("Making Invoices");
        await makeInvoice(charges, companyId, reset, operationType, dispatch, state);
      } else {
        dispatch({ type: 'toggle', fieldName: 'chargeLoad', payload: false });
        openNotification('Error', `No Charge Selected!`, 'red');
      }
    }
  };
  

  return(
  <>
    <Row>
    <Col style={{maxWidth:150}}>
      <div className='div-btn-custom text-center py-1 fw-8' onClick={appendCharge}>Add +</div>
    </Col>
    <Col>
      <div className='div-btn-custom mx-2 py-1 px-3 fl-right' onClick={saveCharges}>Save Charges</div>
      {/* <div className='div-btn-custom-green fl-right py-1 px-3' style={{cursor: !generate? "not-allowed" : "pointer"}} onClick={()=>{
        if(generate){
          generateInvoice();
        }
      }}>Generate Invoice No</div> */}
      <div className='div-btn-custom-green fl-right py-1 px-3 mx-1' style={{cursor: !generate? "not-allowed" : "pointer"}} onClick={async ()=>{
        console.log("Invoice Buffer1:", InvoiceBuffer)
        if(generate && !InvoiceBuffer){
          setInvoiceBuffer(true)
          await delay(500)
          console.log("Invoice Buffer2:", InvoiceBuffer)
          let temp = chargeList.filter((x)=>x.partyType=="client"&&x.check)
          if(temp.length==0){
            openNotification('Error', `No Client Selected!`, 'red');
          }else{
            await autoInvoice(temp, companyId, reset, operationType, dispatch, state, setInvoiceBuffer).then(()=>{
            });
          }
        }else{
          setInvoiceBuffer(false)
        }
      }}>Auto Invoice</div>
      <div className='div-btn-custom-green fl-right py-1 px-3 mx-1' style={{cursor: !generate? "not-allowed" : "pointer"}} onClick={async ()=>{
        console.log(state.chargeLoad)
        if(generate && !InvoiceBuffer){
          setInvoiceBuffer(true)
          await delay(500)
          let temp = chargeList.filter((x)=>(x.partyType=="vendor"||x.partyType=="vendors")&&x.check)
          if(temp.length==0){
            openNotification('Error', `No Vendor Selected!`, 'red');
          }else{
            await autoInvoice(temp, companyId, reset, operationType, dispatch, state, setInvoiceBuffer);
          }
        }else{
          setInvoiceBuffer(false)
        }
      }}>Auto Bill</div>
      <div className='div-btn-custom-green fl-right py-1 px-3 mx-1' style={{cursor: !generate? "not-allowed" : "pointer"}} onClick={async ()=>{
        if(generate && !InvoiceBuffer){
          setInvoiceBuffer(true)
          await delay(500)
          let temp = chargeList.filter((x)=>x.partyType=="agent"&&x.check)
          if(temp.length==0){
            openNotification('Error', `No Agent Selected!`, 'red');
          }else{
            await autoInvoice(temp, companyId, reset, operationType, dispatch, state, setInvoiceBuffer);
          }
        }else{
          setInvoiceBuffer(false)
        }
      }}>Auto Agent Invoice</div>
      <div className='mx-2' style={{float:'right'}}>
        <InputNumber placeholder='Ex.Rate' size='small' className='my-1' min={"0.1"}  style={{position:'relative', bottom:2}}
          value={state.exRate} onChange={(e)=>dispatch({type:'toggle',fieldName:'exRate',payload:e})} 
        />
      </div>
      <div className='my-1' style={{float:'right'}}>Ex.Rate</div>
    </Col>
    </Row>
    <div className='table-sm-1 mt-3' style={{maxHeight:300, overflowY:'auto'}}>
    {!state.chargeLoad &&
    <Table className='tableFixHead' bordered>
      <thead>
        <tr className='table-heading-center'>
      <th>x</th>
      <th>
        <input type="checkbox" onChange={(e)=>{
          chargeList.forEach((x, i)=>{
            !x.invoice_id&&x.type==type?setValue(`chargeList.${i}.check`, e.target.checked):null
          })
        }} />
      </th>
      <th>Bill/Invoice</th>
      <th>Charge</th>
      <th>Particular</th>
      <th>Party</th>
      <th>Basis</th>
      <th>PP/CC</th>
      {(operationType=="SE"||operationType=="SI") &&<th>SizeType</th>}
      {(operationType=="SE"||operationType=="SI") &&<th style={{minWidth:95}}>DG Type</th>}
      <th>Qty/Wt</th>
      {(operationType=="AI"||operationType=="AE")&&<th>Rate</th>}
      <th>Currency</th>
      <th>Amount</th>
      <th>Discount</th>
      <th style={{minWidth:60}}>Tax</th>
      <th style={{minWidth:100}}>Tax Amount</th>
      <th style={{minWidth:100}}>Net Amount</th>
      <th>Ex.Rate</th>
      <th style={{minWidth:110}}>Local Amount</th>
      <th>Status</th>
      <th style={{minWidth:110}}>Approved By</th>
      <th style={{minWidth:120}}>Approval Date</th>
        </tr>
      </thead>
      {chargeList && <tbody>
      {fields.map((x, index) => {
      return(
        <>
          {x.type==type && 
          <tr key={x.key_id} className='f table-row-center-singleLine'>
          <td className='text-center'>{/* Remove Charge */}
            <CloseCircleOutlined className='cross-icon' style={{ position: 'relative', bottom: 3 }}
                onClick={() => {
                if((x.Invoice==null || x.Invoice?.status==null || x.Invoice?.approved=="0")) {
                    PopConfirm("Confirmation", "Are You Sure To Remove This Charge?",
                    () => {
                        let tempState = [...chargeList];
                        let tempDeleteList = [...state.deleteList];
                        tempDeleteList.push(tempState[index].id);
                        tempState.splice(index, 1);
                        reset({ chargeList: tempState });
                        dispatch({ type: 'toggle', fieldName: 'deleteList', payload: tempDeleteList });
                })}else{
                  console.log(x.Invoice, x.Invoice.status, x.Invoice.approved)
                  console.log("stuck in the else")
                }
              }}
            />
          </td>
          <td style={{ backgroundColor: x.status === "1" ? "#DAF7A6" : "white" }} className='text-center'>
            {(x.invoice_id==null && x.new!=true) &&
            <input type="checkbox" {...register(`chargeList.${index}.check`)}
              style={{ cursor: 'pointer' }}
              disabled={
                x.partyId==state.selection.partyId?
                  false:
                  state.selection.partyId==null?
                    false:
                    true
              }
            />}
          </td>
          <td className='text-center'>{/* Invoice Number */}
          {x.invoice_id != null &&
            <Tag color={x.Invoice?.approved === "1" ? "geekblue" : "red"} style={{ fontSize:15, cursor:"pointer" }}
              onClick={()=>dispatch({type:'set',payload:{selectedInvoice:x.invoice_id,tabState:"5"}})}
            >
              {x.invoice_id}
            </Tag>
          }
          </td>
          <td style={{ padding: 3, minWidth: 100 }}> {/* charge selection */}
            <Select className='table-dropdown' showSearch value={parseInt(x.charge)} style={{ paddingLeft: 0 }}
              disabled={permissionAssign(permissions, x)}
              onChange={(e) => {
                let tempChargeList = [...chargeList];
                let check = false
                tempChargeList[index].charge ? check = true : check = false
                console.log("Check:", check)

                state.fields.chargeList.forEach(async (y, i) => {
                  if (y.code == e) {
                    tempChargeList[index] = {
                      ...tempChargeList[index],
                      charge: e,
                      particular: y.name,
                      basis: y.calculationType,
                      taxPerc: y.taxApply == "Yes" ? parseFloat(y.taxPerc) : 0.00,
                      qty:(y.calculationType!="Per Unit"||allValues.cwtClient==""||allValues.cwtClient==0)?1:allValues.cwtClient
                    }
                    let partyType = "";
                    let choiceArr = ['', 'defaultRecivableParty', 'defaultPaybleParty'];// 0=null, 1=recivable, 2=payble
                    partyType = y[choiceArr[parseInt(state.chargesTab)]];
                    let searchPartyId;
                    switch (partyType) {
                        case "Client":
                          searchPartyId = state.selectedRecord.ClientId;
                        break;
                        case "Local-Agent":
                          searchPartyId = state.selectedRecord.localVendorId;
                        break;
                        case "Custom-Agent":
                          searchPartyId = state.selectedRecord.customAgentId;
                        break;
                        case "Transport-Agent":
                          searchPartyId = state.selectedRecord.transporterId;
                        break;
                        case "Forwarding-Agent":
                          searchPartyId = state.selectedRecord.forwarderId;
                        break;
                        case "Overseas-Agent":
                          searchPartyId = state.selectedRecord.overseasAgentId;
                        break;
                        case "Shipping-Line":
                          searchPartyId = state.selectedRecord.shippingLineId;
                        break;
                        default:
                          searchPartyId = state.selectedRecord.localVendorId;
                        break;
                    }
                    let partyData = partyType == "Client" ? await getClients(searchPartyId) : await getVendors(searchPartyId);
                    if (state.chargesTab == '1') {
                      tempChargeList[index].invoiceType = partyData[0].types.includes("Overseas Agent") ? "Agent Invoice" : "Job Invoice";
                    } else {
                      tempChargeList[index].invoiceType =  partyData[0].types.includes("Overseas Agent") ? "Agent Bill" : "Job Bill";
                    }
                    console.log(tempChargeList)
                    if(!check){
                      tempChargeList[index].name = partyData[0].name;
                      tempChargeList[index].partyId = partyData[0].id;
                      tempChargeList[index].partyType = partyType == "Client" ? "client" : "vendor";
                    }
                    reset({ chargeList: tempChargeList })
                  }
                })
              }}
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={state.fields.chargeList}
            />
          </td>
          <td>{x.particular}</td>
          <td className='text-center'>{/* Party Selection */}
          {!x.invoice_id && 
            <RightCircleOutlined style={{ position: 'relative', bottom: 3 }}
              onClick={() => dispatch({ type:'set', payload: { headIndex: index, headVisible: true }})}
            />
          }
          {x.name != "" ? <span className='m-2 '><Tag color="geekblue" style={{ fontSize: 15 }}>{x.name}</Tag></span> : ""}
          </td>
          <td>{x.basis=="Per Shipment"?'P/Shp':'P/Unit'} {/* Basis */}
          </td>
          <td style={{ padding: 3, minWidth: 50 }}> {/* PP?CC */}
          {/* <SelectComp register={register} name={`chargeList.${index}.pp_cc`} 
            control={control} width={60} font={13} 
            disabled={permissionAssign(permissions, x)}
            options={[
              { id: 'PP', name: 'PP' },
              { id: 'CC', name: 'CC' }
            ]}
          /> */}
          <Select className='table-dropdown' showSearch value={x.pp_cc} style={{ paddingLeft: 0 }}
              disabled={permissionAssign(permissions, x)}
              onChange={async (e) => {
                let tempChargeList = [...chargeList];
                console.log("Charge:",tempChargeList[index])
                tempChargeList[index].pp_cc = e
                let searchPartyId;
                if(e == 'PP'){
                  if(type != 'Recievable'){
                    searchPartyId = state.selectedRecord.localVendorId
                  }else{
                    searchPartyId = state.selectedRecord.ClientId
                  }
                }else{
                  searchPartyId = state.selectedRecord.overseasAgentId
                }
                // let partyData = e == "PP" ? await getClients(searchPartyId) : await getVendors(searchPartyId);
                let partyData
                if(e == 'PP'){
                  if(type == 'Recievable'){
                    partyData = await getClients(searchPartyId)
                  }else{
                    partyData = await getVendors(searchPartyId)
                  }
                }else{
                  partyData = await getVendors(searchPartyId)
                }
                if (state.chargesTab == '1') {
                  tempChargeList[index].invoiceType = partyData[0].types.includes("Overseas Agent") ? "Agent Bill" : "Job Invoice";
                } else {
                  tempChargeList[index].invoiceType = partyData[0].types.includes("Overseas Agent") ? "Agent Invoice" : "Job Bill";
                }
                tempChargeList[index].name = partyData[0].name;
                tempChargeList[index].partyId = partyData[0].id;
                tempChargeList[index].partyType = e == "PP" ? "client" : "agent";
                reset({ chargeList: tempChargeList })
              }}
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={[
                {id: 'PP', value: 'PP', name: 'PP'},
                {id: 'CC', value: 'CC', name: 'CC'}
              ]}
            />
          </td>
          {(operationType=="SE"||operationType=="SI") &&<td style={{ padding: 3 }}> {/* Size/Type */}
          <SelectSearchComp register={register} name={`chargeList.${index}.size_type`} control={control} width={100} font={13} 
            disabled={permissionAssign(permissions, x)}
            options={[
              { id: '40HC', name: '40HC' },
              { id: '20HC', name: '20HC' }
            ]}
          />
          </td>
          }
          {(operationType=="SE"||operationType=="SI") &&
          <td style={{ padding: 3 }}> {/* DG */}
          <SelectSearchComp register={register} name={`chargeList.${index}.dg_type`} control={control} width={95} font={13} disabled={permissions?.admin?false:x.InvoiceId!=null?true:false}
            options={[
              { id: 'DG', name: 'DG' },
              { id: 'non-DG', name: 'non-DG' }
            ]}
          />
          </td>
          }
          <td style={{ padding: 3 }}>{/* QTY */}
          <div style={{border:chargeList[index]?.qty==0?'2px solid red':'silver'}}>
          <InputNumberComp register={register} name={`chargeList.${index}.qty`} control={control} label='' width={20} 
            disabled={permissionAssign(permissions, x)} onChange={(e)=>{
              let tempChargeList = [...chargeList];
              tempChargeList[index].qty = e;
              let amount = tempChargeList[index].amount*tempChargeList[index].rate_charge - tempChargeList[index].discount;
              let tax = 0.00;
              if(tempChargeList[index].tax_apply==true){
                tax = (amount/100.00) * tempChargeList[index].taxPerc;
                tempChargeList[index].tax_amount = tax;
                tempChargeList[index].net_amount =( amount + tax ) * parseFloat(e);
              } else {
                tempChargeList[index].net_amount = (amount * parseFloat(e)).toFixed(2);
              }
              if(tempChargeList[index].currency=="PKR"){
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*1.00).toFixed(2);
              } else {
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*tempChargeList[index].ex_rate).toFixed(2);
              }
              let tempChargeHeadsArray = calculateChargeHeadsTotal(tempChargeList, 'full');
              dispatch({type:'set', payload:{...tempChargeHeadsArray}})
              reset({ chargeList: tempChargeList });
            }}
          />
          </div>
          </td> 
          {(operationType=="AI"||operationType=="AE") &&<td style={{ padding: 3 }}>{/* rate_charge */}
          <InputNumberComp register={register} name={`chargeList.${index}.rate_charge`} control={control} label='' width={20} 
            disabled={!(operationType=="AI"||operationType=="AE")?true:permissionAssign(permissions, x)} onChange={(e)=>{
              let tempChargeList = [...chargeList];
              tempChargeList[index].rate_charge = e;
              let amount = e*tempChargeList[index].amount - tempChargeList[index].discount;
              let tax = 0.00;
              if(tempChargeList[index].tax_apply==true){
                tax = (amount/100.00) * tempChargeList[index].taxPerc;
                tempChargeList[index].tax_amount = tax;
                tempChargeList[index].net_amount =( amount + tax ) * parseFloat(tempChargeList[index].qty);
              } else {
                tempChargeList[index].net_amount = (amount * parseFloat(tempChargeList[index].qty)).toFixed(2);
              }
              if(tempChargeList[index].currency=="PKR"){
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*1.00).toFixed(2);
              } else {
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*tempChargeList[index].ex_rate).toFixed(2);
              }
              let tempChargeHeadsArray = calculateChargeHeadsTotal(tempChargeList, 'full');
              dispatch({type:'set', payload:{...tempChargeHeadsArray}})
              reset({ chargeList: tempChargeList });
            }}
          />
          </td> }
          <td style={{ padding: 3 }} > {/* Currency */}
          <SelectSearchComp register={register} name={`chargeList.${index}.currency`} control={control} width={100} font={13} 
            disabled={permissionAssign(permissions, x)}
            options={[
              { id:"PKR", name:"PKR"},
              { id:"USD", name:"USD"},
              { id:"EUR", name:"EUR"},
              { id:"GBP", name:"GBP"},
              { id:"AED", name:"AED"},             
              { id:"OMR", name:"OMR"},
              { id:"BDT", name:"BDT"},             
              { id:"CHF", name:"CHF"},
            ]}
          />
          </td>
          <td style={{ padding: 3 }}> {/* Amount */}
          <InputNumberComp register={register} name={`chargeList.${index}.amount`} control={control} label='' width={20} 
            disabled={(operationType=="AI"||operationType=="AE")?true:permissionAssign(permissions, x)} onChange={(e)=>{
              let tempChargeList = [...chargeList];
              tempChargeList[index].amount = e;
              let amount = e*tempChargeList[index].rate_charge - tempChargeList[index].discount;
              let tax = 0.00;
              if(tempChargeList[index].tax_apply==true){
                tax = (amount/100.00) * tempChargeList[index].taxPerc;
                tempChargeList[index].tax_amount = tax;
                tempChargeList[index].net_amount =( amount + tax ) * parseFloat(tempChargeList[index].qty);
              } else {
                tempChargeList[index].net_amount = (amount * parseFloat(tempChargeList[index].qty)).toFixed(2);
              }
              if(tempChargeList[index].currency=="PKR"){
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*1.00).toFixed(2);
              } else {
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*tempChargeList[index].ex_rate).toFixed(2);
              }
              let tempChargeHeadsArray = calculateChargeHeadsTotal(tempChargeList, 'full');
              dispatch({type:'set', payload:{...tempChargeHeadsArray}})
              reset({ chargeList: tempChargeList });
            }}
          />
          </td>
          <td style={{ padding: 3 }}>  {/* Discount */}
          <InputNumberComp register={register} name={`chargeList.${index}.discount`} control={control} width={30} font={13} 
            disabled={permissionAssign(permissions, x)} onChange={(e)=>{
              let tempChargeList = [...chargeList];
              tempChargeList[index].discount = e;
              let amount = tempChargeList[index].amount*tempChargeList[index].rate_charge - e;
              let tax = 0.00;
              if(tempChargeList[index].tax_apply==true){
                tax = (amount/100.00) * tempChargeList[index].taxPerc;
                tempChargeList[index].tax_amount = tax;
                tempChargeList[index].net_amount =( amount + tax ) * parseFloat(tempChargeList[index].qty);
              } else {
                tempChargeList[index].net_amount = (amount * parseFloat(tempChargeList[index].qty)).toFixed(2);
              }
              if(tempChargeList[index].currency=="PKR"){
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*1.00).toFixed(2);
              } else {
                tempChargeList[index].local_amount = (tempChargeList[index].net_amount*tempChargeList[index].ex_rate).toFixed(2);
              }
              let tempChargeHeadsArray = calculateChargeHeadsTotal(tempChargeList, 'full');
              dispatch({type:'set', payload:{...tempChargeHeadsArray}})
              reset({ chargeList: tempChargeList });
            }}
          />
          </td>
          <td style={{ textAlign: 'center' }}> {/* Tax Apply */}
          <input type="checkbox" {...register(`chargeList.${index}.tax_apply`)} style={{ cursor: 'pointer' }} 
            disabled={permissionAssign(permissions, x)} 
          />
          </td>
          <td>{x.tax_amount}</td> {/* Tax Amount */}
          <td>{commas(parseFloat(x.net_amount).toFixed(2))}</td>
          <td style={{ padding: 3 }}> {/* Ex. Rate */}
          {chargeList[index]?.currency!="PKR" && 
            <InputNumberComp register={register} name={`chargeList.${index}.ex_rate`}  control={control} label='' width={10} 
            disabled={permissionAssign(permissions, x)}  onChange={(e)=>{
                let tempChargeList = [...chargeList];
                tempChargeList[index].ex_rate = e;
                let amount = tempChargeList[index].amount*e - tempChargeList[index].discount;
                let tax = 0.00;
                if(tempChargeList[index].tax_apply==true){
                  tax = (amount/100.00) * tempChargeList[index].taxPerc;
                  tempChargeList[index].tax_amount = tax;
                  // tempChargeList[index].net_amount =( amount + tax ) * parseFloat(tempChargeList[index].qty);
                } else {
                  // tempChargeList[index].net_amount = (amount * parseFloat(tempChargeList[index].qty)).toFixed(2);
                }
                if(tempChargeList[index].currency=="PKR"){
                  tempChargeList[index].local_amount = (tempChargeList[index].net_amount*1.00).toFixed(2);
                } else {
                  tempChargeList[index].local_amount = (tempChargeList[index].net_amount*tempChargeList[index].ex_rate).toFixed(2);
                }
                let tempChargeHeadsArray = calculateChargeHeadsTotal(tempChargeList, 'full');
                dispatch({type:'set', payload:{...tempChargeHeadsArray}})
                reset({ chargeList: tempChargeList });
            }}
          />
          }
          {chargeList[index]?.currency=="PKR" && <InputNumber value={1.00} />}
          </td>
          <td>{commas(x.local_amount.toFixed(2))}</td>
          <td>{x.status === '1' ? 'Approved' : 'Unapproved'}</td>
          <td></td>
          <td></td>
          </tr>
          }
        </>
      )})}
      </tbody>}
    </Table>
    }
    {state.chargeLoad && 
      <div style={{textAlign:"center", paddingTop:'5%', paddingBottom:"5%"}}>
        <Spinner/>
      </div>
    }
    <Modal
      open={state.headVisible}
      onOk={()=>dispatch({type:'toggle', fieldName:'headVisible', payload:false})} 
      onCancel={()=>dispatch({type:'toggle', fieldName:'headVisible', payload:false})}
      width={1000} footer={false} maskClosable={false}
    >
      {state.headVisible && <PartySearch state={state} dispatch={dispatch} reset={reset} useWatch={useWatch} control={control} />}
    </Modal>
    </div>
    {(allValues.approved.length>0) && <div className='div-btn-custom-green text-center py-1 px-3 mt-3 mx-2' style={{float:'right'}} onClick={()=>{approveCharges(chargeList)}}>Approve/Unapprove</div>}
    <div className='div-btn-custom-green text-center py-1 px-3 mt-3' style={{float:'right'}} onClick={()=>{calculate(chargeList)}}>Calculate</div>
  </>
  )
}

export default React.memo(ChargesList)