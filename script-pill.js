function calculate() {
  const inr = parseFloat(document.getElementById("inr").value);
  const bleeding = document.getElementById("bleeding").value;
  const weeklyDose = parseFloat(document.getElementById("weeklyDose").value);
  const resultDiv = document.getElementById("result");

  if (isNaN(inr) || isNaN(weeklyDose)) {
    resultDiv.innerHTML = "กรุณากรอกข้อมูลให้ครบ";
    return;
  }

  let advice = "";
  let percentChange = 0;

  if (bleeding === "yes") {
    advice = "ให้ Vitamin K₁ 10 mg IV + FFP และให้ซ้ำทุก 12 ชม. หากจำเป็น";
    percentChange = -1.0;
  } else if (inr < 1.5) {
    advice = "เพิ่มขนาดยา 10–20%";
    percentChange = 0.15;
  } else if (inr < 2.0) {
    advice = "เพิ่มขนาดยา 5–10%";
    percentChange = 0.075;
  } else if (inr <= 3.0) {
    advice = "ให้ขนาดยาเท่าเดิม";
    percentChange = 0;
  } else if (inr <= 3.9) {
    advice = "ลดขนาดยา 5–10%";
    percentChange = -0.075;
  } else if (inr <= 4.9) {
    advice = "หยุดยา 1 วัน แล้วลดขนาดยา 10%";
    percentChange = -0.1;
  } else if (inr < 9.0) {
    advice = "หยุดยา 1–2 ครั้ง + ให้ Vitamin K₁ 1 mg oral";
    percentChange = -0.2;
  } else {
    advice = "ให้ Vitamin K₁ 5–10 mg oral";
    percentChange = -0.3;
  }

  const newWeekly = weeklyDose * (1 + percentChange);
  const daily = newWeekly / 7;
  const dosePlan = calculateTabletPlan(newWeekly);

  resultDiv.innerHTML = `
    <b>คำแนะนำ:</b> ${advice}<br>
    <b>ขนาดยาใหม่ต่อสัปดาห์ (mg):</b> ${newWeekly.toFixed(2)}<br>
    <b>เฉลี่ยต่อวัน:</b> ${daily.toFixed(2)} mg<br>
    <b>จำนวนเม็ดยาใกล้เคียงที่สุด:</b><br>
    ▸ Warfarin 3 mg: ${dosePlan[3]} เม็ด<br>
    ▸ Warfarin 5 mg: ${dosePlan[5]} เม็ด
  `;
}

function calculateTabletPlan(total) {
  let minDiff = Infinity;
  let best = { 3: 0, 5: 0 };

  for (let i = 0; i <= total / 3 + 1; i++) {
    for (let j = 0; j <= total / 5 + 1; j++) {
      let sum = i * 3 + j * 5;
      let diff = Math.abs(sum - total);
      if (diff <= total * 0.5 && diff < minDiff) {
        minDiff = diff;
        best = { 3: i, 5: j };
      }
    }
  }
  return best;
}


function renderPills(dosePlan) {
  const pillMap = {
    '2': '<div class="pill pill-2mg"></div>',
    '2.5': '<div class="pill pill-half-2mg"></div><div class="pill pill-2mg"></div>',
    '3': '<div class="pill pill-3mg"></div>',
    '3.5': '<div class="pill pill-half-3mg"></div><div class="pill pill-3mg"></div>',
    '1': '<div class="pill pill-2mg"></div>',
    '1.5': '<div class="pill pill-half-2mg"></div>',
  };

  let html = "";
  dosePlan.forEach(day => {
    html += `<div><strong>${day.day}:</strong> `;
    let pillsHTML = '';
    day.pills.forEach(p => {
      if (p.dose === 0) return;
      if (p.dose === 2) pillsHTML += pillMap['2'];
      else if (p.dose === 3) pillsHTML += pillMap['3'];
      else if (p.dose === 2.5) pillsHTML += pillMap['2.5'];
      else if (p.dose === 3.5) pillsHTML += pillMap['3.5'];
      else if (p.dose === 1) pillsHTML += pillMap['1'];
      else if (p.dose === 1.5) pillsHTML += pillMap['1.5'];
    });
    html += pillsHTML + "</div>";
  });
  return html;
}

// แก้ส่วนแสดงผลใน calculate() ให้ใช้ renderPills
const originalCalculate = calculate;
calculate = function () {
  originalCalculate();
  if (typeof finalPlan !== 'undefined') {
    const visual = renderPills(finalPlan);
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML += '<h3>ภาพเม็ดยา:</h3>' + visual;
  }
}
