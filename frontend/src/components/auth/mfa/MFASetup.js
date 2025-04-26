import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  Image,
  OrderedList,
  ListItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Flex,
  Divider,
  useDisclosure
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import MFAService from '../../../services/mfaService';
import { useAuth } from '../../../auth/useAuth';

const MFASetup = () => {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // If user already has MFA enabled, redirect to settings
    if (user?.mfaEnabled) {
      toast({
        title: 'MFA is already enabled',
        description: 'You already have two-factor authentication enabled on your account.',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });
      navigate('/account/security');
      return;
    }
    
    // Generate MFA secret and QR code
    generateSecret();
  }, []);

  const generateSecret = async () => {
    setIsLoading(true);
    try {
      const result = await MFAService.generateSecret();
      if (result.success) {
        setQrCode(result.qrCode);
        setSecret(result.mfaSecret);
      } else {
        setError(result.error || 'Failed to generate MFA secret');
      }
    } catch (err) {
      setError('An error occurred while setting up MFA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError('Verification code is required');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await MFAService.enableMFA(verificationCode);
      
      if (result.success) {
        setBackupCodes(result.backupCodes);
        setStep(2);
        onOpen(); // Show backup codes modal
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred during verification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    toast({
      title: 'Two-factor authentication enabled',
      description: 'Your account is now more secure with two-factor authentication',
      status: 'success',
      duration: 5000,
      isClosable: true,
    });
    navigate('/account/security');
  };

  if (isLoading && !qrCode) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
        <Text mt={4}>Setting up two-factor authentication...</Text>
      </Box>
    );
  }

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      {step === 1 ? (
        <VStack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold">
            Setup Two-Factor Authentication
          </Text>
          
          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Text>
            Two-factor authentication adds an extra layer of security to your account. 
            When enabled, you'll need to provide a verification code along with your password to sign in.
          </Text>
          
          <OrderedList spacing={3} alignSelf="flex-start" pl={4}>
            <ListItem>Install an authenticator app on your mobile device</ListItem>
            <ListItem>Scan this QR code with your authenticator app</ListItem>
            <ListItem>Enter the 6-digit verification code shown in your app</ListItem>
          </OrderedList>
          
          <Box borderWidth={1} p={4} borderRadius="md" textAlign="center" w="full">
            {qrCode ? (
              <Image src={qrCode} alt="QR Code" mx="auto" />
            ) : (
              <Spinner size="xl" />
            )}
            
            {secret && (
              <Text mt={4} fontSize="sm" fontFamily="monospace">
                Manual setup code: {secret}
              </Text>
            )}
          </Box>
          
          <form onSubmit={handleVerify} style={{ width: '100%' }}>
            <FormControl isRequired>
              <FormLabel>Verification Code</FormLabel>
              <Input
                type="text"
                placeholder="Enter the 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                autoComplete="one-time-code"
                maxLength={6}
              />
            </FormControl>
            
            <Button
              mt={4}
              colorScheme="blue"
              isFullWidth
              type="submit"
              isLoading={isLoading}
            >
              Verify and Enable
            </Button>
          </form>
        </VStack>
      ) : (
        <VStack spacing={6}>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center">
            Two-Factor Authentication Enabled
          </Text>
          
          <Alert status="success">
            <AlertIcon />
            Your account is now protected with two-factor authentication!
          </Alert>
          
          <Text>
            You've successfully set up two-factor authentication. Next time you log in, 
            you'll need to provide a verification code from your authenticator app.
          </Text>
          
          <Button
            colorScheme="blue"
            isFullWidth
            onClick={handleFinish}
          >
            Go to Security Settings
          </Button>
        </VStack>
      )}
      
      {/* Backup Codes Modal */}
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Save Your Backup Codes</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Alert status="warning" mb={4}>
              <AlertIcon />
              Keep these backup codes in a safe place. Each code can only be used once.
            </Alert>
            
            <Text mb={2}>
              If you lose access to your authenticator app, you can use one of these 
              backup codes to sign in.
            </Text>
            
            <Box
              borderWidth={1}
              borderRadius="md"
              p={3}
              bg="gray.50"
              mb={4}
              fontSize="sm"
              fontFamily="monospace"
            >
              <Flex wrap="wrap" justify="space-between">
                {backupCodes.map((code, index) => (
                  <Text key={index} width="45%" mb={2}>
                    {code}
                  </Text>
                ))}
              </Flex>
            </Box>
            
            <Divider my={3} />
            
            <Flex justify="space-between">
              <Button 
                onClick={() => {
                  navigator.clipboard.writeText(backupCodes.join('\n'));
                  toast({
                    title: 'Copied to clipboard',
                    status: 'success',
                    duration: 2000,
                  });
                }}
                size="sm"
              >
                Copy to Clipboard
              </Button>
              
              <Button
                colorScheme="blue"
                onClick={onClose}
                size="sm"
              >
                I've Saved These Codes
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MFASetup;