// --- 0. 전역 요소 및 이벤트 리스너 정의 (Initialization) ---
const feedbackElement = document.getElementById('feedback');
const measureButton = document.getElementById('measureButton');

const optimal_threshold = 5; // 각도 허용 오차 임계값 (±5도)

// 1. 센서 리스너 등록
window.addEventListener('deviceorientation', handleOrientation);

// 2. 버튼 이벤트 리스너 연결
if (measureButton) {
    measureButton.addEventListener('click', calculateRealDiameterManual);
} else {
    console.warn("HTML에 'measureButton' ID를 가진 요소를 찾을 수 없습니다.");
}


// --- 1. 각도 제어 (Angle Control) 로직 ---
function handleOrientation(event) {
    const roll = event.gamma; 
    const pitch = event.beta; 
    
    // [센서 안전 장치] Roll 또는 Pitch 값이 null이면 오류 메시지 출력 후 종료
    if (roll === null || pitch === null) {
        if (feedbackElement) {
            feedbackElement.style.color = 'orange';
            feedbackElement.innerText = "🚨 센서 데이터 접근 실패: 브라우저에서 모션 센서 사용 권한을 허용했는지, 또는 iOS 설정(Safari > 동작 및 방향)이 활성화되었는지 확인해주세요.";
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


// --- 3. M_Manual Scale 크기 측정 로직 ---
function calculateRealDiameterManual() {
    const REAL_COIN_DIAMETER_MM = 22.0; // 5엔 주화 규격

    // 사용자에게 픽셀 지름을 입력받습니다.
    const coin_pixel_width_input = prompt(
        "측정을 시작합니다. 화면에 보이는 5엔 주화의 픽셀 너비를 입력해주세요. (예: 250)"
    );
    
    // 입력 값 유효성 검사
    if (!coin_pixel_width_input || isNaN(coin_pixel_width_input)) {
        alert("유효한 픽셀 값이 입력되지 않았습니다. 크기 측정을 취소합니다.");
        return;
    }
    
    const coin_pixel_width = parseFloat(coin_pixel_width_input);

    // [데모용 가정] 병변의 픽셀 지름: 주화 픽셀 너비의 30%
    const lesion_pixel_width = coin_pixel_width * 0.30; 
    
    // 픽셀-실제 크기 변환 비율 계산 및 최종 크기 계산
    const PIXEL_TO_MM_RATIO = REAL_COIN_DIAMETER_MM / coin_pixel_width; 
    const lesion_real_diameter_mm = lesion_pixel_width * PIXEL_TO_MM_RATIO;
    
    // 최종 피드백 생성
    let size_feedback = `\n[크기 분석 완료] 병변 크기는 약 ${lesion_real_diameter_mm.toFixed(1)}mm 입니다.`;
    if (lesion_real_diameter_mm > 6.0) {
        size_feedback += " (⚠️ 6mm 초과: 정밀 진단 필요)";
    } else {
        size_feedback += " (6mm 이하: 양호)";
    }

    // [출력 로직 강화] 화면 출력 또는 alert 강제 출력
    if (feedbackElement) {
        // HTML 요소가 있다면, 화면에 결과를 추가합니다.
        feedbackElement.innerText += size_feedback;
    } else {
        // HTML 요소가 없다면, alert 창으로 강제 출력하여 결과를 확인합니다.
        alert("크기 측정 결과 (HTML 요소 출력 오류 우회): " + size_feedback);
    }
}
