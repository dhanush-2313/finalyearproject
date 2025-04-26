import React, { useState, useEffect } from "react";
import "./FieldWorkerInterface.css";
import FieldWorkerTasks from "./FieldWorkerTasks";
import { fieldWorkerAPI, blockchainAPI } from "../../api/api";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
  Badge,
  Avatar,
  Tooltip,
  Flex,
  Icon,
  Spinner,
  Button,
  VStack,
  HStack,
  Circle,
  Grid,
  useToast,
} from "@chakra-ui/react";
import {
  FaInfoCircle,
  FaEthereum,
  FaClock,
  FaTruck,
  FaBox,
  FaCheckCircle,
} from "react-icons/fa";
import { formatIndianTimestamp, weiToEth } from "../../utils/dateUtils";

const FieldWorkerInterface = () => {
  const [activeTab, setActiveTab] = useState("tasks"); // tasks, updateRefugee, submitAid, aidRecords
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [selectedAidRecord, setSelectedAidRecord] = useState(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const toast = useToast();

  // State for refugee update form
  const [refugeeForm, setRefugeeForm] = useState({
    id: "",
    data: {
      name: "",
      location: "",
      status: "",
      contactInfo: "",
    },
  });

  // State for aid report form
  const [aidReportForm, setAidReportForm] = useState({
    refugeeId: "",
    description: "",
    dateProvided: new Date().toISOString().split("T")[0], // Default to today
    type: "",
    quantity: "",
    location: "",
    notes: "",
  });

  // State for aid records
  const [aidRecords, setAidRecords] = useState([]);
  const [aidRecordsLoading, setAidRecordsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "aidRecords") {
      fetchAidRecords();
    }
  }, [activeTab]);

  const fetchAidRecords = async () => {
    setAidRecordsLoading(true);
    try {
      // Get enhanced records with detailed donor and recipient info
      const response = await blockchainAPI.getEnhancedAidRecords();
      if (response?.data?.success) {
        console.log("Enhanced aid records:", response.data);
        setAidRecords(response.data.records || []);
        setError("");
      } else {
        throw new Error("Failed to fetch enhanced aid records");
      }
    } catch (err) {
      console.error("Error fetching aid records:", err);
      setError(
        "Failed to fetch aid records: " + (err.message || "Unknown error")
      );
      setAidRecords([]);
    } finally {
      setAidRecordsLoading(false);
    }
  };

  const handleStatusUpdate = async (recordId, newStatus) => {
    try {
      setStatusUpdateLoading(true);
      
      // Validate status transition
      const statusSteps = ["Pending", "In Transit", "Delivered", "Verified"];
      const currentIndex = statusSteps.indexOf(record.status);
      const newIndex = statusSteps.indexOf(newStatus);
      
      if (newIndex !== currentIndex + 1) {
        throw new Error("Invalid status transition. Status must follow the defined sequence.");
      }

      const response = await blockchainAPI.updateAidStatus(recordId, newStatus);

      if (response?.data?.success) {
        toast({
          title: "Status Updated",
          description: `Aid record status updated to ${newStatus}`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        fetchAidRecords(); // Refresh the records
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update status",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const renderAidDeliveryStatus = (record) => {
    const statusSteps = ["Pending", "In Transit", "Delivered", "Verified"];
    const currentIndex = statusSteps.indexOf(record.status);

    return (
      <VStack spacing={2} align="stretch" mt={2}>
        <Text fontWeight="bold">Delivery Progress:</Text>
        <HStack spacing={4}>
          {statusSteps.map((status, index) => (
            <React.Fragment key={status}>
              <VStack>
                <Circle
                  size="40px"
                  bg={index <= currentIndex ? "green.500" : "gray.200"}
                  color="white"
                >
                  <Icon
                    as={
                      status === "Pending"
                        ? FaClock
                        : status === "In Transit"
                        ? FaTruck
                        : status === "Delivered"
                        ? FaBox
                        : FaCheckCircle
                    }
                  />
                </Circle>
                <Text fontSize="sm">{status}</Text>
              </VStack>
              {index < statusSteps.length - 1 && (
                <Box
                  flex={1}
                  h="2px"
                  bg={index < currentIndex ? "green.500" : "gray.200"}
                />
              )}
            </React.Fragment>
          ))}
        </HStack>
        {record.status !== "Verified" && (
          <Button
            mt={2}
            colorScheme="blue"
            size="sm"
            isLoading={statusUpdateLoading}
            onClick={() => {
              const nextStatus = statusSteps[currentIndex + 1];
              if (nextStatus) {
                handleStatusUpdate(record.id, nextStatus);
              }
            }}
          >
            Update to {statusSteps[currentIndex + 1]}
          </Button>
        )}
      </VStack>
    );
  };

  // Handle refugee form change
  const handleRefugeeFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "id") {
      setRefugeeForm({
        ...refugeeForm,
        id: value,
      });
    } else {
      setRefugeeForm({
        ...refugeeForm,
        data: {
          ...refugeeForm.data,
          [name]: value,
        },
      });
    }
  };

  // Handle aid report form change
  const handleAidReportFormChange = (e) => {
    const { name, value } = e.target;
    setAidReportForm({
      ...aidReportForm,
      [name]: value,
    });
  };

  // Submit refugee update
  const handleRefugeeUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await fieldWorkerAPI.updateRefugeeInfo(refugeeForm);
      setSuccess("Refugee information updated successfully!");
      // Reset form
      setRefugeeForm({
        id: "",
        data: { name: "", location: "", status: "", contactInfo: "" },
      });
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to update refugee information"
      );
    } finally {
      setLoading(false);
    }
  };

  // Submit aid report
  const handleAidReportSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create a complete description that includes type, quantity, location and notes
      const fullDescription = `${aidReportForm.type} (${aidReportForm.quantity}) - ${aidReportForm.location}${
        aidReportForm.notes ? ": " + aidReportForm.notes : ""
      }`;

      // Send only the fields that the backend needs
      const aidData = {
        refugeeId: aidReportForm.refugeeId,
        description:
          aidReportForm.description || fullDescription, // Use description if provided, otherwise construct it
        dateProvided: aidReportForm.dateProvided,
      };

      await fieldWorkerAPI.submitAidReport(aidData);
      setSuccess("Aid report submitted successfully!");

      // Reset form
      setAidReportForm({
        refugeeId: "",
        description: "",
        dateProvided: new Date().toISOString().split("T")[0],
        type: "",
        quantity: "",
        location: "",
        notes: "",
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit aid report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="field-worker-interface">
      <header className="field-worker-header">
        <h1>Field Worker Dashboard</h1>
        <p>
          Manage your assigned tasks, update refugee information, and submit
          aid reports.
        </p>
      </header>

      <div className="tabs">
        <button
          className={activeTab === "tasks" ? "tab active" : "tab"}
          onClick={() => setActiveTab("tasks")}
        >
          My Tasks
        </button>
        <button
          className={activeTab === "updateRefugee" ? "tab active" : "tab"}
          onClick={() => setActiveTab("updateRefugee")}
        >
          Update Refugee Info
        </button>
        <button
          className={activeTab === "submitAid" ? "tab active" : "tab"}
          onClick={() => setActiveTab("submitAid")}
        >
          Submit Aid Report
        </button>
        <button
          className={activeTab === "aidRecords" ? "tab active" : "tab"}
          onClick={() => setActiveTab("aidRecords")}
        >
          Aid Records
        </button>
      </div>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <main className="field-worker-main">
        {activeTab === "tasks" && <FieldWorkerTasks />}

        {activeTab === "updateRefugee" && (
          <div className="update-refugee-form">
            <h2>Update Refugee Information</h2>
            <form onSubmit={handleRefugeeUpdate}>
              <div className="form-group">
                <label htmlFor="id">Refugee ID</label>
                <input
                  type="text"
                  id="id"
                  name="id"
                  value={refugeeForm.id}
                  onChange={handleRefugeeFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={refugeeForm.data.name}
                  onChange={handleRefugeeFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={refugeeForm.data.location}
                  onChange={handleRefugeeFormChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={refugeeForm.data.status}
                  onChange={handleRefugeeFormChange}
                >
                  <option value="">Select status</option>
                  <option value="Registered">Registered</option>
                  <option value="Verified">Verified</option>
                  <option value="Aid Provided">Aid Provided</option>
                  <option value="Relocated">Relocated</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contactInfo">Contact Information</label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={refugeeForm.data.contactInfo}
                  onChange={handleRefugeeFormChange}
                />
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Refugee Info"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "submitAid" && (
          <div className="submit-aid-form">
            <h2>Submit Aid Distribution Report</h2>
            <form onSubmit={handleAidReportSubmit}>
              <div className="form-group">
                <label htmlFor="refugeeId">Refugee ID</label>
                <input
                  type="text"
                  id="refugeeId"
                  name="refugeeId"
                  value={aidReportForm.refugeeId}
                  onChange={handleAidReportFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={aidReportForm.description}
                  onChange={handleAidReportFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dateProvided">Date Provided</label>
                <input
                  type="date"
                  id="dateProvided"
                  name="dateProvided"
                  value={aidReportForm.dateProvided}
                  onChange={handleAidReportFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Aid Type</label>
                <select
                  id="type"
                  name="type"
                  value={aidReportForm.type}
                  onChange={handleAidReportFormChange}
                  required
                >
                  <option value="">Select aid type</option>
                  <option value="Food">Food</option>
                  <option value="Medical Supplies">Medical Supplies</option>
                  <option value="Shelter">Shelter</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Cash Assistance">Cash Assistance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Quantity</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={aidReportForm.quantity}
                  onChange={handleAidReportFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Distribution Location</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={aidReportForm.location}
                  onChange={handleAidReportFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={aidReportForm.notes}
                  onChange={handleAidReportFormChange}
                  rows="4"
                ></textarea>
              </div>

              <button
                type="submit"
                className="submit-btn"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Aid Report"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "aidRecords" && (
          <div className="aid-records">
            <h2>Aid Records</h2>
            <p>View and manage aid distribution records.</p>

            {aidRecordsLoading ? (
              <Flex justify="center" p={5}>
                <Spinner size="xl" />
                <Text ml={3}>Loading aid records...</Text>
              </Flex>
            ) : aidRecords.length === 0 ? (
              <Box p={5} textAlign="center">
                <Text>No aid records found.</Text>
                <Button
                  mt={3}
                  colorScheme="blue"
                  onClick={fetchAidRecords}
                >
                  Refresh Records
                </Button>
              </Box>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Donor</Th>
                      <Th>Recipient</Th>
                      <Th>Aid Type</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {aidRecords.map((record) => (
                      <React.Fragment key={record.id}>
                        <Tr>
                          <Td>{record.id}</Td>
                          <Td>
                            <Flex align="center">
                              <Avatar
                                size="xs"
                                mr={2}
                                src={record.donorDetails?.avatarUrl}
                                name={record.donorDetails?.name || "Unknown"}
                              />
                              <Box>
                                <Text fontWeight="bold">
                                  {record.donorDetails?.name ||
                                    "Anonymous Donor"}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {record.donor}
                                </Text>
                              </Box>
                            </Flex>
                          </Td>
                          <Td>
                            <Flex align="center">
                              <Avatar
                                size="xs"
                                mr={2}
                                src={record.recipientDetails?.avatarUrl}
                                name={
                                  record.recipientDetails?.name || "Unknown"
                                }
                              />
                              <Box>
                                <Text fontWeight="bold">
                                  {record.recipientDetails?.name ||
                                    "Anonymous Recipient"}
                                </Text>
                                <Text fontSize="xs" color="gray.500">
                                  {record.recipient}
                                </Text>
                              </Box>
                            </Flex>
                          </Td>
                          <Td>{record.aidType}</Td>
                          <Td>
                            <Flex align="center">
                              <Icon as={FaEthereum} mr={1} />
                              <Text>{weiToEth(record.amount)} ETH</Text>
                            </Flex>
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={
                                record.status === "Delivered"
                                  ? "green"
                                  : record.status === "In Transit"
                                  ? "yellow"
                                  : record.status === "Verified"
                                  ? "blue"
                                  : "gray"
                              }
                            >
                              {record.status}
                            </Badge>
                          </Td>
                          <Td>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              onClick={() => setSelectedAidRecord(record)}
                            >
                              View Details
                            </Button>
                          </Td>
                        </Tr>
                        {selectedAidRecord?.id === record.id && (
                          <Tr>
                            <Td colSpan={7}>
                              <Box p={4} bg="gray.50" borderRadius="md">
                                {renderAidDeliveryStatus(record)}
                                <Grid
                                  templateColumns="repeat(2, 1fr)"
                                  gap={4}
                                  mt={4}
                                >
                                  <Box>
                                    <Text fontWeight="bold">
                                      Recipient Details:
                                    </Text>
                                    <Text>
                                      Location:{" "}
                                      {record.recipientDetails?.location ||
                                        "N/A"}
                                    </Text>
                                    <Text>
                                      Contact:{" "}
                                      {record.recipientDetails?.contact ||
                                        "N/A"}
                                    </Text>
                                    <Text>
                                      Family Size:{" "}
                                      {record.recipientDetails?.familySize ||
                                        "N/A"}
                                    </Text>
                                  </Box>
                                  <Box>
                                    <Text fontWeight="bold">
                                      Delivery Details:
                                    </Text>
                                    <Text>
                                      Date:{" "}
                                      {formatIndianTimestamp(record.timestamp)}
                                    </Text>
                                    <Text>
                                      Method:{" "}
                                      {record.deliveryMethod || "Standard"}
                                    </Text>
                                    <Text>
                                      Notes:{" "}
                                      {record.notes || "No additional notes"}
                                    </Text>
                                  </Box>
                                </Grid>
                              </Box>
                            </Td>
                          </Tr>
                        )}
                      </React.Fragment>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default FieldWorkerInterface;

