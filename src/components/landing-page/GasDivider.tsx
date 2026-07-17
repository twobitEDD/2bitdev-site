export type GasHue = "cyan" | "magenta" | "amber" | "sage" | "emerald";

type GasDividerProps = {
  hue?: GasHue;
};

export default function GasDivider({ hue = "cyan" }: GasDividerProps) {
  return (
    <div
      className="gas-divider"
      data-gas-hue={hue}
      aria-hidden="true"
    >
      <div className="gas-divider__layer">
        <span className="gas-divider__blob gas-divider__blob--a" />
        <span className="gas-divider__blob gas-divider__blob--b" />
        <span className="gas-divider__blob gas-divider__blob--c" />
      </div>
    </div>
  );
}
