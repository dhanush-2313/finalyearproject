"use client"

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Button,
  useToast,
  Text,
  FormHelperText,
  useColorModeValue,
  Textarea,
  HStack,
  InputLeftElement,
  InputGroup,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  Tooltip,
  Card,
  CardBody,
  Stack,
  Avatar,
  Flex,
} from '@chakra-ui/react';
import { FaEthereum, FaHandHoldingHeart, FaExternalLinkAlt, FaInfoCircle, FaUser } from 'react-icons/fa';
import { donorAPI, blockchainAPI } from '../api/api';
import { useAuth } from '../auth/useAuth';
import AddressResolver from '../components/AddressResolver/AddressResolver';
import { formatIndianTimestamp, weiToEth } from '../utils/dateUtils';
import { ethers } from "ethers";

const Donations = () => {
  const { user } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [donations, setDonations] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [enhancedAidRecords, setEnhancedAidRecords] = useState([]);
  const [donationActivity, setDonationActivity] = useState([]);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [formData, setFormData] = useState({
    amount: '0.01',  // Changed from 0.1 to 0.01 to match contract minimum
    cause: '',
    message: '',
    paymentMethod: 'crypto',
  });

  // Fetch donation history, enhanced aid records, and recent activity on load
  useEffect(() => {
    fetchDonationHistory();
    fetchEnhancedAidRecords();
    fetchDonationActivity();
  }, []);

  const fetchDonationHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await donorAPI.getDonations();
      if (response?.data) {
        console.log("Donation data received:", response.data);
        
        const processedDonations = response.data.map(donation => ({
          ...donation,
          date: donation.createdAt // Always use the real creation date from the backend
        }));
        
        setDonations(processedDonations);
        console.log("Processed donations with dates:", processedDonations);
      }
    } catch (error) {
      console.error("Error fetching donation history:", error);
      toast({
        title: "Error",
        description: "Failed to load your donation history",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchEnhancedAidRecords = async () => {
    try {
      // This gets aid records with resolved user details
      const response = await blockchainAPI.getEnhancedAidRecords();
      if (response?.data?.success && response.data.records) {
        setEnhancedAidRecords(response.data.records);
      }
    } catch (error) {
      console.error("Error fetching enhanced aid records:", error);
    }
  };

  const fetchDonationActivity = async () => {
    try {
      const response = await blockchainAPI.getRecentEvents();
      if (response?.data?.success) {
        setDonationActivity(response.data.events);
      }
    } catch (error) {
      console.error("Error fetching donation activity:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAmountChange = (value) => {
    setFormData({
      ...formData,
      amount: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Enhanced validation
    if (!formData.amount || !formData.cause) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate minimum donation amount (0.01 ETH)
    const minAmount = 0.01;
    if (parseFloat(formData.amount) < minAmount) {
      toast({
        title: 'Invalid Amount',
        description: `Minimum donation amount is ${minAmount} ETH`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const response = await donorAPI.makeDonation({
        amount: formData.amount,
        cause: formData.cause,
        message: formData.message,
        paymentMethod: formData.paymentMethod,
      });
      
      if (response?.data?.success) {
        toast({
          title: 'Donation Successful',
          description: 'Thank you for your donation! Transaction is being processed.',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reset form
        setFormData({
          amount: '0.01',
          cause: '',
          message: '',
          paymentMethod: 'crypto',
        });
        
        // Refresh donation history and activity
        await fetchDonationHistory();
        await fetchDonationActivity();
      } else {
        throw new Error(response?.data?.error || 'Donation failed');
      }
    } catch (error) {
      console.error('Error making donation:', error);
      // Extract the revert reason if available
      const revertReason = error.response?.data?.error || error.message;
      toast({
        title: 'Donation Failed',
        description: revertReason || 'An error occurred while processing your donation',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to render recipient details with additional information
  const renderRecipientDetails = (record) => {
    return (
      <Card size="sm" variant="outline" mb={3} borderColor={borderColor}>
        <CardBody py={3} px={4}>
          <Stack direction="row" spacing={4} align="center">
            <Avatar 
              icon={<FaUser />} 
              bg={record.recipientDetails ? "green.500" : "gray.400"}
              size="sm"
            />
            <Box flex="1">
              <Flex justify="space-between" align="center">
                <Box>
                  <AddressResolver 
                    address={record.recipient} 
                    showBadge={true}
                    size="md"
                  />
                  {record.recipientDetails && (
                    <Text fontSize="sm" color="gray.500">
                      {record.recipientDetails.location || "No location info"}
                    </Text>
                  )}
                </Box>
                <Badge 
                  colorScheme={record.status === "Delivered" ? "green" : 
                              record.status === "Pending" ? "yellow" : "blue"}
                >
                  {record.status}
                </Badge>
              </Flex>
              <HStack spacing={4} mt={2} fontSize="sm">
                <Text><strong>Aid:</strong> {record.aidType}</Text>
                <Text><strong>Amount:</strong> {weiToEth(record.amount)} ETH</Text>
                <Text><strong>Date:</strong> {formatIndianTimestamp(record.timestamp)}</Text>
              </HStack>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    );
  };

  const renderDonationActivity = () => (
    <Box mt={4}>
      <Heading size="md" mb={4}>Recent Donation Activity</Heading>
      <Stack spacing={3}>
        {donationActivity.map((activity, index) => (
          <Card key={index} variant="outline">
            <CardBody>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">
                    {activity.eventType === "DonationReceived" ? "New Donation" : 
                     activity.eventType === "AidDistributed" ? "Aid Distributed" : 
                     "Aid Status Updated"}
                  </Text>
                  <Text fontSize="sm">Amount: {weiToEth(activity.amount)} ETH</Text>
                  {activity.recipient && (
                    <Text fontSize="sm">Recipient: <AddressResolver address={activity.recipient} /></Text>
                  )}
                </VStack>
                <Badge colorScheme={
                  activity.eventType === "DonationReceived" ? "green" :
                  activity.eventType === "AidDistributed" ? "blue" : "yellow"
                }>
                  {formatIndianTimestamp(activity.timestamp)}
                </Badge>
              </HStack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Make a Donation
        </Heading>

        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius="lg"
          mb={6}
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Your Support Makes a Difference
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            Your donation will be securely recorded on the blockchain for transparency and traceability.
          </AlertDescription>
        </Alert>

        <Box
          p={8}
          borderWidth="1px"
          borderRadius="lg"
          borderColor={borderColor}
          bg={bgColor}
          shadow="xl"
        >
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="bold">Donation Amount (ETH)</FormLabel>
                <InputGroup>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaEthereum} color="gray.500" />
                  </InputLeftElement>
                  <NumberInput
                    min={0.01}
                    step={0.01}
                    value={formData.amount}
                    onChange={handleAmountChange}
                    w="100%"
                  >
                    <NumberInputField pl={10} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </InputGroup>
                <FormHelperText>Minimum donation is 0.01 ETH</FormHelperText>
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="bold">Donation Purpose</FormLabel>
                <Select
                  name="cause"
                  value={formData.cause}
                  onChange={handleInputChange}
                  placeholder="Select purpose"
                >
                  <option value="emergency_relief">Emergency Relief</option>
                  <option value="food_supplies">Food Supplies</option>
                  <option value="medical_aid">Medical Aid</option>
                  <option value="shelter">Shelter</option>
                  <option value="education">Education</option>
                  <option value="general">General Fund</option>
                </Select>
                <FormHelperText>Select where you want your donation to go</FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Payment Method</FormLabel>
                <Select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                >
                  <option value="crypto">Cryptocurrency (ETH)</option>
                  <option value="creditCard">Credit Card</option>
                  <option value="bankTransfer">Bank Transfer</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel fontWeight="bold">Message (Optional)</FormLabel>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Add a personal message"
                  resize="vertical"
                />
                <FormHelperText>Leave a message for the recipients (optional)</FormHelperText>
              </FormControl>

              <Divider />

              <HStack justifyContent="center">
                <Button
                  type="submit"
                  colorScheme="green"
                  size="lg"
                  isLoading={isSubmitting}
                  loadingText="Processing..."
                  leftIcon={<Icon as={FaHandHoldingHeart} />}
                  px={10}
                >
                  Donate Now
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>

        <Tabs variant="enclosed" mt={8}>
          <TabList>
            <Tab>Donation History</Tab>
            <Tab>Recipient Details</Tab>
            <Tab>Activity Log</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {loadingHistory ? (
                <Stack spacing={4}>
                  <Skeleton height="60px" />
                  <Skeleton height="60px" />
                  <Skeleton height="60px" />
                </Stack>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Amount (ETH)</Th>
                      <Th>Cause</Th>
                      <Th>Date (Indian Time)</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {donations.length > 0 ? donations.map((donation, index) => (
                      <Tr key={index}>
                        <Td>{weiToEth(donation.amount)}</Td>
                        <Td>{donation.cause}</Td>
                        <Td>{formatIndianTimestamp(donation.createdAt)}</Td>
                        <Td>
                          <Badge colorScheme={donation.status === "Completed" ? "green" : "yellow"}>
                            {donation.status || "Processing"}
                          </Badge>
                        </Td>
                      </Tr>
                    )) : (
                      <Tr>
                        <Td colSpan={4} textAlign="center">No donation history found</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              )}
            </TabPanel>
            <TabPanel>
              <Heading size="md" mb={4}>Aid Recipients</Heading>
              {enhancedAidRecords.length > 0 ? enhancedAidRecords.map((record, index) => (
                <Box key={index}>
                  {renderRecipientDetails(record)}
                </Box>
              )) : (
                <Text textAlign="center" py={4} color="gray.500">
                  No aid recipients found. This could be because no aid has been distributed yet.
                </Text>
              )}
            </TabPanel>
            <TabPanel>
              {renderDonationActivity()}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default Donations;
