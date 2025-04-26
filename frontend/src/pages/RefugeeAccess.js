import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  useColorModeValue,
  VStack,
  HStack,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  SimpleGrid,
  Icon,
  Divider,
} from '@chakra-ui/react';
import { FaCheckCircle, FaTimesCircle, FaIdCard, FaBoxOpen } from 'react-icons/fa';
import { useBlockchain } from '../hooks/useBlockchain';

const StatusCard = ({ title, value, icon, color }) => {
  const cardBg = useColorModeValue('white', 'gray.700');
  
  return (
    <Box
      p={6}
      bg={cardBg}
      borderRadius="lg"
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <VStack spacing={4} align="flex-start">
        <Icon as={icon} boxSize={6} color={color} />
        <Text color="gray.500" fontSize="sm">
          {title}
        </Text>
        <Text fontSize="2xl" fontWeight="bold">
          {value}
        </Text>
      </VStack>
    </Box>
  );
};

const RefugeeAccess = () => {
  const { provider, connect } = useBlockchain();
  const [recipientId, setRecipientId] = useState('');
  const [verificationStatus, setVerificationStatus] = useState(null);
  
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');

  const handleVerification = async () => {
    try {
      // TODO: Implement actual blockchain verification
      // Mock verification for now
      setVerificationStatus({
        verified: true,
        name: 'John Doe',
        registrationDate: '2024-03-01',
        lastAidReceived: '2024-03-15',
        nextEligibleDate: '2024-03-30',
      });
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus({ verified: false, error: error.message });
    }
  };

  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>
              Refugee Access Portal
            </Heading>
            <Text color="gray.600">
              Verify recipient status and view aid distribution details
            </Text>
          </Box>

          {provider ? (
            <>
              <Box
                p={6}
                bg={cardBg}
                borderRadius="lg"
                boxShadow="sm"
              >
                <VStack spacing={6} align="stretch">
                  <FormControl>
                    <FormLabel>Recipient ID</FormLabel>
                    <Input
                      placeholder="Enter recipient ID or wallet address"
                      value={recipientId}
                      onChange={(e) => setRecipientId(e.target.value)}
                    />
                    <FormHelperText>
                      Enter the unique identifier provided during registration
                    </FormHelperText>
                  </FormControl>
                  
                  <Button
                    colorScheme="blue"
                    onClick={handleVerification}
                    isDisabled={!recipientId}
                  >
                    Verify Status
                  </Button>
                </VStack>
              </Box>

              {verificationStatus && (
                <>
                  <Alert
                    status={verificationStatus.verified ? 'success' : 'error'}
                    variant="subtle"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    textAlign="center"
                    borderRadius="lg"
                    p={6}
                  >
                    <AlertIcon boxSize="40px" mr={0} />
                    <AlertTitle mt={4} mb={1} fontSize="lg">
                      {verificationStatus.verified
                        ? 'Recipient Verified'
                        : 'Verification Failed'}
                    </AlertTitle>
                    <AlertDescription maxWidth="sm">
                      {verificationStatus.verified
                        ? `Welcome back, ${verificationStatus.name}`
                        : verificationStatus.error}
                    </AlertDescription>
                  </Alert>

                  {verificationStatus.verified && (
                    <>
                      <Divider />
                      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                        <StatusCard
                          title="Registration Date"
                          value={verificationStatus.registrationDate}
                          icon={FaIdCard}
                          color="blue.500"
                        />
                        <StatusCard
                          title="Last Aid Received"
                          value={verificationStatus.lastAidReceived}
                          icon={FaBoxOpen}
                          color="green.500"
                        />
                        <StatusCard
                          title="Next Eligible Date"
                          value={verificationStatus.nextEligibleDate}
                          icon={FaCheckCircle}
                          color="purple.500"
                        />
                        <StatusCard
                          title="Aid Status"
                          value="Active"
                          icon={FaCheckCircle}
                          color="green.500"
                        />
                      </SimpleGrid>
                    </>
                  )}
                </>
              )}
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <Text mb={4}>Connect your wallet to access recipient verification</Text>
              <Button colorScheme="blue" onClick={connect}>
                Connect Wallet
              </Button>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default RefugeeAccess; 