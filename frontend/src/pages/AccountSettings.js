import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  useColorModeValue,
  Alert,
  AlertIcon,
  Text,
  useToast,
} from '@chakra-ui/react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';
import MFASetup from '../components/MFASetup/MFASetup';

const AccountSettings = () => {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [tabIndex, setTabIndex] = useState(0);
  const toast = useToast();
  
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  const handleMFAStatusChange = (isEnabled) => {
    toast({
      title: isEnabled ? 'MFA Enabled' : 'MFA Disabled',
      description: isEnabled 
        ? 'Two-factor authentication has been enabled for your account.' 
        : 'Two-factor authentication has been disabled for your account.',
      status: isEnabled ? 'success' : 'info',
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Box mb={8}>
        <Heading size="lg" mb={2}>Account Settings</Heading>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>
          Manage your account preferences and security settings
        </Text>
      </Box>
      
      <Box
        bg={bg}
        borderRadius="lg"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)}>
          <TabList px={4} bg={useColorModeValue('gray.50', 'gray.900')}>
            <Tab>Profile</Tab>
            <Tab>Security</Tab>
            <Tab>Notifications</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box>
                <Heading size="md" mb={4}>Profile Information</Heading>
                <Text>Name: {user?.name}</Text>
                <Text>Email: {user?.email}</Text>
                <Text>Role: {user?.role}</Text>
              </Box>
            </TabPanel>
            
            <TabPanel>
              <Box>
                <Heading size="md" mb={4}>Security Settings</Heading>
                <Box my={6}>
                  <MFASetup
                    isEnabled={user?.mfaEnabled || false}
                    onStatusChange={handleMFAStatusChange}
                  />
                </Box>
                
                <Divider my={6} />
                
                <Box>
                  <Heading size="md" mb={4}>Change Password</Heading>
                  <Text>Password change functionality coming soon.</Text>
                </Box>
              </Box>
            </TabPanel>
            
            <TabPanel>
              <Heading size="md" mb={4}>Notification Preferences</Heading>
              <Text>Notification settings coming soon.</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  );
};

export default AccountSettings;