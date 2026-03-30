import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocation } from "ai";

afterEach(() => {
  cleanup();
});

function makeInvocation(overrides: Partial<ToolInvocation> & Pick<ToolInvocation, "toolName" | "args">): ToolInvocation {
  return {
    toolCallId: "test-id",
    state: "result",
    result: "ok",
    ...overrides,
  } as ToolInvocation;
}

// str_replace_editor commands
test("str_replace_editor create shows Creating label", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "str_replace_editor", args: { command: "create", path: "src/App.tsx" } })} />);
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

test("str_replace_editor str_replace shows Editing label", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "str_replace_editor", args: { command: "str_replace", path: "src/App.tsx" } })} />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor insert shows Editing label", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "str_replace_editor", args: { command: "insert", path: "src/App.tsx" } })} />);
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("str_replace_editor view shows Viewing label", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "str_replace_editor", args: { command: "view", path: "src/App.tsx" } })} />);
  expect(screen.getByText("Viewing App.tsx")).toBeDefined();
});

test("str_replace_editor undo_edit shows Undoing edit label", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "str_replace_editor", args: { command: "undo_edit", path: "src/App.tsx" } })} />);
  expect(screen.getByText("Undoing edit in App.tsx")).toBeDefined();
});

// file_manager commands
test("file_manager delete shows Deleting label", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "file_manager", args: { command: "delete", path: "src/App.tsx" } })} />);
  expect(screen.getByText("Deleting App.tsx")).toBeDefined();
});

test("file_manager rename shows Renaming label with both filenames", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "file_manager", args: { command: "rename", path: "src/App.tsx", new_path: "src/Main.tsx" } })} />);
  expect(screen.getByText("Renaming App.tsx → Main.tsx")).toBeDefined();
});

// Basename extraction
test("extracts basename from nested path", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "str_replace_editor", args: { command: "create", path: "src/components/App.tsx" } })} />);
  expect(screen.getByText("Creating App.tsx")).toBeDefined();
});

// Spinner vs green dot
test("shows spinner when state is not result", () => {
  const invocation = {
    toolCallId: "test-id",
    toolName: "str_replace_editor",
    args: { command: "create", path: "App.tsx" },
    state: "call",
  } as unknown as ToolInvocation;
  const { container } = render(<ToolInvocationBadge toolInvocation={invocation} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when state is result with result value", () => {
  const { container } = render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "str_replace_editor", args: { command: "create", path: "App.tsx" } })} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

// Unknown tool fallback
test("falls back to toolName for unknown tool", () => {
  render(<ToolInvocationBadge toolInvocation={makeInvocation({ toolName: "unknown_tool", args: {} })} />);
  expect(screen.getByText("unknown_tool")).toBeDefined();
});
