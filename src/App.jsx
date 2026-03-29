import { useState, useEffect } from "react";
import { db, ref, set, get, onValue, remove } from "./firebase.js";

const CV_VALUES = `CooperVision의 핵심 가치 및 문화 (DIFF):
- Dedicated: 고객에게 끝까지 헌신하고 책임지는 자세. 고객의 고통에 공감하고 즉각 행동.
- Innovative: 창의적이고 새로운 방식으로 문제를 해결. 기존 틀을 넘는 아이디어.
- Friendly: 따뜻하고 친근한 소통. 고객이 신뢰를 느끼는 관계 형성.
- Partners: 내·외부 협력을 통해 더 큰 해결책 도출. 팀워크와 부서 간 연대.
CooperVision은 항상 고객의 시력과 삶의 질 향상을 최우선으로 합니다.`;

const MISSIONS = [
  { id: "dedicated", zone: "D", title: "Dedicated 존", color: "#E85D24", bg: "#FFF4F0", tagBg: "#FFF4F0", tagColor: "#993C1D", description: "고객 불만을 끝까지 책임지고 해결하는 자세", question: "이 고객의 불만을 해결하는 방법을 제안하세요.", zoneValue: "Dedicated — 고객에게 끝까지 헌신하고 책임지는 자세", cases: [{ num: "사례 01", title: "렌즈 착용 직후 각막 손상", quote: "새 Avaira Toric을 끼고 이틀 만에 각막이 찢어졌어요. 10년 넘게 렌즈를 써왔는데 이런 적은 처음입니다. 하루를 쉬어야 했고 고통이 며칠 계속됐어요.", background: "실리콘 오일 오염으로 인한 Avaira 시리즈 대규모 리콜(600만 개↑). 고객은 리콜 사실을 뒤늦게 인지.", skill: "공감 + 즉각 대응" }, { num: "사례 06", title: "전화·채팅 모두 연결 안 됨", quote: "리콜 관련해서 전화를 10번 넘게 했는데 한 번도 연결이 안 됐어요. 채팅은 30분을 기다려도 상담사가 안 붙어요.", background: "리콜 발생 시 고객센터 폭주로 인한 응대 불가. 위기 상황 대응 채널 부재.", skill: "지속적 팔로우업" }] },
  { id: "innovation", zone: "I", title: "Innovation 존", color: "#7C3AED", bg: "#F5F0FF", tagBg: "#F5F0FF", tagColor: "#3C3489", description: "기존 방식을 넘어 창의적인 해결책을 찾는 사고", question: "이 고객의 문제를 해결할 창의적인 방법을 제안하세요.", zoneValue: "Innovative — 창의적이고 새로운 방식으로 문제를 해결", cases: [{ num: "사례 09", title: "리콜 대상인데 통보 못 받음", quote: "인터넷에서 리콜 소식을 봤는데 제 로트 번호가 포함돼 있었어요. 왜 아무 연락이 없었죠? 이미 몇 주를 착용한 후였습니다.", background: "리콜 고지 체계 미흡. 소비자에게 직접 통보 없이 판매처 중심으로만 알림 발송.", skill: "시스템 재설계" }, { num: "사례 10", title: "SNS 확산 후에야 대응", quote: "고객센터에서 3주간 해결이 안 되니까 트위터에 올렸어요. 수백 개 공감을 받고 나서야 담당자가 연락 왔습니다.", background: "공식 채널 대응 실패 → SNS 확산 → 사후 대응이라는 악순환.", skill: "채널 혁신" }] },
  { id: "friendly", zone: "F", title: "Friendly 존", color: "#059669", bg: "#F0FFF8", tagBg: "#F0FFF8", tagColor: "#085041", description: "고객과 따뜻하고 친근하게 소통하는 방법", question: "이 고객과 친근하게 소통하는 방법을 제안하세요.", zoneValue: "Friendly — 따뜻하고 친근한 소통으로 고객 신뢰 형성", cases: [{ num: "사례 05", title: "처방 같은데 한쪽만 흐릿", quote: "예전 렌즈는 잘 보이는데 같은 처방으로 새로 받은 건 왼쪽이 계속 흐립니다. 의사도 CooperVision도 문제없다고만 해요.", background: "Proclear 렌즈 배치 간 품질 편차. 의사·제조사 모두 책임 회피하는 구조.", skill: "경청 + 안심" }, { num: "사례 07", title: "부작용으로 9개월 착용 불가", quote: "Biofinity 착용 후 거대 유두 결막염이 생겨 9개월간 렌즈를 못 꼈어요. 1년치를 샀는데 보상은 어디서 받죠?", background: "렌즈 소재 반응으로 인한 심각한 안과 부작용. 의료비·제품비 이중 손실 발생.", skill: "공감 + 신뢰 회복" }] },
  { id: "partners", zone: "P", title: "Partners 존", color: "#0284C7", bg: "#F0F8FF", tagBg: "#F0F8FF", tagColor: "#0C447C", description: "부서 간 협력으로 혼자 풀 수 없는 문제 해결", question: "부서 간 협력을 통해 이 고객의 문제를 해결하세요.", zoneValue: "Partners — 내·외부 협력으로 더 큰 해결책 도출", cases: [{ num: "사례 02", title: "리베이트 카드 오류·수수료 요구", quote: "만료 전에 수차례 사용 시도했지만 매번 오류였어요. 재발급을 요청했더니 금액의 25% 이상을 수수료로 내라고 했습니다.", background: "가상 리베이트 카드 시스템(Onbe Payments) 오류. 고객 귀책 아님에도 수수료 부과.", skill: "CS + 결제팀 협력" }, { num: "사례 08", title: "리베이트 조건 구매 후 알게 됨", quote: "리베이트를 받으려면 처방받은 안과에서만 구매해야 한다네요. 온라인에서 샀다가 리베이트를 못 받았습니다.", background: "리베이트 자격 조건이 구매 시점에 명확히 안내되지 않는 구조적 문제.", skill: "마케팅 + 영업 협력" }] },
  { id: "right", zone: "R", title: "Do the Right Thing 존", color: "#B45309", bg: "#FFFBF0", tagBg: "#FFFBF0", tagColor: "#633806", description: "규제·윤리를 고려한 올바른 판단과 선택", question: "규제 준수와 고객 보호를 고려한 올바른 선택을 제안하세요.", zoneValue: "Do the Right Thing — CooperVision의 윤리·규제 준수 정신", cases: [{ num: "사례 03", title: "Biofinity 심한 건조함·흡착", quote: "새 렌즈인데 반나절이면 눈이 너무 건조하고 저녁엔 달라붙어 뺄 수가 없어요. 다른 브랜드에선 없던 문제예요.", background: "Biofinity 2주 교체 렌즈 건조감·흡착 문제. FDA 부작용 보고 의무 vs 판매 지속 사이의 판단 필요.", skill: "FDA 보고 + 투명성" }, { num: "사례 04", title: "60일 기한 중 56일을 처리에 사용", quote: "리베이트 기한이 60일인데 처리에만 56일을 씁니다. 오류 수정할 시간이 4일밖에 없었어요.", background: "법적으로 문제없어도 도덕적으로 잘못된 정책 설계. 규정 준수와 윤리적 판단 사이의 선택.", skill: "정책 윤리 + 개선" }] },
];

const MAX_SCORE = 20;
const MAX_TOTAL = MISSIONS.length * MAX_SCORE;
const DB_PATH = "workshop_cv_v1";
const INSTRUCTOR_PIN = "1234";
const AI_TIMEOUT_MS = 25000;

async function loadAllTeams() {
  try {
    const snapshot = await get(ref(db, DB_PATH));
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.values(data).sort((a, b) => b.total - a.total);
  } catch { return []; }
}
async function upsertTeam(entry) {
  try {
    // teamName을 key로 사용 (특수문자 제거)
    const key = entry.team.replace(/[.#$[\]]/g, "_");
    await set(ref(db, `${DB_PATH}/${key}`), entry);
    return await loadAllTeams();
  } catch { return []; }
}
async function clearAllTeams() {
  try { await remove(ref(db, DB_PATH)); } catch {}
}

function fallbackScore(answer) {
  const t = answer.trim(); if (t.length < 50) return 0;
  const cv = ["고객","헌신","책임","공감","신뢰","혁신","창의","협력","파트너","친근","투명","윤리","규정","개선","소통"];
  const lg = ["따라서","때문에","그러므로","단계","첫째","둘째","먼저","다음으로"];
  const rs = ["합리적","효과적","실질적","근거","구체적","전략","제안"];
  const sl = ["해결","조치","보상","교체","환불","연락","처리","지원","대응","즉시"];
  const cvS = Math.min(10, 4 + cv.filter(k => t.includes(k)).length * 1.2);
  const lgS = Math.min(3.3, 1 + lg.filter(k => t.includes(k)).length * 0.8);
  const rsS = Math.min(3.3, 1 + rs.filter(k => t.includes(k)).length * 0.8);
  const slS = Math.min(3.3, 1 + sl.filter(k => t.includes(k)).length * 0.8);
  return Math.max(10, Math.min(20, Math.round(cvS + lgS + rsS + slS)));
}

function buildFallbackResult(answer) {
  const t = answer.trim();
  const cv = ["고객","헌신","책임","공감","신뢰","혁신","창의","협력","파트너","친근","투명","윤리","규정","개선","소통"];
  const lg = ["따라서","때문에","그러므로","단계","첫째","둘째","먼저","다음으로"];
  const rs = ["합리적","효과적","실질적","근거","구체적","전략","제안"];
  const sl = ["해결","조치","보상","교체","환불","연락","처리","지원","대응","즉시"];
  const cvHits = cv.filter(k => t.includes(k));
  const lgHits = lg.filter(k => t.includes(k));
  const rsHits = rs.filter(k => t.includes(k));
  const slHits = sl.filter(k => t.includes(k));
  const cvS = Math.min(10, 4 + cvHits.length * 1.2);
  const lgS = Math.min(3.3, 1 + lgHits.length * 0.8);
  const rsS = Math.min(3.3, 1 + rsHits.length * 0.8);
  const slS = Math.min(3.3, 1 + slHits.length * 0.8);
  const score = Math.max(10, Math.min(20, Math.round(cvS + lgS + rsS + slS)));
  return {
    score, isFallback: true,
    breakdown: { cv_value: Math.round(cvS*10)/10, logic: Math.round(lgS*10)/10, reason: Math.round(rsS*10)/10, solution: Math.round(slS*10)/10 },
    criteria_feedback: {
      cv_value: { score: Math.round(cvS*10)/10, max: 10, reason: cvHits.length > 0 ? `CooperVision 핵심 키워드(${cvHits.slice(0,3).join(", ")})가 사용되었습니다. AI 채점이 불가하여 키워드 기반으로 자동 산출된 점수입니다.` : "CooperVision 가치(헌신, 공감, 협력 등) 관련 키워드가 부족합니다. AI 채점이 불가하여 키워드 기반으로 자동 산출된 점수입니다." },
      logic:    { score: Math.round(lgS*10)/10, max: 3.3, reason: lgHits.length > 0 ? `논리 구조 키워드(${lgHits.join(", ")})가 포함되어 있습니다. 자동 산출된 점수입니다.` : "논리적 흐름을 나타내는 키워드(따라서, 먼저, 첫째 등)가 부족합니다. 자동 산출된 점수입니다." },
      reason:   { score: Math.round(rsS*10)/10, max: 3.3, reason: rsHits.length > 0 ? `합리성 키워드(${rsHits.join(", ")})가 포함되어 있습니다. 자동 산출된 점수입니다.` : "근거나 전략을 나타내는 키워드(합리적, 구체적, 근거 등)가 부족합니다. 자동 산출된 점수입니다." },
      solution: { score: Math.round(slS*10)/10, max: 3.3, reason: slHits.length > 0 ? `해결 방안 키워드(${slHits.join(", ")})가 포함되어 있습니다. 자동 산출된 점수입니다.` : "실행 가능한 조치를 나타내는 키워드(해결, 조치, 즉시 등)가 부족합니다. 자동 산출된 점수입니다." },
    },
    strengths: t.length >= 100 ? "답변의 분량이 충분하여 기본 점수가 보장되었습니다." : "",
    improvements: "AI 채점 서버에 연결하지 못해 자동 채점되었습니다. CooperVision 가치(헌신·혁신·친근·협력)와 구체적 실행 방안을 더 명확히 담으면 실제 채점 시 더 높은 점수를 받을 수 있습니다.",
    feedback: "자동 채점으로 대체되었습니다. 점수는 키워드 분석 기반이며 AI 재채점 시 달라질 수 있습니다.",
  };
}

async function scoreWithAI(mission, caseItem, answer) {
  if (answer.trim().length < 50) return { score: 0, isFallback: false, breakdown: { cv_value: 0, logic: 0, reason: 0, solution: 0 }, criteria_feedback: { cv_value: { score: 0, max: 10, reason: "답변이 50자 미만으로 채점되지 않습니다." }, logic: { score: 0, max: 3.3, reason: "답변이 50자 미만으로 채점되지 않습니다." }, reason: { score: 0, max: 3.3, reason: "답변이 50자 미만으로 채점되지 않습니다." }, solution: { score: 0, max: 3.3, reason: "답변이 50자 미만으로 채점되지 않습니다." } }, strengths: "", improvements: "", feedback: "답변이 50자 미만입니다." };

  const prompt = `당신은 CooperVision 워크샵 전문 채점관입니다.\n\n${CV_VALUES}\n\n[이 존의 핵심 가치]\n${mission.zoneValue}\n\n[고객 불만 시나리오]\n제목: ${caseItem.title}\n고객 발언: "${caseItem.quote}"\n배경: ${caseItem.background}\n\n[미션 질문]\n${mission.question}\n\n[참가자 답변]\n${answer}\n\n=== 채점 기준 (총 20점) ===\n50자 미만 → 0점 / 50자 이상 → 최소 10점 보장\n1. CooperVision 가치/문화 부합도 (최대 10점, 50%)\n2. 논리성 (최대 3.3점, 16.7%)\n3. 설명의 합리성 (최대 3.3점, 16.7%)\n4. 해결 가능성 (최대 3.3점, 16.7%)\n\n반드시 아래 JSON만 출력:\n{"score":숫자(10-20),"breakdown":{"cv_value":숫자(0-10),"logic":숫자(0-3.3),"reason":숫자(0-3.3),"solution":숫자(0-3.3)},"criteria_feedback":{"cv_value":{"score":숫자,"max":10,"reason":"CV 가치 반영 근거 2문장"},"logic":{"score":숫자,"max":3.3,"reason":"논리 구조 근거 1-2문장"},"reason":{"score":숫자,"max":3.3,"reason":"합리성 근거 1-2문장"},"solution":{"score":숫자,"max":3.3,"reason":"해결가능성 근거 1-2문장"}},"strengths":"잘한 점 2-3문장","improvements":"개선할 점 2-3문장","feedback":"종합 피드백 2-3문장"}`;

  const apiCall = fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 900, messages: [{ role: "user", content: prompt }] }) });
  const timeoutP = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), AI_TIMEOUT_MS));
  try {
    const res = await Promise.race([apiCall, timeoutP]);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await Promise.race([res.json(), timeoutP]);
    const text = data.content?.map(c => c.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();
    try {
      const p = JSON.parse(clean);
      if (typeof p.score === "number") { p.score = Math.max(10, Math.min(20, Math.round(p.score))); return { ...p, isFallback: false }; }
      throw new Error("invalid");
    } catch { return buildFallbackResult(answer); }
  } catch { return buildFallbackResult(answer); }
}

function ProgressDots({ current }) {
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
      {MISSIONS.map((m, i) => (
        <div key={m.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: "100%", height: 4, borderRadius: 2, background: i <= current ? m.color : "#E5E7EB", opacity: i < current ? 1 : i === current ? 0.6 : 0.2 }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: i <= current ? m.color : "#D1D5DB" }}>{m.zone}</span>
        </div>
      ))}
    </div>
  );
}

function CriteriaCard({ label, score, max, reason, color, weight }) {
  const pct = Math.min(100, (score / max) * 100);
  const grade = pct >= 80 ? "우수" : pct >= 60 ? "양호" : pct >= 40 ? "보통" : "미흡";
  const gc = pct >= 80 ? "#10B981" : pct >= 60 ? "#3B82F6" : pct >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "14px 16px", marginBottom: 10, border: "1px solid #E5E7EB" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#111", flex: 1 }}>{label}</span>
        <span style={{ fontSize: 10, color: "#9CA3AF" }}>{weight}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: gc, background: `${gc}15`, padding: "2px 8px", borderRadius: 10 }}>{grade}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color }}>{typeof score === "number" ? score.toFixed(1) : "–"}<span style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 400 }}>/{max.toFixed(1)}</span></span>
      </div>
      <div style={{ height: 5, background: "#F3F4F6", borderRadius: 3, marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 3, transition: "width 0.8s ease" }} />
      </div>
      {reason && <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.7, paddingLeft: 10, borderLeft: "2px solid #E5E7EB" }}>{reason}</div>}
    </div>
  );
}

function DetailedFeedback({ result, color, compact = false }) {
  const [show, setShow] = useState(!compact);
  if (!result) return null;
  const items = [{ key: "cv_value", label: "CooperVision 가치 부합", max: 10, weight: "50%" }, { key: "logic", label: "논리성", max: 3.3, weight: "16.7%" }, { key: "reason", label: "설명의 합리성", max: 3.3, weight: "16.7%" }, { key: "solution", label: "해결 가능성", max: 3.3, weight: "16.7%" }];
  return (
    <div>
      {result.criteria_feedback && (
        <div style={{ marginBottom: 12 }}>
          {compact && <button onClick={() => setShow(!show)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", background: "transparent", border: "none", cursor: "pointer", marginBottom: 8 }}><span style={{ fontSize: 12, fontWeight: 700, color: "#374151" }}>항목별 채점 근거</span><span style={{ fontSize: 11, color: "#9CA3AF" }}>{show ? "▲ 접기" : "▼ 펼치기"}</span></button>}
          {!compact && <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 10 }}>항목별 채점 근거</div>}
          {show && items.map(item => { const cf = result.criteria_feedback[item.key]; const sc = result.breakdown?.[item.key] ?? cf?.score ?? 0; return <CriteriaCard key={item.key} label={item.label} score={sc} max={item.max} reason={cf?.reason} color={color} weight={item.weight} />; })}
        </div>
      )}
      {result.strengths && <div style={{ background: "#F0FFF8", borderRadius: 10, padding: "12px 14px", marginBottom: 8, borderLeft: "3px solid #10B981" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#10B981", marginBottom: 5 }}>잘한 점</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{result.strengths}</div></div>}
      {result.improvements && <div style={{ background: "#FFFBF0", borderRadius: 10, padding: "12px 14px", marginBottom: 8, borderLeft: "3px solid #F59E0B" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#F59E0B", marginBottom: 5 }}>개선할 점</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{result.improvements}</div></div>}
      {!result.criteria_feedback && result.feedback && <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "12px 14px", marginBottom: 8 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 5 }}>피드백</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{result.feedback}</div></div>}
    </div>
  );
}

function ReportScreen({ teamName, missionIndex, result, selectedCase, mission, onClose }) {
  const items = [{ key: "cv_value", label: "CooperVision 가치 부합", max: 10, weight: "50%", desc: "이 존의 핵심 가치가 답변에 실질적으로 반영되었는가?" }, { key: "logic", label: "논리성", max: 3.3, weight: "16.7%", desc: "문제→원인→해결의 흐름이 체계적인가?" }, { key: "reason", label: "설명의 합리성", max: 3.3, weight: "16.7%", desc: "해결책의 근거가 납득 가능한가?" }, { key: "solution", label: "해결 가능성", max: 3.3, weight: "16.7%", desc: "실제 현업에서 실행 가능한 방안인가?" }];
  const pct = Math.round((result.score / 20) * 100);
  const grade = pct >= 90 ? "S" : pct >= 75 ? "A" : pct >= 60 ? "B" : pct >= 40 ? "C" : "D";
  const gc = pct >= 90 ? "#7C3AED" : pct >= 75 ? "#059669" : pct >= 60 ? "#0284C7" : pct >= 40 ? "#F59E0B" : "#EF4444";
  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FA" }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onClose} style={{ padding: "6px 12px", background: "#F3F4F6", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#374151" }}>← 돌아가기</button>
        <div style={{ flex: 1, textAlign: "center" }}><div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1 }}>COOPERVISION DIFF WORKSHOP</div><div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>채점 리포트</div></div>
        <div style={{ fontSize: 11, color: "#9CA3AF" }}>미션 {missionIndex + 1}/5</div>
      </div>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "20px 20px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: "24px", marginBottom: 16, border: "1px solid #E5E7EB", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#9CA3AF", letterSpacing: 1, marginBottom: 4 }}>{teamName}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center", marginBottom: 4 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: mission.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700 }}>{mission.zone}</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: "#111" }}>{mission.title}</div>
          </div>
          {selectedCase && <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 16 }}>{selectedCase.num} · {selectedCase.title}</div>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
            <div><div style={{ fontFamily: "Georgia, serif", fontSize: 56, fontWeight: 800, color: mission.color, lineHeight: 1 }}>{result.score}</div><div style={{ fontSize: 13, color: "#6B7280" }}>/ 20점</div></div>
            <div style={{ width: 1, height: 60, background: "#E5E7EB" }} />
            <div><div style={{ fontFamily: "Georgia, serif", fontSize: 56, fontWeight: 800, color: gc, lineHeight: 1 }}>{grade}</div><div style={{ fontSize: 13, color: "#6B7280" }}>등급</div></div>
          </div>
          <div style={{ marginTop: 16, height: 8, background: "#F3F4F6", borderRadius: 4 }}><div style={{ height: "100%", width: `${pct}%`, background: mission.color, borderRadius: 4 }} /></div>
          <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{pct}% 달성</div>
          {result.isFallback && <div style={{ marginTop: 8, fontSize: 11, color: "#F59E0B", background: "#FFFBF0", padding: "4px 12px", borderRadius: 20, display: "inline-block" }}>⚠ 자동 채점 (AI 연결 실패)</div>}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 16, border: "1px solid #E5E7EB" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #E5E7EB" }}>항목별 채점 결과</div>
          {items.map((item, idx) => {
            const cf = result.criteria_feedback?.[item.key];
            const sc = result.breakdown?.[item.key] ?? cf?.score ?? 0;
            const ip = Math.min(100, (sc / item.max) * 100);
            const ig = ip >= 80 ? { label: "우수", color: "#059669", bg: "#F0FFF8" } : ip >= 60 ? { label: "양호", color: "#0284C7", bg: "#EFF6FF" } : ip >= 40 ? { label: "보통", color: "#F59E0B", bg: "#FFFBF0" } : { label: "미흡", color: "#EF4444", bg: "#FFF1F2" };
            return (
              <div key={item.key} style={{ marginBottom: idx < items.length - 1 ? 20 : 0, paddingBottom: idx < items.length - 1 ? 20 : 0, borderBottom: idx < items.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `${mission.color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: mission.color, flexShrink: 0 }}>{idx + 1}</div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{item.label}</div><div style={{ fontSize: 11, color: "#9CA3AF" }}>{item.desc} · 가중치 {item.weight}</div></div>
                  <div style={{ textAlign: "right" }}><span style={{ fontSize: 11, fontWeight: 700, color: ig.color, background: ig.bg, padding: "2px 8px", borderRadius: 10, marginRight: 8 }}>{ig.label}</span><span style={{ fontSize: 16, fontWeight: 800, color: mission.color }}>{typeof sc === "number" ? sc.toFixed(1) : "–"}</span><span style={{ fontSize: 11, color: "#9CA3AF" }}>/{item.max.toFixed(1)}</span></div>
                </div>
                <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3, marginBottom: 10, marginLeft: 38 }}><div style={{ height: "100%", width: `${ip}%`, background: mission.color, borderRadius: 3 }} /></div>
                {cf?.reason && <div style={{ marginLeft: 38, background: "#F8F9FA", borderRadius: 8, padding: "10px 14px", borderLeft: `3px solid ${mission.color}` }}><div style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", marginBottom: 4 }}>채점 근거</div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{cf.reason}</div></div>}
              </div>
            );
          })}
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", marginBottom: 16, border: "1px solid #E5E7EB" }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 16, paddingBottom: 10, borderBottom: "1px solid #E5E7EB" }}>종합 피드백</div>
          {result.strengths && <div style={{ marginBottom: 12 }}><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>+</span></div><span style={{ fontSize: 13, fontWeight: 700, color: "#10B981" }}>잘한 점</span></div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, paddingLeft: 28 }}>{result.strengths}</div></div>}
          {result.improvements && <div><div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}><div style={{ width: 20, height: 20, borderRadius: "50%", background: "#F59E0B", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>↑</span></div><span style={{ fontSize: 13, fontWeight: 700, color: "#F59E0B" }}>개선할 점</span></div><div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, paddingLeft: 28 }}>{result.improvements}</div></div>}
          {!result.strengths && result.feedback && <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{result.feedback}</div>}
        </div>
        <div style={{ background: mission.bg, borderRadius: 16, padding: "20px", border: `1px solid ${mission.color}20` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: mission.color, marginBottom: 10 }}>{mission.title} 핵심 가이드</div>
          <div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.7 }}><strong>{mission.zoneValue.split("—")[0].trim()}</strong> — {mission.zoneValue.split("—")[1]?.trim()}</div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>다음 번에는 이 가치를 답변의 도입부에서 명확히 언급하고, 구체적인 실행 방안과 연결해보세요.</div>
        </div>
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onInstructor }) {
  const [name, setName] = useState(""); const [pin, setPin] = useState(""); const [showPin, setShowPin] = useState(false); const [pinErr, setPinErr] = useState(false);
  const tryPin = () => { if (pin === INSTRUCTOR_PIN) onInstructor(); else { setPinErr(true); setTimeout(() => setPinErr(false), 1500); } };
  return (
    <div style={S.screen}><div style={S.card}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", letterSpacing: 3, marginBottom: 8 }}>COOPERVISION</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color: "#111", marginBottom: 6 }}>DIFF 워크샵</div>
        <p style={{ fontSize: 13, color: "#6B7280" }}>5개 존 · 10개 실제 고객 시나리오 · AI 채점</p>
      </div>
      <div style={{ background: "#F9FAFB", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#374151", marginBottom: 8 }}>채점 기준 (존당 20점)</div>
        {[{ l: "CooperVision 가치 부합", s: "10점", w: "50%", bold: true }, { l: "논리성", s: "3.3점", w: "16.7%" }, { l: "설명의 합리성", s: "3.3점", w: "16.7%" }, { l: "해결 가능성", s: "3.3점", w: "16.7%" }].map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: i < 3 ? "0.5px solid #E5E7EB" : "none" }}>
            <span style={{ fontSize: 12, color: "#4B5563", fontWeight: r.bold ? 600 : 400 }}>{r.l}</span>
            <div style={{ display: "flex", gap: 8 }}><span style={{ fontSize: 11, color: "#9CA3AF" }}>{r.w}</span><span style={{ fontSize: 12, fontWeight: 700, color: r.bold ? "#7C3AED" : "#059669" }}>{r.s}</span></div>
          </div>
        ))}
        <div style={{ marginTop: 8, fontSize: 11, color: "#9CA3AF", textAlign: "center" }}>✦ 50자 이상 최소 10점 · 항목별 채점 근거 · 상세 리포트 제공</div>
      </div>
      <div style={{ background: "#F9FAFB", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-around" }}>
        {MISSIONS.map(m => <div key={m.id} style={{ textAlign: "center" }}><div style={{ width: 34, height: 34, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, margin: "0 auto 4px" }}>{m.zone}</div><div style={{ fontSize: 10, color: "#6B7280" }}>{m.title.replace(" 존", "")}</div></div>)}
      </div>
      <label style={S.label}>팀 이름</label>
      <input style={S.input} placeholder="예) 드림팀" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && name.trim() && onLogin(name.trim())} autoFocus />
      <button style={{ ...S.btn, opacity: name.trim() ? 1 : 0.4, cursor: name.trim() ? "pointer" : "default", marginBottom: 12 }} onClick={() => name.trim() && onLogin(name.trim())}>게임 시작 →</button>
      <div style={{ borderTop: "0.5px solid #E5E7EB", paddingTop: 14 }}>
        {!showPin ? <button onClick={() => setShowPin(true)} style={{ width: "100%", padding: "10px", fontSize: 13, fontWeight: 500, color: "#6B7280", background: "transparent", border: "1px dashed #D1D5DB", borderRadius: 10, cursor: "pointer" }}>강사 Control Tower 입장</button>
          : <div style={{ display: "flex", gap: 8 }}><input style={{ ...S.input, marginBottom: 0, flex: 1, borderColor: pinErr ? "#EF4444" : "#E5E7EB", fontSize: 14 }} placeholder="PIN 입력" type="password" value={pin} onChange={e => setPin(e.target.value)} onKeyDown={e => e.key === "Enter" && tryPin()} /><button onClick={tryPin} style={{ ...S.btn, width: "auto", padding: "12px 18px", fontSize: 13, background: pinErr ? "#EF4444" : "#1E1B4B" }}>{pinErr ? "오류" : "입장"}</button></div>}
      </div>
    </div></div>
  );
}

function MissionScreen({ teamName, missionIndex, scores, onNext, onGoTower }) {
  const mission = MISSIONS[missionIndex];
  const [phase, setPhase] = useState("select");
  const [selectedCase, setSelectedCase] = useState(null);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const charCount = answer.trim().length;
  const runningTotal = scores.reduce((a, b) => a + b.score, 0);
  const isLast = missionIndex === MISSIONS.length - 1;

  const handleSubmit = async () => {
    if (!answer.trim() || loading) return;
    setLoading(true);
    const res = await scoreWithAI(mission, selectedCase, answer);
    setResult(res); setLoading(false); setPhase("result");
  };
  const handleGoNext = () => { if (transitioning) return; setTransitioning(true); onNext(result); };

  if (showReport && result && selectedCase) return <ReportScreen teamName={teamName} missionIndex={missionIndex} result={result} selectedCase={selectedCase} mission={mission} onClose={() => setShowReport(false)} />;

  return (
    <div style={S.screen}><div style={S.card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{teamName}</span>
        <span style={{ fontSize: 12, color: "#9CA3AF", background: "#F3F4F6", padding: "3px 10px", borderRadius: 20 }}>누적 {runningTotal}점 · {missionIndex + 1}/{MISSIONS.length}</span>
      </div>
      <ProgressDots current={missionIndex} />
      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: mission.bg, marginBottom: 22 }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: mission.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, flexShrink: 0, boxShadow: `0 4px 16px ${mission.color}55` }}>{mission.zone}</div>
        <div><div style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: "#111" }}>{mission.title}</div><div style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>{mission.description}</div></div>
      </div>

      {phase === "select" && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", textAlign: "center", marginBottom: 4 }}>시나리오를 선택하세요</div>
          <div style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginBottom: 20 }}>제목을 고르면 상세 내용이 공개됩니다</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mission.cases.map((c, i) => (
              <button key={i} onClick={() => { setSelectedCase(c); setPhase("detail"); }} style={{ width: "100%", padding: "18px 20px", background: "#fff", border: `1.5px solid ${mission.color}25`, borderRadius: 14, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = mission.color; e.currentTarget.style.background = mission.bg; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${mission.color}25`; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${mission.color}15`, color: mission.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 11, color: mission.color, fontWeight: 600, marginBottom: 3 }}>{c.num}</div><div style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>{c.title}</div></div>
                <span style={{ fontSize: 20, color: `${mission.color}50` }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === "detail" && selectedCase && (
        <div>
          <div style={{ background: "#F9FAFB", borderRadius: 14, padding: "18px", borderLeft: `4px solid ${mission.color}`, marginBottom: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#111", marginBottom: 12 }}>{selectedCase.title}</div>
            <div style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.8 }}>고객 불만</div>
              <div style={{ fontSize: 14, color: "#1F2937", lineHeight: 1.7, fontStyle: "italic", paddingLeft: 12, borderLeft: `3px solid ${mission.color}` }}>"{selectedCase.quote}"</div>
            </div>
            <div style={{ marginBottom: 12 }}><div style={{ fontSize: 11, fontWeight: 600, color: "#9CA3AF", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.8 }}>상황 배경</div><div style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6 }}>{selectedCase.background}</div></div>
            <span style={{ display: "inline-block", fontSize: 12, fontWeight: 600, padding: "4px 12px", borderRadius: 20, background: mission.tagBg, color: mission.tagColor }}>핵심 역량: {selectedCase.skill}</span>
          </div>
          <div style={{ background: mission.bg, borderRadius: 10, padding: "10px 14px", marginBottom: 14, border: `1px solid ${mission.color}20` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: mission.color, marginBottom: 3 }}>채점 포인트</div>
            <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.5 }}><span style={{ fontWeight: 600 }}>CV 가치 (10점)</span> — {mission.zoneValue.split("—")[1]?.trim()}<br /><span style={{ color: "#9CA3AF" }}>+ 논리성 · 합리성 · 해결가능성 각 3.3점</span></div>
          </div>
          <div style={{ background: "#111", borderRadius: 10, padding: "14px 16px", marginBottom: 18, fontSize: 15, color: "#fff", lineHeight: 1.6, fontWeight: 500 }}>Q. {mission.question}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setSelectedCase(null); setPhase("select"); }} style={{ flex: 1, padding: "13px", fontSize: 14, fontWeight: 600, color: "#6B7280", background: "#F3F4F6", border: "none", borderRadius: 12, cursor: "pointer" }}>← 다시 선택</button>
            <button onClick={() => setPhase("answer")} style={{ flex: 2, ...S.btn, background: mission.color, boxShadow: `0 4px 20px ${mission.color}44` }}>답변 작성하기 →</button>
          </div>
        </div>
      )}

      {phase === "answer" && selectedCase && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: mission.bg, marginBottom: 14, border: `1px solid ${mission.color}30` }}>
            <span style={{ background: mission.color, color: "#fff", padding: "2px 8px", borderRadius: 20, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{selectedCase.num}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111", flex: 1 }}>{selectedCase.title}</span>
            <button onClick={() => setPhase("detail")} style={{ fontSize: 11, color: mission.color, background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}>상세 보기</button>
          </div>
          <div style={{ background: "#111", borderRadius: 10, padding: "12px 16px", marginBottom: 14, fontSize: 14, color: "#fff", lineHeight: 1.6, fontWeight: 500 }}>Q. {mission.question}</div>
          <textarea style={{ ...S.textarea, borderColor: charCount > 0 ? mission.color : "#E5E7EB" }} placeholder="CooperVision 가치를 담아 답변을 작성하세요..." value={answer} onChange={e => setAnswer(e.target.value)} rows={6} disabled={loading} autoFocus />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: charCount < 50 ? "#F59E0B" : "#10B981" }}>{charCount}자</span>
              {charCount < 50 ? <span style={{ fontSize: 11, color: "#F59E0B" }}>({50 - charCount}자 더 쓰면 최소 10점)</span> : <span style={{ fontSize: 11, color: "#10B981" }}>최소 10점 보장 ✓</span>}
            </div>
          </div>
          {loading && <div style={{ background: mission.bg, borderRadius: 12, padding: "14px", marginBottom: 14, textAlign: "center" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}><span style={S.spinner} /><span style={{ fontSize: 14, fontWeight: 600, color: mission.color }}>AI 채점 중...</span></div><div style={{ fontSize: 12, color: "#9CA3AF" }}>잠시 기다려주세요 (최대 25초)</div></div>}
          <button style={{ ...S.btn, background: mission.color, boxShadow: `0 4px 20px ${mission.color}44`, opacity: answer.trim() && !loading ? 1 : 0.4, cursor: answer.trim() && !loading ? "pointer" : "default" }} onClick={handleSubmit}>{loading ? "채점 중..." : "제출 & AI 채점 →"}</button>
        </div>
      )}

      {phase === "result" && result && selectedCase && (
        <div>
          <div style={{ textAlign: "center", padding: "20px", background: mission.bg, borderRadius: 14, border: `1.5px solid ${mission.color}30`, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: mission.color, letterSpacing: 1, marginBottom: 6 }}>{result.isFallback ? "자동 채점" : "AI 채점"} · {selectedCase.num}</div>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 60, fontWeight: 800, color: mission.color, lineHeight: 1, marginBottom: 2 }}>{result.score}</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>/ {MAX_SCORE}점</div>
            <button onClick={() => setShowReport(true)} style={{ fontSize: 12, fontWeight: 600, color: mission.color, background: "transparent", border: `1.5px solid ${mission.color}`, borderRadius: 20, padding: "5px 16px", cursor: "pointer" }}>상세 리포트 보기 →</button>
          </div>
          <DetailedFeedback result={result} color={mission.color} compact={true} />
          <button style={{ ...S.btn, background: mission.color, boxShadow: `0 4px 20px ${mission.color}44`, marginTop: 4, opacity: transitioning ? 0.5 : 1, cursor: transitioning ? "default" : "pointer" }} onClick={handleGoNext}>
            {transitioning ? "이동 중..." : isLast ? "최종 결과 보기 →" : `다음: ${MISSIONS[missionIndex + 1].title} →`}
          </button>
          <button onClick={onGoTower} style={{ width: "100%", marginTop: 10, padding: "10px", fontSize: 12, fontWeight: 600, color: "#6B7280", background: "transparent", border: "1px dashed #D1D5DB", borderRadius: 10, cursor: "pointer" }}>
            강사 Control Tower로 전환
          </button>
        </div>
      )}
    </div></div>
  );
}

function FinalScreen({ teamName, scores, onRestart, onGoTower }) {
  const total = scores.reduce((a, b) => a + b.score, 0);
  const pct = Math.round((total / MAX_TOTAL) * 100);
  const [expanded, setExpanded] = useState(null);
  const [reportTarget, setReportTarget] = useState(null);

  if (reportTarget !== null && scores[reportTarget]) {
    return <ReportScreen teamName={teamName} missionIndex={reportTarget} result={scores[reportTarget]} selectedCase={null} mission={MISSIONS[reportTarget]} onClose={() => setReportTarget(null)} />;
  }

  return (
    <div style={S.screen}><div style={S.card}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 24, fontWeight: 700, color: "#111" }}>모든 미션 완료!</div>
        <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>{teamName}의 최종 결과</div>
      </div>
      <div style={{ background: "linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)", borderRadius: 16, padding: "20px 24px", marginBottom: 20, color: "#fff", textAlign: "center" }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>총 점수</div>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 56, fontWeight: 700, lineHeight: 1 }}>{total}</div>
        <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 16 }}>/ {MAX_TOTAL}점 ({pct}%)</div>
        <div style={{ display: "flex", gap: 8 }}>
          {scores.map((s, i) => <div key={i} style={{ flex: 1, textAlign: "center" }}><div style={{ height: 36, background: "rgba(255,255,255,0.12)", borderRadius: 4, display: "flex", alignItems: "flex-end", overflow: "hidden", marginBottom: 4 }}><div style={{ width: "100%", height: `${(s.score / MAX_SCORE) * 100}%`, background: MISSIONS[i].color, borderRadius: 3 }} /></div><div style={{ fontSize: 10, opacity: 0.7 }}>{MISSIONS[i].zone}</div><div style={{ fontSize: 11, fontWeight: 700 }}>{s.score}</div></div>)}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>존별 상세 피드백</div>
        {scores.map((s, i) => { const m = MISSIONS[i]; const open = expanded === i; return (
          <div key={i} style={{ marginBottom: 8, border: `1px solid ${open ? m.color : "#E5E7EB"}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", background: open ? m.bg : "#fff" }}>
              <button onClick={() => setExpanded(open ? null : i)} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{m.zone}</div>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{m.title}</div><div style={{ height: 3, background: "#E5E7EB", borderRadius: 2, marginTop: 4 }}><div style={{ height: "100%", width: `${(s.score / MAX_SCORE) * 100}%`, background: m.color, borderRadius: 2 }} /></div></div>
                <div style={{ fontFamily: "Georgia, serif", fontSize: 20, fontWeight: 700, color: m.color }}>{s.score}점</div>
                <span style={{ fontSize: 11, color: "#9CA3AF" }}>{open ? "▲" : "▼"}</span>
              </button>
              <button onClick={() => setReportTarget(i)} style={{ padding: "6px 12px", margin: "0 8px", fontSize: 11, fontWeight: 600, color: m.color, background: `${m.color}15`, border: "none", borderRadius: 16, cursor: "pointer", whiteSpace: "nowrap" }}>리포트</button>
            </div>
            {open && <div style={{ padding: "0 16px 16px", background: m.bg }}><DetailedFeedback result={s} color={m.color} compact={true} /></div>}
          </div>
        ); })}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button style={{ ...S.btn, background: "#374151", flex: 1 }} onClick={onRestart}>처음으로</button>
        <button onClick={onGoTower} style={{ flex: 1, padding: "14px", fontSize: 14, fontWeight: 600, color: "#6B7280", background: "transparent", border: "1.5px solid #D1D5DB", borderRadius: 12, cursor: "pointer" }}>
          강사 모드 →
        </button>
      </div>
    </div></div>
  );
}

function ControlTower({ onExit }) {
  const [teams, setTeams] = useState([]); const [loading, setLoading] = useState(false); const [selectedTeam, setSelectedTeam] = useState(null); const [zoneFilter, setZoneFilter] = useState(null); const [lastRefresh, setLastRefresh] = useState("–"); const [confirmClear, setConfirmClear] = useState(false);
  const refresh = async () => {
    setLoading(true);
    try {
      const data = await loadAllTeams();
      setTeams(data);
      setLastRefresh(new Date().toLocaleTimeString("ko-KR"));
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  // Firebase 실시간 리스너 — 팀 제출 즉시 자동 반영
  useEffect(() => {
    refresh();
    const unsubscribe = onValue(ref(db, DB_PATH), (snapshot) => {
      if (snapshot.exists()) {
        const data = Object.values(snapshot.val()).sort((a, b) => b.total - a.total);
        setTeams(data);
        setLastRefresh(new Date().toLocaleTimeString("ko-KR"));
      } else {
        setTeams([]);
      }
    });
    return () => unsubscribe();
  }, []);
  const handleClear = async () => { await clearAllTeams(); setTeams([]); setConfirmClear(false); setSelectedTeam(null); };
  const viewTeams = zoneFilter !== null ? [...teams].filter(t => t.scores?.[zoneFilter]).sort((a, b) => (b.scores[zoneFilter]?.score || 0) - (a.scores[zoneFilter]?.score || 0)) : teams;

  const TeamCard = ({ t, rank }) => {
    const open = selectedTeam === t.team; const [openZone, setOpenZone] = useState(null);
    return (
      <div style={{ background: open ? "#1E293B" : "#1A2332", border: `1px solid ${open ? "#4F46E5" : "#334155"}`, borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 18px", cursor: "pointer" }} onClick={() => setSelectedTeam(open ? null : t.team)}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: rank === 0 ? "#F59E0B" : rank === 1 ? "#9CA3AF" : rank === 2 ? "#B45309" : "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{rank + 1}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{t.team}</div><div style={{ height: 4, background: "#334155", borderRadius: 2, marginTop: 5 }}><div style={{ height: "100%", width: `${Math.round((t.total / MAX_TOTAL) * 100)}%`, background: rank === 0 ? "#F59E0B" : "#4F46E5", borderRadius: 2 }} /></div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: rank === 0 ? "#F59E0B" : "#fff" }}>{t.total}</div><div style={{ fontSize: 11, color: "#64748B" }}>/{MAX_TOTAL}점</div></div>
            <span style={{ fontSize: 11, color: "#64748B" }}>{open ? "▲" : "▼"}</span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {MISSIONS.map((m, j) => { const s = t.scores?.[j]; return <div key={j} style={{ flex: 1, textAlign: "center" }}><div style={{ height: 22, background: "#0F172A", borderRadius: 4, display: "flex", alignItems: "flex-end", overflow: "hidden", marginBottom: 3 }}><div style={{ width: "100%", height: s ? `${(s.score / MAX_SCORE) * 100}%` : "0%", background: m.color, opacity: s ? 1 : 0.15 }} /></div><div style={{ fontSize: 9, color: "#64748B" }}>{m.zone}</div><div style={{ fontSize: 11, fontWeight: 700, color: s ? "#fff" : "#334155" }}>{s ? s.score : "–"}</div></div>; })}
          </div>
        </div>
        {open && t.scores && (
          <div style={{ borderTop: "1px solid #334155", padding: "14px 18px" }}>
            {t.scores.map((s, j) => { const m = MISSIONS[j]; const zOpen = openZone === j; return (
              <div key={j} style={{ marginBottom: 14 }}>
                <button onClick={() => setOpenZone(zOpen ? null : j)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none", cursor: "pointer", padding: "6px 0", borderBottom: "1px solid #334155", marginBottom: 8 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: m.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{m.zone}</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1", flex: 1, textAlign: "left" }}>{m.title}</span>
                  <span style={{ fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700, color: m.color }}>{s.score}점</span>
                  <span style={{ fontSize: 10, color: "#64748B", marginLeft: 6 }}>{zOpen ? "▲" : "▼"}</span>
                </button>
                {zOpen && (
                  <div>
                    {s.breakdown && <div style={{ display: "flex", gap: 5, marginBottom: 10 }}>{[{ l: "CV가치", v: s.breakdown.cv_value, max: 10 }, { l: "논리", v: s.breakdown.logic, max: 3.3 }, { l: "합리", v: s.breakdown.reason, max: 3.3 }, { l: "해결", v: s.breakdown.solution, max: 3.3 }].map((item, k) => <div key={k} style={{ flex: 1, background: "#0F172A", borderRadius: 6, padding: "6px 8px", textAlign: "center" }}><div style={{ fontSize: 9, color: "#64748B", marginBottom: 2 }}>{item.l}</div><div style={{ fontSize: 12, fontWeight: 700, color: m.color }}>{typeof item.v === "number" ? item.v.toFixed(1) : "–"}</div><div style={{ height: 3, background: "#1E293B", borderRadius: 2, marginTop: 3 }}><div style={{ height: "100%", width: `${typeof item.v === "number" ? Math.min(100, (item.v / item.max) * 100) : 0}%`, background: m.color, borderRadius: 2 }} /></div></div>)}</div>}
                    {s.criteria_feedback && <div style={{ marginBottom: 8 }}>{[{ key: "cv_value", label: "CooperVision 가치", max: 10 }, { key: "logic", label: "논리성", max: 3.3 }, { key: "reason", label: "합리성", max: 3.3 }, { key: "solution", label: "해결 가능성", max: 3.3 }].map(item => { const cf = s.criteria_feedback[item.key]; const sc = s.breakdown?.[item.key] ?? cf?.score ?? 0; const p = Math.min(100, (sc / item.max) * 100); return <div key={item.key} style={{ background: "#0F172A", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>{item.label}</span><span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{typeof sc === "number" ? sc.toFixed(1) : "–"}/{item.max.toFixed(1)}</span></div><div style={{ height: 3, background: "#1E293B", borderRadius: 2, marginBottom: cf?.reason ? 6 : 0 }}><div style={{ height: "100%", width: `${p}%`, background: m.color, borderRadius: 2 }} /></div>{cf?.reason && <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{cf.reason}</div>}</div>; })}</div>}
                    {s.strengths && <div style={{ background: "#0F172A", borderRadius: 7, padding: "8px 10px", marginBottom: 5, borderLeft: "3px solid #10B981" }}><div style={{ fontSize: 9, color: "#10B981", fontWeight: 700, marginBottom: 3 }}>잘한 점</div><div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{s.strengths}</div></div>}
                    {s.improvements && <div style={{ background: "#0F172A", borderRadius: 7, padding: "8px 10px", borderLeft: "3px solid #F59E0B" }}><div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700, marginBottom: 3 }}>개선할 점</div><div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{s.improvements}</div></div>}
                  </div>
                )}
              </div>
            ); })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0F172A", color: "#fff" }}>
      <div style={{ background: "#1E293B", borderBottom: "1px solid #334155", padding: "14px 20px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 180 }}><div style={{ fontSize: 10, color: "#64748B", letterSpacing: 2, marginBottom: 2 }}>COOPERVISION DIFF WORKSHOP</div><div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700 }}>Control Tower</div></div>
        <div style={{ fontSize: 11, color: "#64748B" }}>갱신 {lastRefresh} · 15초 자동</div>
        <button onClick={refresh} style={{ padding: "6px 12px", background: "#334155", border: "none", borderRadius: 8, color: "#CBD5E1", fontSize: 12, cursor: "pointer" }}>새로고침</button>
        {!confirmClear ? <button onClick={() => setConfirmClear(true)} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #EF4444", borderRadius: 8, color: "#EF4444", fontSize: 12, cursor: "pointer" }}>데이터 초기화</button>
          : <div style={{ display: "flex", gap: 6 }}><button onClick={handleClear} style={{ padding: "6px 12px", background: "#EF4444", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, cursor: "pointer" }}>확인</button><button onClick={() => setConfirmClear(false)} style={{ padding: "6px 12px", background: "#334155", border: "none", borderRadius: 8, color: "#CBD5E1", fontSize: 12, cursor: "pointer" }}>취소</button></div>}
        <button onClick={onExit} style={{ padding: "6px 12px", background: "transparent", border: "1px solid #475569", borderRadius: 8, color: "#94A3B8", fontSize: 12, cursor: "pointer" }}>나가기</button>
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          <button onClick={() => setZoneFilter(null)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: zoneFilter === null ? "#fff" : "#1E293B", color: zoneFilter === null ? "#0F172A" : "#64748B" }}>전체 순위</button>
          {MISSIONS.map((m, i) => <button key={i} onClick={() => setZoneFilter(zoneFilter === i ? null : i)} style={{ padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, background: zoneFilter === i ? m.color : "#1E293B", color: zoneFilter === i ? "#fff" : "#64748B" }}>{m.zone} — {m.title.replace(" 존", "")}</button>)}
        </div>
        {loading && <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, padding: "8px 14px", background: "#1E293B", borderRadius: 8, width: "fit-content" }}><span style={{ display: "inline-block", width: 12, height: 12, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /><span style={{ fontSize: 12, color: "#94A3B8" }}>데이터 불러오는 중...</span></div>}
        {!loading && teams.length === 0 ? <div style={{ textAlign: "center", padding: 60, color: "#64748B" }}>아직 제출한 팀이 없습니다</div>
          : zoneFilter === null ? <div><div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>{teams.length}개 팀 · 팀 클릭 → 존 클릭 → 항목별 채점 근거</div>{viewTeams.map((t, i) => <TeamCard key={t.team} t={t} rank={i} />)}</div>
          : <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: MISSIONS[zoneFilter].color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>{MISSIONS[zoneFilter].zone}</div>
                <div><div style={{ fontFamily: "Georgia, serif", fontSize: 17, fontWeight: 700 }}>{MISSIONS[zoneFilter].title}</div><div style={{ fontSize: 12, color: "#64748B" }}>{viewTeams.length}개 팀 비교</div></div>
              </div>
              {viewTeams.map((t, i) => { const s = t.scores?.[zoneFilter]; const m = MISSIONS[zoneFilter]; if (!s) return null; return (
                <div key={t.team} style={{ background: "#1A2332", border: "1px solid #334155", borderRadius: 14, padding: "16px 18px", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: i === 0 ? "#F59E0B" : "#334155", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                    <span style={{ fontSize: 15, fontWeight: 700, flex: 1 }}>{t.team}</span>
                    <span style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: m.color }}>{s.score}점</span>
                  </div>
                  {s.criteria_feedback && <div>{[{ key: "cv_value", label: "CooperVision 가치", max: 10 }, { key: "logic", label: "논리성", max: 3.3 }, { key: "reason", label: "합리성", max: 3.3 }, { key: "solution", label: "해결 가능성", max: 3.3 }].map(item => { const cf = s.criteria_feedback[item.key]; const sc = s.breakdown?.[item.key] ?? cf?.score ?? 0; const p = Math.min(100, (sc / item.max) * 100); return <div key={item.key} style={{ background: "#0F172A", borderRadius: 8, padding: "8px 10px", marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}><span style={{ fontSize: 11, fontWeight: 600, color: "#CBD5E1" }}>{item.label}</span><span style={{ fontSize: 11, fontWeight: 700, color: m.color }}>{typeof sc === "number" ? sc.toFixed(1) : "–"}/{item.max.toFixed(1)}</span></div><div style={{ height: 3, background: "#1E293B", borderRadius: 2, marginBottom: cf?.reason ? 6 : 0 }}><div style={{ height: "100%", width: `${p}%`, background: m.color, borderRadius: 2 }} /></div>{cf?.reason && <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{cf.reason}</div>}</div>; })}</div>}
                  {s.strengths && <div style={{ background: "#0F172A", borderRadius: 8, padding: "8px 10px", marginBottom: 6, marginTop: 6, borderLeft: "3px solid #10B981" }}><div style={{ fontSize: 9, color: "#10B981", fontWeight: 700, marginBottom: 3 }}>잘한 점</div><div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{s.strengths}</div></div>}
                  {s.improvements && <div style={{ background: "#0F172A", borderRadius: 8, padding: "8px 10px", borderLeft: "3px solid #F59E0B" }}><div style={{ fontSize: 9, color: "#F59E0B", fontWeight: 700, marginBottom: 3 }}>개선할 점</div><div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.6 }}>{s.improvements}</div></div>}
                </div>
              ); })}
            </div>}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("login");
  const [teamName, setTeamName] = useState("");
  const [missionIndex, setMissionIndex] = useState(0);
  const [scores, setScores] = useState([]);

  const handleNext = (result) => {
    const next = [...scores, result];
    setScores(next);
    if (missionIndex < MISSIONS.length - 1) { setMissionIndex(missionIndex + 1); }
    else { upsertTeam({ team: teamName, scores: next, total: next.reduce((a, b) => a + b.score, 0) }).catch(() => {}); setView("final"); }
  };
  const handleLogin = (name) => { setTeamName(name); setMissionIndex(0); setScores([]); setView("game"); };
  const handleRestart = () => { setTeamName(""); setMissionIndex(0); setScores([]); setView("login"); };
  const handleGoTower = () => { setView("tower"); };

  return (
    <>
      <style>{`* { box-sizing: border-box; margin: 0; padding: 0; } body { background: #F3F4F6; font-family: -apple-system, 'Helvetica Neue', sans-serif; } input:focus, textarea:focus { outline: none; } @keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {view === "login" && <LoginScreen onLogin={handleLogin} onInstructor={() => setView("tower")} />}
      {view === "game"  && <MissionScreen key={`mission-${missionIndex}`} teamName={teamName} missionIndex={missionIndex} scores={scores} onNext={handleNext} onGoTower={handleGoTower} />}
      {view === "final" && <FinalScreen teamName={teamName} scores={scores} onRestart={handleRestart} onGoTower={handleGoTower} />}
      {view === "tower" && <ControlTower onExit={() => setView("login")} />}
    </>
  );
}

const S = {
  screen:   { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", background: "#F3F4F6" },
  card:     { width: "100%", maxWidth: 500, background: "#fff", borderRadius: 20, padding: "28px 24px", boxShadow: "0 4px 40px rgba(0,0,0,0.08)", animation: "fadeUp 0.4s ease" },
  label:    { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 },
  input:    { width: "100%", padding: "12px 16px", fontSize: 16, border: "1.5px solid #E5E7EB", borderRadius: 10, fontFamily: "inherit", color: "#111", marginBottom: 16 },
  textarea: { width: "100%", padding: "14px 16px", fontSize: 15, border: "1.5px solid #E5E7EB", borderRadius: 10, fontFamily: "inherit", color: "#111", resize: "vertical", lineHeight: 1.6, marginBottom: 8, transition: "border-color 0.2s" },
  btn:      { display: "block", width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, color: "#fff", background: "#1E1B4B", border: "none", borderRadius: 12, cursor: "pointer", fontFamily: "inherit", transition: "opacity 0.2s", boxShadow: "0 4px 20px rgba(30,27,75,0.2)" },
  spinner:  { display: "inline-block", width: 14, height: 14, border: "2px solid rgba(0,0,0,0.1)", borderTopColor: "currentColor", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
};
