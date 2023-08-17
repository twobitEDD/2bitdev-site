"use client";

import { Button, Link } from "@nextui-org/react";
import { ArrowRightIcon } from "@nextui-org/shared-icons";
import NextLink from "next/link";

import { GithubIcon } from "@/components/icons";
import { subtitle, title } from "@/components/primitives";
import { siteConfig } from "@/config/site";

// const BgLooper = dynamic(
//   () => import("./bg-looper").then((mod) => mod.BgLooper),
//   {
//     ssr: false,
//   }
// );

export const Hero = () => {
  return (
    <div
      className="px-6 mx-auto"
      //  style={{ border: "1px dashed red" }}
    >
      <section
        className="flex overflow-hidden lg:overflow-visible w-full max-w-[1280] flex-nowrap justify-between items-center h-[calc(100vh_-_64px)] 2xl:h-[calc(84vh_-_64px)]"
        // style={{ border: "1px dashed red" }}
      >
        <div
          className="z-20 flex flex-col w-full gap-6 lg:w-1/2 xl:mt-10"
          //   style={{ border: "1px dashed red" }}
        >
          <div className="leading-8 text-center md:leading-10 md:text-left">
            <div className="inline-block">
              <h1 className={title()}>A&nbsp;</h1>
              <h1 className={title({ color: "secondary" })}>
                New Standard&nbsp;
              </h1>
            </div>
            <h1 className={title()}>
              for Empowering Game Developers with Decentralized Server Services 
            </h1>
          </div>
          <h2
            className={subtitle({
              fullWidth: true,
              class: "text-center md:text-left",
            })}
          >
            {siteConfig.description}
          </h2>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Button
              as={NextLink}
              className="w-full md:w-auto"
              color="primary"
              endContent={
                <ArrowRightIcon
                  className="group-data-[hover=true]:translate-x-0.5 outline-none transition-transform"
                  strokeWidth={2}
                />
              }
              href="/docs"
              radius="full"
              size="lg"
            >
              BUIDL
            </Button>

            <Button
              fullWidth
              isExternal
              as={Link}
              className="w-full md:w-auto"
              href="https://github.com/ServProtocolOrg"
              radius="full"
              size="lg"
              startContent={<GithubIcon />}
              variant="bordered"
            >
              Github
            </Button>
          </div>
        </div>

        <div
          className="z-20 flex-col items-center hidden w-1/2 center lg:flex"
          //   style={{ border: "1px dashed red" }}
        >
          <div
            // className="bg-unset fill-primary-500"
            className="relative"
          >
            <LogoAnimator height="360px" width="360px" logo={servLogo} />
            {/*  Circle div underneath SVG for contrast (on dark bg)  */}
            {/* <div className="absolute top-0 left-0 border-5 rounded-full w-[300px] h-[300px] animate-glow"></div> */}
          </div>
        </div>

        {/* <BgLooper /> */}
      </section>
    </div>
  );
};

interface LogoAnimatorProps extends React.SVGProps<SVGSVGElement> {
  logo: string;
}

export default function LogoAnimator({ logo, ...rest }: LogoAnimatorProps) {
  return (
    <svg
      //   className="motion-safe:animate-pulse animate-infinite animate-ease-in-out animate-fill-both"
      dangerouslySetInnerHTML={{ __html: logo }}
      {...rest}
    />
  );
}

const servLogo = `
<?xml version="1.0" encoding="UTF-8" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg width="100%" height="100%" viewBox="0 0 5000 5000" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:1.5;"><ellipse cx="2499.02" cy="2499.38" rx="2443.34" ry="2431.35" style="fill:#757575;"/><path d="M2499.02,68.025c1348.52,0 2443.34,1089.45 2443.34,2431.35c0,1341.9 -1094.82,2431.35 -2443.34,2431.35c-711.5,0 -846.292,-795.354 -1293,-1278.98c-399.946,-432.996 -1150.34,-518.479 -1150.34,-1152.37c0,-1341.9 1094.83,-2431.35 2443.34,-2431.35Z" style="stroke:url(#_Linear1);stroke-width:86.79px;"/><path d="M4253.54,2460.6c-0,-309.9 -251.6,-561.5 -561.5,-561.5l-2370.23,0c-309.9,0 -561.5,251.6 -561.5,561.5c0,309.9 251.6,561.5 561.5,561.5l2370.23,0c309.9,0 561.5,-251.6 561.5,-561.5Z" style="fill:#757575;"/><path d="M2931.36,979.25c-212.396,-226.646 -569.683,-239.125 -797.366,-27.85l-1188.08,1102.47c-227.684,211.279 -240.096,566.816 -27.705,793.462c212.392,226.646 569.68,239.125 797.363,27.85l1188.08,-1102.47c227.683,-211.275 240.096,-566.817 27.704,-793.463Z" style="fill:#b2b2b2;"/><g><path d="M2889.22,1018.18c-191.354,-204.429 -513.496,-215.816 -718.942,-25.4c-205.442,190.409 -216.883,510.975 -25.529,715.413l0.879,0.933c191.346,204.433 513.496,215.817 718.938,25.408c205.437,-190.416 216.883,-510.979 25.529,-715.412l-0.875,-0.942Z" style="fill-opacity:0.25;"/></g><g><path d="M1694.7,2125.8c-191.354,-204.429 -513.496,-215.817 -718.942,-25.4c-205.442,190.408 -216.883,510.975 -25.529,715.412l0.879,0.934c191.346,204.433 513.496,215.816 718.938,25.408c205.437,-190.417 216.883,-510.979 25.529,-715.412l-0.875,-0.942Z" style="fill-opacity:0.25;"/></g><path d="M4097.33,2084.94c-212.396,-226.65 -569.679,-239.125 -797.362,-27.85l-1188.08,1102.47c-227.684,211.275 -240.096,566.813 -27.705,793.463c212.396,226.646 569.684,239.125 797.367,27.846l1188.08,-1102.46c227.683,-211.279 240.096,-566.816 27.704,-793.462Z" style="fill:#b2b2b2;"/><g id="Button-V" serif:id="Button V"><path d="M4066.01,2110.98c-191.355,-204.429 -513.496,-215.816 -718.942,-25.404c-205.442,190.409 -216.883,510.979 -25.529,715.413l0.879,0.933c191.346,204.438 513.496,215.821 718.937,25.408c205.438,-190.412 216.884,-510.975 25.53,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M4066.01,2110.98c-191.355,-204.429 -513.496,-215.816 -718.942,-25.404c-205.442,190.409 -216.883,510.979 -25.529,715.413l0.879,0.933c191.346,204.438 513.496,215.821 718.937,25.408c205.438,-190.412 216.884,-510.975 25.53,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M4066.01,2110.98c-191.355,-204.429 -513.496,-215.816 -718.942,-25.404c-205.442,190.409 -216.883,510.979 -25.529,715.413l0.879,0.933c191.346,204.438 513.496,215.821 718.937,25.408c205.438,-190.412 216.884,-510.975 25.53,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M4066.01,2110.98c-191.355,-204.429 -513.496,-215.816 -718.942,-25.404c-205.442,190.409 -216.883,510.979 -25.529,715.413l0.879,0.933c191.346,204.438 513.496,215.821 718.937,25.408c205.438,-190.412 216.884,-510.975 25.53,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M4066.01,2119.32c-191.355,-204.429 -513.496,-215.817 -718.942,-25.404c-205.442,190.408 -216.883,510.979 -25.529,715.412l0.879,0.933c191.346,204.438 513.496,215.821 718.937,25.409c205.438,-190.413 216.884,-510.975 25.53,-715.413l-0.875,-0.937Z" style="fill-opacity:0.25;"/></g><g id="Button-V1" serif:id="Button V"><path d="M2871.49,3218.6c-191.354,-204.429 -513.496,-215.817 -718.942,-25.404c-205.442,190.408 -216.883,510.979 -25.529,715.412l0.879,0.934c191.346,204.437 513.496,215.821 718.938,25.408c205.437,-190.412 216.883,-510.975 25.529,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M2871.49,3218.6c-191.354,-204.429 -513.496,-215.817 -718.942,-25.404c-205.442,190.408 -216.883,510.979 -25.529,715.412l0.879,0.934c191.346,204.437 513.496,215.821 718.938,25.408c205.437,-190.412 216.883,-510.975 25.529,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M2871.49,3218.6c-191.354,-204.429 -513.496,-215.817 -718.942,-25.404c-205.442,190.408 -216.883,510.979 -25.529,715.412l0.879,0.934c191.346,204.437 513.496,215.821 718.938,25.408c205.437,-190.412 216.883,-510.975 25.529,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M2871.49,3218.6c-191.354,-204.429 -513.496,-215.817 -718.942,-25.404c-205.442,190.408 -216.883,510.979 -25.529,715.412l0.879,0.934c191.346,204.437 513.496,215.821 718.938,25.408c205.437,-190.412 216.883,-510.975 25.529,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/><path d="M2871.49,3226.93c-191.354,-204.429 -513.496,-215.816 -718.942,-25.404c-205.442,190.409 -216.883,510.979 -25.529,715.413l0.879,0.933c191.346,204.438 513.496,215.821 718.938,25.408c205.437,-190.412 216.883,-510.975 25.529,-715.412l-0.875,-0.938Z" style="fill-opacity:0.25;"/></g><defs><linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(4886.67,0,0,4886.67,55.68,2499.38)"><stop offset="0" style="stop-color:#000;stop-opacity:1"/><stop offset="0.51" style="stop-color:#9b9b9b;stop-opacity:1"/><stop offset="0.58" style="stop-color:#d7d7d7;stop-opacity:1"/><stop offset="0.73" style="stop-color:#434343;stop-opacity:1"/><stop offset="1" style="stop-color:#000;stop-opacity:1"/></linearGradient></defs></svg>
`;
