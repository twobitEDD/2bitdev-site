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
      color={"var(--checker-super-title, accent.blue)"}
    >
      {children}
    </Text>
  );
}

export function Title({ children }: PropsWithChildren) {
  return (
    <Heading
      color={"var(--checker-heading, white)"}
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
    <Text fontSize={"lg"} color={"var(--checker-description, gray.400)"}>
      {children}
    </Text>
  );
}
