import React from 'react';
import { Center, Spinner, VStack, Text } from '@chakra-ui/react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <Center minH="200px">
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
        <Text color="gray.600">{message}</Text>
      </VStack>
    </Center>
  );
};

export default Loader; 