const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3001";

export interface LoginPayload {
  phone: string;
  password: string;
}

export async function login(payload: LoginPayload) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}