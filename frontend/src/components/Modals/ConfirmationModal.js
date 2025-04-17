"use client"
import "./ConfirmationModal.css"

const ConfirmationModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay">
      <div className="confirmation-modal">
        <div className="confirmation-modal-content">
          <p>{message}</p>
          <div className="confirmation-modal-actions">
            <button className="confirmation-modal-confirm" onClick={onConfirm}>
              Confirm
            </button>
            <button className="confirmation-modal-cancel" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal

