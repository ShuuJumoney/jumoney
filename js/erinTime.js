
// 현실 시간 대비 마비노기 시간 변환 비율 (1초 = 게임 내 40초)
// 에린 시간 계산에 필요한 상수
const REAL_MINUTES_PER_ERIN_DAY = 36; // 현실 36분 = 에린 24시간
const ERIN_MINUTES_PER_DAY = 24 * 60; // 에린 하루 = 1440분
const TIME_OFFSET = 30 * 1000; // 15초 보정 (밀리초)
let element = "";


// 현실 시간에 따른 에린 시간 계산 함수
function calculateErinnTime() {
  const now = new Date(Date.now() - TIME_OFFSET); // 현재 시간에 15초 보정 추가
  const totalSecondsToday = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  // 현실 시간의 36분 주기(2160초) 내 현재 위치 계산
  const secondsInCurrentCycle = totalSecondsToday % (REAL_MINUTES_PER_ERIN_DAY * 60);

  // 2160초(36분) 주기를 1440분(에린 하루)로 매핑
  const erinElapsedMinutes = (secondsInCurrentCycle / (REAL_MINUTES_PER_ERIN_DAY * 60)) * ERIN_MINUTES_PER_DAY;
  //erinElapsedMinutes = Math.round(erinElapsedMinutes / 10) * 10; // 10분 단위로 반올림

  // 에린 시간 계산
  let erinHour = Math.floor(erinElapsedMinutes / 60) % 24;
  const erinMinute = Math.floor(erinElapsedMinutes % 60);

  // 오전/오후 구분 처리
  const period = erinHour < 12 ? "오전" : "오후";
  if (erinHour === 0) erinHour = 12; // 오전 12시로 표시
  else if (erinHour > 12) erinHour -= 12; // 오후 1~11시로 변환

  return { hour: erinHour, minute: erinMinute, period };
}

// 동기화 체크 함수: 매 12분마다 동기화 수행
function checkSync() {
  const now = new Date();
  const minute = now.getMinutes();

  // 12의 배수 분(00, 12, 24, 36, 48)에 도달했는지 확인
  if (minute % 12 === 0) {
    console.log(`[동기화] 현재 시각: ${now.toLocaleTimeString()}`);
  }
}

// 매 프레임마다 에린 시간 출력 및 동기화 체크
function getErinTime(elem) {
  const { hour, minute, period } = calculateErinnTime();
  const timer = 10 * 1000; 
  if(element == "" ) element = elem;

  // 에린 시간 출력 (12시간 형식 + 오전/오후)
  //console.log(`에린 시간: ${period} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  element.innerText = `에린 시간: ${period} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

  // 동기화 체크
  checkSync();

  // 10초 후에 다시 호출 (재귀적 호출로 메모리 최적화)
  setTimeout(() => requestAnimationFrame(getErinTime), timer);
}
