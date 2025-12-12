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
// --- 4. M_Manual Scale 크기 측정 함수 ---

function calculateRealDiameterManual() {
    // 5엔 주화의 실제 지름 (규격: 22.0 mm 반영)
    const REAL_COIN_DIAMETER_MM = 22.0; 

    // [핵심 변경] AI 모델의 인식 대신, 사용자에게 마커의 픽셀 지름을 입력받습니다.
    // 이는 'AI가 이 값을 인식했다'고 가정하고 로직을 검증하기 위함입니다.
    const coin_pixel_width_input = prompt(
        "측정을 시작합니다. 화면에 보이는 5엔 주화의 픽셀 너비를 입력해주세요. (예: 250)"
    );
    
    if (!coin_pixel_width_input || isNaN(coin_pixel_width_input)) {
        alert("유효한 픽셀 값이 입력되지 않았습니다. 크기 측정을 취소합니다.");
        return;
    }
    
    const coin_pixel_width = parseFloat(coin_pixel_width_input);

    // [데모용 가정] 병변의 픽셀 지름: 주화 픽셀 너비의 30% (샘플 병변 크기 가정)
    // 실제 최종 모델에서는 영상처리 모듈이 이 값을 추출합니다.
    const lesion_pixel_width = coin_pixel_width * 0.30; 
    
    // 1. 픽셀-실제 크기 변환 비율 계산
    const PIXEL_TO_MM_RATIO = REAL_COIN_DIAMETER_MM / coin_pixel_width; 

    // 2. 최종 실제 크기(D) 계산
    const lesion_real_diameter_mm = lesion_pixel_width * PIXEL_TO_MM_RATIO;
    
    // 3. ABCDE 기준 (6mm)에 따른 피드백 생성
    let size_feedback = `\n[크기 분석 완료] 병변 크기는 약 ${lesion_real_diameter_mm.toFixed(1)}mm 입니다.`;
    if (lesion_real_diameter_mm > 6.0) {
        size_feedback += " (⚠️ 6mm 초과: 정밀 진단 필요)";
        
    } else {
        size_feedback += " (6mm 이하: 양호)";
    }

    // HTML 피드백 영역에 최종 결과 추가
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerText += size_feedback;
}


// --- 5. 버튼 이벤트 리스너 연결 ---
document.getElementById('measureButton').addEventListener('click', calculateRealDiameterManual);

// 참고: Roll/Pitch가 Optimal일 때 버튼을 활성화하는 로직은 시간 관계상 생략하고, 
// 여기서는 버튼을 클릭하면 바로 크기 측정을 시작하도록 구현합니다.
