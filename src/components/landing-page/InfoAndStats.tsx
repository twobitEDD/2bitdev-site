import { Box, Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { ReactNode } from "react";
import { Description, SuperTitle, Title } from "./Section";

export function InfoAndStats() {
  return (
    <Box bg={"gray.800"} position={"relative"}>
      <Container maxW={"7xl"} zIndex={10} position={"relative"}>
        <Stack direction={{ base: "column", lg: "row" }}>
          <Stack
            flex={1}
            color={"gray.400"}
            justify={{ lg: "center" }}
            py={{ base: 4, md: 20, xl: 40 }}
          >
            <Box mb={{ base: 8, md: 20 }}>
              <SuperTitle> Our Services </SuperTitle>
              <Title>Blockchain Development & Randomness </Title>
              <Description>
                SERV provides blockchain development services and tools. We advise on blockchain architecture, deploy custom blockchains, and offer essential services like verifiable randomness for smart contracts.
              </Description>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {stats.map((stat) => (
                <Link nonce="false" href={stat.link} passHref key={stat.link}>
                  <Box key={stat.title}>
                    <Text
                      fontFamily={"heading"}
                      fontSize={"3xl"}
                      color={"white"}
                      mb={3}
                    >
                      {stat.title}
                    </Text>
                    <Text fontSize={"xl"} color={"gray.400"}>
                      {stat.content}
                    </Text>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          </Stack>
          {/* <Flex flex={1} /> */}
        </Stack>
      </Container>
    </Box>
  );
}

const StatsText = ({ children }: { children: ReactNode }) => (
  <Text as={"span"} fontWeight={700} color={"white"}>
    {children}
  </Text>
);

const stats = [
  {
    title: "SERV Random (SRAND)",
    link: "/random",
    content: (
      <>
        <StatsText>random.SERV.services</StatsText> provides production-ready
        cryptographic randomness for smart contracts. Currently serving Base blockchain and coming soon to ERGO blockchain. 
        Get verifiable random values (VRF) for your dApps using our SRAND token service.
      </>
    ),
  },
];
