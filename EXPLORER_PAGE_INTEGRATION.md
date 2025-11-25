# Explorer Page Integration

## Overview
The explorer page (`/random/explorer`) now fetches real-time randomness request data directly from the SERV.random server, eliminating duplicate contract queries and providing a single source of truth.

## Architecture

### Data Flow
```
Explorer Page → serv-random server → Contracts (Base/Avalanche/Polygon)
```

Instead of:
```
Explorer Page → Next.js API → Contracts (duplicate queries)
```

## Server Endpoint

### New Endpoint: `/api/requests`

**Location**: `serv-random/server.js`

**Method**: `GET`

**Rate Limited**: Yes (uses `statusRateLimit`)

**Query Parameters**:
- `network` (optional): Filter by network (`base`, `avalanche`, `polygon`, or `all`)
  - Default: Returns all networks

**Response**:
```json
{
  "success": true,
  "requests": [
    {
      "requestId": "12345678901234567890",
      "requester": "0x...",
      "feeAmount": "1000000000000000000",
      "timestamp": 1700000000000,
      "fulfilled": true,
      "randomnessValue": "0x...",
      "network": "base"
    }
  ],
  "total": 50,
  "network": "base"
}
```

**Implementation**:
- Uses existing `getFeeRequests()` helper method
- Queries contracts for both pending and fulfilled requests
- Returns up to 100 most recent requests per network
- Handles chain-aware request IDs correctly
- Includes both pending (from queue/Map) and fulfilled (from contracts) requests

## Frontend Configuration

### Environment Variable
```bash
NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL=https://serv-random-production.up.railway.app/api/requests
```

**Default**: If not set, defaults to `https://serv-random-production.up.railway.app/api/requests`

### Configuration Location
`serv-website/src/config/site.ts`:
```typescript
servRandomRequestsUrl: process.env.NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL || "https://serv-random-production.up.railway.app/api/requests"
```

## Explorer Page Features

### Real-Time Data
- Fetches requests from serv-random server
- Auto-refreshes every 30 seconds
- Shows last update timestamp
- Loading states during fetch
- Error handling with clear messages

### Display Sections
1. **Network Selector**: Filter by Base, Avalanche, or Polygon
2. **Search Bar**: Search by Request ID, Address, or Randomness value
3. **Stats Summary**: Total requests, pending, fulfilled, success rate
4. **Requests Table**: 
   - All Requests tab
   - Pending tab (filtered)
   - Fulfilled tab (filtered)
5. **Request Details**: Click "View" to see full request information

### Table Columns
- Request ID (truncated)
- Requester (truncated address)
- Network (badge)
- Status (Pending/Fulfilled badge)
- Fee Paid (SRAND amount)
- Timestamp (formatted date/time)
- Randomness (truncated hash, if fulfilled)
- Actions (View button)

## Benefits

### Single Source of Truth
- All request data comes from serv-random server
- No duplicate contract queries
- Consistent data across all pages

### Performance
- Server already queries contracts for status page
- Reuses existing `getFeeRequests()` method
- No additional RPC calls from frontend

### Maintainability
- One place to update request query logic
- Changes to contract structure only need server updates
- Easier to add caching/optimization

### User Experience
- Real-time data from production server
- Fast loading (server-side querying)
- Reliable error handling

## Testing

### Local Testing
1. Ensure serv-random server is running
2. Set `NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL` in `.env.local`:
   ```bash
   NEXT_PUBLIC_SERV_RANDOM_REQUESTS_URL=http://localhost:3001/api/requests
   ```
3. Run `yarn dev` in serv-website
4. Navigate to `/random/explorer`
5. Verify requests load and refresh automatically

### Production Testing
1. Verify environment variable is set in deployment platform
2. Visit `/random/explorer` page
3. Check browser console for any errors
4. Verify data refreshes every 30 seconds
5. Test network filter dropdown
6. Test search functionality

## Troubleshooting

### No Requests Showing
1. Check serv-random server is running and accessible
2. Verify endpoint is working: `curl https://serv-random-production.up.railway.app/api/requests`
3. Check browser console for CORS errors
4. Verify environment variable is set correctly

### CORS Issues
- Ensure serv-random server has CORS configured for your domain
- Check `ALLOWED_ORIGINS` environment variable on server

### Slow Loading
- Server queries contracts on-demand
- First request may be slower (contract queries)
- Subsequent requests may be faster if server caches results
- Consider adding caching layer if needed

### Network Filter Not Working
- Verify network parameter is being sent correctly
- Check server logs for query parameter handling
- Ensure network name matches server expectations (lowercase)

## Future Enhancements

- [ ] Add pagination for large request lists
- [ ] Add request details page (`/random/explorer/request/:id`)
- [ ] Add export functionality (CSV/JSON)
- [ ] Add filtering by date range
- [ ] Add sorting options (by date, fee, status)
- [ ] Add request statistics charts
- [ ] Add real-time updates via WebSocket (optional)

