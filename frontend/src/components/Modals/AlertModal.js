"use client"
import "./AlertModal.css"

const AlertModal = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="alert-modal">
        <div className="alert-modal-content">
          <p>{message}</p>
          <button className="alert-modal-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal

