// --- 0. 전역 요소 및 초기화 ---
// DOM 요소가 로드된 후 안전하게 변수 정의
const feedbackElement = document.getElementById('feedback');
const measureButton = document.getElementById('measureButton');

const optimal_threshold = 5; // 각도 허용 오차 임계값 (±5도)

// 1. 센서 리스너 등록
window.addEventListener('deviceorientation', handleOrientation);

// 2. 버튼 이벤트 리스너 연결 강화
// 버튼 요소가 존재하는지 확인 후 이벤트 연결
if (measureButton) {
    measureButton.addEventListener('click', calculateRealDiameterManual);
} else {
    // 버튼이 index.html에 없으면 console에 오류 기록 (모바일에서는 안 보임)
    console.error("Critical Error: 'measureButton' element not found.");
}


// --- 1. 각도 제어 (Angle Control) 로직 ---
function handleOrientation(event) {
    // 센서 데이터가 null이 아닌 경우에만 진행 (오류 방지)
    const roll = event.gamma; 
    const pitch = event.beta; 
    
    // [센서 안전 장치] Roll 또는 Pitch 값이 null이면 오류 메시지 출력 후 종료
    if (roll === null || pitch === null) {
        if (feedbackElement) {
            feedbackElement.style.color = 'orange';
            feedbackElement.innerText = "🚨 센서 데이터 접근 실패: 브라우저 권한 및 OS 설정을 확인해주세요.";
        }
        updateLevelMeterUI(0, 0); 
        return; 
    }
    
    let message = '';
    
    if (Math.abs(roll) < optimal_threshold && Math.abs(pitch) < optimal_threshold) {
        message = "✅ 최적 각도입니다 (Optimal Angle)";
        if(feedbackElement) feedbackElement.style.color = 'green';
    } else {
        message = "❌ 카메라를 수직으로 유지하세요.";
        if(feedbackElement) feedbackElement.style.color = 'red';
    }

    if(feedbackElement){
        feedbackElement.innerText = message + 
                                    `\n[센서 값] Roll: ${roll.toFixed(1)}° / Pitch: ${pitch.toFixed(1)}°`; 
    }

    updateLevelMeterUI(roll, pitch); 
}

// --- 2. UI 움직임 구현 로직 ---
function updateLevelMeterUI(roll, pitch) {
    const dot = document.getElementById('levelMeterDot');
    if (dot) {
        const xOffset = roll * 5; 
        const yOffset = pitch * 5; 
        dot.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    }
}


// --- 3. M_Manual Scale 크기 측정 로직 (강화된 출력) ---
function calculateRealDiameterManual() {
    const REAL_COIN_DIAMETER_MM = 22.0; // 5엔 주화 규격

    // 사용자 입력 (Prompt)
    const coin_pixel_width_input = prompt(
        "측정을 시작합니다. 화면에 보이는 5엔 주화의 픽셀 너비를 입력해주세요. (예: 250)"
    );
    
    // 입력 값 유효성 검사 (Cancel을 누르거나 숫자가 아닌 경우)
    if (!coin_pixel_width_input || isNaN(coin_pixel_width_input)) {
        alert("크기 측정을 위해 유효한 숫자를 입력해야 합니다. 취소합니다.");
        return;
    }
    
    const coin_pixel_width = parseFloat(coin_pixel_width_input);

    // [데모용 가정] 병변의 픽셀 지름: 주화 픽셀 너비의 30%
    const lesion_pixel_width = coin_pixel_width * 0.30; 
    
    // 계산 로직
    const PIXEL_TO_MM_RATIO = REAL_COIN_DIAMETER_MM / coin_pixel_width; 
    const lesion_real_diameter_mm = lesion_pixel_width * PIXEL_TO_MM_RATIO;
    
    // 최종 피드백 생성
    let size_feedback = `\n[크기 분석 완료] 병변 크기는 약 ${lesion_real_diameter_mm.toFixed(1)}mm 입니다.`;
    if (lesion_real_diameter_mm > 6.0) {
        size_feedback += " (⚠️ 6mm 초과: 정밀 진단 필요)";
    } else {
        size_feedback += " (6mm 이하: 양호)";
    }

    // [최종 출력] HTML 출력 실패 시, 강제 alert 출력
    if (feedbackElement) {
        // HTML 요소가 있다면, 화면에 결과를 추가합니다.
        feedbackElement.innerText += size_feedback;
    } else {
        // HTML 요소가 없거나 문제가 있다면, alert 창으로 강제 출력
        alert("🚨 HTML 출력 실패! 크기 측정 결과 확인:\n" + size_feedback);
    }
}
