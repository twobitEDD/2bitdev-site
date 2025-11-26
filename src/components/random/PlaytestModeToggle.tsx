"use client";

import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Badge,
  Text,
  useColorModeValue,
  Flex,
} from "@chakra-ui/react";
import { usePlaytestMode } from "@contexts/PlaytestModeContext";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

interface PlaytestModeToggleProps {
  compact?: boolean;
}

export function PlaytestModeToggle({ compact = false }: PlaytestModeToggleProps = {}) {
  const { isPlaytestMode, togglePlaytestMode } = usePlaytestMode();
  const [particles, setParticles] = useState<Particle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const bgColor = useColorModeValue("yellow.50", "yellow.900");
  const borderColor = useColorModeValue("yellow.200", "yellow.700");
  const textColor = useColorModeValue("yellow.800", "yellow.200");

  // Create particles when toggled on
  useEffect(() => {
    if (isPlaytestMode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const newParticles: Particle[] = Array.from({ length: 50 }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 3;
        const colors = ["#FBBF24", "#F59E0B", "#D97706", "#FCD34D", "#FDE047"];
        
        return {
          x: centerX,
          y: centerY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          maxLife: 60 + Math.random() * 40,
          size: 2 + Math.random() * 3,
          color: colors[Math.floor(Math.random() * colors.length)],
        };
      });
      
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [isPlaytestMode]);

  // Animate particles
  useEffect(() => {
    if (!isPlaytestMode) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas || !containerRef.current) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const updateCanvasSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    updateCanvasSize();

    let localParticles = [...particles];
    let animationId: number;

    const animate = () => {
      if (!containerRef.current) return;
      
      updateCanvasSize();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      localParticles = localParticles
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          life: p.life + 1,
          vy: p.vy + 0.1, // Gravity
        }))
        .filter((p) => p.life < p.maxLife);

      // Draw particles
      localParticles.forEach((p) => {
        const alpha = 1 - p.life / p.maxLife;
        const hexAlpha = Math.floor(alpha * 255).toString(16).padStart(2, "0");
        ctx.fillStyle = p.color + hexAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (localParticles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        setParticles([]);
      }
    };

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isPlaytestMode, particles]);

  // Compact version for header
  if (compact) {
    return (
      <Flex align="center" gap={2}>
        <Button
          onClick={togglePlaytestMode}
          colorScheme={isPlaytestMode ? "yellow" : "gray"}
          size="sm"
          variant={isPlaytestMode ? "solid" : "outline"}
          fontWeight="bold"
          _hover={{
            transform: "scale(1.05)",
          }}
          transition="all 0.2s"
        >
          {isPlaytestMode ? "🎮 PLAYTEST ON" : "🎮 PLAYTEST"}
        </Button>
        {isPlaytestMode && (
          <Badge colorScheme="yellow" fontSize="xs" px={2} py={0.5}>
            ACTIVE
          </Badge>
        )}
      </Flex>
    );
  }

  // Full version with particles
  return (
    <Box
      ref={containerRef}
      position="relative"
      w="100%"
      mb={4}
      p={4}
      bg={isPlaytestMode ? bgColor : "transparent"}
      borderRadius="lg"
      borderWidth={isPlaytestMode ? "2px" : "0px"}
      borderColor={borderColor}
      borderStyle="dashed"
      transition="all 0.3s"
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <Flex
        position="relative"
        zIndex={2}
        align="center"
        justify="space-between"
        gap={4}
        flexWrap="wrap"
      >
        <Flex align="center" gap={3}>
          <Button
            onClick={togglePlaytestMode}
            colorScheme={isPlaytestMode ? "yellow" : "gray"}
            size="md"
            variant={isPlaytestMode ? "solid" : "outline"}
            fontWeight="bold"
            _hover={{
              transform: "scale(1.05)",
            }}
            transition="all 0.2s"
          >
            {isPlaytestMode ? "🎮 PLAYTEST MODE ON" : "🎮 PLAYTEST MODE"}
          </Button>
          {isPlaytestMode && (
            <Badge colorScheme="yellow" fontSize="md" px={3} py={1}>
              ACTIVE
            </Badge>
          )}
        </Flex>
        {isPlaytestMode && (
          <Text fontSize="sm" color={textColor} fontWeight="medium">
            No wallet or funds required - All interactions use mock contracts
          </Text>
        )}
      </Flex>
    </Box>
  );
}

