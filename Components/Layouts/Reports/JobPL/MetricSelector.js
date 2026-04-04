import React from 'react';
import { Checkbox } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { setMetrics } from '../../../../redux/profitLoss/profitLossSlice';

const MetricSelector = () => {
  const dispatch = useDispatch();
  const metrics = useSelector((state) => state.profitloss.metrics);
  const options = ['vol', 'weight', 'shpVol', 'teu'];
  const selected = metrics ? metrics.split(',').map(s => s.trim()).filter(s => s) : [];

  const handleChange = (checkedValues) => {
    const newValue = checkedValues.join(',');
    dispatch(setMetrics(newValue));
  };

  return (
    <Checkbox.Group
      options={options}
      value={selected}
      onChange={handleChange}
    />
  );
};

export default MetricSelector;