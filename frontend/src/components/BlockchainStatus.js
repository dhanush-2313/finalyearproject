import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  Skeleton,
  Button,
  Text,
  VStack,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { FaEthereum, FaCubes, FaGasPump } from 'react-icons/fa';
import { ethers } from 'ethers';
import useBlockchain from '../hooks/useBlockchain';

const BlockchainStatus = () => {
  const [latestBlock, setLatestBlock] = useState(null);
  const [gasPrice, setGasPrice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    provider,
    account,
    chainId,
    error,
    connect,
    disconnect,
    isConnected
  } = useBlockchain();

  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.200');

  useEffect(() => {
    let interval;
    
    const fetchBlockchainData = async () => {
      if (provider) {
        try {
          const [blockNumber, gasPriceWei] = await Promise.all([
            provider.getBlockNumber(),
            provider.getGasPrice()
          ]);
          
          setLatestBlock(blockNumber);
          setGasPrice(ethers.utils.formatUnits(gasPriceWei, 'gwei'));
          setIsLoading(false);
        } catch (err) {
          console.error('Error fetching blockchain data:', err);
        }
      }
    };

    if (isConnected) {
      fetchBlockchainData();
      interval = setInterval(fetchBlockchainData, 12000); // Update every 12 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [provider, isConnected]);

  const getNetworkName = (chainId) => {
    switch (chainId) {
      case 1: return 'Ethereum Mainnet';
      case 5: return 'Goerli Testnet';
      case 11155111: return 'Sepolia Testnet';
      case 1337: return 'Local Network';
      default: return `Chain ID: ${chainId}`;
    }
  };

  const renderConnectionButton = () => (
    <Button
      colorScheme={isConnected ? 'red' : 'blue'}
      onClick={isConnected ? disconnect : connect}
      size="sm"
      width="full"
    >
      {isConnected ? 'Disconnect' : 'Connect Wallet'}
    </Button>
  );

  const renderContent = () => {
    if (error) {
      return (
        <VStack spacing={4} align="stretch">
          <Text color="red.500">{error}</Text>
          {renderConnectionButton()}
        </VStack>
      );
    }

    return (
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="center">
          <Badge colorScheme={isConnected ? 'green' : 'red'} fontSize="sm">
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          {renderConnectionButton()}
        </HStack>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
          <Stat>
            <StatLabel>
              <HStack>
                <Icon as={FaEthereum} />
                <Text>Network</Text>
              </HStack>
            </StatLabel>
            <Skeleton isLoaded={!isLoading}>
              <StatNumber fontSize="lg">
                {chainId ? getNetworkName(chainId) : 'Unknown'}
              </StatNumber>
              {account && (
                <StatHelpText fontSize="xs" isTruncated>
                  {account}
                </StatHelpText>
              )}
            </Skeleton>
          </Stat>

          <Stat>
            <StatLabel>
              <HStack>
                <Icon as={FaCubes} />
                <Text>Latest Block</Text>
              </HStack>
            </StatLabel>
            <Skeleton isLoaded={!isLoading}>
              <StatNumber fontSize="lg">
                {latestBlock?.toLocaleString() ?? 'Unknown'}
              </StatNumber>
              <StatHelpText>Updated every 12s</StatHelpText>
            </Skeleton>
          </Stat>

          <Stat>
            <StatLabel>
              <HStack>
                <Icon as={FaGasPump} />
                <Text>Gas Price</Text>
              </HStack>
            </StatLabel>
            <Skeleton isLoaded={!isLoading}>
              <StatNumber fontSize="lg">
                {gasPrice ? `${parseFloat(gasPrice).toFixed(2)} Gwei` : 'Unknown'}
              </StatNumber>
              <StatHelpText>Average gas price</StatHelpText>
            </Skeleton>
          </Stat>
        </SimpleGrid>
      </VStack>
    );
  };

  return (
    <Box
      p={5}
      borderWidth="1px"
      borderRadius="lg"
      bg={bgColor}
      borderColor={borderColor}
      color={textColor}
      shadow="sm"
    >
      {renderContent()}
    </Box>
  );
};

export default BlockchainStatus; 