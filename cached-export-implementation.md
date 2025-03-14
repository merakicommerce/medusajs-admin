# Cached Orders Export Implementation Guide

## Overview

This document outlines the implementation of a cached export system for the `/api/admin/export_orders` endpoint to provide immediate file delivery, even with large datasets.

## Current Status

- ✅ Frontend has been updated to handle both CSV and JSON responses
- ❌ Backend endpoints for caching need to be implemented

## Implementation Steps

### 1. Frontend Implementation (Already Done)

The frontend has been modified to:
1. Request the file directly as a binary blob
2. Handle both CSV and JSON responses from the backend:
   - If CSV is returned, it downloads it directly
   - If JSON is returned, it converts to CSV in the browser (original behavior)

### 2. Backend Implementation Requirements

#### Step 1: Modify Export Orders Endpoint

Update the `/api/admin/export_orders` endpoint in your Medusa backend to support direct CSV generation:

```javascript
// Example implementation (Express.js)
router.get('/admin/export_orders', async (req, res) => {
  try {
    const useCache = req.query.use_cache === 'true';
    
    // Get content type from Accept header to determine response format
    const acceptsCsv = req.get('Accept').includes('text/csv');
    
    // Check if we should try to use the cache
    if (useCache && acceptsCsv) {
      const cacheExists = await checkCacheExists();
      
      if (cacheExists) {
        // Set appropriate headers for CSV
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
        
        // Stream the file directly from cache
        const fileStream = fs.createReadStream(getCachePath());
        return fileStream.pipe(res);
      }
    }
    
    // If client requests CSV but no cache is available
    if (acceptsCsv) {
      // Generate CSV directly
      const csvContent = await generateOrdersCsv(req.query);
      
      // Save to cache if requested
      if (useCache) {
        await saveToCacheIfNeeded(csvContent);
      }
      
      // Return the generated CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
      return res.send(csvContent);
    }
    
    // If client does not specifically request CSV, return JSON (original behavior)
    const orders = await fetchOrders(req.query);
    return res.json(orders);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});
```

#### Step 2: Implement CSV Generation Function

Add a function to your backend to generate CSV directly without going through JSON:

```javascript
/**
 * Generate CSV directly from database data
 */
async function generateOrdersCsv(filters = {}) {
  // Create CSV writer
  const csvWriter = createCsvWriter({
    // Define CSV structure with headers
    header: [
      {id: 'id', title: 'ID'},
      {id: 'firstName', title: 'First Name'},
      {id: 'lastName', title: 'Last Name'},
      // ...add all the fields you need
    ]
  });
  
  // Fetch orders with pagination to avoid memory issues
  let allRecords = [];
  let hasMore = true;
  let page = 0;
  const pageSize = 100;
  
  while (hasMore) {
    const orders = await fetchOrdersPage(filters, page, pageSize);
    
    if (orders.length === 0) {
      hasMore = false;
      break;
    }
    
    // Transform orders into CSV format
    const records = orders.flatMap(order => {
      return order.items.map(item => ({
        id: order.display_id,
        firstName: order.shipping_address?.first_name,
        lastName: order.shipping_address?.last_name,
        // ...map all fields
      }));
    });
    
    allRecords = [...allRecords, ...records];
    page++;
    
    // Safety limit
    if (page > 100) hasMore = false;
  }
  
  // Generate CSV string
  return csvWriter.writeRecords(allRecords);
}
```

#### Step 3: Add Cache Refresh Endpoint (Optional)

Once the initial implementation is tested, add the refresh endpoint:

```javascript
router.post('/admin/export_orders/refresh_cache', async (req, res) => {
  try {
    // Start the refresh in the background
    const job = await startCacheRefreshJob(req.body.context);
    
    // Return immediately
    res.json({ success: true, job_id: job.id });
  } catch (error) {
    console.error('Cache refresh error:', error);
    res.status(500).json({ error: 'Cache refresh failed' });
  }
});
```

### 3. Deployment Instructions

1. **Update Frontend**:
   - Deploy the updated frontend code with the changes to `handleDownloadOrdersCsv`
   
2. **Update Backend**:
   - Modify the `/api/admin/export_orders` endpoint to support direct CSV generation
   - Add support for the `Accept: text/csv` header
   - Test locally first to ensure proper functionality
   
3. **Implement Caching (Phase 2)**:
   - After the direct CSV export is working, add the caching mechanism
   - Add the `/api/admin/export_orders/refresh_cache` endpoint
   - Update the frontend to use the cached version

### 4. Testing Checklist

- [ ] Export button works and shows loading indicator
- [ ] CSV is generated correctly with all required fields
- [ ] Large datasets are handled efficiently
- [ ] Error handling displays appropriate messages
- [ ] (If caching implemented) Cache is refreshed as expected

## Troubleshooting

### Common Issues

1. **404 Not Found for /refresh_cache endpoint**
   - This endpoint needs to be implemented on the backend
   - Use the original export function until the endpoint is implemented

2. **CSV Generation Memory Issues**
   - Use pagination when fetching orders from the database
   - Implement streaming response instead of loading everything into memory

3. **Slow CSV Generation**
   - Add indexes to frequently filtered fields in the database
   - Cache results for common filter combinations
   - Consider background processing for large exports

## Next Steps After Initial Implementation

1. Implement the caching mechanism
2. Add metrics for cache hits/misses
3. Implement automated cache refresh on data changes
4. Add support for filtered exports with caching

## Frontend Implementation

The frontend has been modified to:
1. Request the file directly as a binary blob with a `use_cache=true` parameter
2. Trigger a background cache refresh after download for future requests

## Backend Implementation Requirements

### 1. Modify the Export Orders Endpoint

Update the `/api/admin/export_orders` endpoint to support the caching mechanism:

```javascript
// Example implementation (Express.js)
router.get('/admin/export_orders', async (req, res) => {
  try {
    const useCache = req.query.use_cache === 'true';
    
    // Check if we should use the cache
    if (useCache) {
      // Check if cached file exists
      const cacheExists = await checkCacheExists();
      
      if (cacheExists) {
        // Set appropriate headers
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
        
        // Stream the file directly from cache
        const fileStream = fs.createReadStream(getCachePath());
        return fileStream.pipe(res);
      }
    }
    
    // If no cache or cache not requested, generate CSV
    // Generate the CSV file as before
    // This should be optimized using streaming as in the previous recommendation
    
    // If generation was successful and no errors, save a copy to cache
    saveToCacheIfNeeded(csvContent);
    
    // Return the generated CSV
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="orders.csv"');
    res.send(csvContent);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});
```

### 2. Add Cache Refresh Endpoint

Create a new endpoint to refresh the cache in the background:

```javascript
router.post('/admin/export_orders/refresh_cache', async (req, res) => {
  try {
    // Start the cache refresh process in the background
    const job = await startCacheRefreshJob(req.body.context);
    
    // Return immediately with the job ID
    res.json({ success: true, job_id: job.id });
    
    // The actual processing happens asynchronously after response
  } catch (error) {
    console.error('Cache refresh error:', error);
    res.status(500).json({ error: 'Cache refresh failed' });
  }
});
```

### 3. Implement the Caching Mechanism

Core caching functions to implement:

```javascript
/**
 * Check if a valid cache exists
 */
async function checkCacheExists() {
  try {
    const cacheStats = await fs.promises.stat(getCachePath());
    const cacheAge = Date.now() - cacheStats.mtime.getTime();
    
    // Consider cache valid if less than 1 hour old
    // Adjust this value based on data change frequency
    return cacheAge < 60 * 60 * 1000;
  } catch (error) {
    // File doesn't exist or other error
    return false;
  }
}

/**
 * Get the path to the cached CSV file
 */
function getCachePath() {
  // You might want different cache files for different filters/contexts
  return path.join(process.env.CACHE_DIR || '/tmp', 'orders_export_cache.csv');
}

/**
 * Save the generated CSV to cache
 */
async function saveToCacheIfNeeded(csvContent) {
  try {
    await fs.promises.writeFile(getCachePath(), csvContent);
    console.log('Cache updated successfully');
  } catch (error) {
    console.error('Failed to update cache:', error);
    // Non-critical error, don't throw
  }
}

/**
 * Start a background job to refresh the cache
 */
async function startCacheRefreshJob(context) {
  // Create a job in your job queue system (Bull, Agenda, etc.)
  const job = await jobQueue.add('refreshExportCache', {
    context,
    timestamp: Date.now()
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 }
  });
  
  return job;
}
```

### 4. Implement the Cache Refresh Worker

```javascript
// In your worker/processor file
jobQueue.process('refreshExportCache', async (job) => {
  try {
    const { context } = job.data;
    
    // Generate a fresh CSV with all orders
    const csvContent = await generateOrdersCsv(context);
    
    // Save to cache
    await fs.promises.writeFile(getCachePath(), csvContent);
    
    return { success: true };
  } catch (error) {
    console.error('Cache refresh job failed:', error);
    throw error; // To trigger retry
  }
});
```

## Advanced Optimization

1. **Multiple Cache Files**: Consider maintaining separate cache files for different filters or contexts.

2. **Cache Invalidation Strategy**: Implement a strategy to invalidate the cache when data changes:
   - Invalidate after new orders are created
   - Invalidate when order status changes
   - Run a scheduled job to refresh the cache periodically

3. **Cache Warming**: Schedule regular cache warming during off-peak hours

4. **Cache Size Management**: Implement a mechanism to limit total cache size and clean old caches

## Performance Considerations

1. **Cache Location**: Store the cache on fast storage (SSD)
2. **Compression**: Consider compressing the cached files
3. **CDN Integration**: For very large deployments, consider serving cached files from a CDN
4. **Cache Segmentation**: Segment the cache by date ranges or other key filters

## Monitoring

1. Add cache hit/miss metrics
2. Track cache generation time
3. Monitor cache size and disk usage
4. Track download time for users

## Security Considerations

1. Ensure proper authentication before serving cached files
2. Be cautious of caching sensitive information
3. Handle file permissions properly for cache storage 