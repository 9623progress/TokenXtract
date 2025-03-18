import React from "react";
import "../style/Modal.css";

const Modal = ({ closeModal, children }) => {
  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <p className="close-modal-btn" onClick={closeModal}>
          {"\u2716"}
        </p>
        {children}
      </div>
    </div>
  );
};

export default Modal;
