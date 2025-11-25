# SERV.random Explorer & Educational Site Plan

## Overview
Create an educational explorer site at `random.serv.services` that acts as:
1. **Blockchain Explorer** - Browse randomness requests, fulfillments, and VRF data
2. **Server Status Dashboard** - Monitor SERV.random host servers
3. **Developer Integration Guide** - Clear documentation for integrating contracts

## Site Structure

### Main Pages

#### 1. **Home/Overview** (`/`)
- Hero section explaining SERV.random
- Key features and benefits
- Quick stats (total requests, servers online, etc.)
- Call-to-action to explore or integrate

#### 2. **Explorer** (`/explorer`)
- **Requests Tab**: List all randomness requests across networks
  - Filter by network, status (pending/fulfilled), requester
  - Show request ID, requester, fee paid, timestamp, status
  - Click to view details
- **Request Details** (`/explorer/request/:id`)
  - Full request information
  - VRF randomness value
  - Fulfillment transaction
  - Callback execution status
  - Timeline visualization
- **VRF Data Tab**: Browse VRF entries from Harmony
  - Show Harmony block number, VRF value, timestamp
  - Link to Harmony explorer
  - Show which requests used each VRF entry

#### 3. **Server Status** (`/status`)
- List all SERV.random host servers
- Server health indicators (online/offline)
- Uptime statistics
- Latest VRF submissions per server
- Network latency
- Server locations

#### 4. **Developer Guide** (`/docs`)
- **Quick Start**: Get started in 5 minutes
- **Integration Guide**: Step-by-step contract integration
- **API Reference**: Contract interfaces and functions
- **Examples**: Code examples for common use cases
- **Best Practices**: Security and gas optimization tips

#### 5. **Interactive Demo** (`/demo`)
- Live demo of FishingGame
- Step-by-step walkthrough
- Show request → fulfillment → callback flow
- Visualize VRF randomness usage

## Key Components

### 1. Request Explorer Component
```typescript
- RequestList: Table of requests with filters
- RequestCard: Individual request display
- RequestDetails: Full request information
- VRFVisualization: Show randomness value and usage
```

### 2. Server Status Component
```typescript
- ServerList: List of servers with status
- ServerCard: Individual server info
- HealthIndicator: Visual status indicator
- MetricsChart: Uptime/latency charts
```

### 3. Developer Guide Components
```typescript
- CodeBlock: Syntax-highlighted code examples
- StepByStepGuide: Interactive tutorial
- ContractInterface: Display contract ABIs
- IntegrationFlow: Visual flow diagram
```

### 4. VRF Data Components
```typescript
- VRFEntryList: List of VRF entries
- VRFEntryCard: Individual entry display
- RandomnessVisualization: Visual representation
- BlockLink: Link to Harmony explorer
```

## Data Sources

### API Endpoints Needed
1. `/api/explorer/requests` - List all requests
2. `/api/explorer/request/:id` - Get request details
3. `/api/explorer/vrf-entries` - List VRF entries
4. `/api/status/servers` - Server status
5. `/api/status/metrics` - Server metrics

### Contract Queries
- Query FeeCollector for requests
- Query RandomnessAccess for VRF entries
- Query multiple networks (Base, Polygon, Avalanche)

## Design Principles

1. **Educational First**: Every page should teach something
2. **Visual Clarity**: Use diagrams, charts, and visualizations
3. **Interactive**: Let users explore and experiment
4. **Developer-Friendly**: Clear code examples and documentation
5. **Transparent**: Show all data, no hidden information

## Implementation Phases

### Phase 1: Foundation
- Set up routing structure
- Create base components
- Connect to contract APIs
- Basic explorer functionality

### Phase 2: Explorer
- Request listing and filtering
- Request details page
- VRF data browsing
- Network switching

### Phase 3: Status Dashboard
- Server status display
- Health monitoring
- Metrics visualization

### Phase 4: Developer Guide
- Documentation pages
- Code examples
- Interactive tutorials
- Integration flow diagrams

### Phase 5: Polish
- Animations and transitions
- Mobile responsiveness
- Performance optimization
- SEO optimization

## Technical Stack

- **Framework**: Next.js 13+ (App Router)
- **UI**: Chakra UI (already in use)
- **Blockchain**: ethers.js v6
- **Charts**: Recharts or Chart.js
- **Code Highlighting**: Prism.js or highlight.js
- **Animations**: Framer Motion (already in use)

## Domain Setup

- Main domain: `random.serv.services`
- Subdomain routing:
  - `random.serv.services/explorer` - Explorer
  - `random.serv.services/status` - Status
  - `random.serv.services/docs` - Documentation
  - `random.serv.services/demo` - Interactive demo

