> _**Observation:**_
> _You will need to replace "any"/"Any" with the correct names when writing the files._

## Data-fetching hook: `hooks/use-any-list.hook.ts`
```ts
import { useState, useEffect, useCallback } from "react";
import { anyService } from "@/services/any.service";
import { IAnyType } from "@/types/any.types";

interface UseAnyListParams {
  page: number;
  size: number;
  searchByText?: string;
}

interface UseAnyListResult {
  items: IAnyType[];
  totalItems: number;
  hasNextPage: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function useAnyList(params: UseAnyListParams): UseAnyListResult {
  const [items, setItems] = useState<IAnyType[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await anyService.getAll(params);
      setItems(result.anys);
      setTotalItems(result.total_anys);
      setHasNextPage(result.hasNextPage);
    } catch {
      setError("Erro ao carregar dados.");
    } finally {
      setIsLoading(false);
    }
  }, [params.page, params.size, params.searchByText]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { items, totalItems, hasNextPage, isLoading, error, refetch: fetch };
}

export { useAnyList };
```

## Form submission hook: `hooks/use-create-any.hook.ts`
```ts
import { useState } from "react";
import { anyService } from "@/services/any.service";
import { ICreateAnyInput } from "@/types/any.types";

interface UseCreateAnyResult {
  create: (input: ICreateAnyInput) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

function useCreateAny(): UseCreateAnyResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (input: ICreateAnyInput): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await anyService.create(input);
      return true;
    } catch (err: any) {
      const message = err?.response?.data?.error_message ?? "Erro ao criar.";
      setError(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { create, isLoading, error };
}

export { useCreateAny };
```

## Debounce hook (for search inputs): `hooks/use-debounce.hook.ts`
```ts
import { useState, useEffect } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export { useDebounce };
```
