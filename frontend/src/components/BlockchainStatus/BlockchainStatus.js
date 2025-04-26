"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  Tooltip,
  Alert,
  AlertIcon,
  Spinner,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import "./BlockchainStatus.css"
import { FaWallet, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { Icon } from '@chakra-ui/react';

const BlockchainStatus = () => {
  const [account, setAccount] = useState(null);
  const [networkName, setNetworkName] = useState(null);
  const [contracts, setContracts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  // Move all color mode values to the top
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const statTextColor = useColorModeValue('gray.700', 'gray.200');
  const cardBgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBorderColor = useColorModeValue('green.200', 'green.700');

  const getNetworkName = async (provider) => {
    try {
      const network = await provider.getNetwork();
      return network.name === 'homestead' ? 'Mainnet' : network.name;
    } catch (err) {
      console.error('Error getting network:', err);
      return 'Unknown';
    }
  };

  const connectWallet = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error('Please install MetaMask to connect to the blockchain');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const network = await getNetworkName(provider);
      
      setAccount(accounts[0]);
      setNetworkName(network);
      setIsConnected(true);

      const addresses = {
        AidDistribution: '0x1b4bF77EE4Ab26f3f508510b5B3568db7C9f8316',
        DonorTracking: '0x1d6224C17402Aac3e19d4cCb4A730E063a05F011',
        RefugeeAccess: '0x5cA2850142FF9c4b11Aa8A3F46cF0182A2B6E7A7',
        FieldWorker: '0x1E2be53982AE3eED2b372519be2711750ee87c48'
      };

      Object.entries(addresses).forEach(([name, address]) => {
        if (!ethers.isAddress(address)) {
          throw new Error(`Invalid address for ${name}`);
        }
      });

      setContracts(addresses);
      
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${network} network`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error connecting to wallet:', err);
      setError(err.message);
      setIsConnected(false);
      
      toast({
        title: 'Connection Error',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum && !isConnected && !loading) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          connectWallet();
        } else {
          setLoading(false);
        }
      }
    };

    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          connectWallet();
        } else {
          setAccount(null);
          setIsConnected(false);
          setNetworkName(null);
          toast({
            title: 'Wallet Disconnected',
            status: 'warning',
            duration: 5000,
            isClosable: true,
          });
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
    };
  }, []);

  return (
    <Box 
      p={6} 
      bg={bgColor}
      borderRadius="xl" 
      shadow="lg"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={4}>
        <HStack justify="space-between" align="center">
          <Heading size="md" color={textColor}>Blockchain Status</Heading>
          <Badge 
            colorScheme={isConnected ? 'green' : 'red'} 
            p={2} 
            borderRadius="md"
            display="flex"
            alignItems="center"
            gap={2}
          >
            <Icon as={isConnected ? FaCheckCircle : FaExclamationCircle} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </HStack>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <VStack align="start" spacing={2} width="100%">
              <Text fontSize="sm">{error}</Text>
              <Button size="sm" colorScheme="red" onClick={connectWallet}>
                Try Again
              </Button>
            </VStack>
          </Alert>
        )}

        {!isConnected && !loading && (
          <Button 
            onClick={connectWallet} 
            colorScheme="blue"
            size="lg"
            width="100%"
            leftIcon={<Icon as={FaWallet} />}
            isLoading={loading}
            loadingText="Connecting..."
          >
            Connect Wallet
          </Button>
        )}

        {loading && (
          <HStack justify="center" p={4}>
            <Spinner size="md" />
            <Text>Connecting to wallet...</Text>
          </HStack>
        )}

        {isConnected && account && (
          <VStack align="stretch" spacing={4}>
            <Box
              p={4}
              bg={cardBgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={cardBorderColor}
            >
              <VStack align="stretch" spacing={3}>
                <HStack justify="space-between">
                  <Text fontWeight="bold" color={statTextColor}>Network</Text>
                  <Badge colorScheme="purple">{networkName}</Badge>
                </HStack>
                
                <HStack justify="space-between">
                  <Text fontWeight="bold" color={statTextColor}>Account</Text>
                  <Tooltip label="Click to copy" placement="top">
                    <Text
                      cursor="pointer"
                      onClick={() => {
                        navigator.clipboard.writeText(account);
                        toast({
                          title: 'Address Copied',
                          status: 'success',
                          duration: 2000,
                        });
                      }}
                      fontFamily="mono"
                      fontSize="sm"
                    >
                      {`${account.slice(0, 6)}...${account.slice(-4)}`}
                    </Text>
                  </Tooltip>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default BlockchainStatus;
