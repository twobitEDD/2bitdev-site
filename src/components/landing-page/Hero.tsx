"use client";

import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  createIcon,
} from "@chakra-ui/react";
import { Icons } from "@components/icons";
import Link from "next/link";

export default function Hero() {
  return (
    <Stack
      align={"center"}
      spacing={{ base: 8, md: 10 }}
      py={{ base: 20, md: 28 }}
      mt={{ base: 10, md: 28 }}
      direction={{ base: "column", md: "row" }}
    >
      {/* Left Column */}
      <Stack flex={1} spacing={{ base: 5, md: 5 }}>
        <Heading
          lineHeight={1.1}
          fontWeight={600}
          fontSize={{ base: "3xl", sm: "3xl", md: "4xl", lg: "5xl" }}
        >
          <Text as={"span"}>A Secure</Text>
          <Box></Box>
          <Text as={"span"}>Decentralized</Text>
          <Box></Box>
          <Text as={"span"}>Online Data Layer</Text>
        </Heading>

        <Text fontSize={"lg"} color={"gray.400"} mb={4}>
          SERV Protocol provides an easy to use Perpetual Data System, allowing
          Developers to focus on building sottware not running servers.
        </Text>
        <Text fontSize={"lg"} color={"gray.400"} mb={4}>
          Defining a Reliable Standard for Sharing Interactive Experiences;
          Data-Management for: Payment Processing, Inventory Management,
          Communications, Leaderboards, Match-Making and User Management built
          to run on our perpetual server system.
        </Text>
        <Stack
          spacing={{ base: 4, sm: 6 }}
          direction={{ base: "column", sm: "row" }}
        >
          <Link
            nonce="false"
            href={
              "https://bafkreicwweipen4ngbxlgcxltkx7d7dzlfd4z7rgs4mgvmuntrfap75tmm.ipfs.nftstorage.link/"
            }
            passHref
            key={
              "https://bafkreicwweipen4ngbxlgcxltkx7d7dzlfd4z7rgs4mgvmuntrfap75tmm.ipfs.nftstorage.link/"
            }
          >
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
              View White Paper
            </Button>
          </Link>
          <Link
            nonce="false"
            href={"https://docs.serv.services"}
            passHref
            key={"https://docs.serv.services"}
          >
            <Button
              rounded={"full"}
              size={"lg"}
              fontWeight={"normal"}
              // colorScheme="brand"
              variant={"ghost"}
              px={6}
              rightIcon={<Icons.arrowRight />}
            >
              Learn More
            </Button>
          </Link>
        </Stack>
      </Stack>

      {/* Right Column */}
      <Flex
        flex={1}
        justify={"center"}
        align={"center"}
        position={"relative"}
        w={"full"}
      >
        <Box
          position={"relative"}
          height={"300px"}
          rounded={"2xl"}
          boxShadow={"2xl"}
          width={"full"}
          overflow={"hidden"}
        >
          {/* <IconButton
            aria-label={"Play Button"}
            variant={"ghost"}
            _hover={{ bg: "transparent" }}
            icon={<PlayIcon w={12} h={12} />}
            size={"lg"}
            color={"white"}
            position={"absolute"}
            left={"50%"}
            top={"50%"}
            transform={"translateX(-50%) translateY(-50%)"}
          /> */}
          <Image
            alt={"Hero Image"}
            fit={"cover"}
            align={"center"}
            w={"100%"}
            h={"100%"}
            src={
              "https://servprotocol.nyc3.cdn.digitaloceanspaces.com/BlockchainImage.jpeg"
              //"https://bafkreifuqcle5os7olroszotm62vrkgfxxrhuzg5lxam5jubaikmysifpu.ipfs.nftstorage.link/"
              //https://bafybeiad2nhx4ozapxlqoh6ln3da2dnetnzscfa4nhqedk2lyuul45e3ju.ipfs.nftstorage.link/
              //https://bafybeiegajvj2jefyvhmytgp7obyy3woidkgdtxuz4mx5fiicyvmzrvbmm.ipfs.nftstorage.link/
              //https://bafybeiclqk7znishm2jremdcl5id7mvqvvjla452rpkotfzzy3gur56stq.ipfs.nftstorage.link/
            }
          />
        </Box>
      </Flex>
    </Stack>
  );
}

const PlayIcon = createIcon({
  displayName: "PlayIcon",
  viewBox: "0 0 58 58",
  d: "M28.9999 0.562988C13.3196 0.562988 0.562378 13.3202 0.562378 29.0005C0.562378 44.6808 13.3196 57.438 28.9999 57.438C44.6801 57.438 57.4374 44.6808 57.4374 29.0005C57.4374 13.3202 44.6801 0.562988 28.9999 0.562988ZM39.2223 30.272L23.5749 39.7247C23.3506 39.8591 23.0946 39.9314 22.8332 39.9342C22.5717 39.9369 22.3142 39.8701 22.0871 39.7406C21.86 39.611 21.6715 39.4234 21.5408 39.1969C21.4102 38.9705 21.3421 38.7133 21.3436 38.4519V19.5491C21.3421 19.2877 21.4102 19.0305 21.5408 18.8041C21.6715 18.5776 21.86 18.3899 22.0871 18.2604C22.3142 18.1308 22.5717 18.064 22.8332 18.0668C23.0946 18.0696 23.3506 18.1419 23.5749 18.2763L39.2223 27.729C39.4404 27.8619 39.6207 28.0486 39.7458 28.2713C39.8709 28.494 39.9366 28.7451 39.9366 29.0005C39.9366 29.2559 39.8709 29.507 39.7458 29.7297C39.6207 29.9523 39.4404 30.1391 39.2223 30.272Z",
});
