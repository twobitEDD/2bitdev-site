"use client";

import { EnhancedDungeonCrawlerDemo } from "@components/random/EnhancedDungeonCrawlerDemo";
import { GamePageLayout } from "@components/random/GamePageLayout";
import { PlaytestModeProvider } from "@contexts/PlaytestModeContext";
import { WalletProvider } from "@contexts/WalletContext";

export default function DungeonCrawlerPage() {
  return (
    <WalletProvider>
      <PlaytestModeProvider>
        <GamePageLayout currentGame="dungeon-crawler" contractKey="dungeonCrawler">
          <EnhancedDungeonCrawlerDemo />
        </GamePageLayout>
      </PlaytestModeProvider>
    </WalletProvider>
  );
}

