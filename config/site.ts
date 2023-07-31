export type SiteConfig = typeof siteConfig;

const navItems = [
    {
        label: "Home",
        href: "/",
    }, {
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
    description: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium .",
    navItems: navItems, // header links
    navMenuItems: navItems, // drawer links
    links: {
        github: "https://github.com/",
        twitter: "https://twitter.com/",
        docs: "/",
        discord: "https://discord.gg/",
    },
    maxHeaderWidth: 'xl',
    maxContentWidth: 'max-w-[1280]',
};
