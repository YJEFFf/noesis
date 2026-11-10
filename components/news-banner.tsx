
import { useEffect, useState } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Newspaper, Pause, Play } from "lucide-react";

type Headline = { id: number; category: string; kind: string; time: string; title: string; desc: string };
const ROTATION_MS = 6000;

export default function NewsBanner({ items, onSelect, suspended = false }: {
  items: Headline[];
  onSelect: (item: Headline) => void;
  suspended?: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);
  const count = items.length;
  const activeIndex = count ? index % count : 0;
  const running = count > 1 && !paused && !hovered && !hidden && !suspended;

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPaused(motion.matches);
    const onMotion = () => { if (motion.matches) setPaused(true); };
    const onVisibility = () => setHidden(document.hidden);
    onVisibility();
    motion.addEventListener("change", onMotion);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      motion.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setIndex(current => (current + 1) % count), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [index, count, running]);

  if (!count) return null;
  const article = items[activeIndex];
  function selectSlide(next: number) {
    setIndex((next + count) % count);
    setPaused(true);
  }

  return <section
    className="news-banner"
    aria-label="주요 뉴스"
    aria-roledescription="캐러셀"
    data-running={running}
    onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(true); }}
    onPointerLeave={() => setHovered(false)}
    onFocusCapture={event => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null) && event.target.matches(":focus-visible")) setPaused(true);
    }}
  >
    <div className="news-banner-top"><span className="news-banner-label"><Newspaper size={15}/> 주요 뉴스</span><span className="news-banner-meta">{article.category} <i/> {article.kind} · 예시 {article.time}</span></div>
    <div className="news-banner-content" aria-live={running ? "off" : "polite"} aria-atomic="true">
      <div className="news-slide" key={article.id} role="group" aria-roledescription="슬라이드" aria-label={`${activeIndex + 1} / ${count}`}>
        <h2>{article.title}</h2>
        <p>{article.desc}</p>
        <button className="news-read-button" onClick={() => { setPaused(true); onSelect(article); }}>이슈 자세히 보기 <ArrowUpRight size={16}/></button>
      </div>
    </div>
    {count > 1 && <div className="news-banner-bottom">
      <div className="news-pagination" aria-label="뉴스 선택">{items.map((item, i) => <button key={item.id} className={i === activeIndex ? "selected" : ""} aria-label={`${i + 1}번 뉴스: ${item.title}`} aria-current={i === activeIndex ? "true" : undefined} onClick={() => selectSlide(i)}><span/></button>)}</div>
      <span className="news-rotation-label">{paused ? "자동 전환 멈춤" : running ? "6초마다 자동 전환" : "잠시 멈춤"}</span>
      <div className="news-banner-controls">
        <span className="news-counter"><b>{String(activeIndex + 1).padStart(2, "0")}</b><span>/ {String(count).padStart(2, "0")}</span></span>
        <button aria-label="이전 뉴스" onClick={() => selectSlide(activeIndex - 1)}><ChevronLeft size={17}/></button>
        <button aria-label="다음 뉴스" onClick={() => selectSlide(activeIndex + 1)}><ChevronRight size={17}/></button>
        <button aria-label={paused ? "뉴스 자동 전환 재생" : "뉴스 자동 전환 일시정지"} aria-pressed={!paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={14}/> : <Pause size={14}/>}</button>
      </div>
    </div>}
  </section>;
}
