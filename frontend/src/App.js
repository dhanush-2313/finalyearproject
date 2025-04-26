"use client"

import React, { Suspense } from 'react';
import { ChakraProvider, Spinner, Center } from '@chakra-ui/react';
import AppRoutes from './routes';

const LoadingFallback = () => (
  <Center h="100vh">
    <Spinner
      thickness="4px"
      speed="0.65s"
      emptyColor="gray.200"
      color="blue.500"
      size="xl"
    />
  </Center>
);

const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppRoutes />
    </Suspense>
  );
};

export default App;
