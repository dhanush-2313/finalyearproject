"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const bg = useColorModeValue('gray.50', 'gray.800');

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      setHasError(true);
      setError(error);
      setErrorInfo(errorInfo);
      console.error('Error caught by boundary:', error, errorInfo);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg={bg}
      >
        <VStack spacing={4} textAlign="center" p={8}>
          <Heading size="xl">Oops! Something went wrong</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.300')}>
            We're sorry for the inconvenience. Please try refreshing the page.
          </Text>
          <Button
            colorScheme="blue"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && (
            <Box
              mt={4}
              p={4}
              bg={useColorModeValue('gray.100', 'gray.700')}
              borderRadius="md"
              maxW="600px"
              overflow="auto"
            >
              <Text fontFamily="monospace" fontSize="sm" whiteSpace="pre-wrap">
                {error?.toString()}
              </Text>
            </Box>
          )}
        </VStack>
      </Box>
    );
  }

  return children;
};

export default ErrorBoundary;

