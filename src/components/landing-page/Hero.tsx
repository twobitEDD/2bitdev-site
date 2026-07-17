"use client";

import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Icons } from "@components/icons";
import { studioProjects } from "@config/projects";
import { siteConfig } from "@config/site";
import Link from "next/link";
import AnimatedLandscape from "./AnimatedLandscape";
import StaticSvgImage from "./StaticSvgImage";

export default function Hero() {
  const projectSignals = studioProjects.slice(0, 3).map((project) => ({
    title: project.title,
    description: project.summary.split(" — ")[0].replace(/\.$/, "") + ".",
  }));

  return (
    <Box position="relative" w="full" overflow="hidden" py={{ base: 16, md: 24 }}>
      <AnimatedLandscape />
      <Box
        position="absolute"
        inset={0}
        bgGradient="linear(to-b, rgba(61,56,80,0.35), rgba(5,5,5,0.92))"
        pointerEvents="none"
      />
      <Stack
        align={"center"}
        spacing={{ base: 8, md: 10 }}
        direction={{ base: "column", lg: "row" }}
        position="relative"
        zIndex={1}
        px={{ base: 6, md: 10 }}
      >
        <Stack flex={1} spacing={{ base: 6, md: 6 }}>
          <Text
            fontSize="sm"
            textTransform="uppercase"
            letterSpacing="0.24em"
            color="gray.400"
          >
            Technology · software · branding · marketing
          </Text>
          <Heading
            lineHeight={1.1}
            fontWeight={600}
            fontSize={{ base: "4xl", sm: "4xl", md: "5xl", lg: "6xl" }}
          >
            <Text as={"span"} color="white">
              2bit
            </Text>
            <Text as={"span"} color="#9cb89a" fontWeight={700}>
              ENT
            </Text>
          </Heading>

          <Text fontSize={"lg"} color={"gray.300"} mb={2} maxW="lg">
            {siteConfig.legalName} — technology integration, software production,
            branding, and marketing services. Interactive and games are one pillar
            of a broader agency practice.
          </Text>
          <Text fontSize={"lg"} color={"gray.400"} mb={4} maxW="lg">
            From CO2True and ERGO.games to Fish Fight and agency work for Google,
            adidas, and Dell — we ship platforms, identities, campaigns, and
            experiences from our voxel-grid design studio.
          </Text>
          <Stack
            spacing={{ base: 4, sm: 6 }}
            direction={{ base: "column", sm: "row" }}
          >
            <Link nonce="false" href={"#contact"} passHref key={"#contact"}>
              <Button
                rounded={"full"}
                size={"lg"}
                fontWeight={"bold"}
                color={"white"}
                px={6}
                colorScheme={"brand"}
                bg={"brand.400"}
                _hover={{ bg: "brand.500" }}
              >
                Start a project
              </Button>
            </Link>
            <Link nonce="false" href={"#projects"} passHref key={"#projects"}>
              <Button
                rounded={"full"}
                size={"lg"}
                fontWeight={"normal"}
                variant={"outline"}
                borderColor="whiteAlpha.400"
                color="white"
                px={6}
                rightIcon={<Icons.arrowRight />}
                _hover={{ bg: "whiteAlpha.100" }}
              >
                View our work
              </Button>
            </Link>
          </Stack>
        </Stack>

        <Flex
          flex={1}
          justify={"center"}
          align={"center"}
          position={"relative"}
          w={"full"}
        >
          <Box
            position={"relative"}
            rounded={"2xl"}
            width={"full"}
            maxW="480px"
            bg="blackAlpha.700"
            border="1px solid"
            borderColor="whiteAlpha.200"
            px={{ base: 6, md: 8 }}
            py={{ base: 6, md: 8 }}
            backdropFilter="blur(12px)"
            overflow="hidden"
          >
            <Box className="card-image" mb={4} border="none" boxShadow="none">
              <StaticSvgImage
                src="/images/cards/hero-signals.svg"
                alt="Live systems dashboard showing technology, brand, and campaign signals"
                width={480}
                height={200}
                priority
                style={{ width: "100%", height: "auto" }}
              />
            </Box>
            <Text fontSize="sm" textTransform="uppercase" color="gray.400">
              Selected work in motion
            </Text>
            <Heading size="md" color="white" mt={2} mb={4}>
              Build with live systems
            </Heading>
            <Stack spacing={4}>
              {projectSignals.map((project) => (
                <Box key={project.title}>
                  <Text fontWeight="semibold" color="white">
                    {project.title}
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    {project.description}
                  </Text>
                  <Divider borderColor="whiteAlpha.200" mt={3} />
                </Box>
              ))}
            </Stack>
            <Stack direction="row" spacing={3} mt={6} flexWrap="wrap">
              {[
                { label: "Software", color: "accent.green" },
                { label: "Branding", color: "accent.blue" },
                { label: "Campaigns", color: "accent.red" },
              ].map((item) => (
                <Box
                  key={item.label}
                  px={3}
                  py={1}
                  borderRadius="full"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  color="white"
                  fontSize="xs"
                  bg="blackAlpha.500"
                >
                  <Text color={item.color}>{item.label}</Text>
                </Box>
              ))}
            </Stack>
          </Box>
        </Flex>
      </Stack>
    </Box>
  );
}
