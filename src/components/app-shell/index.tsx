"use client";

import { Box } from "@chakra-ui/react";
import type { ReactNode } from "react";

import Footer from "./Footer";
import Header from "./Header";

type LayoutProps = {
    children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
    return (
        <>
            <Header />
            <Box margin="0 auto" maxWidth={"7xl"} transition="0.5s ease-out">
                <Box
                    margin="6" // match the header container (not units but actual space)
                >
                    <Box as="main" marginY={22}>
                        {children}
                    </Box>
                    <Footer />
                </Box>
            </Box>
        </>
    );
};

export default Layout;
