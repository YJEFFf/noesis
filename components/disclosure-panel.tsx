
import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronRight, Clock3, FileText, Info, Star, X } from "lucide-react";
import { companyFilings, companySchedules, scheduleDays, type CompanyFiling, type CompanySchedule } from "../lib/disclosures";

type Detail = {kind:"schedule"; item:CompanySchedule} | {kind:"filing"; item:CompanyFiling};
const filingTypes = ["전체", "실적", "계약·투자", "자본·주주", "IR·일정", "정정·철회"];

export default function DisclosurePanel({favorites,stockNames,onStock,onFindStock}: {
  favorites:string[]; stockNames:Record<string,string>;
  onStock:(code:string)=>void; onFindStock:()=>void;
}) {
  const [scope,setScope]=useState("all");
  const [date,setDate]=useState("all");
  const [filingMode,setFilingMode]=useState("important");
  const [filingType,setFilingType]=useState("전체");
  const [detail,setDetail]=useState<Detail|null>(null);
  const dialogRef=useRef<HTMLDialogElement>(null);
  const inScope=(code:string)=>scope==="all"||favorites.includes(code);
  const schedules=companySchedules.filter(s=>inScope(s.code)&&(date==="all"||s.date===date));
  const filings=companyFilings.filter(f=>inScope(f.code)&&(filingMode==="all"||f.important)&&
    (filingType==="전체"||(filingType==="정정·철회"?f.status!=="신규":f.type===filingType)));
  const noFavorites=scope==="watch"&&!favorites.length;

  useEffect(()=>{
    if(!detail||!dialogRef.current)return;
    const dialog=dialogRef.current,overflow=document.body.style.overflow;
    document.body.style.overflow="hidden";dialog.showModal();
    return()=>{dialog.close();document.body.style.overflow=overflow;};
  },[detail]);

  function reset(){setFilingMode("all");setFilingType("전체");setScope("all");}
  return <div className="disclosure-panel">
    <div className="disclosure-toolbar"><div className="scope-buttons" aria-label="공시 종목 범위">
      <button className={scope==="all"?"selected":""} aria-pressed={scope==="all"} onClick={()=>setScope("all")}>전체 종목</button>
      <button className={scope==="watch"?"selected":""} aria-pressed={scope==="watch"} onClick={()=>setScope("watch")}><Star size={13}/>관심 종목</button>
    </div><span className="caption">2026.11.10 기준 · 예시</span></div>

    {noFavorites?<div className="section empty-state"><Star size={32}/><h3>관심 종목을 먼저 저장해 보세요</h3><p>저장한 기업의 공시와 일정을 모아볼 수 있어요.</p><button className="primary-button" onClick={onFindStock}>종목 찾기</button><button className="text-button" onClick={()=>setScope("all")}>전체 종목 보기</button></div>:<>
      <section className="disclosure-calendar" aria-labelledby="schedule-title">
        <div className="schedule-heading"><div><span className="eyebrow"><CalendarDays size={15}/> UPCOMING</span><h2 id="schedule-title">다가오는 공시·기업 일정</h2><p>실적 발표와 IR, 예고된 일정을 먼저 확인하세요.</p></div><span className="schedule-month">11<span>월</span></span></div>
        <div className="schedule-dates" aria-label="공시 일정 날짜"><button className={`schedule-all ${date==="all"?"selected":""}`} aria-pressed={date==="all"} onClick={()=>setDate("all")}>전체<br/>일정</button>{scheduleDays.map(d=><button key={d.date} aria-label={`11월 ${Number(d.date.slice(3))}일 일정`} aria-pressed={date===d.date} className={date===d.date?"selected":""} onClick={()=>setDate(d.date)}><span>{d.day}</span><b>{Number(d.date.slice(3))}</b><i className={companySchedules.some(s=>inScope(s.code)&&s.date===d.date)?"has-event":""}/></button>)}</div>
        <div className="schedule-list">{schedules.map(s=><button key={s.id} className="schedule-item" data-schedule-id={s.id} onClick={()=>setDetail({kind:"schedule",item:s})}><span className="schedule-date"><b>{s.date}</b><small>{s.time??"시간 미정"}</small></span><span className="schedule-item-copy"><b>{stockNames[s.code]}</b><span>{s.title}</span></span><span className={`filing-status ${s.status==="일정 변경"?"changed":"planned"}`}>{s.status}</span><ChevronRight size={16}/></button>)}</div>
        {!schedules.length&&<div className="schedule-empty"><CalendarDays size={22}/><p>선택한 날짜에 등록된 예시 일정이 없어요.</p><button className="text-button" onClick={()=>setDate("all")}>전체 일정 보기</button></div>}
        <p className="schedule-note"><Info size={13}/>사전 예고된 일정만 표시해요. 발표 시각은 변경되거나 미정일 수 있어요.</p>
      </section>

      <section className="filings-section" aria-labelledby="filings-title">
        <div className="filings-heading"><div><h2 id="filings-title">새로 올라온 공시</h2><p>기업의 중요한 변화와 정정 내용을 확인하세요.</p></div><span className="caption">최근 접수순 · 예시</span></div>
        <div className="filings-mode" aria-label="공시 중요도"><button className={filingMode==="important"?"selected":""} aria-pressed={filingMode==="important"} onClick={()=>setFilingMode("important")}>주요 공시</button><button className={filingMode==="all"?"selected":""} aria-pressed={filingMode==="all"} onClick={()=>setFilingMode("all")}>전체 공시</button><span>{filings.length}건</span></div>
        <div className="chips filing-chips" aria-label="공시 유형">{filingTypes.map(t=><button key={t} aria-pressed={filingType===t} className={filingType===t?"selected":""} onClick={()=>{setFilingType(t);if(t==="IR·일정")setFilingMode("all");}}>{t}</button>)}</div>
        <div className="filing-list">{filings.map(f=><button className="filing-card" data-filing-id={f.id} key={f.id} onClick={()=>setDetail({kind:"filing",item:f})}>
          <span className="filing-card-top"><span className="filing-company"><FileText size={16}/>{stockNames[f.code]}</span><span className="filing-received">예시 접수일 {f.receivedDate}</span></span>
          <span className="filing-card-title">{f.title}<ChevronRight size={16}/></span><span className="filing-summary">{f.summary}</span>
          <span className="filing-card-bottom"><span className="filing-kind">{f.type}</span><span className={`filing-status ${f.status==="정정"?"changed":f.status==="철회"?"withdrawn":"new"}`}>{f.status}</span>{f.important&&<span className="filing-important">주요</span>}</span>
        </button>)}</div>
        {!filings.length&&<div className="section empty-state"><FileText size={30}/><h3>조건에 맞는 예시 공시가 없어요</h3><p>다른 유형이나 전체 공시를 확인해 보세요.</p><button className="text-button" onClick={reset}>필터 초기화</button></div>}
        <p className="disclosure-fixture-note">일정과 공시 내용은 화면 검토용 예시입니다. 실제 기업의 발표 일정이나 공시가 아닙니다.</p>
      </section>
    </>}

    <dialog ref={dialogRef} className="news-detail disclosure-detail" aria-labelledby="disclosure-detail-title" onCancel={()=>setDetail(null)} onClick={e=>{if(e.target===e.currentTarget)setDetail(null);}} onKeyDown={e=>{
      if(e.key!=="Tab")return;
      const buttons=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
      const first=buttons[0],last=buttons[buttons.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
    }}>
      {detail&&<div className="news-detail-inner">
        <div className="news-detail-top"><span>{detail.kind==="schedule"?<CalendarDays size={16}/>:<FileText size={16}/>} {detail.kind==="schedule"?"예정 일정":"접수 공시"} · 예시</span><button className="icon-button" aria-label="공시 상세 닫기" autoFocus onClick={()=>setDetail(null)}><X size={21}/></button></div>
        <span className="article-meta">{stockNames[detail.item.code]} · {detail.item.type} · {detail.item.status}</span>
        <h2 id="disclosure-detail-title">{detail.item.title}</h2>
        <div className="disclosure-detail-date"><Clock3 size={15}/>{detail.kind==="schedule"?`예정일 2026.${detail.item.date} · ${detail.item.time??"시간 미정"}`:`접수일 2026.${detail.item.receivedDate}`}</div>
        {detail.item.change&&<div className={`disclosure-change ${detail.item.status==="철회"?"withdrawn":""}`}><b>{detail.item.status==="철회"?"철회된 계획입니다":"변경된 내용"}</b><p>{detail.item.change}</p></div>}
        <p className="news-detail-summary">{detail.item.summary}</p>
        {detail.kind==="filing"&&<div className="filing-points"><h3>확인할 내용</h3><ul>{detail.item.points.map(p=><li key={p}>{p}</li>)}</ul></div>}
        <div className="news-detail-related"><h3>관련 종목</h3><button onClick={()=>{const code=detail.item.code;setDetail(null);onStock(code);}}>{stockNames[detail.item.code]}<ChevronRight size={16}/></button></div>
        <p className="news-fixture-note">실제 공시·일정이 아닌 디자인 예시입니다.<br/>실제 자료 연동 후 공시와 발표 일정을 확인할 수 있어요.</p>
      </div>}
    </dialog>
  </div>;
}
