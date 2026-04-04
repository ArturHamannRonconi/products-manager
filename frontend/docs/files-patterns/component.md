> _**Observation:**_
> _You will need to replace "Any" with the correct names when writing the files._

## Client component with props: `components/any/AnyComponent.tsx`
```tsx
"use client";

interface AnyComponentProps {
  label: string;
  onSubmit: (value: string) => void;
}

function AnyComponent({ label, onSubmit }: AnyComponentProps) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <span className="text-sm font-medium">{label}</span>
      {/* component content */}
    </div>
  );
}

export { AnyComponent };
```

## Server component (no "use client"): `components/any/AnyStaticComponent.tsx`
```tsx
interface AnyStaticComponentProps {
  title: string;
}

function AnyStaticComponent({ title }: AnyStaticComponentProps) {
  return (
    <section className="container mx-auto">
      <h1 className="text-2xl font-bold">{title}</h1>
    </section>
  );
}

export { AnyStaticComponent };
```

## Component that reads from Zustand store: `components/any/AnyStoreComponent.tsx`
```tsx
"use client";

import { useAnyStore } from "@/store/any.store";

function AnyStoreComponent() {
  const { anys, removeAny } = useAnyStore();

  return (
    <ul>
      {anys.map((item) => (
        <li key={item.id}>
          {item.name}
          <button onClick={() => removeAny(item.id)}>Remover</button>
        </li>
      ))}
    </ul>
  );
}

export { AnyStoreComponent };
```
