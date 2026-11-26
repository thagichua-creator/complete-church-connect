import React, { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, Bell, BookOpen, BriefcaseBusiness,
  CalendarDays, ChartNoAxesCombined, Check, ChevronDown, Church, Clock3,
  Download, Filter, GraduationCap, HeartHandshake, LayoutDashboard, Menu,
  MoreHorizontal, Plus, Search, Settings, ShieldCheck, Sparkles, Users,
  UserPlus, X, MapPin, CalendarCheck, FileBarChart,
} from "lucide-react";
import { Button } from "../components/Button";
import { Badge } from "../components/Badge";
import { Input } from "../components/Input";
import styles from "./_index.module.css";

type Section = "Overview" | "Members" | "Registration" | "Youth Connect" | "Ministries" | "Events" | "Reports" | "Settings";

const navItems: { label: Section; icon: React.ElementType; group: string }[] = [
  { label: "Overview", icon: LayoutDashboard, group: "WORKSPACE" },
  { label: "Members", icon: Users, group: "WORKSPACE" },
  { label: "Registration", icon: UserPlus, group: "WORKSPACE" },
  { label: "Youth Connect", icon: GraduationCap, group: "COMMUNITY" },
  { label: "Ministries", icon: Church, group: "COMMUNITY" },
  { label: "Events", icon: CalendarDays, group: "COMMUNITY" },
  { label: "Reports", icon: ChartNoAxesCombined, group: "INSIGHTS" },
  { label: "Settings", icon: Settings, group: "ADMINISTRATION" },
];

const members = [
  { name: "Grace Wanjiku", initials: "GW", id: "CCC-2024-0182", ministry: "Worship Team", joined: "12 Mar 2024", status: "Active", tone: "rose" },
  { name: "Daniel Mwangi", initials: "DM", id: "CCC-2023-0147", ministry: "Ushering", joined: "08 Nov 2023", status: "Active", tone: "blue" },
  { name: "Faith Njeri", initials: "FN", id: "CCC-2025-0208", ministry: "Youth Ministry", joined: "21 Jan 2025", status: "Active", tone: "gold" },
  { name: "Samuel Kiptoo", initials: "SK", id: "CCC-2022-0091", ministry: "Media Team", joined: "04 Jun 2022", status: "Pending", tone: "green" },
  { name: "Esther Achieng", initials: "EA", id: "CCC-2024-0195", ministry: "Children's Ministry", joined: "29 Aug 2024", status: "Active", tone: "violet" },
];

const events = [
  { day: "29", month: "NOV", title: "Sunday Worship Service", time: "9:00 AM – 12:00 PM", place: "Main Sanctuary", people: "Expected: 320" },
  { day: "03", month: "DEC", title: "Youth Connect Gathering", time: "2:00 PM – 5:00 PM", place: "Church Hall", people: "Expected: 85" },
  { day: "06", month: "DEC", title: "Community Outreach", time: "8:00 AM – 1:00 PM", place: "Kasarani Community", people: "Expected: 45" },
];

const statCards = [
  { label: "Total Members", value: "1,284", change: "+8.2%", note: "from last month", icon: Users, trend: "up" },
  { label: "Youth Members", value: "386", change: "+12.5%", note: "from last month", icon: GraduationCap, trend: "up" },
  { label: "Active Ministries", value: "12", change: "2 new", note: "this quarter", icon: HeartHandshake, trend: "up" },
  { label: "Upcoming Events", value: "08", change: "Next: Sunday", note: "29 November", icon: CalendarDays, trend: "neutral" },
];

function Overview({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return (
    <>
      <div className={styles.welcomeRow}>
        <div><div className={styles.eyebrow}>THURSDAY, 26 NOVEMBER 2026</div><h2>Good evening, Administrator</h2><p>Here’s what’s happening in your church community.</p></div>
        <Button onClick={() => onNavigate("Registration")}><Plus size={16} /> Add new member</Button>
      </div>
      <div className={styles.statsGrid}>
        {statCards.map((item) => {
          const Icon = item.icon;
          return <article className={styles.statCard} key={item.label}><div className={styles.statTop}><span>{item.label}</span><span className={styles.statIcon}><Icon size={18} /></span></div><div className={styles.statValue}>{item.value}</div><div className={styles.statFoot}><span className={item.trend === "up" ? styles.positive : styles.neutral}>{item.trend === "up" ? <ArrowUpRight size={14} /> : <CalendarCheck size={14} />}{item.change}</span><span>{item.note}</span></div></article>;
        })}
      </div>
      <div className={styles.contentGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><div><h3>Membership overview</h3><p>Member growth across the year</p></div><Button variant="outline" size="sm">This year <ChevronDown size={14} /></Button></div>
          <div className={styles.chartLegend}><span><i className={styles.legendNavy} /> Total members</span><span><i className={styles.legendGold} /> New members</span></div>
          <div className={styles.chartArea}>
            <div className={styles.yLabels}><span>1,400</span><span>1,000</span><span>600</span><span>200</span><span>0</span></div>
            <div className={styles.chartBars}>{[{m:"Jan",a:42,b:16},{m:"Feb",a:48,b:20},{m:"Mar",a:55,b:25},{m:"Apr",a:51,b:19},{m:"May",a:64,b:29},{m:"Jun",a:60,b:24},{m:"Jul",a:72,b:34},{m:"Aug",a:68,b:28},{m:"Sep",a:78,b:38},{m:"Oct",a:84,b:42},{m:"Nov",a:91,b:48},{m:"Dec",a:96,b:52}].map((v) => <div className={styles.barGroup} key={v.m}><div className={styles.bars}><i style={{ height: `${v.a}%` }} /><i style={{ height: `${v.b}%` }} /></div><span>{v.m}</span></div>)}</div>
          </div>
          <div className={styles.chartSummary}><div><strong>1,284</strong><span>Total registered members</span></div><div><strong>+104</strong><span>New members this year</span></div><div><strong>94.6%</strong><span>Active membership</span></div></div>
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}><div><h3>Community snapshot</h3><p>A quick look at your congregation</p></div><button className={styles.iconButton} aria-label="More options"><MoreHorizontal size={19} /></button></div>
          <div className={styles.snapshotTotal}><strong>1,284</strong><span>Registered members</span></div>
          <div className={styles.genderBar}><i /><i /><i /></div>
          <div className={styles.snapshotRows}><div><span><i className={styles.dotNavy} /> Men</span><strong>548 <small>42.7%</small></strong></div><div><span><i className={styles.dotGold} /> Women</span><strong>672 <small>52.3%</small></strong></div><div><span><i className={styles.dotGrey} /> Not specified</span><strong>64 <small>5.0%</small></strong></div></div>
          <div className={styles.snapshotDivider} />
          <div className={styles.miniHeading}>AGE GROUPS</div>
          {[{label:"Children (0–12)",n:"184",w:"14%"},{label:"Youth (13–35)",n:"386",w:"30%"},{label:"Adults (36–59)",n:"498",w:"39%"},{label:"Seniors (60+)",n:"216",w:"17%"}].map(x => <div className={styles.ageRow} key={x.label}><div><span>{x.label}</span><b>{x.n}</b></div><div className={styles.ageTrack}><i style={{width:x.w}} /></div></div>)}
        </section>
      </div>
      <div className={styles.bottomGrid}>
        <section className={styles.panel}>
          <div className={styles.panelHead}><div><h3>Recently registered</h3><p>Latest additions to your community</p></div><Button variant="ghost" size="sm" onClick={() => onNavigate("Members")}>View directory <ArrowUpRight size={14} /></Button></div>
          <MemberTable compact />
        </section>
        <section className={styles.panel}>
          <div className={styles.panelHead}><div><h3>Upcoming events</h3><p>What’s coming up next</p></div><Button variant="ghost" size="sm" onClick={() => onNavigate("Events")}>View calendar <ArrowUpRight size={14} /></Button></div>
          <div className={styles.eventList}>{events.slice(0,2).map((event) => <div className={styles.eventItem} key={event.title}><div className={styles.dateTile}><b>{event.day}</b><span>{event.month}</span></div><div className={styles.eventInfo}><strong>{event.title}</strong><span><Clock3 size={12} /> {event.time}</span><span><MapPin size={12} /> {event.place}</span></div></div>)}</div>
        </section>
      </div>
    </>
  );
}

function MemberTable({ compact = false, query = "" }: { compact?: boolean; query?: string }) {
  const filtered = members.filter(m => `${m.name} ${m.id} ${m.ministry}`.toLowerCase().includes(query.toLowerCase()));
  return <div className={styles.tableWrap}><table className={styles.memberTable}><thead><tr><th>MEMBER</th><th>MEMBERSHIP ID</th><th>MINISTRY</th><th>STATUS</th>{!compact && <th>JOINED</th>}</tr></thead><tbody>{filtered.map(m => <tr key={m.id}><td><div className={styles.memberCell}><span className={`${styles.avatar} ${styles[m.tone]}`}>{m.initials}</span><strong>{m.name}</strong></div></td><td className={styles.idCell}>{m.id}</td><td>{m.ministry}</td><td><Badge variant={m.status === "Active" ? "success" : "warning"}>{m.status}</Badge></td>{!compact && <td>{m.joined}</td>}</tr>)}</tbody></table>{filtered.length === 0 && <div className={styles.emptyState}>No members match your search.</div>}</div>;
}

function SectionContent({ section, onNavigate }: { section: Section; onNavigate: (section: Section) => void }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  if (section === "Overview") return <Overview onNavigate={onNavigate} />;
  if (section === "Members") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>CHURCH DIRECTORY</div><h2>Members</h2><p>Manage and find people in your church community.</p></div><Button onClick={() => onNavigate("Registration")}><Plus size={16}/> Register member</Button></div><div className={styles.toolbar}><div className={styles.searchBox}><Search size={16}/><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, ID or ministry..." /></div><Button variant="outline"><Filter size={15}/> Filters</Button><Button variant="outline"><Download size={15}/> Export</Button></div><section className={styles.panel}><div className={styles.panelHead}><div><h3>All members</h3><p>Showing {members.length} sample records · demo data</p></div><Badge variant="success">1,284 total</Badge></div><MemberTable query={query}/></section></>;
  if (section === "Registration") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>GROW YOUR COMMUNITY</div><h2>Member registration</h2><p>Add a new person to the church directory.</p></div><Badge variant="outline">DEMO FORM</Badge></div><div className={styles.formLayout}><div className={styles.panel}><div className={styles.formStep}><span className={styles.stepActive}>1</span><span>Personal details</span><i/><span className={styles.stepInactive}>2</span><span>Church details</span><i/><span className={styles.stepInactive}>3</span><span>Education & skills</span></div><form className={styles.registrationForm} onSubmit={e => {e.preventDefault();setSaved(true);}}><h3>Personal information</h3><p>Start with the member’s basic information.</p><div className={styles.formGrid}><label>First name<Input required placeholder="e.g. Grace" /></label><label>Last name<Input required placeholder="e.g. Wanjiku" /></label><label>Email address<Input type="email" placeholder="name@example.com" /></label><label>Phone number<Input placeholder="+254 7XX XXX XXX" /></label><label>Date of birth<Input type="date" /></label><label>Gender<select defaultValue=""><option value="" disabled>Select gender</option><option>Female</option><option>Male</option><option>Prefer not to say</option></select></label><label className={styles.fullField}>Residential area<Input placeholder="Estate, town or area" /></label></div><div className={styles.formActions}><span>Fields marked required must be completed.</span><Button type="submit">Save demo member <Check size={15}/></Button></div>{saved && <div className={styles.successNote}><Check size={16}/> Demo form submitted locally. No real member record has been saved.</div>}</form></div><aside className={styles.formAside}><div className={styles.asideIcon}><ShieldCheck size={22}/></div><h3>Member privacy matters</h3><p>Only collect details needed for church administration. Personal contact details and youth information should only be visible to authorized church leaders.</p><div className={styles.asideRule}/><span>Membership ID preview</span><strong>CCC-2026-0285</strong><small>Generated when connected to the database in Stage 2.</small></aside></div></>;
  if (section === "Youth Connect") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>NEXT GENERATION</div><h2>Youth Connect</h2><p>Support young people through learning, purpose and community.</p></div><Button onClick={() => setShowForm(v => !v)}><Plus size={16}/> {showForm ? "Close panel" : "Add youth profile"}</Button></div><div className={styles.statsGrid}>{[{label:"Youth members",value:"386",icon:Users},{label:"Education pathways",value:"142",icon:BookOpen},{label:"Career interests",value:"96",icon:BriefcaseBusiness},{label:"Mentorship groups",value:"08",icon:HeartHandshake}].map(x => {const Icon=x.icon;return <article className={styles.statCard} key={x.label}><div className={styles.statTop}><span>{x.label}</span><span className={styles.statIcon}><Icon size={18}/></span></div><div className={styles.statValue}>{x.value}</div><div className={styles.statFoot}><span className={styles.neutral}>Community overview</span></div></article>})}</div>{showForm && <div className={styles.panel}><h3>New youth profile</h3><p className={styles.panelSub}>This is a local demonstration panel. Youth profiles require appropriate consent and restricted access.</p><div className={styles.formGrid}><label>Member name<Input placeholder="Name"/></label><label>Age category<select><option>13–17</option><option>18–24</option><option>25–35</option></select></label></div></div>}<div className={styles.featureGrid}><article className={styles.featureCard}><div className={styles.featureIcon}><BookOpen/></div><h3>Education hub</h3><p>Learning pathways, study support and education opportunities.</p><Badge variant="outline">142 interests recorded</Badge></article><article className={styles.featureCard}><div className={styles.featureIcon}><BriefcaseBusiness/></div><h3>Career hub</h3><p>Explore career interests, skills and professional development.</p><Badge variant="outline">96 interests recorded</Badge></article><article className={styles.featureCard}><div className={styles.featureIcon}><HeartHandshake/></div><h3>Mentorship</h3><p>Structured guidance with approved, screened adult mentors.</p><Badge variant="success">Safeguarding first</Badge></article></div><div className={styles.notice}><ShieldCheck size={18}/><span>Youth privacy is a priority. The live system will restrict sensitive profiles and mentor access by role, with appropriate guardian consent where required.</span></div></>;
  if (section === "Ministries") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>SERVING TOGETHER</div><h2>Ministries & departments</h2><p>Coordinate teams, leaders and participation.</p></div><Button onClick={() => setShowForm(v => !v)}><Plus size={16}/> Add ministry</Button></div><div className={styles.featureGrid}>{[{name:"Worship Team",lead:"Grace Wanjiku",count:42,icon:Sparkles},{name:"Youth Ministry",lead:"Peter Maina",count:86,icon:GraduationCap},{name:"Ushering",lead:"Daniel Mwangi",count:28,icon:Users},{name:"Children's Ministry",lead:"Esther Achieng",count:34,icon:HeartHandshake},{name:"Media Team",lead:"Samuel Kiptoo",count:18,icon:Activity},{name:"Outreach",lead:"Mary Atieno",count:31,icon:Church}].map(m => {const Icon=m.icon;return <article className={styles.ministryCard} key={m.name}><div className={styles.featureIcon}><Icon/></div><div><h3>{m.name}</h3><p>Led by {m.lead}</p></div><strong>{m.count}<small> members</small></strong></article>})}</div>{showForm && <div className={styles.notice}><Check size={17}/> Ministry creation will be connected to the secure database in Stage 2.</div>}</>;
  if (section === "Events") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>CHURCH CALENDAR</div><h2>Events & attendance</h2><p>Plan gatherings and keep track of participation.</p></div><Button onClick={() => setShowForm(v => !v)}><Plus size={16}/> Create event</Button></div>{showForm && <div className={styles.panel}><h3>New event</h3><div className={styles.formGrid}><label>Event name<Input placeholder="Event title"/></label><label>Date<Input type="date"/></label><label>Start time<Input type="time"/></label><label>Location<Input placeholder="Venue"/></label></div><div className={styles.formActions}><span>Demo only · not saved</span><Button onClick={() => setShowForm(false)}>Close</Button></div></div>}<div className={styles.eventCards}>{events.map(e => <article className={styles.eventCard} key={e.title}><div className={styles.dateTile}><b>{e.day}</b><span>{e.month}</span></div><div className={styles.eventInfo}><Badge variant="outline">Upcoming</Badge><h3>{e.title}</h3><span><Clock3 size={13}/> {e.time}</span><span><MapPin size={13}/> {e.place}</span><small>{e.people}</small></div><button className={styles.iconButton} aria-label="Event options"><MoreHorizontal/></button></article>)}</div></>;
  if (section === "Reports") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>CHURCH INSIGHTS</div><h2>Reports & analytics</h2><p>Understand membership trends and community engagement.</p></div><Button variant="outline"><Download size={15}/> Export report</Button></div><div className={styles.statsGrid}>{[{label:"Membership growth",value:"8.2%",icon:ArrowUpRight},{label:"Active participation",value:"94.6%",icon:Activity},{label:"Youth engagement",value:"76.4%",icon:GraduationCap},{label:"Ministry involvement",value:"68.1%",icon:HeartHandshake}].map(x => {const Icon=x.icon;return <article className={styles.statCard} key={x.label}><div className={styles.statTop}><span>{x.label}</span><span className={styles.statIcon}><Icon size={18}/></span></div><div className={styles.statValue}>{x.value}</div><div className={styles.statFoot}><span className={styles.neutral}>Sample analytics</span></div></article>})}</div><div className={styles.featureGrid}><article className={styles.featureCard}><FileBarChart/><h3>Membership report</h3><p>Registration, status and demographic summaries.</p><Badge variant="outline">Preview available</Badge></article><article className={styles.featureCard}><CalendarCheck/><h3>Attendance report</h3><p>Event attendance and participation trends.</p><Badge variant="outline">Preview available</Badge></article><article className={styles.featureCard}><GraduationCap/><h3>Youth report</h3><p>Education, skills and youth engagement summaries.</p><Badge variant="outline">Restricted access</Badge></article></div><div className={styles.notice}><Activity size={17}/> All figures shown are fictional demonstration data. PDF and Excel exports will be implemented after database integration.</div></>;
  return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>WORKSPACE PREFERENCES</div><h2>Settings</h2><p>Manage church information and access preferences.</p></div></div><div className={styles.settingsGrid}><section className={styles.panel}><h3>Church profile</h3><p className={styles.panelSub}>Basic information for your church workspace.</p><label>Church name<Input defaultValue="Complete Church Connect"/></label><label>Primary branch<Input defaultValue="Main Branch"/></label><label>Tagline<Input defaultValue="One Church. One Community. One Connected Platform."/></label><Button onClick={() => setSaved(true)}>Save demo settings</Button>{saved && <div className={styles.successNote}><Check size={15}/> Settings updated locally for this preview.</div>}</section><section className={styles.panel}><h3>Roles & access</h3><p className={styles.panelSub}>Example access roles for the platform.</p>{["Super administrator","Church administrator","Pastor / church leadership","Youth coordinator","Ministry leader","Church member"].map((r,i)=><div className={styles.roleRow} key={r}><span>{r}</span><Badge variant={i<2?"success":"outline"}>{i<2?"Admin access":"Role-based"}</Badge></div>)}</section></div><div className={styles.notice}><ShieldCheck size={17}/> Secure sign-in, backend-enforced permissions, audit logs and database backups are planned for Stage 2. Do not enter real member information into this demo.</div></>;
}

export default function HomePage() {
  const [active, setActive] = useState<Section>("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const pageTitle = useMemo(() => active === "Overview" ? "Dashboard overview" : active, [active]);
  const navigate = (section: Section) => { setActive(section); setMobileOpen(false); };
  return <div className={styles.appShell}>
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.brand}><div className={styles.brandMark}><Church size={22}/></div><div><strong>CHURCH CONNECT</strong><span>COMMUNITY PLATFORM</span></div><button className={styles.closeSidebar} onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18}/></button></div>
      <div className={styles.branchPicker}><span className={styles.branchIcon}><Church size={16}/></span><div><small>YOUR CHURCH</small><strong>Complete Church</strong></div><ChevronDown size={15}/></div>
      {(["WORKSPACE","COMMUNITY","INSIGHTS","ADMINISTRATION"] as const).map(group => <div className={styles.navGroup} key={group}><div className={styles.navLabel}>{group}</div>{navItems.filter(item => item.group === group).map(item => {const Icon=item.icon;return <button key={item.label} className={`${styles.navItem} ${active === item.label ? styles.navActive : ""}`} onClick={() => navigate(item.label)}><Icon size={18}/><span>{item.label}</span>{item.label === "Events" && <i>3</i>}</button>})}</div>)}
      <div className={styles.sidebarBottom}><div className={styles.helpCard}><div className={styles.helpIcon}><Sparkles size={16}/></div><strong>Need a hand?</strong><p>Find guidance for managing your church community.</p><button onClick={() => navigate("Settings")}>Explore help <ArrowUpRight size={13}/></button></div><div className={styles.profileRow}><div className={styles.profileAvatar}>AD</div><div><strong>Administrator</strong><span>Church Admin</span></div><MoreHorizontal size={18}/></div></div>
    </aside>
    {mobileOpen && <button className={styles.scrim} onClick={() => setMobileOpen(false)} aria-label="Close navigation"/>}
    <main className={styles.mainArea}>
      <header className={styles.topbar}><div className={styles.topbarLeft}><button className={styles.mobileMenu} onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu/></button><span className={styles.breadcrumb}>Workspace</span><span className={styles.crumbSlash}>/</span><strong>{pageTitle}</strong></div><div className={styles.topbarRight}><div className={styles.globalSearch}><Search size={16}/><input value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Search anything..."/><kbd>⌘ K</kbd></div><button className={styles.notificationButton} aria-label="Notifications"><Bell size={18}/><i/></button><div className={styles.topAvatar}>AD</div></div></header>
      <div className={styles.pageContent}><SectionContent key={active} section={active} onNavigate={navigate}/><footer className={styles.footer}><span>© 2026 Complete Church Connect</span><span><i/> Demo workspace · Stage 1 preview</span></footer></div>
    </main>
  </div>;
}