const axios = require('axios');

// 캐시 데이터와 만료 시간 설정
let cache = {};
let cacheExpiration = 0; // 캐시 만료 타임스탬프

function getNextCacheExpiration() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 36분마다 갱신되는 시각 계산
  const refreshIntervals = Array.from({ length: 40 }, (_, i) => i * 36);
  const nextRefresh = refreshIntervals.find(interval => interval > currentMinutes) || 1440; // 자정 처리

  const expirationTime = new Date(now);
  expirationTime.setHours(0, nextRefresh, 0, 0); // 다음 만료 시각 설정

  return expirationTime.getTime();
}

module.exports = async (req, res) => {
  const { npc, server, channel } = req.query;
  const cacheKey = `${npc}_${server}_${channel}`;

  // 캐시 유효성 검사
  const now = Date.now();
  if (cache[cacheKey] && now < cacheExpiration) {
    console.log(`캐시 사용: ${cacheKey}`);
    return res.status(200).json({ data: cache[cacheKey], source: 'cache' });
  }

  try {
    const API_KEY = process.env.API_KEY; // Vercel 환경 변수에서 API 키 가져오기
    const url = `https://open.api.nexon.com/mabinogi/v1/npcshop/list?npc_name=${npc}&server_name=${server}&channel=${channel}`;

    const response = await axios.get(url, {
      headers: { 'x-nxopen-api-key': API_KEY },
    });

    if (!response.data.shop) {
      return res.status(404).json({ error: 'NPC 데이터를 찾을 수 없습니다.' });
    }

    const items = response.data.shop
      .filter(shop => shop.tab_name === '주머니')
      .flatMap(shop => shop.item);

    // 캐시 저장 및 만료 시간 설정
    cache[cacheKey] = items;
    cacheExpiration = getNextCacheExpiration(); // 다음 갱신 시각 설정

    console.log(`API 데이터 저장: ${cacheKey}`);
    return res.status(200).json({ data: items, source: 'api' });
  } catch (error) {
    console.error(`API 호출 실패: ${error.message}`);
    return res.status(500).json({ error: 'API 호출 중 문제가 발생했습니다.' });
  }
};

function getNextCacheExpiration() {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 36분마다 캐시 갱신 시점 (총 40회)
  const refreshIntervals = Array.from({ length: 40 }, (_, i) => i * 36);

  // 현재 시간 이후에 해당하는 다음 갱신 시각 찾기
  const nextRefresh = refreshIntervals.find(interval => interval > currentMinutes);

  const nextExpirationMinutes = nextRefresh !== undefined ? nextRefresh : 1440; // 자정(1440분)으로 초기화

  const expirationTime = new Date(now);
  expirationTime.setHours(0, nextExpirationMinutes, 0, 0); // 갱신 시각 설정

  return expirationTime.getTime(); // 타임스탬프로 반환
}


