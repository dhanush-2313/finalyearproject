import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Alert, Spinner, Container, Row, Col, Modal } from 'react-bootstrap';
import MFAService from '../../../services/mfaService';

const MFASettings = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  // Disable MFA
  const handleDisableMFA = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please enter a verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await MFAService.disableMFA(token);
      
      if (result.success) {
        setSuccess('Two-factor authentication has been disabled');
        setShowDisableModal(false);
        // Update user state in parent component if needed
        if (onUpdate && typeof onUpdate === 'function') {
          onUpdate({ ...user, mfaEnabled: false });
        }
      } else {
        setError(result.error || 'Failed to disable two-factor authentication');
      }
    } catch (err) {
      setError(err.error || 'An error occurred while disabling 2FA');
    } finally {
      setLoading(false);
      setToken('');
    }
  };

  // Regenerate backup codes
  const handleRegenerateBackupCodes = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Please enter a verification code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await MFAService.regenerateBackupCodes(token);
      
      if (result.success) {
        setBackupCodes(result.backupCodes);
        setShowRegenerateModal(false);
        setShowBackupCodes(true);
        setSuccess('Backup codes regenerated successfully');
      } else {
        setError(result.error || 'Failed to regenerate backup codes');
      }
    } catch (err) {
      setError(err.error || 'An error occurred while regenerating backup codes');
    } finally {
      setLoading(false);
      setToken('');
    }
  };

  const closeModals = () => {
    setShowDisableModal(false);
    setShowRegenerateModal(false);
    setToken('');
    setError('');
  };

  return (
    <Container className="my-4">
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      
      <Card className="shadow-sm">
        <Card.Header as="h5">Two-Factor Authentication Settings</Card.Header>
        <Card.Body>
          <Row className="align-items-center">
            <Col>
              <div className="d-flex align-items-center">
                {user?.mfaEnabled ? (
                  <>
                    <span className="badge bg-success me-2">Enabled</span>
                    <span>Your account is protected with two-factor authentication</span>
                  </>
                ) : (
                  <>
                    <span className="badge bg-warning me-2">Disabled</span>
                    <span>Two-factor authentication is not enabled</span>
                  </>
                )}
              </div>
            </Col>
            <Col xs="auto">
              {user?.mfaEnabled ? (
                <Button 
                  variant="outline-danger"
                  size="sm"
                  onClick={() => setShowDisableModal(true)}
                >
                  Disable
                </Button>
              ) : (
                <Button 
                  variant="outline-success"
                  size="sm"
                  href="/account/security/mfa-setup"
                >
                  Enable
                </Button>
              )}
            </Col>
          </Row>
          
          {user?.mfaEnabled && (
            <>
              <hr />
              <h6>Backup Codes</h6>
              <p className="text-muted small">
                Backup codes can be used to access your account if you lose your mobile device.
              </p>
              <Button 
                variant="outline-primary"
                size="sm"
                onClick={() => setShowRegenerateModal(true)}
              >
                Regenerate Backup Codes
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Disable MFA Modal */}
      <Modal show={showDisableModal} onHide={closeModals}>
        <Modal.Header closeButton>
          <Modal.Title>Disable Two-Factor Authentication</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Warning:</strong> Disabling two-factor authentication will make your account less secure.
          </Alert>
          <Form onSubmit={handleDisableMFA}>
            <Form.Group className="mb-3">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter code from your authenticator app"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
              <Form.Text className="text-muted">
                Enter a code from your authenticator app or one of your backup codes
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModals}>
                Cancel
              </Button>
              <Button 
                variant="danger" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-1">Processing...</span>
                  </>
                ) : 'Disable 2FA'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Regenerate Backup Codes Modal */}
      <Modal show={showRegenerateModal} onHide={closeModals}>
        <Modal.Header closeButton>
          <Modal.Title>Regenerate Backup Codes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="warning">
            <strong>Warning:</strong> Generating new backup codes will invalidate your old codes.
          </Alert>
          <Form onSubmit={handleRegenerateBackupCodes}>
            <Form.Group className="mb-3">
              <Form.Label>Verification Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter code from your authenticator app"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={closeModals}>
                Cancel
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                    <span className="ms-1">Processing...</span>
                  </>
                ) : 'Generate New Codes'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
      
      {/* Backup Codes Display Modal */}
      <Modal show={showBackupCodes} onHide={() => setShowBackupCodes(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Backup Codes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="info">
            <strong>Important:</strong> Save these backup codes in a secure location. They won't be shown again.
          </Alert>
          
          <div className="bg-light p-3 mb-3">
            <Row>
              {backupCodes.map((code, index) => (
                <Col key={index} xs={6} md={4} className="mb-2">
                  <code>{code}</code>
                </Col>
              ))}
            </Row>
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <Button 
              variant="outline-primary"
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join('\n'));
                alert('Backup codes copied to clipboard');
              }}
            >
              Copy Codes
            </Button>
            <Button 
              variant="primary" 
              onClick={() => setShowBackupCodes(false)}
            >
              Done
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default MFASettings;