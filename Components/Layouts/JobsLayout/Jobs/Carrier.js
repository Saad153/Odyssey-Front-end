import React, { useEffect } from 'react';
import SelectSearchComp from '/Components/Shared/Form/SelectSearchComp';
import DateComp from '/Components/Shared/Form/DateComp';
import TimeComp from '/Components/Shared/Form/TimeComp';
import InputComp from '/Components/Shared/Form/InputComp';
import Dates from './Dates';
import { Popover } from "antd";
import { Row, Col } from "react-bootstrap";

const Carrier = ({state, register, control, pageLinking, dispatch, getStatus, approved, VoyageId, vesselId, type}) => {
    // console.log("state carrier",state)
    
    function getVoyageNumber (id) {
        let result = '';
        if(state.voyageList[0]){
            state.voyageList.forEach((x)=>{
                // console.log("x",x)
            if(x.id==id){
                result ={
                    voyage: x.voyage,
                    etd: x.importOriginSailDate,
                    eta: x.importArrivalDate,
                    exportEtd:x.exportSailDate,
                    exportEta: x.destinationEta,
                    cutoffDate: x.cutOffDate,
                    cutoffTime: x.cutOffTime
                    

                } 
            }
            })
        }
        return result
    }

    const filterVessels = (list) => {
        let result = [];
        list.forEach((x)=>{
            result.push({id:x.id, name:x.name+" ~ "+x.code, code:x.code})
        })
        return result
    }
    const voyageFilterData=  getVoyageNumber(VoyageId)

  return (
    <div className='px-2 pb-2 mt-3' style={{border:'1px solid silver'}}>
        {(type=="SE"||type=="SI") && <>
        <div className='custom-link mt-2' onClick={()=>pageLinking("vessel")} >Vessel *</div>
        {/* <SelectSearchComp register={register} name='vesselId' control={control} label=''disabled={getStatus(approved)} width={"100%"}
            options={filterVessels(state.fields.vessel)}
        /> */}
        <SelectSearchComp
            register={register}
            clear={true}
            name='vesselId'
            control={control}
            label=''
            disabled={getStatus(approved)}
            options={filterVessels(state.fields.vessel)}
            width={"100%"}
        />
        <div className='mt-2'>Voyage *</div>
        <div className="dummy-input"
            onClick={()=>{
                if(vesselId!=undefined && vesselId!=''){
                    dispatch({type:'voyageSelection', payload:vesselId})
                }
            }}
        >{voyageFilterData.voyage }</div>
        <Row>
            <Col md={6}>
                <div className='my-2'></div>
                <DateComp register={register} name="etd" defaultValues={voyageFilterData.etd ||voyageFilterData.exportEtd } control={control} label='ETD' disabled={getStatus(approved)} />
            </Col>
            <Col md={6}>
                <div className='my-2'></div>
                <DateComp register={register}  name="eta" control={control} defaultValues={voyageFilterData.eta ||voyageFilterData.exportEta} label='ETA' disabled={getStatus(approved)} />
            </Col>
            {type=="SI" &&<>
            <Col md={12}>
                <div className='my-2'></div>
                <InputComp register={register} name='cbkg' control={control} label='C.BKG/ED'  disabled={getStatus(approved)} />
            </Col>
            </>}
            {type=="SE" &&<>
            <Col md={6}>
                <div className='my-2'></div>
                <DateComp register={register} name='cutOffDate' defaultValues={voyageFilterData.cutoffDate } control={control} label='Cut Off'  disabled={getStatus(approved)} />
            </Col>
            <Col md={6}>
                <div className='my-2'></div>
                <TimeComp register={register} name='cutOffTime' defaultValues={voyageFilterData.cutoffTime } control={control} label='Time'  width={100} disabled={getStatus(approved)} />
            </Col>
            </>}
        </Row>
        <div className='mt-3'></div>
        <Popover trigger="click"
        content={
            <div style={{border:'1px solid silver', paddingLeft:10, paddingTop:20, paddingBottom:20}}>
                <Dates register={register} control={control} disabled={getStatus(approved)} />
            </div>
        }>
            <span className='ex-btn py-2 px-3'>Dates</span>
        </Popover>
        <div className='mt-2'></div>
        </>
        }
        {(type=="AE"||type=="AI") && <>
        <Row>
            <Col md={12} className='pt-2'>
                <InputComp register={register} name='flightNo' control={control} label='Flight No.' disabled={getStatus(approved)} />
            </Col>
        </Row>
        <Row>

            <Col md={6}>
                <div className='my-2'></div>
                <DateComp register={register} name='arrivalDate' control={control} label='Arrival' disabled={getStatus(approved)} />
            </Col>
            <Col md={6}>
                <div className='my-2'></div>
                <TimeComp register={register} name='arrivalTime' control={control} label='.'  width={100} disabled={getStatus(approved)} />
                
            </Col>

            <Col md={6}>
                <div className='my-2'></div>
                <DateComp register={register} name='departureDate' control={control} label='Departure' disabled={getStatus(approved)} />
            </Col>
            <Col md={6}>
                <div className='my-2'></div>
                <TimeComp register={register} name='departureTime' control={control} label='.'  width={100} disabled={getStatus(approved)} />
                
            </Col>
            <Col md={12}>
                <div className='my-2'></div>
                <InputComp register={register} name='cbkg' control={control} label='C.BKG/ED'  disabled={getStatus(approved)} />
            </Col>
        </Row>
        <div className='mt-3'></div>
        <Popover trigger="click"
        content={
            <div style={{border:'1px solid silver', paddingLeft:10, paddingTop:20, paddingBottom:20}}>
                <Dates register={register} control={control} disabled={getStatus(approved)} />
            </div>
        }>
            <span className='ex-btn py-2 px-3'>Dates</span>
        </Popover>
        <div className='mt-2'></div>
        </>
        }
    </div> 
  )}

export default React.memo(Carrier)