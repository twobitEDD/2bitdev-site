"use client";

import {
  Box,
  Container,
  Flex,
  Heading,
  Stack,
  Text,
  useColorModeValue,
  Code,
  Divider,
  Link as ChakraLink,
  List,
  ListItem,
  Badge,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { PageAnimation } from "@components/motion/PageAnimation";
import { contractsConfig } from "@config/contracts";

const DocsPage = () => {
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <PageAnimation>
      <Container maxW={"7xl"} py={{ base: 8, md: 16 }}>
        <Stack spacing={8}>
          <Box>
            <Heading size="2xl" mb={2} color="white">
              📚 Developer Integration Guide
            </Heading>
            <Text color="gray.400">
              Complete guide to integrating SERV.random into your smart contracts. Learn patterns, see examples, and follow best practices.
            </Text>
          </Box>

          {/* Quick Start */}
          <Alert status="info" borderRadius="lg">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Quick Start</Text>
              <Text fontSize="sm">
                Get randomness in your contract in 3 steps: Import interfaces → Request randomness → Receive callback
              </Text>
            </Box>
          </Alert>

          {/* Integration Patterns */}
          <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Heading size="lg" mb={4} color="white">
              🔄 Integration Patterns
            </Heading>
            <Text color="gray.400" mb={4}>
              SERV.random supports two patterns for consuming randomness:
            </Text>

            <Tabs>
              <TabList>
                <Tab>Pattern 1: Callback (Automatic)</Tab>
                <Tab>Pattern 2: Manual Claim (Recommended)</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Stack spacing={4}>
                    <Text color="gray.400" fontSize="sm">
                      The server automatically calls your contract when randomness is ready. Simple but requires careful gas management.
                    </Text>
                    <Box bg={bgColor} p={4} borderRadius="md">
                      <Code display="block" whiteSpace="pre-wrap" fontSize="xs" colorScheme="gray">
{`// 1. Request randomness
function requestRandomness() external returns (uint256) {
    uint256 requestId = IFeeCollector(feeCollector)
        .requestRandomnessFor(1, msg.sender);
    pendingRequests[requestId] = msg.sender;
    return requestId;
}

// 2. Receive callback (called by server)
function receiveRandomness(
    uint256 _requestId,
    bytes32 _randomness
) external override {
    // Verify fulfillment
    (uint256 id, , , , , , bool fulfilled, bytes32 stored) = 
        IFeeCollector(feeCollector).requests(_requestId);
    
    require(id == _requestId && fulfilled, "Invalid request");
    require(stored == _randomness, "Randomness mismatch");
    
    address user = pendingRequests[_requestId];
    require(user != address(0), "No pending request");
    
    // Use randomness
    _processRandomness(user, _randomness);
    delete pendingRequests[_requestId];
}`}
                      </Code>
                    </Box>
                  </Stack>
                </TabPanel>

                <TabPanel>
                  <Stack spacing={4}>
                    <Text color="gray.400" fontSize="sm">
                      User manually claims randomness after server fulfills. More gas-efficient and gives users control. <Badge colorScheme="green" ml={2}>Recommended</Badge>
                    </Text>
                    <Box bg={bgColor} p={4} borderRadius="md">
                      <Code display="block" whiteSpace="pre-wrap" fontSize="xs" colorScheme="gray">
{`// 1. Request randomness
function goFishing() external returns (uint256) {
    uint256 requestId = IFeeCollector(feeCollector)
        .requestRandomnessFor(1, msg.sender);
    pendingRequests[requestId] = msg.sender;
    return requestId;
}

// 2. User manually claims (after server fulfills)
function catchFish(uint256 _requestId) external {
    // Verify request exists and is fulfilled
    (uint256 id, address requester, , , , , bool fulfilled, bytes32 randomness) = 
        IFeeCollector(feeCollector).requests(_requestId);
    
    require(id == _requestId, "Request does not exist");
    require(requester == msg.sender, "Not your request");
    require(fulfilled, "Not yet fulfilled");
    require(randomness != bytes32(0), "Randomness not set");
    
    address player = pendingRequests[_requestId];
    if (player == address(0)) return; // Already processed
    
    require(player == msg.sender, "Not your request");
    
    // Use randomness
    _processRandomness(player, randomness);
    delete pendingRequests[_requestId];
}`}
                      </Code>
                    </Box>
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>

          {/* Step-by-Step Integration */}
          <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Heading size="lg" mb={4} color="white">
              📖 Step-by-Step Integration
            </Heading>

            <Stack spacing={6}>
              <Box>
                <Heading size="md" mb={2} color="white">
                  Step 1: Import Interfaces
                </Heading>
                <Box bg={bgColor} p={4} borderRadius="md" mt={2}>
                  <Code display="block" whiteSpace="pre-wrap" fontSize="sm">
{`import "./IRandomnessReceiver.sol";

interface IFeeCollector {
    function requestRandomnessFor(uint256 _tierId, address _requester) 
        external returns (uint256);
    function requests(uint256 requestId) external view returns (
        uint256 id,
        address requester,
        uint256 tierId,
        uint256 feeAmount,
        uint256 timestamp,
        uint256 deadline,
        bool fulfilled,
        bytes32 randomnessValue
    );
}`}
                  </Code>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Heading size="md" mb={2} color="white">
                  Step 2: Set Up Your Contract
                </Heading>
                <Box bg={bgColor} p={4} borderRadius="md" mt={2}>
                  <Code display="block" whiteSpace="pre-wrap" fontSize="sm">
{`contract MyContract is IRandomnessReceiver {
    address public immutable feeCollector;
    mapping(uint256 => address) public pendingRequests;
    
    constructor(address _feeCollector) {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
    }
}`}
                  </Code>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Heading size="md" mb={2} color="white">
                  Step 3: Request Randomness
                </Heading>
                <Text color="gray.400" mb={2} fontSize="sm">
                  Users must approve SRAND spending first:
                </Text>
                <Box bg={bgColor} p={4} borderRadius="md" mt={2}>
                  <Code display="block" whiteSpace="pre-wrap" fontSize="sm">
{`// Frontend: Approve SRAND (one-time or per-request)
await srand.approve(feeCollectorAddress, ethers.parseEther("1"));

// Contract: Request randomness
function requestRandomness() external returns (uint256) {
    uint256 requestId = IFeeCollector(feeCollector)
        .requestRandomnessFor(1, msg.sender);
    
    pendingRequests[requestId] = msg.sender;
    emit RandomnessRequested(msg.sender, requestId);
    return requestId;
}`}
                  </Code>
                </Box>
              </Box>

              <Divider />

              <Box>
                <Heading size="md" mb={2} color="white">
                  Step 4: Handle Randomness
                </Heading>
                <Text color="gray.400" mb={2} fontSize="sm">
                  Choose Pattern 1 (callback) or Pattern 2 (manual claim) from above.
                </Text>
              </Box>
            </Stack>
          </Box>

          {/* Contract Addresses */}
          <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Heading size="lg" mb={4} color="white">
              📍 Contract Addresses
            </Heading>
            <Text fontSize="sm" color="gray.400" mb={4}>
              All addresses are configured in <Code fontSize="xs">src/config/contracts.ts</Code> for easy updates.
            </Text>
            <Stack spacing={4}>
              <Box>
                <Badge colorScheme="blue" mb={2}>Base Mainnet</Badge>
                <Stack spacing={2} fontSize="sm" ml={4}>
                  <Box>
                    <Text fontWeight="semibold" color="white" mb={1}>
                      FeeCollector:
                    </Text>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      {contractsConfig.base.feeCollector}
                    </Code>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" color="white" mb={1}>
                      SRAND Token:
                    </Text>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      {contractsConfig.base.srand}
                    </Code>
                  </Box>
                  {contractsConfig.base.randomnessAccess && (
                    <Box>
                      <Text fontWeight="semibold" color="white" mb={1}>
                        RandomnessAccess:
                      </Text>
                      <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                        {contractsConfig.base.randomnessAccess}
                      </Code>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Box>
                <Badge colorScheme="red" mb={2}>Avalanche C-Chain</Badge>
                <Stack spacing={2} fontSize="sm" ml={4}>
                  <Box>
                    <Text fontWeight="semibold" color="white" mb={1}>
                      FeeCollector:
                    </Text>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      {contractsConfig.avalanche.feeCollector}
                    </Code>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" color="white" mb={1}>
                      SRAND Token:
                    </Text>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      {contractsConfig.avalanche.srand}
                    </Code>
                  </Box>
                  {contractsConfig.avalanche.randomnessAccess && (
                    <Box>
                      <Text fontWeight="semibold" color="white" mb={1}>
                        RandomnessAccess:
                      </Text>
                      <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                        {contractsConfig.avalanche.randomnessAccess}
                      </Code>
                    </Box>
                  )}
                </Stack>
              </Box>

              <Box>
                <Badge colorScheme="purple" mb={2}>Polygon Mainnet</Badge>
                <Stack spacing={2} fontSize="sm" ml={4}>
                  <Box>
                    <Text fontWeight="semibold" color="white" mb={1}>
                      FeeCollector:
                    </Text>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      {contractsConfig.polygon.feeCollector}
                    </Code>
                  </Box>
                  <Box>
                    <Text fontWeight="semibold" color="white" mb={1}>
                      SRAND Token:
                    </Text>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      {contractsConfig.polygon.srand}
                    </Code>
                  </Box>
                  {contractsConfig.polygon.randomnessAccess && (
                    <Box>
                      <Text fontWeight="semibold" color="white" mb={1}>
                        RandomnessAccess:
                      </Text>
                      <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                        {contractsConfig.polygon.randomnessAccess}
                      </Code>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          {/* Complete Example */}
          <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Heading size="lg" mb={4} color="white">
              💻 Complete Example Contract
            </Heading>
            <Text color="gray.400" mb={4} fontSize="sm">
              Full working example using Pattern 2 (Manual Claim):
            </Text>
            <Box bg={bgColor} p={4} borderRadius="md" overflowX="auto">
              <Code display="block" whiteSpace="pre-wrap" fontSize="xs" colorScheme="gray">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IRandomnessReceiver.sol";

interface IFeeCollector {
    function requestRandomnessFor(uint256 _tierId, address _requester) 
        external returns (uint256);
    function requests(uint256 requestId) external view returns (
        uint256 id, address requester, uint256 tierId,
        uint256 feeAmount, uint256 timestamp, uint256 deadline,
        bool fulfilled, bytes32 randomnessValue
    );
}

contract MyRandomnessConsumer is IRandomnessReceiver {
    address public immutable feeCollector;
    mapping(uint256 => address) public pendingRequests;
    
    event RandomnessRequested(address indexed user, uint256 requestId);
    event RandomnessProcessed(address indexed user, uint256 requestId, bytes32 randomness);
    
    constructor(address _feeCollector) {
        require(_feeCollector != address(0), "Invalid fee collector");
        feeCollector = _feeCollector;
    }
    
    function requestRandomness() external returns (uint256) {
        uint256 requestId = IFeeCollector(feeCollector)
            .requestRandomnessFor(1, msg.sender);
        pendingRequests[requestId] = msg.sender;
        emit RandomnessRequested(msg.sender, requestId);
        return requestId;
    }
    
    function claimRandomness(uint256 _requestId) external {
        (uint256 id, address requester, , , , , bool fulfilled, bytes32 randomness) = 
            IFeeCollector(feeCollector).requests(_requestId);
        
        require(id == _requestId, "Request does not exist");
        require(requester == msg.sender, "Not your request");
        require(fulfilled, "Not yet fulfilled");
        require(randomness != bytes32(0), "Randomness not set");
        
        address user = pendingRequests[_requestId];
        if (user == address(0)) return; // Already processed
        require(user == msg.sender, "Not your request");
        
        // Use randomness (example: generate random number 0-99)
        uint256 randomNumber = uint256(randomness) % 100;
        
        // Your logic here...
        _processRandomness(user, randomNumber);
        
        delete pendingRequests[_requestId];
        emit RandomnessProcessed(user, _requestId, randomness);
    }
    
    function _processRandomness(address user, uint256 randomValue) internal {
        // Implement your randomness logic here
    }
    
    // Optional: Callback for Pattern 1
    function receiveRandomness(uint256 _requestId, bytes32 _randomness) 
        external override {
        // Verify fulfillment
        (uint256 id, , , , , , bool fulfilled, bytes32 stored) = 
            IFeeCollector(feeCollector).requests(_requestId);
        
        require(id == _requestId && fulfilled, "Invalid request");
        require(stored == _randomness, "Randomness mismatch");
        
        address user = pendingRequests[_requestId];
        require(user != address(0), "No pending request");
        
        uint256 randomNumber = uint256(_randomness) % 100;
        _processRandomness(user, randomNumber);
        delete pendingRequests[_requestId];
    }
}`}
              </Code>
            </Box>
          </Box>

          {/* Best Practices */}
          <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Heading size="lg" mb={4} color="white">
              ✅ Best Practices & Security
            </Heading>
            <Stack spacing={3} fontSize="sm" color="gray.400">
              <ListItem>
                <Text fontWeight="semibold" color="white" display="inline">Always verify fulfillment:</Text> Check that randomness is set in FeeCollector, don&apos;t trust the caller
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold" color="white" display="inline">Use Pattern 2 (Manual Claim):</Text> More gas-efficient and gives users control over when to process
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold" color="white" display="inline">Store requestId:</Text> Track pending requests to prevent duplicate processing
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold" color="white" display="inline">Handle expired requests:</Text> Check deadline if your use case requires it
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold" color="white" display="inline">Use reentrancy guards:</Text> Protect callback functions with ReentrancyGuard if doing complex operations
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold" color="white" display="inline">Idempotent claims:</Text> Make claim functions safe to call multiple times
              </ListItem>
              <ListItem>
                <Text fontWeight="semibold" color="white" display="inline">Test thoroughly:</Text> Test with small amounts first, verify gas costs
              </ListItem>
            </Stack>
          </Box>

          {/* Common Patterns */}
          <Box bg={cardBg} p={6} borderRadius="lg" borderWidth="1px" borderColor={borderColor}>
            <Heading size="lg" mb={4} color="white">
              🎯 Common Use Cases
            </Heading>
            <Stack spacing={4}>
              <Box>
                <Heading size="sm" mb={2} color="white">
                  Random Number Generation
                </Heading>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      uint256 randomNumber = uint256(randomness) % maxValue;
                    </Code>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2} color="white">
                      Random Selection
                    </Heading>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      uint256 index = uint256(randomness) % items.length;
                    </Code>
                  </Box>
                  <Box>
                    <Heading size="sm" mb={2} color="white">
                      Weighted Random
                    </Heading>
                    <Code fontSize="xs" display="block" p={2} bg={bgColor} borderRadius="md">
                      {`uint256 random = uint256(randomness) % totalWeight;
// Select item based on cumulative weights`}
                    </Code>
              </Box>
            </Stack>
          </Box>

          {/* Resources */}
          <Box bg={bgColor} p={6} borderRadius="lg">
            <Heading size="md" mb={4} color="white">
              🔗 Resources & Support
            </Heading>
            <Stack spacing={2} fontSize="sm" color="gray.400">
              <Text>
                • <ChakraLink color="brand.300" href="/random/explorer">Request Explorer</ChakraLink> - Browse all randomness requests
              </Text>
              <Text>
                • <ChakraLink color="brand.300" href="/random/status">Server Status</ChakraLink> - Monitor SERV.random servers
              </Text>
              <Text>
                • <ChakraLink color="brand.300" href="/random/demo">Interactive Demo</ChakraLink> - See SERV.random in action
              </Text>
              <Text>
                • <ChakraLink color="brand.300" href="https://github.com/ServProtocol/serv-random-contracts">GitHub Contracts</ChakraLink> - View source code and examples
              </Text>
              <Text>
                • <ChakraLink color="brand.300" href="https://discord.gg/uFH988AfJA">Discord</ChakraLink> - Get help and support
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </PageAnimation>
  );
};

export default DocsPage;
