
import {useEffect, useRef, useState, type FormEvent} from "react";
import {ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, Eye, EyeOff, History, Info, LockKeyhole, Mail, MessageCircle, ShieldCheck} from "lucide-react";

type Mode="login"|"signup"|"reset";
type Stage="form"|"provider"|"email"|"complete";

export default function AuthPanel({onBrowse,onDone}:{onBrowse:()=>void;onDone:(method:string)=>void}){
  const [mode,setMode]=useState<Mode>("login");
  const [stage,setStage]=useState<Stage>("form");
  const [provider,setProvider]=useState("이메일");
  const [email,setEmail]=useState("");
  const [nickname,setNickname]=useState("");
  const [password,setPassword]=useState("");
  const [confirmation,setConfirmation]=useState("");
  const [visible,setVisible]=useState(false);
  const [agreed,setAgreed]=useState(false);
  const [error,setError]=useState("");
  const heading=useRef<HTMLHeadingElement>(null);
  const first=useRef(true);
  useEffect(()=>{if(first.current){first.current=false;return;}heading.current?.focus();},[mode,stage]);
  function clearSecret(){setPassword("");setConfirmation("");setVisible(false);}
  function changeMode(next:Mode){setMode(next);setStage("form");setError("");setAgreed(false);clearSecret();}
  function social(name:string){setProvider(name);clearSecret();setError("");setStage("provider");}
  function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setError("");
    if(mode!=="reset"&&password.length<8){setError("예시 비밀번호를 8자 이상 입력해 주세요.");return;}
    if(mode==="signup"&&password!==confirmation){setError("입력한 비밀번호가 서로 달라요.");return;}
    if(mode==="signup"&&!agreed){setError("시안의 동의 항목을 확인해 주세요.");return;}
    setProvider("이메일");clearSecret();setStage(mode==="login"?"complete":"email");
  }
  function fillExample(){setEmail("demo@noesis.example");setNickname("노에시스 사용자");setPassword("NoesisPreview8!");setConfirmation("NoesisPreview8!");setError("");}
  const title=stage==="provider"?`${provider} 계정 연결`:stage==="email"?(mode==="reset"?"비밀번호 재설정 안내":"이메일을 확인해 주세요"):stage==="complete"?"내 기록을 이어볼 준비":mode==="signup"?"노에시스에서 시작하세요":mode==="reset"?"비밀번호를 잊으셨나요?":"다시 만나 반가워요";
  return <div className="auth-page">
    <button className="auth-back" onClick={onBrowse}><ArrowLeft size={15}/>회원가입 없이 시안 둘러보기</button>
    <div className="auth-layout">
      <aside className="auth-story">
        <span className="eyebrow">YOUR OWN INVESTMENT SPACE</span>
        <h1>관심에서 시작한 기록이,<br/>나의 판단이 되도록<span>.</span></h1>
        <p>어디서 접속하든 이어지는 투자 기록.<br/>노에시스가 당신의 판단 곁에 함께합니다.</p>
        <div className="auth-benefits">{[{icon:Bookmark,title:"관심 종목을 한곳에",text:"다시 찾고 싶은 기업을 저장하세요."},{icon:History,title:"분석의 흐름을 이어서",text:"지난 판단과 그때의 이유를 살펴보세요."},{icon:ShieldCheck,title:"나에게 연결된 기록",text:"나의 관심과 분석을 내 계정에서 확인하세요."}].map(item=><div key={item.title}><span><item.icon size={20}/></span><div><b>{item.title}</b><p>{item.text}</p></div></div>)}</div>
        <div className="auth-story-note"><span className="green-dot"/>계정 연결 후 제공할 기능을 미리 살펴보는 화면입니다.</div>
      </aside>
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-card-top"><span className="eyebrow">{mode==="signup"?"CREATE YOUR ACCOUNT":"NOESIS ACCOUNT"}</span><span className="tiny-pill">화면 시안</span></div>
        <h2 ref={heading} tabIndex={-1} id="auth-title">{title}</h2>
        <p className="auth-intro">{stage==="form"?(mode==="signup"?"이메일로 가입하고 나만의 투자 기록을 시작하세요.":mode==="reset"?"가입한 이메일로 재설정 안내를 받는 단계예요.":"편한 방법으로 로그인하고 기록을 이어보세요."):"실제 계정을 연결하지 않는 화면 미리보기입니다."}</p>
        {stage==="form"&&<>
          <div className="auth-demo-note"><Info size={14}/><p>예시 정보만 입력해 주세요. 입력 내용은 저장·전송하지 않으며, 실제 로그인과 메일 발송은 진행되지 않아요.</p></div>
          <form onSubmit={submit} autoComplete="off" className="auth-form">
            {mode==="signup"&&<label htmlFor="auth-nickname">닉네임<input id="auth-nickname" value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="어떻게 불러드릴까요?" required maxLength={20}/></label>}
            <label htmlFor="auth-email">이메일<input id="auth-email" type="email" inputMode="email" autoCapitalize="none" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com" required/></label>
            {mode!=="reset"&&<label htmlFor="auth-password">비밀번호<div className="auth-password"><input id="auth-password" type={visible?"text":"password"} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="예시 비밀번호 8자 이상" required minLength={8} aria-describedby="auth-error"/><button type="button" aria-label={visible?"비밀번호 숨기기":"비밀번호 표시"} aria-pressed={visible} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>}
            {mode==="signup"&&<><label htmlFor="auth-confirmation">비밀번호 확인<input id="auth-confirmation" type={visible?"text":"password"} autoComplete="new-password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} placeholder="한 번 더 입력해 주세요" required aria-describedby="auth-error"/></label><label className="auth-consent"><input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}/><span>이용약관 및 개인정보 처리 안내 동의 <small>시안 확인용 · 실제 약관 동의가 아닙니다.</small></span></label></>}
            <div id="auth-error" className="auth-error" role="alert">{error}</div>
            <button className="primary-button auth-submit" type="submit">{mode==="signup"?"이메일로 회원가입":mode==="reset"?"재설정 안내 보기":"이메일로 로그인"}<ArrowRight size={16}/></button>
            <div className="auth-form-options"><button type="button" onClick={fillExample}>예시 정보 채우기</button>{mode==="login"&&<button type="button" onClick={()=>changeMode("reset")}>비밀번호 찾기</button>}</div>
          </form>
          {mode!=="reset"&&<><div className="auth-divider"><span/>또는 간편하게 시작하기<span/></div><div className="auth-social"><button className="auth-kakao" onClick={()=>social("카카오")}><MessageCircle size={18} fill="currentColor"/>카카오로 계속하기</button><button className="auth-google" onClick={()=>social("Google")}><span aria-hidden="true" className="auth-google-mark">G</span>Google로 계속하기</button><button className="auth-naver" onClick={()=>social("네이버")}><span aria-hidden="true" className="auth-naver-mark">N</span>네이버로 계속하기</button></div></>}
          <div className="auth-switch">{mode==="login"?<>처음 오셨나요?<button onClick={()=>changeMode("signup")}>이메일로 회원가입</button></>:<>이미 계정이 있으신가요?<button onClick={()=>changeMode("login")}>로그인</button></>}</div>
        </>}
        {stage==="provider"&&<div className="auth-stage"><span className={`auth-stage-icon ${provider==="카카오"?"kakao":""}`}><LockKeyhole size={28}/></span><h3>{provider} 인증을 거치는 단계예요</h3><p>실제 서비스에서는 {provider} 인증 화면으로 이동해요.<br/>로그인 제공자 연결은 아직 준비 중입니다.</p><button className="primary-button" onClick={()=>setStage("complete")}>인증 완료 화면 미리보기<ArrowRight size={16}/></button><button className="text-button" onClick={()=>changeMode("login")}>로그인 방법 다시 선택</button></div>}
        {stage==="email"&&<div className="auth-stage"><span className="auth-stage-icon"><Mail size={28}/></span><h3>{mode==="reset"?"재설정 메일 안내 예시":"인증 메일 안내 예시"}</h3><b className="auth-email-preview">{email}</b><p>{mode==="reset"?"메일의 링크로 새 비밀번호를 설정하는 흐름입니다.":"메일의 인증 링크를 누르면 가입을 마치는 흐름입니다."}<br/><strong>이 시안에서는 메일이 발송되지 않았어요.</strong></p><button className="primary-button" onClick={()=>mode==="reset"?changeMode("login"):setStage("complete")}>{mode==="reset"?"로그인 화면으로":"이메일 인증 완료 화면 보기"}<ArrowRight size={16}/></button><button className="text-button" onClick={()=>changeMode(mode)}>이메일 다시 입력</button></div>}
        {stage==="complete"&&<div className="auth-stage"><span className="auth-stage-icon"><CheckCircle2 size={31}/></span><h3>로그인 완료 화면 예시</h3><p>관심 종목과 분석 기록을 이어보는 단계예요.<br/>실제 회원가입·인증·DB 저장은 아직 연결되지 않았어요.</p><div className="auth-complete-list"><span><Check size={14}/>관심 종목</span><span><Check size={14}/>분석 이력</span><span><Check size={14}/>개인 설정</span></div><button className="primary-button" onClick={()=>onDone(provider)}>내 정보 화면 둘러보기<ArrowRight size={16}/></button><button className="text-button" onClick={()=>changeMode("login")}>다른 로그인 방식 살펴보기</button></div>}
        <div className="auth-security"><ShieldCheck size={14}/><span>증권 계좌 연결은 로그인과 별도로 진행합니다.</span></div>
      </section>
    </div>
  </div>;
}
