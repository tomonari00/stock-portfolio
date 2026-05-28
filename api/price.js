export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'code is required' });
  }

  try {
    // Yahoo Finance APIで日本株取得（証券コード.T形式）
    const ticker = `${code}.T`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      }
    });

    if (!response.ok) {
      throw new Error('株価の取得に失敗しました');
    }

    const data = await response.json();
    const result = data.chart?.result?.[0];
    
    if (!result) {
      throw new Error('データが見つかりません');
    }

    const meta = result.meta;
    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose || meta.previousClose;
    const change = prevClose ? ((price - prevClose) / prevClose * 100) : null;

    return res.status(200).json({
      price: Math.round(price),
      change: change ? Math.round(change * 10) / 10 : null,
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
