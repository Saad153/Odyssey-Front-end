import React, { useEffect, useState } from 'react';
import axiosClient from 'apis/axiosClient';
import { Table, Row, Col, Spinner, Badge } from 'react-bootstrap';
import MediumModal from 'Components/Shared/Modals/MediumModal';
import CreateOrEdit from './CreateOrEdit';
import openNotification from 'Components/Shared/Notification';
import PopConfirm from '../../../Shared/PopConfirm';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import { fiscalYearSelect } from 'redux/fiscalYear/fiscalYearSlice';

const FiscalYears = () => {

    const dispatch = useDispatch();
    const selectedFiscalYearId = useSelector((state) => state.fiscalYear.value);
    const designation = (Cookies.get('designation') || '').toLowerCase();
    const isAdmin = designation === 'ceo' || designation === 'cfo' || designation === 'admin';

    const [fiscalYears, setFiscalYears] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [visible, setVisible] = useState(false);
    const [edit, setEdit] = useState(false);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState({});
    const [load, setLoad] = useState(false);

    useEffect(() => {
        getFiscalYears();
    }, []);

    const getFiscalYears = async () => {
        await axiosClient.get(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/fiscalYears/getAll`, {
            headers: { Authorization: Cookies.get('token') }
        }).then((x) => {
            if (x.data.status === 'success') {
                setFiscalYears(x.data.result);
            }
            setLoaded(true);
        }).catch(() => setLoaded(true));
    };

    const selectFiscalYear = (x) => {
        Cookies.set('fiscalYearId', x.id, { expires: 1000000000 });
        dispatch(fiscalYearSelect(x.id));
        openNotification('Success', `Now working in ${x.label}`, 'green');
    };

    const lock = (id) => {
        PopConfirm('Confirmation', 'Lock this fiscal year? Users will no longer be able to select it, and any record already in it becomes frozen.', () => {
            axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/fiscalYears/lock`, {
                id, employeeId: Cookies.get('loginId')
            }).then((x) => {
                if (x.data.status === 'success') {
                    openNotification('Success', 'Fiscal year locked!', 'green');
                    getFiscalYears();
                } else {
                    openNotification('Error', x.data.result || 'Something went wrong', 'red');
                }
            });
        });
    };

    const unlock = (id) => {
        PopConfirm('Confirmation', 'Unlock this fiscal year so users can select it again?', () => {
            axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/fiscalYears/unlock`, {
                id, employeeId: Cookies.get('loginId')
            }).then((x) => {
                if (x.data.status === 'success') {
                    openNotification('Success', 'Fiscal year unlocked!', 'green');
                    getFiscalYears();
                } else {
                    openNotification('Error', x.data.result || 'Something went wrong', 'red');
                }
            });
        });
    };

    return (
        <div className='dashboard-styles'>
            <div className='base-page-layout'>
                <Row>
                    <Col md={12}>
                        <Row>
                            <Col md="8"><h5>Fiscal Years</h5></Col>
                            {isAdmin && <Col md="4">
                                <button className='btn-custom' style={{ float: 'right' }}
                                    onClick={() => { setEdit(false); setSelectedFiscalYear({}); setVisible(true); }}>
                                    Create
                                </button>
                            </Col>}
                        </Row>
                        <div className='my-2' style={{ backgroundColor: 'silver', height: 1 }}></div>
                        {isAdmin && <MediumModal visible={visible} setVisible={setVisible} setEdit={setEdit} width={700}>
                            <CreateOrEdit
                                edit={edit}
                                selectedFiscalYear={selectedFiscalYear}
                                load={load}
                                setLoad={setLoad}
                                onSaved={() => { setVisible(false); setEdit(false); getFiscalYears(); }}
                            />
                        </MediumModal>}
                    </Col>
                    {fiscalYears.length > 0 && <Col md={12}>
                        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                            <Table className='tableFixHead' style={{ tableLayout: 'fixed' }}>
                                <thead>
                                    <tr>
                                        <th style={{ width: 50 }}>Sr.</th>
                                        <th style={{ width: 160 }}>Label</th>
                                        <th style={{ width: 90 }}>Suffix</th>
                                        <th style={{ width: 220 }}>Period</th>
                                        <th style={{ width: 110 }}>Status</th>
                                        <th style={{ width: 190 }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {fiscalYears.map((x, index) => {
                                        const isSelected = String(x.id) === String(selectedFiscalYearId);
                                        return (
                                        <tr key={index} className='f row-hov' style={isSelected ? { backgroundColor: '#eaf7ee' } : undefined}>
                                            <td>{index + 1}</td>
                                            <td className={isAdmin ? 'cur' : undefined} onClick={() => { if(isAdmin){ setSelectedFiscalYear(x); setEdit(true); setVisible(true); } }}>
                                                <span className='blue-txt fw-5'>{x.label}</span>
                                            </td>
                                            <td>{x.suffix}</td>
                                            <td>{moment(x.startDate).format('DD-MM-YYYY')} to {moment(x.endDate).format('DD-MM-YYYY')}</td>
                                            <td>
                                                {x.isLocked ? <Badge bg='secondary'>Locked</Badge> : <Badge bg='success'>Unlocked</Badge>}
                                                {isSelected && <Badge bg='primary' style={{ marginLeft: 4 }}>Selected</Badge>}
                                            </td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {!x.isLocked && !isSelected &&
                                                    <button className='btn-custom fs-11 px-2 mx-1' onClick={() => selectFiscalYear(x)}>Select</button>}
                                                {isAdmin && (x.isLocked
                                                    ? <button className='btn-custom fs-11 px-2 mx-1' onClick={() => unlock(x.id)}>Unlock</button>
                                                    : <button className='btn-red fs-11 px-2 mx-1' onClick={() => lock(x.id)}>Lock</button>)}
                                            </td>
                                        </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </div>
                    </Col>}
                    {!loaded && <div className='p-5 text-center'><Spinner /></div>}
                    {loaded && fiscalYears.length === 0 && <div className='p-5 text-center grey-txt'>No fiscal years yet.{isAdmin?' Create one to get started.':' Ask a CEO/CFO/admin to create one.'}</div>}
                </Row>
            </div>
        </div>
    );
};

export default FiscalYears;
