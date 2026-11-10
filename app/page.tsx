
import { useEffect, useRef, useState } from "react";
import NewsBanner from "../components/news-banner";
import NewsDetail from "../components/news-detail";
import DisclosurePanel from "../components/disclosure-panel";
import StockChart from "../components/stock-chart";
import AuthPanel from "../components/auth-panel";
import ProfilePanel from "../components/profile-panel";
import { articles, featuredArticles, generalArticles, type NewsArticle } from "../lib/news";
import { ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Bell, Bookmark, Check, CheckCircle2, ChevronDown, ChevronRight, Clock3, FileText, Home, Info, Layers3, ListFilter, LoaderCircle, Newspaper, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, Star, TrendingUp, UserRound, X } from "lucide-react";

type View = "home" | "watch" | "issues" | "profile" | "stock" | "result" | "auth";
type Period = "short" | "mid" | "long";
type Stock = { code: string; name: string; label: string; sector: string; market: string; price: number; change: number; value: number; volume: number; color: string; bg: string };
const stocks: Stock[] = [
  { code:"005930", name:"삼성전자", label:"S", sector:"반도체", market:"KOSPI", price:73800, change:1.65, value:8420, volume:11409200, color:"#2353a0", bg:"#eaf0fc" },
  { code:"000660", name:"SK하이닉스", label:"SK", sector:"반도체", market:"KOSPI", price:192300, change:3.11, value:6930, volume:3603744, color:"#b53c39", bg:"#fcebea" },
  { code:"005380", name:"현대차", label:"H", sector:"자동차", market:"KOSPI", price:247500, change:-0.80, value:3210, volume:1296969, color:"#2c546d", bg:"#e8f1f6" },
  { code:"035420", name:"NAVER", label:"N", sector:"플랫폼", market:"KOSPI", price:186200, change:2.14, value:2840, volume:1525241, color:"#15994e", bg:"#e6f5e9" },
  { code:"373220", name:"LG에너지솔루션", label:"LG", sector:"2차전지", market:"KOSPI", price:389000, change:-1.27, value:2370, volume:609254, color:"#97334e", bg:"#f8eaf0" },
  { code:"068270", name:"셀트리온", label:"C", sector:"바이오", market:"KOSPI", price:178600, change:0.96, value:1860, volume:1041433, color:"#458140", bg:"#edf5e9" },
  { code:"035720", name:"카카오", label:"K", sector:"플랫폼", market:"KOSPI", price:42100, change:-0.47, value:1530, volume:3634204, color:"#665817", bg:"#fbf5d5" },
  { code:"247540", name:"에코프로비엠", label:"E", sector:"2차전지", market:"KOSDAQ", price:174200, change:1.34, value:920, volume:528128, color:"#426e95", bg:"#eaf1fa" },
];
const categories = ["전체", "반도체", "2차전지", "바이오", "자동차", "플랫폼"];
const periods: {id:Period; name:string; hint:string}[] = [{id:"short",name:"단기",hint:"최근 수급과 가격 흐름"},{id:"mid",name:"중기",hint:"실적 변화와 성장 동력"},{id:"long",name:"장기",hint:"사업 경쟁력과 지속 가능성"}];
const format = (n:number) => n.toLocaleString("ko-KR");
const changeText = (n:number) => `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;

function Brand({small=false}:{small?:boolean}) { return <div className={`brand ${small ? "small" : ""}`}><span className="brand-icon"><i/><i/><i/></span><span>NOESIS<span className="brand-dot">.</span></span></div>; }
function StockIcon({stock}:{stock:Stock}) { return <span className="stock-icon" style={{color:stock.color,background:stock.bg}}>{stock.label}</span>; }
function Change({value}:{value:number}) { return <span className={`change ${value>=0?"up":"down"}`}>{value>=0?<ArrowUpRight size={13}/>:<ArrowDownRight size={13}/>} {changeText(value)}</span>; }

export default function Page() {
  const [view,setView]=useState<View>("home");
  const [demoMethod,setDemoMethod]=useState<string|null>(null);
  const [selected,setSelected]=useState("005930");
  const [period,setPeriod]=useState<Period>("short");
  const [favorites,setFavorites]=useState<string[]>(["005930","000660","035420"]);
  const [query,setQuery]=useState("");
  const [searchOpen,setSearchOpen]=useState(false);
  const [category,setCategory]=useState("전체");
  const [issueCategory,setIssueCategory]=useState("전체");
  const [issueTab,setIssueTab]=useState<"news"|"disclosures">("news");
  const [sort,setSort]=useState("value");
  const [analysisStep,setAnalysisStep]=useState(-1);
  const [completed,setCompleted]=useState<string[]>([]);
  const [toast,setToast]=useState("");
  const [notify,setNotify]=useState(false);
  const [activeArticle,setActiveArticle]=useState<NewsArticle|null>(null);
  const searchRef=useRef<HTMLInputElement>(null);
  const priorFocus=useRef<HTMLElement|null>(null);
  const stock=stocks.find(s=>s.code===selected)!;
  const loading=analysisStep>=0;

  useEffect(()=>{
    try { const saved=JSON.parse(localStorage.getItem("noesis-ui-favorites-v1")??localStorage.getItem("sima-ui-favorites-v1")??"null"); if(Array.isArray(saved))setFavorites(saved.filter(code=>stocks.some(s=>s.code===code))); } catch { /* private browsers can disable storage */ }
    const readHash=()=>{const [next,code]=window.location.hash.slice(1).split("/");if(["home","watch","issues","profile","stock","result","auth"].includes(next)){setView(next as View);if(next==="profile"&&code==="demo")setDemoMethod("이메일");if(next==="issues")setIssueTab(code==="disclosures"?"disclosures":"news");if(stocks.some(s=>s.code===code))setSelected(code);}};
    readHash();window.addEventListener("hashchange",readHash);return()=>window.removeEventListener("hashchange",readHash);
  },[]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(""),2600);return()=>clearTimeout(timer);},[toast]);
  useEffect(()=>{if(!searchOpen)return;priorFocus.current=document.activeElement as HTMLElement;const timer=setTimeout(()=>searchRef.current?.focus(),30);return()=>{clearTimeout(timer);priorFocus.current?.focus();};},[searchOpen]);
  useEffect(()=>{
    if(analysisStep<0)return;
    const timer=setTimeout(()=>{if(analysisStep<2)setAnalysisStep(analysisStep+1);else{setAnalysisStep(-1);setCompleted(old=>[...new Set([...old,selected])]);navigate("result",selected);}},650);
    return()=>clearTimeout(timer);
  },[analysisStep,selected]);

  function navigate(next:View,code?:string){setActiveArticle(null);setView(next);if(next==="issues")setIssueTab(code==="disclosures"?"disclosures":"news");if(code&&stocks.some(s=>s.code===code))setSelected(code);setSearchOpen(false);setNotify(false);window.location.hash=code?`${next}/${code}`:next;window.scrollTo({top:0,behavior:"instant"});}
  function toggleFavorite(code:string){const adding=!favorites.includes(code);const next=adding?[...favorites,code]:favorites.filter(x=>x!==code);setFavorites(next);try{localStorage.setItem("noesis-ui-favorites-v1",JSON.stringify(next));}catch{}setToast(adding?"관심 종목에 저장했어요":"관심 종목에서 해제했어요");}
  function startAnalysis(){if(completed.includes(selected)){navigate("result",selected);return;}setPeriod("short");setAnalysisStep(0);}
  const navs=[{id:"home" as View,label:"홈",icon:Home},{id:"watch" as View,label:"관심 종목",icon:Star},{id:"issues" as View,label:"시장 이슈",icon:Newspaper},{id:"profile" as View,label:"내 정보",icon:UserRound}];
  const activeNav=view==="auth"?"profile":(view==="stock"||view==="result")?"home":view;
  const filtered=stocks.filter(s=>(category==="전체"||s.sector===category)).sort((a,b)=>sort==="value"?b.value-a.value:b.volume-a.volume);
  const searchResults=stocks.filter(s=>s.name.toLowerCase().includes(query.trim().toLowerCase())||s.code.includes(query.trim()));
  const uncertain=selected==="035720";
  const buy=period==="mid"&&!uncertain&&stock.change>0;
  const resultTitle=uncertain?"판단을 위한 자료가 부족해요":buy?"실적 개선 가능성에 주목해요":period==="short"?"지금은 흐름을 더 지켜볼 때예요":"성장 기대를 확인할 시간이 필요해요";
  const resultReason=uncertain?"최근 공시 자료가 충분하지 않아 기간별 판단을 제공하기 어려워요. 확인된 뉴스와 가격 정보는 아래에서 살펴볼 수 있어요.":buy?`${stock.name}의 사업 기대와 실적 방향이 함께 개선되는 상황을 가정한 예시예요. 가격에 기대가 얼마나 반영됐는지도 함께 확인해야 해요.`:period==="short"?"긍정적인 뉴스는 있지만 최근 가격 움직임을 뒷받침하는 수급을 더 확인해야 해요. 가격을 따라가기보다 방향이 명확해지는지 살펴보세요.":"장기 성장 가능성과 현재 가격의 매력을 구분할 필요가 있어요. 지속적인 실적 개선을 확인한 뒤 판단할 수 있어요.";

  function starButton(s:Stock){return <button className={`icon-button star-button ${favorites.includes(s.code)?"saved":""}`} aria-label={`${s.name} 관심 ${favorites.includes(s.code)?"해제":"저장"}`} aria-pressed={favorites.includes(s.code)} onClick={()=>toggleFavorite(s.code)}><Star size={18} fill={favorites.includes(s.code)?"currentColor":"none"}/></button>;}
  function stockRows(items:Stock[],rank=true){return <div className="stock-list">{items.map((s,i)=><div className="stock-row" key={s.code}>{rank&&<span className="rank">{i+1}</span>}<button className="stock-main" onClick={()=>navigate("stock",s.code)}><StockIcon stock={s}/><span><b>{s.name}</b><small>{s.sector}<span className="desktop-code"> · {s.code}</span></small></span></button><button className="stock-price" onClick={()=>navigate("stock",s.code)}><b>{format(s.price)}<span className="won">원</span></b><Change value={s.change}/></button><span className="trading-value">{sort==="value"?`${format(s.value)}억`:`${format(Math.round(s.volume/10000))}만 주`}</span>{starButton(s)}</div>)}</div>;}
  function articleCard(a:NewsArticle,compact=false){return <button key={a.id} className={`article ${compact?"compact":""}`} onClick={()=>setActiveArticle(a)}><span className={`article-icon ${a.color}`}>{a.kind==="공시"?<FileText size={21}/>:<Layers3 size={21}/>}</span><span className="article-copy"><span className="article-meta">{a.category}<i/> {a.kind} · 예시 {a.time}</span><b>{a.title}</b>{!compact&&<p>{a.desc}</p>}</span><ChevronRight size={17}/></button>;}

  return <div className="app-shell">
    <aside className="sidebar"><button className="brand-button" onClick={()=>navigate("home")} aria-label="노에시스 홈"><Brand/></button><p className="sidebar-caption">당신의 판단에, 더 깊은 근거</p><div className="nav-label">MY WORKSPACE</div><nav aria-label="주 메뉴">{navs.map(n=><button key={n.id} className={`side-nav ${activeNav===n.id?"active":""}`} onClick={()=>navigate(n.id)}><n.icon size={20}/><span>{n.label}</span>{n.id==="watch"&&<span className="nav-count">{favorites.length}</span>}{activeNav===n.id&&<span className="active-dot"/>}</button>)}</nav><div className="sidebar-bottom"><div className="mini-brand"><ShieldCheck size={21}/><div><b>판단의 중심은 나에게</b><p>노에시스는 근거를 연결합니다.</p></div></div><div className="version"><span className="green-dot"/> 디자인 프리뷰 <span>v0.8</span></div></div></aside>
    <div className="workspace">
      <header className="topbar"><div className="mobile-brand"><Brand small/></div><div className="breadcrumb">워크스페이스 <ChevronRight size={14}/><span>{view==="stock"?"종목 상세":view==="result"?"노에시스 분석":view==="auth"?"로그인 / 회원가입":navs.find(n=>n.id===view)?.label}</span></div><button className="global-search" onClick={()=>setSearchOpen(true)}><Search size={17}/><span>궁금한 종목을 검색하세요</span><kbd>검색</kbd></button><div className="topbar-actions"><span className="preview-pill">UI PREVIEW</span><button className="icon-button" aria-label="알림 보기" aria-expanded={notify} onClick={()=>setNotify(!notify)}><Bell size={20}/><i className="bell-dot"/></button><button className="avatar" onClick={()=>navigate("profile")} aria-label="내 정보"><UserRound size={17}/></button></div>{notify&&<div className="notification"><b>새 알림이 없어요</b><p>관심 종목의 소식을 확인하는 공간이에요.<br/>이 시안에서는 알림을 발송하지 않아요.</p></div>}</header>
      <div className="demo-strip"><Info size={13}/><span>UI 시안 · 모든 시세, 뉴스, 분석 결과는 예시입니다.</span></div>
      <main className={`main-content ${view==="stock"||view==="result"?"detail-content":""}`}>
      {view==="auth"&&<AuthPanel onBrowse={()=>navigate("home")} onDone={method=>{setDemoMethod(method);navigate("profile");}}/>}
      {view==="home"&&<>
        <div className="page-heading"><div><div className="eyebrow">YOUR INVESTMENT COMPANION</div><h1>오늘의 투자, 근거부터 살펴보세요<span className="title-dot">.</span></h1><p>시장을 읽고, 나만의 판단을 만들어가는 시간.</p></div><span className="date-label"><Clock3 size={14}/> 11월 10일 화요일 <span>예시 화면</span></span></div>
        <section className="hero"><div className="hero-copy"><span className="hero-tag"><Sparkles size={14}/> NOESIS INSIGHT</span><h2>흩어진 정보가,<br/>하나의 판단이 되도록.</h2><p>공시 · 뉴스 · 차트를 연결해<br className="mobile-break"/> 종목의 가능성과 위험을 함께 살펴보세요.</p><button className="hero-cta" onClick={()=>setSearchOpen(true)}>종목 분석 시작하기 <ArrowUpRight size={18}/></button></div><div className="hero-art" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orbit-center"><span className="brand-icon"><i/><i/><i/></span></div><div className="orbit-node node-one"><FileText size={18}/><span>공시</span></div><div className="orbit-node node-two"><Newspaper size={18}/><span>뉴스</span></div><div className="orbit-node node-three"><TrendingUp size={18}/><span>차트</span></div><span className="orbital-label">CONNECTED INTELLIGENCE</span></div></section>
        <section className="market-strip" aria-label="시장 지수 예시"><div><span>KOSPI <span className="market-tag">예시</span></span><b>2,584.21</b><Change value={0.82}/></div><div><span>KOSDAQ</span><b>742.68</b><Change value={-0.34}/></div><div><span>USD / KRW</span><b>1,382.50</b><span className="market-neutral">전일 대비 +2.10</span></div></section>
        <div className="content-columns"><div className="primary-column"><section className="section watch-section"><div className="section-heading"><h2>나의 관심 종목 <span>{favorites.length}</span></h2><button className="text-button" onClick={()=>navigate("watch")}>전체 보기 <ChevronRight size={15}/></button></div><div className="watch-cards">{stocks.filter(s=>favorites.includes(s.code)).slice(0,3).map(s=><button className="watch-card" key={s.code} onClick={()=>navigate("stock",s.code)}><span className="watch-card-top"><StockIcon stock={s}/><ArrowUpRight size={16}/></span><b>{s.name}</b><span className="watch-quote">{format(s.price)}<small>원</small></span><Change value={s.change}/></button>)}{favorites.length===0&&<button className="empty-watch" onClick={()=>setSearchOpen(true)}><Star size={24}/>관심 종목을 추가해 보세요<ArrowRight size={18}/></button>}</div></section>
        <section className="section ranking-section"><div className="section-heading"><h2>지금 시장의 흐름</h2><span className="muted small-text">시세 예시 · 14:32</span></div><div className="ranking-controls"><div className="underline-tabs"><button className={sort==="value"?"selected":""} onClick={()=>setSort("value")}>거래대금</button><button className={sort==="volume"?"selected":""} onClick={()=>setSort("volume")}>거래량</button></div><span className="muted small-text"><SlidersHorizontal size={14}/> 국내 주식</span></div><div className="chips" aria-label="업종 선택">{categories.map(c=><button className={category===c?"selected":""} key={c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="table-labels"><span>종목</span><span>현재가 / 등락률</span><span>{sort==="value"?"거래대금":"거래량"}</span></div>{stockRows(filtered)}<p className="table-note">거래 순위는 시장 탐색용이며, 매수 추천 순위가 아니에요.</p></section></div>
        <aside className="secondary-column"><section className="section issue-sidebar"><div className="section-heading"><h2>지금, 시장에서는</h2><span className="tiny-pill">업종별 소식</span></div>{generalArticles.slice(0,3).map(a=>articleCard(a,true))}<button className="full-text-button" onClick={()=>navigate("issues")}>시장 이슈 더 보기 <ArrowRight size={15}/></button></section><section className="method-card"><div className="method-icon"><Layers3 size={21}/></div><h3>결론보다 중요한 건,<br/>그 판단에 이르는 과정.</h3><p>긍정적인 신호와 반대 논거를 함께<br/>확인하고 투자 기간별로 살펴보세요.</p><button className="text-button" onClick={()=>navigate("stock","005930")}>분석 화면 살펴보기 <ArrowUpRight size={15}/></button><span className="method-watermark">sima.</span></section></aside></div>
      </>}
      {view==="watch"&&<><div className="page-heading"><div><div className="eyebrow">MY WATCHLIST</div><h1>계속 지켜보고 싶은 종목<span className="title-dot">.</span></h1><p>관심 있는 기업의 변화와 판단을 한곳에서 확인하세요.</p></div><button className="primary-button" onClick={()=>setSearchOpen(true)}><Search size={17}/> 종목 찾기</button></div><section className="section wide-section"><div className="section-heading"><h2>관심 종목 <span>{favorites.length}</span></h2><span className="caption">이 브라우저에 저장돼요</span></div>{favorites.length?stockRows(stocks.filter(s=>favorites.includes(s.code)),false):<div className="empty-state"><Star size={38}/><h3>첫 관심 종목을 저장해 보세요</h3><p>종목 옆 별을 누르면 여기에 모아볼 수 있어요.</p><button className="primary-button" onClick={()=>setSearchOpen(true)}>종목 검색</button></div>}</section></>}
      {(view==="stock"||view==="result")&&<>
        <div className="detail-top"><button className="back-button" onClick={()=>view==="result"?navigate("stock",selected):navigate("home")}><ArrowLeft size={17}/>{view==="result"?"종목 상세":"시장으로 돌아가기"}</button><span className="caption">{stock.market} · {stock.sector}</span></div>
        <section className="quote-section"><div className="quote-name"><StockIcon stock={stock}/><div><h1>{stock.name}</h1><span>{stock.code} · {stock.market}</span></div>{starButton(stock)}</div><div className="quote-line"><span className="big-price">{format(stock.price)}<small>원</small></span><Change value={stock.change}/></div><span className="quote-time"><Clock3 size={13}/> 예시 시세 · 11.10 14:32 기준</span></section>
        {view==="stock"&&<StockChart key={stock.code} stock={stock}/>}
        {view==="stock"?<div className="detail-grid"><div><section className="analysis-invitation"><div className="section-heading"><span className="eyebrow"><Sparkles size={15}/> NOESIS ANALYSIS</span><span className="tiny-pill">기간별 판단</span></div><h2>이 종목, 어떻게 바라봐야 할까요?</h2><p>공시, 뉴스, 차트를 함께 읽고<br/>투자 기간에 따른 판단과 이유를 확인하세요.</p><div className="analysis-sources"><div><FileText size={22}/><b>공시</b><span>기업의 공식 정보</span></div><div><Newspaper size={22}/><b>뉴스</b><span>최근 이슈와 변화</span></div><div><TrendingUp size={22}/><b>차트</b><span>가격과 수급 흐름</span></div></div><button className="primary-button analysis-button" onClick={startAnalysis}><Sparkles size={18}/>{completed.includes(selected)?"분석 결과 다시 보기":"노에시스 분석 살펴보기"}<ArrowRight size={18}/></button><p className="analysis-footnote">이 시안에서는 미리 준비한 예시 분석을 보여드려요.</p></section><section className="section"><div className="section-heading"><h2>종목 정보</h2><span className="caption">예시</span></div><dl className="facts"><div><dt>거래대금</dt><dd>{format(stock.value)}억 원</dd></div><div><dt>거래량</dt><dd>{format(stock.volume)}주</dd></div><div><dt>업종</dt><dd>{stock.sector}</dd></div><div><dt>상장 시장</dt><dd>{stock.market}</dd></div></dl></section></div><aside><section className="section"><div className="section-heading"><h2>관련 이슈</h2><span className="tiny-pill">예시</span></div>{generalArticles.filter(a=>a.category===stock.sector).length?generalArticles.filter(a=>a.category===stock.sector).map(a=>articleCard(a)):<div className="quiet-state"><Newspaper size={25}/><p>등록된 예시 이슈가 없어요.</p><span>자료가 없을 때도 그대로 알려드려요.</span></div>}</section><div className="detail-tip"><ShieldCheck size={20}/><p>분석을 요청할 때 자료를 모아요.<br/>종목을 열 때마다 새 분석을 만들지 않아요.</p></div></aside></div>:<>
          <div className="result-top"><span className="eyebrow"><Sparkles size={15}/> NOESIS ANALYSIS</span><span className="caption">예시 분석 · 11.10 14:32</span></div><div className="period-tabs" role="tablist" aria-label="투자 기간">{periods.map(p=><button key={p.id} id={`tab-${p.id}`} role="tab" aria-selected={period===p.id} aria-controls="period-result" className={period===p.id?"selected":""} onClick={()=>setPeriod(p.id)}>{p.name}<span>{p.hint}</span></button>)}</div>
          <div className="detail-grid result-grid" id="period-result" role="tabpanel" aria-labelledby={`tab-${period}`}><div><section className={`verdict-card ${buy?"buy":uncertain?"unavailable":"hold"}`}><div className="verdict-top"><span className="verdict-label">{uncertain?<Info size={16}/>:buy?<CheckCircle2 size={16}/>:<Clock3 size={16}/>} {uncertain?"판단 불가":buy?"매수":"관망"}</span><span>{periods.find(p=>p.id===period)?.name} 관점 · 예시</span></div><h2>{resultTitle}</h2><p>{resultReason}</p><div className="verdict-bottom"><ShieldCheck size={15}/>{uncertain?"자료 부족을 중립 의견으로 해석하지 않아요.":"긍정적인 신호와 위험 요인을 함께 반영한 판단이에요."}</div></section><section className="section reasons-section"><div className="section-heading"><h2>판단의 핵심 이유</h2><span className="caption">{periods.find(p=>p.id===period)?.name} 관점</span></div>{[period==="short"?"뉴스 기대와 실제 수급의 간격":period==="mid"?"기대가 실적으로 이어지는지 확인":"사업의 지속적인 경쟁력",period==="short"?"최근 가격 움직임을 확인할 필요":period==="mid"?"가격에 반영된 기대 수준":"성장 가능성과 현재 가치의 균형",uncertain?"공시 자료 누락으로 판단 제한":"함께 살펴야 하는 반대 논거"].map((r,i)=><div className="reason" key={r}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{r}</h3><p>{i===0?`${stock.sector} 업종에 대한 기대와 기업의 실제 변화를 구분해 읽어야 해요.`:i===1?"긍정적인 전망이 있어도 현재 가격이 매력적인지는 별개의 판단이에요.":"수요 둔화나 경쟁 심화가 나타나면 판단의 전제가 달라질 수 있어요."}</p></div></div>)}</section></div><aside><section className="section analyst-section"><div className="section-heading"><h2>분석을 더 자세히</h2><span className="caption">펼쳐보기</span></div>{[{icon:FileText,title:"공시 분석",status:uncertain?"자료 부족":"실적 변화 확인",body:uncertain?"이 예시에서는 공시 자료가 충분하지 않습니다. 해당 분석 의견은 없는 상태로 남겨두며 종합 판단도 제공하지 않습니다.":`${stock.name}의 매출 구성, 수익성, 투자 계획을 확인하는 영역입니다. ${periods.find(p=>p.id===period)?.name} 관점에서 확인해야 할 정보와 변화가 정리됩니다.`},{icon:Newspaper,title:"뉴스 분석",status:"기대와 사실 구분",body:`${stock.sector} 관련 이슈가 사업과 실적에 미칠 영향을 살펴봅니다. 보도된 사실과 미래에 대한 기대를 구분하며 동일한 보도의 반복을 새로운 신호로 세지 않습니다.`},{icon:TrendingUp,title:"차트 분석",status:period==="short"?"수급 확인 필요":"추세 변화 관찰",body:"가격 추세와 거래량의 동반 여부를 함께 살펴봅니다. 종목 상세의 가격·거래량 차트와 함께 주요 흐름을 이해할 수 있도록 설명합니다."}].map(a=><details key={`${period}-${a.title}`} className="analyst"><summary><span className="analyst-icon"><a.icon size={19}/></span><span><b>{a.title}</b><small>{a.status}</small></span><ChevronDown size={17}/></summary><p>{a.body}</p></details>)}</section><div className="period-note"><Info size={17}/><p>기간에 따라 판단은 달라질 수 있어요.<br/>이 시안의 단기·중기·장기 구분은 화면 검토용이며, 정확한 기간 범위는 추후 정해요.</p></div></aside></div>
        </>}
      </>}
      {view==="issues"&&<>
        <div className="page-heading"><div><div className="eyebrow">{issueTab==="news"?"MARKET NEWS":"COMPANY DISCLOSURES"}</div><h1>{issueTab==="news"?"시장의 변화, 맥락까지":"기업의 변화, 공시에서부터"}<span className="title-dot">.</span></h1><p>{issueTab==="news"?"지금 주목할 소식과 그 배경을 한곳에서 살펴보세요.":"다가오는 일정과 새로 올라온 공시를 함께 살펴보세요."}</p></div><span className="date-label"><Clock3 size={14}/> 11월 10일 · 예시</span></div>
        <div className="market-content-tabs" role="tablist" aria-label="시장 정보" onKeyDown={e=>{
          if(!["ArrowLeft","ArrowRight","Home","End"].includes(e.key))return;
          e.preventDefault();const next=e.key==="Home"?"news":e.key==="End"?"disclosures":issueTab==="news"?"disclosures":"news";
          navigate("issues",next==="disclosures"?"disclosures":undefined);
          requestAnimationFrame(()=>document.getElementById(`market-tab-${next}`)?.focus());
        }}>
          <button id="market-tab-news" role="tab" aria-selected={issueTab==="news"} aria-controls="market-news-panel" tabIndex={issueTab==="news"?0:-1} className={issueTab==="news"?"selected":""} onClick={()=>navigate("issues")}><Newspaper size={17}/>뉴스</button>
          <button id="market-tab-disclosures" role="tab" aria-selected={issueTab==="disclosures"} aria-controls="market-disclosures-panel" tabIndex={issueTab==="disclosures"?0:-1} className={issueTab==="disclosures"?"selected":""} onClick={()=>navigate("issues","disclosures")}><FileText size={17}/>공시</button>
        </div>
        {issueTab==="disclosures"?<div role="tabpanel" id="market-disclosures-panel" aria-labelledby="market-tab-disclosures"><DisclosurePanel favorites={favorites} stockNames={Object.fromEntries(stocks.map(s=>[s.code,s.name]))} onStock={code=>navigate("stock",code)} onFindStock={()=>setSearchOpen(true)}/></div>:<div role="tabpanel" id="market-news-panel" aria-labelledby="market-tab-news">
        <NewsBanner items={featuredArticles} suspended={searchOpen || notify || !!activeArticle} onSelect={article=>setActiveArticle(articles.find(a=>a.id===article.id) ?? null)}/>
        <section className="category-news" aria-labelledby="category-news-title">
          <div className="category-news-heading"><div><h2 id="category-news-title">카테고리별 뉴스</h2><p>주요 뉴스 외의 소식을 분야별로 모았어요.</p></div><span className="caption">예시 뉴스 {generalArticles.length}건</span></div>
          <div className="chips issue-chips" aria-label="뉴스 카테고리">{categories.map(c=><button key={c} aria-pressed={issueCategory===c} className={issueCategory===c?"selected":""} onClick={()=>setIssueCategory(c)}>{c}</button>)}</div>
          <div className="category-news-groups">{categories.filter(c=>c!=="전체"&&(issueCategory==="전체"||issueCategory===c)).map(c=>{
            const news=generalArticles.filter(a=>a.category===c);
            return <section className="section category-news-group" key={c} aria-label={`${c} 일반 뉴스`}>
              <div className="category-group-heading"><h3>{c}<span>{news.length}</span></h3><span>최신순 · 예시</span></div>
              {news.length?news.map(a=><button className="general-news-item" key={a.id} data-article-id={a.id} data-event-id={a.eventId} onClick={()=>setActiveArticle(a)}>
                <span className="article-meta">{a.kind} · 예시 {a.time}</span><span className="general-news-title">{a.title}<ChevronRight size={16}/></span><span className="general-news-desc">{a.desc}</span><span className="general-news-stocks">{a.codes.map(code=>stocks.find(s=>s.code===code)?.name).join(" · ")}</span>
              </button>):<p className="category-empty">이 카테고리의 새 소식이 아직 없어요.</p>}
            </section>;
          })}</div>
        </section>
        </div>}
      </>}
      {demoMethod&&<div hidden={view!=="profile"}><ProfilePanel method={demoMethod} stocks={stocks} favorites={favorites} completed={completed} onWatch={()=>navigate("watch")} onStock={code=>navigate("stock",code)} onReport={code=>{setPeriod("short");navigate("result",code);}} onSearch={()=>setSearchOpen(true)} onLogout={()=>{setDemoMethod(null);navigate("profile");}}/></div>}
      {view==="profile"&&!demoMethod&&<><div className="page-heading"><div><div className="eyebrow">MY SPACE</div><h1>나의 투자 공간<span className="title-dot">.</span></h1><p>관심 종목과 지난 분석을 이어서 확인하세요.</p></div></div><section className="section profile-card my-guest"><div className="avatar large"><UserRound size={28}/></div><h2>내 기록을 이어서 보세요</h2><p className="profile-signin-copy">관심 종목과 지난 분석을 내 계정에 모아보세요.</p><button className="primary-button profile-signin" onClick={()=>navigate("auth")}>로그인 / 회원가입<ArrowRight size={16}/></button><span className="profile-auth-methods">이메일 · 카카오 · Google · 네이버</span><button className="secondary-button my-guest-preview" onClick={()=>{setDemoMethod("이메일");navigate("profile","demo");}}>로그인 후 화면 미리보기<ArrowRight size={16}/></button><div className="local-note">계정 생성 없이 예시 프로필과 분석 이력을 둘러볼 수 있어요.</div></section></>}

      <footer className="footer"><Brand small/><span>정보를 연결하고, 판단을 돕습니다.</span><span className="footer-right">디자인 시안 · 예시 데이터</span></footer>
      </main>
    </div>
    {view!=="auth"&&<nav className="bottom-nav" aria-label="모바일 주 메뉴">{navs.map(n=><button key={n.id} className={activeNav===n.id?"active":""} onClick={()=>navigate(n.id)}><n.icon size={21}/><span>{n.id==="watch"?"관심":n.id==="issues"?"이슈":n.label}</span></button>)}</nav>}
    <NewsDetail article={activeArticle} onClose={()=>setActiveArticle(null)} onStock={code=>navigate("stock",code)} stockNames={Object.fromEntries(stocks.map(s=>[s.code,s.name]))}/>
    {searchOpen&&<div className="modal-backdrop" onClick={()=>setSearchOpen(false)}><section className="search-modal" role="dialog" aria-modal="true" aria-labelledby="search-title" onClick={e=>e.stopPropagation()} onKeyDown={e=>{if(e.key==="Escape")setSearchOpen(false);if(e.key==="Tab"){const focusable=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button,input,[tabindex="0"]'));const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}}><div className="search-modal-heading"><h2 id="search-title">어떤 종목이 궁금하세요?</h2><button className="icon-button" aria-label="검색 닫기" onClick={()=>setSearchOpen(false)}><X size={21}/></button></div><div className="search-input"><Search size={20}/><input ref={searchRef} aria-label="종목명 또는 코드" placeholder="종목명 또는 코드를 입력하세요" value={query} onChange={e=>setQuery(e.target.value)}/>{query&&<button className="icon-button" aria-label="검색어 지우기" onClick={()=>{setQuery("");searchRef.current?.focus();}}><X size={16}/></button>}</div><div className="search-meta">{query?`검색 결과 ${searchResults.length}개`:"시안에서 살펴볼 수 있는 종목"}<span>예시 8종목</span></div><div className="search-results">{searchResults.map(s=><button className="search-row" key={s.code} onClick={()=>navigate("stock",s.code)}><StockIcon stock={s}/><span><b>{s.name}</b><small>{s.code} · {s.market}</small></span><ChevronRight size={17}/></button>)}{!searchResults.length&&<div className="empty-state"><Search size={30}/><h3>검색 결과가 없어요</h3><p>시안에는 8개 예시 종목만 포함되어 있어요.</p></div>}</div></section></div>}
    {loading&&<div className="modal-backdrop"><section className="loading-modal" role="dialog" aria-modal="true" aria-labelledby="loading-title"><div className="loading-symbol"><Sparkles size={28}/></div><span className="eyebrow">NOESIS ANALYSIS</span><h2 id="loading-title">판단의 근거를 연결하고 있어요</h2><p>{stock.name} · 예시 분석 화면을 준비합니다.</p><div className="loading-steps">{["공시·뉴스·차트 자료 확인","기간별 판단과 핵심 이유 정리","분석 결과 준비"].map((step,i)=><div key={step} className={i<=analysisStep?"current":""}>{i<analysisStep?<CheckCircle2 size={18}/>:i===analysisStep?<LoaderCircle size={18} className="spin"/>:<span className="step-circle"/>}{step}</div>)}</div><span className="caption">실제 분석을 실행하지 않는 UI 시연입니다.</span><button className="text-button" onClick={()=>setAnalysisStep(-1)}>시연 닫기</button></section></div>}
    {toast&&<div className="toast" role="status"><Check size={17}/>{toast}</div>}
  </div>;
}
