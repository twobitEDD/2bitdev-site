import { nextui } from '@nextui-org/react'

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {},
    },
    darkMode: "class",
    plugins: [
        nextui({
            themes: {
                "purple-dark": {
                    extend: "dark", // <- inherit default values from dark theme
                    colors: {
                        // background: "#10021b",
                        // foreground: "#f5e8ff",
                        primary: {
                            50: '#f5e8ff',
                            100: '#dabef6',
                            200: '#c094ec',
                            300: '#a66ae2',
                            400: '#8c40d9',
                            500: '#7326bf',
                            600: '#591d96',
                            700: '#40146c',
                            800: '#260b43',
                            900: '#10021b',
                            DEFAULT: "#7326bf", // 500
                            foreground: "#f5e8ff", // 50
                        },
                        secondary:
                        {
                            50: '#fbfcdf',
                            100: '#f2f2ba',
                            200: '#e9ea92',
                            300: '#e0e168',
                            400: '#d7d940',
                            500: '#bdbf26',
                            600: '#93951c',
                            700: '#696a11',
                            800: '#3f4006',
                            900: '#161600',
                            DEFAULT: "#bdbf26", // 500
                            foreground: "#161600", // 50
                        },
                        focus: "#591d96", // 600
                    },
                    layout: {
                        disabledOpacity: "0.3",
                        radius: {
                            small: "4px",
                            medium: "6px",
                            large: "8px",
                        },
                        borderWidth: {
                            small: "1px",
                            medium: "2px",
                            large: "3px",
                        },
                    },
                },
                "watermelon-dark": {
                    extend: "dark", // <- inherit default values from dark theme
                    colors: {
                        // background: "#10021b",
                        // foreground: "#f5e8ff",
                        "primary": {
                            50: "#FDE2EE",
                            100: "#FBC6DD",
                            200: "#F788B8",
                            300: "#F34F96",
                            400: "#EF1674",
                            500: "#B80D57",
                            600: "#940A46",
                            700: "#6E0834",
                            800: "#470522",
                            900: "#260312",
                            950: "#130109",
                            DEFAULT: "#B80D57", // 500
                            foreground: "#FDE2EE", // 50
                        },
                        "secondary": {
                            50: "#E2FDE3",
                            100: "#C6FBC8",
                            200: "#88F78C",
                            300: "#4FF354",
                            400: "#16EF1D",
                            500: "#0DB813",
                            600: "#0A940F",
                            700: "#086E0B",
                            800: "#054707",
                            900: "#032604",
                            950: "#011302",
                            DEFAULT: "#0DB813", // 500
                            foreground: "#E2FDE3", // 50
                        },
                        focus: "#940A46", // 600
                    },
                    /*  layout: {
                         disabledOpacity: "0.3",
                         radius: {
                             small: "4px",
                             medium: "6px",
                             large: "8px",
                         },
                         borderWidth: {
                             small: "1px",
                             medium: "2px",
                             large: "3px",
                         },
                     }, */
                },
            },
        }),
    ],
}

