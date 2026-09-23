import TextAreaComp from 'Components/Shared/Form/TextAreaComp';
import { fetchJobsData, convetAsHtml, setJob } from './states';
import SelectComp from 'Components/Shared/Form/SelectComp';
import InputComp from 'Components/Shared/Form/InputComp';
import DateComp from 'Components/Shared/Form/DateComp';
import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Modal, Select } from 'antd';
import JobSearch from './JobSearch';
import { getAvailableAwbl } from 'apis/awbl';
import moment from 'moment';

const BlInfo = ({control, id, register, state, useWatch, dispatch, reset, type, currentJobValue, setValue, jobInfo}) => {

    const set = (a, b) => dispatch({type:'toggle', fieldName:a, payload:b})
    const allValues = useWatch({control});

    useEffect(() => {
        const retrieveData = async() => {
            if(id=='new'){
                let jobValue = await fetchJobsData(set, dispatch, currentJobValue);
                setJob(set, jobValue[0], state, reset, allValues, dispatch, id);
            }
        }
        retrieveData();
    },[])

    /* ---------------- MAWB from registered AWB stock (air jobs) ----------------
     * On air jobs the master number is picked from stock registered under
     * Setup > AWB Numbers rather than typed, so a number can only ever be used
     * once. Sea jobs are untouched and keep the free-text MBL field.
     */
    const isAir = type == "AE" || type == "AI";
    const awblId = useWatch({control, name:'awblId'});
    const mblValue = useWatch({control, name:'mbl'});
    const [awblOptions, setAwblOptions] = useState([]);

    useEffect(() => {
        if(!isAir || !jobInfo?.id) return;
        let cancelled = false;

        // Returns the unused numbers for this airline PLUS whichever number
        // this job already holds - otherwise a saved job's own AWB would be
        // missing from its dropdown (it counts as used by then) and re-saving
        // would clear it.
        getAvailableAwbl({
            airlineId: jobInfo.airLineId,
            jobId: jobInfo.id,
        }).then((res) => {
            if(cancelled || res.status != "success") return;
            setAwblOptions(res.result);
            const held = res.result.find((x) => String(x.SEJobId) === String(jobInfo.id));
            if(held) setValue('awblId', held.id);
        }).catch(() => {});

        return () => { cancelled = true; };
    }, [isAir, jobInfo?.id, jobInfo?.airLineId])

    const findNotifyParty = (id,content) => {
        state.partiesData.forEach((x)=>{
            if(id==x.id){
                set(content,convetAsHtml(x))
                set('updateContent',!state.updateContent)
            }
        })
    }

    const parseValues = (data) => {
        let tempVal = [];
        data.length>0?data.forEach((x) => {
            tempVal.push({
                value:x.id,
                label:x.name,
                code:x.code
            })
        }):null;
        return tempVal
    }

  return (
    <div style={{height:600, overflowY:'auto', overflowX:'hidden'}}>
    <Row>
        <Col md={3} className='fs-12'>
        <Row>
            <Col md={10}>
            <div className="" style={{lineHeight:1.35}}>Job No. *</div>
            <div className='dummy-input'>{allValues.jobNo}</div>
            </Col>
            <Col md={12}> 
                <div className='mt-2'></div>
                <InputComp register={register} name='hbl' control={control} width={150} 
                    label={(type=="SE"||type=="SI")?'HBL # *':"HAWB #*"}
                    // disabled={(type=="SI"||type=="AI"||type=="AE")?false:true} 
                />
            </Col>
            <Col md={12}>
                <div className='mt-2'></div>
                {!isAir &&
                    <InputComp register={register} name='mbl' control={control} width={150}
                        label={'MBL #*'}
                    />
                }
                {isAir && <>
                    <div className="">MAWB #*</div>
                    <Select showSearch allowClear style={{ width: 190 }} size='small'
                        value={awblId || undefined}
                        placeholder={
                            !jobInfo?.airLineId ? 'Set the airline on the job first'
                            : awblOptions.length ? 'Select a registered AWB'
                            : 'No unused AWBs for this airline'
                        }
                        optionFilterProp='label'
                        options={awblOptions.map((o) => ({ value: o.id, label: o.name }))}
                        onChange={(value) => {
                            const picked = awblOptions.find((o) => o.id === value);
                            // mbl stays the stored field so every existing BL print,
                            // manifest and report keeps reading the number exactly as
                            // before - the dropdown only controls what goes into it.
                            //
                            // '' (not null/undefined) on clear: undefined means "the
                            // user never touched this and the stock list may not even
                            // have loaded", and the save path leaves stock alone in
                            // that case. Only this explicit clear should release.
                            setValue('awblId', value ?? '');
                            setValue('mbl', picked ? picked.name : '');
                        }}
                    />
                    {!awblId && mblValue &&
                        <div style={{ fontSize: 11, color: '#ad6800' }}>
                            Currently {mblValue} — entered before AWB registration. Pick a
                            registered number to replace it.
                        </div>
                    }
                </>}
            </Col>
        </Row>
        </Col>
        <Col md={2} className='fs-12'>
        <Row>
            <Col md={12}>
                <SelectComp register={register} name='status' control={control} label='Status' width={120}
                    options={[ 
                        {id:'Final', name:'Final'}, 
                        {id:'Draft', name:'Draft'} 
                    ]}
                />
            </Col>
            <Col md={12}>
                <div className='mt-2'></div>
                <DateComp register={register} name='hblDate'control={control} label={(type=="SE"||type=="SI")?'HBL Date':"HAWB Date"} width={120} />
            </Col>
            <Col md={12}>
                <div className='mt-2'></div>
                <DateComp register={register} name='mblDate'control={control} label={(type=="SE"||type=="SI")?'MBL Date':"MAWB Date"} width={120} />
            </Col>
        </Row>
        </Col>
        {(type=="SE"||type=="SI") && <Col md={6}>
        <Row style={{border:'1px solid silver'}} className='pb-2 pt-1 mt-4'>
            <Col md={4}>
                <SelectComp register={register} name='blReleaseStatus' control={control} label='Release Status' width={'100%'}
                    options={[ 
                        {id:'Original'        , name:'Original'        }, 
                        {id:'Surrender'       , name:'Surrender'       },
                        {id:'Hold'            , name:'Hold'            },
                        {id:'Bank Guarantee'  , name:'Bank Guarantee'  },
                        {id:'Do Null'         , name:'Do Null'         },
                        {id:'Auction'         , name:'Auction'         },
                        {id:'Telex Release'   , name:'Telex Release'   },
                        {id:'SeaWay Bill'     , name:'SeaWay Bill'     },
                        {id:'Express Release' , name:'Express Release' },
                        {id:'Without Document', name:'Without Document'}
                    ]}
                />
            </Col>
            <Col md={4}>
                <SelectComp register={register} name='blhandoverType' control={control} label='Handover Type' width={'100%'}
                    options={[ 
                        {id:'By Hand', name:'By Hand'}, 
                        {id:'Courier', name:'Courier'},
                        {id:'Email'  , name:'Email'  },
                        {id:'Fax'    , name:'Fax'    },
                        {id:'Telex'  , name:'Telex'  },
                    ]}
                />
            </Col>
            <Col md={4}>
                <div></div>
                <SelectComp register={register} name='releaseInstruction' control={control} label='Instructions' width={'100%'}
                    options={[ 
                        {id:'Release', name:'Release'}, 
                        {id:'Stop', name:'Stop'}, 
                    ]}
                />
            </Col>
            <Col md={12}>
                <div className='mt-2'></div>
                <TextAreaComp register={register} rows={1} name='remarks' control={control} label='Remarks'/>
            </Col>
        </Row>
        </Col>}
        <Col md={12}><hr/></Col>
        <Col md={4} className='fs-12'>
        <Row className='pt-1'>
            <Col md={12}>
            <div className="" style={{lineHeight:1.35}}>Shipper *</div>
            <div className='dummy-input'>{allValues.shipper}</div>
            </Col>
            <Col md={12}>
            <div className="mt-2" style={{lineHeight:1.35}}>Consignee *</div>
            <div className='dummy-input overflow-hidden'>{allValues.consignee}</div>
            </Col>
            <Col md={12}>
                <div className='mt-2'>Notify Party #1 *</div>
                <Select style={{minWidth:'100%'}}
                    onChange={(e)=>{
                        let tempState = {...allValues};
                        tempState.notifyPartyOneId = e;
                        reset(tempState);
                        findNotifyParty(tempState.notifyPartyOneId, 'notifyOneContent')
                    }} 
                    value={allValues.notifyPartyOneId} 
                    showSearch
                    optionFilterProp="children"
                    options={parseValues(state.partiesData)}
                    filterOption={(input, option) =>
                        ((option?.label) ?? '').toLowerCase().includes(input.toLowerCase())||
                        ((option?.code) ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />
                <div className='mt-2'>Notify Party #2</div>
                <Select style={{minWidth:'100%'}}
                    onChange={(e)=>{
                        let tempState = {...allValues};
                        tempState.notifyPartyTwoId = e;
                        reset(tempState);
                        findNotifyParty(tempState.notifyPartyTwoId, 'notifyTwoContent')
                    }} 
                    value={allValues.notifyPartyTwoId} 
                    showSearch
                    optionFilterProp="children"
                    options={parseValues(state.partiesData)}
                    filterOption={(input, option) =>
                        ((option?.label) ?? '').toLowerCase().includes(input.toLowerCase())||
                        ((option?.code) ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                />
                <Row>
                    <Col md={(type=="SE"||type=="SI")?12:8}>
                        <div className="mt-2" style={{lineHeight:1.35}}>
                            {(type=="SE"||type=="SI")?"Vessel":"Airline"}
                        </div>
                        <div className='dummy-input'>
                            {(type=="SE"||type=="SI")? allValues.vessel:allValues.air_line}
                        </div>
                    </Col>
                    {(type=="AE"||type=="AI") &&
                    <Col md={4} style={{paddingLeft:0}}>
                        <div className='dummy-input' style={{marginTop:24}}>
                            {allValues.flightNo}
                        </div>
                    </Col>
                    }
                </Row>

                <div className="mt-2" style={{lineHeight:1.35}}>Shipment Date</div>
                <div className='dummy-input'>{moment(allValues.shipDate).format("DD-MM-YYYY")}</div>
            </Col>
        </Row>
        </Col>
        {!(type=="SI"||type=="SE") && <Col md={1}></Col>}
        <Col md={(type=="SI"||type=="SE")?7:5} className='fs-12'>
        <div className={`text-center`}>Booking Info</div> 
        <Row style={{border:'1px solid silver'}} className={` ${(type=="SI"||type=="SE")?"pb-3 pt-0 ":"p-4"}`}>
            <Col md={(type=="SI"||type=="SE")?5:12}>
            <Row>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>{(type=="SI"||type=="SE")?"POL":"Airport of Loading"}</div>
                    <div className='dummy-input'>{allValues.pol}</div>
                </Col>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>{(type=="SI"||type=="SE")?"POFD":"Airport of Discharge"}</div>
                    <div className='dummy-input'>{allValues.pofd}</div>
                </Col>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>{(type=="SI"||type=="SE")?"Final Dest.":"Place of Delivery"}</div>
                    <div className='dummy-input'>{allValues.fd}</div>
                </Col>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>Commodity</div>
                    <div className='dummy-input'>{allValues.commodity}</div>
                </Col>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>
                        {(type=="SI"||type=="SE")?"S/Line Carrier":"Airline"}
                    </div>
                    <div className='dummy-input'>
                        {(type=="SI"||type=="SE")?allValues.shipping_line:allValues.air_line}
                    </div>
                </Col>
            </Row>
            </Col>
            {(type=="SI"||type=="SE")&&
            <Col md={7}>
            <Row>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>Overseas Agent</div>
                    <div className='dummy-input'>{allValues.overseas_agent}</div>
                </Col>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>
                        {"S/Line Carrier"}
                    </div>
                    <div className='dummy-input'>
                        {allValues.shipping_line}
                    </div>
                </Col>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>Total Container</div>
                    <div className='dummy-input'>
                        {allValues.equip.map((x, i)=>{
                            return(<span key={i}>{x.qty} X {x.size}</span>)
                        })
                        }
                    </div>
                </Col>
                <Col md={12}>
                    <div className="mt-2" style={{lineHeight:1.35}}>Delivery</div>
                    <div className='dummy-input'>{allValues.delivery}</div>
                </Col>
            </Row>
            </Col>
            }
        </Row>
        </Col>
    </Row>
    <Modal open={state.partyVisible} maskClosable={false} width={800}
        onOk={()=>set('partyVisible', false)}
        onCancel={()=>set('partyVisible', false)}
        footer={false}
    ><JobSearch state={state} useWatch={useWatch} dispatch={dispatch} control={control} reset={reset} id={id} />
    </Modal>
    </div>
  )
}

export default React.memo(BlInfo)
