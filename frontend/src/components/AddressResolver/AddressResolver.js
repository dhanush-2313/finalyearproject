import React, { useState, useEffect, useCallback } from 'react';
import {
  Text,
  Tooltip,
  Spinner,
  HStack,
  Badge,
  useToast,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { blockchainAPI } from '../../api/api';
import { FaUserCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { safeRender } from '../../utils/reactUtils';

/**
 * AddressResolver component displays user-friendly information about a blockchain address
 * It resolves the address to a user if possible, otherwise displays a formatted address
 * 
 * @param {string} address - The blockchain address to resolve
 * @param {boolean} showTooltip - Whether to show a tooltip with detailed info
 * @param {boolean} showBadge - Whether to show a role badge
 * @param {string} size - Text size (sm, md, lg)
 */
const AddressResolver = ({ 
  address, 
  showTooltip = true,
  showBadge = true,
  size = 'md'
}) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();
  const badgeBgColor = useColorModeValue('gray.100', 'gray.700');

  // Role colors for badges
  const roleColors = {
    admin: 'purple',
    donor: 'green',
    fieldWorker: 'blue',
    refugee: 'orange',
  };

  // Format address for display (0x1234...5678)
  const formatAddress = (addr) => {
    if (!addr) return '';
    if (addr.length < 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  // Fetch user data for this address
  const fetchUserData = useCallback(async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await blockchainAPI.resolveAddress(address);
      
      if (response?.data?.success) {
        setUserData(response.data.data);
      } else {
        setUserData(null);
      }
    } catch (err) {
      console.error('Error resolving address:', err);
      setError(err.message || 'Failed to resolve address');
      setUserData(null);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Display formatted address when no user data
  const getDisplayName = () => {
    if (loading) return 'Loading...';
    // Use safeRender to prevent object rendering errors
    if (userData?.user?.name) return safeRender(userData.user.name);
    return formatAddress(address);
  };

  // Get user's role as a string
  const getUserRole = () => {
    return userData?.user?.role ? safeRender(userData.user.role) : '';
  };

  // When still loading
  if (loading) {
    return <Spinner size="xs" />;
  }

  // When ready to display
  return (
    <Tooltip 
      label={
        <Box p={2}>
          {userData?.user ? (
            <>
              <Text>Name: {safeRender(userData.user.name, 'Unknown')}</Text>
              <Text>Role: {safeRender(userData.user.role, 'Unknown')}</Text>
              {userData.user.email && <Text>Email: {safeRender(userData.user.email)}</Text>}
            </>
          ) : (
            <Text>Address: {address || 'Unknown'} (Unresolved)</Text>
          )}
          <Text fontSize="xs" mt={2}>Address: {address}</Text>
        </Box>
      }
      isDisabled={!showTooltip}
      hasArrow
      placement="top"
    >
      <HStack spacing={1} display="inline-flex" alignItems="center">
        <FaUserCircle />
        <Text fontSize={size} fontWeight={userData ? 'medium' : 'normal'}>
          {getDisplayName()}
        </Text>
        
        {userData?.user?.role && showBadge && (
          <Badge 
            colorScheme={roleColors[getUserRole()] || 'gray'} 
            variant="subtle"
            fontSize="xs"
            ml={1}
          >
            {getUserRole()}
          </Badge>
        )}
      </HStack>
    </Tooltip>
  );
};

export default AddressResolver;