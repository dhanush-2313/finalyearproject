"use client"

import React, { useContext, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Text,
  Flex,
  Button,
  useToast,
  CircularProgress,
} from '@chakra-ui/react';
import { FaEthereum, FaHandHoldingHeart, FaUsers, FaFileAlt, FaSignOutAlt, FaWallet } from 'react-icons/fa';
import BlockchainStatus from '../components/BlockchainStatus/BlockchainStatus';
import AidRecords from '../components/AidRecords/AidRecords';
import RoleBasedNav from '../components/RoleBasedNav/RoleBasedNav';
import ConnectWallet from '../components/connectWallet/ConnectWallet1';
import AddressResolver from '../components/AddressResolver/AddressResolver';
import { useAuth } from '../auth/useAuth';
import { authAPI, blockchainAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import { formatIndianTimestamp, weiToEth } from '../utils/dateUtils';

const StatCard = ({ title, value, icon, helpText }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('blue.500', 'blue.200');

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="lg"
    >
      <Flex alignItems="center" mb={4}>
        <Icon as={icon} w={8} h={8} color={iconColor} mr={3} />
        <Stat>
          <StatLabel fontSize="lg" fontWeight="medium">
            {title}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText color={useColorModeValue('gray.600', 'gray.400')}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </Flex>
    </Box>
  );
};

const Dashboard = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  
  const [account, setAccount] = useState('');
  const [dashboardStats, setDashboardStats] = useState({
    totalAid: '0',
    beneficiaries: '0',
    activeProjects: '0',
    verifiedRecords: '0',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activities, setActivities] = useState([]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });
        
        setAccount(accounts[0]);
        
        toast({
          title: "Wallet Connected",
          description: `Connected to ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        
        fetchBlockchainData(accounts[0]);
        
      } catch (error) {
        console.error("Error connecting wallet:", error);
        toast({
          title: "Connection Failed",
          description: "Failed to connect wallet. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask browser extension to connect your wallet.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const fetchBlockchainData = async (walletAddress) => {
    setIsLoading(true);
    try {
      let aidRecords = [];
      try {
        const enhancedResponse = await blockchainAPI.getEnhancedAidRecords();
        if (enhancedResponse?.data?.success) {
          console.log("Enhanced API Response:", enhancedResponse.data);
          aidRecords = enhancedResponse.data.records || [];
        }
      } catch (enhancedErr) {
        console.error("Enhanced aid records error:", enhancedErr);
        const statsResponse = await blockchainAPI.getAidRecords();
        console.log("Regular API Response:", statsResponse.data);
        if (statsResponse.data) {
          aidRecords = Array.isArray(statsResponse.data.records) 
            ? statsResponse.data.records 
            : (Array.isArray(statsResponse.data) ? statsResponse.data : []);
        }
      }
      
      console.log("Processing records:", aidRecords);
      
      const totalAidWei = aidRecords.reduce((sum, record) => 
        sum + (Number(record.amount) || 0), 0);
      
      const uniqueBeneficiaries = new Set(
        aidRecords.map(record => record.recipient).filter(Boolean)
      ).size;
      
      const activeProjects = new Set(
        aidRecords.filter(record => record.status === 'active')
          .map(record => record.projectId)
          .filter(Boolean)
      ).size;
      
      const verifiedRecords = aidRecords.filter(
        record => record.verified === true
      ).length;
      
      setDashboardStats({
        totalAid: `${weiToEth(totalAidWei)} ETH`,
        beneficiaries: uniqueBeneficiaries.toString(),
        activeProjects: activeProjects.toString(),
        verifiedRecords: verifiedRecords.toString(),
      });
      
      const recentActivities = aidRecords
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
        .slice(0, 5);
        
      setActivities(recentActivities);
    } catch (error) {
      console.error("Error fetching blockchain data:", error);
      toast({
        title: "Data Fetch Error",
        description: "Unable to fetch blockchain data. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      
      setDashboardStats({
        totalAid: '0 ETH',
        beneficiaries: '0',
        activeProjects: '0',
        verifiedRecords: '0',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainData();
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem("token");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while logging out.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <Stack spacing={8}>
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Heading size="lg">
              Dashboard Overview
            </Heading>
            <Flex gap={4}>
              <ConnectWallet account={account} connectWallet={connectWallet} />
              <Button
                leftIcon={<FaSignOutAlt />}
                colorScheme="red"
                variant="solid"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Flex>
          </Flex>
          
          <RoleBasedNav />

          {isLoading ? (
            <Flex justify="center" align="center" my={10}>
              <CircularProgress isIndeterminate color="blue.500" />
              <Text ml={4} fontSize="lg">Loading blockchain data...</Text>
            </Flex>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
              <StatCard
                title="Total Aid Distributed"
                value={dashboardStats.totalAid}
                icon={FaEthereum}
                helpText="All time distribution"
              />
              <StatCard
                title="Total Beneficiaries"
                value={dashboardStats.beneficiaries}
                icon={FaUsers}
                helpText="Registered recipients"
              />
              <StatCard
                title="Active Projects"
                value={dashboardStats.activeProjects}
                icon={FaHandHoldingHeart}
                helpText="Ongoing aid projects"
              />
              <StatCard
                title="Verified Records"
                value={dashboardStats.verifiedRecords}
                icon={FaFileAlt}
                helpText="Blockchain verified"
              />
            </SimpleGrid>
          )}

          <Grid
            templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(3, 1fr)' }}
            gap={8}
          >
            <GridItem colSpan={{ base: 1, lg: 1 }}>
              <BlockchainStatus isWalletConnected={!!account} wallet={account} />
            </GridItem>
            <GridItem colSpan={{ base: 1, lg: 2 }}>
              <Box
                bg={useColorModeValue('white', 'gray.800')}
                borderRadius="lg"
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                shadow="lg"
                p={6}
              >
                <Heading size="md" mb={4}>
                  Recent Activity
                </Heading>
                {activities.length > 0 ? (
                  <Stack spacing={3}>
                    {activities.map((activity, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md">
                        <Flex justify="space-between">
                          <Text fontWeight="bold">{activity.description || `Aid Record #${activity.id}`}</Text>
                          <Text fontSize="sm" color="gray.500">
                            {formatIndianTimestamp(activity.timestamp)}
                          </Text>
                        </Flex>
                        <Text mt={1}>Status: {activity.status}</Text>
                        <Text>Amount: {weiToEth(activity.amount)} ETH</Text>
                        <Text>Recipient: <AddressResolver address={activity.recipient || activity.recipientId} /></Text>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Text color={useColorModeValue('gray.600', 'gray.400')}>
                    No recent activities to display
                  </Text>
                )}
              </Box>
            </GridItem>
          </Grid>

          <Box>
            <AidRecords walletAddress={account} />
          </Box>
        </Stack>
      </Container>
    </Box>
  );
};

export default Dashboard;
