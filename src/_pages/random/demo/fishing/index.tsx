"use client";

import { FishingGameDemo } from "@components/random/FishingGameDemo";
import { GamePageLayout } from "@components/random/GamePageLayout";
import { PlaytestModeProvider } from "@contexts/PlaytestModeContext";
import { WalletProvider } from "@contexts/WalletContext";

export default function FishingGamePage() {
  return (
    <WalletProvider>
      <PlaytestModeProvider>
        <GamePageLayout currentGame="fishing" contractKey="fishingGame">
              <FishingGameDemo />
        </GamePageLayout>
      </PlaytestModeProvider>
    </WalletProvider>
  );
}

