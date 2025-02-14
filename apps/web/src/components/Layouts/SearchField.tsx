'use client';

import useDebounce from '@/hooks/useDebounce';
import kyInstance from '@/lib/ky';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { SearchSuggestion } from '@zephyr/db';
import { SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SearchCommandList } from '../Search/SearchCommandList';
import { searchMutations } from '../Search/mutations';
import { Input } from '../ui/input';

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
    queryFn: async () => {
      if (!debouncedInput) return [];
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
    if (!searchQuery.trim()) return;
    setOpen(false);
    searchMutation.mutate(searchQuery.trim());
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch(input);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={handleSubmit} className="relative">
        <SearchIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="rounded-full bg-muted pl-9"
          autoComplete="off"
        />
      </form>

      {open && (input || (history && history.length > 0)) && (
        <div ref={commandRef} className="absolute top-full z-50 mt-2 w-full">
          <SearchCommandList
            input={input}
            suggestions={suggestions}
            history={history}
            onSelect={(value) => {
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
