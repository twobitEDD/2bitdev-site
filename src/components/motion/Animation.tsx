import { useInView } from "framer-motion";
import { FC, PropsWithChildren, useEffect, useRef, useState } from "react";

type SlideDirectionY = "from-top-to-bottom" | "from-bottom-to-top";
interface FadeInProps extends PropsWithChildren {
    direction: SlideDirectionY;
}
export const FadeIn: FC<FadeInProps> = (props) => {
    const { children, direction } = props;
    const ref = useRef<HTMLDivElement>(null);
    const [mounted, setMounted] = useState(false);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        setMounted(true);
    }, []);

    const shouldAnimate = mounted && !isInView;
    const transform = shouldAnimate
        ? direction === "from-top-to-bottom"
            ? "translateY(-100px)"
            : "translateY(100px)"
        : "none";

    return (
        <div ref={ref}>
            <div
                style={{
                    transform,
                    opacity: shouldAnimate ? 0 : 1,
                    transition: mounted ? "all 0.9s ease-in-out" : "none",
                }}
            >
                {children}
            </div>
        </div>
    );
};
