# Peak Pricing Display Fix

## Problem
The backend was correctly returning peak pricing information (`isPeakTime: true` and `price: 500`), but the frontend was not displaying the updated prices. Instead, it was showing the default court price for all time slots.

## Root Cause
In the `add-booking-modal.tsx` file, the `generateTimeSlots` function was ignoring the `price` and `isPeakTime` fields from the API response and instead using `court.pricePerHour` for all slots.

```typescript
// Problematic code:
slots.push({
  id: `slot-${index + 1}`,
  startTime: slot.startTime,
  endTime: slot.endTime,
  price: court.pricePerHour, // ❌ Always using court price
  status: slot.isAvailable ? "Available" : "Booked"
})
```

## Solution
Updated the frontend to use the pricing information from the API response:

### 1. Updated Slot Processing
```typescript
// Fixed code:
slots.push({
  id: `slot-${index + 1}`,
  startTime: slot.startTime,
  endTime: slot.endTime,
  price: slot.price || court.pricePerHour, // ✅ Use API price if available
  status: slot.isAvailable ? "Available" : "Booked",
  isPeakTime: slot.isPeakTime || false // ✅ Include peak time info
})
```

### 2. Updated TypeScript Types
- Updated the `TimeSlot` interface to include `isPeakTime?: boolean`
- Updated the `getAvailableSlots` API function return type to include `price?: number` and `isPeakTime?: boolean`

### 3. Enhanced UI Display
- Added visual indicators for peak time slots:
  - Orange "Peak" badge on peak time slots
  - Orange border styling for peak time slots
  - "(Peak)" text indicator next to the price
  - Different hover colors for peak vs regular slots

### 4. Added Debug Logging
- Added console logs to help verify the API response and slot processing

## Files Changed
1. `components/add-booking-modal.tsx` - Main fix for slot processing and UI display
2. `lib/api/courts.ts` - Updated return type for `getAvailableSlots`
3. `components/__tests__/peak-pricing-integration.test.tsx` - Added tests to verify the fix

## Testing
The fix includes:
- Proper handling of peak pricing from API response
- Fallback to court default price when API doesn't provide pricing
- Visual indicators for peak time slots
- Backward compatibility with existing API responses

## Expected Behavior
Now when the backend returns:
```json
{
  "startTime": "10:00",
  "endTime": "12:00", 
  "isAvailable": true,
  "price": 500,
  "isPeakTime": true
}
```

The frontend will:
- Display "PKR 500" as the price (instead of the default court price)
- Show a "Peak" badge on the time slot
- Add "(Peak)" text next to the price
- Apply orange styling to indicate peak time
- Use the correct price in total calculations