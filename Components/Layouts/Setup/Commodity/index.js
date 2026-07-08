import React, { useEffect, useReducer, useState, useRef } from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import { Modal, Input, Pagination, Spin } from 'antd';
import CreateOrEdit from './CreateOrEdit';
import { EditOutlined, FireOutlined } from '@ant-design/icons';
import axiosClient from 'apis/axiosClient';

function recordsReducer(state, action){
    switch (action.type) {
      case 'toggle': { 
        return { ...state, [action.fieldName]: action.payload } 
      }
      case 'create': {
        return {
            ...state,
            edit: false,
            visible: true,
        }
      }
      case 'edit': {
        return {
            ...state,
            selectedRecord:{},
            edit: true,
            visible: true,
            selectedRecord:action.payload
        }
      }
      case 'modalOff': {
        let returnVal = { ...state, visible: false, edit: false };
        state.edit?returnVal.selectedRecord={}:null
        return returnVal
      }
      default: return state 
    }
}

const baseValues = {
  name:"",
  hs:"",
  cargoType:"",
  commodityGroup:"",
  active:"",
  isHazmat:[],
  packageGroup:"",
  hazmatCode:"",
  hazmatClass:"",
  chemicalName:"",
  unoCode:""
}

const initialState = {
    records: [],
    load:false,
    visible:false,
    edit:false,
    values:baseValues,
    selectedRecord:{},
};

const Commodity = ({ CommodityData, initialPage = 1, initialSearch = '' }) => {
  const [ state, dispatch ] = useReducer(recordsReducer, initialState);
  const { records, visible } = state;
  const [searchText, setSearchText] = useState(initialSearch);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [tablePagination, setTablePagination] = useState({
    currentPage: initialPage,
    totalRecords: CommodityData?.pagination?.totalRecords || 0,
    totalPages: CommodityData?.pagination?.totalPages || 1,
  });
  const searchTimerRef = useRef(null);
  const pageSize = 50;

  useEffect(() => {
    dispatch({ type:'toggle', fieldName:'records', payload: CommodityData?.result || [] });
    setTablePagination({
      currentPage: CommodityData?.pagination?.currentPage || initialPage,
      totalRecords: CommodityData?.pagination?.totalRecords || 0,
      totalPages: CommodityData?.pagination?.totalPages || 1,
    });
  }, [CommodityData, initialPage]);

  useEffect(() => {
    setSearchText(initialSearch);
    setCurrentPage(initialPage);
  }, [initialSearch, initialPage]);

  const totalRecords = tablePagination.totalRecords || records.length;
  const totalPages = tablePagination.totalPages || 1;
  const activePage = tablePagination.currentPage || currentPage || 1;
  const startIndex = (activePage - 1) * pageSize + 1;

  const fetchCommodities = async (nextPage = 1, nextSearch = searchText) => {
    setLoading(true);

    try {
      const response = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CREATE_COMMODITY, {
        headers: { Authorization: localStorage.getItem('token') || '' },
        params: {
          search: nextSearch.trim() || undefined,
          page: nextPage,
          limit: pageSize,
        },
      });

      const payload = response?.data || {};
      const nextRecords = Array.isArray(payload?.result) ? payload.result : [];
      const pagination = payload?.pagination || {};

      dispatch({ type:'toggle', fieldName:'records', payload: nextRecords });
      setTablePagination({
        currentPage: Number(pagination.currentPage) || nextPage,
        totalRecords: Number(pagination.totalRecords) || nextRecords.length,
        totalPages: Number(pagination.totalPages) || 1,
      });
      setCurrentPage(nextPage);
    } catch (error) {
      console.error('Commodity fetch failed', error);
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
      fetchCommodities(1, value);
    }, 600);
  };

  const handlePageChange = (page) => {
    fetchCommodities(page, searchText);
  };

  return (
    <div className='base-page-layout'>
      <Row>
        <Col><h5>Commodity</h5></Col>
        <Col><button className='btn-custom right' onClick={()=>dispatch({ type: 'create' })}>Create</button></Col>
      </Row>
      <hr className='my-2' />
      <Row className='mb-3 align-items-center'>
        <Col xs={12} md={8} lg={6}>
          <Input
            allowClear
            value={searchText}
            style={{ maxWidth: 360 }}
            placeholder='Search commodity'
            onChange={handleSearch}
          />
        </Col>
        {totalPages > 1 && (
          <Col xs={12} md={4} lg={6} className='text-md-end mt-2 mt-md-0'>
            <span className='text-muted'>Page {activePage} of {totalPages}</span>
          </Col>
        )}
      </Row>
      <Row>
        <Col md={12}>
        <div className='table-sm-1 mt-3' style={{maxHeight:650, overflowY:'auto'}}>
          <Table className='tableFixHead'>
            <thead>
              <tr>
                <th style={{ width: 70 }}>Sr No</th>
                <th style={{ minWidth: 220 }}>Name</th>
                <th>HSC</th>
                <th>Cargo Type</th>
                <th>Commodity Group</th>
                <th>Hazmat</th>
                <th>Hazmat Details</th>
                <th>Modify</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className='d-flex justify-content-center py-3'>
                      <Spin />
                    </div>
                  </td>
                </tr>
              ) : (
                records.map((x, index) => {
                  const serialNumber = startIndex + index;
                  return (
                    <tr key={`${x.id || serialNumber}-${index}`} className='f'>
                      <td>{serialNumber}</td>
                      <td>
                        <div
                          title={x.name}
                          style={{
                            maxWidth: 220,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <strong>{x.name}</strong>
                        </div>
                      </td>
                      <td>{x.hs}</td>
                      <td>{x.cargoType}</td>
                      <td>{x.commodityGroup}</td>
                      <td>
                        {x.isHazmat == 1 ? (
                          <span className='green-txt'>
                            <strong>Yes</strong>
                            <FireOutlined className='mx-1' style={{ position: 'relative', bottom: 3 }} />
                          </span>
                        ) : (
                          <span className='grey-txt'><strong>No</strong></span>
                        )}
                      </td>
                      <td>
                        {x.isHazmat == 1 ? (
                          <div
                            style={{
                              maxWidth: 260,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={`${x.hazmatClass || ''}${x.hazmatCode ? `, ${x.hazmatCode}` : ''}${x.packageGroup ? `, ${x.packageGroup}` : ''}${x.chemicalName ? `, ${x.chemicalName}` : ''}${x.unoCode ? `, ${x.unoCode}` : ''}`}
                          >
                            {x.hazmatClass}{x.hazmatClass ? ', ' : ''}
                            {x.hazmatCode}{x.hazmatCode ? ', ' : ''}
                            {x.packageGroup}{x.packageGroup ? ', ' : ''}
                            {x.chemicalName}{x.chemicalName ? ', ' : ''}
                            {x.unoCode}
                          </div>
                        ) : null}
                      </td>
                      <td>
                        <span>
                          <EditOutlined className='modify-edit' onClick={() => dispatch({ type: 'edit', payload: x })} />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
        </Col>
      </Row>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
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
      onOk={()=>dispatch({ type: 'modalOff' })} onCancel={()=>dispatch({ type: 'modalOff' })}
      width={1000} footer={false} centered={false}
    >
      <CreateOrEdit state={state} dispatch={dispatch} baseValues={baseValues} />
    </Modal>
    </div>
  )
}

export default Commodity;