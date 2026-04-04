> _**Observation:**_
> _You will need to replace "Any" with the correct names when writing the files._

## Public page (Server Component): `app/page.tsx`
```tsx
import { Metadata } from "next";
import { AnyComponent } from "@/components/any/AnyComponent";

export const metadata: Metadata = {
  title: "Any Page Title | Products Manager",
};

export default function AnyPage() {
  return (
    <main>
      <AnyComponent />
    </main>
  );
}
```

## Protected page (Client Component with route guard): `app/(seller)/products/page.tsx`
```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { AnyComponent } from "@/components/any/AnyComponent";

export default function AnyProtectedPage() {
  const router = useRouter();
  const { accessToken, userType } = useAuthStore();

  useEffect(() => {
    if (!accessToken || userType !== "seller") {
      router.replace("/seller/login");
    }
  }, [accessToken, userType, router]);

  if (!accessToken || userType !== "seller") return null;

  return (
    <main>
      <AnyComponent />
    </main>
  );
}
```

## Page with dynamic param: `app/(seller)/products/[id]/edit/page.tsx`
```tsx
"use client";

import { useParams } from "next/navigation";

export default function AnyEditPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main>
      <AnyEditForm productId={id} />
    </main>
  );
}
```
