import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  host: { class: 'block' },
  styles: [`
    :host {
      --y: #FEF400;
      --bg: #1E1A17;
      --bg2: #262220;
      --bg3: #2a2520;
      --text: #f0ede6;
      --muted: #888;
      --r: 14px;
      display: block;
      font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      overflow-x: hidden;
    }

    /* NAV */
    .lp-nav {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      padding: 20px 40px; display: flex; align-items: center; justify-content: space-between;
      transition: background .4s, backdrop-filter .4s;
    }
    .lp-nav.scrolled { background: rgba(30,26,23,.88); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(254,244,0,.07); }
    .logo { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; letter-spacing: .02em; text-decoration: none; color: var(--text); }
    .logo-icon { width: 36px; height: 36px; background: var(--y); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
    .logo-text span { color: var(--y); }
    .logo-text sub { font-size: 10px; letter-spacing: .12em; color: var(--muted); display: block; font-weight: 400; }
    .nav-login { color: var(--muted); font-size: 14px; font-weight: 600; text-decoration: none; transition: color .2s; }
    .nav-login:hover { color: var(--y); }
    .nav-cta { background: var(--y); color: #000; font-weight: 700; padding: 10px 22px; border-radius: 50px; font-size: 14px; text-decoration: none; letter-spacing: .03em; transition: transform .15s, box-shadow .15s; }
    .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(254,244,0,.35); }

    /* HERO */
    .hero { min-height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 120px 40px 80px; position: relative; overflow: hidden; }
    .hero-bg { position: absolute; inset: 0; pointer-events: none; }
    .hb1 { position: absolute; width: 700px; height: 700px; border-radius: 50%; background: var(--y); top: -200px; left: -100px; filter: blur(130px); opacity: .14; }
    .hb2 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: oklch(0.75 0.2 40); top: 40%; right: -100px; filter: blur(120px); opacity: .08; }
    .hero-bg::after { content: ''; position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px); background-size: 28px 28px; }
    .hero-inner { max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; position: relative; }
    .hero-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(254,244,0,.1); border: 1px solid rgba(254,244,0,.25); color: var(--y); font-size: 12px; font-weight: 600; letter-spacing: .1em; padding: 6px 14px; border-radius: 50px; margin-bottom: 28px; opacity: 0; animation: lp-fadeUp .6s .2s forwards; }
    .hero-headline { font-size: clamp(44px, 5.5vw, 82px); font-weight: 700; line-height: 1.03; letter-spacing: -.025em; }
    .hero-headline .line { display: block; overflow: hidden; }
    .hero-headline .line span { display: block; transform: translateY(110%); animation: lp-slideUp .7s cubic-bezier(.16,1,.3,1) forwards; }
    .hero-headline .line:nth-child(1) span { animation-delay: .35s; }
    .hero-headline .line:nth-child(2) span { animation-delay: .5s; }
    .hero-headline .line:nth-child(3) span { animation-delay: .65s; color: var(--y); }
    .hero-sub { margin-top: 28px; font-size: 17px; line-height: 1.7; color: #aaa; max-width: 460px; opacity: 0; animation: lp-fadeUp .7s .9s forwards; }
    .hero-actions { margin-top: 36px; display: flex; flex-direction: column; gap: 10px; opacity: 0; animation: lp-fadeUp .7s 1.1s forwards; }
    .lp-btn-primary { background: var(--y); color: #000; font-weight: 700; padding: 16px 34px; border-radius: 50px; font-size: 15px; text-decoration: none; letter-spacing: .03em; transition: transform .2s, box-shadow .2s; display: inline-flex; align-items: center; gap: 8px; width: fit-content; }
    .lp-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(254,244,0,.4); }
    .lp-cta-note { font-size: 12px; color: #555; padding-left: 4px; }

    /* PHONE */
    .hero-phone { position: relative; display: flex; justify-content: center; opacity: 0; animation: lp-fadeUp .9s .5s forwards; }
    .phone-wrap { position: relative; animation: lp-float 5s ease-in-out infinite; filter: drop-shadow(0 40px 80px rgba(0,0,0,.7)); }
    .phone-wrap:hover { animation-play-state: paused; }
    .phone-shell { width: 270px; background: #262220; border-radius: 44px; border: 1px solid rgba(255,255,255,.12); overflow: hidden; box-shadow: inset 0 0 0 2px rgba(0,0,0,.8), 0 0 0 8px #1E1A17; }
    .phone-glow { position: absolute; width: 300px; height: 300px; background: var(--y); border-radius: 50%; filter: blur(100px); opacity: .12; top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none; }

    /* App UI inside phone */
    .app-nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 14px 10px; border-bottom: 1px solid rgba(255,255,255,.06); }
    .app-logo-row { display: flex; align-items: center; gap: 8px; }
    .app-logo-box { width: 26px; height: 26px; background: var(--y); border-radius: 7px; font-size: 13px; display: flex; align-items: center; justify-content: center; }
    .app-name { font-size: 11px; font-weight: 700; }
    .app-name span { color: var(--y); }
    .app-name sub { display: block; font-size: 8px; color: var(--muted); font-weight: 400; }
    .league-badge { background: rgba(255,255,255,.07); border-radius: 6px; font-size: 9px; padding: 4px 8px; color: #ccc; }
    .app-content { padding: 10px; }
    .live-card { background: #2a2520; border-radius: 10px; padding: 10px; margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .live-label { display: flex; align-items: center; gap: 5px; font-size: 8px; font-weight: 700; color: #0cce6b; letter-spacing: .08em; margin-bottom: 4px; }
    .live-dot { width: 5px; height: 5px; background: #0cce6b; border-radius: 50%; animation: lp-pulse 1.5s infinite; }
    .live-title { font-size: 10px; font-weight: 700; }
    .live-sub { font-size: 8px; color: var(--muted); margin-top: 1px; line-height: 1.3; }
    .stat-row { display: flex; justify-content: space-between; align-items: center; font-size: 8px; padding: 2px 0; border-bottom: 1px solid rgba(255,255,255,.05); }
    .stat-row:last-child { border-bottom: none; }
    .val-g { color: #0cce6b; font-weight: 800; font-size: 11px; }
    .val-y { color: var(--y); font-weight: 800; font-size: 11px; }
    .val-w { font-weight: 800; font-size: 11px; }
    .matches-label { font-size: 8px; color: var(--muted); letter-spacing: .08em; font-weight: 600; padding: 6px 0 4px; display: flex; justify-content: space-between; }
    .match-row { background: #2a2520; border-radius: 8px; padding: 8px 10px; display: flex; align-items: center; gap: 6px; margin-bottom: 5px; font-size: 9px; }
    .match-time { color: var(--muted); min-width: 26px; line-height: 1.3; font-size: 8px; }
    .match-teams { flex: 1; font-weight: 600; font-size: 9px; line-height: 1.4; }
    .match-score { background: rgba(254,244,0,.15); color: var(--y); font-weight: 700; font-size: 9px; padding: 3px 7px; border-radius: 5px; }
    .app-tabs { display: flex; justify-content: space-around; padding: 8px 0 10px; border-top: 1px solid rgba(255,255,255,.06); margin-top: 6px; }
    .tab { font-size: 7px; color: var(--muted); text-align: center; letter-spacing: .05em; }
    .tab.active { color: var(--y); }
    .tab-icon { font-size: 14px; display: block; margin-bottom: 2px; }

    /* MUNDIAL BANNER */
    .mundial-banner { background: linear-gradient(135deg, #1E1A17 0%, #2a2200 60%, #1E1A17 100%); border-top: 1px solid rgba(254,244,0,.12); border-bottom: 1px solid rgba(254,244,0,.12); padding: 80px 40px; position: relative; overflow: hidden; }
    .mundial-banner::before { content: '2026'; position: absolute; right: -20px; top: 50%; transform: translateY(-50%); font-size: 240px; font-weight: 900; color: rgba(254,244,0,.03); line-height: 1; pointer-events: none; letter-spacing: -.02em; }
    .mundial-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }
    .mundial-tag { display: inline-flex; align-items: center; gap: 8px; background: rgba(254,244,0,.1); border: 1px solid rgba(254,244,0,.25); color: var(--y); font-size: 11px; font-weight: 700; letter-spacing: .1em; padding: 5px 14px; border-radius: 50px; margin-bottom: 20px; }
    .mundial-title { font-size: clamp(26px, 3vw, 42px); font-weight: 700; letter-spacing: -.02em; line-height: 1.1; margin-bottom: 20px; }
    .mundial-body { color: #888; font-size: 15px; line-height: 1.75; }
    .mundial-body p + p { margin-top: 14px; }
    .mundial-btn { display: inline-flex; align-items: center; gap: 8px; background: var(--y); color: #000; font-weight: 700; padding: 14px 30px; border-radius: 50px; font-size: 14px; text-decoration: none; margin-top: 28px; transition: transform .2s, box-shadow .2s; }
    .mundial-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 28px rgba(254,244,0,.35); }
    .timeline { display: flex; flex-direction: column; gap: 0; }
    .tl-item { display: flex; gap: 20px; position: relative; padding-bottom: 32px; }
    .tl-item:last-child { padding-bottom: 0; }
    .tl-item:not(:last-child) .tl-line { position: absolute; left: 15px; top: 32px; bottom: 0; width: 1px; background: linear-gradient(to bottom, rgba(254,244,0,.3), rgba(254,244,0,.05)); }
    .tl-dot { width: 32px; height: 32px; border-radius: 50%; background: rgba(254,244,0,.1); border: 2px solid rgba(254,244,0,.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; position: relative; z-index: 1; }
    .tl-dot.active { background: rgba(254,244,0,.15); border-color: var(--y); }
    .tl-content { padding-top: 4px; }
    .tl-label { font-size: 11px; font-weight: 700; color: var(--y); letter-spacing: .08em; margin-bottom: 4px; }
    .tl-label.active { color: #0cce6b; }
    .tl-text { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
    .tl-desc { font-size: 13px; color: #666; line-height: 1.5; }

    /* SECTIONS */
    .section-wrap { max-width: 1200px; margin: 0 auto; padding: 100px 40px; }
    .section-label { font-size: 11px; font-weight: 700; letter-spacing: .15em; color: var(--y); margin-bottom: 14px; text-transform: uppercase; }
    .section-title { font-size: clamp(28px, 3.5vw, 50px); font-weight: 700; line-height: 1.1; letter-spacing: -.02em; max-width: 560px; }
    .section-title em { font-style: normal; color: var(--y); }
    .section-sub { color: var(--muted); font-size: 15px; margin-top: 10px; line-height: 1.65; }

    /* FEATURES */
    .features-grid { margin-top: 56px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .feat-card { background: var(--bg2); border: 1px solid rgba(255,255,255,.06); border-radius: var(--r); padding: 28px 24px; transition: transform .3s, border-color .3s, box-shadow .3s; }
    .feat-card:hover { transform: translateY(-5px); border-color: rgba(254,244,0,.2); box-shadow: 0 20px 40px rgba(0,0,0,.4); }
    .feat-icon { font-size: 26px; margin-bottom: 14px; display: block; }
    .feat-name { font-size: 15px; font-weight: 700; margin-bottom: 7px; }
    .feat-desc { font-size: 13px; color: var(--muted); line-height: 1.6; }
    .feat-badge { display: inline-block; background: rgba(254,244,0,.12); color: var(--y); font-size: 10px; font-weight: 700; padding: 2px 9px; border-radius: 50px; margin-top: 10px; letter-spacing: .05em; }

    /* HOW IT WORKS */
    .how-bg { background: var(--bg2); }
    .steps { margin-top: 56px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; position: relative; }
    .steps::before { content: ''; position: absolute; top: 36px; left: calc(100%/6); right: calc(100%/6); height: 1px; background: linear-gradient(to right, transparent, rgba(254,244,0,.25), rgba(254,244,0,.25), transparent); }
    .step { padding: 0 30px; text-align: center; }
    .step-num { width: 72px; height: 72px; background: var(--bg3); border: 1px solid rgba(254,244,0,.2); border-radius: 50%; font-size: 24px; font-weight: 700; color: var(--y); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; position: relative; z-index: 1; transition: background .3s, box-shadow .3s; }
    .step:hover .step-num { background: rgba(254,244,0,.1); box-shadow: 0 0 30px rgba(254,244,0,.2); }
    .step-title { font-size: 19px; font-weight: 700; margin-bottom: 10px; }
    .step-desc { font-size: 14px; color: var(--muted); line-height: 1.65; }

    /* PRICING */
    .pricing-grid { margin-top: 56px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .plan-card { background: var(--bg2); border: 1px solid rgba(255,255,255,.07); border-radius: 18px; padding: 32px 28px; display: flex; flex-direction: column; transition: transform .3s, box-shadow .3s; }
    .plan-card.featured { border-color: rgba(254,244,0,.35); background: linear-gradient(160deg, #2a2200 0%, #262220 100%); position: relative; }
    .plan-card.featured::before { content: 'Najpopularniejszy'; position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: var(--y); color: #000; font-size: 11px; font-weight: 800; padding: 4px 14px; border-radius: 50px; letter-spacing: .05em; white-space: nowrap; }
    .plan-card:hover { transform: translateY(-5px); box-shadow: 0 20px 50px rgba(0,0,0,.5); }
    .plan-name { font-size: 13px; font-weight: 700; letter-spacing: .1em; color: var(--muted); margin-bottom: 6px; }
    .plan-tagline { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 20px; }
    .plan-price { font-size: 42px; font-weight: 800; letter-spacing: -.03em; line-height: 1; }
    .plan-price span { font-size: 15px; color: var(--muted); font-weight: 500; }
    .plan-period { font-size: 12px; color: #555; margin-top: 4px; margin-bottom: 24px; }
    .plan-divider { height: 1px; background: rgba(255,255,255,.06); margin-bottom: 24px; }
    .plan-features { list-style: none; display: flex; flex-direction: column; gap: 10px; flex: 1; padding: 0; }
    .plan-features li { font-size: 13px; color: #aaa; display: flex; align-items: flex-start; gap: 9px; line-height: 1.5; }
    .plan-features li::before { content: '\u2713'; color: var(--y); font-weight: 700; flex-shrink: 0; margin-top: 1px; }
    .plan-desc { font-size: 12px; color: #555; margin-top: 16px; line-height: 1.6; }
    .plan-btn { margin-top: 28px; padding: 13px; border-radius: 50px; font-size: 14px; font-weight: 700; text-align: center; text-decoration: none; transition: transform .2s, box-shadow .2s; display: block; }
    .plan-btn.outline { border: 1px solid rgba(255,255,255,.12); color: var(--text); }
    .plan-btn.outline:hover { border-color: rgba(254,244,0,.3); color: var(--y); }
    .plan-btn.filled { background: var(--y); color: #000; }
    .plan-btn.filled:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(254,244,0,.35); }

    /* SCORING TABLE */
    .scoring-bg { background: var(--bg2); }
    .score-table-wrap { margin-top: 48px; overflow: hidden; border-radius: 16px; border: 1px solid rgba(255,255,255,.07); }
    .score-table { width: 100%; border-collapse: collapse; }
    .score-table th { background: #2a2520; font-size: 11px; font-weight: 700; letter-spacing: .1em; color: var(--muted); padding: 14px 20px; text-align: left; border-bottom: 1px solid rgba(255,255,255,.07); }
    .score-table td { padding: 16px 20px; font-size: 14px; border-bottom: 1px solid rgba(255,255,255,.05); }
    .score-table tr:last-child td { border-bottom: none; }
    .score-table tr:hover td { background: rgba(255,255,255,.02); }
    .pts-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 52px; padding: 5px 12px; border-radius: 8px; font-weight: 800; font-size: 15px; }
    .pts-3 { background: rgba(254,244,0,.15); color: var(--y); }
    .pts-2 { background: rgba(180,160,80,.12); color: #c8b450; }
    .pts-1 { background: rgba(150,150,150,.1); color: #aaa; }
    .pts-0 { background: rgba(100,100,100,.08); color: #555; }
    .score-note { margin-top: 16px; font-size: 13px; color: #555; line-height: 1.6; }
    .score-note strong { color: #888; }

    /* FAQ */
    .faq-list { margin-top: 48px; display: flex; flex-direction: column; gap: 0; }
    .faq-item { border-bottom: 1px solid rgba(255,255,255,.07); }
    .faq-q { width: 100%; background: none; border: none; color: var(--text); font-family: inherit; font-size: 15px; font-weight: 600; padding: 20px 0; display: flex; justify-content: space-between; align-items: center; cursor: pointer; text-align: left; gap: 20px; transition: color .2s; }
    .faq-q:hover { color: var(--y); }
    .faq-arrow { width: 22px; height: 22px; border-radius: 50%; border: 1px solid rgba(255,255,255,.12); display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; transition: transform .3s, background .3s, border-color .3s; }
    .faq-item.open .faq-arrow { transform: rotate(180deg); background: rgba(254,244,0,.1); border-color: rgba(254,244,0,.25); color: var(--y); }
    .faq-a { max-height: 0; overflow: hidden; transition: max-height .4s cubic-bezier(.16,1,.3,1), padding .3s; }
    .faq-item.open .faq-a { max-height: 200px; padding-bottom: 20px; }
    .faq-a p { font-size: 14px; color: var(--muted); line-height: 1.7; }

    /* CTA FOOTER */
    .cta-section { padding: 120px 40px; text-align: center; position: relative; overflow: hidden; }
    .cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 800px 500px at 50% 50%, rgba(254,244,0,.06), transparent); pointer-events: none; }
    .cta-title { font-size: clamp(34px, 5vw, 68px); font-weight: 700; letter-spacing: -.03em; line-height: 1.05; max-width: 680px; margin: 0 auto 20px; }
    .cta-title em { font-style: normal; color: var(--y); }
    .cta-sub { color: var(--muted); font-size: 16px; max-width: 440px; margin: 0 auto 44px; line-height: 1.65; }
    .cta-actions { display: flex; flex-direction: column; align-items: center; gap: 10px; }
    .cta-note { font-size: 12px; color: #444; letter-spacing: .04em; }

    /* FOOTER */
    .lp-footer { border-top: 1px solid rgba(255,255,255,.06); padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; font-size: 13px; color: var(--muted); }

    /* SCREENS CAROUSEL */
    .screens-section { overflow: hidden; padding: 80px 0; }
    .screens-head { max-width: 1200px; margin: 0 auto; padding: 0 40px; margin-bottom: 50px; }
    .screens-track { display: flex; gap: 16px; width: max-content; animation: lp-scrollTrack 28s linear infinite; }
    .screens-track:hover { animation-play-state: paused; }
    .screen-card { width: 190px; flex-shrink: 0; background: #2a2520; border: 1px solid rgba(255,255,255,.07); border-radius: 22px; overflow: hidden; box-shadow: 0 16px 40px rgba(0,0,0,.5); transition: transform .4s, box-shadow .4s, border-color .4s; }
    .screen-card:hover { transform: scale(1.04) translateY(-6px); box-shadow: 0 30px 60px rgba(0,0,0,.7); border-color: rgba(254,244,0,.2); }

    /* ANIMATIONS */
    @keyframes lp-fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes lp-slideUp { from { transform:translateY(110%); } to { transform:translateY(0); } }
    @keyframes lp-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }
    @keyframes lp-scrollTrack { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes lp-float { 0%,100%{transform:perspective(1000px) rotateY(-8deg) rotateX(2deg) translateY(0)} 50%{transform:perspective(1000px) rotateY(-8deg) rotateX(2deg) translateY(-14px)} }

    .reveal { opacity:0; transform:translateY(28px); transition:opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1); }
    .reveal.visible { opacity:1; transform:translateY(0); }
    .d1{transition-delay:.1s} .d2{transition-delay:.2s} .d3{transition-delay:.3s} .d4{transition-delay:.4s} .d5{transition-delay:.5s} .d6{transition-delay:.6s}

    @media(max-width:900px){
      .lp-nav{padding:16px 20px;}
      .hero-inner{grid-template-columns:1fr;}
      .hero-phone{display:none;}
      .features-grid{grid-template-columns:1fr 1fr;}
      .steps{grid-template-columns:1fr;gap:36px;}
      .steps::before{display:none;}
      .pricing-grid{grid-template-columns:1fr;}
      .mundial-inner{grid-template-columns:1fr;}
      .section-wrap,.mundial-banner{padding:70px 20px;}
      .cta-section{padding:80px 20px;}
    }
    @media(max-width:600px){
      .features-grid{grid-template-columns:1fr;}
      .lp-footer{flex-direction:column;gap:12px;text-align:center;}
    }
  `],
  template: `
<!-- NAV -->
<nav class="lp-nav" [class.scrolled]="navScrolled()">
  <a class="logo" routerLink="/landing">
    <div class="logo-icon">\u26BD</div>
    <div class="logo-text">Typ<span>Liga</span></div>
  </a>
  <div style="display:flex;align-items:center;gap:16px;">
    <a routerLink="/login" class="nav-login">Zaloguj si\u0119</a>
    <a routerLink="/register" class="nav-cta">Do\u0142\u0105cz do rozgrzewki</a>
  </div>
</nav>

<!-- HERO -->
<div style="position:relative;overflow:hidden;">
  <div class="hero-bg"><div class="hb1"></div><div class="hb2"></div></div>
  <div class="hero" style="padding-left:0;padding-right:0;">
    <div class="hero-inner" style="padding:0 40px;">
      <div>
        <div class="hero-tag">\u26BD Rozgrzewka przed Mundialem 2026</div>
        <h1 class="hero-headline">
          <span class="line"><span>Typuj.</span></span>
          <span class="line"><span>Rywalizuj.</span></span>
          <span class="line"><span>Wygraj.</span></span>
        </h1>
        <p class="hero-sub">TypLiga to aplikacja do typowania wynik\u00F3w mecz\u00F3w pi\u0142karskich. Zak\u0142adaj w\u0142asne typligi, zapraszaj znajomych i sprawd\u017A, kto najlepiej czyta gr\u0119.</p>
        <div class="hero-actions">
          <a routerLink="/register" class="lp-btn-primary">Do\u0142\u0105cz do rozgrzewki przed Mundialem \u2192</a>
          <span class="lp-cta-note">Startujemy ju\u017C teraz \u2014 pe\u0142na wersja rusza na Mistrzostwa \u015Awiata 2026.</span>
        </div>
      </div>
      <div class="hero-phone">
        <div class="phone-glow"></div>
        <div class="phone-wrap">
          <div class="phone-shell">
            <div>
              <div class="app-nav">
                <div class="app-logo-row">
                  <div class="app-logo-box">\u26BD</div>
                  <div class="app-name">Typ<span>Liga</span></div>
                </div>
                <div class="league-badge">Liga Firmowa \u25BE</div>
              </div>
              <div class="app-content">
                <div class="live-card">
                  <div>
                    <div class="live-label"><span class="live-dot"></span> NA \u017BYWO</div>
                    <div class="live-title">Typuj Teraz</div>
                    <div class="live-sub">Liga Firmowa<br>Liga Mistrz\u00F3w 2025/26</div>
                  </div>
                  <div>
                    <div style="font-size:8px;color:#555;margin-bottom:4px;font-weight:700;letter-spacing:.06em;">STATYSTYKI</div>
                    <div class="stat-row"><span>Punkty</span><span class="val-w">23</span></div>
                    <div class="stat-row"><span>Dok\u0142adne</span><span class="val-g">3</span></div>
                    <div class="stat-row"><span>Trafione</span><span class="val-y">9</span></div>
                  </div>
                </div>
                <div class="matches-label"><span>NADCHODZ\u0104CE MECZE</span><span style="color:#444;">P\u00F3\u0142fina\u0142y</span></div>
                <div class="match-row">
                  <div class="match-time">21:00<br><span style="color:#444;">28.04</span></div>
                  <div style="width:1px;height:26px;background:rgba(255,255,255,.08);"></div>
                  <div class="match-teams">PSG<br>Bayern Monachium</div>
                  <div class="match-score">3:1</div>
                </div>
                <div class="match-row">
                  <div class="match-time">21:00<br><span style="color:#444;">29.04</span></div>
                  <div style="width:1px;height:26px;background:rgba(255,255,255,.08);"></div>
                  <div class="match-teams">Atletico Madryt<br>Arsenal</div>
                  <div class="match-score">1:2</div>
                </div>
              </div>
              <div class="app-tabs">
                <div class="tab active"><span class="tab-icon">\uD83C\uDFE0</span>START</div>
                <div class="tab"><span class="tab-icon">\u26BD</span>TYPUJ</div>
                <div class="tab"><span class="tab-icon">\uD83C\uDFC6</span>RANKING</div>
                <div class="tab"><span class="tab-icon">\uD83D\uDCCB</span>HISTORIA</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- MUNDIAL BANNER -->
<div class="mundial-banner">
  <div class="mundial-inner">
    <div>
      <div class="mundial-tag reveal">\uD83C\uDF0D Mundial 2026</div>
      <h2 class="mundial-title reveal d1">Rozgrzewka przed Mundialem ju\u017C trwa</h2>
      <div class="mundial-body reveal d2">
        <p>Nie czekaj do pierwszego gwizdka. Ju\u017C teraz mo\u017Cesz typowa\u0107 mecze ligowe i towarzyskie, zak\u0142ada\u0107 typligi ze znajomymi i sprawdzi\u0107 swoj\u0105 form\u0119 przed najwi\u0119ksz\u0105 imprez\u0105 pi\u0142karsk\u0105 na \u015Bwiecie.</p>
        <p>Kiedy w czerwcu 2026 wystartuj\u0105 Mistrzostwa \u015Awiata w USA, Meksyku i Kanadzie \u2014 TypLiga b\u0119dzie gotowa. Z pe\u0142n\u0105 obs\u0142ug\u0105 fazy grupowej, pucharowej i fina\u0142u.</p>
      </div>
      <a routerLink="/register" class="mundial-btn reveal d3">Zacznij rozgrzewk\u0119 za darmo \u2192</a>
    </div>
    <div class="timeline reveal d2">
      <div class="tl-item">
        <div class="tl-line"></div>
        <div class="tl-dot active">\u25B6</div>
        <div class="tl-content">
          <div class="tl-label active">TERAZ \u2014 Rozgrzewka</div>
          <div class="tl-text">Typuj mecze ligowe</div>
          <div class="tl-desc">Zak\u0142adaj typligi, zapraszaj znajomych, testuj swoje umiej\u0119tno\u015Bci na bie\u017C\u0105cych rozgrywkach.</div>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-line"></div>
        <div class="tl-dot">\uD83C\uDF0D</div>
        <div class="tl-content">
          <div class="tl-label">Czerwiec 2026 \u2014 Start Mundialu</div>
          <div class="tl-text">Pe\u0142na obs\u0142uga M\u015A 2026</div>
          <div class="tl-desc">Faza grupowa, 1/8 fina\u0142u, \u0107wier\u0107fina\u0142y, p\u00F3\u0142fina\u0142y i wielki fina\u0142.</div>
        </div>
      </div>
      <div class="tl-item">
        <div class="tl-dot">\uD83C\uDFC6</div>
        <div class="tl-content">
          <div class="tl-label">Lipiec 2026 \u2014 Fina\u0142</div>
          <div class="tl-text">Kto zostanie mistrzem?</div>
          <div class="tl-desc">Kto w Twojej typlidze zgarnie tytu\u0142 najlepszego gracza Mundialu?</div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- HOW IT WORKS -->
<div class="how-bg">
  <div class="section-wrap">
    <div class="section-label reveal">Jak to dzia\u0142a</div>
    <div class="section-title reveal d1">Trzy kroki do <em>rywalizacji</em></div>
    <div class="steps">
      <div class="step reveal d1">
        <div class="step-num">1</div>
        <div class="step-title">Stw\u00F3rz typlig\u0119</div>
        <div class="step-desc">Wymy\u015Bl nazw\u0119, wybierz rozgrywki i zapro\u015B znajomych unikalnym kodem. Wystarczy kilka sekund.</div>
      </div>
      <div class="step reveal d2">
        <div class="step-num">2</div>
        <div class="step-title">Typuj wyniki</div>
        <div class="step-desc">Przed ka\u017Cd\u0105 kolejk\u0105 wpisz swoje przewidywania. Masz czas do 15 minut przed pierwszym gwizdkiem.</div>
      </div>
      <div class="step reveal d3">
        <div class="step-num">3</div>
        <div class="step-title">Sprawd\u017A ranking</div>
        <div class="step-desc">Po ka\u017Cdej kolejce system automatycznie nalicza punkty. \u015Aled\u017A, kto prowadzi w Twojej typlidze.</div>
      </div>
    </div>
  </div>
</div>

<!-- FEATURES -->
<div class="section-wrap">
  <div class="section-label reveal">Funkcje aplikacji</div>
  <div class="section-title reveal d1">Wszystko, czego potrzebuje <em>prawdziwy gracz</em></div>
  <div class="features-grid">
    <div class="feat-card reveal d1">
      <span class="feat-icon">\uD83C\uDFDF\uFE0F</span>
      <div class="feat-name">W\u0142asne typligi</div>
      <div class="feat-desc">Zak\u0142adaj w\u0142asne typligi i zapraszaj znajomych kodem. Ty ustalasz zasady, Ty zarz\u0105dzasz rozgrywk\u0105.</div>
    </div>
    <div class="feat-card reveal d2">
      <span class="feat-icon">\uD83C\uDF0D</span>
      <div class="feat-name">Wiele rozgrywek</div>
      <div class="feat-desc">TypLiga mo\u017Ce obejmowa\u0107 jedn\u0105 lub kilka rozgrywek jednocze\u015Bnie \u2014 od Ekstraklasy po Lig\u0119 Mistrz\u00F3w i M\u015A.</div>
    </div>
    <div class="feat-card reveal d3">
      <span class="feat-icon">\uD83C\uDFAF</span>
      <div class="feat-name">Inteligentny scoring</div>
      <div class="feat-desc">Dok\u0142adny wynik, trafiona r\u00F3\u017Cnica bramek, prawid\u0142owy zwyci\u0119zca \u2014 ka\u017Cdy poziom trafienia to inne punkty.</div>
    </div>
    <div class="feat-card reveal d1">
      <span class="feat-icon">\uD83D\uDCCA</span>
      <div class="feat-name">Ranking na \u017Cywo</div>
      <div class="feat-desc">Po ka\u017Cdej kolejce ranking w typlidze aktualizuje si\u0119 automatycznie. Sprawdzaj swoj\u0105 pozycj\u0119 i \u015Bled\u017A rywali.</div>
    </div>
    <div class="feat-card reveal d2">
      <span class="feat-icon">\uD83D\uDCCB</span>
      <div class="feat-name">Historia typ\u00F3w</div>
      <div class="feat-desc">Pe\u0142ny przegl\u0105d poprzednich kolejek \u2014 Twoje typy, rzeczywiste wyniki i zdobyte punkty w jednym miejscu.</div>
    </div>
    <div class="feat-card reveal d3">
      <span class="feat-icon">\u2699\uFE0F</span>
      <div class="feat-name">Custom scoring</div>
      <div class="feat-desc">Sam definiujesz zasady punktacji swojej typligi. Chcesz 5 pkt za dok\u0142adny wynik? \u017Baden problem.</div>
      <span class="feat-badge">Plan Gold</span>
    </div>
  </div>
</div>

<!-- SCORING TABLE -->
<div class="scoring-bg">
  <div class="section-wrap">
    <div class="section-label reveal">Punktacja</div>
    <div class="section-title reveal d1">Przejrzysta <em>punktacja</em></div>
    <p class="section-sub reveal d2">\u017Badnych ukrytych zasad. Wiesz dok\u0142adnie, za co dostajesz punkty.</p>
    <div class="score-table-wrap reveal d2">
      <table class="score-table">
        <thead>
          <tr>
            <th>Trafienie</th>
            <th>Punkty</th>
            <th>Przyk\u0142ad</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Dok\u0142adny wynik</strong></td>
            <td><span class="pts-badge pts-3">3 pkt</span></td>
            <td style="color:#888;font-size:13px;">Typujesz 2:1 \u2014 pada 2:1</td>
          </tr>
          <tr>
            <td><strong>R\u00F3\u017Cnica bramek</strong></td>
            <td><span class="pts-badge pts-2">2 pkt</span></td>
            <td style="color:#888;font-size:13px;">Typujesz 3:1 \u2014 pada 2:0</td>
          </tr>
          <tr>
            <td><strong>Zwyci\u0119zca / remis</strong></td>
            <td><span class="pts-badge pts-1">1 pkt</span></td>
            <td style="color:#888;font-size:13px;">Typujesz 3:0 \u2014 pada 1:0</td>
          </tr>
          <tr>
            <td><strong>Pud\u0142o</strong></td>
            <td><span class="pts-badge pts-0">0 pkt</span></td>
            <td style="color:#888;font-size:13px;">Typujesz 2:0 \u2014 pada 0:1</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="score-note reveal d3">W planie <strong>Gold</strong> mo\u017Cesz zmieni\u0107 warto\u015Bci punktowe i dopasowa\u0107 regu\u0142y do swojej typligi.</p>
  </div>
</div>

<!-- PRICING -->
<div class="section-wrap">
  <div class="section-label reveal">Plany</div>
  <div class="section-title reveal d1">Wybierz sw\u00F3j <em>plan</em></div>
  <p class="section-sub reveal d2">Zacznij za darmo. Ulepsz, kiedy poczujesz, \u017Ce chcesz wi\u0119cej.</p>
  <div class="pricing-grid">
    <div class="plan-card reveal d1">
      <div class="plan-name">LIGHT</div>
      <div class="plan-tagline">Na start</div>
      <div class="plan-price">0 <span>z\u0142</span></div>
      <div class="plan-period">/ miesi\u0105c \u00B7 na zawsze</div>
      <div class="plan-divider"></div>
      <ul class="plan-features">
        <li>Stworzenie 1 typligi</li>
        <li>Do\u0142\u0105czenie do 3 typlig</li>
        <li>Typowanie bez ogranicze\u0144</li>
        <li>Ranking: top 3 + Twoja pozycja</li>
      </ul>
      <p class="plan-desc">Idealny na start \u2014 za\u0142\u00F3\u017C typlig\u0119 ze znajomymi i sprawd\u017A, jak dzia\u0142a typowanie.</p>
      <a routerLink="/register" class="plan-btn outline">Zacznij za darmo</a>
    </div>
    <div class="plan-card featured reveal d2">
      <div class="plan-name">STANDARD</div>
      <div class="plan-tagline">Dla aktywnych graczy</div>
      <div class="plan-price">20 <span>z\u0142</span></div>
      <div class="plan-period">/ miesi\u0105c</div>
      <div class="plan-divider"></div>
      <ul class="plan-features">
        <li>Tworzenie do 3 typlig</li>
        <li>Do\u0142\u0105czanie do typlig bez limitu</li>
        <li>Typowanie bez ogranicze\u0144</li>
        <li>Pe\u0142ny ranking i statystyki</li>
      </ul>
      <p class="plan-desc">Widzisz pe\u0142ny ranking, \u015Bledzisz statystyki wszystkich graczy i tworzysz wi\u0119cej typlig.</p>
      <a routerLink="/register" class="plan-btn filled">Wybierz Standard</a>
    </div>
    <div class="plan-card reveal d3">
      <div class="plan-name">GOLD</div>
      <div class="plan-tagline">Pe\u0142na kontrola</div>
      <div class="plan-price">25 <span>z\u0142</span></div>
      <div class="plan-period">/ miesi\u0105c</div>
      <div class="plan-divider"></div>
      <ul class="plan-features">
        <li>Tworzenie typlig bez limitu</li>
        <li>Do\u0142\u0105czanie do typlig bez limitu</li>
        <li>Typowanie bez ogranicze\u0144</li>
        <li>Pe\u0142ny ranking i statystyki</li>
        <li>Custom scoring \u2014 w\u0142asne zasady punktacji</li>
      </ul>
      <p class="plan-desc">Definiujesz regu\u0142y gry. Twoje ligi, Twoje zasady.</p>
      <a routerLink="/register" class="plan-btn outline">Wybierz Gold</a>
    </div>
  </div>
</div>

<!-- APP SCREENSHOTS -->
<div class="screens-section">
  <div class="screens-head">
    <div class="section-label reveal">Aplikacja</div>
    <div class="section-title reveal d1">Zaprojektowana dla <em>pasjonat\u00F3w</em> futbolu</div>
  </div>
  <div style="overflow:hidden;padding:8px 0;">
    <div class="screens-track" id="screensTrack">
      <div class="screen-card"><div style="background:#262220;padding:10px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,.06);">
          <div style="width:22px;height:22px;background:#FEF400;border-radius:6px;font-size:11px;display:flex;align-items:center;justify-content:center;">\u26BD</div>
          <span style="font-size:9px;font-weight:700;"><span style="color:#FEF400;">Typ</span>Liga</span>
          <div style="margin-left:auto;background:rgba(255,255,255,.07);border-radius:5px;font-size:7px;padding:3px 7px;color:#aaa;">Liga Firmowa \u25BE</div>
        </div>
        <div style="background:#2a2520;border-radius:8px;padding:8px;margin-bottom:7px;display:grid;grid-template-columns:1fr 1fr;gap:7px;">
          <div><div style="display:flex;align-items:center;gap:3px;font-size:7px;font-weight:700;color:#0cce6b;margin-bottom:3px;"><div style="width:4px;height:4px;background:#0cce6b;border-radius:50%;"></div>NA \u017BYWO</div><div style="font-size:9px;font-weight:700;">Typuj Teraz</div><div style="font-size:7px;color:#555;margin-top:2px;line-height:1.3;">Liga Firmowa<br>Liga Mistrz\u00F3w</div></div>
          <div><div style="font-size:7px;color:#444;font-weight:700;letter-spacing:.06em;margin-bottom:3px;">STATYSTYKI</div><div style="display:flex;justify-content:space-between;font-size:7px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,.05);"><span>Punkty</span><span style="font-weight:800;">23</span></div><div style="display:flex;justify-content:space-between;font-size:7px;padding:1px 0;border-bottom:1px solid rgba(255,255,255,.05);"><span>Dok\u0142adne</span><span style="font-weight:800;color:#0cce6b;">3</span></div><div style="display:flex;justify-content:space-between;font-size:7px;padding:1px 0;"><span>Trafione</span><span style="font-weight:800;color:#FEF400;">9</span></div></div>
        </div>
        <div style="font-size:7px;color:#555;font-weight:700;letter-spacing:.07em;margin-bottom:5px;display:flex;justify-content:space-between;"><span>NADCHODZ\u0104CE MECZE</span></div>
        <div style="background:#2a2520;border-radius:7px;padding:7px 8px;display:flex;align-items:center;gap:5px;margin-bottom:4px;"><div style="font-size:7px;color:#555;min-width:22px;line-height:1.3;">21:00<br>28.04</div><div style="width:1px;height:22px;background:rgba(255,255,255,.08);"></div><div style="flex:1;font-size:8px;font-weight:600;line-height:1.4;">PSG<br>Bayern Monachium</div><div style="background:rgba(254,244,0,.15);color:#FEF400;font-weight:800;font-size:8px;padding:2px 5px;border-radius:4px;">3:1</div></div>
        <div style="background:#2a2520;border-radius:7px;padding:7px 8px;display:flex;align-items:center;gap:5px;"><div style="font-size:7px;color:#555;min-width:22px;line-height:1.3;">21:00<br>29.04</div><div style="width:1px;height:22px;background:rgba(255,255,255,.08);"></div><div style="flex:1;font-size:8px;font-weight:600;line-height:1.4;">Atletico Madryt<br>Arsenal</div><div style="background:rgba(254,244,0,.15);color:#FEF400;font-weight:800;font-size:8px;padding:2px 5px;border-radius:4px;">1:2</div></div>
        <div style="display:flex;justify-content:space-around;padding:7px 0 2px;border-top:1px solid rgba(255,255,255,.05);margin-top:7px;"><div style="font-size:6px;text-align:center;color:#FEF400;">\uD83C\uDFE0<br>START</div><div style="font-size:6px;text-align:center;color:#555;">\u26BD<br>TYPUJ</div><div style="font-size:6px;text-align:center;color:#555;">\uD83C\uDFC6<br>RANKING</div><div style="font-size:6px;text-align:center;color:#555;">\uD83D\uDCCB<br>HISTORIA</div></div>
      </div></div>
      <div class="screen-card"><div style="background:#262220;padding:10px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;"><div style="width:22px;height:22px;background:#FEF400;border-radius:6px;font-size:11px;display:flex;align-items:center;justify-content:center;">\u26BD</div><span style="font-size:9px;font-weight:700;"><span style="color:#FEF400;">Typ</span>Liga</span></div>
        <div style="font-size:13px;font-weight:700;margin-bottom:2px;">P\u00F3\u0142fina\u0142y - 1. mecz</div>
        <div style="font-size:8px;color:#555;margin-bottom:12px;">Liga Mistrz\u00F3w 2025/26 - Faza pucharowa</div>
        <div style="background:#2a2520;border-radius:9px;padding:10px;margin-bottom:7px;">
          <div style="display:flex;align-items:center;gap:4px;font-size:8px;color:#aaa;margin-bottom:7px;">\u23F1 TYPUJ DO 24.04 20:45</div>
          <div style="text-align:center;font-size:9px;font-weight:700;margin-bottom:8px;">PSG \u2014 Bayern Monachium</div>
          <div style="font-size:7px;color:#555;text-align:center;letter-spacing:.06em;margin-bottom:5px;">TW\u00D3J TYP</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;"><div style="width:34px;height:34px;background:#352f29;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;border:1px solid rgba(255,255,255,.1);">3</div><span style="color:#555;font-size:14px;">:</span><div style="width:34px;height:34px;background:#352f29;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;border:1px solid rgba(255,255,255,.1);">1</div></div>
        </div>
        <div style="background:#2a2520;border-radius:9px;padding:10px;margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:4px;font-size:8px;color:#aaa;margin-bottom:7px;">\u23F1 TYPUJ DO 06.05 20:45</div>
          <div style="text-align:center;font-size:9px;font-weight:700;margin-bottom:8px;">Bayern Monachium \u2014 PSG</div>
          <div style="font-size:7px;color:#555;text-align:center;letter-spacing:.06em;margin-bottom:5px;">TW\u00D3J TYP</div>
          <div style="display:flex;align-items:center;justify-content:center;gap:8px;"><div style="width:34px;height:34px;background:#352f29;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;border:1px solid rgba(255,255,255,.1);">1</div><span style="color:#555;font-size:14px;">:</span><div style="width:34px;height:34px;background:#352f29;border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;border:1px solid rgba(255,255,255,.1);">2</div></div>
        </div>
        <div style="background:#FEF400;border-radius:9px;padding:10px;text-align:center;font-size:11px;font-weight:800;color:#000;">\uD83D\uDCBE ZAPISZ TYPY</div>
        <div style="display:flex;justify-content:space-around;padding:7px 0 2px;border-top:1px solid rgba(255,255,255,.05);margin-top:7px;"><div style="font-size:6px;text-align:center;color:#555;">\uD83C\uDFE0<br>START</div><div style="font-size:6px;text-align:center;color:#FEF400;">\u26BD<br>TYPUJ</div><div style="font-size:6px;text-align:center;color:#555;">\uD83C\uDFC6<br>RANKING</div><div style="font-size:6px;text-align:center;color:#555;">\uD83D\uDCCB<br>HISTORIA</div></div>
      </div></div>
      <div class="screen-card"><div style="background:#262220;padding:10px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;"><div style="width:22px;height:22px;background:#FEF400;border-radius:6px;font-size:11px;display:flex;align-items:center;justify-content:center;">\u26BD</div><span style="font-size:9px;font-weight:700;"><span style="color:#FEF400;">Typ</span>Liga</span></div>
        <div style="font-size:13px;font-weight:700;margin-bottom:2px;">Historia</div>
        <div style="font-size:8px;color:#555;margin-bottom:12px;">Rozegrane kolejki</div>
        <div style="margin-bottom:8px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;"><span style="font-size:10px;font-weight:700;">KOLEJKA 2</span><span style="background:rgba(254,244,0,.15);color:#FEF400;font-size:8px;font-weight:700;padding:2px 7px;border-radius:4px;">+0 pkt</span></div><div style="background:#2a2520;border-radius:7px;overflow:hidden;"><div style="padding:7px 9px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between;"><span style="font-size:8px;font-weight:700;">Liverpool</span><div style="text-align:center;"><div style="font-size:6px;color:#555;margin-bottom:1px;">Typ: Brak</div><div style="font-size:10px;font-weight:800;">1:2</div></div><span style="font-size:8px;font-weight:700;">PSG</span></div><div style="padding:7px 9px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;align-items:center;justify-content:space-between;"><span style="font-size:8px;font-weight:700;">Atletico Ma...</span><div style="text-align:center;"><div style="font-size:6px;color:#555;margin-bottom:1px;">Typ: Brak</div><div style="font-size:10px;font-weight:800;">1:2</div></div><span style="font-size:8px;font-weight:700;">FC Barcelona</span></div><div style="padding:7px 9px;display:flex;align-items:center;justify-content:space-between;"><span style="font-size:8px;font-weight:700;">Bayern Mon...</span><div style="text-align:center;"><div style="font-size:6px;color:#555;margin-bottom:1px;">Typ: Brak</div><div style="font-size:10px;font-weight:800;">4:3</div></div><span style="font-size:8px;font-weight:700;">Real Madryt</span></div></div></div>
        <div style="display:flex;justify-content:space-around;padding:7px 0 2px;border-top:1px solid rgba(255,255,255,.05);margin-top:7px;"><div style="font-size:6px;text-align:center;color:#555;">\uD83C\uDFE0<br>START</div><div style="font-size:6px;text-align:center;color:#555;">\u26BD<br>TYPUJ</div><div style="font-size:6px;text-align:center;color:#555;">\uD83C\uDFC6<br>RANKING</div><div style="font-size:6px;text-align:center;color:#FEF400;">\uD83D\uDCCB<br>HISTORIA</div></div>
      </div></div>
      <div class="screen-card"><div style="background:#262220;padding:10px;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:12px;"><div style="width:22px;height:22px;background:#FEF400;border-radius:6px;font-size:11px;display:flex;align-items:center;justify-content:center;">\u26BD</div><span style="font-size:9px;font-weight:700;"><span style="color:#FEF400;">Typ</span>Liga</span></div>
        <div style="font-size:13px;font-weight:700;margin-bottom:12px;">Ranking \u00B7 Liga Firmowa</div>
        <div style="background:rgba(254,244,0,.07);border:1px solid rgba(254,244,0,.15);border-radius:9px;padding:9px;margin-bottom:5px;display:flex;align-items:center;gap:7px;"><span style="color:#FEF400;font-weight:800;font-size:12px;">1</span><span style="font-size:14px;">\uD83C\uDFC6</span><span style="flex:1;font-size:10px;font-weight:700;">Marek K.</span><span style="color:#FEF400;font-weight:800;font-size:13px;">47</span></div>
        <div style="background:#2a2520;border-radius:9px;padding:9px;margin-bottom:5px;display:flex;align-items:center;gap:7px;"><span style="color:#aaa;font-size:10px;">2</span><span style="font-size:14px;">\uD83D\uDE0E</span><span style="flex:1;font-size:10px;font-weight:600;">Ania W.</span><span style="font-weight:800;font-size:12px;">41</span></div>
        <div style="background:#2a2520;border-radius:9px;padding:9px;margin-bottom:5px;display:flex;align-items:center;gap:7px;"><span style="color:#aaa;font-size:10px;">3</span><span style="font-size:14px;">\uD83E\uDD8A</span><span style="flex:1;font-size:10px;font-weight:600;">Piotr M.</span><span style="font-weight:800;font-size:12px;">38</span></div>
        <div style="background:#2a2520;border-radius:9px;padding:9px;margin-bottom:5px;display:flex;align-items:center;gap:7px;"><span style="color:#aaa;font-size:10px;">4</span><span style="font-size:14px;">\u26A1</span><span style="flex:1;font-size:10px;font-weight:600;">Kasia L.</span><span style="font-weight:800;font-size:12px;">33</span></div>
        <div style="background:#2a2520;border-radius:9px;padding:9px;display:flex;align-items:center;gap:7px;"><span style="color:#aaa;font-size:10px;">5</span><span style="font-size:14px;">\uD83C\uDFAF</span><span style="flex:1;font-size:10px;font-weight:600;">Tomek R.</span><span style="font-weight:800;font-size:12px;">29</span></div>
        <div style="display:flex;justify-content:space-around;padding:7px 0 2px;border-top:1px solid rgba(255,255,255,.05);margin-top:7px;"><div style="font-size:6px;text-align:center;color:#555;">\uD83C\uDFE0<br>START</div><div style="font-size:6px;text-align:center;color:#555;">\u26BD<br>TYPUJ</div><div style="font-size:6px;text-align:center;color:#FEF400;">\uD83C\uDFC6<br>RANKING</div><div style="font-size:6px;text-align:center;color:#555;">\uD83D\uDCCB<br>HISTORIA</div></div>
      </div></div>
    </div>
  </div>
</div>

<!-- FAQ -->
<div class="section-wrap">
  <div class="section-label reveal">FAQ</div>
  <div class="section-title reveal d1">Najcz\u0119\u015Bciej zadawane <em>pytania</em></div>
  <div class="faq-list">
    <div class="faq-item reveal" [class.open]="openFaq() === 0">
      <button class="faq-q" (click)="toggleFaq(0)">Czy aplikacja jest darmowa? <span class="faq-arrow">\u2193</span></button>
      <div class="faq-a"><p>Tak. Plan Light jest ca\u0142kowicie darmowy i pozwala stworzy\u0107 jedn\u0105 lig\u0119, do\u0142\u0105czy\u0107 do trzech oraz typowa\u0107 mecze bez ogranicze\u0144.</p></div>
    </div>
    <div class="faq-item reveal d1" [class.open]="openFaq() === 1">
      <button class="faq-q" (click)="toggleFaq(1)">Kiedy rusza pe\u0142na wersja? <span class="faq-arrow">\u2193</span></button>
      <div class="faq-a"><p>Rozgrzewka trwa ju\u017C teraz. Pe\u0142na obs\u0142uga Mistrzostw \u015Awiata 2026 ruszy wraz ze startem turnieju w czerwcu 2026.</p></div>
    </div>
    <div class="faq-item reveal d2" [class.open]="openFaq() === 2">
      <button class="faq-q" (click)="toggleFaq(2)">Jak zaprosi\u0107 znajomych do typligi? <span class="faq-arrow">\u2193</span></button>
      <div class="faq-a"><p>Po stworzeniu typligi otrzymujesz unikalny kod zaproszeniowy. Wystarczy go wys\u0142a\u0107 znajomym \u2014 wpisuj\u0105 kod w aplikacji i do\u0142\u0105czaj\u0105 do Twojej typligi.</p></div>
    </div>
    <div class="faq-item reveal d3" [class.open]="openFaq() === 3">
      <button class="faq-q" (click)="toggleFaq(3)">Do kiedy mog\u0119 typowa\u0107 mecz? <span class="faq-arrow">\u2193</span></button>
      <div class="faq-a"><p>Do 15 minut przed planowanym rozpocz\u0119ciem meczu. Po tym czasie typ jest automatycznie blokowany. Mo\u017Cesz edytowa\u0107 typy dowoln\u0105 liczb\u0119 razy przed zamkni\u0119ciem.</p></div>
    </div>
    <div class="faq-item reveal d4" [class.open]="openFaq() === 4">
      <button class="faq-q" (click)="toggleFaq(4)">Ile os\u00F3b mo\u017Ce by\u0107 w jednej typlidze? <span class="faq-arrow">\u2193</span></button>
      <div class="faq-a"><p>Nie ma limitu uczestnik\u00F3w. Do jednej typligi mo\u017Ce do\u0142\u0105czy\u0107 dowolna liczba os\u00F3b.</p></div>
    </div>
    <div class="faq-item reveal d5" [class.open]="openFaq() === 5">
      <button class="faq-q" (click)="toggleFaq(5)">Co si\u0119 stanie, gdy anuluj\u0119 subskrypcj\u0119? <span class="faq-arrow">\u2193</span></button>
      <div class="faq-a"><p>Twoje konto wr\u00F3ci do planu Light. Zachowasz dost\u0119p do typlig, w kt\u00F3rych jeste\u015B, ale limity tworzenia i do\u0142\u0105czania b\u0119d\u0105 odpowiada\u0107 darmowemu planowi.</p></div>
    </div>
    <div class="faq-item reveal d6" [class.open]="openFaq() === 6">
      <button class="faq-q" (click)="toggleFaq(6)">Jak dzia\u0142aj\u0105 plany p\u0142atne? <span class="faq-arrow">\u2193</span></button>
      <div class="faq-a"><p>Subskrypcja jest miesi\u0119czna. P\u0142acisz kart\u0105, BLIK-iem lub Przelewy24. Mo\u017Cesz anulowa\u0107 w dowolnym momencie przez portal klienta.</p></div>
    </div>
  </div>
</div>

<!-- CTA FOOTER -->
<div class="cta-section">
  <div class="reveal">
    <div class="cta-title">Nie czekaj na <em>pierwszy gwizdek</em></div>
    <p class="cta-sub">Rozgrzewka przed Mundialem trwa. Stw\u00F3rz typlig\u0119, zapro\u015B znajomych i zacznij typowa\u0107 ju\u017C dzi\u015B.</p>
    <div class="cta-actions">
      <a routerLink="/register" class="lp-btn-primary" style="font-size:16px;padding:18px 40px;">Do\u0142\u0105cz za darmo \u2192</a>
      <span class="cta-note">Bezp\u0142atna \u00B7 Bez reklam \u00B7 Graj od razu</span>
    </div>
  </div>
</div>

<!-- FOOTER -->
<footer class="lp-footer">
  <a class="logo" routerLink="/landing">
    <div class="logo-icon">\u26BD</div>
    <div class="logo-text">Typ<span>Liga</span></div>
  </a>
  <span>\u00A9 2026 TypLiga \u00B7 Twoja typliga, Twoje zasady.</span>
</footer>
  `
})
export class LandingComponent {
  navScrolled = signal(false);
  openFaq = signal<number | null>(null);

  private el = inject(ElementRef);
  private destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const scrollHandler = () => this.navScrolled.set(window.scrollY > 40);
      window.addEventListener('scroll', scrollHandler, { passive: true });
      this.destroyRef.onDestroy(() => window.removeEventListener('scroll', scrollHandler));

      const observer = new IntersectionObserver(
        entries => entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            observer.unobserve(e.target);
          }
        }),
        { threshold: 0.1 }
      );
      this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => observer.observe(el));
      this.destroyRef.onDestroy(() => observer.disconnect());

      const track = this.el.nativeElement.querySelector('#screensTrack');
      if (track?.parentNode) {
        const clone = track.cloneNode(true) as HTMLElement;
        clone.setAttribute('aria-hidden', 'true');
        clone.removeAttribute('id');
        track.parentNode.appendChild(clone);
      }
    });
  }

  toggleFaq(index: number) {
    this.openFaq.update(v => v === index ? null : index);
  }
}
