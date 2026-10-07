/**
 * Singapore LTA Bus Arrival API Endpoint (v3)
 * GET /api/bus-arrival?BusStopCode=04121&ServiceNo=7
 *
 * Calls official LTA DataMall:
 * GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=...
 * Header: AccountKey: <process.env.LTA_ACCOUNT_KEY>
 */

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey, x-account-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { BusStopCode, ServiceNo, busStopCode, serviceNo } = req.query || {};
    const targetStopCode = (BusStopCode || busStopCode || '').toString().trim();
    const targetServiceNo = (ServiceNo || serviceNo || '').toString().trim();

    if (!targetStopCode) {
      return res.status(400).json({
        error: 'Missing required parameter: BusStopCode',
        example: '/api/bus-arrival?BusStopCode=04121',
      });
    }

    // Determine AccountKey from environment variable or request headers
    const accountKey =
      process.env.LTA_ACCOUNT_KEY ||
      req.headers['accountkey'] ||
      req.headers['x-account-key'] ||
      '';

    if (!accountKey) {
      return res.status(503).json({
        error: 'LTA_ACCOUNT_KEY is not configured in server environment variables.',
        hint: 'Add LTA_ACCOUNT_KEY in your Vercel project environment variables (or .env file).',
        busStopCode: targetStopCode,
        isConfigured: false,
      });
    }

    // Build upstream LTA DataMall v3 BusArrival URL
    let ltaUrl = `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${encodeURIComponent(
      targetStopCode
    )}`;

    if (targetServiceNo) {
      ltaUrl += `&ServiceNo=${encodeURIComponent(targetServiceNo)}`;
    }

    const ltaResponse = await fetch(ltaUrl, {
      method: 'GET',
      headers: {
        AccountKey: accountKey.trim(),
        accept: 'application/json',
      },
    });

    if (!ltaResponse.ok) {
      const errorText = await ltaResponse.text();
      return res.status(ltaResponse.status).json({
        error: `LTA DataMall API responded with status ${ltaResponse.status}`,
        details: errorText,
      });
    }

    const data = await ltaResponse.json();

    // Cache control: LTA DataMall updates bus timings every 20-30 seconds
    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching LTA Bus Arrival:', error);
    return res.status(500).json({
      error: 'Internal Server Error while querying LTA Bus Arrival API',
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
