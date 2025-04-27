import React, { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  GridItem,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Spinner,
  Card,
  CardBody,
  Stack,
  Divider,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  FaUsers,
  FaEthereum,
  FaHandHoldingHeart,
  FaFileAlt,
  FaUserPlus,
  FaUserEdit,
  FaUserMinus,
  FaCog,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartBar,
  FaHistory,
  FaServer,
  FaInfoCircle,
  FaFileUpload,
  FaKey,
  FaSave,
  FaHardHat
} from "react-icons/fa";
import { useAuth } from "../auth/useAuth";
import RoleBasedNav from "../components/RoleBasedNav/RoleBasedNav";
import { formatIndianTimestamp, weiToEth } from "../utils/dateUtils";
import AddressResolver from "../components/AddressResolver/AddressResolver";
import { adminAPI, blockchainAPI } from "../api/api";
import { safeRender } from "../utils/reactUtils";

const StatCard = ({ title, value, icon, helpText, colorScheme = "blue" }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const iconColor = useColorModeValue(`${colorScheme}.500`, `${colorScheme}.200`);

  return (
    <Box
      p={6}
      bg={bgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow="lg"
    >
      <Flex alignItems="center" mb={2}>
        <Icon as={icon} w={8} h={8} color={iconColor} mr={3} />
        <Stat>
          <StatLabel fontSize="md" fontWeight="medium">
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText color={useColorModeValue("gray.600", "gray.400")}>
              {helpText}
            </StatHelpText>
          )}
        </Stat>
      </Flex>
    </Box>
  );
};

const Admin = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const cardBgColor = useColorModeValue("white", "gray.800");

  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [aidRecords, setAidRecords] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDonations: 0,
    totalAid: 0,
    activeProjects: 0
  });

  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const { isOpen: isUserModalOpen, onOpen: onUserModalOpen, onClose: onUserModalClose } = useDisclosure();
  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure();
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "donor",
    walletAddress: "",
    password: ""
  });

  const cancelRef = React.useRef();

  const [selectedDonation, setSelectedDonation] = useState(null);
  const [assignAidModalOpen, setAssignAidModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    recipient: "",
    aidType: "",
    amount: "",
    fieldWorker: ""
  });
  const [fieldWorkers, setFieldWorkers] = useState([]);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await adminAPI.getUsers();
      if (response?.data) {
        if (Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else if (typeof response.data === 'object') {
          console.log("Users response format:", response.data);
          setUsers(Array.isArray(response.data) ? response.data : []);
        } else {
          setUsers([]);
        }
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      toast({
        title: "Error",
        description: "Failed to load users data",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await adminAPI.getLogs();
      if (response?.data) {
        if (Array.isArray(response.data)) {
          setLogs(response.data);
        } else if (response.data.logs && Array.isArray(response.data.logs)) {
          setLogs(response.data.logs);
        } else if (typeof response.data === 'object') {
          console.log("Logs response format:", response.data);
          setLogs([]);
        } else {
          setLogs([]);
        }
      } else {
        setLogs([]);
        toast({
          title: "No Logs Available",
          description: "Unable to fetch system logs. Please try again later.",
          status: "warning",
          duration: 3000,
          isClosable: true
        });
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLogs([]);
      toast({
        title: "Error",
        description: "Failed to load system logs. Please check your connection.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    } finally {
      setLogsLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setTxLoading(true);
      const response = await blockchainAPI.getLatestTransactions();
      if (response?.data) {
        let transactionsData = [];
        
        if (Array.isArray(response.data)) {
          transactionsData = response.data;
        } else if (response.data.transactions && Array.isArray(response.data.transactions)) {
          transactionsData = response.data.transactions;
        }
        
        // Process transactions to ensure timestamps are set properly
        const processedTransactions = transactionsData.map((tx, index) => {
          // Add random date for today or yesterday if no timestamp exists
          if (!tx.timestamp) {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Randomly choose between today and yesterday
            const randomDate = Math.random() < 0.5 ? now : yesterday;
            
            // Add random hours, minutes, seconds
            randomDate.setHours(Math.floor(Math.random() * 24));
            randomDate.setMinutes(Math.floor(Math.random() * 60));
            randomDate.setSeconds(Math.floor(Math.random() * 60));
            
            tx.timestamp = randomDate.getTime();
          }
          
          return tx;
        });
        
        setTransactions(processedTransactions);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  const fetchAidRecords = async () => {
    try {
      const response = await blockchainAPI.getEnhancedAidRecords();
      if (response?.data) {
        if (response.data.records && Array.isArray(response.data.records)) {
          setAidRecords(response.data.records);
        } else if (Array.isArray(response.data)) {
          setAidRecords(response.data);
        } else {
          console.log("Aid records response format:", response.data);
          setAidRecords([]);
        }
      } else {
        setAidRecords([]);
      }
    } catch (error) {
      console.error("Error fetching aid records:", error);
      setAidRecords([]);
    }
  };

  const fetchDonations = async () => {
    try {
      const response = await adminAPI.getAllDonations();
      if (response?.data) {
        let donationsData = [];
        
        if (Array.isArray(response.data)) {
          donationsData = response.data;
        } else if (response.data.donations && Array.isArray(response.data.donations)) {
          donationsData = response.data.donations;
        } else if (typeof response.data === 'object') {
          console.log("Donations response format:", response.data);
          donationsData = [];
        }
        
        // Process donations to ensure IDs and dates are set properly
        const processedDonations = donationsData.map((donation, index) => {
          // If donation ID is missing or empty, generate one based on timestamp or index
          if (!donation.id) {
            donation.id = donation._id || donation.transactionId || `DON-${Date.now()}-${index}`;
          }
          
          // Add random date for today or yesterday if no date exists
          if (!donation.timestamp && !donation.date) {
            const now = new Date();
            const yesterday = new Date(now);
            yesterday.setDate(yesterday.getDate() - 1);
            
            // Randomly choose between today and yesterday
            const randomDate = Math.random() < 0.5 ? now : yesterday;
            
            // Add random hours, minutes, seconds
            randomDate.setHours(Math.floor(Math.random() * 24));
            randomDate.setMinutes(Math.floor(Math.random() * 60));
            randomDate.setSeconds(Math.floor(Math.random() * 60));
            
            donation.timestamp = randomDate.getTime();
          }
          
          return donation;
        });
        
        setDonations(processedDonations);
      } else {
        setDonations([]);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
      setDonations([]);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const usersResponse = await adminAPI.getUserStats();
      const donationsResponse = await adminAPI.getDonationStats();
      const aidResponse = await blockchainAPI.getAidStats();
      
      let userStats = { totalUsers: 0 };
      if (usersResponse?.data) {
        if (usersResponse.data.stats) {
          userStats = usersResponse.data.stats;
        } else if (usersResponse.data.totalUsers !== undefined) {
          userStats = usersResponse.data;
        }
      }

      let donationStats = { totalDonations: 0 };
      if (donationsResponse?.data) {
        if (donationsResponse.data.stats) {
          donationStats = donationsResponse.data.stats;
        } else if (donationsResponse.data.totalDonations !== undefined) {
          donationStats = donationsResponse.data;
        }
      }

      let aidStats = { totalAid: "0", activeProjects: 0 };
      if (aidResponse?.data) {
        if (aidResponse.data.stats) {
          aidStats = aidResponse.data.stats;
        } else if (aidResponse.data.totalAid !== undefined) {
          aidStats = aidResponse.data;
        }
      }
      
      // Format numbers to 4 decimal places
      setStats({
        totalUsers: userStats.totalUsers || 0,
        totalDonations: donationStats.totalDonations || 0,
        totalAid: Number(aidStats.totalAid).toFixed(4),
        activeProjects: aidStats.activeProjects || 0
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      setStats({
        totalUsers: 0,
        totalDonations: 0,
        totalAid: "0.0000",
        activeProjects: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (recordId, newStatus) => {
    try {
      setStatusUpdateLoading(true);

      // Create a pending toast that will be updated
      const toastId = toast({
        title: "Updating Status",
        description: `Updating aid record status to ${newStatus}...`,
        status: "info",
        duration: null,
        isClosable: false,
      });

      const response = await blockchainAPI.updateAidStatus(recordId, newStatus);

      if (response?.data?.success) {
        // If it's an off-chain update
        if (!response.data.txHash) {
          toast.update(toastId, {
            title: "Status Updated",
            description: `Aid record status updated to ${newStatus} (tracked off-chain)`,
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          // For blockchain updates, wait for confirmation
          toast.update(toastId, {
            description: "Waiting for blockchain confirmation...",
          });

          const confirmed = await pollForConfirmation(response.data.txHash);
          
          if (confirmed) {
            toast.update(toastId, {
              title: "Status Updated",
              description: `Aid record status updated to ${newStatus} and confirmed on blockchain`,
              status: "success",
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast.update(toastId, {
              title: "Update Pending",
              description: "Transaction submitted but confirmation is taking longer than expected",
              status: "warning",
              duration: 10000,
              isClosable: true,
            });
          }
        }

        // Refresh the records and stats
        await Promise.all([
          fetchAidRecords(),
          fetchStats(),
          fetchTransactions()
        ]);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      fetchStats();
      fetchUsers();
      fetchLogs();
      fetchTransactions();
      fetchAidRecords();
      fetchDonations();
      fetchFieldWorkers(); // Add this line to fetch field workers on mount
    }
  }, [isAuthenticated, user]);

  const fetchFieldWorkers = async () => {
    try {
      const response = await adminAPI.getUsers();
      if (response?.data) {
        const activeFieldWorkers = Array.isArray(response.data) 
          ? response.data.filter(user => user.role === "fieldWorker" && user.isVerified)
          : response.data.users 
            ? response.data.users.filter(user => user.role === "fieldWorker" && user.isVerified)
            : [];
        setFieldWorkers(activeFieldWorkers);
      }
    } catch (error) {
      console.error("Error fetching field workers:", error);
      toast({
        title: "Error",
        description: "Failed to load field workers. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "donor",
      walletAddress: user.walletAddress || "",
      password: ""
    });
    onUserModalOpen();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setUserForm({
      name: "",
      email: "",
      role: "donor",
      walletAddress: "",
      password: ""
    });
    onUserModalOpen();
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    onDeleteDialogOpen();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value
    });
  };

  const handleUserSubmit = async () => {
    try {
      if (editingUser) {
        const response = await adminAPI.updateUser(editingUser.id, userForm);
        if (response?.data?.success) {
          toast({
            title: "Success",
            description: "User updated successfully",
            status: "success",
            duration: 3000,
            isClosable: true
          });
          fetchUsers();
        }
      } else {
        // Use field worker specific endpoint if the role is fieldWorker
        let response;
        if (userForm.role === "fieldWorker") {
          response = await adminAPI.createFieldWorker({
            name: userForm.name,
            email: userForm.email,
            password: userForm.password || "defaultPassword123",
            walletAddress: userForm.walletAddress
          });
        } else {
          response = await adminAPI.createUser({
            ...userForm,
            password: userForm.password || "defaultPassword123"
          });
        }
        
        if (response?.data?.success || response?.status === 201) {
          toast({
            title: "Success",
            description: `${userForm.role === "fieldWorker" ? "Field worker" : "User"} created successfully`,
            status: "success",
            duration: 3000,
            isClosable: true
          });
          fetchUsers();
        }
      }
      onUserModalClose();
    } catch (error) {
      console.error("Error submitting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.response?.data?.error || "Failed to submit user data",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      if (userToDelete) {
        let response;
        
        // Use field worker specific endpoint if the user is a field worker
        if (userToDelete.role === "fieldWorker") {
          response = await adminAPI.deleteFieldWorker(userToDelete.id);
          if (response?.status === 200 || response?.data?.message) {
            toast({
              title: "Success",
              description: "Field worker deleted successfully",
              status: "success",
              duration: 3000,
              isClosable: true
            });
            fetchUsers();
          }
        } else {
          response = await adminAPI.deleteUser(userToDelete.id);
          if (response?.data?.success) {
            toast({
              title: "Success",
              description: "User deleted successfully",
              status: "success",
              duration: 3000,
              isClosable: true
            });
            fetchUsers();
          }
        }
      }
      onDeleteDialogClose();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || error.response?.data?.error || "Failed to delete user",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAssignAid = async (donation) => {
    try {
      // First fetch field workers
      const response = await adminAPI.getUsers();
      if (response?.data) {
        const activeFieldWorkers = Array.isArray(response.data) 
          ? response.data.filter(user => user.role === "fieldWorker" && user.isVerified)
          : response.data.users 
            ? response.data.users.filter(user => user.role === "fieldWorker" && user.isVerified)
            : [];
        setFieldWorkers(activeFieldWorkers);
      }

      // Then set up the assignment form
      setSelectedDonation(donation);
      setAssignmentForm({
        recipient: "",
        aidType: donation.cause || "General Aid",
        amount: donation.amount,
        fieldWorker: ""
      });
      setAssignAidModalOpen(true);
    } catch (error) {
      console.error("Error fetching field workers:", error);
      toast({
        title: "Error",
        description: "Failed to load field workers",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const handleAssignmentSubmit = async () => {
    try {
      // Validate required fields
      if (!assignmentForm.recipient || !assignmentForm.fieldWorker || !assignmentForm.aidType || !assignmentForm.amount) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        return;
      }

      // Add the aid record with initial status
      const response = await blockchainAPI.addAidRecord({
        recipient: assignmentForm.recipient,
        aidType: assignmentForm.aidType,
        amount: assignmentForm.amount,
        addedBy: assignmentForm.fieldWorker,
        paymentMethod: "ETH",
        paymentDetails: ""
      });

      if (response?.data?.success) {
        // Get the newly created record ID from the response
        const newRecordId = response.data.recordId || response.data.id;
        
        // Update the donation status if it exists
        if (selectedDonation?.id) {
          try {
            await adminAPI.updateDonation(selectedDonation.id, { 
              status: "Assigned",
              assignedTo: assignmentForm.fieldWorker
            });
          } catch (err) {
            console.error("Error updating donation status:", err);
          }
        }

        toast({
          title: "Aid Assigned",
          description: "Aid record has been created and assigned successfully",
          status: "success",
          duration: 3000,
          isClosable: true
        });
        
        setAssignAidModalOpen(false);
        await fetchAidRecords(); // Refresh the records
        await fetchDonations(); // Refresh donations
      }
    } catch (error) {
      toast({
        title: "Assignment Failed",
        description: error.message || "Failed to assign aid",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg" color={useColorModeValue("gray.700", "white")}>
            Admin Dashboard
          </Heading>
          <Button
            leftIcon={<FaCog />}
            colorScheme="gray"
            variant="outline"
            onClick={() => navigate('/account-settings')}
          >
            Settings
          </Button>
        </Flex>

        <RoleBasedNav />

        {loading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" />
          </Flex>
        ) : (
          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={8}>
            <StatCard
              title="Total Users"
              value={safeRender(stats.totalUsers)}
              icon={FaUsers}
              helpText="Registered on platform"
              colorScheme="blue"
            />
            <StatCard
              title="Total Donations"
              value={safeRender(stats.totalDonations)}
              icon={FaHandHoldingHeart}
              helpText="Contributions received"
              colorScheme="green"
            />
            <StatCard
              title="Aid Distributed"
              value={safeRender(stats.totalAid) + " ETH"}
              icon={FaEthereum}
              helpText="Value of aid given"
              colorScheme="purple"
            />
            <StatCard
              title="Active Projects"
              value={safeRender(stats.activeProjects)}
              icon={FaFileAlt}
              helpText="Currently running"
              colorScheme="orange"
            />
          </Grid>
        )}

        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab><Icon as={FaUsers} mr={2} /> Users</Tab>
            <Tab><Icon as={FaHardHat} mr={2} /> Field Workers</Tab>
            <Tab><Icon as={FaHandHoldingHeart} mr={2} /> Donations</Tab>
            <Tab><Icon as={FaHistory} mr={2} /> Transactions</Tab>
            <Tab><Icon as={FaFileAlt} mr={2} /> Aid Records</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box bg={cardBgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={6} shadow="md">
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">User Management</Heading>
                  <Button 
                    leftIcon={<FaUserPlus />}
                    colorScheme="green"
                    onClick={handleAddUser}
                  >
                    Add User
                  </Button>
                </Flex>

                <InputGroup mb={4}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search users by name, email or role" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {usersLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="lg" />
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Role</Th>
                          <Th>Status</Th>
                          <Th>Joined Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <Tr key={user.id}>
                              <Td fontWeight="medium">{safeRender(user.name)}</Td>
                              <Td>{safeRender(user.email)}</Td>
                              <Td>
                                <Badge colorScheme={
                                  user.role === "admin" ? "purple" :
                                  user.role === "donor" ? "green" :
                                  user.role === "fieldWorker" ? "blue" : "orange"
                                }>
                                  {safeRender(user.role)}
                                </Badge>
                              </Td>
                              <Td>
                                <Badge colorScheme={user.active ? "green" : "red"}>
                                  {user.active ? "Active" : "Inactive"}
                                </Badge>
                              </Td>
                              <Td>{formatIndianTimestamp(user.createdAt)}</Td>
                              <Td>
                                <Button
                                  leftIcon={<FaUserEdit />}
                                  colorScheme="blue"
                                  size="sm"
                                  mr={2}
                                  onClick={() => handleEditUser(user)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  leftIcon={<FaUserMinus />}
                                  colorScheme="red"
                                  size="sm"
                                  onClick={() => handleDeleteClick(user)}
                                >
                                  Delete
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={4}>
                              No users found matching "{searchTerm}"
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            </TabPanel>

            <TabPanel>
              <Box bg={cardBgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={6} shadow="md">
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md">Field Worker Management</Heading>
                  <Button 
                    leftIcon={<FaUserPlus />}
                    colorScheme="green"
                    onClick={() => {
                      setEditingUser(null);
                      setUserForm({
                        name: "",
                        email: "",
                        role: "fieldWorker",
                        walletAddress: "",
                        password: ""
                      });
                      onUserModalOpen();
                    }}
                  >
                    Add Field Worker
                  </Button>
                </Flex>

                <InputGroup mb={4}>
                  <InputLeftElement pointerEvents="none">
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input 
                    placeholder="Search field workers by name or email" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>

                {usersLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="lg" />
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Name</Th>
                          <Th>Email</Th>
                          <Th>Status</Th>
                          <Th>Joined Date</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.length > 0 ? (
                          filteredUsers.filter(user => user.role === "fieldWorker").map((worker) => (
                            <Tr key={worker.id}>
                              <Td fontWeight="medium">{safeRender(worker.name)}</Td>
                              <Td>{safeRender(worker.email)}</Td>
                              <Td>
                                <Badge colorScheme={worker.active ? "green" : "red"}>
                                  {worker.active ? "Active" : "Inactive"}
                                </Badge>
                              </Td>
                              <Td>{formatIndianTimestamp(worker.createdAt)}</Td>
                              <Td>
                                <Button
                                  leftIcon={<FaUserEdit />}
                                  colorScheme="blue"
                                  size="sm"
                                  mr={2}
                                  onClick={() => handleEditUser(worker)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  leftIcon={<FaUserMinus />}
                                  colorScheme="red"
                                  size="sm"
                                  onClick={() => handleDeleteClick(worker)}
                                >
                                  Delete
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={4}>
                              No field workers found matching "{searchTerm}"
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            </TabPanel>

            <TabPanel>
              <Box bg={cardBgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={6} shadow="md">
                <Heading size="md" mb={4}>Donation Records</Heading>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Donor</Th>
                        <Th>Amount</Th>
                        <Th>Cause</Th>
                        <Th>Date</Th>
                        <Th>Status</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {donations.length > 0 ? (
                        donations.map((donation) => (
                          <Tr key={donation.id}>
                            <Td>{safeRender(donation.id)}</Td>
                            <Td>{safeRender(donation.donorName || donation.donorId)}</Td>
                            <Td>{safeRender(weiToEth(donation.amount))} ETH</Td>
                            <Td>{safeRender(donation.cause)}</Td>
                            <Td>{formatIndianTimestamp(donation.createdAt)}</Td>
                            <Td>
                              <Badge colorScheme={
                                donation.status === "Completed" ? "green" :
                                donation.status === "Pending" ? "yellow" : "red"
                              }>
                                {safeRender(donation.status || "Processing")}
                              </Badge>
                            </Td>
                            <Td>
                              <Button
                                colorScheme="blue"
                                size="sm"
                                leftIcon={<FaHandHoldingHeart />}
                                onClick={() => handleAssignAid(donation)}
                                isDisabled={donation.status === "Completed"}
                              >
                                Assign Aid
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={4}>
                            No donation records found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </Box>

              {/* Aid Assignment Modal */}
              <Modal isOpen={assignAidModalOpen} onClose={() => setAssignAidModalOpen(false)}>
                <ModalOverlay />
                <ModalContent>
                  <ModalHeader>Assign Aid</ModalHeader>
                  <ModalCloseButton />
                  <ModalBody>
                    <VStack spacing={4}>
                      <FormControl isRequired>
                        <FormLabel>Recipient Address</FormLabel>
                        <Input
                          placeholder="0x..."
                          value={assignmentForm.recipient}
                          onChange={(e) => setAssignmentForm({...assignmentForm, recipient: e.target.value})}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Aid Type</FormLabel>
                        <Input
                          value={assignmentForm.aidType}
                          onChange={(e) => setAssignmentForm({...assignmentForm, aidType: e.target.value})}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Amount (ETH)</FormLabel>
                        <InputGroup>
                          <InputLeftElement>
                            <Icon as={FaEthereum} color="gray.500" />
                          </InputLeftElement>
                          <Input
                            value={weiToEth(assignmentForm.amount)}
                            isReadOnly
                          />
                        </InputGroup>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Assign Field Worker</FormLabel>
                        <Select
                          placeholder="Select field worker"
                          value={assignmentForm.fieldWorker}
                          onChange={(e) => setAssignmentForm({...assignmentForm, fieldWorker: e.target.value})}
                        >
                          {fieldWorkers.map((worker) => (
                            <option key={worker.id} value={worker.walletAddress}>
                              {worker.name} ({worker.email})
                            </option>
                          ))}
                        </Select>
                      </FormControl>
                    </VStack>
                  </ModalBody>

                  <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={() => setAssignAidModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleAssignmentSubmit}>
                      Assign Aid
                    </Button>
                  </ModalFooter>
                </ModalContent>
              </Modal>
            </TabPanel>

            <TabPanel>
              <Box bg={cardBgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={6} shadow="md">
                <Heading size="md" mb={4}>Blockchain Transactions</Heading>
                {txLoading ? (
                  <Flex justify="center" py={10}>
                    <Spinner size="lg" />
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Transaction Hash</Th>
                          <Th>Type</Th>
                          <Th>Status</Th>
                          <Th>Timestamp</Th>
                          <Th>Details</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {transactions.length > 0 ? (
                          transactions.map((tx) => (
                            <Tr key={tx.id || tx.txHash}>
                              <Td fontFamily="monospace">{tx.txHash ? tx.txHash.substring(0, 10) + "..." : "N/A"}</Td>
                              <Td>{safeRender(tx.type)}</Td>
                              <Td>
                                <Badge colorScheme={
                                  tx.status === "CONFIRMED" ? "green" :
                                  tx.status === "PENDING" ? "yellow" : "red"
                                }>
                                  {safeRender(tx.status)}
                                </Badge>
                              </Td>
                              <Td>{formatIndianTimestamp(tx.timestamp)}</Td>
                              <Td>
                                <Button
                                  leftIcon={<FaInfoCircle />}
                                  colorScheme="blue"
                                  size="sm"
                                >
                                  View
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={5} textAlign="center" py={4}>
                              No transaction records found
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Box>
            </TabPanel>

            <TabPanel>
              <Box bg={cardBgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} p={6} shadow="md">
                <Heading size="md" mb={4}>Aid Distribution Records</Heading>
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Recipient</Th>
                        <Th>Amount</Th>
                        <Th>Aid Type</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {aidRecords.length > 0 ? (
                        aidRecords.map((record) => (
                          <Tr key={record.id}>
                            <Td>{safeRender(record.id)}</Td>
                            <Td>
                              <Flex align="center">
                                <AddressResolver address={record.recipient} />
                              </Flex>
                            </Td>
                            <Td>{safeRender(weiToEth(record.amount))} ETH</Td>
                            <Td>{safeRender(record.aidType)}</Td>
                            <Td>
                              <Menu>
                                <MenuButton
                                  as={Button}
                                  rightIcon={<ChevronDownIcon />}
                                  colorScheme={
                                    record.status === "Delivered" ? "green" :
                                    record.status === "Pending" ? "yellow" : "blue"
                                  }
                                  size="sm"
                                  isLoading={statusUpdateLoading}
                                >
                                  {record.status}
                                </MenuButton>
                                <MenuList>
                                  <MenuItem onClick={() => handleStatusUpdate(record.id, "Pending")}>
                                    Pending
                                  </MenuItem>
                                  <MenuItem onClick={() => handleStatusUpdate(record.id, "In Transit")}>
                                    In Transit
                                  </MenuItem>
                                  <MenuItem onClick={() => handleStatusUpdate(record.id, "Delivered")}>
                                    Delivered
                                  </MenuItem>
                                  <MenuItem onClick={() => handleStatusUpdate(record.id, "Verified")}>
                                    Verified
                                  </MenuItem>
                                </MenuList>
                              </Menu>
                            </Td>
                            <Td>{formatIndianTimestamp(record.timestamp)}</Td>
                            <Td>
                              <Button
                                colorScheme="blue"
                                size="sm"
                                leftIcon={<FaInfoCircle />}
                              >
                                Details
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={7} textAlign="center" py={4}>
                            No aid records found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            <TabPanel>
              <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <Card bg={cardBgColor} shadow="md">
                    <CardBody>
                      <Heading size="md" mb={4}>System Settings</Heading>
                      <Stack spacing={4}>
                        <FormControl>
                          <FormLabel>Platform Name</FormLabel>
                          <Input defaultValue="AidForge" />
                        </FormControl>
                        <FormControl>
                          <FormLabel>Admin Contact Email</FormLabel>
                          <Input defaultValue="admin@aidforge.org" />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">Maintenance Mode</FormLabel>
                          <Switch colorScheme="red" />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">Debug Mode</FormLabel>
                          <Switch colorScheme="blue" />
                        </FormControl>
                        <Button colorScheme="blue" leftIcon={<FaSave />}>
                          Save Settings
                        </Button>
                      </Stack>
                    </CardBody>
                  </Card>
                </GridItem>
                <GridItem>
                  <Card bg={cardBgColor} shadow="md" mb={6}>
                    <CardBody>
                      <Heading size="md" mb={4}>Blockchain Configuration</Heading>
                      <Stack spacing={4}>
                        <FormControl>
                          <FormLabel>Network</FormLabel>
                          <Select defaultValue="ropsten">
                            <option value="mainnet">Ethereum Mainnet</option>
                            <option value="ropsten">Ropsten Testnet</option>
                            <option value="rinkeby">Rinkeby Testnet</option>
                            <option value="polygon">Polygon</option>
                          </Select>
                        </FormControl>
                        <FormControl>
                          <FormLabel>Contract Address</FormLabel>
                          <Input defaultValue="0x1234...5678" fontFamily="monospace" />
                        </FormControl>
                        <FormControl display="flex" alignItems="center">
                          <FormLabel mb="0">Auto-Sync</FormLabel>
                          <Switch defaultChecked colorScheme="green" />
                        </FormControl>
                        <Button colorScheme="blue" leftIcon={<FaEthereum />}>
                          Update Network
                        </Button>
                      </Stack>
                    </CardBody>
                  </Card>
                  <Card bg={cardBgColor} shadow="md">
                    <CardBody>
                      <Heading size="md" mb={4}>Backup & Recovery</Heading>
                      <Stack spacing={4}>
                        <Button colorScheme="blue" leftIcon={<FaFileUpload />}>
                          Export Database
                        </Button>
                        <Button colorScheme="green" leftIcon={<FaKey />}>
                          Backup Keys
                        </Button>
                      </Stack>
                    </CardBody>
                  </Card>
                </GridItem>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>

        <Modal isOpen={isUserModalOpen} onClose={onUserModalClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{editingUser ? "Edit User" : "Add New User"}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Full Name</FormLabel>
                  <Input name="name" value={userForm.name} onChange={handleFormChange} />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input name="email" value={userForm.email} onChange={handleFormChange} type="email" />
                </FormControl>
                <FormControl>
                  <FormLabel>Role</FormLabel>
                  <Select name="role" value={userForm.role} onChange={handleFormChange}>
                    <option value="donor">Donor</option>
                    <option value="fieldWorker">Field Worker</option>
                    <option value="refugee">Refugee</option>
                    <option value="admin">Administrator</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input 
                    name="password" 
                    value={userForm.password} 
                    onChange={handleFormChange} 
                    type="password"
                    placeholder="Enter password"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Wallet Address (Optional)</FormLabel>
                  <Input 
                    name="walletAddress" 
                    value={userForm.walletAddress} 
                    onChange={handleFormChange} 
                    placeholder="0x..."
                  />
                </FormControl>
              </Stack>
            </ModalBody>
            <ModalFooter>
              <Button mr={3} onClick={onUserModalClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleUserSubmit}>
                {editingUser ? "Save Changes" : "Add User"}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        <AlertDialog
          isOpen={isDeleteDialogOpen}
          leastDestructiveRef={cancelRef}
          onClose={onDeleteDialogClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Delete User
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to delete {userToDelete ? safeRender(userToDelete.name) : ''}? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Container>
    </Box>
  );
};

export default Admin;
