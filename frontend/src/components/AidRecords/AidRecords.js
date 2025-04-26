"use client"

import React, { useState, useEffect, useContext } from "react"
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  HStack,
  FormHelperText,
  useColorModeValue,
  Container,
  InputGroup,
  InputLeftElement,
  Icon,
  Select,
  Tooltip,
  Flex,
  Avatar,
} from "@chakra-ui/react"
import { FaEthereum, FaUser, FaBox, FaInfoCircle } from "react-icons/fa"
import { AuthContext } from "../../auth/authContext"
import { blockchainAPI } from "../../api/api"
import AddressResolver from "../AddressResolver/AddressResolver"
import { formatIndianTimestamp, weiToEth } from "../../utils/dateUtils"

const AidRecords = () => {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    recipient: "",
    aidType: "",
    amount: "0.01", // Default to 0.01 ETH to match contract minimum
  })
  const { isAuthenticated, user } = useContext(AuthContext)
  const toast = useToast()

  // Color mode values
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const formBgColor = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    fetchAidRecords()
  }, [])

  const fetchAidRecords = async () => {
    try {
      setLoading(true)
      console.log("Attempting to fetch aid records...")
      
      const response = await blockchainAPI.getEnhancedAidRecords();
      
      if (response?.data?.success) {
        console.log("Enhanced aid records:", response.data);
        console.log("First record timestamp:", response.data.records[0]?.timestamp);
        setRecords(response.data.records || []);
        setError(null);
        return;
      }

      // If enhanced records fail, try basic records
      const basicResponse = await blockchainAPI.getAidRecords();
      if (basicResponse?.data?.records) {
        setRecords(basicResponse.data.records);
        setError(null);
        return;
      }

      setRecords([]);
      setError("Could not fetch aid records. Please try again later.");
    } catch (err) {
      console.error("Error fetching aid records:", err);
      setError(err.message || "Failed to load aid records");
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const pollForConfirmation = async (txHash, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const verification = await blockchainAPI.verifyTransaction(txHash);
        if (verification?.data?.verification?.verified) {
          return true;
        }
      } catch (error) {
        console.warn("Verification attempt failed:", error);
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds between attempts
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to add records",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await blockchainAPI.addAidRecord(formData);

      if (response?.data?.success) {
        toast({
          title: "Success",
          description: "Aid record submitted! Waiting for blockchain confirmation...",
          status: "info",
          duration: null,
          isClosable: true,
        });

        // Poll for transaction confirmation
        const confirmed = await pollForConfirmation(response.data.txHash);
        
        if (confirmed) {
          toast({
            title: "Confirmed",
            description: "Aid record confirmed on blockchain!",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
          
          await fetchAidRecords(); // Refresh the records
          
          setFormData({
            recipient: "",
            aidType: "",
            amount: "0.1",
          });
        } else {
          // Transaction not confirmed after max attempts
          toast({
            title: "Warning",
            description: "Transaction submitted but confirmation is taking longer than expected. Please check back later.",
            status: "warning",
            duration: 10000,
            isClosable: true,
          });
        }
      } else {
        throw new Error(response?.data?.error || "Failed to add aid record");
      }
    } catch (err) {
      console.error("Error adding aid record:", err);
      toast({
        title: "Error",
        description: `Failed to add aid record: ${err.message}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {isAuthenticated && (user?.role === "admin" || user?.role === "fieldWorker") && (
          <Box
            p={6}
            bg={bgColor}
            borderRadius="xl"
            borderWidth="1px"
            borderColor={borderColor}
            shadow="lg"
          >
            <VStack spacing={6} align="stretch">
              <Heading size="md">Add Aid Record</Heading>

              <form onSubmit={handleSubmit}>
                <VStack spacing={4} align="stretch">
                  <FormControl isRequired>
                    <FormLabel>Recipient Address</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaUser} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        name="recipient"
                        value={formData.recipient}
                        onChange={handleChange}
                        placeholder="0x..."
                        disabled={submitting}
                      />
                    </InputGroup>
                    <FormHelperText>Enter the Ethereum address of the recipient</FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Aid Description</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaBox} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        name="aidType"
                        value={formData.aidType}
                        onChange={handleChange}
                        placeholder="Food supplies, Medicine, etc."
                        disabled={submitting}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel>Amount (ETH)</FormLabel>
                    <InputGroup>
                      <InputLeftElement>
                        <Icon as={FaEthereum} color="gray.500" />
                      </InputLeftElement>
                      <Input
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        placeholder="0.1"
                        disabled={submitting}
                      />
                    </InputGroup>
                    <FormHelperText>Amount of ETH to allocate for this aid package</FormHelperText>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={submitting}
                    loadingText="Adding..."
                    size="lg"
                    width="100%"
                  >
                    Add Record
                  </Button>
                </VStack>
              </form>
            </VStack>
          </Box>
        )}

        <Box
          p={6}
          bg={bgColor}
          borderRadius="xl"
          borderWidth="1px"
          borderColor={borderColor}
          shadow="lg"
        >
          <VStack spacing={6} align="stretch">
            <HStack justify="space-between">
              <Heading size="md">Recent Aid Records</Heading>
              <Button
                onClick={fetchAidRecords}
                isLoading={loading}
                loadingText="Refreshing..."
                size="sm"
                colorScheme="green"
              >
                Refresh
              </Button>
            </HStack>

            {loading ? (
              <Text textAlign="center" color="gray.500">Loading records...</Text>
            ) : records.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Donor</Th>
                      <Th>Recipient</Th>
                      <Th>Description</Th>
                      <Th>Amount (ETH)</Th>
                      <Th>Status</Th>
                      <Th>Timestamp (Indian Time)</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {records.map((record) => (
                      <Tr key={record.id}>
                        <Td>{record.id}</Td>
                        <Td>
                          <Flex align="center">
                            <Avatar size="xs" mr={2} src={record.addedByDetails?.avatarUrl} name={record.addedByDetails?.name || "Unknown"}/>
                            <Box>
                              {/* Show donor name for admins and field workers, otherwise show generic label */}
                              {record.addedByDetails?.name && (user?.role === 'admin' || user?.role === 'fieldWorker') ? (
                                <Text fontWeight="bold">{record.addedByDetails.name}</Text>
                              ) : record.addedByDetails ? (
                                <Text fontWeight="bold">Verified Donor</Text>
                              ) : (
                                <Text>Unknown Donor</Text>
                              )}
                              <AddressResolver address={record.addedBy} />
                            </Box>
                            
                            {/* Show detailed information tooltip for admins and field workers */}
                            {record.addedByDetails && (user?.role === 'admin' || user?.role === 'fieldWorker') && (
                              <Tooltip 
                                label={
                                  <Box p={2} minWidth="200px">
                                    <Text><strong>Name:</strong> {record.addedByDetails.name || 'N/A'}</Text>
                                    <Text><strong>Email:</strong> {record.addedByDetails.email || 'N/A'}</Text>
                                    <Text><strong>Role:</strong> {record.addedByDetails.role || 'N/A'}</Text>
                                    <Text><strong>Wallet:</strong> {record.addedBy}</Text>
                                    <Text><strong>Joined:</strong> {record.addedByDetails.createdAt ? new Date(record.addedByDetails.createdAt).toLocaleDateString() : 'N/A'}</Text>
                                  </Box>
                                }
                                hasArrow
                                placement="top"
                              >
                                <Icon as={FaInfoCircle} ml={2} color="blue.500" />
                              </Tooltip>
                            )}
                          </Flex>
                        </Td>
                        <Td>
                          <Flex align="center">
                            <Avatar size="xs" mr={2} src={record.recipientDetails?.avatarUrl} name={record.recipientDetails?.name || "Unknown"}/>
                            <Box>
                              {/* Show recipient name for admins and field workers, otherwise show generic label */}
                              {record.recipientDetails?.name && (user?.role === 'admin' || user?.role === 'fieldWorker') ? (
                                <Text fontWeight="bold">{record.recipientDetails.name}</Text>
                              ) : record.recipientDetails ? (
                                <Text fontWeight="bold">Verified Recipient</Text>
                              ) : (
                                <Text>Unknown Recipient</Text>
                              )}
                              <AddressResolver address={record.recipient} />
                            </Box>
                            
                            {/* Show detailed information for admin and field worker */}
                            {record.recipientDetails && (user?.role === 'admin' || user?.role === 'fieldWorker') && (
                              <Tooltip 
                                label={
                                  <Box p={2} minWidth="200px">
                                    <Text><strong>Name:</strong> {record.recipientDetails.name || 'N/A'}</Text>
                                    <Text><strong>Email:</strong> {record.recipientDetails.email || 'N/A'}</Text>
                                    <Text><strong>Role:</strong> {record.recipientDetails.role || 'N/A'}</Text>
                                    <Text><strong>Location:</strong> {record.recipientDetails.additionalDetails?.location || 'N/A'}</Text>
                                    <Text><strong>Family Size:</strong> {record.recipientDetails.additionalDetails?.familySize || 'N/A'}</Text>
                                    <Text><strong>Phone:</strong> {record.recipientDetails.additionalDetails?.phoneNumber || 'N/A'}</Text>
                                    <Text><strong>Registration Date:</strong> {record.recipientDetails.additionalDetails?.registrationDate ? new Date(record.recipientDetails.additionalDetails.registrationDate).toLocaleDateString() : 'N/A'}</Text>
                                    <Text><strong>Aid Status:</strong> {record.recipientDetails.additionalDetails?.aidStatus || 'N/A'}</Text>
                                  </Box>
                                }
                                hasArrow
                                placement="top"
                              >
                                <Icon as={FaInfoCircle} ml={2} color="blue.500" />
                              </Tooltip>
                            )}
                            
                            {/* Show basic information for donors */}
                            {record.recipientDetails && user?.role === 'donor' && (
                              <Tooltip 
                                label={
                                  <Box p={2} minWidth="180px">
                                    <Text><strong>Location:</strong> {record.recipientDetails.additionalDetails?.location || 'N/A'}</Text>
                                    <Text><strong>Aid Status:</strong> {record.recipientDetails.additionalDetails?.aidStatus || 'N/A'}</Text>
                                    <Text><strong>Family Size:</strong> {record.recipientDetails.additionalDetails?.familySize || 'N/A'}</Text>
                                  </Box>
                                }
                                hasArrow
                                placement="top"
                              >
                                <Icon as={FaInfoCircle} ml={2} color="green.500" />
                              </Tooltip>
                            )}
                          </Flex>
                        </Td>
                        <Td>{record.aidType}</Td>
                        <Td>{weiToEth(record.amount)} ETH</Td>
                        <Td>
                          <Badge
                            colorScheme={
                              record.status === "Delivered"
                                ? "green"
                                : record.status === "Pending"
                                ? "yellow"
                                : "blue"
                            }
                          >
                            {record.status}
                          </Badge>
                        </Td>
                        <Td>{formatIndianTimestamp(record.timestamp || new Date().toISOString())}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text textAlign="center" color="gray.500">No records found</Text>
            )}
          </VStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default AidRecords
