const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface BusinessHours {
  start: string;
  end: string;
}

export interface BusinessSettings {
  businessName: string;
  phone: string;
  email: string;
  businessHours: BusinessHours;
  maxBookingsPerUser?: number;
  defaultDuration?: string;
  advanceBookingLimit?: number;
}

export interface UpdateBusinessSettings {
  businessName?: string;
  phone?: string;
  email?: string;
  businessHours?: BusinessHours;
  maxBookingsPerUser?: number;
  defaultDuration?: string;
  advanceBookingLimit?: number;
}

export const settingsApi = {
  async getBusinessSettings(): Promise<BusinessSettings> {
    const response = await fetch(`${API_BASE_URL}/settings/business`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Settings not found');
      }
      throw new Error(`Failed to fetch business settings: ${response.statusText}`);
    }

    return response.json();
  },

  async createBusinessSettings(settings: BusinessSettings): Promise<BusinessSettings> {
    const response = await fetch(`${API_BASE_URL}/settings/business`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to create business settings: ${response.statusText}`);
    }

    return response.json();
  },

  async updateBusinessSettings(settings: UpdateBusinessSettings): Promise<BusinessSettings> {
    const response = await fetch(`${API_BASE_URL}/settings/business`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    });

    if (!response.ok) {
      throw new Error(`Failed to update business settings: ${response.statusText}`);
    }

    return response.json();
  },
};