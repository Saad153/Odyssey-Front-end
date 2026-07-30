import { useForm, useFieldArray, Controller, useWatch } from "react-hook-form";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getChargeHeads } from "apis/jobs";
import { Row, Col } from 'react-bootstrap';
import { setHeadsCache } from '../states';
import { useSelector,useDispatch } from 'react-redux';
import React, { useEffect, useState } from 'react';
import {setApproved } from '../../../../../redux/invoice/invoiceSlice';
import Charges from './Charges';
import { Table, Tabs } from 'antd';
import axiosClient from 'apis/axiosClient';

  const ChargesComp = ({state, dispatch, type, allValues}) => {

  const dispatchNew = useDispatch();
  const queryClient = useQueryClient();
  const companyId = useSelector((state) => state.company.value);
  const {approved} = useSelector((state) => state.invoice);
  const { register, setValue, control, handleSubmit, reset } = useForm({});
  const { fields, append, remove } = useFieldArray({ control, name:"chargeList" });
  const chargeList = useWatch({ control, name:'chargeList' });
  const [ dataSource, setDataSource ] = useState([]);
  const [ er, setER ] = useState([]);
  const [ summaryLoading, setSummaryLoading ] = useState(true);

  const chargeMap = Object.fromEntries(
    (state.fields.chargeList || []).map(c => [String(c.id), c.name])
  );

  const num = (v) => Number(v || 0);

  const { data:chargesData, refetch, isLoading:chargesLoading } = useQuery({
    queryKey:["charges", {id:state.selectedRecord.id}],
    queryFn: () => getChargeHeads({id:state.selectedRecord.id})
  });

  const normalizeChargeProfitability = (voucherData, invoiceBillList) => {
  const grouped = {};


  voucherData.forEach(item => {
    const chargeId = String(item.Charge_Name);

    if (!grouped[chargeId]) {
      grouped[chargeId] = {
        charge_no: item.Charge_Name,
        charge: chargeId,

        realized_revenue: 0,
        unrealized_revenue: 0,
        total_revenue: 0,

        realized_cost: 0,
        unrealized_cost: 0,
        total_cost: 0,

        realized_net: 0,
        unrealized_net: 0,
        total_net: 0,
      };
    }

    // 👉 Revenue
    if (item.DirectJob.Type === 'revenue') {
      grouped[chargeId].realized_revenue += num(item.Amount);
    }

    // 👉 Cost
    if (item.DirectJob.Type === 'expense') {
      grouped[chargeId].realized_cost += num(item.Amount);
    }
  });

  invoiceBillList?.filter(item => item.status == '1').forEach(item => {
    const chargeId = String(item.charge);

    if (!grouped[chargeId]) {
      grouped[chargeId] = {
        charge_no: item.charge,
        charge: chargeId,

        realized_revenue: 0,
        unrealized_revenue: 0,
        total_revenue: 0,

        realized_cost: 0,
        unrealized_cost: 0,
        total_cost: 0,

        realized_net: 0,
        unrealized_net: 0,
        total_net: 0,
      };
    }

    // 👉 Revenue
    if (item.invoiceType === 'Job Invoice' && item.type === 'Recievable') {
      if(item.Invoice?.Invoice_Transactions.length > 0){
        item.Invoice.Invoice_Transactions.forEach(tran => {
          grouped[chargeId].realized_revenue += num(tran.amount);
          grouped[chargeId].unrealized_revenue += num(item.local_amount - num(tran.amount));
        })
      }else{
        grouped[chargeId].unrealized_revenue += num(item.local_amount);
      }
    }

    // 👉 Cost
    if (item.invoiceType === 'Job Bill' && item.type === 'Payble') {
      if(item.Invoice.Invoice_Transactions.length > 0){
        item.Invoice.Invoice_Transactions.forEach(tran => {
          grouped[chargeId].realized_cost += num(tran.amount);
        })
        grouped[chargeId].unrealized_cost += num(item.local_amount - grouped[chargeId].realized_cost);
      }else{
        grouped[chargeId].unrealized_cost += num(item.local_amount);
      }
    }
  });

  // 👉 Final totals
  Object.values(grouped).forEach(row => {
    row.total_revenue = row.realized_revenue + row.unrealized_revenue;
    row.total_cost = row.realized_cost + row.unrealized_cost;

    row.realized_net = row.realized_revenue - row.realized_cost;
    row.unrealized_net = row.unrealized_revenue - row.unrealized_cost;
    row.total_net = row.total_revenue - row.total_cost;
  });

  return Object.values(grouped);
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setSummaryLoading(true);
        // async logic here
        const response = await axiosClient.get(
          `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/voucher/getJobData`,
          {
            headers: {
              id: state.selectedRecord.id
            }
          }
        );
        const temp = response.data.result.map((x) => {
        const chargeId = x.Charge_Id ?? x.Charge_Name; // supports both cases

        return {
          id: x.id,
          charge: chargeId, // keep ID for render / consistency

          // ---- PLACEHOLDER VALUES ----
          realized_revenue: x.Amount || 0,
          unrealized_revenue: 0,
          total_revenue: x.Amount || 0,

          realized_cost: 0,
          unrealized_cost: 0,
          total_cost: 0,

          realized_net: (x.Amount || 0),
          unrealized_net: 0,
          total_net: (x.Amount || 0),
        };
      });
      const tableData = normalizeChargeProfitability(
        response.data.result,          // first payload (not used yet, reserved)
        chargeList     // second payload
      );

      setDataSource(tableData);
        setER(response.data.result);
      } catch (error) {
        console.error(error);
      } finally {
        setSummaryLoading(false);
      }
    };

    fetchData();
  }, [chargeList]);

  useEffect(()=>{
    allValues.charges = chargeList
  }, [chargeList])

  useEffect(() => {
    if(chargesData){
      chargesData.charges.forEach((x)=>{
        if(x.Invoice?.approved && x.Invoice?.approved == "1"){
          dispatchNew(setApproved("1"))
        }
      })
      // chargesData already came from the useQuery fetch above - reuse it
      // instead of re-fetching the exact same /invoice/getHeadesNew data
      // via getHeadsNew(), which was firing a redundant network round trip
      // on every load.
      const { charges, ...totals } = chargesData;
      reset({ chargeList: [...charges] });
      dispatch({ type:'set', payload:{ chargeLoad:false, ...totals } });
    }
  }, [chargesData])

  const columns= [
    {
      title: '#',
      dataIndex: 'charge_no',
      key: 'charge_no',
    },
    {
      title: 'Charge',
      dataIndex: 'charge',
      key: 'charge',
      render: (chargeId) =>
        chargeMap[String(chargeId)] || '-'
    },
    {
      title: 'Realized Revenue',
      dataIndex: 'realized_revenue',
      key: 'realized_revenue',
    },
    {
      title: 'Unrealized Revenue',
      dataIndex: 'unrealized_revenue',
      key: 'unrealized_revenue',
    },
    {
      title: 'Total Revenue',
      dataIndex: 'total_revenue',
      key: 'total_revenue',
    },
    {
      title: 'Realized Cost',
      dataIndex: 'realized_cost',
      key: 'realized_cost',
    },
    {
      title: 'Unrealized Cost',
      dataIndex: 'unrealized_cost',
      key: 'unrealized_cost',
    },
    {
      title: 'Total Cost',
      dataIndex: 'total_cost',
      key: 'total_cost',
    },
    {
      title: 'Realized Net',
      dataIndex: 'realized_net',
      key: 'realized_net',
    },
    {
      title: 'Unrealized Net',
      dataIndex: 'unrealized_net',
      key: 'unrealized_net',
    },
    {
      title: 'Total Net',
      dataIndex: 'total_net',
      key: 'total_net',
    }
  ]

  // useEffect(() => {
  //   let obj = { charges:chargeList, payble:state.payble, reciveable:state.reciveable };
  //   queryClient.setQueryData(['charges', {id:state.selectedRecord.id}], (x)=>x?{...obj}:x);
  // }, [chargeList])

  return (
    <>
    <div style={{minHeight:525, maxHeight:525}}>
      <Tabs defaultActiveKey="1" onChange={(e)=> dispatch({type:'toggle', fieldName:'chargesTab',payload:e})}>
      <Tabs.TabPane tab="Receivable" key="1">
        <Charges state={state} dispatch={dispatch} type={"Recievable"} register={register} setValue={setValue}
          chargeList={chargeList} fields={fields} append={append} reset={reset} remove={remove} control={control}
          companyId={companyId} operationType={type} allValues={allValues} chargesData={chargesData}
          chargesLoading={chargesLoading}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Payable" key="2">
        <Charges state={state} dispatch={dispatch} type={"Payble"} register={register} setValue={setValue}
          chargeList={chargeList} fields={fields} append={append} reset={reset} remove={remove} control={control}
          companyId={companyId} operationType={type} allValues={allValues} chargesData={chargesData}
          chargesLoading={chargesLoading}
        />
      </Tabs.TabPane>
      <Tabs.TabPane tab="Summary" key="3">
        <div style={{minHeight:430, maxHeight:430}}>
          <Table columns={columns} dataSource={dataSource} loading={summaryLoading}
            locale={{ emptyText: summaryLoading ? 'Loading...' : 'No charges found for this job.' }}
          />
        </div>
      </Tabs.TabPane>
    </Tabs>
    <hr/>
    </div>
    <div className='px-3'>
    <Row className='charges-box' >
      <Col md={9}>
        <Row className='my-1'>
          <Col style={{maxWidth:100}} className="py-4">
            Receivable:
          </Col>
          <Col>
            <div className='text-center'>PP</div>
            <div className="field-box p-1 text-end">
              {state.reciveable.pp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
          <Col>
            <div className='text-center'>CC</div>
            <div className="field-box p-1 text-end">
              {state.reciveable.cc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
          <Col>
            <div className='text-center'>Tax</div>
            <div className="field-box p-1 text-end">
              {state.reciveable.tax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
          <Col>
            <div className='text-center'>Total</div>
            <div className="field-box p-1 text-end">
              {state.reciveable.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
        </Row>
        <Row className='my-1'>
          <Col style={{maxWidth:100}} className="py-4">
            Payable:
          </Col>
          <Col>
            <div className='text-center'>PP</div>
            <div className="field-box p-1 text-end">
              {state.payble.pp.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
          <Col>
            <div className='text-center'>CC</div>
            <div className="field-box p-1 text-end">
              {state.payble.cc.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
          <Col>
            <div className='text-center'>Tax</div>
            <div className="field-box p-1 text-end">
              {state.payble.tax.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
          <Col>
            <div className='text-center'>Total</div>
            <div className="field-box p-1 text-end">
              {state.payble.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
            </div>
          </Col>
        </Row>
      </Col>
      <Col md={2} className="py-4">
        <div className='text-center mt-3'>Net</div>
        <div className="field-box p-1 text-end">
          {(state.reciveable.total-state.payble.total).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </div>
      </Col>
    </Row>
    </div>
    </>
  )
}

export default React.memo(ChargesComp)
