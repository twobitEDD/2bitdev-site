import { Heading, Text } from "@chakra-ui/react";
import { PropsWithChildren } from "react";

export function SuperTitle({ children }: PropsWithChildren) {
  return (
    <Text
      fontFamily={"heading"}
      fontWeight={700}
      textTransform={"uppercase"}
      mb={3}
      fontSize={"xl"}
      color={"var(--section-super-title, accent.blue)"}
    >
      {children}
    </Text>
  );
}

export function Title({ children }: PropsWithChildren) {
  return (
    <Heading
      color={"var(--section-heading, white)"}
      mb={5}
      fontSize={{
        base: "3xl",
        md: "5xl",
      }}
    >
      {children}
    </Heading>
  );
}
export function Description({ children }: PropsWithChildren) {
  return (
    <Text fontSize={"lg"} color={"var(--section-description, gray.400)"}>
      {children}
    </Text>
  );
}
