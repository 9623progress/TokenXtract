import React from "react";
import "../style/Modal.css";

const Modal = ({ closeModal, children }) => {
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="close-modal-btn" onClick={closeModal}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Modal;
