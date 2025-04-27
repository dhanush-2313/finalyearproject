"use client"

import React, { useState, useEffect, useContext } from "react"
import { Navigate } from "react-router-dom"
import { AuthContext } from "../auth/authContext"
import { refugeeAPI, blockchainAPI } from "../api/api"
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Progress,
  Card,
  CardBody,
  Stack,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Icon,
  Flex,
  Avatar,
  useColorModeValue,
} from "@chakra-ui/react"
import { FaEthereum, FaUserShield, FaCalendarAlt, FaBoxOpen } from "react-icons/fa"
import { formatIndianTimestamp, weiToEth } from "../utils/dateUtils"
import "./AidReceived.css"

const AidReceived = () => {
  const { isAuthenticated, user, walletAddress, connectWallet } = useContext(AuthContext)
  const [aidRecords, setAidRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [statistics, setStatistics] = useState({
    totalAid: 0,
    pendingAid: 0,
    completedDeliveries: 0,
    lastDeliveryDate: null,
  })

  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  useEffect(() => {
    let isMounted = true

    const fetchAidRecords = async () => {
      try {
        setLoading(true)
        const response = await blockchainAPI.getEnhancedAidRecords()
        
        if (isMounted && response?.data?.success) {
          console.log("User wallet address:", walletAddress);
          console.log("All records:", response.data.records);
          
          // Check if user has a wallet address
          if (!walletAddress) {
            console.warn("No wallet address found. Please connect your wallet.");
            setError("Please connect your wallet to view aid records.");
            return;
          }
          
          const myRecords = response.data.records.filter(record => {
            const recordRecipient = record.recipient?.toLowerCase();
            const userWallet = walletAddress?.toLowerCase();
            const matches = recordRecipient === userWallet;
            console.log(`Record ${record.id}: ${recordRecipient} === ${userWallet} = ${matches}`);
            return matches;
          });
          
          console.log("Filtered records:", myRecords);
          setAidRecords(myRecords)
          
          // Calculate statistics
          const stats = myRecords.reduce((acc, record) => {
            acc.totalAid += Number(record.amount || 0)
            if (record.status === "Pending" || record.status === "In Transit") {
              acc.pendingAid += Number(record.amount || 0)
            }
            if (record.status === "Delivered" || record.status === "Verified") {
              acc.completedDeliveries++
            }
            const recordDate = new Date(record.timestamp)
            if (!acc.lastDeliveryDate || recordDate > acc.lastDeliveryDate) {
              acc.lastDeliveryDate = recordDate
            }
            return acc
          }, {
            totalAid: 0,
            pendingAid: 0,
            completedDeliveries: 0,
            lastDeliveryDate: null,
          })
          
          setStatistics(stats)
          setError(null)
        }
      } catch (err) {
        console.error("Error fetching aid records:", err)
        if (isMounted) {
          setError("Failed to load aid records. Please try again later.")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (isAuthenticated && user?.role === "refugee") {
      fetchAidRecords()
    }

    return () => {
      isMounted = false
    }
  }, [isAuthenticated, user, walletAddress])

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  if (user?.role !== "refugee") {
    return <Navigate to="/dashboard" />
  }

  const renderDeliveryProgress = (status) => {
    const stages = ["Pending", "In Transit", "Delivered", "Verified"]
    const currentStage = stages.indexOf(status)
    const progress = ((currentStage + 1) / stages.length) * 100

    return (
      <Box>
        <Progress
          value={progress}
          size="sm"
          colorScheme={
            status === "Verified"
              ? "green"
              : status === "Delivered"
              ? "blue"
              : "yellow"
          }
          mb={2}
        />
        <Flex justify="space-between">
          {stages.map((stage, index) => (
            <Text
              key={stage}
              fontSize="xs"
              color={index <= currentStage ? "green.500" : "gray.500"}
              fontWeight={index === currentStage ? "bold" : "normal"}
            >
              {stage}
            </Text>
          ))}
        </Flex>
      </Box>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={8}>
          <Heading size="xl">Aid Received Dashboard</Heading>
          <Text mt={2} color="gray.600">
            Track and manage your received aid packages
          </Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Aid Received</StatLabel>
                <StatNumber>
                  <Flex align="center">
                    <Icon as={FaEthereum} mr={2} />
                    {weiToEth(statistics.totalAid)} ETH
                  </Flex>
                </StatNumber>
                <StatHelpText>Lifetime total</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Pending Aid</StatLabel>
                <StatNumber>
                  <Flex align="center">
                    <Icon as={FaEthereum} mr={2} />
                    {weiToEth(statistics.pendingAid)} ETH
                  </Flex>
                </StatNumber>
                <StatHelpText>In process</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Completed Deliveries</StatLabel>
                <StatNumber>
                  <Flex align="center">
                    <Icon as={FaBoxOpen} mr={2} />
                    {statistics.completedDeliveries}
                  </Flex>
                </StatNumber>
                <StatHelpText>Successfully received</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Last Delivery</StatLabel>
                <StatNumber>
                  <Flex align="center">
                    <Icon as={FaCalendarAlt} mr={2} />
                    {statistics.lastDeliveryDate
                      ? new Date(statistics.lastDeliveryDate).toLocaleDateString()
                      : "N/A"}
                  </Flex>
                </StatNumber>
                <StatHelpText>Most recent aid</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
          <CardBody>
            <Stack spacing={6}>
              <Heading size="md">Aid History</Heading>
              <Divider />
              
              {loading ? (
                <Text textAlign="center">Loading aid records...</Text>
              ) : error ? (
                <Text textAlign="center" color="red.500">{error}</Text>
              ) : aidRecords.length === 0 ? (
                <Text textAlign="center">No aid records found.</Text>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th>Type</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Progress</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {aidRecords.map((record) => (
                      <Tr key={record.id}>
                        <Td>{formatIndianTimestamp(record.timestamp)}</Td>
                        <Td>{record.aidType}</Td>
                        <Td>
                          <Flex align="center">
                            <Icon as={FaEthereum} mr={1} />
                            {weiToEth(record.amount)}
                          </Flex>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={
                              record.status === "Verified"
                                ? "green"
                                : record.status === "Delivered"
                                ? "blue"
                                : record.status === "In Transit"
                                ? "yellow"
                                : "gray"
                            }
                          >
                            {record.status}
                          </Badge>
                        </Td>
                        <Td width="300px">{renderDeliveryProgress(record.status)}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Stack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  )
}

export default AidReceived
