import React from 'react';
import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Link,
  Container,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    label: 'Aid Distribution',
    href: '/aid-distribution',
  },
  {
    label: 'Donor Tracking',
    href: '/donor-tracking',
  },
  {
    label: 'Refugee Access',
    href: '/refugee-access',
  },
  {
    label: 'Field Workers',
    href: '/field-workers',
  },
];

const Navbar = ({ isWeb3Connected, account, onConnect, onDisconnect }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const linkHoverColor = useColorModeValue('gray.800', 'white');

  return (
    <Box
      as="nav"
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <Text
            fontSize="xl"
            fontWeight="bold"
            as={RouterLink}
            to="/"
            _hover={{ textDecoration: 'none' }}
          >
            AidForge
          </Text>

          <Stack
            direction="row"
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
            alignItems="center"
          >
            {NAV_ITEMS.map((navItem) => (
              <Link
                key={navItem.label}
                as={RouterLink}
                to={navItem.href}
                fontSize="sm"
                fontWeight={500}
                color={textColor}
                _hover={{
                  textDecoration: 'none',
                  color: linkHoverColor,
                }}
              >
                {navItem.label}
              </Link>
            ))}

            <Button
              size="sm"
              colorScheme={isWeb3Connected ? 'green' : 'blue'}
              onClick={isWeb3Connected ? onDisconnect : onConnect}
            >
              {isWeb3Connected ? (
                <Text isTruncated maxW="150px">
                  {account?.substring(0, 6)}...{account?.substring(38)}
                </Text>
              ) : (
                'Connect Wallet'
              )}
            </Button>
          </Stack>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar; 