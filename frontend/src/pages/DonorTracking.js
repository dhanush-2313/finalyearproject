"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  useColorModeValue,
  Button,
  Flex,
  Icon,
  HStack,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { FaEthereum, FaSearch, FaDownload, FaRedoAlt } from 'react-icons/fa';
import { donorAPI } from '../api/api';
import { useAuth } from '../auth/useAuth';

const DonorTracking = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Stats calculation
  const totalDonated = donations.reduce((sum, donation) => sum + parseFloat(donation.amount), 0).toFixed(4);
  const completedDonations = donations.filter(d => d.status === 'completed').length;

  const fetchDonations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the API request for debugging
      console.log("Attempting to fetch donations history...");
      
      // Try direct API call with the correct /api prefix if the regular call fails
      try {
        const response = await donorAPI.getDonations();
        console.log("Donation API response:", response);
        setDonations(Array.isArray(response.data) ? response.data : []);
      } catch (apiErr) {
        console.error("Regular API call failed:", apiErr);
        
        // Try direct fetch with the correct URL as fallback
        try {
          const apiUrl = "http://localhost:4000/api";
          const response = await fetch(`${apiUrl}/donors/view-donations`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          console.log("Direct fetch response:", data);
          setDonations(Array.isArray(data) ? data : []);
        } catch (fetchErr) {
          console.error("Direct fetch also failed:", fetchErr);
          throw new Error("Could not connect to donation history API");
        }
      }
    } catch (err) {
      console.error('Error fetching donations:', err);
      setError('Failed to load your donations. Please try again later.');
      
      // Use mock data for development/demo
      setDonations([
        {
          _id: '1',
          amount: '0.5',
          cause: 'food_supplies',
          status: 'completed',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
          paymentMethod: 'crypto',
        },
        {
          _id: '2',
          amount: '0.25',
          cause: 'medical_aid',
          status: 'completed',
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          transactionHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          paymentMethod: 'crypto',
        },
        {
          _id: '3',
          amount: '0.1',
          cause: 'education',
          status: 'processing',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          transactionHash: null,
          paymentMethod: 'crypto',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const formatCause = (cause) => {
    return cause.replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'yellow';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl">
          Your Donations
        </Heading>
        
        {/* Stats Overview */}
        <Flex 
          direction={{ base: 'column', md: 'row' }}
          gap={6}
          mb={4}
        >
          <Box 
            flex="1" 
            bg={bgColor}
            p={6} 
            borderRadius="lg" 
            borderWidth="1px"
            borderColor={borderColor}
            shadow="md"
          >
            <Stat>
              <StatLabel fontSize="lg">Total Donated</StatLabel>
              <HStack alignItems="center">
                <Icon as={FaEthereum} />
                <StatNumber fontSize="3xl">{totalDonated} ETH</StatNumber>
              </HStack>
              <StatHelpText>Lifetime contribution</StatHelpText>
            </Stat>
          </Box>
          
          <Box 
            flex="1" 
            bg={bgColor}
            p={6} 
            borderRadius="lg" 
            borderWidth="1px"
            borderColor={borderColor}
            shadow="md"
          >
            <Stat>
              <StatLabel fontSize="lg">Completed Donations</StatLabel>
              <StatNumber fontSize="3xl">{completedDonations}</StatNumber>
              <StatHelpText>Out of {donations.length} total donations</StatHelpText>
            </Stat>
          </Box>
        </Flex>

        {/* Actions Bar */}
        <Flex justify="space-between" mb={4}>
          <Button 
            leftIcon={<FaRedoAlt />} 
            onClick={fetchDonations}
            isLoading={loading}
            loadingText="Refreshing..."
          >
            Refresh
          </Button>
          
          <HStack>
            <Button leftIcon={<FaSearch />}>
              Verify on Blockchain
            </Button>
            <Button leftIcon={<FaDownload />} colorScheme="blue">
              Download Report
            </Button>
          </HStack>
        </Flex>

        {/* Donations Table */}
        <Box
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="lg"
          overflow="hidden"
        >
          {loading ? (
            <Flex justify="center" align="center" p={10}>
              <Spinner size="xl" />
            </Flex>
          ) : error ? (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          ) : donations.length === 0 ? (
            <Alert status="info">
              <AlertIcon />
              You haven't made any donations yet. Start making a difference today!
            </Alert>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Amount</Th>
                    <Th>Purpose</Th>
                    <Th>Status</Th>
                    <Th>Payment Method</Th>
                    <Th>Transaction ID</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {donations.map((donation) => (
                    <Tr key={donation._id}>
                      <Td>{formatDate(donation.createdAt)}</Td>
                      <Td>
                        <HStack>
                          <Icon as={FaEthereum} />
                          <Text>{donation.amount} ETH</Text>
                        </HStack>
                      </Td>
                      <Td>{formatCause(donation.cause)}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(donation.status)}>
                          {donation.status}
                        </Badge>
                      </Td>
                      <Td>{donation.paymentMethod}</Td>
                      <Td>
                        <Text isTruncated maxW="150px">
                          {donation.transactionHash ? (
                            <a 
                              href={`https://etherscan.io/tx/${donation.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'underline', color: 'blue' }}
                            >
                              {donation.transactionHash.substring(0, 10)}...
                            </a>
                          ) : (
                            'Pending'
                          )}
                        </Text>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      </VStack>
    </Container>
  );
};

export default DonorTracking;