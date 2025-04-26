import React, { useState } from 'react';
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
  Link,
  Divider
} from '@chakra-ui/react';
import MFAService from '../../../services/mfaService';

const MFAVerification = ({ userId, onComplete }) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError('Verification code is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await MFAService.verifyMFA(token, userId);
      
      if (result.success) {
        onComplete(true);
      } else {
        setError(result.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred during verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={8} p={6} borderWidth={1} borderRadius="lg">
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <Text fontSize="2xl" fontWeight="bold" mb={2}>
            Two-Factor Authentication
          </Text>
          
          <Text color="gray.600" fontSize="sm" textAlign="center">
            Please enter the verification code from your authenticator app or use one of your backup codes.
          </Text>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}
          
          <FormControl isRequired>
            <FormLabel>Verification Code</FormLabel>
            <Input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              maxLength={6}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
            loadingText="Verifying..."
            mt={2}
          >
            Verify
          </Button>
          
          <Divider my={2} />
          
          <Text color="gray.500" fontSize="sm">
            Lost access to your authenticator app? Use one of your backup codes instead.
          </Text>
        </VStack>
      </form>
    </Box>
  );
};

export default MFAVerification;