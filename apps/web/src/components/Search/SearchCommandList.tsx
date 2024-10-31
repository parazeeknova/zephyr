"use client";

import type { SearchSuggestion } from "@zephyr/db";
import { History, TrendingUp, X } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList
} from "../ui/command";

interface SearchCommandListProps {
  input: string;
  suggestions?: SearchSuggestion[];
  history?: string[];
  onSelect: (value: string) => void;
  onClearHistory?: () => void;
  onRemoveHistoryItem?: (query: string) => void;
}

export function SearchCommandList({
  input,
  suggestions,
  history,
  onSelect,
  onClearHistory,
  onRemoveHistoryItem
}: SearchCommandListProps) {
  return (
    <Command className="rounded-lg border bg-popover shadow-md">
      <CommandList>
        {!input && !suggestions?.length && !history?.length && (
          <CommandEmpty className="py-6 text-center text-sm">
            No results found.
          </CommandEmpty>
        )}

        {suggestions && suggestions.length > 0 && (
          <CommandGroup heading="Suggestions">
            {suggestions.map((suggestion) => (
              <CommandItem
                key={suggestion.query}
                value={suggestion.query}
                onSelect={onSelect}
                className="flex cursor-pointer items-center gap-2 px-4 py-2"
              >
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span>{suggestion.query}</span>
                <span className="ml-auto text-muted-foreground text-xs">
                  {suggestion.count} searches
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {!input && history && history.length > 0 && (
          <CommandGroup>
            <div className="flex items-center justify-between px-2 pb-2">
              <span className="font-medium text-sm">Recent Searches</span>
              {onClearHistory && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto px-2 py-1 text-muted-foreground text-xs hover:text-primary"
                  onClick={(e) => {
                    e.preventDefault();
                    onClearHistory();
                  }}
                >
                  Clear all
                </Button>
              )}
            </div>
            {history.map((query) => (
              <CommandItem
                key={query}
                value={query}
                onSelect={onSelect}
                className="group flex cursor-pointer items-center gap-2 px-4 py-2"
              >
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{query}</span>
                {onRemoveHistoryItem && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 opacity-0 group-hover:opacity-100"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onRemoveHistoryItem(query);
                    }}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-primary" />
                  </Button>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </Command>
  );
}
