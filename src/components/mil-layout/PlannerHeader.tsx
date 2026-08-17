"use client";

import React from "react";
import { Layers, Waypoints, CircleHelp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MAP_STYLES } from "@/components/map-view";
import SysLogo from "../Logo";

type Props = {
  currentTime: string;
  turn: number;
  friendCount: number;
  hostileCount: number;
  objFriend?: number;
  objHostile?: number;
  objTotal?: number;
  onChangeMapStyle: (style: string) => void;
  onOpenList: () => void;
  onOpenHelp: () => void;
};

export default function PlannerHeader({
  currentTime,
  turn,
  friendCount,
  hostileCount,
  objFriend = 0,
  objHostile = 0,
  objTotal = 0,
  onChangeMapStyle,
  onOpenList,
  onOpenHelp,
}: Props) {
  const total = Math.max(friendCount + hostileCount, 1);
  const friendPct = (friendCount / total) * 100;

  return (
    <header className="relative z-20 hud-panel border-x-0 border-t-0">
      <div className="flex items-stretch">
        <div className="flex items-center gap-3 px-4 py-2 min-w-0">
          <SysLogo />
          <div className="hidden sm:block min-w-0">
            <div className="font-display text-sm tracking-[0.2em] uppercase text-primary leading-none">
              MilAIAssist
            </div>
            <div className="font-mono text-[10px] tracking-widest text-muted-foreground mt-1 uppercase">
              Battle
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center px-5 border-l border-primary/20">
          <div>
            <div className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              TURN
            </div>
            <div className="font-display text-3xl leading-none text-secondary tabular-nums">
              {String(turn).padStart(2, "0")}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 px-4 py-2 hidden sm:flex flex-col justify-center gap-1 border-l border-primary/20">
          <div className="flex justify-between font-mono text-[10px] tracking-widest uppercase">
            <span className="text-primary">Blue {friendCount}</span>
            <span className="text-destructive">Red {hostileCount}</span>
          </div>
          <div className="h-2 w-full bg-muted overflow-hidden flex">
            <div className="h-full bg-primary" style={{ width: `${friendPct}%` }} />
            <div className="h-full flex-1 bg-destructive" />
          </div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
            {currentTime}
            {objTotal > 0
              ? ` · Objectives  Blue ${objFriend}  Red ${objHostile}  / ${objTotal}`
              : " · Issue orders, then end turn"}
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 ml-auto">
          <span className="md:hidden font-display text-xl text-secondary tabular-nums px-2">
            T{turn}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" title="Map style">
                <Layers className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="font-mono text-xs">
              <DropdownMenuItem
                onClick={() => onChangeMapStyle(MAP_STYLES.TACTICAL)}
              >
                Tactical
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
            size="icon"
            title="How to play"
            onClick={onOpenHelp}
          >
            <CircleHelp className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Force list"
            onClick={onOpenList}
          >
            <Waypoints className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
