import React from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  useColorModeValue,
  IconButton,
  Grid,
  GridItem,
  Heading,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { FaGithub, FaTwitter, FaLinkedin, FaEthereum, FaShieldAlt, FaHandHoldingHeart } from 'react-icons/fa';

const SocialButton = ({ children, label, href }) => {
  return (
    <IconButton
      bg={useColorModeValue('blackAlpha.100', 'whiteAlpha.100')}
      rounded={'full'}
      cursor={'pointer'}
      as={'a'}
      href={href}
      display={'inline-flex'}
      alignItems={'center'}
      justifyContent={'center'}
      transition={'background 0.3s ease'}
      _hover={{
        bg: useColorModeValue('blackAlpha.200', 'whiteAlpha.200'),
        transform: 'scale(1.1)',
      }}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      icon={children}
    />
  );
};

const Footer = () => {
  return (
    <Box
      bg={useColorModeValue('white', 'gray.900')}
      borderTopWidth={1}
      borderStyle={'solid'}
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      mt="auto">
      <Container maxW={'6xl'} py={10}>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={8}>
          <GridItem>
            <VStack align="start" spacing={4}>
              <Heading size="md" color={useColorModeValue('gray.700', 'gray.200')}>
                AidForge
              </Heading>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Empowering humanitarian aid distribution through blockchain technology.
              </Text>
              <HStack spacing={4}>
                <SocialButton label={'GitHub'} href={'https://github.com/your-org/aidforge'}>
                  <FaGithub />
                </SocialButton>
                <SocialButton label={'Twitter'} href={'https://twitter.com/aidforge'}>
                  <FaTwitter />
                </SocialButton>
                <SocialButton label={'LinkedIn'} href={'https://linkedin.com/company/aidforge'}>
                  <FaLinkedin />
                </SocialButton>
              </HStack>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={4}>
              <Heading size="md" color={useColorModeValue('gray.700', 'gray.200')}>
                Quick Links
              </Heading>
              <Stack spacing={2}>
                <Link href="/dashboard" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Dashboard
                </Link>
                <Link href="/donations" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Donations
                </Link>
                <Link href="/aid-received" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                  Aid Received
                </Link>
              </Stack>
            </VStack>
          </GridItem>

          <GridItem>
            <VStack align="start" spacing={4}>
              <Heading size="md" color={useColorModeValue('gray.700', 'gray.200')}>
                Technology
              </Heading>
              <HStack spacing={4}>
                <IconButton
                  icon={<FaEthereum />}
                  aria-label="Ethereum"
                  variant="ghost"
                  colorScheme="purple"
                />
                <IconButton
                  icon={<FaShieldAlt />}
                  aria-label="Security"
                  variant="ghost"
                  colorScheme="green"
                />
                <IconButton
                  icon={<FaHandHoldingHeart />}
                  aria-label="Humanitarian"
                  variant="ghost"
                  colorScheme="red"
                />
              </HStack>
              <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                Powered by Ethereum blockchain for transparent and secure aid distribution.
              </Text>
            </VStack>
          </GridItem>
        </Grid>

        <Box
          borderTopWidth={1}
          borderStyle={'solid'}
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          mt={8}
          pt={8}>
          <Text textAlign="center" fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
            © {new Date().getFullYear()} AidForge. All rights reserved. Built with ❤️ for humanitarian aid.
          </Text>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 