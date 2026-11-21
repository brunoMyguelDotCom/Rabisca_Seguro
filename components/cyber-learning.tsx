'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Check, ChevronRight, Cloud, Eye, FileWarning, Fingerprint, Heart, KeyRound, LockKeyhole, Mail, Menu, Monitor, MousePointer2, Shield, ShieldAlert, ShoppingBag, Smartphone, Sparkles, Wifi, X } from 'lucide-react'

type Lesson = { number: string; title: string; short: string; icon: typeof Mail; learn: string; tip: string }
const lessons: Lesson[] = [
  { number: '01', title: 'E-mail phishing', short: 'Você reconheceria uma tentativa de golpe?', icon: Mail, learn: 'Phishing usa mensagens falsas para convencer você a revelar dados, clicar em links ou agir com pressa. Observe o remetente, a urgência e pedidos de senhas ou códigos.', tip: 'Na dúvida, acesse o serviço pelo aplicativo ou endereço que você já conhece — nunca pelo link da mensagem.' },
  { number: '02', title: 'Anexos suspeitos', short: 'Um arquivo pode esconder um programa malicioso.', icon: FileWarning, learn: 'A extensão final indica o tipo real do arquivo. Um nome como Nota_Fiscal.pdf.exe continua sendo um executável, apesar de parecer um documento.', tip: 'Confirme quem enviou o arquivo e desconfie de extensões duplas ou inesperadas.' },
  { number: '03', title: 'Criação de senhas', short: 'Quanto tempo alguém levaria para descobrir a sua?', icon: KeyRound, learn: 'Senhas longas e únicas são mais difíceis de adivinhar. Evite sequências, palavras comuns e informações pessoais; um gerenciador ajuda a criar e guardar senhas diferentes.', tip: 'Digite somente uma senha inventada: a análise acontece no seu navegador e nada é enviado ou armazenado.' },
  { number: '04', title: 'Autenticação em dois fatores', short: 'Sua senha não é a única proteção.', icon: Fingerprint, learn: 'A autenticação de dois fatores combina algo que você sabe, como uma senha, com algo que possui, como um autenticador. Nunca compartilhe códigos de verificação.', tip: 'Ative 2FA nas contas importantes e prefira um aplicativo autenticador quando disponível.' },
  { number: '05', title: 'Compras online', short: 'Ofertas boas demais para serem verdadeiras.', icon: ShoppingBag, learn: 'Lojas falsas usam descontos extremos, pressão por tempo e pagamentos fora da plataforma. Pesquise a loja, confira o domínio e leia as condições antes de pagar.', tip: 'Preço baixo e contagem regressiva não são prova de oportunidade. Pare e verifique.' },
  { number: '06', title: 'URLs falsas', short: 'Nem todo endereço conhecido é verdadeiro.', icon: Eye, learn: 'Leia o domínio da direita para a esquerda. Em gov.br.seguranca.example, o domínio principal é seguranca.example. HTTPS criptografa a conexão, mas não garante que a loja seja legítima.', tip: 'Use favoritos ou digite o endereço oficial. Não confie apenas no nome que aparece no link.' },
  { number: '07', title: 'Ataque homográfico', short: 'Quando um endereço parece idêntico ao original.', icon: ShieldAlert, learn: 'Caracteres de alfabetos diferentes podem parecer iguais. Um domínio pode usar letras cirílicas no lugar de latinas; o navegador pode revelar isso como Punycode.', tip: 'A aparência não basta. Use favoritos, confira o endereço real e evite links inesperados.' },
]

const emails = [
  { from: 'alerta@banco-horizonte-seguranca.example', subject: 'Sua conta será bloqueada!', body: 'Atividade suspeita detectada. Atualize seus dados imediatamente.', safe: false, why: 'Urgência artificial e domínio estranho tentam pressionar você a agir.' },
  { from: 'comunicados@banco-horizonte.example', subject: 'Informativo mensal disponível', body: 'Seu informativo está disponível. Não pedimos senhas ou códigos.', safe: true, why: 'Na simulação, é uma mensagem informativa de remetente previamente verificado.' },
  { from: 'suporte@bancohorizonte-validacao.example', subject: 'Confirme seus dados', body: 'Informe CPF, senha e código de segurança para evitar restrições.', safe: false, why: 'Pede dados confidenciais e usa um domínio parecido, mas não oficial.' },
]
const urls = [
  { url: 'https://www.gov.br', safe: true, why: 'O domínio principal é gov.br.' },
  { url: 'https://www.gov.br.seguranca.example/login', safe: false, why: 'O domínio principal é seguranca.example; gov.br aparece apenas antes dele.' },
  { url: 'https://www.atualizacao-gov.example', safe: false, why: 'O domínio termina em .example, não em gov.br.' },
]
const offers = [
  { name: 'Fone Bluetooth', price: 'R$ 189,90', store: 'Som & Cia · somecia.example', signs: 'Loja verificável, avaliações e pagamento dentro da plataforma.', safe: true },
  { name: 'Smartphone Premium', price: 'R$ 299,00', store: 'Oferta relâmpago · somente Pix', signs: 'Preço irreal, urgência e transferência para pessoa física.', safe: false },
  { name: 'Notebook', price: 'R$ 799,00', store: 'notebook-oficial-ofertas.example', signs: 'Nome imitador, grande desconto e falta de dados comerciais.', safe: false },
]
const missionErrorMessages = [
  'Alerta de phishing: esta mensagem usa urgência e um remetente suspeito.',
  'Alerta de anexo: a extensão .exe pode executar um arquivo perigoso.',
  'Senha fraca: uma senha curta ou previsível é mais fácil de adivinhar.',
  'Código de verificação incorreto: nunca compartilhe códigos de autenticação.',
  'Oferta suspeita: preço irreal e pagamento por Pix podem indicar um golpe.',
  'Endereço falso: confira o domínio principal antes de abrir o link.',
  'Ataque homográfico: letras parecidas podem esconder um endereço falso.',
]

function HandButton({ children, onClick, disabled = false, secondary = false }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; secondary?: boolean }) {
  return <button className={`hand-button ${secondary ? 'hand-button--light' : ''}`} onClick={onClick} disabled={disabled}>{children}<ArrowRight size={16} aria-hidden="true" /></button>
}

export function CyberLearning() {
  const [active, setActive] = useState<number | null>(null)
  const [completed, setCompleted] = useState<number[]>([])
  const [answer, setAnswer] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [phase, setPhase] = useState<'password' | 'code'>('password')
  const [code, setCode] = useState('')
  const [tick, setTick] = useState(15)
  const [demoCode, setDemoCode] = useState('482913')
  const [infection, setInfection] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const cursorRef = useRef<HTMLDivElement>(null)
  const [cursorHost, setCursorHost] = useState<HTMLElement | null>(null)
  const lesson = active === null ? null : lessons[active]
  const strength = useMemo(() => {
    let pool = 0
    if (/[a-z]/.test(password)) pool += 26
    if (/[A-Z]/.test(password)) pool += 26
    if (/\d/.test(password)) pool += 10
    if (/[^a-zA-Z0-9]/.test(password)) pool += 32
    const entropy = password.length * Math.log2(Math.max(pool, 1))
    const score = !password ? 0 : password.length < 9 || entropy < 35 ? 1 : entropy < 65 ? 2 : 3
    const seconds = Math.pow(Math.max(pool, 1), password.length) / 1e10 / 2
    const time = seconds < 60 ? 'menos de 1 minuto' : seconds < 3600 ? `${Math.floor(seconds / 60)} minutos` : seconds < 86400 ? `${Math.floor(seconds / 3600)} horas` : seconds < 31536000 ? `${Math.floor(seconds / 86400)} dias` : `${Math.floor(seconds / 31536000).toLocaleString('pt-BR')} anos`
    return { score, label: ['Digite uma senha', 'Muito fraca', 'Em desenvolvimento', 'Forte'][score], time }
  }, [password])
  useEffect(() => {
    if (active !== 3 || phase !== 'code') return
    const interval = window.setInterval(() => {
      setTick(current => {
        if (current <= 1) {
          setDemoCode(String(Math.floor(100000 + Math.random() * 900000)))
          return 15
        }
        return current - 1
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [active, phase])

  useEffect(() => {
    if (active === null) return
    const frame = window.requestAnimationFrame(() => document.getElementById('experiencia')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
    return () => window.cancelAnimationFrame(frame)
  }, [active])
  useEffect(() => {
    setCursorHost(document.body)
  }, [])

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor || !cursorHost) return
    const move = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX - 2}px, ${event.clientY - 1}px, 0)`
      cursor.classList.add('is-visible')
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [cursorHost])

  function openLesson(index: number) { setActive(index); setAnswer(null); setPassword(''); setPhase('password'); setCode(''); setTick(15); setDemoCode('482913') }
  function choose(index: number, correct: boolean) {
    if (isTransitioning) return
    setAnswer(index)
    if (!correct) {
      setErrorMessage(missionErrorMessages[active ?? 0])
      setInfection(true)
      window.setTimeout(() => setInfection(false), 2000)
    }
    if (correct && active !== null && !completed.includes(active)) setCompleted([...completed, active])
  }
  function finishCurrent() {
    if (active === null || isTransitioning) return
    if (!completed.includes(active)) setCompleted([...completed, active])
    const next = active + 1
    setIsTransitioning(true)
    window.setTimeout(() => {
      setAnswer(null); setPassword(''); setPhase('password'); setCode(''); setTick(15); setDemoCode('482913')
      setIsTransitioning(false)
      if (next < lessons.length) setActive(next)
      else {
        setActive(null)
        window.requestAnimationFrame(() => document.getElementById('temas')?.scrollIntoView({ behavior: 'smooth' }))
      }
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 340)
  }

  return <main className={`paper-shell ${infection ? 'infection-mode' : ''}`}>
    {cursorHost && createPortal(<div ref={cursorRef} className="sketch-cursor" aria-hidden="true"><MousePointer2 size={24} strokeWidth={1.8} /></div>, cursorHost)}
    {infection && <div className="infection-overlay" role="status" aria-live="assertive"><strong>ALERTA DE SIMULAÇÃO</strong><span>{errorMessage}</span></div>}
    <header className="topbar sketch-frame">
      <a href="#inicio" className="brand" aria-label="Rabisca Seguro, início"><span className="brand-mark"><Shield size={22} /></span><span>Rabisca<br />Seguro</span></a>
      <nav aria-label="Navegação principal"><a href="#inicio">Início</a><a href="#temas">Missões</a><a href="#sobre">Sobre</a></nav>
      <a className="top-cta" href="#temas">Começar missão <ArrowUpRight size={16} /></a>
    </header>

    <section className="hero" id="inicio">
      <div className="hero-copy">
        <span className="eyebrow"><span className="scribble-dot" /> UM GUIA DE SOBREVIVÊNCIA DIGITAL</span>
        <h1>Na internet,<br />nem tudo é <span className="underline-word">o que parece.</span></h1>
        <p>Um clique distraído pode virar uma grande dor de cabeça. Aprenda a reconhecer os golpes mais comuns — testando suas escolhas em missões rápidas.</p>
        <div className="hero-actions"><HandButton onClick={() => document.getElementById('temas')?.scrollIntoView({ behavior: 'smooth' })}>Explorar as missões</HandButton><span className="hand-note"><ArrowDown size={17} /> leva só alguns minutos</span></div>
        <div className="hero-meta"><span><span className="meta-icon"><BookOpen size={15} /></span> 7 missões interativas</span><span><span className="meta-icon"><Shield size={15} /></span> 100% educativo</span></div>
      </div>
      <div className="hero-illustration" aria-label="Ilustração de um computador protegido por um cadeado" role="img">
        <div className="doodle-sun">✳</div><div className="floating-tag tag-top">PENSE ANTES<br />DE CLICAR</div>
        <div className="screen-doodle"><div className="screen-top"><i /><i /><i /><span>navegador-seguro.exe</span></div><div className="screen-content"><div className="screen-shield"><Shield size={62} strokeWidth={1.8} /><LockKeyhole className="shield-lock" size={24} /></div><div className="screen-lines"><b>CONEXÃO<br />PROTEGIDA</b><span /><span /><span /></div></div><div className="screen-base" /></div>
        <div className="floating-tag tag-side"><MousePointer2 size={17} /> link suspeito?</div><div className="orbit orbit-one"><Sparkles size={22} /></div><div className="orbit orbit-two"><Mail size={24} /></div><div className="hero-caption">um pouquinho de atenção<br />muda tudo <Heart size={13} /></div>
      </div>
      <span className="margin-note">fig. 01 — fique atento</span>
    </section>

    <section className="mission-strip" aria-label="Resumo do progresso">
      <div className="strip-label"><span className="strip-kicker">SEU CADERNO DE CAMPO</span><strong>Uma missão<br />de cada vez.</strong></div>
      <div className="progress-wrap"><div className="progress-head"><span>MISSÕES CONCLUÍDAS</span><b>{completed.length} <small>/ 7</small></b></div><div className="progress-track" role="progressbar" aria-label="Missões concluídas" aria-valuenow={completed.length} aria-valuemin={0} aria-valuemax={7}><span style={{ width: `${completed.length / 7 * 100}%` }} /></div><div className="progress-foot"><span>Seu radar está ficando afiado.</span><span>{Math.round(completed.length / 7 * 100)}%</span></div></div>
      <div className="strip-stamp"><BadgeCheck size={25} /><span>APRENDER<br />É SE PROTEGER</span></div>
    </section>

    <section className="lessons-section" id="temas">
      <div className="section-heading"><div><span className="eyebrow">ESCOLHA SUA AVENTURA</span><h2>O que vamos <span className="underline-word">investigar?</span></h2></div><span className="heading-side-note">clique numa missão<br />e coloque o radar pra funcionar <ArrowDown size={16} /></span></div>
      <div className="lesson-grid">{lessons.map((item, i) => { const Icon = item.icon; return <article className={`lesson-card card-${i + 1}`} key={item.number}>
        <div className="lesson-top"><span className="lesson-number">{item.number}</span><span className="lesson-icon"><Icon size={24} strokeWidth={1.8} /></span>{completed.includes(i) && <span className="done-badge" aria-label="Concluída"><Check size={14} /></span>}</div>
        <h3>{item.title}</h3><p>{item.short}</p><button className="lesson-link" onClick={() => openLesson(i)}>{completed.includes(i) ? 'Revisitar missão' : 'Investigar missão'} <ArrowUpRight size={15} /></button><span className="card-scribble" aria-hidden="true">{i % 2 ? '✳' : '〰'}</span>
      </article> })}</div>
    </section>

    {lesson && active !== null && <section className="experience-section" id="experiencia" aria-live="polite">
      <div key={active} className={`computer-shell ${infection ? 'computer-shell--error' : ''} ${isTransitioning ? 'computer-shell--exiting' : ''}`}>
        <div className="computer-bezel" aria-hidden="true"><span className="computer-indicator" /><span className="computer-camera" /><span className="computer-model">RABISCA SEGURO · LABORATÓRIO</span></div>
        <div className="computer-screen">
          <div className="experience-heading"><span className="eyebrow">MISSÃO {lesson.number} · {active + 1} DE 7</span><button className="close-mission" onClick={() => setActive(null)} aria-label="Fechar missão"><X size={18} /></button><h2>{lesson.title}</h2><p>{lesson.learn}</p></div>
          <div className="experience-layout"><aside className="learn-note"><span className="note-label"><BookOpen size={15} /> NO CADERNO</span><p>{lesson.tip}</p><div className="note-doodle"><Shield size={29} /><span>olho vivo!</span></div></aside>
            <div className="activity-window"><div className="window-bar"><span className="window-dots"><i /><i /><i /></span><span>laboratório de segurança</span><span className="window-status"><span /> SIMULAÇÃO</span></div><div className="activity-body">
          {active === 0 && <><div className="activity-title"><Mail size={20} /><div><b>Caixa de entrada</b><small>3 mensagens novas · escolha a legítima</small></div></div><div className="email-list">{emails.map((email, i) => <button className={`email-option ${answer === i ? email.safe ? 'is-correct' : 'is-wrong' : ''}`} key={email.from} onClick={() => choose(i, email.safe)}><span className="email-avatar"><Mail size={17} /></span><span className="email-copy"><b>{email.from}</b><strong>{email.subject}</strong><span>{email.body}</span>{answer === i && <em>{email.safe ? 'Boa! Você identificou a mensagem legítima. ' : 'Você caiu numa simulação de phishing! '}{email.why}</em>}</span><ChevronRight size={17} /></button>)}</div>{answer !== null && <div className={`feedback ${emails[answer].safe ? 'feedback-good' : 'feedback-bad'}`}>{emails[answer].safe ? 'Acertou! ' : 'Ops! '}{emails[answer].why}{emails[answer].safe && <HandButton onClick={finishCurrent}>Concluir missão</HandButton>}</div>}</>}
          {active === 1 && <><div className="activity-title"><FileWarning size={20} /><div><b>Anexos recebidos</b><small>Qual arquivo parece seguro para abrir?</small></div></div><div className="file-grid">{[{ name: 'Relatorio_Financeiro.pdf', icon: 'PDF', safe: true }, { name: 'Comprovante_Pagamento.jpg', icon: 'JPG', safe: true }, { name: 'Nota_Fiscal.pdf.exe', icon: 'EXE', safe: false }].map((file, i) => <button key={file.name} className={`file-option ${answer === i ? file.safe ? 'is-correct' : 'is-wrong' : ''}`} onClick={() => choose(i, file.safe)}><span className="file-icon"><FileWarning size={23} /><small>{file.icon}</small></span><b>{file.name}</b><small>{answer === i ? file.safe ? 'Arquivo fictício seguro nesta simulação.' : 'Ops! A extensão final é .exe, um executável.' : 'anexo · 1 arquivo'}</small></button>)}</div>{answer !== null && <div className={`feedback ${answer === 2 ? 'feedback-bad' : 'feedback-good'}`}>{answer === 2 ? 'Você abriu um anexo suspeito na simulação. Na vida real, .exe pode executar um programa.' : 'Boa escolha! Arquivo classificado corretamente nesta simulação.'}<HandButton onClick={finishCurrent}>Concluir missão</HandButton></div>}</>}
          {active === 2 && <><div className="activity-title"><KeyRound size={20} /><div><b>Laboratório de senhas</b><small>Use apenas uma senha inventada</small></div></div><label className="field-label" htmlFor="demo-password">Digite uma senha fictícia</label><input id="demo-password" className="sketch-input" type="text" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} placeholder="experimente aqui — nada será enviado" /><div className="strength-label"><span>Resistência: <b>{strength.label}</b></span><span>{password.length} caracteres</span></div><div className="strength-track" aria-label={`Força da senha: ${strength.label}`}><span className={`strength-fill strength-${strength.score}`} /></div><p className="estimate"><KeyRound size={16} /> Estimativa hipotética: <b>{password ? strength.time : '—'}</b></p><p className="fine-print">Simulação matemática de força bruta, considerando até 10 bilhões de tentativas por segundo. Na prática, o resultado depende do poder computacional, algoritmo e proteções do serviço. Nada é armazenado ou enviado.</p><HandButton onClick={finishCurrent} disabled={password.length === 0}>Concluir missão</HandButton></>}
          {active === 3 && <><div className="activity-title"><Fingerprint size={20} /><div><b>Confirme sua identidade</b><small>Conta fictícia · nenhum dado será enviado</small></div></div>{phase === 'password' ? <><label className="field-label" htmlFor="fake-login">Digite uma senha fictícia para continuar</label><input id="fake-login" className="sketch-input" type="password" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} placeholder="não use sua senha real" /><HandButton onClick={() => { if (password) setPhase('code') }} disabled={!password}>Continuar</HandButton></> : <><div className="two-factor"><div><p>Digite o código de 6 dígitos exibido no autenticador:</p><div className="auth-code"><Smartphone size={19} /><b>{demoCode.slice(0, 3)} {demoCode.slice(3)}</b><span>atualiza em {tick}s</span></div><label className="field-label" htmlFor="auth-code">Código de verificação</label><input id="auth-code" className="sketch-input" inputMode="numeric" maxLength={6} value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} placeholder="000000" /></div><div className="phone-doodle"><Smartphone size={34} /><span>AUTENTICADOR</span><b>{demoCode.slice(0, 3)}<br />{demoCode.slice(3)}</b><small>● ● ● ○ ○ · {tick}s</small></div></div><HandButton onClick={() => { if (code === demoCode) choose(0, true); else choose(1, false) }} disabled={code.length !== 6}>Verificar código</HandButton>{answer !== null && <div className={`feedback ${answer === 0 ? 'feedback-good' : 'feedback-bad'}`}>{answer === 0 ? 'Acesso autorizado! Simulação concluída. Nunca compartilhe seus códigos.' : 'Código incorreto. Confira os seis dígitos no autenticador fictício.'}{answer === 0 && <HandButton onClick={finishCurrent}>Concluir missão</HandButton>}</div>}</>}</>}
          {active === 4 && <><div className="activity-title"><ShoppingBag size={20} /><div><b>Vitrine de ofertas</b><small>Qual loja parece mais confiável?</small></div></div><div className="offer-list">{offers.map((offer, i) => <button key={offer.name} className={`offer-option ${answer === i ? offer.safe ? 'is-correct' : 'is-wrong' : ''}`} onClick={() => choose(i, offer.safe)}><span className="offer-art"><ShoppingBag size={29} /></span><span className="offer-info"><b>{offer.name}</b><small>{offer.store}</small><strong>{offer.price}</strong>{answer === i && <em>{offer.safe ? 'Boa escolha. ' : 'Sinal de golpe. '}{offer.signs}</em>}</span><ChevronRight size={17} /></button>)}</div>{answer !== null && <div className={`feedback ${offers[answer].safe ? 'feedback-good' : 'feedback-bad'}`}>{offers[answer].safe ? 'Boa escolha! ' : 'Você caiu numa simulação de golpe! '}{offers[answer].signs}{offers[answer].safe && <HandButton onClick={finishCurrent}>Concluir missão</HandButton>}</div>}</>}
          {active === 5 && <><div className="activity-title"><Eye size={20} /><div><b>Inspeção de endereço</b><small>Qual endereço é oficial do Governo Federal?</small></div></div><div className="url-list">{urls.map((item, i) => <button key={item.url} className={`url-option ${answer === i ? item.safe ? 'is-correct' : 'is-wrong' : ''}`} onClick={() => choose(i, item.safe)}><span className="url-lock"><LockKeyhole size={15} /></span><code>{item.url}</code><ChevronRight size={16} />{answer === i && <em>{item.why}</em>}</button>)}</div>{answer !== null && <div className={`feedback ${urls[answer].safe ? 'feedback-good' : 'feedback-bad'}`}>{urls[answer].safe ? 'Muito bem! ' : 'Ops! '}{urls[answer].why}{urls[answer].safe && <HandButton onClick={finishCurrent}>Concluir missão</HandButton>}</div>}</>}
          {active === 6 && <><div className="activity-title"><ShieldAlert size={20} /><div><b>O teste do olhar</b><small>Escolha o endereço original</small></div></div><div className="homo-urls"><button className={`homograph-option ${answer === 0 ? 'is-correct' : ''}`} aria-pressed={answer === 0} onClick={() => choose(0, true)}><span>ORIGINAL · letras latinas</span><code>https://www.paypal.com</code></button><span className="versus">PARECEM IGUAIS?</span><button className={`homograph-option ${answer === 1 ? 'is-wrong' : ''}`} aria-pressed={answer === 1} onClick={() => choose(1, false)}><span>IMITAÇÃO · letras cirílicas</span><code>https://www.раураl.com</code></button></div>{answer !== null && <div className={`feedback ${answer === 0 ? 'feedback-good' : 'feedback-bad'}`} role="status" aria-live="polite"><Sparkles size={20} /><div><b>{answer === 0 ? 'Correto! Você identificou o endereço original.' : 'Resposta incorreta: esse endereço é uma imitação.'}</b><p>{answer === 0 ? 'O domínio verdadeiro usa letras latinas. Você concluiu as questões e pode finalizar a missão.' : 'O segundo endereço usa letras cirílicas parecidas com as latinas; confira o endereço original antes de continuar.'}</p></div>{answer === 0 && <HandButton onClick={finishCurrent}>Concluir missão</HandButton>}</div>}</>}
        </div></div></div>
        </div>
        <div className="computer-stand" aria-hidden="true" />
      </div>
    </section>}

    {completed.length === 7 && <section className="completion-banner"><BadgeCheck size={36} /><div><span className="eyebrow">CADERNO COMPLETO</span><h2>Você está mais preparado para navegar com segurança!</h2><p>Na internet, nem tudo é o que parece. Pense antes de clicar.</p></div></section>}

    <section className="about-section" id="sobre"><div className="about-doodle"><Monitor size={42} /><LockKeyhole size={22} /><span className="about-spark">✳</span></div><div className="about-copy"><span className="eyebrow">UM PROJETO DE EXTENSÃO</span><h2>Aprender também é <span className="underline-word">se proteger.</span></h2><p>Um espaço para praticar decisões digitais com calma, curiosidade e sem risco. As simulações são fictícias: não coletamos informações, senhas ou códigos.</p><div className="team-list"><span>FEITO COM CUIDADO POR</span><b>Bruno Myguel</b><i /><b>Guilherme Paiva</b><i /><b>Vinicius Barbosa</b></div></div></section>
    <footer><a className="footer-brand" href="#inicio"><Shield size={17} /> Rabisca Seguro</a><span>Um rabisco de atenção pode evitar um problemão.</span><a href="#inicio">Voltar ao topo ↑</a></footer>
  </main>
}
