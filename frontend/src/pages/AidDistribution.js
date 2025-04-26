import React from 'react';
import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Text,
  Button,
  useColorModeValue,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { FaHandHoldingHeart, FaBoxOpen, FaUsers, FaChartLine } from 'react-icons/fa';
import { useBlockchain } from '../hooks/useBlockchain';

const StatCard = ({ title, value, icon }) => {
  const bg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box
      p={6}
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      shadow="sm"
      transition="all 0.3s"
      _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
    >
      <VStack spacing={4} align="flex-start">
        <Icon as={icon} boxSize={8} color="blue.500" />
        <Box>
          <Text fontSize="sm" color="gray.500">
            {title}
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {value}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

const AidDistribution = () => {
  const { provider, connect } = useBlockchain();
  const bg = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>
              Aid Distribution Dashboard
            </Heading>
            <Text color="gray.600">
              Monitor and manage humanitarian aid distribution through blockchain
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <StatCard
              title="Total Aid Packages"
              value="1,234"
              icon={FaBoxOpen}
            />
            <StatCard
              title="Active Recipients"
              value="567"
              icon={FaUsers}
            />
            <StatCard
              title="Aid Distributed"
              value="89%"
              icon={FaHandHoldingHeart}
            />
            <StatCard
              title="Distribution Rate"
              value="+12.3%"
              icon={FaChartLine}
            />
          </SimpleGrid>

          {!provider && (
            <Box textAlign="center" py={8}>
              <Text mb={4}>Connect your wallet to view aid distribution data</Text>
              <Button colorScheme="blue" onClick={connect}>
                Connect Wallet
              </Button>
            </Box>
          )}

          {/* Add more sections here as needed */}
        </VStack>
      </Container>
    </Box>
  );
};

export default AidDistribution; 