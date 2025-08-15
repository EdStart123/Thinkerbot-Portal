
import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * Thinkerbot Portal — single‑file React app
 * Brand‑matched UI + Vision‑aware Chat (hover pop, click‑away reduce)
 * Pages: Profile, My Journey, Network, Resources
 */

// ------------------------------ Theme & Assets (defaults)
const THEME = {
  purple: "#8E4BFF",
  purpleSoft: "#B897FF",
  green: "#20D07B",
  navy: "#0E1230",
  ink: "#0b0f22",
  card: "#ffffff",
  bg: "#F2F4FA",
};

const ASSET_DEFAULTS = {
  logoCloud: null,
  sidebarPattern: null,
  avatarMap: {},
  navIcons: { profile: null, journey: null, network: null, resources: null },
  shapes: { tl: null, br: null },
};

// Read default API key from env (falls back to placeholder).
// You can set VITE_OPENAI_API_KEY in a .env file at the project root.
const DEFAULT_API_KEY = (import.meta?.env && import.meta.env.VITE_OPENAI_API_KEY) || "sk-REPLACE_WITH_YOUR_KEY";

// ------------------------------ Utils
const cls = (...xs) => xs.filter(Boolean).join(" ");
const hasWindow = typeof window !== "undefined";
const save = (k, v) => { try { if(hasWindow) localStorage.setItem(k, JSON.stringify(v)); } catch{} };
const load = (k, d) => { try { return hasWindow ? JSON.parse(localStorage.getItem(k)) ?? d : d; } catch { return d; } };
const safeParse = (t, fallback) => { try { const j = JSON.parse(t); return j && typeof j === 'object' ? j : fallback; } catch { return fallback; } };

// ------------------------------ Icons (inline SVG fallbacks)
const Icon = {
  search: (p={}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cls("w-5 h-5", p.className)}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"/></svg>
  ),
  link: (p={}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cls("w-5 h-5", p.className)}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 1 7.54-.54l2 2A5 5 0 1 1 12 21l-2-2M14 11a5 5 0 0 0-7.54.54l-2 2A5 5 0 1 0 12 3l2 2"/></svg>
  ),
  send: (p={}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cls("w-5 h-5", p.className)}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13"/><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M22 2l-7 20-4-9-9-4Z"/></svg>
  ),
  upload: (p={}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cls("w-5 h-5", p.className)}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 9l5-5 5 5M12 4v12"/></svg>
  ),
  x: (p={}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cls("w-4 h-4", p.className)}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
  ),
  external: (p={}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cls("w-4 h-4", p.className)}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 3h7v7M10 14L21 3M5 7v14"/></svg>
  ),
  settings: (p={}) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={cls("w-5 h-5", p.className)}><path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317a2 2 0 0 1 3.35 0l.547.894a2 2 0 0 0 1.518.96l1.034.12a2 2 0 0 1 1.75 1.75l.12 1.034a2 2 0 0 0 .96 1.518l.894.547a2 2 0 0 1 0 3.35l-.894.547a2 2 0 0 0-.96 1.518l-.12 1.034a2 2 0 0 1-1.75 1.75l-1.034.12a2 2 0 0 0-1.518.96l-.547.894Z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  profile: (p={}) => (
    <svg viewBox="0 0 24 24" className={cls("w-5 h-5", p.className)} fill="currentColor"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z"/></svg>
  ),
  journey: (p={}) => (
    <svg viewBox="0 0 24 24" className={cls("w-5 h-5", p.className)} fill="currentColor"><path d="M4 6h16v2H4zm0 5h10v2H4zm0 5h16v2H4z"/></svg>
  ),
  network: (p={}) => (
    <svg viewBox="0 0 24 24" className={cls("w-5 h-5", p.className)} fill="currentColor"><path d="M12 3a3 3 0 1 1-3 3 3 3 0 0 1 3-3zm6 8a3 3 0 1 1-3 3 3 3 0 0 1 3-3zM6 11a3 3 0 1 1-3 3 3 3 0 0 1 3-3z"/><path d="M9 7l6 3m-9 4l6 1m6-2l-6 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  ),
  lightbulb: (p={}) => (
    <svg viewBox="0 0 24 24" className={cls("w-5 h-5", p.className)} fill="currentColor"><path d="M9 21h6v-1a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2zm6.5-11a5.5 5.5 0 1 0-8.9 4.2c.8.7 1.4 1.6 1.6 2.6h5.6c.2-1 .8-1.9 1.6-2.6a5.5 5.5 0 0 0 0-8.2z"/></svg>
  ),
};

function ThinkeringLogo({className, url}){
  return (
    <div className={cls("flex items-center gap-2", className)}>
      <CloudIcon className="w-7 h-7" url={url}/>
      <div className="font-semibold tracking-tight" style={{color:THEME.navy}}>
        thinkering<span style={{color:THEME.purple}}>lab</span><span style={{color:THEME.green}}>s</span>
      </div>
    </div>
  );
}

function CloudIcon({className, url}){
  if (url) return <img src={url} className={className} alt="cloud"/>;
  return (
    <svg className={className} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tg" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor={THEME.purple}/>
          <stop offset="60%" stopColor={THEME.purpleSoft}/>
          <stop offset="100%" stopColor={THEME.green}/>
        </linearGradient>
      </defs>
      <path fill="url(#tg)" d="M24 46h20a12 12 0 0 0 1.6-23.9A16 16 0 0 0 16 18.9 10 10 0 0 0 10 38h14z"/>
    </svg>
  );
}

const DEMO_PEOPLE = [
  { id: "hayley", name: "Hayley Higgins", title: "Fellowship chairperson and governor", org: "Eisenhower High School", location: "Chicago, IL", bio: "With over 15 years in educational administration, Hayley is known for fostering inclusive learning environments and strengthening community partnerships.", avatar: "https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=800&auto=format&fit=crop", links:{linkedin:"#",site:"#"}, tags:["secondary education","community partnerships","leadership","equity","capstone:community hub"] },
  { id: "steve", name: "Steve Marks", title: "Math Dept. Lead", org: "Pioneer HS", location:"Denver, CO", bio: "Data-first math leader building pathways from algebra to AI.", avatar: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=800&auto=format&fit=crop", links:{linkedin:"#"}, tags:["STEM","math","ai","capstone:ml lab"] },
  { id: "carly", name: "Carly Owens", title: "Director of Learning", org:"City Education Fund", location:"Austin, TX", bio: "Designs partnerships between schools and local makerspaces.", avatar: "https://images.unsplash.com/photo-1531123414780-f74241a6df54?q=80&w=800&auto=format&fit=crop", links:{site:"#"}, tags:["community","project-based","makerspace","capstone:maker trail"] },
  { id: "hal", name: "Hal Nguyen", title: "CTE Coordinator", org:"Roosevelt HS", location:"Portland, OR", bio:"Champions career pathways and industry mentors in classrooms.", avatar:"https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop", links:{}, tags:["CTE","career pathways","industry","capstone:apprenticeship"] },
  { id: "nick", name: "Nick Silva", title: "Science Coach", org:"LCPS", location:"Leesburg, VA", bio:"Inquiry-based science and field research for K-12.", avatar:"https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=800&auto=format&fit=crop", links:{}, tags:["science","field work","outdoor","capstone:river study"] },
  { id: "leo", name: "Leo Park", title: "Innovation Fellow", org:"Thinkering", location:"NYC, NY", bio:"Explores human-centered AI for schools.", avatar:"https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=800&auto=format&fit=crop", links:{}, tags:["ai","human-centered","ethics","capstone:assistant"] },
  { id: "pam", name: "Pam Reese", title: "Elementary Principal", org:"Sunrise Elem.", location:"Boise, ID", bio:"Literacy + play champion.", avatar:"https://images.unsplash.com/photo-1544723795-3160f2b8f2b8?q=80&w=800&auto=format&fit=crop", links:{}, tags:["literacy","play","early years","capstone:family reading"] },
  { id: "carl", name: "Carl Abdi", title: "Social Studies", org:"Jefferson HS", location:"Minneapolis, MN", bio:"Civic engagement and student media.", avatar:"https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=800&auto=format&fit=crop", links:{}, tags:["civics","media","community","capstone:city voices"] },
  { id: "les", name: "Les Rowe", title: "Counselor", org:"Eastridge", location:"Tampa, FL", bio:"Career advising and mentorship networks.", avatar:"https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?q=80&w=800&auto=format&fit=crop", links:{}, tags:["mentors","career","wellbeing","capstone:mentor map"] },
  { id: "joel", name: "Joel Kim", title: "Physics", org:"Wilson HS", location:"Seattle, WA", bio:"Student research and public showcases.", avatar:"https://images.unsplash.com/photo-1546525848-3ce03ca516f6?q=80&w=800&auto=format&fit=crop", links:{}, tags:["physics","research","showcase","capstone:expo night"] },
];

export default function App(){
  const [tab, setTab] = useState("Network");
  const [hoveredPerson, setHoveredPerson] = useState(null);
  const [currentJourneyItem, setCurrentJourneyItem] = useState(null);

  const [profile, setProfile] = useState(() => load("thinker.profile", {
    name: "Liam Steele",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
    keywords: ["STEM","community","ai"],
    socials: { linkedin:"", x:"", instagram:"", website:"" },
  }));
  useEffect(()=>{ save("thinker.profile", profile); }, [profile]);

  const [assets, setAssets] = useState(()=> load("thinker.assets", ASSET_DEFAULTS));
  useEffect(()=> save("thinker.assets", assets), [assets]);

  useEffect(()=>{
    try{
      const u = new URL(window.location.href);
      const m = u.searchParams.get("manifest");
      if(m){ fetch(m).then(r=>r.json()).then(j=> setAssets(a=>({ ...a, ...j }))).catch(()=>{}); }
    }catch{}
  },[]);

  const context = useMemo(()=>({
    tab,
    profile: { name: profile?.name, keywords: profile?.keywords, socials: profile?.socials },
    network: { hoveredId: hoveredPerson?.id || null, hoveredName: hoveredPerson?.name || null },
    journey: { viewingId: currentJourneyItem?.id || null, viewingTitle: currentJourneyItem?.title || null },
  }), [tab, profile, hoveredPerson, currentJourneyItem]);

  return (
    <div className="min-h-screen w-full" style={{color:THEME.navy, background:`radial-gradient(1000px_circle_at_0%_-10%, ${THEME.bg} 0%, transparent 60%), radial-gradient(900px_circle_at_100%_110%, #F6FFFB 0%, transparent 60%)`}}>
      <Header tab={tab} setTab={setTab} logoUrl={assets.logoCloud} navIcons={assets.navIcons} />
      <div className="relative max-w-[1200px] mx-auto px-4 pb-28">
        <BrandRail />
        <MainCard sidebarPattern={assets.sidebarPattern} shapes={assets.shapes}>
          {tab === "Profile" && <ProfileWizard profile={profile} setProfile={setProfile} />}
          {tab === "My Journey" && (
            <JourneyTab onViewingChange={setCurrentJourneyItem} />
          )}
          {tab === "Network" && (
            <NetworkTab profile={profile} assets={assets} onHoverChange={setHoveredPerson} />
          )}
          {tab === "Resources" && <ResourcesTab assets={assets} setAssets={setAssets} />}
        </MainCard>
      </div>

      <ChatDock context={context} defaultApiKey={DEFAULT_API_KEY} primaryImage={
        (context.tab === "Network" && hoveredPerson?.avatar) ||
        (context.tab === "Profile" && profile?.photo) || null
      } />
    </div>
  );
}

function Header({ tab, setTab, logoUrl, navIcons }){
  const items = [
    { key:"Profile", icon: navIcons?.profile, fallback: Icon.profile },
    { key:"My Journey", icon: navIcons?.journey, fallback: Icon.journey },
    { key:"Network", icon: navIcons?.network, fallback: Icon.network },
    { key:"Resources", icon: navIcons?.resources, fallback: Icon.lightbulb },
  ];
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-zinc-200">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center gap-6">
        <ThinkeringLogo url={logoUrl || ASSET_DEFAULTS.logoCloud} />
        <nav className="ml-auto flex items-center gap-4 text-xs font-medium">
          {items.map((it) => (
            <button key={it.key} onClick={()=>setTab(it.key)}
              className={cls("group relative grid place-items-center")}> 
              <div className={cls("w-10 h-10 grid place-items-center rounded-full transition", tab===it.key ? "bg-[--navy] ring-2 ring-white shadow" : "bg-[--navy]/90")} style={{"--navy":`${THEME.navy}`}}>
                {it.icon ? <img src={it.icon} className="w-5 h-5"/> : it.fallback({className:"text-white"})}
              </div>
              <div className={cls("mt-1", tab===it.key?"text-[color:var(--purple)]":"text-zinc-700")} style={{"--purple":`${THEME.purple}`}}>{it.key}</div>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

function BrandRail(){
  return (
    <div className="absolute -left-10 top-10 hidden md:block">
      <div className="rotate-90 origin-left text-xs tracking-[0.25em] font-medium" style={{color:'#6b7080'}}>thinkeringlabs</div>
    </div>
  );
}

function MainCard({children, sidebarPattern, shapes}){
  return (
    <div id="maincard" className="relative mt-6 rounded-[26px] bg-white overflow-hidden" style={{boxShadow:"0 14px 34px rgba(16,24,40,0.14), 0 3px 8px rgba(16,24,40,0.06)"}}>
      {!shapes?.tl && (
        <div className="pointer-events-none absolute -top-28 -left-36 w-[520px] h-[520px] rounded-[48px]" style={{background:`linear-gradient(135deg, ${THEME.purple}33, #ffffff00, ${THEME.green}20)`}}/>
      )}
      {!shapes?.br && (
        <div className="pointer-events-none absolute -bottom-40 -right-28 w-[560px] h-[560px] rounded-[48px]" style={{background:`linear-gradient(60deg, ${THEME.green}33, ${THEME.purple}22, transparent 50%)`}}/>
      )}
      {shapes?.tl && (<img src={shapes.tl} alt="" className="pointer-events-none absolute -top-10 -left-6 w-[560px]"/>) }
      {shapes?.br && (<img src={shapes.br} alt="" className="pointer-events-none absolute -bottom-10 -right-6 w-[600px]"/>) }
      {sidebarPattern && (
        <img alt="bg" src={sidebarPattern} className="pointer-events-none absolute inset-0 w-full h-full object-cover opacity-10"/>
      )}
      <div className="relative p-6 md:p-8">{children}</div>
    </div>
  );
}

// ------------------------------ Profile (3‑step wizard)
function ProfileWizard({ profile, setProfile }){
  const [step, setStep] = useState(0);
  const [name, setName] = useState(profile.name || "");
  const [photo, setPhoto] = useState(profile.photo || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [affil, setAffil] = useState(profile.affil || "");
  const [title, setTitle] = useState(profile.title || "");
  const [goals, setGoals] = useState(profile.goals || "");
  const [keywords, setKeywords] = useState(profile.keywords || []);
  const [socials, setSocials] = useState(profile.socials || { tiktok:"", linkedin:"", instagram:"", x:"", pinterest:"", website:"" });
  const [showUpload, setShowUpload] = useState(false);

  useEffect(()=>{ setProfile({ ...profile, name, photo, bio, affil, title, goals, keywords, socials }); }, [name, photo, bio, affil, title, goals, keywords, socials]);

  const Dot = ({on, i}) => (<span className={cls("inline-block w-2 h-2 rounded-full mx-1", on?"bg-[--p]":"bg-zinc-300")} style={{"--p":`${THEME.purple}`}} title={`Step ${i+1}`}/>);

  return (
    <div>
      <div className="relative rounded-2xl p-6 overflow-hidden" style={{background:`linear-gradient(135deg, ${THEME.purple}30, #ffffff 30%, ${THEME.green}30)`}}>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={photo} className="w-24 h-24 rounded-full object-cover ring-4 ring-white" style={{boxShadow:"0 10px 22px rgba(16,24,40,0.18)"}}/>
            <button onClick={()=>setShowUpload(true)} className="absolute -right-1 -bottom-1 grid place-items-center w-8 h-8 rounded-full text-white" style={{background:THEME.navy}}>
              <Icon.upload className="w-4 h-4 text-white"/>
            </button>
          </div>
          <div>
            <div className="text-xl font-semibold">{name || "Your name"}</div>
            <div className="text-sm opacity-70">{title || "Position/Title"}</div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border bg-white/90 p-6 shadow-[0_10px_24px_rgba(16,24,40,0.08)]">
        <div className="flex items-center justify-center gap-10 text-sm font-semibold">
          <StepLabel on={step===0} text="Professional Profile"/>
          <StepLabel on={step===1} text="Professional Interests"/>
          <StepLabel on={step===2} text="Online Presence"/>
        </div>

        <div className="mt-6">
          {step===0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <TextRow label="First name" value={name.split(' ')[0]||''} onChange={v=>setName(v+ (name.includes(' ')?` ${name.split(' ').slice(1).join(' ')}`:''))} placeholder="Liam"/>
              <TextRow label="Surname" value={name.split(' ').slice(1).join(' ')} onChange={v=>setName(`${name.split(' ')[0]||''} ${v}`.trim())} placeholder="Steele"/>
              <label className="md:col-span-2 text-sm">
                <div className="font-medium">Bio</div>
                <textarea value={bio} onChange={e=>setBio(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2" placeholder="A few lines about your experience…"/>
              </label>
              <TextRow label="School/District Affiliation" value={affil} onChange={setAffil} placeholder="Eisenhower High School"/>
              <TextRow label="Position/Title" value={title} onChange={setTitle} placeholder="Teacher"/>
            </div>
          )}

          {step===1 && (
            <div>
              <label className="text-sm block">
                <div className="font-medium">Personal Goals</div>
                <textarea value={goals} onChange={e=>setGoals(e.target.value)} rows={5} className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2" placeholder="What do you hope to accomplish this year?"/>
              </label>
              <div className="mt-4">
                <div className="text-sm font-medium">Expertise / Keywords</div>
                <TagInput value={keywords} onChange={setKeywords} placeholder="Add a keyword and press Enter (e.g., organizer, numbers, STEM)"/>
              </div>
            </div>
          )}

          {step===2 && (
            <div className="grid md:grid-cols-2 gap-3">
              <TextRow icon="tiktok" label="TikTok" value={socials.tiktok} onChange={v=>setSocials(s=>({...s, tiktok:v}))} placeholder="https://www.tiktok.com/@…"/>
              <TextRow icon="linkedin" label="LinkedIn" value={socials.linkedin} onChange={v=>setSocials(s=>({...s, linkedin:v}))} placeholder="https://linkedin.com/in/…"/>
              <TextRow icon="instagram" label="Instagram" value={socials.instagram} onChange={v=>setSocials(s=>({...s, instagram:v}))} placeholder="https://instagram.com/…"/>
              <TextRow icon="x" label="X" value={socials.x} onChange={v=>setSocials(s=>({...s, x:v}))} placeholder="https://x.com/…"/>
              <TextRow icon="pinterest" label="Pinterest" value={socials.pinterest} onChange={v=>setSocials(s=>({...s, pinterest:v}))} placeholder="https://pinterest.com/…"/>
              <TextRow icon="web" label="Website" value={socials.website} onChange={v=>setSocials(s=>({...s, website:v}))} placeholder="https://…"/>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button onClick={()=>setStep(s=>Math.max(0, s-1))} disabled={step===0}
                  className="px-4 py-2 rounded-full text-white disabled:opacity-50" style={{background:THEME.navy}}>« Back</button>
          <div className="flex items-center"><Dot on={step===0} i={0}/><Dot on={step===1} i={1}/><Dot on={step===2} i={2}/></div>
          <button onClick={()=> step===2 ? alert('Saved!') : setStep(s=>Math.min(2, s+1))}
                  className="px-4 py-2 rounded-full text-white" style={{background:`linear-gradient(90deg, ${THEME.purple}, ${THEME.green})`}}>{step===2?"Submit":"» Next"}</button>
        </div>
      </div>

      {showUpload && (
        <UploadModal onClose={()=>setShowUpload(false)} onUpload={(url)=>{ setPhoto(url); setShowUpload(false); }}/>
      )}
    </div>
  );
}

function StepLabel({on, text}){
  return (
    <div className="relative grid place-items-center">
      <div className={cls("w-2 h-2 rounded-full mb-1", on?"bg-[--p]":"bg-zinc-400")} style={{"--p":`${THEME.purple}`}}/>
      <div className={cls("text-[13px]", on?"text-[--p]":"text-zinc-600")} style={{"--p":`${THEME.purple}`}}>{text}</div>
    </div>
  );
}

function UploadModal({ onClose, onUpload }){
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/20">
      <div className="w-[min(640px,90vw)] rounded-2xl bg-white border p-6 shadow-xl">
        <div className="text-lg font-semibold mb-4">Upload Profile Photo</div>
        <label className="text-sm block">
          <div className="font-medium">Document title</div>
          <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2" placeholder="e.g. Headshot"/>
        </label>
        <div className="mt-3 flex items-center gap-3">
          <input readOnly value={file?.name || "Choose file…"} className="flex-1 rounded-lg border px-3 py-2 bg-zinc-50"/>
          <label className="px-3 py-2 rounded-lg border cursor-pointer bg-white">Browse
            <input type="file" accept="image/*" className="hidden" onChange={e=>{ const f=e.target.files?.[0]; setFile(f||null); if(f){ const r=new FileReader(); r.onload=()=>setPreview(r.result); r.readAsDataURL(f);} }}/>
          </label>
        </div>
        {preview && <img src={preview} alt="preview" className="mt-3 w-32 h-32 rounded-full object-cover"/>}
        <div className="mt-5 flex justify-between">
          <button className="px-4 py-2 rounded-full" style={{background:THEME.navy, color:'#fff'}} onClick={onClose}>Cancel</button>
          <button className="px-4 py-2 rounded-full text-white" style={{background:`linear-gradient(90deg, ${THEME.purple}, ${THEME.green})`}} onClick={()=> onUpload(preview)}>Upload</button>
        </div>
      </div>
    </div>
  );
}

function TextRow({label, value, onChange, placeholder, icon}){
  const IconSlot = () => (
    icon ? <span className="w-6 h-6 grid place-items-center rounded-full bg-zinc-100 mr-2">{icon === 'linkedin' && 'in'}{icon==='instagram' && 'ig'}{icon==='x' && 'x'}{icon==='tiktok' && '♪'}{icon==='pinterest' && 'p'}{icon==='web' && <Icon.link className="w-4 h-4"/>}</span> : null
  );
  return (
    <label className="text-sm flex items-center">
      {IconSlot()}
      <div className="flex-1">
        {label && <div className="font-medium">{label}</div>}
        <input value={value || ""} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
               className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2"/>
      </div>
    </label>
  );
}

function TagInput({ value, onChange, placeholder }){
  const [draft, setDraft] = useState("");
  const add = (t) => {
    const tag = t.trim();
    if (!tag) return; if (value.includes(tag)) return; onChange([...value, tag]); setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((t)=> (
          <span key={t} className="group inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 text-sm border">
            {t}
            <button onClick={()=>onChange(value.filter(x=>x!==t))} className="opacity-60 group-hover:opacity-100"><Icon.x /></button>
          </span>
        ))}
      </div>
      <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder={placeholder}
             onKeyDown={e=>{ if(e.key==='Enter' || e.key===','){ e.preventDefault(); add(draft); } }}
             className="mt-2 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2"/>
    </div>
  );
}

// ------------------------------ My Journey
function JourneyTab({ onViewingChange }){
  const [apiBase, setApiBase] = useState(load("thinker.apiBase", ""));
  const [apiKey, setApiKey] = useState(load("thinker.apiKey", DEFAULT_API_KEY));
  const [items, setItems] = useState(load("thinker.journey", []));
  const [loading, setLoading] = useState(false);
  useEffect(()=>save("thinker.apiBase", apiBase), [apiBase]);
  useEffect(()=>save("thinker.apiKey", apiKey), [apiKey]);
  useEffect(()=>save("thinker.journey", items), [items]);

  const loadFromAPI = async () => {
    if(!apiBase) { alert("Add an API base or use Sample Data"); return; }
    try{
      setLoading(true);
      const res = await fetch(`${apiBase}/fellowship/content`, { headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {} });
      if(!res.ok) throw new Error("Network error");
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items ?? []);
    }catch(err){
      alert("Fetch failed. Using sample data instead.");
      addSamples();
    }finally{ setLoading(false); }
  };

  const addSamples = () => setItems([
    { id:"vid1", kind:"video", title:"Welcome to the Fellowship", by:"Thinkering Labs", url:"https://player.vimeo.com/video/76979871", note:"Kickoff overview." },
    { id:"mod1", kind:"module", title:"Capstone Design Sprint", by:"Uni Team", url:"https://example.com/capstone-sprint.pdf", note:"Worksheet & slides." },
    { id:"vid2", kind:"video", title:"Partnering with Community", by:"Hayley Higgins", url:"https://player.vimeo.com/video/32768920", note:"Case study." },
  ]);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end gap-3 mb-6">
        <label className="flex-1 text-sm">
          <div className="font-medium">API Base (optional)</div>
          <input value={apiBase} onChange={e=>setApiBase(e.target.value)} placeholder="https://your.api"
                 className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2"/>
        </label>
        <label className="flex-1 text-sm">
          <div className="font-medium">API Key (optional)</div>
          <input value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="••••••"
                 className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2"/>
        </label>
        <div className="flex gap-2">
          <button onClick={loadFromAPI} className="px-4 py-2 rounded-full text-white" style={{background:THEME.navy}}>{loading?"Loading…":"Load from API"}</button>
          <button onClick={addSamples} className="px-4 py-2 rounded-full border">Use Sample Data</button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((it)=> (
          <div key={it.id} className="rounded-2xl border p-4 bg-white/90 shadow-[0_6px_18px_rgba(16,24,40,0.06)]">
            <div className="text-xs uppercase tracking-wide text-zinc-500">{it.kind}</div>
            <div className="mt-1 font-semibold">{it.title}</div>
            <div className="text-sm opacity-70">{it.by}</div>
            <div className="mt-3 text-sm text-zinc-700">{it.note}</div>
            {it.url && (
              <div className="mt-3 flex gap-2">
                <a href={it.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm" style={{color:THEME.purple}}>Open <Icon.external/></a>
                <button onClick={()=>onViewingChange?.(it)} className="text-sm underline">Set as current</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ------------------------------ Network
function NetworkTab({ profile, assets, onHoverChange }){
  const [query, setQuery] = useState("");
  const [hovered, setHovered] = useState(null);
  useEffect(()=>{ onHoverChange?.(hovered); }, [hovered]);

  const myTags = useMemo(()=> (profile?.keywords || []).map(s=>s.toLowerCase().trim()), [profile]);
  const people = useMemo(()=> 
    DEMO_PEOPLE.map(p=>({ ...p, avatar: (assets?.avatarMap?.[p.id] || p.avatar), score: jaccard(p.tags.map(t=>t.toLowerCase()), myTags) }))
  ,[assets, myTags]);

  const candidates = useMemo(()=> 
    people
      .filter(p=>!query || p.name.toLowerCase().includes(query.toLowerCase()))
      .sort((a,b)=> b.score - a.score)
  ,[people, query]);

  const primary = { name: profile?.name || "Liam", photo: profile?.photo };

  return (
    <div>
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="relative min-h-[360px] rounded-2xl p-6" style={{background:`linear-gradient(135deg, ${THEME.purple}22, #ffffff, ${THEME.green}22)`}}>
          <div className="flex items-center gap-6">
            <img src={primary.photo} className="w-40 h-40 rounded-full object-cover ring-4 ring-white" style={{boxShadow:"0 12px 24px rgba(16,24,40,0.18)"}}/>
            <div>
              <div className="text-2xl font-semibold">Hi, {primary.name}!</div>
              <button className="mt-3 px-4 py-2 rounded-full text-white" style={{background:THEME.purple}}>View more</button>
            </div>
          </div>
          <div className="absolute bottom-4 left-6 right-6 h-10 rounded-full bg-white/85 backdrop-blur border border-zinc-200 flex items-center px-4 gap-2 text-sm text-zinc-600">
            <Icon.search />
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Type here…" className="w-full bg-transparent outline-none"/>
            <Icon.send />
          </div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold">My Network</div>
            <div className="flex items-center gap-2 opacity-60"><span className="w-2 h-2 rounded-full bg-zinc-300"/><span className="w-2 h-2 rounded-full bg-zinc-300"/><span className="w-2 h-2 rounded-full bg-zinc-300"/></div>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {candidates.map((p)=> (
              <button key={p.id} onMouseEnter={()=>setHovered(p)} onMouseLeave={()=>setHovered(null)} onFocus={()=>setHovered(p)}
                className="group relative flex flex-col items-center gap-2">
                <img alt={p.name} src={p.avatar} className="w-16 h-16 rounded-full object-cover ring-2 ring-white" style={{boxShadow:"0 10px 18px rgba(16,24,40,0.18)"}}/>
                <div className="text-xs" style={{color:THEME.navy}}>{firstName(p.name)}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 relative">
            <ProfileDetailCard person={hovered || candidates[0]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileDetailCard({ person }){
  if(!person) return null;
  return (
    <div className="rounded-2xl border bg-white/90 p-6 backdrop-blur" style={{boxShadow:"0 12px 28px rgba(16,24,40,0.10)"}}>
      <div className="flex gap-6">
        <div className="relative w-56 h-40 md:w-80 md:h-52 rounded-xl overflow-hidden">
          <img src={person.avatar} className="absolute inset-0 w-full h-full object-cover"/>
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white"/>
        </div>
        <div className="flex-1">
          <div className="text-2xl font-extrabold leading-tight" style={{color:THEME.navy}}>{person.name}</div>
          <div className="text-sm text-zinc-600">{person.title} <span className="text-zinc-400">•</span> {person.org}</div>
          <div className="mt-3 text-sm text-zinc-700 leading-relaxed">{person.bio}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {person.tags.slice(0,5).map(t=> <span key={t} className="px-2 py-1 rounded-full bg-zinc-100 text-xs border">{t}</span>)}
          </div>
          <div className="mt-4 flex items-center gap-3">
            {person.links?.linkedin && <a href={person.links.linkedin} target="_blank" rel="noreferrer" className="text-sm" style={{color:THEME.purple}}>LinkedIn <Icon.external/></a>}
            {person.links?.site && <a href={person.links.site} target="_blank" rel="noreferrer" className="text-sm" style={{color:THEME.purple}}>Website <Icon.external/></a>}
          </div>
        </div>
        <div className="hidden md:flex md:flex-col md:gap-5 md:pl-4">
          {["Hayley","Stew","Les"].map((n,i)=> (
            <div key={i} className="grid place-items-center">
              <img src={person.avatar} className="w-14 h-14 rounded-full object-cover"/>
              <div className="text-xs mt-2" style={{color:THEME.navy}}>{n}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function jaccard(a, b){ const A = new Set(a), B=new Set(b); const inter=[...A].filter(x=>B.has(x)).length; const union=[...new Set([...A,...B])].length; return union? inter/union : 0; }
const firstName = (s) => (s||"").split(" ")[0];

// ------------------------------ Resources
function ResourcesTab({ assets, setAssets }){
  const [logoCloud, setLogoCloud] = useState(assets.logoCloud || "");
  const [sidebarPattern, setSidebarPattern] = useState(assets.sidebarPattern || "");
  const [avatarJson, setAvatarJson] = useState(JSON.stringify(assets.avatarMap || {}, null, 2));
  const [navIcons, setNavIcons] = useState(assets.navIcons || { profile:"", journey:"", network:"", resources:"" });
  const [shapes, setShapes] = useState(assets.shapes || { tl:"", br:"" });
  const [manifest, setManifest] = useState("");
  const [dropboxPrefix, setDropboxPrefix] = useState("");

  useEffect(()=>{
    const m = safeParse(manifest, null);
    if(m){ setAssets({ ...assets, ...m }); return; }
    setAssets({ logoCloud: logoCloud || null, sidebarPattern: sidebarPattern || null, avatarMap: safeParse(avatarJson, {}), navIcons, shapes });
  }, [logoCloud, sidebarPattern, avatarJson, navIcons, shapes, manifest]);

  const toRaw = (url) => {
    if(!url) return url;
    if(url.includes("dl.dropboxusercontent.com")) return url;
    if(url.includes("dropbox.com")) return url.replace(/\\?dl=0$/, "?raw=1").replace(/\\?dl=1$/, "?raw=1");
    return url;
  };

  const quickFillFromPrefix = () => {
    if(!dropboxPrefix) return;
    const base = toRaw(dropboxPrefix.replace(/\\/$/, ""));
    setLogoCloud(`${base}/logo-cloud.svg?raw=1`);
    setSidebarPattern(`${base}/pattern.png?raw=1`);
    setShapes({ tl: `${base}/shape-tl.png?raw=1`, br: `${base}/shape-br.png?raw=1` });
    setNavIcons({
      profile: `${base}/icon-profile.svg?raw=1`,
      journey: `${base}/icon-journey.svg?raw=1`,
      network: `${base}/icon-network.svg?raw=1`,
      resources: `${base}/icon-resources.svg?raw=1`
    });
  };

  const items = [
    { title:"Inclusive learning environments", blurb:"Fostering belonging, respect, and…", author:"Garrett Wilhelm", when:"1 day ago" },
    { title:"What Schools Really Teach", blurb:"The hidden curriculum behind the lesson plan.", author:"Team", when:"3 days ago" },
    { title:"Grades, Grit, & Growth", blurb:"Rethinking student success.", author:"Media", when:"1 week ago" },
  ];
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="space-y-4">
        {items.slice(0,2).map((it)=> (
          <div key={it.title} className="rounded-2xl border p-4 bg-white/90 flex gap-3" style={{boxShadow:"0 6px 18px rgba(16,24,40,0.06)"}}>
            <div className="w-28 h-20 rounded-xl bg-zinc-200"/>
            <div className="text-sm">
              <div className="font-semibold">{it.title}</div>
              <div className="text-zinc-600 text-xs mt-1">{it.when}. <span className="underline">Evin Schwartz</span></div>
            </div>
          </div>
        ))}
        <div className="rounded-2xl border p-4 bg-white/90 grid place-items-center h-40" style={{boxShadow:"0 6px 18px rgba(16,24,40,0.06)"}}>
          <div className="w-32 h-32 rounded-[20px] bg-[--navy]" style={{"--navy":`${THEME.navy}`}}/>
        </div>
      </div>

      <div className="rounded-2xl border bg-white/90 p-5" style={{boxShadow:"0 10px 24px rgba(16,24,40,0.08)"}}>
        <div className="aspect-[16/9] rounded-xl bg-zinc-200 overflow-hidden"/>
        <div className="text-2xl font-extrabold mt-4" style={{color:THEME.navy}}>Inclusive learning environments</div>
        <div className="text-xs text-zinc-500">1 day ago. <span className="underline">Garrett Wilhelm</span></div>
        <div className="mt-2 text-sm text-zinc-700">Inclusive learning environments support the diverse needs of all students by fostering a sense of belonging, respect, and…</div>
      </div>

      <div className="space-y-3">
        {items.map((it)=> (
          <div key={it.title} className="rounded-2xl border p-4 bg-white/90 flex items-center justify-between" style={{boxShadow:"0 6px 18px rgba(16,24,40,0.06)"}}>
            <div className="max-w-[70%]">
              <div className="font-semibold text-sm">{it.title}</div>
              <div className="text-xs text-zinc-500 mt-1">{it.when}</div>
            </div>
            <div className="w-12 h-9 rounded-lg" style={{background:THEME.navy}}/>
          </div>
        ))}
      </div>

      <div className="md:col-span-3 rounded-2xl border bg-white/90 p-5 mt-2" style={{boxShadow:"0 10px 24px rgba(16,24,40,0.08)"}}>
        <div className="text-base font-semibold mb-3">Brand Assets (Dropbox friendly)</div>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="text-sm">
            <div className="font-medium flex items-center justify-between">Logo cloud URL <small className="opacity-60">(use ?raw=1)</small></div>
            <input value={logoCloud} onChange={e=>setLogoCloud(e.target.value)} placeholder="https://www.dropbox.com/s/.../thinkering-cloud.svg?raw=1"
                   className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2"/>
          </label>
          <label className="text-sm">
            <div className="font-medium flex items-center justify-between">Sidebar pattern URL</div>
            <input value={sidebarPattern} onChange={e=>setSidebarPattern(e.target.value)} placeholder="https://dl.dropboxusercontent.com/s/.../pattern.png"
                   className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2"/>
          </label>
        </div>
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <fieldset className="text-sm">
            <legend className="font-medium mb-1">Header icon URLs</legend>
            <div className="grid grid-cols-2 gap-2">
              <input value={navIcons.profile||''} onChange={e=>setNavIcons(v=>({...v, profile:e.target.value}))} placeholder="Profile icon (24x)"
                     className="rounded-lg border px-3 py-2"/>
              <input value={navIcons.journey||''} onChange={e=>setNavIcons(v=>({...v, journey:e.target.value}))} placeholder="My Journey icon"
                     className="rounded-lg border px-3 py-2"/>
              <input value={navIcons.network||''} onChange={e=>setNavIcons(v=>({...v, network:e.target.value}))} placeholder="Network icon"
                     className="rounded-lg border px-3 py-2"/>
              <input value={navIcons.resources||''} onChange={e=>setNavIcons(v=>({...v, resources:e.target.value}))} placeholder="Resources icon"
                     className="rounded-lg border px-3 py-2"/>
            </div>
          </fieldset>
          <fieldset className="text-sm">
            <legend className="font-medium mb-1">Corner shape image URLs (optional)</legend>
            <div className="grid grid-cols-2 gap-2">
              <input value={shapes.tl||''} onChange={e=>setShapes(v=>({...v, tl:e.target.value}))} placeholder="Top‑left shape"
                     className="rounded-lg border px-3 py-2"/>
              <input value={shapes.br||''} onChange={e=>setShapes(v=>({...v, br:e.target.value}))} placeholder="Bottom‑right shape"
                     className="rounded-lg border px-3 py-2"/>
            </div>
          </fieldset>
        </div>
        <div className="mt-4 grid md:grid-cols-3 gap-3">
          <label className="text-sm md:col-span-2">
            <div className="font-medium text-sm">Network avatar map (JSON by profile id)</div>
            <textarea value={avatarJson} onChange={e=>setAvatarJson(e.target.value)} rows={8}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 font-mono text-xs outline-none focus:ring-2"
                      placeholder='{"hayley":"https://.../hayley.png?raw=1", "steve":"https://.../steve.jpg?raw=1"}' />
          </label>
          <div className="text-sm">
            <div className="font-medium mb-1">Dropbox folder quick‑fill</div>
            <input value={dropboxPrefix} onChange={e=>setDropboxPrefix(e.target.value)} placeholder="https://www.dropbox.com/scl/fo/<id>/assets" className="rounded-lg border px-3 py-2 w-full"/>
            <button onClick={quickFillFromPrefix} className="mt-2 w-full px-3 py-2 rounded-full text-white" style={{background:THEME.navy}}>Fill from prefix</button>
            <p className="text-xs mt-2 opacity-70">Place files named: <code>logo-cloud.svg</code>, <code>pattern.png</code>, <code>shape-tl.png</code>, <code>shape-br.png</code>, and header icons <code>icon-*.svg</code>.</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="font-medium text-sm">Paste full manifest JSON (optional)</div>
          <textarea value={manifest} onChange={e=>setManifest(e.target.value)} rows={6} className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs" placeholder='{"logoCloud":"…","sidebarPattern":"…","navIcons":{"profile":"…"},"shapes":{"tl":"…","br":"…"},"avatarMap":{"hayley":"…"}}' />
        </div>
      </div>
    </div>
  );
}

// ------------------------------ Chat Dock
function ChatDock({ context, primaryImage, defaultApiKey }){
  const containerRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [messages, setMessages] = useState(() => load("thinker.chat", [
    {role:"assistant", text:"Hi! I’m Thinkerbot. Hover to open, click outside to reduce. I’ll use what you’re viewing as context."}
  ]));
  const [text, setText] = useState("");
  const [apiKey, setApiKey] = useState(load("thinker.openaiKey", defaultApiKey));
  const [model, setModel] = useState(load("thinker.model", "gpt-4o-mini"));
  const [useVision, setUseVision] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(()=>save("thinker.chat", messages), [messages]);
  useEffect(()=>save("thinker.openaiKey", apiKey), [apiKey]);
  useEffect(()=>save("thinker.model", model), [model]);

  useEffect(()=>{
    const onOver = (e)=>{ if(containerRef.current && containerRef.current.contains(e.target)) setExpanded(true); };
    const onDown = (e)=>{ if(containerRef.current && !containerRef.current.contains(e.target)) setExpanded(false); };
    document.addEventListener('mousemove', onOver);
    document.addEventListener('mousedown', onDown);
    return ()=>{ document.removeEventListener('mousemove', onOver); document.removeEventListener('mousedown', onDown); };
  }, []);

  const add = (role, text) => setMessages(m=>[...m, {role, text}]);

  const captureView = async ()=>{
    try {
      if (!window.html2canvas) {
        await new Promise((res, rej)=>{
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
      }
      const el = document.getElementById('maincard');
      const canvas = await window.html2canvas(el, { backgroundColor: null, useCORS: true, scale: 1 });
      return canvas.toDataURL('image/png');
    } catch { return null; }
  };

  const contextText = `PAGE: ${context.tab}
PROFILE: ${context?.profile?.name || ''}
KEYWORDS: ${(context?.profile?.keywords||[]).join(', ')}`;

  const send = async ()=>{
    const q = text.trim(); if(!q) return; setText(""); add('user', q);
    try{
      setBusy(true);
      let imageUrl = null;
      if(useVision){ imageUrl = await captureView(); }
      if(!imageUrl && primaryImage) imageUrl = primaryImage;

      if(!apiKey || apiKey.includes('REPLACE_WITH_YOUR_KEY')){
        add('assistant', demoReply(q, context));
      } else {
        const reply = await callOpenAI({ apiKey, model, question: q, contextText, imageUrl });
        add('assistant', reply);
      }
    }catch(err){ add('assistant', `⚠️ ${err.message}`); }
    finally{ setBusy(false); }
  };

  return (
    <div ref={containerRef} className="fixed bottom-4 right-4 z-30">
      {!expanded && (
        <button className="rounded-full border overflow-hidden shadow-[0_10px_20px_rgba(16,24,40,0.18)]" style={{background:`linear-gradient(135deg, ${THEME.purple}, ${THEME.green})`}}>
          <div className="w-12 h-12 flex items-center justify-center"><CloudIcon className="w-7 h-7"/></div>
        </button>
      )}

      {expanded && (
        <div className="w-[min(420px,calc(100vw-2rem))] rounded-2xl border bg-white overflow-hidden" style={{boxShadow:"0 20px 40px rgba(16,24,40,0.18)"}}>
          <div className="px-3 py-2 flex items-center justify-between bg-gradient-to-br from-white to-[#fafaff]">
            <div className="flex items-center gap-2"><CloudIcon className="w-5 h-5"/><div className="text-sm font-semibold">Thinkerbot</div></div>
            <div className="flex items-center gap-3 text-xs text-zinc-600">
              <label className="inline-flex items-center gap-1 cursor-pointer select-none">
                <input type="checkbox" checked={useVision} onChange={()=>setUseVision(v=>!v)} /> Vision
              </label>
              <button onClick={()=>{
                const v = prompt("OpenAI API key (stored locally)", apiKey || "");
                if(v!==null) setApiKey(v.trim());
              }} className="p-1 rounded-md hover:bg-zinc-100" title="API settings"><Icon.settings/></button>
              <select value={model} onChange={e=>setModel(e.target.value)} className="border rounded px-1 py-0.5">
                <option value="gpt-4o-mini">gpt-4o-mini</option>
                <option value="gpt-4o">gpt-4o</option>
              </select>
            </div>
          </div>
          <div className="p-3">
            <div className="h-60 overflow-y-auto pr-1">
              {messages.map((m,i)=> (
                <div key={i} className={cls("mb-2 text-sm leading-relaxed", m.role==='user'?"text-zinc-900":"text-zinc-800")}> 
                  <span className={cls("inline-block px-3 py-2 rounded-2xl", m.role==='user'?"bg-zinc-100":"bg-[#f6f5ff]")}>{m.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Ask Thinkerbot…"
                     className="flex-1 rounded-full border px-4 py-2 outline-none focus:ring-2"/>
              <button onClick={send} disabled={busy} className="px-3 py-2 rounded-full text-white disabled:opacity-50" style={{background:THEME.purple}}><Icon.send/></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function buildVisionMessage({ question, contextText, imageUrl }){
  const content = [];
  content.push({ type: 'text', text: `${question}

CONTEXT
${contextText}` });
  if (imageUrl) content.push({ type: 'image_url', image_url: { url: imageUrl } });
  return content;
}

async function callOpenAI({ apiKey, model, question, contextText, imageUrl }){
  const payload = {
    model,
    messages: [
      { role: 'system', content: 'You are Thinkerbot inside the Thinkeringlabs portal. Be concise, reference the current page and image when relevant.' },
      { role: 'user', content: buildVisionMessage({ question, contextText, imageUrl }) }
    ]
  };
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` }, body: JSON.stringify(payload)
  });
  if(!res.ok){ throw new Error(`OpenAI ${res.status}`); }
  const j = await res.json();
  return j.choices?.[0]?.message?.content || '(no response)';
}

function demoReply(q, context){
  const where = context?.tab ? `on the ${context.tab} page` : 'here';
  const kw = (context?.profile?.keywords||[]).slice(0,3).join(', ');
  return `Demo answer (${where}). I see keywords: ${kw || '—'}. Ask anything specific and, with a real API key, I will analyze the current view.`;
}
