
import { useEffect, useMemo, useRef, useState } from "react";
import { ChartCandlestick, ChevronLeft, ChevronRight, Info, RotateCcw, TrendingUp } from "lucide-react";
import type { IChartApi } from "lightweight-charts";
import { examplePriceHistory, priceRange, type ChartRange, type ChartStock, type PriceBar } from "../lib/price-history";

const ranges:{id:ChartRange;label:string}[]=[{id:"1m",label:"1개월"},{id:"3m",label:"3개월"},{id:"1y",label:"1년"}];
const format=(n:number)=>n.toLocaleString("ko-KR");
const volumeLabel=(n:number)=>`${(n/10000).toLocaleString("ko-KR",{maximumFractionDigits:1})}만`;
const upColor="#d96a6b",downColor="#5b85c1";

export default function StockChart({stock}:{stock:ChartStock}) {
  const [range,setRange]=useState<ChartRange>("3m");
  const [kind,setKind]=useState<"line"|"candle">("line");
  const [selected,setSelected]=useState<PriceBar|null>(null);
  const [announcement,setAnnouncement]=useState("");
  const [status,setStatus]=useState<"loading"|"ready"|"error">("loading");
  const containerRef=useRef<HTMLDivElement>(null);
  const chartRef=useRef<IChartApi|null>(null);
  const moveCrosshairRef=useRef<((bar:PriceBar)=>void)|null>(null);
  const allBars=useMemo(()=>examplePriceHistory(stock),[stock.code,stock.price,stock.change,stock.volume]);
  const bars=useMemo(()=>priceRange(allBars,range),[allBars,range]);
  const active=selected??bars[bars.length-1];
  const activeIndex=bars.findIndex(bar=>bar.time===active.time);
  const start=bars[0],last=bars[bars.length-1];
  const periodChange=(last.close/start.close-1)*100;

  useEffect(()=>{
    let disposed=false,chart:IChartApi|null=null;
    setStatus("loading");setSelected(null);
    async function mount(){
      try{
        const {createChart,AreaSeries,CandlestickSeries,HistogramSeries,ColorType,CrosshairMode,TrackingModeExitMode}=await import("lightweight-charts");
        if(disposed||!containerRef.current)return;
        chart=createChart(containerRef.current,{
          autoSize:true,
          layout:{background:{type:ColorType.Solid,color:"#ffffff"},textColor:"#91a097",fontSize:10,fontFamily:'-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif',attributionLogo:true,panes:{separatorColor:"#edf2ef",separatorHoverColor:"#dbe9e1",enableResize:false}},
          grid:{vertLines:{visible:false},horzLines:{color:"#f0f3f1"}},
          crosshair:{mode:CrosshairMode.Normal,vertLine:{color:"#a7bdb1",width:1,labelBackgroundColor:"#3b6752"},horzLine:{color:"#bdccc3",labelBackgroundColor:"#3b6752"}},
          rightPriceScale:{borderVisible:false,minimumWidth:62,scaleMargins:{top:.12,bottom:.12}},
          timeScale:{borderVisible:false,timeVisible:false,rightOffset:2,barSpacing:7,minBarSpacing:.5,fixLeftEdge:true,fixRightEdge:true},
          localization:{locale:"ko-KR",dateFormat:"yyyy.MM.dd",priceFormatter:(value:number)=>format(Math.round(value))},
          handleScroll:{mouseWheel:false,pressedMouseMove:true,horzTouchDrag:true,vertTouchDrag:false},
          trackingMode:{exitMode:TrackingModeExitMode.OnTouchEnd},
          handleScale:{mouseWheel:false,pinch:true,axisPressedMouseMove:true},
          kineticScroll:{mouse:false,touch:true},
        });
        chartRef.current=chart;
        const price=kind==="line"?chart.addSeries(AreaSeries,{lineColor:"#40896f",topColor:"#d6ece2a6",bottomColor:"#f6fbf800",lineWidth:2,priceLineColor:"#a6c5b6",priceLineVisible:true,priceFormat:{type:"price",precision:0,minMove:1}}):chart.addSeries(CandlestickSeries,{upColor,downColor,borderVisible:false,wickUpColor:upColor,wickDownColor:downColor,priceLineColor:"#a6b8ad",priceFormat:{type:"price",precision:0,minMove:1}});
        if(kind==="line")price.setData(bars.map(bar=>({time:bar.time,value:bar.close})));else price.setData(bars);
        const volume=chart.addSeries(HistogramSeries,{priceFormat:{type:"volume"},priceLineVisible:false,lastValueVisible:false},1);
        volume.setData(bars.map(bar=>({time:bar.time,value:bar.volume,color:bar.close>=bar.open?"#e8acaa":"#aac0df"})));
        volume.priceScale().applyOptions({scaleMargins:{top:.15,bottom:0},borderVisible:false});
        chart.panes()[0].setStretchFactor(4);
        chart.panes()[1].setStretchFactor(1);
        chart.timeScale().fitContent();
        const lookup=new Map(bars.map(bar=>[bar.time,bar]));
        chart.subscribeCrosshairMove(param=>{
          if(disposed)return;
          if(!param.time){setSelected(null);return;}
          const t=typeof param.time==="string"?param.time:typeof param.time==="object"?`${param.time.year}-${String(param.time.month).padStart(2,"0")}-${String(param.time.day).padStart(2,"0")}`:"";
          setSelected(lookup.get(t)??null);
        });
        moveCrosshairRef.current=bar=>{chart?.setCrosshairPosition(bar.close,bar.time,price);setSelected(bar);};
        setStatus("ready");
      }catch{if(!disposed)setStatus("error");}
    }
    void mount();
    return()=>{disposed=true;moveCrosshairRef.current=null;chartRef.current=null;chart?.remove();};
  },[bars,kind]);

  function selectDay(index:number){const bar=bars[Math.max(0,Math.min(bars.length-1,index))];moveCrosshairRef.current?.(bar);setAnnouncement(`${bar.time}, 종가 ${format(bar.close)}원, 거래량 ${format(bar.volume)}주`);}
  function reset(){chartRef.current?.timeScale().fitContent();chartRef.current?.clearCrosshairPosition();setSelected(null);}

  return <section className="section stock-chart" aria-labelledby="stock-chart-title" data-chart-kind={kind} data-chart-range={range} data-chart-bars={bars.length} data-chart-status={status}>
    <div className="stock-chart-heading"><div><h2 id="stock-chart-title">주가 차트 <span>일봉</span></h2><p>가격의 흐름과 거래량을 함께 살펴보세요.</p></div><span className="chart-example-badge">예시 데이터</span></div>
    <div className="stock-chart-controls"><div className="chart-ranges" aria-label="차트 조회 기간">{ranges.map(r=><button key={r.id} className={range===r.id?"selected":""} aria-pressed={range===r.id} onClick={()=>setRange(r.id)}>{r.label}</button>)}</div><div className="chart-types" aria-label="차트 형태"><button className={kind==="line"?"selected":""} aria-pressed={kind==="line"} onClick={()=>setKind("line")}><TrendingUp size={14}/>선</button><button className={kind==="candle"?"selected":""} aria-pressed={kind==="candle"} onClick={()=>setKind("candle")}><ChartCandlestick size={14}/>캔들</button></div><button className="chart-reset" aria-label="차트 범위 초기화" title="차트 범위 초기화" onClick={reset}><RotateCcw size={14}/></button></div>
    <div className="chart-readout" aria-live="off"><div className="chart-readout-date"><span>{active.time.replaceAll("-",".")}</span><span>{selected?"선택한 날짜":"마지막 예시 일봉"}</span></div><div className="chart-ohlc">{[{label:"시가",value:active.open},{label:"고가",value:active.high},{label:"저가",value:active.low},{label:"종가",value:active.close}].map(item=><span key={item.label}><small>{item.label}</small><b>{format(item.value)}</b></span>)}<span><small>거래량</small><b>{volumeLabel(active.volume)}<small>주</small></b></span></div></div>
    <div className="chart-canvas-wrap" role="group" aria-label={`${stock.name} 예시 가격·거래량 차트`} tabIndex={0} aria-describedby="chart-keyboard-help" onKeyDown={e=>{
      if(!["ArrowLeft","ArrowRight","Home","End","Escape"].includes(e.key))return;
      e.preventDefault();if(e.key==="Escape"){reset();return;}
      selectDay(e.key==="Home"?0:e.key==="End"?bars.length-1:activeIndex+(e.key==="ArrowLeft"?-1:1));
    }}>
      <div ref={containerRef} className="chart-canvas"/>
      <span className="chart-volume-label">거래량</span>
      {status!=="ready"&&<div className="chart-placeholder" role="status">{status==="error"?"차트를 불러오지 못했어요. 기간이나 차트 형태를 다시 선택해 주세요.":"차트를 준비하고 있어요."}</div>}
    </div>
    <div className="chart-bottom-row"><span className="chart-period-summary">{ranges.find(r=>r.id===range)?.label} 변동 <b className={periodChange>=0?"up":"down"}>{periodChange>0?"+":""}{periodChange.toFixed(2)}%</b></span><div className="chart-day-navigation"><button aria-label="이전 날짜 가격 보기" disabled={activeIndex===0||status!=="ready"} onClick={()=>selectDay(activeIndex-1)}><ChevronLeft size={15}/></button><span>날짜 살펴보기</span><button aria-label="다음 날짜 가격 보기" disabled={activeIndex===bars.length-1||status!=="ready"} onClick={()=>selectDay(activeIndex+1)}><ChevronRight size={15}/></button></div></div>
    <span className="sr-only" role="status">{announcement}</span>
    <p id="chart-keyboard-help" className="chart-help">차트를 누르거나 길게 터치해 가격을 확인하세요. 키보드로는 좌우 방향키를 사용할 수 있어요.</p>
    <div className="chart-fixture-note"><Info size={13}/><span>화면 검토용 예시입니다. 실제 과거 주가·실시간 시세는 연결되지 않았어요.</span></div>
    <div className="chart-attribution">TradingView Lightweight Charts™ · Copyright (с) 2025 TradingView, Inc. <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TradingView</a></div>
  </section>;
}
