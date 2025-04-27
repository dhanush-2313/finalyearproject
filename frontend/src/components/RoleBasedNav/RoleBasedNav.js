import React from 'react';
import { 
  Button, 
  VStack, 
  Heading, 
  Box, 
  useColorModeValue,
  Divider, 
  Icon,
  Text, 
  Flex
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaDonate, FaClipboardList, FaHandHoldingHeart, FaUsers, FaCog } from 'react-icons/fa';
import { useAuth } from '../../auth/useAuth';

const NavButton = ({ label, icon, onClick, colorScheme = "blue" }) => (
  <Button
    leftIcon={<Icon as={icon} />}
    onClick={onClick}
    variant="solid"
    colorScheme={colorScheme}
    size="md"
    width="100%"
    justifyContent="flex-start"
    mb={2}
  >
    {label}
  </Button>
);

const RoleBasedNav = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  if (!user) return null;

  return (
    <Box 
      p={4} 
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="md"
      mb={4}
    >
      <Flex justify="space-between" align="center" mb={4}>
        <Heading size="sm">Quick Actions</Heading>
        <Button 
          size="sm"
          colorScheme="gray"
          onClick={() => navigate('/account-settings')}
          leftIcon={<Icon as={FaCog} />}
        >
          Settings
        </Button>
      </Flex>
      
      <Divider mb={4} />
      
      <VStack align="stretch" spacing={2}>
        {/* Common navigation for all users */}
        <NavButton 
          label="Dashboard" 
          icon={FaClipboardList} 
          onClick={() => navigate('/dashboard')} 
        />

        {/* Role-specific navigation */}
        {user.role === 'donor' && (
          <>
            <NavButton 
              label="Make Donation" 
              icon={FaDonate} 
              onClick={() => navigate('/donations')} 
              colorScheme="green"
            />
            <NavButton 
              label="View My Donations" 
              icon={FaHandHoldingHeart} 
              onClick={() => navigate('/donor-tracking')} 
            />
          </>
        )}
        
        {user.role === 'admin' && (
          <>
            <NavButton 
              label="Admin Panel" 
              icon={FaUsers} 
              onClick={() => navigate('/admin')} 
              colorScheme="purple"
            />
           
          </>
        )}
        
        {user.role === 'fieldWorker' && (
          <>
            <NavButton 
              label="Field Tasks" 
              icon={FaClipboardList} 
              onClick={() => navigate('/field-worker')} 
              colorScheme="orange"
            />
          </>
        )}
        
        {user.role === 'refugee' && (
          <>
            <NavButton 
              label="My Aid Records" 
              icon={FaClipboardList} 
              onClick={() => navigate('/aid-received')} 
              colorScheme="teal"
            />
            <NavButton 
              label="Account Details" 
              icon={FaUser} 
              onClick={() => navigate('/refugee-access')} 
            />
          </>
        )}
      </VStack>
    </Box>
  );
};

export default RoleBasedNav;