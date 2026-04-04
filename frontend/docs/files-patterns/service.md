> _**Observation:**_
> _You will need to replace "any"/"Any" with the correct names when writing the files._

## api.ts — Shared Axios instance with interceptors: `services/api.ts`
```ts
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // sends httpOnly refresh token cookie automatically
});

// Request interceptor: attach access token to every request
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor: handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const { userType, setAccessToken, clear } = useAuthStore.getState();
      const refreshEndpoint =
        userType === "seller" ? "/seller/refresh-token" : "/customer/refresh-token";

      try {
        const { data } = await api.post(refreshEndpoint);
        setAccessToken(data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        clear();
        const loginPath =
          userType === "seller" ? "/seller/login" : "/customer/login";
        window.location.href = loginPath;
      }
    }

    return Promise.reject(error);
  }
);
```

## any.service.ts — Resource service: `services/any.service.ts`
```ts
import { api } from "./api";
import { IAnyType, ICreateAnyInput, IUpdateAnyInput } from "@/types/any.types";

interface IGetAllAnysParams {
  size: number;
  page: number;
  searchByText?: string;
}

interface IGetAllAnysResponse {
  anys: IAnyType[];
  total_anys: number;
  skipped_anys: number;
  remaining_anys: number;
  hasNextPage: boolean;
}

const anyService = {
  async getAll(params: IGetAllAnysParams): Promise<IGetAllAnysResponse> {
    const { data } = await api.get<IGetAllAnysResponse>("/anys/for-sellers", {
      params,
    });
    return data;
  },

  async create(input: ICreateAnyInput): Promise<IAnyType> {
    const { data } = await api.post<{ anys: IAnyType[] }>("/anys", {
      anys: [input],
    });
    return data.anys[0];
  },

  async update(id: string, input: IUpdateAnyInput): Promise<IAnyType> {
    const { data } = await api.put<IAnyType>(`/any/${id}`, input);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/any/${id}`);
  },

  async uploadImage(id: string, file: File): Promise<IAnyType> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<IAnyType>(`/any/${id}/image`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export { anyService };
```
