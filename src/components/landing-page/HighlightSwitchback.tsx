import { Box, Button, Flex, Image, SimpleGrid } from "@chakra-ui/react";
import { FadeIn } from "@components/motion/Animation";
import Link from "next/link";
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
        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            mb={24}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
          >
            <Box>
              <Title>Network-Operator Token Genesis</Title>
              <Description>
                SERV Protocol owes it&apos;s existance to it&apos;s network
                operators, which is why SERV has implimented a unique and
                effective way of starting the network. SERV has generated a list
                of the proven Server Operators on the network which SERV derives
                it&apos;s codebase, so initially the token supply will be
                allocated directly the network operators (inspired by Proof of
                Work blockchains like Bitcoin and Ergo).
              </Description>
              <Link
                nonce="false"
                href={"https://docs.serv.services"}
                passHref
                key={"https://docs.serv.services"}
              >
                <Button
                  w={{ base: "full", sm: "auto" }}
                  mt="8"
                  size="lg"
                  variant="solid"
                >
                  Learn More
                </Button>
              </Link>
            </Box>
            <Box
              w="full"
              h="full"
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              textAlign={"center"}
            >
              <Image
                alt={"Token Genesis Image"}
                fit={"cover"}
                align={"center"}
                src={
                  "https://servprotocol.nyc3.cdn.digitaloceanspaces.com/0_3_5.png"
                  //"https://bafybeiegajvj2jefyvhmytgp7obyy3woidkgdtxuz4mx5fiicyvmzrvbmm.ipfs.nftstorage.link/"
                }
              />
            </Box>
          </SimpleGrid>
        </FadeIn>
        {/* Right section */}
        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            flexDirection="column-reverse"
            mb={24}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
          >
            <Box order={{ base: "initial", md: 2 }}>
              <Title>Allowing Developers to focus on Development</Title>
              <Description>
                The technical skilled related to Software Development are
                different than the technical skills related to Network Server
                Operations. SERV Protocol is dedicated to simiplifying the
                processes of making online experiences without demanding that
                developers oversee network operations. From creating easy to use
                templates and examples for Development, to encouraging open
                source inititives, SERV is built to allow software developers to
                stay focused on making software.
              </Description>
              <Link
                nonce="false"
                href={"https://docs.serv.services"}
                passHref
                key={"https://docs.serv.services"}
              >
                <Button
                  w={{ base: "full", sm: "auto" }}
                  mt="8"
                  size="lg"
                  variant="solid"
                >
                  Learn More
                </Button>
              </Link>
            </Box>
            <Box
              w="full"
              h="full"
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              textAlign={"center"}
            >
              <Image
                alt={"Game Developer Image"}
                fit={"cover"}
                align={"center"}
                w={"100%"}
                h={"100%"}
                src={
                  "https://servprotocol.nyc3.cdn.digitaloceanspaces.com/0_3_6.png"
                  //"https://bafybeiclqk7znishm2jremdcl5id7mvqvvjla452rpkotfzzy3gur56stq.ipfs.nftstorage.link/"
                }
              />
            </Box>
          </SimpleGrid>
        </FadeIn>

        {/* Left Section */}
        <FadeIn direction="from-bottom-to-top">
          <SimpleGrid
            alignItems="center"
            columns={{ base: 1, md: 2 }}
            spacingY={{ base: 10, md: 32 }}
            spacingX={{ base: 10, md: 24 }}
          >
            <Box>
              <Title>Community Owned from the Start </Title>
              <Description>
                With the goal of perpetual network operations, SERV Protocol
                starts off by giving complete control over it&apos;s operations
                to it&apos;s operators. By giving ownership of the network to
                it&apos;s operators, those whom run the network are set to
                benefit from the long term success of the network; This mean
                that the network has the ability to be supported longer than if
                it were ran by a single business entity. It&apos;s shared
                ownership allows for shared network costs, and ultimately a
                chance at shared success.
              </Description>
              <Link
                nonce="false"
                href={"https://docs.serv.services"}
                passHref
                key={"https://docs.serv.services"}
              >
                <Button
                  w={{ base: "full", sm: "auto" }}
                  mt="8"
                  size="lg"
                  variant="solid"
                >
                  Learn More
                </Button>
              </Link>
            </Box>
            <Box
              w="full"
              h="full"
              bg="gray.200"
              _dark={{ bg: "gray.700" }}
              textAlign={"center"}
            >
              <Image
                alt={"Community Owned Image"}
                fit={"cover"}
                align={"center"}
                src={
                  "https://servprotocol.nyc3.cdn.digitaloceanspaces.com/0_0_3.png?"
                  //"https://bafybeiad2nhx4ozapxlqoh6ln3da2dnetnzscfa4nhqedk2lyuul45e3ju.ipfs.nftstorage.link/"
                }
              />
            </Box>
          </SimpleGrid>
        </FadeIn>
      </Box>
    </Flex>
  );
}
