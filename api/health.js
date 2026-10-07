/**
 * Health Check API Endpoint
 * GET /api/health
 *
 * Monitors system health and reports whether the LTA_ACCOUNT_KEY environment variable is configured.
 */

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const hasApiKey = Boolean(process.env.LTA_ACCOUNT_KEY && process.env.LTA_ACCOUNT_KEY.trim().length > 0);

  return res.status(200).json({
    status: 'ok',
    service: 'SG Bus Arrival API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    ltaApiConfigured: hasApiKey,
    message: hasApiKey
      ? 'LTA_ACCOUNT_KEY is configured and ready.'
      : 'LTA_ACCOUNT_KEY is not set. Real LTA calls will require setting this in environment variables.',
  });
}
