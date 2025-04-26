import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Image,
  Alert,
  AlertIcon,
  AlertTitle,
  Code,
  Divider,
  Grid,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { setupMFA, enableMFA, disableMFA, regenerateBackupCodes } from '../../api/mfa';

const MFASetup = ({ isEnabled = false, onStatusChange }) => {
  const [step, setStep] = useState('initial');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleSetupStart = async () => {
    setError('');
    setIsLoading(true);
    try {
      const result = await setupMFA();
      setQrCode(result.qrCode);
      setSecret(result.mfaSecret);
      setStep('setup');
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to setup MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!token) {
        setError('Please enter your verification code');
        setIsLoading(false);
        return;
      }

      const result = await enableMFA(token);
      setBackupCodes(result.backupCodes);
      setStep('success');
      onStatusChange(true);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to verify code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!token) {
        setError('Please enter your verification code');
        setIsLoading(false);
        return;
      }

      await disableMFA(token);
      setToken('');
      setStep('initial');
      onStatusChange(false);
      toast({
        title: "MFA Disabled",
        description: "Two-factor authentication has been disabled for your account.",
        status: "info",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to disable MFA');
    } finally {
      setIsLoading(false);
      onClose();
    }
  };

  const handleRegenerateBackupCodes = async () => {
    setError('');
    setIsLoading(true);
    try {
      if (!token) {
        setError('Please enter your verification code');
        setIsLoading(false);
        return;
      }

      const result = await regenerateBackupCodes(token);
      setBackupCodes(result.backupCodes);
      setStep('success'); // Show backup codes
      toast({
        title: "Backup Codes Regenerated",
        description: "New backup codes have been generated. Save them in a secure place.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to regenerate backup codes');
    } finally {
      setIsLoading(false);
    }
  };

  // Render initial setup or disable button
  if (step === 'initial') {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" width="100%">
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold">Two-Factor Authentication (2FA)</Text>
          <Text>
            Add an extra layer of security to your account by requiring a verification code
            in addition to your password when signing in.
          </Text>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {isEnabled ? (
            <VStack spacing={4}>
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                <AlertTitle>2FA is enabled for your account</AlertTitle>
              </Alert>
              
              <Button 
                colorScheme="red" 
                width="100%" 
                onClick={onOpen}
                isLoading={isLoading}
              >
                Disable 2FA
              </Button>
              
              <Button 
                colorScheme="blue" 
                variant="outline" 
                width="100%" 
                onClick={() => setStep('regenerate')}
              >
                Regenerate Backup Codes
              </Button>
            </VStack>
          ) : (
            <Button 
              colorScheme="blue" 
              width="100%" 
              onClick={handleSetupStart}
              isLoading={isLoading}
            >
              Setup Two-Factor Authentication
            </Button>
          )}
        </VStack>

        {/* Modal for confirming 2FA disable */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Disable Two-Factor Authentication</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Text>Please enter your 2FA code to confirm disabling two-factor authentication for your account.</Text>
                <FormControl>
                  <FormLabel>Verification Code</FormLabel>
                  <Input 
                    type="text" 
                    placeholder="Enter 6-digit code"
                    value={token}
                    onChange={(e) => setToken(e.target.value.trim())}
                    maxLength={6}
                  />
                </FormControl>
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    {error}
                  </Alert>
                )}
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDisable} isLoading={isLoading}>
                Disable 2FA
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    );
  }

  // Render QR code setup
  if (step === 'setup') {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" width="100%">
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold">Setup Two-Factor Authentication</Text>
          <Text>1. Scan this QR code with your authenticator app (like Google Authenticator, Authy, or Microsoft Authenticator)</Text>
          
          <Box bg="white" p={4} alignSelf="center">
            {qrCode && <Image src={qrCode} alt="QR Code" boxSize="200px" />}
          </Box>
          
          <Text>2. Or manually enter this secret key in your app:</Text>
          <Code p={2} borderRadius="md" fontSize="md" textAlign="center">
            {secret}
          </Code>
          
          <Text mt={2}>3. Enter the verification code shown in your app:</Text>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <FormControl>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value.trim())}
              maxLength={6}
            />
          </FormControl>
          
          <Button
            colorScheme="blue"
            onClick={handleVerifyAndEnable}
            isLoading={isLoading}
            mt={2}
          >
            Verify and Enable
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setStep('initial')}
          >
            Cancel
          </Button>
        </VStack>
      </Box>
    );
  }

  // Render success and backup codes
  if (step === 'success') {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" width="100%">
        <VStack spacing={4} align="stretch">
          <Alert status="success" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Two-factor authentication is now enabled!</AlertTitle>
          </Alert>
          
          <Text fontSize="lg" fontWeight="bold">Backup Codes</Text>
          <Text>
            Save these backup codes in a secure place. If you lose your phone or can't access your
            authenticator app, you can use one of these one-time codes to sign in.
          </Text>
          
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            {backupCodes.map((code, index) => (
              <Code key={index} p={2} borderRadius="md" textAlign="center">
                {code}
              </Code>
            ))}
          </Grid>
          
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            Each code can only be used once, and they're the only way to access your account if you lose
            your authenticator device.
          </Alert>
          
          <Button
            colorScheme="blue"
            onClick={() => setStep('initial')}
            mt={2}
          >
            Done
          </Button>
        </VStack>
      </Box>
    );
  }

  // Render regenerate backup codes
  if (step === 'regenerate') {
    return (
      <Box p={6} borderWidth="1px" borderRadius="lg" width="100%">
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold">Regenerate Backup Codes</Text>
          <Text>
            Enter your 2FA code to generate new backup codes. This will invalidate all existing
            backup codes.
          </Text>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <FormControl>
            <FormLabel>Verification Code</FormLabel>
            <Input
              type="text"
              placeholder="Enter 6-digit code"
              value={token}
              onChange={(e) => setToken(e.target.value.trim())}
              maxLength={6}
            />
          </FormControl>
          
          <Button
            colorScheme="blue"
            onClick={handleRegenerateBackupCodes}
            isLoading={isLoading}
          >
            Generate New Backup Codes
          </Button>
          
          <Button
            variant="ghost"
            onClick={() => setStep('initial')}
          >
            Cancel
          </Button>
        </VStack>
      </Box>
    );
  }
};

export default MFASetup;