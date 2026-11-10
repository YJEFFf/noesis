// Authored UI fixtures. These are NOT actual filings or announced company dates.
export type CompanySchedule = {
  id: string; code: string; date: string; time: string | null;
  title: string; type: string; status: "예정" | "일정 변경";
  summary: string; change?: string;
};
export type CompanyFiling = {
  id: string; code: string; receivedDate: string; title: string;
  type: string; status: "신규" | "정정" | "철회"; important: boolean;
  summary: string; points: string[]; change?: string;
};

export const scheduleDays = [
  {date:"11.10", day:"화"}, {date:"11.11", day:"수"},
  {date:"11.12", day:"목"}, {date:"11.13", day:"금"},
  {date:"11.14", day:"토"}, {date:"11.15", day:"일"}, {date:"11.16", day:"월"},
];

export const companySchedules: CompanySchedule[] = [
  {id:"schedule-1",code:"005930",date:"11.11",time:"10:00",title:"기업설명회(IR)",type:"IR",status:"예정",summary:"사업 현황과 기술 로드맵을 설명하는 기업설명회 일정 예시입니다."},
  {id:"schedule-2",code:"000660",date:"11.12",time:"15:00",title:"분기 실적 발표",type:"실적",status:"예정",summary:"분기 실적 발표와 질의응답을 진행하는 일정 예시입니다. 예정 일정에는 아직 발표되지 않은 실적 결과를 표시하지 않습니다."},
  {id:"schedule-3",code:"035420",date:"11.13",time:null,title:"기업설명회(IR)",type:"IR",status:"일정 변경",summary:"예고된 기업설명회의 날짜가 변경된 상황을 보여주는 예시입니다. 새 개최 시각은 미정으로 표시합니다.",change:"11.12 15:00 → 11.13 시간 미정"},
  {id:"schedule-4",code:"005380",date:"11.16",time:"09:00",title:"임시 주주총회",type:"주주총회",status:"예정",summary:"공고된 주주총회 개최일과 안건을 함께 확인하는 일정 예시입니다."},
];

// Array order represents receipt order in this fixture, not an importance ranking.
export const companyFilings: CompanyFiling[] = [
  {id:"filing-1",code:"005930",receivedDate:"11.10",title:"영업(잠정)실적 공정공시",type:"실적",status:"신규",important:true,summary:"분기 매출과 영업이익의 변화를 확인하는 잠정 실적 공시 예시입니다.",points:["매출과 영업이익의 전년·전분기 대비 변화","일회성 요인과 사업 부문별 실적","잠정치와 확정 실적의 차이"]},
  {id:"filing-2",code:"373220",receivedDate:"11.10",title:"단일판매·공급계약 체결",type:"계약·투자",status:"신규",important:true,summary:"공급계약 체결을 알리는 예시입니다. 계약 규모와 기간, 실제 매출 반영 조건을 함께 살펴봅니다.",points:["최근 매출 대비 계약 규모","계약 기간과 해지 조건","실제 납품·매출 인식 시점"]},
  {id:"filing-3",code:"035420",receivedDate:"11.10",title:"자기주식 취득 결정",type:"자본·주주",status:"신규",important:true,summary:"자기주식 취득 계획을 알리는 예시입니다. 취득 목적과 기간, 이후 처리 계획을 구분해 확인합니다.",points:["취득 규모·방법·기간","취득 자금과 재무 부담","취득과 소각 결정의 차이"]},
  {id:"filing-4",code:"005380",receivedDate:"11.10",title:"[기재정정] 신규시설 투자",type:"계약·투자",status:"정정",important:true,summary:"기존 시설 투자 계획의 완료 예정일이 변경된 예시입니다. 최초 공시와 달라진 내용을 먼저 보여줍니다.",change:"투자 완료 예정일 변경 · 투자 금액은 유지하는 상황의 예시",points:["변경된 투자 완료 예정일","일정 변경 사유","생산·실적 반영 시점에 미칠 영향"]},
  {id:"filing-5",code:"035720",receivedDate:"11.09",title:"[철회] 타법인 주식 취득 결정",type:"계약·투자",status:"철회",important:true,summary:"기존에 공시한 주식 취득 결정을 철회한 예시입니다. 철회된 계획을 진행 중인 투자로 표시하지 않습니다.",change:"기존 취득 계획 철회 · 해당 계획을 전제로 한 해석 재확인 필요",points:["철회 사유와 기존 계약의 처리","기지급 금액·해약 비용 여부","기존 성장 계획에 미치는 영향"]},
  {id:"filing-6",code:"000660",receivedDate:"11.09",title:"기업설명회(IR) 개최 안내",type:"IR·일정",status:"신규",important:false,summary:"기업설명회 개최를 알리는 일반 공시 예시입니다. 안내 공시의 접수일과 실제 행사 예정일은 별도로 표시합니다.",points:["공시 접수일과 행사 예정일 구분","참석 대상·진행 방식","발표 자료의 공개 여부"]},
];
