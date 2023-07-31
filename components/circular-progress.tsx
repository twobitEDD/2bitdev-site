import {
  CircularProgress as BaseCircularProgress,
  Card,
  CardBody,
} from "@nextui-org/react";

export function CircularProgress({ value }: { value: number }) {
  return (
    <Card className="w-[240px] h-[240px] bg-gradient-to-br from-primary-500 to-primary-800">
      <CardBody className="items-center justify-center py-0">
        <BaseCircularProgress
          classNames={{
            svg: "w-36 h-36 drop-shadow-md",
            indicator: "stroke-white",
            track: "stroke-white/10",
            value: "text-3xl font-semibold text-white",
          }}
          value={value}
          strokeWidth={4}
          showValueLabel={true}
        />
      </CardBody>
    </Card>
  );
}
