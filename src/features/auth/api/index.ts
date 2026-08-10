//endpoint for login
import { api } from "@/api/client";

export async function login(
  username: string,
  password: string,
): Promise<unknown> {
  const res = await api.post<unknown>("/login", { username, password });
  return res.data;
}
