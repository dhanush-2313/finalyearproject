import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  Alert,
  AlertIcon,
  Heading,
  useColorModeValue,
  HStack,
  PinInput,
  PinInputField
} from '@chakra-ui/react';
import { verifyMFA } from '../../api/mfa';

const MFAVerification = ({ userId, onSuccess, onCancel }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError('Please enter a valid 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await verifyMFA(userId, token);
      
      if (result.success) {
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
      } else {
        setError(result.error || 'Verification failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
      console.error('MFA verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = (value) => {
    setToken(value);
  };

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      p={6} 
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      boxShadow="md"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="lg" textAlign="center">Two-Factor Authentication</Heading>
        <Text>
          Please enter the 6-digit verification code from your authenticator app to continue.
        </Text>
        
        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <FormControl>
          <FormLabel textAlign="center">Verification Code</FormLabel>
          <HStack justify="center">
            <PinInput 
              otp
              size="lg"
              value={token}
              onChange={handlePinChange}
              placeholder=""
            >
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
              <PinInputField />
            </PinInput>
          </HStack>
        </FormControl>
        
        <HStack justify="center" spacing={4} pt={4}>
          <Button 
            variant="outline" 
            onClick={onCancel}
            disabled={isLoading}
          >
            Back
          </Button>
          <Button 
            colorScheme="blue" 
            onClick={handleVerify}
            isLoading={isLoading}
            loadingText="Verifying..."
          >
            Verify
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default MFAVerification;