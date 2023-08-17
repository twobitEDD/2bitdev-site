import { HeartFilledIcon, Logo, SearchIcon } from "@/components/icons";
import { siteConfig } from "@/config/site";
import {
  Button,
  Input,
  Kbd,
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
import clsx from "clsx";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { TailwindsThemeChanger } from "./theme-switch";

export const Navbar = () => {
  const pathname = usePathname();

  const searchInput = (
    <Input
      aria-label="Search"
      classNames={{
        inputWrapper: "bg-default-100",
        input: "text-sm",
      }}
      endContent={
        <Kbd className="hidden lg:inline-block" keys={["command"]}>
          K
        </Kbd>
      }
      labelPlacement="outside"
      placeholder="Search..."
      startContent={
        <SearchIcon className="flex-shrink-0 text-base pointer-events-none text-default-400" />
      }
      type="search"
    />
  );

  return (
    <NextUINavbar
      disableAnimation={true}
      position="sticky"
      classNames={{
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
      }}
    >
      {/* left section */}
      <NavbarContent>
        <NavbarMenuToggle aria-label="Toggle menu" className="sm:hidden" />
        <NavbarBrand>
          <Logo className="hidden sm:flex" />
          <p className="font-bold text-inherit">{siteConfig.name}</p>
        </NavbarBrand>
      </NavbarContent>

      {/* center section */}
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

      {/* rigth section */}
      <NavbarContent justify="end">
        <NavbarItem>
          <TailwindsThemeChanger />
        </NavbarItem>
        <NavbarItem>
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

      {/* drawer section */}
      <NavbarMenu>
        {siteConfig.navMenuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link color={"foreground"} className="w-full" href="#" size="lg">
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </NextUINavbar>
  );
};
