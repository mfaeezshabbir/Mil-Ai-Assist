"use client";

import React from "react";
import { Layers, Waypoints, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MAP_STYLES } from "@/components/map-view";
import SysLogo from "../Logo";

type Props = {
  currentTime: string;
  turn: number;
  friendCount: number;
  hostileCount: number;
  onChangeMapStyle: (style: string) => void;
  onOpenList: () => void;
  onResolveTurn: () => void;
};

function Logo() {
  return (
    <div className="flex items-center">
      <SysLogo />
      <h1 className="text-lg font-display font-bold uppercase tracking-wider hidden md:inline">
        MilAIAssist
      </h1>
    </div>
  );
}

export default function PlannerHeader({
  currentTime,
  turn,
  friendCount,
  hostileCount,
  onChangeMapStyle,
  onOpenList,
  onResolveTurn,
}: Props) {
  return (
    <header className="border-b border-tactical border-primary/50 bg-background/90 backdrop-blur-sm shadow-tactical z-10 flex flex-row items-center justify-between px-4 py-2 gap-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Logo />
        <div className="hidden md:flex items-center">
          <Separator orientation="vertical" className="h-6 mx-3" />
          <Badge
            variant="outline"
            className="font-mono text-xs tracking-wide px-2 py-0 border-primary/30"
          >
            ARMY SIMULATOR
          </Badge>
        </div>
        <Badge
          variant="outline"
          className="font-mono text-xs px-2 py-0.5 border-primary/40 bg-primary/5 text-primary"
        >
          TURN {turn}
        </Badge>
        <span className="hidden sm:inline font-mono text-xs text-muted-foreground">
          F {friendCount} / H {hostileCount}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Badge
          variant="outline"
          className="rounded-sm hidden lg:flex items-center font-mono text-xs px-3 py-1 border-primary/40 bg-primary/5 text-primary"
          title="Local clock at map center"
        >
          {currentTime}
        </Badge>
        <Button
          size="sm"
          className="font-mono text-xs"
          onClick={onResolveTurn}
        >
          <Play className="h-3 w-3 mr-1" />
          RESOLVE TURN
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="font-mono text-xs border-primary/30"
            >
              <Layers className="h-3 w-3 mr-1" />
              <span className="hidden md:inline">MAP</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onChangeMapStyle(MAP_STYLES.TACTICAL)}
            >
              Tactical (Dark)
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onChangeMapStyle(MAP_STYLES.SATELLITE)}
            >
              Satellite
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onChangeMapStyle(MAP_STYLES.TERRAIN)}
            >
              Terrain
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onChangeMapStyle(MAP_STYLES.STREETS)}
            >
              Streets
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs border-primary/30"
          onClick={onOpenList}
        >
          <Waypoints className="h-3 w-3 mr-1" />
          <span className="hidden md:inline">FORCES</span>
        </Button>
      </div>
    </header>
  );
}
