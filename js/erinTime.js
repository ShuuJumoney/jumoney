// 에린 시간과 현실 시간의 비율 및 상수 설정
const REAL_MINUTES_PER_ERIN_DAY = 36; // 현실 36분 = 에린 하루
const ERIN_MINUTES_PER_DAY = 24 * 60; // 에린 하루 = 1440분
let TIME_OFFSET = 0 * 1000; // 30초 보정 (밀리초)
let element = ""; // 에린 시간 표시할 HTML 엘리먼트

// 현실 시간에 따른 에린 시간 계산 함수
function calculateErinnTime() {
  const now = new Date(Date.now() - TIME_OFFSET); // 시간 보정
  const totalSecondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // 현실 36분(2160초) 주기 내 현재 위치 계산
  const secondsInCurrentCycle = totalSecondsToday % (REAL_MINUTES_PER_ERIN_DAY * 60);

  // 36분 주기를 에린 하루(1440분)로 매핑
  const erinElapsedMinutes = (secondsInCurrentCycle / (REAL_MINUTES_PER_ERIN_DAY * 60)) * ERIN_MINUTES_PER_DAY;

  // 에린 시간 계산 (24시간 형식)
  let erinHour = Math.floor(erinElapsedMinutes / 60) % 24;
  const erinMinute = Math.floor(erinElapsedMinutes % 60);

  // 오전/오후 처리
  const period = erinHour < 12 ? "오전" : "오후";
  if (erinHour === 0) erinHour = 12; // 0시 → 오전 12시
  else if (erinHour > 12) erinHour -= 12; // 13~23시 → 오후 1~11시

  return { hour: erinHour, minute: erinMinute, period };
}

// 동기화 체크 함수: 매 12분마다 동기화 수행 //또 호출할필요 없이 호출했을때 동기화
function checkSync(serverTime) {
  const now = new Date();
  const minute = now.getMinutes();

  if(serverTime)
 	syncWithServerTime(serverTime); // 서버 시간과 동기화 시도
  
  // 12의 배수 분(00, 12, 24, 36, 48) 도달 시 동기화
  if (minute % 12 === 0) {
    console.log(`[동기화] 현재 시각: ${now.toLocaleTimeString()}`);
  }
}

// 서버와의 동기화 함수 (가상 API 사용)
async function syncWithServerTime(serverTime) {
  try {
	
    serverTime = new Date(serverTime); // 서버 시간 동기화
	//data.date_inquire
	
    const now = new Date();
    const timeDiff = serverTime - now; // 서버와의 시간 차이 계산
    
    console.log(`서버와 클라이언트 시간차: ${timeDiff}ms`);

    // 시간 보정 업데이트 (필요한 경우)
    if (Math.abs(timeDiff) > 2000) { // 5초 이상 차이 발생 시
      TIME_OFFSET += timeDiff;
      console.log(`[보정] 시간 차이를 ${timeDiff}ms 만큼 보정합니다.`);
    }
  } catch (error) {
    console.error('[오류] 서버와 동기화 실패:', error);
  }
}

// 매 프레임마다 에린 시간 출력 및 동기화 체크
function getErinTime(elem) {
  const { hour, minute, period } = calculateErinnTime();
  const timer = 10 * 1000; // 10초 간격으로 갱신

  // HTML 엘리먼트 초기화
  if (element === "") element = elem;

  // 에린 시간 출력 (12시간 형식 + 오전/오후)
  element.innerText = `에린 시간: ${period} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  // 동기화 체크
  checkSync();

  // 10초 후에 다시 호출 (requestAnimationFrame으로 성능 최적화)
  setTimeout(() => requestAnimationFrame(() => getErinTime(element)), timer);
}
