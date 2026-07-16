import { Box, Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { studioProjects } from "@config/projects";
import { siteConfig } from "@config/site";
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
              <Title>Games and experiences from the 2bit catalog</Title>
              <Description>
                {siteConfig.legalName} develops original games and interactive
                properties while supporting partner teams with production-ready
                technology, immersive media, and blockchain-connected
                integrations.
              </Description>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
              {studioProjects.map((project) => (
                <Link
                  nonce="false"
                  href={project.link}
                  passHref
                  key={project.title}
                  target={project.external ? "_blank" : undefined}
                  rel={project.external ? "noopener noreferrer" : undefined}
                >
                  <Box>
                    <Text
                      fontFamily={"heading"}
                      fontSize={"3xl"}
                      color={"white"}
                      mb={3}
                    >
                      {project.title}
                    </Text>
                    <Text fontSize={"xl"} color={"gray.400"}>
                      {project.summary}
                    </Text>
                  </Box>
                </Link>
              ))}
            </SimpleGrid>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
