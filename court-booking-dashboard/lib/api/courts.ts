// Interfaces copied from backend DTOs
export interface CourtAvailabilityDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration?: number;
  maxBookingsPerUserPerDay?: number;
}

export interface CreateCourtDto {
  name: string;
  type: string;
  description?: string;
  pricePerHour: number;
  isActive: boolean;
  imageUrl?: string;
  availability: CourtAvailabilityDto[];
}

export interface UpdateCourtDto extends Partial<CreateCourtDto> {}

export interface CourtResponseDto {
  id: string;
  name: string;
  isActive: boolean;
  availability: {
    startTime: string | null;
    endTime: string | null;
    dayOfWeek: number | null;
  }[];
  pricePerHour: number;
  type: string;
}

const API_BASE = /*process.env.NEXT_PUBLIC_API_URL+'/courts' ||*/ "http://localhost:3001/api/courts";

export async function createCourt(data: CreateCourtDto): Promise<CourtResponseDto> {
  const res = await fetch(`${API_BASE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create court");
  return res.json();
}

export async function getCourts(): Promise<CourtResponseDto[]> {
  const res = await fetch(`${API_BASE}`);
  if (!res.ok) throw new Error("Failed to fetch courts");
  return res.json();
}

export async function getCourt(id: string): Promise<CourtResponseDto> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch court");
  return res.json();
}

export async function updateCourt(id: string, data: UpdateCourtDto): Promise<CourtResponseDto> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update court");
  return res.json();
}

export async function deleteCourt(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete court");
}

export async function getAvailabilityToday(id:string): Promise<CourtAvailabilityDto[]> {
  const res = await fetch(`${API_BASE}/availability-today/${id}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to fetch available courts");
  return res.json();
}

