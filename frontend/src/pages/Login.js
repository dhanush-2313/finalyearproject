"use client"

import React, { useState, useContext } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  InputGroup,
  InputRightElement,
  IconButton,
  Link,
} from '@chakra-ui/react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';
import MFAVerification from '../components/MFAVerification/MFAVerification';
import { verifyMFA } from '../api/mfa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requireMFA, setRequireMFA] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const { login, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(formData);
      
      if (result.requireMFA) {
        // Handle MFA requirement
        setRequireMFA(true);
        setUserId(result.userId);
        setIsLoading(false);
        return;
      }
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMFASuccess = async () => {
    navigate('/dashboard');
  };

  const handleMFACancel = () => {
    setRequireMFA(false);
    setUserId(null);
  };

  // Show MFA verification if required
  if (requireMFA) {
    return (
      <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
        <MFAVerification 
          userId={userId} 
          onSuccess={handleMFASuccess} 
          onCancel={handleMFACancel} 
        />
      </Container>
    );
  }

  return (
    <Container maxW="lg" py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }}>
      <Stack spacing="8">
        <Stack spacing="6" textAlign="center">
          <Heading size={{ base: 'xl', md: '2xl' }}>Welcome back</Heading>
          <Text color={useColorModeValue('gray.600', 'gray.400')}>
            Enter your email and password to access your account
          </Text>
        </Stack>
        <Box
          py={{ base: '0', sm: '8' }}
          px={{ base: '4', sm: '10' }}
          bg={useColorModeValue('white', 'gray.800')}
          boxShadow={{ base: 'none', sm: 'md' }}
          borderRadius={{ base: 'none', sm: 'xl' }}
        >
          <form onSubmit={handleSubmit}>
            <Stack spacing="6">
              {(error || authError) && (
                <Alert status="error" borderRadius="md">
                  <AlertIcon />
                  {error || authError}
                </Alert>
              )}
              
              <Stack spacing="5">
                <FormControl isRequired>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <InputGroup>
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                    <InputRightElement h="full">
                      <IconButton
                        variant="ghost"
                        onClick={() => setShowPassword(show => !show)}
                        icon={showPassword ? <ViewIcon /> : <ViewOffIcon />}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        disabled={isLoading}
                      />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>
              </Stack>

              <Stack spacing="6">
                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  fontSize="md"
                  isLoading={isLoading}
                  loadingText="Signing in..."
                  disabled={isLoading}
                >
                  Sign in
                </Button>

                <Stack spacing="4" direction="row" align="center" justify="center">
                  <Text color={useColorModeValue('gray.600', 'gray.400')}>
                    Don't have an account?
                  </Text>
                  <Link
                    as={RouterLink}
                    to="/signup"
                    color={useColorModeValue('blue.500', 'blue.200')}
                    fontWeight="semibold"
                    _hover={{ color: useColorModeValue('blue.600', 'blue.300') }}
                  >
                    Sign up
                  </Link>
                </Stack>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Container>
  );
};

export default Login;
