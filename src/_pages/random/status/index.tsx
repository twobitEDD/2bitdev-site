"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  SimpleGrid,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Spinner,
  Alert,
  AlertIcon,
  Code,
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { VRFVisualization } from "@components/random/VRFVisualization";
import { siteConfig } from "@config/site";
import { useState, useEffect } from "react";

interface ServerStats {
  status?: string;
  uptime?: number;
  startTime?: number;
  lastProcessedBlock?: number;
  totalProcessed?: number;
  totalSuccessful?: number;
  totalFailed?: number;
  baseLastSuccessful?: number;
  avalancheLastSuccessful?: number;
  polygonLastSuccessful?: number;
  ergoLastSuccessful?: number;
  baseSuccessful?: number;
  avalancheSuccessful?: number;
  polygonSuccessful?: number;
  ergoSuccessful?: number;
  baseFailedCount?: number;
  avalancheFailedCount?: number;
  polygonFailedCount?: number;
  ergoFailedCount?: number;
  recentRandomness?: Array<{
    blockNumber: number;
    timestamp: number;
    vrfValue: string;
    harmonyBlockHash: string;
  }>;
  contracts?: {
    base?: { address: string };
    avalanche?: { address: string };
    polygon?: { address: string };
    ergo?: { address: string };
  };
}

const StatusPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusUrl = siteConfig.servRandomStatusUrl;
      const response = await fetch(statusUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Add cache busting for fresh data
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching server status:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch server status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted) {
      fetchStatus();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [mounted]);

  // Prevent hydration issues
  if (!mounted) {
    return null;
  }

  const formatUptime = (uptimeMs?: number) => {
    if (!uptimeMs) return "N/A";
    const seconds = Math.floor(uptimeMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const calculateSuccessRate = (successful?: number, failed?: number) => {
    const total = (successful || 0) + (failed || 0);
    if (total === 0) return 0;
    return ((successful || 0) / total) * 100;
  };

  const getChainStats = (chain: string) => {
    const chainLower = chain.toLowerCase();
    return {
      lastSuccessful: stats?.[`${chainLower}LastSuccessful` as keyof ServerStats] as number | undefined,
      successful: stats?.[`${chainLower}Successful` as keyof ServerStats] as number | undefined,
      failed: stats?.[`${chainLower}FailedCount` as keyof ServerStats] as number | undefined,
      contractAddress: stats?.contracts?.[chainLower as keyof typeof stats.contracts]?.address,
    };
  };

  const overallSuccessRate = calculateSuccessRate(stats?.totalSuccessful, stats?.totalFailed);

  return (
    <PageAnimation>
      <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
        <Stack spacing={8}>
          <Flex justify="space-between" align="start">
            <Box>
              <Heading size="2xl" mb={2} color="white">
                🖥️ Server Status
              </Heading>
              <Text color="gray.400">
                Monitor SERV.random host servers. Check uptime, latency, and latest VRF submissions.
              </Text>
            </Box>
            <Box textAlign="right">
              {lastUpdated && (
                <Text fontSize="sm" color="gray.500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </Text>
              )}
              {loading && <Spinner size="sm" color="brand.300" />}
            </Box>
          </Flex>

          {error && (
            <Alert status="error" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Failed to fetch server status</Text>
                <Text fontSize="sm">{error}</Text>
                <Text fontSize="xs" mt={2} color="gray.500">
                  Status URL: {siteConfig.servRandomStatusUrl}
                </Text>
              </Box>
            </Alert>
          )}

          {loading && !stats && (
            <Flex justify="center" align="center" py={12}>
              <Stack align="center" spacing={4}>
                <Spinner size="xl" color="brand.300" />
                <Text color="gray.400">Loading server status...</Text>
              </Stack>
            </Flex>
          )}

          {stats && (
            <>
              {/* Overall Stats */}
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <StatLabel>Status</StatLabel>
                  <StatNumber color={stats.status === "online" ? "green.400" : "brand.300"}>
                    {stats.status || "Active"}
                  </StatNumber>
                  <StatHelpText>Server operational</StatHelpText>
                </Stat>
                <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <StatLabel>Uptime</StatLabel>
                  <StatNumber color="brand.300">{formatUptime(stats.uptime)}</StatNumber>
                  <StatHelpText>Since {stats.startTime ? new Date(stats.startTime).toLocaleDateString() : "N/A"}</StatHelpText>
                </Stat>
                <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <StatLabel>Last Processed Block</StatLabel>
                  <StatNumber color="brand.300">{stats.lastProcessedBlock?.toLocaleString() || "N/A"}</StatNumber>
                  <StatHelpText>Harmony block</StatHelpText>
                </Stat>
                <Stat bg={cardBg} p={4} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <StatLabel>Total Processed</StatLabel>
                  <StatNumber color="brand.300">{stats.totalProcessed?.toLocaleString() || 0}</StatNumber>
                  <StatHelpText>All submissions</StatHelpText>
                </Stat>
              </SimpleGrid>

              {/* Processing Statistics */}
              <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                <Heading size="md" mb={4} color="white">
                  Processing Statistics
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Total Successful
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="green.400">
                      {stats.totalSuccessful?.toLocaleString() || 0}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Total Failed
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="red.400">
                      {stats.totalFailed?.toLocaleString() || 0}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color="gray.500" mb={1}>
                      Success Rate
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color="brand.300">
                      {overallSuccessRate.toFixed(1)}%
                    </Text>
                    <Progress value={overallSuccessRate} colorScheme="green" size="sm" mt={2} />
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Chain Status */}
              {["Base", "Avalanche", "Polygon", "Ergo"].map((chain) => {
                const chainStats = getChainStats(chain);
                const successRate = calculateSuccessRate(chainStats.successful, chainStats.failed);
                return (
                  <Box
                    key={chain}
                    bg={cardBg}
                    p={6}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                  >
                    <Heading size="md" mb={4} color="white">
                      {chain.toUpperCase()} Chain
                    </Heading>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4} mb={4}>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Contract Address
                        </Text>
                        <Code fontSize="xs" p={2} borderRadius="md" display="block" wordBreak="break-all">
                          {chainStats.contractAddress || "Not configured"}
                        </Code>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Last Successful Block
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="white">
                          {chainStats.lastSuccessful?.toLocaleString() || "N/A"}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Total Submissions
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="green.400">
                          {chainStats.successful?.toLocaleString() || 0}
                        </Text>
                      </Box>
                      <Box>
                        <Text fontSize="xs" color="gray.500" mb={1}>
                          Failed Submissions
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="red.400">
                          {chainStats.failed?.toLocaleString() || 0}
                        </Text>
                      </Box>
                    </SimpleGrid>
                    <Box>
                      <Flex justify="space-between" mb={2}>
                        <Text fontSize="xs" color="gray.500">
                          Success Rate
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="brand.300">
                          {successRate.toFixed(1)}%
                        </Text>
                      </Flex>
                      <Progress value={successRate} colorScheme="green" size="sm" />
                    </Box>
                  </Box>
                );
              })}

              {/* Randomness Showcase */}
              {stats.recentRandomness && stats.recentRandomness.length > 0 && (
                <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
                  <VRFVisualization entries={stats.recentRandomness} maxEntries={6} />
                </Box>
              )}
            </>
          )}

          {/* Info Box */}
          <Box bg={bgColor} p={6} borderRadius="lg">
            <Heading size="md" mb={4} color="white">
              💡 About Server Status
            </Heading>
            <Stack spacing={2} fontSize="sm" color="gray.400">
              <Text>• SERV.random servers monitor Harmony VRF blocks in real-time</Text>
              <Text>• Each server independently processes and submits VRF data</Text>
              <Text>• High uptime ensures reliable randomness delivery</Text>
              <Text>• Status updates every 30 seconds</Text>
              <Text>• Data source: {siteConfig.servRandomStatusUrl}</Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </PageAnimation>
  );
};

export default StatusPage;
