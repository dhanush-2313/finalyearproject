import React from 'react';
import { Box, Center, Spinner, Text, VStack, useColorModeValue } from '@chakra-ui/react';

const Loading = ({ message = 'Loading...' }) => {
  const spinnerColor = useColorModeValue('blue.500', 'blue.200');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Center minH="200px" w="full">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color={spinnerColor}
          size="xl"
        />
        <Text color={textColor} fontSize="lg">
          {message}
        </Text>
      </VStack>
    </Center>
  );
};

export default Loading; 