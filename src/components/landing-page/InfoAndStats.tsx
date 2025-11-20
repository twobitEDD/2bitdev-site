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
              <SuperTitle> Sounds Great... </SuperTitle>
              <Title>What kind of Services? </Title>
              <Description>
                There are many Decentralized Services operated by external
                ecosystem developers, the SERV ORG and SERV Validator DAO.
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
    title: "Network Explorer",
    link: "https://tserv-explorer.tryethernal.com",
    content: (
      <>
        <StatsText>Explorer.Serv.Services</StatsText> is setup for detailed
        monitoring and real-time analytics of what happens on the network.
      </>
    ),
  },
  {
    title: "Proposal Portal",
    link: "#InfoAndStats",
    content: (
      <>
        <StatsText>Funding.Serv.Services</StatsText> is where SERV&apos;s
        community can elect to allocate SERV tokens using a decentralized cross
        chain proposal mechanism.
      </>
    ),
  },
  {
    title: "Deployment Hub",
    link: "#InfoAndStats",
    content: (
      <>
        <StatsText>Deploy.Serv.Services</StatsText> is where developers can
        create their network interfaces for their projects. Allowing them to
        easily create online connections to their software.
      </>
    ),
  },
  {
    title: "ServRandom",
    link: "/serv-random",
    content: (
      <>
        <StatsText>ServRandom</StatsText> provides production-ready
        cryptographic randomness across multiple blockchains using Harmony VRF.
        Get verifiable random values for your dApps and smart contracts.
      </>
    ),
  },
];
