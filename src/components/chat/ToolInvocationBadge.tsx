"use client";

import { Loader2 } from "lucide-react";
import type { ToolInvocation } from "ai";

interface Props {
  toolInvocation: ToolInvocation;
}

function basename(path: string): string {
  return path.split("/").at(-1) ?? path;
}

function getLabel(toolInvocation: ToolInvocation): string {
  const { toolName, args } = toolInvocation;

  if (toolName === "str_replace_editor") {
    const command = (args as { command?: string; path?: string }).command;
    const path = (args as { command?: string; path?: string }).path;
    if (!command || !path) return toolName;
    const file = basename(path);
    switch (command) {
      case "create": return `Creating ${file}`;
      case "str_replace": return `Editing ${file}`;
      case "insert": return `Editing ${file}`;
      case "view": return `Viewing ${file}`;
      case "undo_edit": return `Undoing edit in ${file}`;
      default: return toolName;
    }
  }

  if (toolName === "file_manager") {
    const command = (args as { command?: string; path?: string; new_path?: string }).command;
    const path = (args as { command?: string; path?: string; new_path?: string }).path;
    const newPath = (args as { command?: string; path?: string; new_path?: string }).new_path;
    if (!command || !path) return toolName;
    const file = basename(path);
    switch (command) {
      case "delete": return `Deleting ${file}`;
      case "rename": return `Renaming ${file} → ${newPath ? basename(newPath) : ""}`;
      default: return toolName;
    }
  }

  return toolName;
}

export function ToolInvocationBadge({ toolInvocation }: Props) {
  const done = toolInvocation.state === "result" && toolInvocation.result;
  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{getLabel(toolInvocation)}</span>
    </div>
  );
}
