// Unified Court type for frontend use
export interface Court extends CourtResponseDto {
  status?: "Active" | "Inactive";
  bookingsToday?: number;
  isAvailableNow?: boolean;
  description?: string;
  image?: string;
  operatingHours?: { start: string; end: string };
  availableDays?: string[];
  slotDuration?: number;
  maxBookingsPerUserPerDay?: number;
  settings?: CourtSettings;
}

// Court Settings Types (Frontend normalized format)
export interface CourtSettings {
  advancedBookingLimit: number;
  unavailabilities: CourtUnavailability[];
  peakSchedules: PeakSchedule[];
}

// Backend response format (matches actual API response)
interface CourtSettingsResponse {
  courtId: string;
  advancedBookingLimit: number;
  unavailability: CourtUnavailability[]; // Note: singular name from backend
  peakSchedules: PeakSchedule[];
}

export interface CourtUnavailability {
  id: string;
  courtId: string;
  date: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  isRecurring: boolean;
}

export interface PeakSchedule {
  id: string;
  courtId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  price: number;
}

// DTOs for creating/updating settings
export interface CreateCourtUnavailabilityDto {
  date: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  isRecurring?: boolean;
}

export interface UpdateCourtUnavailabilityDto extends Partial<CreateCourtUnavailabilityDto> { }

export interface CreateCourtPeakScheduleDto {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  price: number;
}

export interface UpdateCourtPeakScheduleDto extends Partial<CreateCourtPeakScheduleDto> { }

export interface UpdateAdvancedBookingLimitDto {
  advancedBookingLimit: number;
}
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

export interface UpdateCourtDto extends Partial<CreateCourtDto> { }

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
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create court");
  return res.json();
}

export async function getCourts(): Promise<CourtResponseDto[]> {
  const res = await fetch(`${API_BASE}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    }
  });
  if (!res.ok) throw new Error("Failed to fetch courts");
  return res.json();
}

export async function getCourt(id: string): Promise<CourtResponseDto> {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    }

  });
  if (!res.ok) throw new Error("Failed to fetch court");
  return res.json();
}

export async function updateCourt(id: string, data: UpdateCourtDto): Promise<CourtResponseDto> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update court");
  return res.json();
}

export async function deleteCourt(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    },
  });
  if (!res.ok) throw new Error("Failed to delete court");
}

export async function getAvailabilityToday(id: string): Promise<CourtAvailabilityDto[]> {
  const res = await fetch(`${API_BASE}/availability-today/${id}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch available courts");
  return res.json();
}

export async function getAvailableSlots(courtId: string, date: string): Promise<{ startTime: string; endTime: string; isAvailable: boolean; price?: number; isPeakTime?: boolean }[]> {
  const res = await fetch(`${API_BASE}/${courtId}/available-slots/${date}`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    }
  });
  if (!res.ok) throw new Error("Failed to fetch available slots");
  return res.json();
}

// Court Settings API Functions

// Enhanced error handling utility
function handleApiError(res: Response, defaultMessage: string): Promise<never> {
  return res.text().then(errorText => {
    let errorMessage = defaultMessage;
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.message) {
        if (Array.isArray(errorData.message)) {
          errorMessage = errorData.message.join(', ');
        } else {
          errorMessage = errorData.message;
        }
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch {
      // If parsing fails, use the raw text or default message
      errorMessage = errorText || defaultMessage;
    }
    
    // Handle specific HTTP status codes
    if (res.status === 401) {
      errorMessage = "Authentication required. Please log in again.";
    } else if (res.status === 403) {
      errorMessage = "You don't have permission to perform this action.";
    } else if (res.status === 404) {
      errorMessage = "The requested resource was not found.";
    } else if (res.status === 409) {
      errorMessage = errorMessage.includes("conflict") ? errorMessage : "A conflict occurred. Please check for overlapping schedules or existing data.";
    } else if (res.status === 422) {
      errorMessage = errorMessage.includes("validation") ? errorMessage : "Invalid data provided. Please check your input.";
    } else if (res.status >= 500) {
      errorMessage = "Server error occurred. Please try again later.";
    }
    
    throw new Error(errorMessage);
  }).catch(networkError => {
    // Handle network errors (no response received)
    if (networkError instanceof Error && networkError.message.includes("Failed to fetch")) {
      throw new Error("Network error. Please check your connection and try again.");
    }
    throw networkError;
  });
}

export async function getCourtSettings(courtId: string): Promise<CourtSettings> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/settings`, {
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      }
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to fetch court settings");
    }
    
    const backendResponse: CourtSettingsResponse = await res.json();
    
    // Map the backend response to frontend format, ensuring IDs are properly handled
    // Backend should now return complete unavailabilities and peak schedules with IDs
    const normalizedSettings: CourtSettings = {
      advancedBookingLimit: backendResponse.advancedBookingLimit,
      unavailabilities: Array.isArray(backendResponse.unavailability) ? 
        backendResponse.unavailability.map((unavail) => ({
          id: unavail.id, // Backend should now return this ID
          courtId: unavail.courtId || backendResponse.courtId,
          date: unavail.date,
          startTime: unavail.startTime,
          endTime: unavail.endTime,
          reason: unavail.reason,
          isRecurring: unavail.isRecurring
        })) : [],
      peakSchedules: Array.isArray(backendResponse.peakSchedules) ? 
        backendResponse.peakSchedules.map((schedule) => ({
          id: schedule.id, // Backend should now return this ID
          courtId: schedule.courtId || backendResponse.courtId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          price: schedule.price
        })) : []
    };
    
    return normalizedSettings;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch court settings");
  }
}

export async function updateAdvancedBookingLimit(courtId: string, limit: number): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/advanced-booking-limit`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
      body: JSON.stringify({ advancedBookingLimit: limit }),
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to update advanced booking limit");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update advanced booking limit");
  }
}

// Court Unavailabilities API Functions

export async function getCourtUnavailabilities(courtId: string): Promise<CourtUnavailability[]> {
  const res = await fetch(`${API_BASE}/${courtId}/unavailabilities`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch court unavailabilities: ${errorText}`);
  }
  return res.json();
}

export async function createCourtUnavailability(courtId: string, data: CreateCourtUnavailabilityDto): Promise<CourtUnavailability> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/unavailabilities`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to create court unavailability");
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create court unavailability");
  }
}

export async function updateCourtUnavailability(courtId: string, unavailabilityId: string, data: UpdateCourtUnavailabilityDto): Promise<CourtUnavailability> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/unavailabilities/${unavailabilityId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to update court unavailability");
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update court unavailability");
  }
}

export async function deleteCourtUnavailability(courtId: string, unavailabilityId: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/unavailabilities/${unavailabilityId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to delete court unavailability");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete court unavailability");
  }
}

// Court Peak Schedules API Functions

export async function getCourtPeakSchedules(courtId: string): Promise<PeakSchedule[]> {
  const res = await fetch(`${API_BASE}/${courtId}/peak-schedules`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("access_token")}`
    }
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to fetch court peak schedules: ${errorText}`);
  }
  return res.json();
}

export async function createCourtPeakSchedule(courtId: string, data: CreateCourtPeakScheduleDto): Promise<PeakSchedule> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/peak-schedules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to create court peak schedule");
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to create court peak schedule");
  }
}

export async function updateCourtPeakSchedule(courtId: string, scheduleId: string, data: UpdateCourtPeakScheduleDto): Promise<PeakSchedule> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/peak-schedules/${scheduleId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to update court peak schedule");
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to update court peak schedule");
  }
}

export async function deleteCourtPeakSchedule(courtId: string, scheduleId: string): Promise<void> {
  try {
    const res = await fetch(`${API_BASE}/${courtId}/peak-schedules/${scheduleId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("access_token")}`
      },
    });
    
    if (!res.ok) {
      return handleApiError(res, "Failed to delete court peak schedule");
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to delete court peak schedule");
  }
}

