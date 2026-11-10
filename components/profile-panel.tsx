
import {useRef, useState} from "react";
import {ArrowRight, Bell, Check, ChevronDown, ChevronRight, Clock3, FileText, History, Info, LogOut, Pencil, Search, Settings2, ShieldCheck, Star, UserRound} from "lucide-react";

type ProfileStock = {code:string;name:string;label:string;color:string;bg:string;change:number};
type Props = {
  method:string;
  stocks:ProfileStock[];
  favorites:string[];
  completed:string[];
  onWatch:()=>void;
  onStock:(code:string)=>void;
  onReport:(code:string)=>void;
  onSearch:()=>void;
  onLogout:()=>void;
};
const sampleCodes=["005930","000660","035420","035720"];

export default function ProfilePanel({method,stocks,favorites,completed,onWatch,onStock,onReport,onSearch,onLogout}:Props){
  const [name,setName]=useState("노에시스 사용자");
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(name);
  const [showAll,setShowAll]=useState(false);
  const [query,setQuery]=useState("");
  const [notifications,setNotifications]=useState({analysis:true,disclosures:true,news:false});
  const historyRef=useRef<HTMLElement>(null);
  const records=[...new Set([...completed].reverse().concat(sampleCodes))].map(code=>stocks.find(s=>s.code===code)!).filter(Boolean);
  const latest=records[0];
  const filtered=records.filter(s=>s.name.toLowerCase().includes(query.trim().toLowerCase())||s.code.includes(query.trim()));
  function openHistory(){setShowAll(true);requestAnimationFrame(()=>{historyRef.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});historyRef.current?.focus({preventScroll:true});});}
  function icon(s:ProfileStock){return <span className="stock-icon" style={{color:s.color,background:s.bg}}>{s.label}</span>;}
  function judgments(s:ProfileStock){return <div className="my-judgments" aria-label={`${s.name} 기간별 예시 판단`}>{["단기","중기","장기"].map((period,i)=>{const value=s.code==="035720"?"판단 불가":i===1&&s.change>0?"매수":"관망";return <span key={period} className={value==="매수"?"positive":""}><small>{period}</small>{value}</span>;})}</div>;}
  return <div className="my-space">
    <div className="page-heading"><div><div className="eyebrow">MY SPACE</div><h1>나의 투자 기록<span className="title-dot">.</span></h1><p>살펴본 판단과 관심 있는 기업을 이어서 확인하세요.</p></div><span className="tiny-pill">로그인 후 화면 예시</span></div>
    <section className="my-identity section" aria-label="내 프로필">
      <div className="my-person"><div className="my-avatar"><UserRound size={27}/></div><div><span className="my-welcome">다시 만나 반가워요</span><h2>{name}<span>님</span></h2><span className="my-provider"><ShieldCheck size={13}/>{method} 로그인 · 예시 계정</span></div></div>
      <button className="secondary-button my-edit" aria-expanded={editing} onClick={()=>{setDraft(name);setEditing(!editing);}}><Pencil size={14}/>프로필 수정</button>
      {editing&&<form className="my-edit-form" onSubmit={e=>{e.preventDefault();if(draft.trim()){setName(draft.trim());setEditing(false);}}}><label htmlFor="profile-nickname">닉네임 <span>화면 확인용 · 새로고침 시 초기화</span></label><div><input id="profile-nickname" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={20} required autoFocus/><button className="primary-button" type="submit"><Check size={15}/>적용</button></div></form>}
      <div className="my-stats"><button onClick={onWatch}><span><Star size={17}/>관심 종목</span><strong>{favorites.length}<small>개</small></strong><ChevronRight size={17}/></button><button onClick={openHistory}><span><History size={17}/>분석 이력</span><strong>{records.length}<small>건</small></strong><ChevronRight size={17}/></button></div>
    </section>
    <div className="my-columns"><div className="my-records">
      <section className="my-latest" aria-labelledby="my-latest-title"><div className="section-heading"><h2 id="my-latest-title"><Clock3 size={17}/>최근 분석 이어보기</h2><span>예시 기록</span></div><div className="my-latest-stock">{icon(latest)}<div><h3>{latest.name}</h3><p>11.10 14:32 · 공시 · 뉴스 · 차트</p></div></div>{judgments(latest)}<p className="my-latest-reason">{latest.code==="035720"?"공시 자료가 부족해 종합 판단을 보류한 예시예요.":"기간별 판단과 핵심 이유를 다시 살펴보세요."}</p><button className="primary-button" onClick={()=>onReport(latest.code)}>분석 결과 다시 보기<ArrowRight size={17}/></button><small className="my-reopen-note">다시 열면 당시 결과를 보여주는 흐름입니다.</small></section>
      <section className="section my-history" ref={historyRef} tabIndex={-1} aria-labelledby="my-history-title"><div className="section-heading"><h2 id="my-history-title">분석 이력 <span>{records.length}</span></h2><button className="text-button" aria-expanded={showAll} onClick={()=>{setShowAll(!showAll);setQuery("");}}>{showAll?"접기":"전체 보기"}<ChevronDown size={15} style={{transform:showAll?"rotate(180deg)":undefined}}/></button></div><p className="my-section-copy">이전에 살펴본 종목의 판단을 다시 확인해요.</p>
        {showAll&&<div className="my-history-search"><Search size={17}/><input aria-label="분석 이력 검색" placeholder="종목명 또는 코드로 이력 검색" value={query} onChange={e=>setQuery(e.target.value)}/></div>}
        <div>{(showAll?filtered:records.slice(0,2)).map(s=><button className="my-history-row" key={s.code} onClick={()=>onReport(s.code)}><span className="my-history-top">{icon(s)}<span><b>{s.name}</b><small>11.10 14:32 · 예시 분석</small></span><ChevronRight size={17}/></span>{judgments(s)}</button>)}</div>
        {showAll&&!filtered.length&&<div className="my-empty"><Search size={24}/><b>일치하는 분석 이력이 없어요</b><button className="text-button" onClick={()=>setQuery("")}>전체 이력 보기</button></div>}
      </section>
      <section className="section my-watch" aria-labelledby="my-watch-title"><div className="section-heading"><h2 id="my-watch-title">관심 종목 <span>{favorites.length}</span></h2><button className="text-button" onClick={onWatch}>관리<ChevronRight size={15}/></button></div><div className="my-watch-chips">{stocks.filter(s=>favorites.includes(s.code)).map(s=><button key={s.code} onClick={()=>onStock(s.code)}>{icon(s)}{s.name}<ChevronRight size={14}/></button>)}{favorites.length===0&&<button onClick={onSearch}><Star size={17}/>첫 관심 종목 찾기<ArrowRight size={15}/></button>}</div><p className="my-section-copy">관심 종목은 현재 이 브라우저에 저장돼요.</p></section>
    </div><aside className="my-settings">
      <section className="section" aria-labelledby="my-notifications-title"><div className="section-heading"><h2 id="my-notifications-title"><Bell size={17}/>알림 설정</h2></div><p className="my-section-copy">받고 싶은 소식만 선택하세요.</p>{([{id:"analysis",title:"분석 완료",desc:"요청한 분석이 준비됐을 때"},{id:"disclosures",title:"관심 종목 주요 공시",desc:"지켜보는 기업의 중요한 변화"},{id:"news",title:"관심 종목 주요 뉴스",desc:"관심 기업과 관련된 주요 소식"}] as const).map(item=><div className="my-setting-row" key={item.id}><span><b id={`notification-${item.id}`}>{item.title}</b><small>{item.desc}</small></span><button className="my-switch" type="button" role="switch" aria-checked={notifications[item.id]} aria-labelledby={`notification-${item.id}`} onClick={()=>setNotifications(old=>({...old,[item.id]:!old[item.id]}))}><span/></button></div>)}<p className="my-setting-note"><Info size={13}/>시안에서만 바뀌며 실제 알림은 발송하지 않아요.</p></section>
      <section className="section my-account" aria-labelledby="my-account-title"><div className="section-heading"><h2 id="my-account-title"><Settings2 size={17}/>계정 관리</h2></div><details><summary><span><ShieldCheck size={17}/>로그인 정보</span><ChevronDown size={16}/></summary><div className="my-account-detail"><span>현재 로그인 방식 <b>{method} · 예시</b></span><span>표시용 이메일 <b>demo@noesis.example</b></span><p>선택한 로그인 방식의 화면 예시예요. 실제 계정은 연결되지 않았습니다.</p></div></details><details><summary><span><FileText size={17}/>내 정보와 기록 관리</span><ChevronDown size={16}/></summary><div className="my-account-detail"><p>실제 서비스에서는 프로필 변경, 계정 연결 관리, 회원 탈퇴를 이곳에서 안내할 예정이에요. 세부 절차는 추후 설계합니다.</p></div></details><button className="my-logout" onClick={onLogout}><LogOut size={17}/>로그아웃 화면 보기<ChevronRight size={16}/></button></section>
      <p className="my-preview-note">계정과 분석 이력은 화면 검토용 예시예요.<br/>프로필·알림 설정은 새로고침하면 초기화돼요.</p>
    </aside></div>
  </div>;
}
