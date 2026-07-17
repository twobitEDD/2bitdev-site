import {
  Box,
  Container,
  Heading,
  Link,
  SimpleGrid,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
} from "@chakra-ui/react";
import { BrandMark } from "@components/brand/BrandMark";
import { siteConfig } from "@config/site";
import { ReactNode } from "react";
import { FaEnvelope, FaGithub } from "react-icons/fa";

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      bg="blackAlpha.100"
      rounded="full"
      w={8}
      h={8}
      cursor="pointer"
      as="a"
      href={href}
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      transition="background 0.3s ease"
      _hover={{
        bg: "blackAlpha.200",
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

function Footer() {
  return (
    <Box as="footer" className="footer-gas-glow" w="full">
      <Box className="footer-gas-glow__band" aria-hidden="true" />
      <Container maxW="6xl" py={0}>
        <Box className="footer-gas-glow__content">
          <SimpleGrid
            templateColumns={{ sm: "1fr 1fr", md: "2fr 1fr 1fr 2fr" }}
            spacing={6}
          >
            <Stack spacing={4}>
              <Box display="flex" flexDirection="row" alignItems="center">
                <BrandMark height={24} color="#0f172a" />
                <Heading fontSize="xl" display="inline-block" ml={2}>
                  {siteConfig.name}
                </Heading>
              </Box>
              <Text fontSize="sm">
                {`© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved`}
              </Text>
              <Link
                href={siteConfig.links.email}
                className="footer-gas-glow__email"
                fontSize="md"
                _hover={{ textDecoration: "underline" }}
              >
                {siteConfig.contactEmail}
              </Link>
              <Stack direction="row" spacing={6}>
                <SocialButton label="Email" href={siteConfig.links.email}>
                  <FaEnvelope />
                </SocialButton>
                <SocialButton label="Github" href={siteConfig.links.github}>
                  <FaGithub />
                </SocialButton>
              </Stack>
            </Stack>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}

export default Footer;
