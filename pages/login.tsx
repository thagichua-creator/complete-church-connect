import React from "react";
import { Church, ShieldCheck } from "lucide-react";
import { PasswordLoginForm } from "../components/PasswordLoginForm";
import styles from "./login.module.css";

export default function LoginPage() {
  return (
    <main className={styles.page}>
      <section className={styles.brandPanel}>
        <div className={styles.brand}>
          <div className={styles.mark}><Church size={25} /></div>
          <div><strong>CHURCH CONNECT</strong><span>COMMUNITY PLATFORM</span></div>
        </div>
        <div className={styles.brandMessage}>
          <span className={styles.kicker}>ONE CHURCH. ONE COMMUNITY.</span>
          <h1>Bringing your church community closer.</h1>
          <p>A secure place to support membership, ministry and meaningful connections.</p>
        </div>
        <div className={styles.brandFooter}><ShieldCheck size={15}/> Your community. Treated with care.</div>
      </section>
      <section className={styles.formPanel}>
        <div className={styles.formWrap}>
          <div className={styles.mobileBrand}><div className={styles.mark}><Church size={22}/></div><strong>CHURCH CONNECT</strong></div>
          <span className={styles.formKicker}>WELCOME BACK</span>
          <h2>Sign in to your workspace</h2>
          <p className={styles.formIntro}>Enter your account details to continue.</p>
          <PasswordLoginForm />
          <p className={styles.securityNote}><ShieldCheck size={14}/> Sign-in is protected by secure sessions and password hashing.</p>
        </div>
        <footer>© 2026 Complete Church Connect</footer>
      </section>
    </main>
  );
}

pages/login.module.css — lines 1-1 of 1 (version: 1795785479090, sha256: 1e3dd6450b813e73206df81dad546b257e1f22db3843773803c729670103940b)
.page{min-height:100vh;display:grid;grid-template-columns:minmax(320px,.9fr) minmax(420px,1.1fr);background:var(--background);color:var(--foreground);font-family:var(--font-family-base)}.brandPanel{background:#0b1930;color:#f7f4ec;padding:38px 7%;display:flex;flex-direction:column;justify-content:space-between;min-height:100vh;position:relative;overflow:hidden}.brandPanel:after{content:"";position:absolute;width:480px;height:480px;border:1px solid rgba(212,175,98,.16);border-radius:50%;right:-190px;bottom:-170px;box-shadow:0 0 0 45px rgba(212,175,98,.025),0 0 0 95px rgba(212,175,98,.02)}.brand{display:flex;align-items:center;gap:12px;position:relative;z-index:1}.mark{width:42px;height:42px;border-radius:12px;background:#d4af62;color:#17243a;display:grid;place-items:center}.brand strong{display:block;font-size:12px;letter-spacing:.1em}.brand span{display:block;font-size:9px;letter-spacing:.16em;color:#aab6c4;margin-top:4px}.brandMessage{max-width:510px;position:relative;z-index:1;margin:50px 0}.kicker,.formKicker{font-size:10px;letter-spacing:.18em;font-weight:700;color:#d4af62}.brandMessage h1{font:600 clamp(38px,5vw,62px)/1.05 var(--font-family-display);letter-spacing:-.035em;margin:18px 0}.brandMessage p{font-size:14px;line-height:1.7;color:#bdc7d2;max-width:390px}.brandFooter{font-size:11px;color:#b8c3cf;display:flex;align-items:center;gap:8px;position:relative;z-index:1}.brandFooter svg{color:#d4af62}.formPanel{display:flex;flex-direction:column;justify-content:center;align-items:center;padding:50px 9%;position:relative}.formWrap{width:100%;max-width:390px}.formKicker{color:#9a7839}.formWrap h2{font:600 32px/1.15 var(--font-family-display);letter-spacing:-.025em;margin:12px 0 8px}.formIntro{font-size:13px;color:var(--muted-foreground);margin:0 0 28px}.securityNote{display:flex;align-items:center;gap:7px;font-size:10px;color:var(--muted-foreground);margin-top:24px}.securityNote svg{color:#8a7449}.formPanel footer{position:absolute;bottom:22px;color:#93a0af;font-size:10px}.mobileBrand{display:none;align-items:center;gap:9px;margin-bottom:35px}.mobileBrand .mark{width:35px;height:35px}.mobileBrand strong{font-size:11px;letter-spacing:.08em}@media(max-width:760px){.page{grid-template-columns:1fr}.brandPanel{display:none}.formPanel{min-height:100vh;padding:32px 22px}.mobileBrand{display:flex}.formWrap h2{font-size:29px}}

pages/login.pageLayout.tsx — lines 1-1 of 1 (version: 1795785479090, sha256: 37b82084f43a8e4772665574b64511b6b1c54874c2c3cd66cb85a1fc3958d503)
export default [];
