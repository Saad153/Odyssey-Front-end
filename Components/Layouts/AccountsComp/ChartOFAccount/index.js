import React, { useEffect, useReducer, useCallback } from 'react';
import { Row, Col } from 'react-bootstrap';
import CreateOrEdit from './CreateOrEdit';
import axios from 'axios';
import Cookies from 'js-cookie';
import ExcelJS from "exceljs";

import { PlusCircleOutlined, MinusCircleOutlined, RightOutlined, EditOutlined } from '@ant-design/icons';
import { Modal } from 'antd';

/* -------------------- reducer -------------------- */
function recordsReducer(state, action) {
  switch (action.type) {
    case 'toggle': {
      return { ...state, [action.fieldName]: action.payload };
    }
    case 'create': {
      return {
        ...state,
        create: true,
        visible: true,
      };
    }
    case 'edit': {
      return {
        ...state,
        edit: true,
        visible: true,
      };
    }
    case 'modalOff': {
      return {
        ...state,
        visible: false,
        create: false,
        edit: false,
      };
    }
    default:
      return state;
  }
}

const initialState = {
  records: [],
  load: true,
  visible: false,
  create: false,
  edit: false,

  // Creating Records
  selectedMainId: '',
  selectedParentId: '',
  title: '',
  isParent: false,
  subCategory: "General",
  parentRecords: [],

  // Editing Records
  selectedRecordId: '',
  selectedRecord: {}
};

/* -------------------- helpers -------------------- */
const getChildrenArray = (node) => {
  // accommodate both data shapes: node.children OR node.Child_Accounts
  if (!node) return [];
  return Array.isArray(node.children)
    ? node.children
    : Array.isArray(node.Child_Accounts)
      ? node.Child_Accounts
      : [];
};

const addCheckRecursively = (nodes) => {
  if (!Array.isArray(nodes)) return [];
  return nodes.map(n => ({
    ...n,
    check: !!n.check,
    children: addCheckRecursively(getChildrenArray(n)) // normalize into .children for internal use
  }));
};

/* -------------------- main component -------------------- */
const ChartOFAccount = ({ accountsData }) => {
  const [state, dispatch] = useReducer(recordsReducer, initialState);
  const { records, visible } = state;

  /* -------------------- load accounts -------------------- */
  const getAccounts = useCallback(async (data) => {
    try {
      if (!data) return;

      // support both top-level shapes: data.result or data (if passed directly)
      const source = data.result ?? data;

      // clone and normalize: ensure each node has .children (converted from Child_Accounts if needed)
      const normalized = addCheckRecursively(source);

      // flatten parent records (second-level) for dropdowns if needed
      const parentRecordsFlat = [];
      normalized.forEach((x) => {
        (x.children || []).forEach((y) => parentRecordsFlat.push(y));
      });

      // update state
      dispatch({ type: 'toggle', fieldName: 'records', payload: normalized });
      dispatch({ type: 'toggle', fieldName: 'parentRecords', payload: parentRecordsFlat });
    } catch (err) {
      console.error('getAccounts error:', err);
    }
  }, []);

  useEffect(() => {
    if (accountsData) getAccounts(accountsData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountsData, getAccounts]);

  /* -------------------- update codes (kept as-is) -------------------- */
  const updateCodeParents = async () => {
    let tempState = [...state.records];
    let p = 0;
    let c = 0;

    for (let x of tempState) {
      p = parseInt(x.id * 100);
      for (let y of getChildrenArray(x)) {
        p++;
        let codeP = Cookies.get('companyId').toString() + p.toString();
        try {
          await axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CODE_PARENT_ACCOUNT, {
            id: y.id,
            title: y.title,
            AccountId: y.AccountId,
            CompanyId: Cookies.get('companyId'),
            code: codeP.toString()
          });
        } catch (error) {
          console.error("Error updating parent account:", error);
        }

        c = p * 10000;
        for (let z of getChildrenArray(y)) {
          c++;
          let codeC = Cookies.get('companyId').toString() + c.toString();
          try {
            await axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CODE_CHILD_ACCOUNT, {
              id: z.id,
              title: z.title,
              ParentAccountId: y.id,
              CompanyId: Cookies.get('companyId'),
              code: codeC.toString()
            });
          } catch (error) {
            console.error("Error updating child account:", error);
          }
        }

        c = 0;
      }

      p = 0;
    }
  };

  /* -------------------- Image to Blob for Excel header -------------------- */
  const ImageToBlob = (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(resolve);
      };
      img.onerror = reject;
      img.src = imageUrl;
    });
  };

  /* -------------------- Export to Excel -------------------- */
  const exportToExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Chart Of Accounts');

      worksheet.columns = [
        { header: 'Code', key: 'code', width: 15 },
        { header: 'Account Title', key: 'title', width: 35 },
        { header: 'Type', key: 'type', width: 15 },
        { header: 'Category', key: 'cat', width: 20 },
        { header: 'Sub Category', key: 'subCat', width: 20 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D3D3D3' }
        };
        cell.border = {
          right: { style: 'thin', color: { argb: '000000' } },
          left: { style: 'thin', color: { argb: '000000' } },
          top: { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } },
        };
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });

      const rows = [];

      // iterate recursively and build rows
      const walk = (node, topTitle = null) => {
        if (!node) return;
        const type = topTitle == null ? 'Group' : node.children?.length ? 'Parent' : 'Child';
        rows.push({
          code: node.code ?? '',
          title: node.title ?? '',
          type,
          cat: topTitle ?? '',
          subCat: node.subCategory ?? ''
        });

        const children = getChildrenArray(node);
        children.forEach(child => walk(child, topTitle == null ? node.title : topTitle));
      };

      records.forEach(group => {
        walk(group, null);
      });

      worksheet.addRows(rows);

      // add some top lines (company header)
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['', '', 'House# D-213, DMCHS, Siraj Ud Daula Road, Karachi']);
      if (Cookies.get('companyId') === '1') worksheet.insertRow(1, ['', '', 'Seanet Shipping & Logistics']);
      if (Cookies.get('companyId') === '2') worksheet.insertRow(1, ['', '', 'Air Cargo Services']);
      worksheet.insertRow(1, ['']);
      worksheet.insertRow(1, ['']);

      worksheet.getCell('C3').font = { size: 16, bold: true };
      worksheet.getCell('C4').font = { size: 16, bold: true };

      const imageUrl =
        Cookies.get('companyId') === '1'
          ? '/seanet-colored.png'
          : Cookies.get('companyId') === '2'
            ? '/acs-colored.png'
            : '/sns-acs.png';

      const imageBlob = await ImageToBlob(imageUrl);
      const imageId = workbook.addImage({
        buffer: await imageBlob.arrayBuffer(),
        extension: 'png',
      });

      worksheet.addImage(imageId, {
        tl: { col: 1, row: 1 },
        ext: { width: 150, height: 100 },
      });

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'ChartOfAccounts.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export to Excel failed:', e);
    }
  };

  /* -------------------- tree helpers -------------------- */
  // Toggle node.check deep in records and return new cloned records
  const toggleNodeById = (allRecords, id) => {
    const clone = JSON.parse(JSON.stringify(allRecords || [])); // deep clone
    const recurse = (items) => {
      if (!items) return;
      for (const item of items) {
        if (String(item.id) === String(id)) {
          item.check = !item.check;
          return true; // stop once toggled
        }
        const children = item.children ?? item.Child_Accounts ?? [];
        if (children && children.length) {
          if (recurse(children)) return true;
        }
      }
      return false;
    };
    recurse(clone);
    return clone;
  };

  /* -------------------- recursive node component -------------------- */
  const AccountNode = ({ node, level = 0 }) => {
    const children = getChildrenArray(node);
    const hasChildren = children.length > 0;

    return (
      <div key={node.id} className='parent' style={{ marginLeft: level * 18 }}>
        <div
          className='child icon'
          onClick={() => {
            const updated = toggleNodeById(records, node.id);
            dispatch({ type: 'toggle', fieldName: 'records', payload: updated });
          }}
          style={{ cursor: hasChildren ? 'pointer' : 'default' }}
        >
          {hasChildren ? (node.check ? <MinusCircleOutlined /> : <PlusCircleOutlined />) : <RightOutlined />}
        </div>

        <div className='child title'>{(node.code ? node.code + ' ' : '') + node.title}</div>

        {node.editable == '0' && (
          <div
            className='child edit-icon'
            onClick={() => {
              console.log("Selected Record for Edit:", node);
              // isParent: top-level or parent-level (no ChildAccountId means parent/group)
              const isParentFlag = !node.ChildAccountId; // if node has no ChildAccountId it's a parent/group
              dispatch({ type: 'toggle', fieldName: 'selectedRecord', payload: node });
              dispatch({ type: 'toggle', fieldName: 'selectedRecordId', payload: node.id });
              dispatch({ type: 'toggle', fieldName: 'selectedParentId', payload: node.ChildAccountId.toString() || '' });
              dispatch({ type: 'toggle', fieldName: 'subCategory', payload: node.subCategory || 'General' });
              dispatch({ type: 'toggle', fieldName: 'editable', payload: node.editable || false });
              dispatch({ type: 'toggle', fieldName: 'isParent', payload: isParentFlag });
              dispatch({ type: 'edit' });
            }}
            style={{ cursor: 'pointer' }}
          >
            <EditOutlined />
          </div>
        )}

        {node.check && hasChildren && children.map((child) => (
          <AccountNode key={child.id} node={child} level={level + 1} />
        ))}
      </div>
    );
  };

  /* -------------------- UI -------------------- */
  return (
    <div className='dashboard-styles'>
      <div className='base-page-layout'>
        <div className='account-styles'>
          <Row>
            <Col><h5>Accounts</h5></Col>
            <Col>
              {/* <button className='btn-custom right' onClick={()=>updateCodeParents()}>
                Update Codes
              </button> */}
              <button className='btn-custom right' onClick={() => { dispatch({ type: 'create' }) }}>
                Create
              </button>
              <button className="btn-custom-green px-3 py-1 mx-2 float-end" onClick={exportToExcel}>
                Export to Excel
              </button>
            </Col>
          </Row>
          <hr className='my-2' />
          <Row style={{ maxHeight: '69vh', overflowY: 'auto', overflowX: 'hidden' }}>
            <div style={{ width: '100%' }}>
              {records && records.length ? (
                records.map((group) => (
                  <AccountNode key={group.id} node={group} level={0} />
                ))
              ) : (
                <div style={{ padding: 20 }}>No accounts found.</div>
              )}
            </div>
          </Row>

          <Modal
            open={visible}
            onOk={() => dispatch({ type: 'modalOff' })}
            onCancel={() => dispatch({ type: 'modalOff' })}
            width={1000}
            footer={false}
            centered={false}
          >
            <CreateOrEdit state={state} dispatch={dispatch} getAccounts={getAccounts} />
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChartOFAccount);
