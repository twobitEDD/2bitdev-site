"use client";
import {
  Box,
  Button,
  CloseButton,
  Container,
  Flex,
  IconButton,
  HStack,
  VStack,
  chakra,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { Icons } from "@components/icons";
import { siteConfig } from "@config/site";
import { useViewportScroll } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function App() {
  const pathname = usePathname();
  const mobileNav = useDisclosure();

  const bg = useColorModeValue("white", "black");
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [y, setY] = React.useState(0);
  const height = ref.current ? ref.current.getBoundingClientRect() : 0;

  const { scrollY } = useViewportScroll();
  React.useEffect(() => {
    return scrollY.onChange(() => setY(scrollY.get()));
  }, [scrollY]);

  const SponsorButton = (
    <Link
      href={"/#contact"}
      passHref
      key={"/#contact"}
    >
      <Button
        variant="solid"
        fontWeight={"bold"}
        color={"white"}
        colorScheme={"brand"}
        bg={"brand.400"}
        _hover={{ bg: "brand.500" }}
        rightIcon={<Icons.arrowRight />}
      >
        Start a project
      </Button>
    </Link>
  );
  const MobileNavContent = (
    <VStack
      pos="absolute"
      top={0}
      left={0}
      right={0}
      display={mobileNav.isOpen ? "flex" : "none"}
      flexDirection="column"
      p={2}
      pb={4}
      m={2}
      bg={bg}
      spacing={3}
      rounded="sm"
      shadow="sm"
    >
      <CloseButton
        aria-label="Close menu"
        justifySelf="self-start"
        onClick={mobileNav.onClose}
      />
      {siteConfig.navMenuItems.map((item, index) => (
        <Link href={item.href} passHref key={item.href}>
          <Button
            as={"a"}
            w="full"
            variant="ghost"
            colorScheme={pathname === item.href ? "brand" : undefined}
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </VStack>
  );

  return (
    <Box
      pos="sticky"
      top="0"
      id="header-HERE"
      // frosted glass
      ref={ref}
      position="fixed"
      // top="0"
      w="full"
      h="60px"
      bg="rgba(5, 5, 5, 0.85)"
      backdropFilter="blur(10px)"
      boxShadow={
        y > (height as number)
          ? {
              base: "none",
              md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            }
          : undefined
      }
      transition="box-shadow 0.2s"
      overflowY="hidden"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="999"
      px="2" // match the body container (not units but actual space)
    >
      <Container maxWidth={"7xl"}>
        <chakra.header transition="box-shadow 0.2s" w="full" overflowY="hidden">
          <chakra.div h="4.5rem">
            <Flex w="full" h="full" align="center" justify="space-between">
              {/* Logo Section */}
              <Flex align="center">
                <Link
                  href="/"
                  style={{
                    width: 40,
                    height: 40,
                  }}
                >
                  <Flex
                    align="center"
                    justify="center"
                    border="1px solid"
                    borderColor="whiteAlpha.300"
                    borderRadius="md"
                    w="40px"
                    h="40px"
                    fontSize="sm"
                    fontWeight="bold"
                    color="white"
                    bg="blackAlpha.700"
                  >
                    2b
                  </Flex>
                </Link>
                <chakra.h1
                  fontSize="xl"
                  fontWeight="medium"
                  ml="2"
                  mr="4"
                  width="140px"
                  display={{ base: "none", sm: "flex" }}
                >
                  {siteConfig.name}
                </chakra.h1>
              </Flex>

              {/* Nav links section */}
              <Flex>
                <HStack
                  display={{
                    base: "none",
                    md: "flex",
                  }}
                >
                  {siteConfig.navItems.map((item) => (
                    <Link href={item.href} passHref key={item.href}>
                      <Button
                        as={"a"}
                        variant="ghost"
                        color="gray.300"
                        _hover={{ color: "white" }}
                      >
                        {item.label}
                      </Button>
                    </Link>
                  ))}
                </HStack>
              </Flex>

              {/* Right section */}
              <Flex
                justify="flex-end"
                w="full"
                maxW="824px"
                align="center"
                color="gray.400"
              >
                {SponsorButton}
                <IconButton
                  display={{ base: "flex", md: "none" }}
                  ml="2"
                  aria-label="Open menu"
                  fontSize="20px"
                  color="gray.800"
                  _dark={{ color: "inherit" }}
                  variant="ghost"
                  icon={<Icons.menu />}
                  onClick={mobileNav.onOpen}
                />
              </Flex>
            </Flex>
            {MobileNavContent}
          </chakra.div>
        </chakra.header>
      </Container>
    </Box>
  );
}
