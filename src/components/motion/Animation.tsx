import { useInView } from "framer-motion";
import { FC, PropsWithChildren, useRef } from 'react';

type SlideDirectionX = "from-left-to-right" | "from-right-to-left"
interface SlideInProps extends PropsWithChildren {
    direction: SlideDirectionX
}

export const SlideIn: FC<SlideInProps> = ({ children, direction }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });
    const transform = isInView
        ? 'none'
        : direction === 'from-left-to-right'
            ? 'translateX(-200px)'
            : 'translateX(200px)';

    return (
        <div ref={ref}>
            <div
                style={{
                    transform: transform,
                    opacity: isInView ? 1 : 0,
                    transition: 'all 0.9s ease-in-out'
                }}
            >
                {children}
            </div>
        </div>
    );
};

type SlideDirectionY = "from-top-to-bottom" | "from-bottom-to-top"
interface FadeInProps extends PropsWithChildren {
    direction: SlideDirectionY
}
export const FadeIn: FC<FadeInProps> = (props) => {
    const { children, direction } = props
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });
    const transform = isInView
        ? 'none'
        : direction === "from-top-to-bottom"
            ? 'translateY(-100px)'
            : 'translateY(100px)';

    return (
        <div ref={ref}>
            <div
                style={{
                    transform: transform,
                    opacity: isInView ? 1 : 0,
                    transition: 'all 0.9s ease-in-out'
                }}
            >
                {children}
            </div>
        </div>
    );
};


