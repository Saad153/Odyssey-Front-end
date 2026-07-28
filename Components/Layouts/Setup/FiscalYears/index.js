import React, { useEffect, useState } from 'react';
import axiosClient from 'apis/axiosClient';
import { Table, Row, Col, Spinner, Badge } from 'react-bootstrap';
import MediumModal from 'Components/Shared/Modals/MediumModal';
import CreateOrEdit from './CreateOrEdit';
import openNotification from 'Components/Shared/Notification';
import PopConfirm from '../../../Shared/PopConfirm';
import Cookies from 'js-cookie';
import Router from 'next/router';
import moment from 'moment';

const FiscalYears = () => {

    const [fiscalYears, setFiscalYears] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const [visible, setVisible] = useState(false);
    const [edit, setEdit] = useState(false);
    const [selectedFiscalYear, setSelectedFiscalYear] = useState({});
    const [load, setLoad] = useState(false);

    useEffect(() => {
        const designation = (Cookies.get('designation') || '').toLowerCase();
        if (designation !== 'ceo' && designation !== 'cfo' && designation !== 'admin') {
            openNotification('Error', 'This page is restricted to CEO/CFO/admin.', 'red');
            Router.push('/');
            return;
        }
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

    const activate = (id) => {
        PopConfirm('Confirmation', 'Activate this fiscal year? Any currently active fiscal year will be deactivated.', () => {
            axiosClient.post(`${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/fiscalYears/activate`, {
                id, employeeId: Cookies.get('loginId')
            }).then((x) => {
                if (x.data.status === 'success') {
                    openNotification('Success', 'Fiscal year activated!', 'green');
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
                            <Col md="4">
                                <button className='btn-custom' style={{ float: 'right' }}
                                    onClick={() => { setEdit(false); setSelectedFiscalYear({}); setVisible(true); }}>
                                    Create
                                </button>
                            </Col>
                        </Row>
                        <div className='my-2' style={{ backgroundColor: 'silver', height: 1 }}></div>
                        <MediumModal visible={visible} setVisible={setVisible} setEdit={setEdit} width={700}>
                            <CreateOrEdit
                                edit={edit}
                                selectedFiscalYear={selectedFiscalYear}
                                load={load}
                                setLoad={setLoad}
                                onSaved={() => { setVisible(false); setEdit(false); getFiscalYears(); }}
                            />
                        </MediumModal>
                    </Col>
                    {fiscalYears.length > 0 && <Col md={12}>
                        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                            <Table className='tableFixHead'>
                                <thead><tr><th>Sr.</th><th>Label</th><th>Suffix</th><th>Period</th><th>Status</th><th></th></tr></thead>
                                <tbody>
                                    {fiscalYears.map((x, index) => (
                                        <tr key={index} className='f row-hov'>
                                            <td>{index + 1}</td>
                                            <td className='cur' onClick={() => { setSelectedFiscalYear(x); setEdit(true); setVisible(true); }}>
                                                <span className='blue-txt fw-5'>{x.label}</span>
                                            </td>
                                            <td>{x.suffix}</td>
                                            <td>{moment(x.startDate).format('DD-MM-YYYY')} to {moment(x.endDate).format('DD-MM-YYYY')}</td>
                                            <td>{x.isActive ? <Badge bg='success'>Active</Badge> : <Badge bg='secondary'>Inactive</Badge>}</td>
                                            <td>
                                                {!x.isActive && <button className='btn-custom fs-11 px-2 mx-1' onClick={() => activate(x.id)}>Activate</button>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </Col>}
                    {!loaded && <div className='p-5 text-center'><Spinner /></div>}
                    {loaded && fiscalYears.length === 0 && <div className='p-5 text-center grey-txt'>No fiscal years yet. Create one to get started.</div>}
                </Row>
            </div>
        </div>
    );
};

export default FiscalYears;
