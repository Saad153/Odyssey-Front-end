import moment from 'moment';
import React, { useEffect, useReducer, useRef, useState } from 'react'
import { Row, Col, Table } from 'react-bootstrap';
import { Modal, Input, Pagination, Spin, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import CreateOrEdit from './CreateOrEdit';
import openNotification from 'Components/Shared/Notification';
import { getAirports, deleteAirport } from 'apis/pickLists';

function recordsReducer(state, action) {
    switch (action.type) {
        case 'toggle': {
            return { ...state, [action.fieldName]: action.payload }
        }
        case 'create': {
            return { ...state, edit: false, visible: true, selectedRecord: {} }
        }
        case 'edit': {
            return { ...state, edit: true, visible: true, selectedRecord: action.payload }
        }
        case 'modalOff': {
            let returnVal = { ...state, visible: false, edit: false };
            state.edit ? returnVal.selectedRecord = {} : null
            return returnVal
        }
        default: return state
    }
}

const baseValues = {
    airportCode: "",
    airportName: "",
    city: "",
    country: "",
}

const initialState = {
    records: [],
    load: false,
    visible: false,
    edit: false,
    values: baseValues,
    selectedRecord: {},
};

const Airports = ({ airportsData, initialPage = 1, initialSearch = '' }) => {
    const [state, dispatch] = useReducer(recordsReducer, initialState);
    const { records, visible } = state;
    const [searchText, setSearchText] = useState(initialSearch);
    const [loading, setLoading] = useState(false);
    const [tablePagination, setTablePagination] = useState({
        currentPage: initialPage,
        totalRecords: airportsData?.pagination?.totalRecords || 0,
        totalPages: airportsData?.pagination?.totalPages || 1,
    });
    const searchTimerRef = useRef(null);
    const pageSize = 50;

    useEffect(() => {
        dispatch({ type: 'toggle', fieldName: 'records', payload: airportsData?.result || [] });
        setTablePagination({
            currentPage: airportsData?.pagination?.currentPage || initialPage,
            totalRecords: airportsData?.pagination?.totalRecords || 0,
            totalPages: airportsData?.pagination?.totalPages || 1,
        });
    }, [airportsData, initialPage]);

    const totalRecords = tablePagination.totalRecords || records.length;
    const totalPages = tablePagination.totalPages || 1;
    const activePage = tablePagination.currentPage || 1;
    const startIndex = (activePage - 1) * pageSize + 1;

    const fetchAirports = async (nextPage = 1, nextSearch = searchText) => {
        setLoading(true);
        try {
            const payload = await getAirports({ page: nextPage, limit: pageSize, search: nextSearch.trim() });
            const nextRecords = Array.isArray(payload?.result) ? payload.result : [];
            const pagination = payload?.pagination || {};

            dispatch({ type: 'toggle', fieldName: 'records', payload: nextRecords });
            setTablePagination({
                currentPage: Number(pagination.currentPage) || nextPage,
                totalRecords: Number(pagination.totalRecords) || nextRecords.length,
                totalPages: Number(pagination.totalPages) || 1,
            });
        } catch (error) {
            console.error('Airports fetch failed', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
        }

        searchTimerRef.current = setTimeout(() => {
            fetchAirports(1, value);
        }, 600);
    };

    const handlePageChange = (page) => {
        fetchAirports(page, searchText);
    };

    const handleDelete = async (record) => {
        try {
            await deleteAirport(record.id);
            openNotification('Success', 'Airport Deleted!', 'green');
            fetchAirports(activePage, searchText);
        } catch (error) {
            openNotification('Error', 'Could Not Delete Airport', 'red');
        }
    };

    return (
        <div className='base-page-layout'>
            <Row>
                <Col md={6}><h5>Airports</h5></Col>
                <Col md={6}><button className='btn-custom right' onClick={() => dispatch({ type: 'create' })}>Create</button></Col>
            </Row>
            <hr className='my-2' />
            <Row className='mb-3 align-items-center'>
                <Col xs={12} md={8} lg={6}>
                    <Input
                        allowClear
                        value={searchText}
                        style={{ maxWidth: 360 }}
                        placeholder='Search airports'
                        onChange={handleSearch}
                    />
                </Col>
                {totalPages > 1 && (
                    <Col xs={12} md={4} lg={6} className='text-md-end mt-2 mt-md-0'>
                        <span className='text-muted'>Page {activePage} of {totalPages}</span>
                    </Col>
                )}
            </Row>
            <div className='mt-3' style={{ maxHeight: "60vh", overflowY: 'auto', overflowX: "scroll" }}>
                <Table className='tableFixHead'>
                    <thead>
                        <tr>
                            <th style={{ width: 70 }}>Sr No</th>
                            <th>Code</th>
                            <th>Airport Name</th>
                            <th>City</th>
                            <th>Country</th>
                            <th>Created Date</th>
                            <th>Modify</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={7}>
                                    <div className='d-flex justify-content-center py-3'>
                                        <Spin />
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            records.map((x, index) => (
                                <tr key={x.id || index}>
                                    <td>{startIndex + index}</td>
                                    <td>{x.airportCode}</td>
                                    <td>{x.airportName}</td>
                                    <td>{x.city}</td>
                                    <td>{x.country}</td>
                                    <td>{moment(x.createdAt).format("DD-MM-YYYY")}</td>
                                    <td>
                                        <EditOutlined className='modify-edit' onClick={() => dispatch({ type: 'edit', payload: x })} />
                                        <Popconfirm title="Delete this airport?" onConfirm={() => handleDelete(x)} okText="Yes" cancelText="No">
                                            <DeleteOutlined className='mx-2' style={{ cursor: 'pointer' }} />
                                        </Popconfirm>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <Pagination
                    current={activePage}
                    pageSize={pageSize}
                    total={totalRecords}
                    onChange={handlePageChange}
                    showSizeChanger={false}
                />
            </div>
            <Modal
                open={visible}
                onOk={() => dispatch({ type: 'modalOff' })} onCancel={() => dispatch({ type: 'modalOff' })}
                width={900} footer={false} centered={false}
            >
                <CreateOrEdit state={state} dispatch={dispatch} baseValues={baseValues} />
            </Modal>
        </div>
    )
}

export default Airports
