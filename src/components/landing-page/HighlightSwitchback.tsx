import { Box, Button, Flex, SimpleGrid } from "@chakra-ui/react";
import { SlideIn } from "@components/motion/Animation";
import { Description, Title } from "./Section";

export default function HighlightSwitchback() {
  return (
    <Flex
      w="full"
      justifyContent="center"
      alignItems="center"
      // mt={{ base: 10, md: 28 }}
    >
      <Box bg="white" _dark={{ bg: "gray.800" }} px={8} py={20} mx="auto">
        {/* Left Section */}
        <SlideIn direction="from-left-to-right">
          <SimpleGrid
            alignItems="start"
            columns={{ base: 1, md: 2 }}
            mb={24}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
          >
            <Box>
              <Title>Operational History Token Genesis</Title>
              <Description>
                SERV Protocol uses a unique and effective way of starting the network by taking a list of
                Server Operators which each have a proven history of operating the blockchain which SERV derives it codebase.                
              </Description>
              <Button
                w={{ base: "full", sm: "auto" }}
                mt="8"
                size="lg"
                variant="solid"
              >
                Learn More
              </Button>
            </Box>
            <Box
              w="full"
              h="full"
              py={48}
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              textAlign={"center"}
            >
              Image Here
            </Box>
          </SimpleGrid>
        </SlideIn>

        {/* Right section */}
        <SlideIn direction="from-right-to-left">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            flexDirection="column-reverse"
            mb={24}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
          >
            <Box order={{ base: "initial", md: 2 }}>
              <Title>Letting Game Developers focus on Games</Title>
              <Description>
                SERV Protocol is dedicated to making it easier to make games.
                From creating easy to use game templates and code examples for games,
                to encouraging open source work and working to establish &quot;Official&quot; versions of Unity Asset Store Products. 
              </Description>
              <Button
                w={{ base: "full", sm: "auto" }}
                mt="8"
                size="lg"
                variant="solid"
              >
                Learn More
              </Button>
            </Box>
            <Box
              w="full"
              h="full"
              py={48}
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              textAlign={"center"}
            >
              Image Here
            </Box>
          </SimpleGrid>
        </SlideIn>

        {/* Left Section */}
        <SlideIn direction="from-left-to-right">
          <SimpleGrid
            alignItems="start"
            columns={{ base: 1, md: 2 }}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
          >
            <Box>
              <Title>Community Owned from the Start </Title>
              <Description>
                With the goal of lasting forever, SERV Protocol starts off by giving complete control over it&apos;s operation to it&apos;s operators.
                By being owned and operated by a proven community, SERV Community succeeds when SERV succeeds.
              </Description>
              <Button
                w={{ base: "full", sm: "auto" }}
                mt="8"
                size="lg"
                variant="solid"
              >
                Learn More
              </Button>
            </Box>
            <Box
              w="full"
              h="full"
              py={48}
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              textAlign={"center"}
            >
              Image Here
            </Box>
          </SimpleGrid>
        </SlideIn>
      </Box>
    </Flex>
  );
}
