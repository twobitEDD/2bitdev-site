"use client";

import { useState, useEffect, useRef } from "react";
import { Box, Text } from "@chakra-ui/react";

interface SpinningRouletteWheelProps {
  result?: number;
  isSpinning: boolean;
  onSpinComplete?: () => void;
}

export function SpinningRouletteWheel({
  result,
  isSpinning,
  onSpinComplete,
}: SpinningRouletteWheelProps) {
  const [rotation, setRotation] = useState(0);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationFrameRef = useRef<number | null>(null);
  const hasSpunRef = useRef(false);

  // European roulette numbers in order
  const wheelNumbers = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1,
    20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];

  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

  const getNumberColor = (num: number): { bg: string; text: string } => {
    if (num === 0) return { bg: "#00AA00", text: "#FFFFFF" };
    if (redNumbers.includes(num)) return { bg: "#DC143C", text: "#FFFFFF" };
    return { bg: "#000000", text: "#FFFFFF" };
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (result !== undefined && result !== 255) {
      hasSpunRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  useEffect(() => {
    if (isSpinning && result !== undefined && result !== 255 && !hasSpunRef.current) {
      hasSpunRef.current = true;
      setIsAnimating(true);
      
      const resultIndex = wheelNumbers.indexOf(result);
      if (resultIndex === -1) {
        setIsAnimating(false);
        return;
      }

      // Pointer is at top (0 degrees)
      // Each segment is 360/37 degrees wide
      const segmentAngle = 360 / wheelNumbers.length;
      
      // Segment center angle from top in standard coordinates (0-360)
      const segmentCenterAngle = (resultIndex * segmentAngle) + (segmentAngle / 2);
      
      // To align segment center with top (0 degrees), rotate by: 360 - segmentCenterAngle
      // This rotates the segment center to align with 0 degrees (top)
      const targetAngle = 360 - segmentCenterAngle;
      
      const baseRotation = 360 * 8;
      const finalRotation = baseRotation + targetAngle;

      const duration = 4000;
      const startRotation = rotation;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentRotation = startRotation + (finalRotation - startRotation) * easeOut;
        setRotation(currentRotation);

        // Calculate which number is at the pointer (top = 0 degrees)
        // Current wheel rotation, pointer at 0 degrees
        const pointerAngle = 0;
        const wheelAngle = (pointerAngle - currentRotation) % 360;
        const normalizedAngle = wheelAngle < 0 ? wheelAngle + 360 : wheelAngle;
        // Convert to SVG coords (add 90 to account for SVG starting at -90)
        const svgAngle = (normalizedAngle + 90) % 360;
        const currentIndex = Math.floor((svgAngle / 360) * wheelNumbers.length) % wheelNumbers.length;
        setCurrentNumber(wheelNumbers[currentIndex]);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Set final rotation first, then disable animation to prevent twitch
          // Use setTimeout to ensure rotation is set before disabling animation state
          setRotation(finalRotation);
          setTimeout(() => {
            setIsAnimating(false);
            setCurrentNumber(result);
            if (onSpinComplete) {
              setTimeout(onSpinComplete, 500);
            }
          }, 0);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    } else if (!isSpinning && result !== undefined && result !== 255 && !isAnimating) {
      const resultIndex = wheelNumbers.indexOf(result);
      if (resultIndex !== -1) {
        const segmentAngle = 360 / wheelNumbers.length;
        const segmentCenterAngle = (resultIndex * segmentAngle) + (segmentAngle / 2);
        const targetAngle = 360 - segmentCenterAngle;
        // Normalize to prevent twitch
        const normalizedRotation = ((targetAngle % 360) + 360) % 360;
        setRotation(normalizedRotation);
        setCurrentNumber(result);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSpinning, result, isAnimating, rotation, onSpinComplete]);

  return (
    <Box position="relative" w="400px" h="400px" mx="auto" mb={4}>
      {/* Background circle - fixed, centered */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="400px"
        h="400px"
        borderRadius="full"
        border="6px solid"
        borderColor="gray.700"
        bg="gray.800"
        zIndex={1}
      />

      {/* Pointer at top - fixed */}
      <Box
        position="absolute"
        top="-5px"
        left="50%"
        transform="translateX(-50%)"
        w="0"
        h="0"
        borderLeft="15px solid transparent"
        borderRight="15px solid transparent"
        borderTop="30px solid"
        borderTopColor="blue.500"
        zIndex={30}
      />

      {/* Center circle - fixed */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="100px"
        h="100px"
        borderRadius="full"
        bg="white"
        border="4px solid"
        borderColor="gray.600"
        display="flex"
        alignItems="center"
        justifyContent="center"
        zIndex={25}
        boxShadow="0 0 15px rgba(0,0,0,0.8)"
      >
        <Text color="gray.800" fontWeight="extrabold" fontSize="28px">
          {currentNumber !== null ? currentNumber : "?"}
        </Text>
      </Box>

      {/* Wheel - rotates, centered on background */}
      <Box
        position="absolute"
        left="50%"
        top="50%"
        transform="translate(-50%, -50%)"
        w="400px"
        h="400px"
        borderRadius="full"
        overflow="hidden"
        style={{
          transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
          transformOrigin: "center center",
          transition: isAnimating ? "none" : "none", // Disable transition to prevent twitch
        }}
        zIndex={10}
      >
        <svg width="400" height="400" viewBox="0 0 400 400">
          {wheelNumbers.map((num, index) => {
            const anglePerSegment = 360 / wheelNumbers.length;
            const startAngle = (index * anglePerSegment - 90) * (Math.PI / 180);
            const endAngle = ((index + 1) * anglePerSegment - 90) * (Math.PI / 180);
            
            const colors = getNumberColor(num);
            const centerX = 200;
            const centerY = 200;
            const radius = 180;

            const x1 = centerX + Math.cos(startAngle) * radius;
            const y1 = centerY + Math.sin(startAngle) * radius;
            const x2 = centerX + Math.cos(endAngle) * radius;
            const y2 = centerY + Math.sin(endAngle) * radius;

            const midAngle = (startAngle + endAngle) / 2;
            const textRadius = 165; // Closer to exterior edge
            const textX = centerX + Math.cos(midAngle) * textRadius;
            const textY = centerY + Math.sin(midAngle) * textRadius;
            
            // Convert midAngle from radians to degrees, then rotate text to point toward center
            // midAngle is in radians, convert to degrees and add 90 to make text point toward center
            // When a number is at the top (midAngle = -90°), rotation will be 0° (upright)
            const midAngleDeg = (midAngle * 180) / Math.PI;
            const textRotation = midAngleDeg + 90;

            return (
              <g key={`${num}-${index}`}>
                <path
                  d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`}
                  fill={colors.bg}
                  stroke="#333"
                  strokeWidth="1"
                />
                <text
                  x={textX}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={colors.text}
                  fontSize="20"
                  fontWeight="bold"
                  transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                  style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
                >
                  {num}
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
    </Box>
  );
}
