import { Box, Container, SimpleGrid, Stack, Text } from "@chakra-ui/react";
import Image from "next/image";
import Link from "next/link";
import { studioProjects } from "@config/projects";
import { siteConfig } from "@config/site";
import { PROJECT_IMAGES } from "./data";
import { Description, SuperTitle, Title } from "./Section";

export function InfoAndStats() {
  return (
    <Box position={"relative"} id="projects" w="full">
      <Container maxW={"7xl"} zIndex={10} position={"relative"} px={0}>
        <Stack direction={{ base: "column", lg: "row" }}>
          <Stack
            flex={1}
            color={"var(--checker-description, gray.400)"}
            justify={{ lg: "center" }}
            py={{ base: 2, md: 8 }}
          >
            <Box mb={{ base: 8, md: 12 }}>
              <SuperTitle> Digital projects </SuperTitle>
              <Title>Games and experiences from the 2bit catalog</Title>
              <Description>
                {siteConfig.legalName} develops original games and interactive
                properties while supporting partner teams with production-ready
                technology, immersive media, and blockchain-connected
                integrations.
              </Description>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
              {studioProjects.map((project) => {
                const imageMeta = PROJECT_IMAGES[project.title];
                return (
                  <Link
                    nonce="false"
                    href={project.link}
                    passHref
                    key={project.title}
                    target={project.external ? "_blank" : undefined}
                    rel={project.external ? "noopener noreferrer" : undefined}
                    style={{ textDecoration: "none" }}
                  >
                    <Box className="project-card">
                      {imageMeta && (
                        <Box className="card-image" mb={3}>
                          <Image
                            src={imageMeta.src}
                            alt={imageMeta.alt}
                            width={320}
                            height={180}
                            style={{ width: "100%", height: "auto" }}
                          />
                        </Box>
                      )}
                      <Text
                        fontFamily={"heading"}
                        fontSize={"2xl"}
                        color={"var(--checker-heading, white)"}
                        mb={2}
                      >
                        {project.title}
                      </Text>
                      <Text fontSize={"md"} color={"var(--checker-description, gray.400)"}>
                        {project.summary}
                      </Text>
                    </Box>
                  </Link>
                );
              })}
            </SimpleGrid>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
