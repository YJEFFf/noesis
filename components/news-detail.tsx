
import { useEffect, useRef } from "react";
import { ChevronRight, Newspaper, Sparkles, X } from "lucide-react";
import type { NewsArticle } from "../lib/news";

export default function NewsDetail({article, onClose, onStock, stockNames}: {
  article: NewsArticle | null;
  onClose: () => void;
  onStock: (code: string) => void;
  stockNames: Record<string, string>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!article || !dialog) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
    };
  }, [article]);

  return <dialog ref={dialogRef} className="news-detail" aria-labelledby="news-detail-title" onCancel={onClose} onClick={e => {if (e.target === e.currentTarget) onClose();}} onKeyDown={e => {
    if (e.key !== "Tab") return;
    const buttons = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const first = buttons[0], last = buttons[buttons.length - 1];
    if (e.shiftKey && document.activeElement === first) {e.preventDefault(); last?.focus();}
    else if (!e.shiftKey && document.activeElement === last) {e.preventDefault(); first?.focus();}
  }}>
    {article && <div className="news-detail-inner">
      <div className="news-detail-top"><span><Newspaper size={16}/>{article.featured ? "주요 뉴스" : "카테고리 뉴스"}</span><button className="icon-button" aria-label="뉴스 닫기" onClick={onClose} autoFocus><X size={21}/></button></div>
      <span className="article-meta">{article.category} <i/> {article.kind} · 예시 {article.time}</span>
      <h2 id="news-detail-title">{article.title}</h2>
      <p className="news-detail-summary">{article.desc}</p>
      {article.featured && <div className="explanation"><Sparkles size={16}/><div><b>노에시스의 시선 · 해설 예시</b><p>뉴스와 가격 변화가 함께 나타나더라도 직접적인 원인으로 단정하지 않아요. 후속 공시와 실제 지표를 함께 확인해 보세요.</p></div></div>}
      <div className="news-detail-related"><h3>함께 살펴볼 종목</h3>{article.codes.map(code => <button key={code} onClick={() => onStock(code)}>{stockNames[code]}<ChevronRight size={16}/></button>)}</div>
      <p className="news-fixture-note">화면 검토를 위해 만든 예시 기사입니다.<br/>실제 보도나 현재의 기업 소식을 뜻하지 않습니다.</p>
    </div>}
  </dialog>;
}
