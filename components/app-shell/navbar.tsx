import {
  Button,
  Link,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
  Navbar as NextUINavbar,
} from "@nextui-org/react";

import { link as linkStyles } from "@nextui-org/theme";

import {
  DiscordIcon,
  GithubIcon,
  HeartFilledIcon,
  TwitterIcon,
} from "@/components/icons";
import { TailwindsThemeChanger } from "@/components/theme-switch";
import { siteConfig } from "@/config/site";
import clsx from "clsx";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

import Image from "next/image";

export const Navbar = () => {
  const pathname = usePathname();

  return (
    <NextUINavbar
      maxWidth={siteConfig.maxHeaderWidth}
      position="sticky"
      classNames={navBarStyles}
    >
      <NavbarBrand className="gap-3 mr-3 max-w-fit">
        <NextLink className="flex items-center justify-start gap-1" href="/">
          <Image
            src="/SERV Logo V1Dark.svg"
            width={60}
            height={60}
            alt={siteConfig.name + " logo"}
          />
          <p className="font-bold text-inherit">{siteConfig.name}</p>
        </NextLink>
      </NavbarBrand>
      <NavbarContent className="hidden gap-4 sm:flex" justify="center">
        {siteConfig.navItems.map((item) => (
          <NavbarItem key={item.href} isActive={pathname === item.href}>
            <NextLink
              className={clsx(linkStyles({ color: "foreground" }))}
              color="foreground"
              data-active={pathname === item.href}
              href={item.href}
            >
              {item.label}
            </NextLink>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem className="hidden gap-3 sm:flex">
          <Link isExternal href={siteConfig.links.twitter}>
            <TwitterIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.discord}>
            <DiscordIcon className="text-default-500" />
          </Link>
          <Link isExternal href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <TailwindsThemeChanger />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <Button
            href={"/"}
            startContent={<HeartFilledIcon className="text-white" />}
            radius="full"
            color="primary"
          >
            CTA Button Text
          </Button>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="pl-4 sm:hidden basis-1" justify="end">
        <Link isExternal href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="flex flex-col gap-3 mx-4 mt-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <Link
                color={
                  index === 2
                    ? "primary"
                    : index === siteConfig.navMenuItems.length - 1
                    ? "danger"
                    : "foreground"
                }
                href="#"
                size="lg"
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};

const navBarStyles = {
  item: [
    "flex",
    "relative",
    "h-full",
    "items-center",
    "data-[active=true]:after:content-['']",
    "data-[active=true]:after:absolute",
    "data-[active=true]:after:bottom-0",
    "data-[active=true]:after:top-12",
    "data-[active=true]:after:left-0",
    "data-[active=true]:after:right-0",
    "data-[active=true]:after:h-[2px]",
    "data-[active=true]:after:rounded-[2px]",
    "data-[active=true]:after:bg-foreground",
  ],
};
