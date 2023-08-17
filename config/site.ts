export type SiteConfig = typeof siteConfig;

const navItems = [
    {
        label: "Home",
        href: "/",
    },
    {
        label: "Staking",
        href: "https://serv.services/staking",
    },
    {
        label: "Features",
        href: "/features",
    },
    {
        label: "Docs",
        href: "/docs",
    },

    {
        label: "Blog",
        href: "/blog",
    },
    {
        label: "About",
        href: "/about",
    }
]

export const siteConfig = {
    name: "SERV Protocol",
    description: "A community owned and operated blockchain dedicated to providing server solutions for video game developers.",
    navItems: navItems, // header links
    navMenuItems: navItems, // drawer links
    links: {
        github: "https://github.com/ServProtocol",
        twitter: "https://twitter.com/ServProtocol",
        docs: "https://servprotocol.com/docs",
        discord: "https://discord.gg/uFH988AfJA",
    },
    maxHeaderWidth: 'xl',
    maxContentWidth: 'max-w-[1280]',
};
