// --- 1. 센서 리스너 등록 및 변수 설정 ---
// [핵심] 기기 방향 변화 이벤트를 감지하여 handleOrientation 함수 실행 요청
window.addEventListener('deviceorientation', handleOrientation);

const feedbackElement = document.getElementById('feedback');
const optimal_threshold = 5; // 수직 허용 오차 임계값 (±5도 이내를 Optimal로 간주)

// --- 2. 센서 데이터 처리 및 피드백 로직 ---
function handleOrientation(event) {
    // event.gamma: 좌우 기울임 (Roll) 각도
    // event.beta: 앞뒤 기울임 (Pitch) 각도
    const roll = event.gamma; 
    const pitch = event.beta; 
    
    let message = '';
    
    // [판단 로직] Roll과 Pitch 절대값이 모두 임계값 이내인지 확인
    if (Math.abs(roll) < optimal_threshold && Math.abs(pitch) < optimal_threshold) {
        message = "✅ 최적 각도입니다 (Optimal Angle)";
        feedbackElement.style.color = 'green';
    } else {
        message = "❌ 카메라를 수직으로 유지하세요.";
        feedbackElement.style.color = 'red';
    }

    // 텍스트 피드백 업데이트
    feedbackElement.innerText = message + 
                                `\n[센서 값] Roll: ${roll.toFixed(1)}° / Pitch: ${pitch.toFixed(1)}°`; 

    // 시각적 UI 업데이트 함수 호출
    updateLevelMeterUI(roll, pitch); 
}

// --- 3. UI 움직임 구현 로직 ---
function updateLevelMeterUI(roll, pitch) {
    const dot = document.getElementById('levelMeterDot');
    
    // 센서 값에 비례하여 미터기(점)를 움직입니다. (1도당 5px 이동 가정)
    const xOffset = roll * 5; 
    const yOffset = pitch * 5; 
    
    // CSS 변환(transform)을 사용하여 점의 위치를 실시간으로 변경
    dot.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
}