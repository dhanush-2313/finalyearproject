"use client"

import React from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  Stack,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { FaHandHoldingHeart, FaEthereum, FaShieldAlt } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

const Feature = ({ icon, title, text }) => {
  return (
    <VStack
      align="start"
      p={6}
      bg={useColorModeValue('white', 'gray.800')}
      rounded="xl"
      shadow="lg"
      borderWidth="1px"
      borderColor={useColorModeValue('gray.100', 'gray.700')}
      _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s' }}
    >
      <Icon as={icon} w={10} h={10} color="blue.500" />
      <Heading size="md" mt={4} mb={2}>
        {title}
      </Heading>
      <Text color={useColorModeValue('gray.600', 'gray.300')}>{text}</Text>
    </VStack>
  );
};

const Landing = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.300');

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Container maxW="container.xl" pt={20} pb={16}>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          spacing={10}
          align="center"
          justify="space-between"
        >
          <VStack align="start" spacing={6} maxW="lg">
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              lineHeight="shorter"
              color={useColorModeValue('gray.900', 'white')}
            >
              Empowering Humanitarian Aid Through Blockchain
            </Heading>
            <Text fontSize="xl" color={textColor}>
              AidForge leverages blockchain technology to ensure transparent, efficient, and secure
              distribution of humanitarian aid to those who need it most.
            </Text>
            <HStack spacing={4}>
              <Button
                as={RouterLink}
                to="/signup"
                size="lg"
                colorScheme="blue"
                px={8}
                fontSize="md"
                fontWeight="bold"
              >
                Get Started
              </Button>
              <Button
                as={RouterLink}
                to="/login"
                size="lg"
                variant="outline"
                colorScheme="blue"
                px={8}
                fontSize="md"
                fontWeight="bold"
              >
                Login
              </Button>
            </HStack>
          </VStack>
          <Box
            boxSize={{ base: '300px', lg: '500px' }}
            position="relative"
            overflow="hidden"
            rounded="2xl"
          >
            <Image
              src="/images/hero-image.png"
              alt="Humanitarian Aid"
              fallback={
                <Box
                  w="100%"
                  h="100%"
                  bg="blue.100"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Icon
                    as={FaHandHoldingHeart}
                    w={20}
                    h={20}
                    color="blue.500"
                  />
                </Box>
              }
            />
          </Box>
        </Stack>
      </Container>

      {/* Features Section */}
      <Box py={20} bg={useColorModeValue('white', 'gray.800')}>
        <Container maxW="container.xl">
          <VStack spacing={12}>
            <Heading
              textAlign="center"
              size="xl"
              color={useColorModeValue('gray.900', 'white')}
            >
              Why Choose AidForge?
            </Heading>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              spacing={8}
              px={{ base: 4, md: 0 }}
            >
              <Feature
                icon={FaHandHoldingHeart}
                title="Transparent Aid"
                text="Track every donation and aid distribution in real-time with complete transparency on the blockchain."
              />
              <Feature
                icon={FaEthereum}
                title="Efficient Distribution"
                text="Smart contracts ensure quick and efficient distribution of aid to verified recipients."
              />
              <Feature
                icon={FaShieldAlt}
                title="Secure & Verified"
                text="Multi-layer verification system ensures aid reaches the intended beneficiaries."
              />
            </Stack>
          </VStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={10}
            align="center"
            justify="space-between"
            bg={useColorModeValue('blue.50', 'blue.900')}
            p={10}
            rounded="2xl"
            shadow="xl"
          >
            <VStack align="start" spacing={4} maxW="lg">
              <Heading size="lg">Ready to Make a Difference?</Heading>
              <Text fontSize="lg" color={textColor}>
                Join AidForge today and be part of the revolution in humanitarian aid distribution.
              </Text>
            </VStack>
            <Button
              as={RouterLink}
              to="/signup"
              size="lg"
              colorScheme="blue"
              px={8}
              fontSize="md"
              fontWeight="bold"
            >
              Join Now
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 