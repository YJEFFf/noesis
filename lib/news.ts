// Design fixtures only. No live feed, automatic importance scoring, or news refresh.
export type NewsArticle = {
  id: number;
  eventId: string;
  featured: boolean;
  category: string;
  kind: string;
  time: string;
  title: string;
  desc: string;
  codes: string[];
  color: string;
};

export const articles: NewsArticle[] = [
  { id:1, eventId:"ai-demand", featured:true, category:"반도체", kind:"뉴스", time:"14:20", title:"AI 반도체 수요 기대, 관련 종목에 관심이 모이는 이유", desc:"수요 기대가 가격에 얼마나 반영됐는지, 실적 개선으로 이어질지 함께 살펴볼 시점입니다.", codes:["005930","000660"], color:"mint" },
  { id:2, eventId:"auto-earnings", featured:true, category:"자동차", kind:"뉴스", time:"13:45", title:"분기 실적 발표를 앞둔 자동차 업종, 확인할 세 가지", desc:"판매량뿐 아니라 수익성과 환율 효과를 함께 확인해야 합니다.", codes:["005380"], color:"blue" },
  { id:3, eventId:"battery-demand", featured:true, category:"2차전지", kind:"뉴스", time:"12:10", title:"배터리 업종의 엇갈린 흐름, 수요 회복 속도가 관건", desc:"단기 주가 반등과 실제 수주 회복을 구분해 살펴봅니다.", codes:["373220","247540"], color:"peach" },
  { id:4, eventId:"bio-contract", featured:true, category:"바이오", kind:"뉴스", time:"11:30", title:"바이오 기업의 신규 계약, 규모보다 확인해야 할 조건", desc:"매출 인식 시점과 계약 조건을 함께 읽어야 하는 이유입니다.", codes:["068270"], color:"purple" },
  { id:5, eventId:"chip-equipment", featured:false, category:"반도체", kind:"뉴스", time:"14:12", title:"반도체 장비 업계, 차세대 패키징 기술 개발 확대", desc:"장비 투자 소식과 함께 양산 적용 일정, 고객사 확보 여부를 살펴봅니다.", codes:["005930","000660"], color:"mint" },
  { id:6, eventId:"chip-ir", featured:false, category:"반도체", kind:"뉴스", time:"13:28", title:"반도체 기업 IR 일정 공개, 기술 로드맵 설명 예정", desc:"기업 설명회에서 확인할 사업별 투자 계획과 연구개발 진행 상황을 정리한 예시입니다.", codes:["005930"], color:"mint" },
  { id:7, eventId:"battery-recycling", featured:false, category:"2차전지", kind:"뉴스", time:"14:05", title:"폐배터리 재활용 기술, 소재 회수 효율에 주목", desc:"재활용 공정의 회수율과 원가 경쟁력이 실제 사업으로 이어지는지 확인합니다.", codes:["373220","247540"], color:"peach" },
  { id:8, eventId:"battery-research", featured:false, category:"2차전지", kind:"뉴스", time:"12:48", title:"차세대 양극재 연구 협력, 상용화까지 남은 과제", desc:"공동 연구 단계와 검증 일정, 상용 생산 가능 시점을 구분해 살펴봅니다.", codes:["247540"], color:"peach" },
  { id:9, eventId:"bio-conference", featured:false, category:"바이오", kind:"뉴스", time:"13:52", title:"국제 바이오 학회 앞두고 연구 발표 일정 공개", desc:"발표 예정인 연구의 단계와 평가 지표를 확인합니다. 발표 일정 자체가 성과를 뜻하지는 않습니다.", codes:["068270"], color:"purple" },
  { id:10, eventId:"bio-logistics", featured:false, category:"바이오", kind:"뉴스", time:"11:42", title:"의약품 유통 업계, 냉장 물류 관리 체계 강화", desc:"보관·운송 과정의 품질 관리와 공급 안정성에 대한 업계 소식을 모았습니다.", codes:["068270"], color:"purple" },
  { id:11, eventId:"auto-software", featured:false, category:"자동차", kind:"뉴스", time:"14:08", title:"차량 소프트웨어 업데이트, 서비스 경쟁 확대", desc:"차량 내 서비스가 늘면서 업데이트 지원 범위와 이용 경험이 주목받고 있습니다.", codes:["005380"], color:"blue" },
  { id:12, eventId:"auto-charging", featured:false, category:"자동차", kind:"뉴스", time:"12:35", title:"전기차 충전 인프라, 도심 접근성 개선 논의", desc:"충전소 설치 수와 함께 실제 가동률, 접근성, 운영 비용을 살펴보는 업계 소식입니다.", codes:["005380"], color:"blue" },
  { id:13, eventId:"platform-sellers", featured:false, category:"플랫폼", kind:"뉴스", time:"14:16", title:"온라인 쇼핑 판매자 도구 개편, 운영 편의 높인다", desc:"판매자의 상품 관리와 고객 응대 기능 개선이 서비스 이용에 미칠 영향을 살펴봅니다.", codes:["035420"], color:"mint" },
  { id:14, eventId:"platform-accessibility", featured:false, category:"플랫폼", kind:"뉴스", time:"13:10", title:"모바일 서비스 접근성 개선, 이용 환경 넓힌다", desc:"화면 읽기와 글자 크기 등 다양한 이용 환경을 지원하는 서비스 개선 소식입니다.", codes:["035720"], color:"blue" },
];

export const featuredArticles = articles.filter(article => article.featured);
const featuredIds = new Set(featuredArticles.map(article => article.id));
const featuredEvents = new Set(featuredArticles.map(article => article.eventId));
// Exclude every banner story and its event, not just the slide currently visible.
// Event IDs are authored fixtures; production event clustering is not implemented.
export const generalArticles = articles
  .filter(article => !featuredIds.has(article.id) && !featuredEvents.has(article.eventId))
  .sort((a, b) => b.time.localeCompare(a.time));
