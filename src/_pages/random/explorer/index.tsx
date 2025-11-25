"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  Select,
  Button,
  Code,
  Link as ChakraLink,
  Spinner,
  Alert,
  AlertIcon,
  SimpleGrid,
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { siteConfig } from "@config/site";
import { useState, useEffect } from "react";
import Link from "next/link";

interface RequestData {
  requestId: string;
  requester: string;
  feeAmount: string;
  timestamp: number;
  fulfilled: boolean;
  randomnessValue?: string;
  network: string;
}

const NETWORKS = [
  { id: "base", name: "Base", chainId: 8453 },
  { id: "avalanche", name: "Avalanche", chainId: 43114 },
  { id: "polygon", name: "Polygon", chainId: 137 },
];

const ExplorerPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  const [selectedNetwork, setSelectedNetwork] = useState("base");
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch from serv-random server
      const requestsUrl = `${siteConfig.servRandomRequestsUrl}?network=${selectedNetwork}`;
      const response = await fetch(requestsUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.requests) {
        setRequests(data.requests);
        setLastUpdated(new Date());
      } else {
        throw new Error(data.error || "Invalid response format");
      }
    } catch (err) {
      console.error("Error loading requests:", err);
      setError(err instanceof Error ? err.message : "Failed to load requests");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load requests when network changes (only after mount)
    if (mounted) {
      loadRequests();
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [selectedNetwork, mounted]);

  const filteredRequests = requests.filter((req) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      req.requestId.toLowerCase().includes(query) ||
      req.requester.toLowerCase().includes(query) ||
      req.randomnessValue?.toLowerCase().includes(query)
    );
  });

  const pendingRequests = filteredRequests.filter((req) => !req.fulfilled);
  const fulfilledRequests = filteredRequests.filter((req) => req.fulfilled);

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatRequestId = (id: string) => {
    return `${id.slice(0, 10)}...`;
  };

  const formatRandomness = (randomness?: string) => {
    if (!randomness) return null;
    return `${randomness.slice(0, 10)}...${randomness.slice(-6)}`;
  };

  const formatFeeAmount = (amount: string) => {
    try {
      const amountBigInt = BigInt(amount);
      const amountEther = Number(amountBigInt) / 1e18;
      return `${amountEther.toFixed(4)} SRAND`;
    } catch {
      return "0 SRAND";
    }
  };

  const renderRequestsTable = (requestsToShow: RequestData[]) => {
    if (loading && requestsToShow.length === 0) {
      return (
        <Box textAlign="center" py={12}>
          <Spinner size="xl" color="brand.300" mb={4} />
          <Text color="gray.400">Loading requests...</Text>
        </Box>
      );
    }

    if (requestsToShow.length === 0) {
      return (
        <Box textAlign="center" py={12}>
          <Text fontSize="lg" color="gray.400" mb={4}>
            No requests found
          </Text>
          <Text fontSize="sm" color="gray.500">
            {selectedNetwork === "all"
              ? "No requests found across all networks."
              : `No requests found on ${NETWORKS.find((n) => n.id === selectedNetwork)?.name || selectedNetwork}.`}
          </Text>
        </Box>
      );
    }

    return (
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Request ID</Th>
            <Th>Requester</Th>
            <Th>Network</Th>
            <Th>Status</Th>
            <Th>Fee Paid</Th>
            <Th>Timestamp</Th>
            <Th>Randomness</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {requestsToShow.map((req) => (
            <Tr key={`${req.network}-${req.requestId}`}>
              <Td>
                <Code fontSize="xs">{formatRequestId(req.requestId)}</Code>
              </Td>
              <Td>
                <Code fontSize="xs">{formatAddress(req.requester)}</Code>
              </Td>
              <Td>
                <Badge colorScheme="blue" fontSize="xs">
                  {req.network.toUpperCase()}
                </Badge>
              </Td>
              <Td>
                <Badge colorScheme={req.fulfilled ? "green" : "yellow"}>
                  {req.fulfilled ? "Fulfilled" : "Pending"}
                </Badge>
              </Td>
              <Td>{formatFeeAmount(req.feeAmount)}</Td>
              <Td>
                <Text fontSize="sm">{new Date(req.timestamp).toLocaleString()}</Text>
              </Td>
              <Td>
                {req.randomnessValue ? (
                  <Code fontSize="xs" maxW="150px" isTruncated title={req.randomnessValue}>
                    {formatRandomness(req.randomnessValue)}
                  </Code>
                ) : (
                  <Text fontSize="xs" color="gray.500">
                    Not set
                  </Text>
                )}
              </Td>
              <Td>
                <Button
                  as={Link}
                  href={`/random/explorer/request/${req.requestId}?network=${req.network}`}
                  size="xs"
                  colorScheme="brand"
                  variant="outline"
                >
                  View
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    );
  };

  return (
    <PageAnimation>
      <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
        <Stack spacing={8}>
          <Flex justify="space-between" align="start">
            <Box>
              <Heading size="2xl" mb={2} color="white">
                🔍 Request Explorer
              </Heading>
              <Text color="gray.400">
                Browse all randomness requests across SERV.random networks. View request details, VRF values, and fulfillment status.
              </Text>
            </Box>
            <Box textAlign="right">
              {lastUpdated && (
                <Text fontSize="sm" color="gray.500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
              {loading && <Spinner size="sm" color="brand.300" ml={2} />}
            </Box>
          </Flex>

          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Failed to fetch requests</Text>
                <Text fontSize="sm">{error}</Text>
              </Box>
            </Alert>
          )}

          {/* Network Selector */}
          <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Stack direction={{ base: "column", md: "row" }} spacing={4} align="center">
              <Text fontWeight="semibold" color="white" minW="100px">
                Network:
              </Text>
              <Select
                value={selectedNetwork}
                onChange={(e) => setSelectedNetwork(e.target.value)}
                maxW="200px"
              >
                {NETWORKS.map((net) => (
                  <option key={net.id} value={net.id}>
                    {net.name}
                  </option>
                ))}
              </Select>
              <Input
                placeholder="Search by Request ID, Address, or Randomness..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                flex={1}
              />
              <Button onClick={loadRequests} isLoading={loading} colorScheme="brand">
                Refresh
              </Button>
            </Stack>
          </Box>

          {/* Stats Summary */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Total Requests
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="brand.300">
                {requests.length}
              </Text>
            </Box>
            <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Pending
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="yellow.400">
                {pendingRequests.length}
              </Text>
            </Box>
            <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Fulfilled
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.400">
                {fulfilledRequests.length}
              </Text>
            </Box>
            <Box bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
              <Text fontSize="xs" color="gray.500" mb={1}>
                Success Rate
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="brand.300">
                {requests.length > 0
                  ? `${((fulfilledRequests.length / requests.length) * 100).toFixed(1)}%`
                  : "0%"}
              </Text>
            </Box>
          </SimpleGrid>

          {/* Requests Table */}
          <Box bg={cardBg} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
            <Tabs>
              <TabList>
                <Tab>All Requests ({filteredRequests.length})</Tab>
                <Tab>Pending ({pendingRequests.length})</Tab>
                <Tab>Fulfilled ({fulfilledRequests.length})</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>{renderRequestsTable(filteredRequests)}</TabPanel>
                <TabPanel>{renderRequestsTable(pendingRequests)}</TabPanel>
                <TabPanel>{renderRequestsTable(fulfilledRequests)}</TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {/* Info Box */}
          <Box bg={bgColor} p={6} borderRadius="lg">
            <Heading size="md" mb={4} color="white">
              💡 How to Use the Explorer
            </Heading>
            <Stack spacing={2} fontSize="sm" color="gray.400">
              <Text>• Select a network to view requests from that network</Text>
              <Text>• Use the search bar to find specific requests by ID, address, or randomness value</Text>
              <Text>• Click &quot;View&quot; to see detailed information about a request</Text>
              <Text>• Pending requests are awaiting VRF fulfillment from SERV.random servers</Text>
              <Text>• Fulfilled requests show the VRF randomness value used</Text>
              <Text>• Data refreshes automatically every 30 seconds</Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </PageAnimation>
  );
};

export default ExplorerPage;
