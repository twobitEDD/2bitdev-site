import { Box, Button, Flex, SimpleGrid } from "@chakra-ui/react";
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
        <SimpleGrid
          alignItems="start"
          columns={{ base: 1, md: 2 }}
          mb={24}
          spacingY={{ base: 10, md: 32 }}
          spacingX={{ base: 10, md: 24 }}
        >
          <Box>
            <Title>Clear overview lorem ipsum</Title>
            <Description>
              obcaecati ut cupiditate pariatur, dignissimos, placeat amet
              officiis. Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis obcaecati ut cupiditate pariatur, dignissimos, placeat
              amet officiis.
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

        {/* Right section */}
        <SimpleGrid
          alignItems="center"
          columns={{ base: 1, md: 2 }}
          flexDirection="column-reverse"
          mb={24}
          spacingY={{ base: 10, md: 32 }}
          spacingX={{ base: 10, md: 24 }}
        >
          <Box order={{ base: "initial", md: 2 }}>
            <Title>Decide how you integrate the things</Title>
            <Description>
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis obcaecati ut cupiditate pariatur, dignissimos, placeat
              amet officiis. Lorem ipsum dolor sit amet consectetur adipisicing
              elit. Reiciendis
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

        {/* Left Section */}
        <SimpleGrid
          alignItems="start"
          columns={{ base: 1, md: 2 }}
          spacingY={{ base: 10, md: 32 }}
          spacingX={{ base: 10, md: 24 }}
        >
          <Box>
            <Title>Clear overview of efficient stuff</Title>
            <Description>
              obcaecati ut cupiditate pariatur, dignissimos, placeat amet
              officiis. Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis obcaecati ut cupiditate pariatur, dignissimos, placeat
              amet officiis.
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
      </Box>
    </Flex>
  );
}
