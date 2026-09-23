import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Select, Table, Tag, Spin, Checkbox, Alert } from 'antd';
import openNotification from 'Components/Shared/Notification';
import { describeSaveError } from 'functions/saveErrorMessage';
import { getMergeImpact, mergeParty } from 'apis/parties';

const money = (n) =>
  Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/**
 * Replaces a party that should never have existed with the correct one.
 *
 * The flow is deliberately impact-first: nothing can be chosen until the user
 * has seen what points at the party. Where accounting records exist the merge
 * is refused and the unpaid invoices are listed instead, because those have to
 * be settled or moved by a person - no automatic rewrite of who owes money.
 */
const ReplacePartyModal = ({ open, onClose, party, parties, onDone }) => {
  const [impact, setImpact] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toId, setToId] = useState(undefined);
  const [deleteAfter, setDeleteAfter] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !party?.id) return;
    setImpact(null);
    setToId(undefined);
    setLoading(true);
    getMergeImpact(party.id)
      .then((res) => {
        if (res.status === 'success') setImpact(res.result);
        else openNotification('Error', res.result || 'Could not check this party.', 'red', 8);
      })
      .catch((err) => openNotification('Error', describeSaveError(err, 'Could not check this party.'), 'red', 10))
      .finally(() => setLoading(false));
  }, [open, party?.id]);

  // Replacing a party with itself is the one choice that is always wrong.
  const options = useMemo(
    () => (parties || [])
      .filter((p) => String(p.id) !== String(party?.id))
      .map((p) => ({ value: p.id, label: `${p.name}${p.code ? ` (${p.code})` : ''}` })),
    [parties, party?.id]
  );

  const submit = async () => {
    if (!toId) return openNotification('Error', 'Choose the party to replace it with.', 'red');
    setSaving(true);
    try {
      const res = await mergeParty({ fromId: party.id, toId, deleteAfter });
      if (res.status === 'success') {
        const { moved, movedTotal, to, deleted } = res.result;
        openNotification(
          'Party Replaced',
          `${movedTotal} reference${movedTotal === 1 ? '' : 's'} moved to ${to.name}` +
          (moved.length ? ` (${moved.map((m) => `${m.count} ${m.label.toLowerCase()}`).join(', ')})` : '') +
          `. ${deleted ? 'The old party was removed.' : 'The old party was kept.'}`,
          'green', 12
        );
        onDone?.();
        onClose();
      } else {
        openNotification('Not Replaced', res.result || 'Could not replace this party.', 'red', 12);
        if (res.impact) setImpact(res.impact);
      }
    } catch (err) {
      openNotification('Not Replaced', describeSaveError(err, 'Could not replace this party.'), 'red', 12);
    } finally {
      setSaving(false);
    }
  };

  const blocked = impact && !impact.canMerge;

  return (
    <Modal open={open} onCancel={saving ? undefined : onClose} maskClosable={false} width={780}
      title={`Replace party: ${party?.name || ''}`}
      okText={saving ? 'Replacing...' : 'Replace'}
      onOk={submit}
      okButtonProps={{ disabled: saving || loading || blocked || !toId, danger: true }}
      cancelButtonProps={{ disabled: saving }}
    >
      <Spin spinning={loading || saving}>
        {impact && <>
          {blocked &&
            <Alert type="error" showIcon className='mb-3'
              message="This party cannot be replaced"
              description={
                <>
                  It is named on {impact.financial.map((f) => `${f.count} ${f.label.toLowerCase()}`).join(', ')}.
                  Moving accounting records between parties would change who owes money, so they have to be
                  settled or reassigned first. Any unpaid invoices are listed below.
                </>
              }
            />
          }

          {!blocked &&
            <Alert type="info" showIcon className='mb-3'
              message="No accounting records"
              description="Nothing is invoiced against this party, so it is safe to replace. Everything below will be moved to the party you choose."
            />
          }

          <div className='mb-3'>
            <b>What points at this party</b>
            {impact.operational.length === 0 && impact.financial.length === 0 &&
              <div style={{ fontSize: 12, color: 'grey' }}>Nothing at all — it can simply be deleted.</div>}
            <div className='mt-1'>
              {impact.operational.map((r) => (
                <Tag key={`${r.table}.${r.column}`} color='blue'>{r.label}: {r.count}</Tag>
              ))}
              {impact.financial.map((r) => (
                <Tag key={`${r.table}.${r.column}`} color='red'>{r.label}: {r.count}</Tag>
              ))}
            </div>
          </div>

          {impact.unpaid?.length > 0 &&
            <div className='mb-3'>
              <b>Unpaid invoices ({impact.unpaid.length})</b>
              <div style={{ fontSize: 12, color: 'grey', marginBottom: 6 }}>
                Settle or move these before the party can be replaced.
              </div>
              <Table size='small' rowKey='invoice_No' pagination={{ pageSize: 8, size: 'small' }}
                dataSource={impact.unpaid}
                columns={[
                  { title: 'Invoice', dataIndex: 'invoice_No', width: 150 },
                  { title: 'Type', dataIndex: 'payType', width: 100 },
                  { title: 'Date', dataIndex: 'on', width: 110,
                    render: (v) => String(v || '').slice(0, 10) },
                  { title: 'Total', dataIndex: 'total', align: 'right',
                    render: (v) => money(v) },
                  { title: 'Outstanding', dataIndex: 'outstanding', align: 'right',
                    render: (v) => <b style={{ color: '#a8071a' }}>{money(v)}</b> },
                ]}
              />
            </div>
          }

          {!blocked &&
            <>
              <div className='mb-1'><b>Replace with *</b></div>
              <Select showSearch style={{ width: '100%' }} value={toId} onChange={setToId}
                placeholder='Choose the party to keep'
                optionFilterProp='label' options={options}
              />
              <div className='mt-3'>
                <Checkbox checked={deleteAfter} onChange={(e) => setDeleteAfter(e.target.checked)}>
                  Delete "{party?.name}" afterwards
                </Checkbox>
                <div style={{ fontSize: 11, color: 'grey' }}>
                  Untick to keep the old party in the list with nothing pointing at it.
                </div>
              </div>
            </>
          }
        </>}
      </Spin>
    </Modal>
  );
};

export default ReplacePartyModal;
