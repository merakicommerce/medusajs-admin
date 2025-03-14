# Cached Orders Export Implementation Guide

## Overview

This document outlines the implementation of a cached export system for the `/api/admin/export_orders` endpoint to provide immediate file delivery, even with large datasets.

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