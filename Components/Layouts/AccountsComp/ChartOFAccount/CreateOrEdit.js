import { Row, Col } from 'react-bootstrap';
import React from "react";
import { Form, Input, Switch, Select, notification } from 'antd';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import Cookies from 'js-cookie';

const { Option } = Select;

const CreateOrEdit = ({ state, dispatch, getAccounts, disableModal }) => {
  const companyId = useSelector((s) => s.company.value);

  const openNotification = (title, message, color) => {
    notification.open({
      message: title,
      description: message,
      icon: <ExclamationCircleOutlined style={{ color }} />,
    });
  };

  const handleSubmit = async () => {
    try {
    //   const endpoint = state.isParent
    //     ? process.env.NEXT_PUBLIC_CLIMAX_POST_CREATE_PARENT_ACCOUNT
    //     : process.env.NEXT_PUBLIC_CLIMAX_POST_CREATE_CHILD_ACCOUNT;

      const payload = {
        title: state.title,
        // CompanyId: companyId,
      };

      // Only include ParentAccountId when it's a child
      if (!state.isParent) {
        payload.ChildAccountId = state.selectedParentId || null;
        payload.subCategory = state.subCategory || "General";
      }

      console.log("Payload for account creation:", payload);

      const { data } = await axios.post(process.env.NEXT_PUBLIC_CLIMAX_POST_CREATE_CHILD_ACCOUNT, payload);
      if (data.status === "success") {
        const accountRequest = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_ACCOUNTS,{
            headers:{
                "id": `${Cookies.get('companyId')}`
            }
        }).then((x)=>x.data);
        getAccounts(accountRequest);
        dispatch({ type: "toggle", fieldName: "visible", payload: false });
        disableModal();
        openNotification("Success", `Account ${state.title} Created!`, "green");
      } else {
        openNotification("Failure", `An account named "${state.title}" already exists!`, "red");
      }
    } catch (err) {
      console.error(err);
      openNotification("Error", "Something went wrong!", "red");
    }
  };

  const handleEdit = async () => {
    try {
      const endpoint = state.isParent
        ? process.env.NEXT_PUBLIC_CLIMAX_POST_EDIT_PARENT_ACCOUNT
        : process.env.NEXT_PUBLIC_CLIMAX_POST_EDIT_CHILD_ACCOUNT;

      const payload = {
        id: state.selectedRecord.id,
        title: state.selectedRecord.title,
        CompanyId: companyId,
        employeeId: Cookies.get("loginId"),
        parentId: parseInt(state.selectedParentId)
      };

      if (!state.isParent) {
        payload.ParentAccountId = state.selectedRecord.ParentAccountId;
        payload.subCategory = state.selectedRecord.subCategory || "General";
      }

      const { data } = await axios.post(endpoint, payload);
      if (data.status === "success") {
        const accountRequest = await axios.get(process.env.NEXT_PUBLIC_CLIMAX_GET_ALL_ACCOUNTS,{
            headers:{
                "id": `${Cookies.get('companyId')}`
            }
        }).then((x)=>x.data);
        getAccounts(accountRequest);
        openNotification("Success", `Account ${state.selectedRecord.title} Updated!`, "green");
        disableModal();
      } else {
        openNotification("Failure", `A Similar Account With Name ${state.selectedRecord.title} Already Exists!`, "red");
      }
    } catch (err) {
      console.error(err);
      openNotification("Error", "Something went wrong!", "red");
    }
  };

  const renderAccountOptions = (accounts, level = 0) => {
    return accounts.map((x) => {
        const indent = "\u00A0\u00A0".repeat(level); // adds visual indentation
        return [
        <Option key={x.id} value={x.id}>
            {indent}
            {x.code ? `${x.code} — ${x.title}` : x.title}
        </Option>,
        ...(x.children ? renderAccountOptions(x.children, level + 1) : []),
        ];
    });
  };

  console.log("Current State in CreateOrEdit:", state);

  return (
    <div className="employee-styles">
      <Form name="basic" onFinish={state.edit ? handleEdit : handleSubmit}>
        <h6>{state.edit ? "Edit Account" : "Create Account"}</h6>
        <hr />
        <Row>
          {/* Parent Account (immediate only) */}
          <Col md={6}>
            <Form.Item label="Parent Account">
              <Select
                showSearch
                placeholder="Select Parent Account"
                allowClear
                value={parseInt(state.selectedParentId)}
                style={{ width: "100%" }}
                optionFilterProp="children"
                onChange={(e)=>{
                    dispatch({ type: "toggle", fieldName: "selectedParentId", payload: e });
                }}
                >
                {renderAccountOptions(state.records)}
                </Select>
            </Form.Item>
          </Col>

          {/* Sub Category */}
          <Col md={6}>
            <Form.Item label="Sub Category">
              <Select
                placeholder="Select Sub Category"
                disabled={state.isParent || state.edit}
                value={state.edit ? state.selectedRecord.subCategory : state.subCategory}
                onChange={(e) => {
                  if (state.edit) {
                    dispatch({
                      type: "toggle",
                      fieldName: "selectedRecord",
                      payload: { ...state.selectedRecord, subCategory: e },
                    });
                  } else {
                    dispatch({ type: "toggle", fieldName: "subCategory", payload: e });
                  }
                }}
              >
                <Option value="General">General</Option>
                <Option value="Cash">Cash</Option>
                <Option value="Bank">Bank</Option>
                <Option value="COGS">COGS</Option>
                <Option value="Admin Expense">Admin Expense</Option>
              </Select>
            </Form.Item>
          </Col>

          {/* Parent Switch */}
          <Col md={6}>
            <Form.Item label="Editable">
              <Switch
                disabled={state.edit}
                checked={state.editable}
                onChange={() =>
                  dispatch({
                    type: "toggle",
                    fieldName: "editable",
                    payload: !state.editable,
                  })
                }
              />
            </Form.Item>
          </Col>

          {/* Title */}
          <Col md={6}>
            <Form.Item label="Title">
              <Input
                required
                value={state.edit ? state.selectedRecord.title : state.title}
                onChange={(e) => {
                  const val = e.target.value;
                  if (state.edit) {
                    dispatch({
                      type: "toggle",
                      fieldName: "selectedRecord",
                      payload: { ...state.selectedRecord, title: val },
                    });
                  } else {
                    dispatch({ type: "toggle", fieldName: "title", payload: val });
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col md={12}>
            <hr />
            <button className="btn-custom" type="submit">
              Submit
            </button>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default React.memo(CreateOrEdit);
