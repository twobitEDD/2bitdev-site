# Status Page Integration

## Overview
The status page (`/random/status`) now fetches real-time server status data from the SERV.random production server instead of using mock data.

## Configuration

### Status URL
The status endpoint URL is configurable via environment variable:

```bash
NEXT_PUBLIC_SERV_RANDOM_STATUS_URL=https://serv-random-production.up.railway.app/status
```

**Default**: If not set, defaults to `https://serv-random-production.up.railway.app/status`

### Setting Environment Variable

#### Local Development
Create a `.env.local` file in `serv-website/`:
```bash
NEXT_PUBLIC_SERV_RANDOM_STATUS_URL=https://serv-random-production.up.railway.app/status
```

#### Production (Railway/Vercel/etc.)
Set the environment variable in your deployment platform:
- Railway: Add to environment variables
- Vercel: Add to project settings → Environment Variables
- Other: Follow platform-specific instructions

## Data Source

The status page fetches data from the `/status` endpoint of the SERV.random server, which returns JSON with:

```typescript
{
  status: string;                    // Server status
  uptime: number;                    // Uptime in milliseconds
  startTime: number;                 // Server start timestamp
  lastProcessedBlock: number;        // Last Harmony block processed
  totalProcessed: number;            // Total submissions processed
  totalSuccessful: number;           // Total successful submissions
  totalFailed: number;               // Total failed submissions
  baseLastSuccessful: number;        // Last successful Base submission
  avalancheLastSuccessful: number;  // Last successful Avalanche submission
  polygonLastSuccessful: number;    // Last successful Polygon submission
  ergoLastSuccessful: number;        // Last successful Ergo submission
  baseSuccessful: number;           // Total Base successful submissions
  avalancheSuccessful: number;      // Total Avalanche successful submissions
  polygonSuccessful: number;        // Total Polygon successful submissions
  ergoSuccessful: number;           // Total Ergo successful submissions
  baseFailedCount: number;          // Total Base failed submissions
  avalancheFailedCount: number;    // Total Avalanche failed submissions
  polygonFailedCount: number;      // Total Polygon failed submissions
  ergoFailedCount: number;         // Total Ergo failed submissions
  recentRandomness: Array<{         // Recent VRF values
    blockNumber: number;
    timestamp: number;
    vrfValue: string;
    harmonyBlockHash: string;
  }>;
  contracts: {                      // Contract addresses per chain
    base?: { address: string };
    avalanche?: { address: string };
    polygon?: { address: string };
    ergo?: { address: string };
  };
}
```

## Features

### Real-Time Updates
- Automatically refreshes every 30 seconds
- Shows last update timestamp
- Loading states during fetch
- Error handling with retry capability

### Display Sections
1. **Overall Stats**: Status, uptime, last processed block, total processed
2. **Processing Statistics**: Success/failure counts and success rate
3. **Chain Status**: Per-chain (Base, Avalanche, Polygon, Ergo) statistics
   - Contract addresses
   - Last successful block
   - Total submissions
   - Failed submissions
   - Success rate with progress bar
4. **Randomness Showcase**: Recent VRF values (if available)
5. **Info Section**: Explanation of what the data means

## Error Handling

- **Network Errors**: Displays error message with status URL
- **Invalid Response**: Shows error with details
- **Loading States**: Shows spinner while fetching
- **Empty States**: Gracefully handles missing data

## Testing

### Local Testing
1. Set `NEXT_PUBLIC_SERV_RANDOM_STATUS_URL` in `.env.local`
2. Run `yarn dev`
3. Navigate to `http://localhost:3000/random/status`
4. Verify data loads and updates every 30 seconds

### Production Testing
1. Verify environment variable is set in deployment platform
2. Visit `/random/status` page
3. Check browser console for any errors
4. Verify data refreshes automatically

## Troubleshooting

### Status Not Loading
1. Check browser console for CORS errors
2. Verify the status URL is accessible: `curl https://serv-random-production.up.railway.app/status`
3. Check environment variable is set correctly (must start with `NEXT_PUBLIC_` for client-side access)
4. Verify server is running and `/status` endpoint is working

### CORS Issues
If you see CORS errors, ensure the SERV.random server has CORS configured to allow your website domain.

### Stale Data
- Data refreshes every 30 seconds automatically
- Click refresh or wait for next auto-refresh
- Check server logs to ensure `/status` endpoint is responding

## Future Enhancements

- [ ] Add manual refresh button
- [ ] Add historical charts/graphs
- [ ] Add server comparison (if multiple servers)
- [ ] Add alerting for downtime
- [ ] Add export functionality for stats

