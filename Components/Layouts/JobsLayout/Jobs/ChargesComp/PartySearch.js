import { Table } from 'react-bootstrap';
import React, { useEffect, useState } from 'react';
import axiosClient from 'apis/axiosClient';
import { Tag, Input, Pagination } from 'antd';
import { CheckCircleOutlined } from "@ant-design/icons";

const PartySearch = ({ state, dispatch, reset, useWatch, control }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const chargeList = useWatch({ control, name: 'chargeList' });

  const getClients = async () => {
    // Deliberately the un-gated /getClientsForSelect endpoint, not the Setup
    // parties list route — every employee needs to pick a party for a
    // charge here, even if they can't reach Setup > Parties.
    const res = await axiosClient.get(process.env.NEXT_PUBLIC_CLIMAX_GET_CLIENTS_FOR_SELECT);
    console.log("Clients:", res.data.result);
    dispatch({ type: 'toggle', fieldName: 'clientParties', payload: res.data.result });
  };

  useEffect(() => {
    getClients();
  }, []);

  const filtered = state.clientParties.filter((x) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      x?.name?.toLowerCase().includes(term) ||
      x?.code?.toLowerCase().includes(term) ||
      x?.types?.toLowerCase().includes(term)
    );
  });

  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const Row = ({ x, i }) => (
    <tr
      key={i}
      className={`${x.check ? "table-select-list-selected" : "table-select-list"}`}
      onClick={() => {
        if (!x.check) {
          const temp = [...state.clientParties];
          temp.forEach((y, idx) => {
            temp[idx].check = y.id === x.id;
          });
          dispatch({ type: 'toggle', fieldName: 'clientParties', payload: temp });
        } else {
          let temp = [...chargeList];

          if (state.chargesTab == '1') {
            if (x.types.includes("Overseas Agent")) {
              temp[state.headIndex].invoiceType = "Agent Invoice";
              temp[state.headIndex].partyType = "agent";
            } else {
              temp[state.headIndex].partyType = "client";
              temp[state.headIndex].invoiceType = "Job Invoice";
            }
          } else {
            if (x.types.includes("Overseas Agent")) {
              temp[state.headIndex].invoiceType = "Agent Bill";
              temp[state.headIndex].partyType = "agent";
            } else {
              temp[state.headIndex].partyType = "vendor";
              temp[state.headIndex].invoiceType = "Job Bill";
            }
          }

          temp[state.headIndex] = {
            ...temp[state.headIndex],
            name: x.name,
            partyId: x.id,
          };

          reset({ chargeList: temp });

          const cleared = state.clientParties.map((c) => ({ ...c, check: false }));
          dispatch({ type: 'set', payload: { headIndex: "", headVisible: false, clientParties: cleared } });
        }
      }}
    >
      <td className='pt-1 text-center px-3'>
        {x.check ? <CheckCircleOutlined style={{ color: 'green', position: 'relative', bottom: 2 }} /> : i + 1}
      </td>
      <td className='pt-1'><strong>{x.code}</strong></td>
      <td className='pt-1'><strong>{x.name}</strong></td>
      <td className='pt-1 text-center'>
        {x.types?.split(", ").map((y, k) => (
          <Tag key={k} color="purple" className='mb-1'>{y}</Tag>
        ))}
      </td>
      <td className='pt-1 text-center'>{x.city}</td>
      <td className='pt-1 text-center'>
        <Tag color="geekblue" className='mb-1'>{x.person1}</Tag>
      </td>
      <td className='pt-1 text-center'>
        <Tag color="cyan" className='mb-1'>{x.mobile1}</Tag>
      </td>
    </tr>
  );

  return (
    <>
      <h5>Party Selection</h5>
      <hr />

      <Input
        style={{ width: 200 }}
        placeholder='Search by Code or Name'
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1);
        }}
      />

      <div className='table-sm-1 mt-4' style={{ maxHeight: 300, overflowY: 'auto' }}>
        <Table className='tableFixHead'>
          <thead>
            <tr>
              <th className='text-center'>#</th>
              <th className='text-center'>Code</th>
              <th className='text-center'>Name</th>
              <th className='text-center'>Types</th>
              <th className='text-center'>City</th>
              <th className='text-center'>Contact Persons</th>
              <th className='text-center'>Mobile</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((x, i) => (
              <Row key={i} x={x} i={(currentPage - 1) * pageSize + i} />
            ))}
          </tbody>
        </Table>
      </div>

      <Pagination
        current={currentPage}
        total={filtered.length}
        pageSize={pageSize}
        onChange={(p) => setCurrentPage(p)}
        style={{ marginTop: 10, textAlign: 'center' }}
      />
    </>
  );
};

export default React.memo(PartySearch);
