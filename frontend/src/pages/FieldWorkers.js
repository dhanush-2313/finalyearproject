import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  useColorModeValue,
  VStack,
  SimpleGrid,
  Icon,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react';
import { FaUserCheck, FaUserTimes, FaUserClock } from 'react-icons/fa';
import { useBlockchain } from '../hooks/useBlockchain';

const WorkerCard = ({ title, value, icon, color }) => {
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

const WorkerTable = () => {
  // Mock data - replace with actual blockchain data
  const workers = [
    {
      id: '0x123...abc',
      name: 'John Smith',
      status: 'Active',
      location: 'Refugee Camp A',
      lastActive: '2024-03-20',
    },
    {
      id: '0x456...def',
      name: 'Sarah Johnson',
      status: 'Pending',
      location: 'Refugee Camp B',
      lastActive: '2024-03-19',
    },
  ];

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Worker ID</Th>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Location</Th>
            <Th>Last Active</Th>
          </Tr>
        </Thead>
        <Tbody>
          {workers.map((worker) => (
            <Tr key={worker.id}>
              <Td>{worker.id}</Td>
              <Td>{worker.name}</Td>
              <Td>
                <Badge
                  colorScheme={
                    worker.status === 'Active'
                      ? 'green'
                      : worker.status === 'Pending'
                      ? 'yellow'
                      : 'red'
                  }
                >
                  {worker.status}
                </Badge>
              </Td>
              <Td>{worker.location}</Td>
              <Td>{worker.lastActive}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

const FieldWorkers = () => {
  const { provider, connect } = useBlockchain();
  const bg = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.700');

  return (
    <Box bg={bg} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>
              Field Workers Management
            </Heading>
            <Text color="gray.600">
              Monitor and manage field workers in refugee camps
            </Text>
          </Box>

          {provider ? (
            <>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                <WorkerCard
                  title="Active Workers"
                  value="24"
                  icon={FaUserCheck}
                  color="green.500"
                />
                <WorkerCard
                  title="Pending Verification"
                  value="5"
                  icon={FaUserClock}
                  color="yellow.500"
                />
                <WorkerCard
                  title="Inactive Workers"
                  value="3"
                  icon={FaUserTimes}
                  color="red.500"
                />
              </SimpleGrid>

              <Box
                p={6}
                bg={cardBg}
                borderRadius="lg"
                boxShadow="sm"
              >
                <Heading size="md" mb={4}>
                  Field Workers List
                </Heading>
                <WorkerTable />
              </Box>
            </>
          ) : (
            <Box textAlign="center" py={8}>
              <Text mb={4}>Connect your wallet to manage field workers</Text>
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

export default FieldWorkers;

