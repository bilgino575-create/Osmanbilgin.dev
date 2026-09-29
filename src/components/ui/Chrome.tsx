"use client";

import ScrollDriver from "./ScrollDriver";
import ExperienceLoader from "./ExperienceLoader";
import CommandPalette from "./CommandPalette";
import DebugHud from "./DebugHud";
import SoundToggle from "./SoundToggle";
import Cursor from "./Cursor";
import BootOverlay from "./BootOverlay";
import Rail from "./Rail";

/** Everything client-side that sits around the document. */
export default function Chrome() {
  return (
    <>
      <ScrollDriver />
      <ExperienceLoader />
      <Rail />
      <BootOverlay />
      <CommandPalette />
      <DebugHud />
      <SoundToggle />
      <Cursor />
    </>
  );
}
