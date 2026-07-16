import { chakra, type HTMLChakraProps } from "@chakra-ui/react";

type BrandMarkProps = HTMLChakraProps<"svg"> & {
  /** Rendered height in pixels; width scales from the wordmark aspect ratio. */
  height?: number;
};

export function BrandMark({ height = 28, ...props }: BrandMarkProps) {
  const width = Math.round((height / 28) * 72);

  return (
    <chakra.svg
      viewBox="0 0 72 28"
      width={width}
      height={height}
      role="img"
      aria-label="2bit"
      xmlns="http://www.w3.org/2000/svg"
      flexShrink={0}
      {...props}
    >
      <chakra.text
        as="text"
        x="0"
        y="22"
        fill="currentColor"
        fontFamily='ui-monospace, "SF Mono", "Cascadia Mono", "IBM Plex Mono", Menlo, monospace'
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.04em"
      >
        2bit
      </chakra.text>
    </chakra.svg>
  );
}
