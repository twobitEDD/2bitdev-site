import { Box, Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { ReactNode } from "react";
import { Description, SuperTitle, Title } from "./Section";

export function InfoAndStats() {
  return (
    <Box bg={"black"} position={"relative"} id="projects">
      <Container maxW={"7xl"} zIndex={10} position={"relative"}>
        <Stack direction={{ base: "column", lg: "row" }}>
          <Stack
            flex={1}
            color={"gray.400"}
            justify={{ lg: "center" }}
            py={{ base: 4, md: 20, xl: 40 }}
          >
            <Box mb={{ base: 8, md: 20 }}>
              <SuperTitle> Digital projects </SuperTitle>
              <Title>Experiences we are actively building</Title>
              <Description>
                2bit entertainment develops original digital properties while
                supporting partner teams with production-ready technology,
                design, and integration support.
              </Description>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
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
    title: "Fish Fight",
    link: "/#projects",
    content: (
      <>
        An action-forward digital world where player decisions reshape the
        battlefield. Live tuning, competitive mechanics, and cinematic
        storytelling.
      </>
    ),
  },
  {
    title: "PokePocket Cards",
    link: "/#projects",
    content: (
      <>
        A tactile digital collectible experience with dynamic rarity, social
        drops, and production-grade merchandising support.
      </>
    ),
  },
  {
    title: "SERV",
    link: "/#projects",
    content: (
      <>
        Systems and integrations built for reliability. We keep these tools in
        motion to support rapid deployment for partners.
      </>
    ),
  },
];
