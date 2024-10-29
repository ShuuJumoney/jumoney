const axios = require('axios');

let cache = {};
let cacheTimestamp = 0;
const CACHE_DURATION = 60 * 1000; // 60초

module.exports = async (req, res) => {
  const { npc, server, channel } = req.query;
  const cacheKey = `${npc}_${server}_${channel}`;

  if (cache[cacheKey] && Date.now() - cacheTimestamp < CACHE_DURATION) {
    return res.status(200).json({ data: cache[cacheKey], source: 'cache' });
  }

  try {
    const API_KEY = process.env.API_KEY; // Vercel 환경 변수 사용
    const response = await axios.get('https://api.example.com/npcshop', {
      params: { npc_name: npc, server_name: server, channel },
      headers: { 'x-api-key': API_KEY },
    });

    cache[cacheKey] = response.data;
    cacheTimestamp = Date.now();

    res.status(200).json({ data: response.data, source: 'api' });
  } catch (error) {
    res.status(500).json({ error: 'API 호출 실패' });
  }
};
