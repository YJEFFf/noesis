export type PriceBar = { time:string; open:number; high:number; low:number; close:number; volume:number };
export type ChartStock = { code:string; name:string; price:number; change:number; volume:number };
export type ChartRange = "1m" | "3m" | "1y";
export const CHART_AS_OF = "2026-11-10";

// Synthetic, repeatable design data. Weekdays here are NOT a KRX trading calendar.
// This adapter-shaped fixture is independent of the operating SIMA collectors.
export function examplePriceHistory(stock:ChartStock):PriceBar[] {
  let seed=Number(stock.code)+29;
  const next=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
  const dates:string[]=[];
  for(let date=new Date("2025-11-11T00:00:00Z");date.toISOString().slice(0,10)<=CHART_AS_OF;date.setUTCDate(date.getUTCDate()+1)){
    if(date.getUTCDay()!==0&&date.getUTCDay()!==6)dates.push(date.toISOString().slice(0,10));
  }
  let close=100;
  const raw=dates.map((time,i)=>{
    const open=close*(1+(next()-.5)*.012);
    close=Math.max(45,open*(1+(next()-.47)*.035+Math.sin(i/17)*.0015));
    return {time,open,close,high:Math.max(open,close)*(1+.003+next()*.015),low:Math.min(open,close)*(1-.003-next()*.015),volume:Math.round(stock.volume*(.25+next()*1.05))};
  });
  const factor=stock.price/raw[raw.length-1].close;
  const bars=raw.map(bar=>({...bar,open:Math.round(bar.open*factor),high:Math.round(bar.high*factor),low:Math.round(bar.low*factor),close:Math.round(bar.close*factor)}));
  const previous=bars[bars.length-2];
  previous.close=Math.round(stock.price/(1+stock.change/100));
  previous.high=Math.max(previous.high,previous.close);
  previous.low=Math.min(previous.low,previous.close);
  const last=bars[bars.length-1];
  last.open=previous.close;last.close=stock.price;last.volume=stock.volume;
  last.high=Math.max(last.open,last.close, last.high);
  last.low=Math.min(last.open,last.close,last.low);
  return bars;
}

export function priceRange(bars:PriceBar[],range:ChartRange):PriceBar[] {
  const cutoff=new Date(`${CHART_AS_OF}T00:00:00Z`);
  cutoff.setUTCMonth(cutoff.getUTCMonth()-(range==="1m"?1:range==="3m"?3:12));
  return bars.filter(bar=>bar.time>=cutoff.toISOString().slice(0,10));
}
