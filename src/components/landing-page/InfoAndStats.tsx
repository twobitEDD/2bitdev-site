import {
    Box,
    Container,
    Flex,
    SimpleGrid,
    Stack,
    Text,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import { Description, SuperTitle, Title } from "./Section";

export function InfoAndStats() {
    return (
        <Box bg={"gray.800"} position={"relative"}>
            <Container maxW={"7xl"} zIndex={10} position={"relative"}>
                <Stack direction={{ base: "column", lg: "row" }}>
                    <Stack
                        flex={1}
                        color={"gray.400"}
                        justify={{ lg: "center" }}
                        py={{ base: 4, md: 20, xl: 40 }}
                    >
                        <Box mb={{ base: 8, md: 20 }}>
                            <SuperTitle>Features</SuperTitle>
                            <Title>Lorem ipsum dolor sit amet</Title>
                            <Description>
                                Lorem ipsum dolor sit amet consectetur adipisicing elit.
                                Reiciendis voluptatibus, quos quia, quibusdam, quod voluptatum
                                dolorum consequatur fugit, eaque explicabo nemo. Quisquam,
                                quibusdam
                            </Description>
                        </Box>

                        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
                            {stats.map((stat) => (
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
        title: "10+",
        content: (
            <>
                <StatsText>Lorem ipsum dolor</StatsText> for detailed monitoring and
                real-time analytics
            </>
        ),
    },
    {
        title: "24/7",
        content: (
            <>
                <StatsText>adipisicing elit. Quisquam</StatsText> enabled right in your dashboard without
                history limitations
            </>
        ),
    },
    {
        title: "13%",
        content: (
            <>
                <StatsText>dolor sit amet adipisicing.</StatsText> in North America has chosen NewLifeTM as
                their management solution
            </>
        ),
    },
    {
        title: "250M+",
        content: (
            <>
                <StatsText>Amet consectetur quod.</StatsText> currently connected and monitored by the
                NewLifeTM software
            </>
        ),
    },
];