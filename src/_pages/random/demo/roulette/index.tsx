"use client";

import { RouletteGameDemo } from "@components/random/RouletteGameDemo";
import { GamePageLayout } from "@components/random/GamePageLayout";
import { PlaytestModeProvider } from "@contexts/PlaytestModeContext";
import { WalletProvider } from "@contexts/WalletContext";

export default function RouletteGamePage() {
  return (
    <WalletProvider>
      <PlaytestModeProvider>
        <GamePageLayout currentGame="roulette" contractKey="rouletteGame">
              <RouletteGameDemo />
        </GamePageLayout>
      </PlaytestModeProvider>
    </WalletProvider>
  );
}

