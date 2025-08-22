"use client";

import React from "react";
import { Shield, Layers, Waypoints } from "lucide-react";
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
  onChangeMapStyle: (style: string) => void;
  onOpenList: () => void;
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

function MissionBadge() {
  return (
    <div className="hidden md:flex items-center">
      <Separator orientation="vertical" className="h-6 mx-4" />
      <Badge
        variant="outline"
        className="font-mono text-xs tracking-wide px-2 py-0 border-primary/30"
      >
        MISSION PLANNER
      </Badge>
    </div>
  );
}

function TimeBadge({ currentTime }: { currentTime: string }) {
  return (
    <Badge
      variant="outline"
      className="rounded-sm flex items-center font-mono text-xs px-3 py-1 border-primary/40 bg-primary/5 text-primary"
      title="Current Mission Time"
    >
      <span>{currentTime}</span>
    </Badge>
  );
}

function MapStyleDropdown({
  onChangeMapStyle,
}: {
  onChangeMapStyle: (style: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="font-mono text-xs border-primary/30"
        >
          <Layers className="h-3 w-3 mr-1" />
          <span className="hidden md:inline">MAP STYLE</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onChangeMapStyle(MAP_STYLES.TACTICAL)}>
          Tactical (Dark)
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onChangeMapStyle(MAP_STYLES.SATELLITE)}
        >
          Satellite
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChangeMapStyle(MAP_STYLES.TERRAIN)}>
          Terrain
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onChangeMapStyle(MAP_STYLES.STREETS)}>
          Streets
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function SymbolListButton({ onOpenList }: { onOpenList: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="font-mono text-xs border-primary/30"
      onClick={onOpenList}
    >
      <Waypoints className="h-3 w-3 mr-1" />
      <span className="hidden md:inline">SYMBOL LIST</span>
    </Button>
  );
}

export default function PlannerHeader({
  currentTime,
  onChangeMapStyle,
  onOpenList,
}: Props) {
  return (
    <header className="border-b border-tactical border-primary/50 bg-background/90 backdrop-blur-sm shadow-tactical z-10 flex flex-row items-center justify-between px-4 py-2 gap-2">
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <Logo />
        <MissionBadge />
      </div>
      <div className="flex items-center gap-2">
        <TimeBadge currentTime={currentTime} />
        <MapStyleDropdown onChangeMapStyle={onChangeMapStyle} />
        <SymbolListButton onOpenList={onOpenList} />
      </div>
    </header>
  );
}
