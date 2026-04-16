import React, { useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import BlPrint from "./BlPrint"; // your component
import BlPrintImage from "./BlPrintImage";

const BlPrintModal = ({
  show,
  handleClose,
  allValues,
  state,
  borders,
  heading,
  border,
  stamps,
  line,
  grossWeight,
  netWeight,
  containerData,
  formE,
  cbm
}) => {
  const printRef = useRef();

  return (
    <Modal
      show={show}
    onHide={handleClose}
    size="xl"
    scrollable
    dialogClassName="modal-full-height"
    >
      <Modal.Header closeButton>
        <Modal.Title>BL Print Preview</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ overflowX: "auto", height: '1000px' }}>
        <div style={{ overflowX: "auto", margin: "10px" }}>
            <BlPrintImage
            caller={false}
            allValues={allValues}
            state={state}
            borders={borders}
            heading={heading}
            border={border}
            inputRef={printRef}
            stamps={stamps}
            line={line}
            grossWeight={grossWeight}
            netWeight={netWeight}
            containerData={containerData}
            formE={formE}
            cbm={cbm}
            />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        {/* Optional: print button, or ReactToPrint inside BlPrint will handle it */}
      </Modal.Footer>
    </Modal>
  );
};

export default BlPrintModal;
