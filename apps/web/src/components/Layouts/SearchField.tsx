'use client';

import useDebounce from '@/hooks/useDebounce';
import kyInstance from '@/lib/ky';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SearchSuggestion } from '@zephyr/db';
import { Input } from '@zephyr/ui/shadui/input';
import { AnimatePresence, motion } from 'framer-motion';
import { HashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import { SearchCommandList } from '../Search/SearchCommandList';
import { searchMutations } from '../Search/mutations';

export default function SearchField() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const debouncedInput = useDebounce(input, 300);

  const { data: suggestions } = useQuery({
    queryKey: ['search-suggestions', debouncedInput],
    // biome-ignore lint/suspicious/useAwait: This is a valid use case for useQuery
    queryFn: async () => {
      if (!debouncedInput) {
        return [];
      }
      return kyInstance
        .get('/api/search', {
          searchParams: { q: debouncedInput, type: 'suggestions' },
        })
        .json<SearchSuggestion[]>();
    },
    enabled: Boolean(debouncedInput),
  });

  const { data: history } = useQuery({
    queryKey: ['search-history'],
    queryFn: async () =>
      kyInstance
        .get('/api/search', { searchParams: { type: 'history' } })
        .json<string[]>(),
    enabled: open,
  });

  const searchMutation = useMutation({
    mutationFn: searchMutations.addSearch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: searchMutations.clearHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });

  const removeHistoryItemMutation = useMutation({
    mutationFn: searchMutations.removeHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-history'] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        commandRef.current &&
        !commandRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      return;
    }
    setOpen(false);
    searchMutation.mutate(searchQuery.trim());
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(input);
  };

  const placeholders = [
    "Type a thought… maybe it's brilliant, maybe it's coffee.",
    'Find posts, people, and probably your next obsession.',
    'Ask me anything… except my browser history.',
    'Searching is caring. Start caring loudly.',
    'What’s on your mind? Don’t say ‘nothing’.',
    'Discover whispers, rants, and everything in between.',
    'Pro tip: type faster, look smarter.',
    'Find the needle. Ignore the haystack.',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => {
        let next = prev;
        while (next === prev) {
          next = Math.floor(Math.random() * placeholders.length);
        }
        return next;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <HashIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            setOpen(true);
            setIsFocused(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder=""
          className="rounded-xl bg-muted pl-9 outline-none ring-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
          aria-label="Search"
        />

        {!input && !isFocused && (
          <div className="pointer-events-none absolute inset-0 flex items-center pl-9">
            <div className="relative h-4 overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={placeholderIndex}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="block w-full truncate pr-2 text-muted-foreground text-xs"
                >
                  {placeholders[placeholderIndex]}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
        )}
      </form>

      {open && (input || (history && history.length > 0)) && (
        <div ref={commandRef} className="absolute top-full z-50 mt-2 w-full">
          <SearchCommandList
            input={input}
            suggestions={suggestions}
            history={history}
            onSelectAction={(value) => {
              setInput(value);
              handleSearch(value);
            }}
            onClearHistory={() => clearHistoryMutation.mutate()}
            onRemoveHistoryItem={(query) =>
              removeHistoryItemMutation.mutate(query)
            }
          />
        </div>
      )}
    </div>
  );
}
