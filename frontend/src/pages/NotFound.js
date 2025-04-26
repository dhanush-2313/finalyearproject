import React from 'react';
import { Box, Button, Container, Heading, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFound = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box minH="100vh" bg={bgColor} py={20}>
      <Container maxW="container.md">
        <VStack spacing={8} textAlign="center">
          <Heading size="4xl" color={useColorModeValue('blue.500', 'blue.200')}>
            404
          </Heading>
          <Heading size="xl">Page Not Found</Heading>
          <Text fontSize="lg" color={textColor}>
            Oops! The page you're looking for seems to have vanished into the blockchain.
          </Text>
          <Button
            as={RouterLink}
            to="/"
            colorScheme="blue"
            size="lg"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
          >
            Return to Home
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default NotFound;

