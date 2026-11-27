import React, { useEffect, useMemo, useState } from "react";
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
import { getMembers } from "../endpoints/members_GET.schema";
import { postMember } from "../endpoints/members_POST.schema";
import { updateMember } from "../endpoints/members_update_POST.schema";
import { archiveMember } from "../endpoints/members_archive_POST.schema";
import { getMinistries, type MinistryItem } from "../endpoints/ministries_GET.schema";
import { postMinistry } from "../endpoints/ministries_POST.schema";
import { useAuth } from "../helpers/useAuth";
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

const splitCommaList = (value: FormDataEntryValue | null) => String(value ?? "").split(",").map(item => item.trim()).filter(Boolean).slice(0, 20);

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

function MemberTable({ compact = false, query = "", records = members, onEdit, onArchive }: { compact?: boolean; query?: string; records?: typeof members; onEdit?: (member: typeof members[number]) => void; onArchive?: (member: typeof members[number]) => void }) {
  const filtered = records.filter(m => `${m.name} ${m.id} ${m.ministry}`.toLowerCase().includes(query.toLowerCase()));
  return <div className={styles.tableWrap}><table className={styles.memberTable}><thead><tr><th>MEMBER</th><th>MEMBERSHIP ID</th><th>MINISTRY</th><th>STATUS</th>{!compact && <th>JOINED</th>}{!compact && onEdit && <th>ACTIONS</th>}</tr></thead><tbody>{filtered.map(m => <tr key={m.id}><td><div className={styles.memberCell}><span className={`${styles.avatar} ${styles[m.tone]}`}>{m.initials}</span><strong>{m.name}</strong></div></td><td className={styles.idCell}>{m.id}</td><td>{m.ministry}</td><td><Badge variant={m.status === "Active" ? "success" : "warning"}>{m.status}</Badge></td>{!compact && <td>{m.joined}</td>}{!compact && onEdit && <td><div className={styles.rowActions}><button type="button" onClick={() => onEdit(m)}>Edit</button>{onArchive && <button type="button" onClick={() => onArchive(m)}>Archive</button>}</div></td>}</tr>)}</tbody></table>{filtered.length === 0 && <div className={styles.emptyState}>No members match your search.</div>}</div>;
}

function SectionContent({ section, onNavigate }: { section: Section; onNavigate: (section: Section) => void }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [serverMembers, setServerMembers] = useState<typeof members>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdMembershipNo, setCreatedMembershipNo] = useState<string | null>(null);
  const [memberActionError, setMemberActionError] = useState<string | null>(null);
  const [ministryRecords, setMinistryRecords] = useState<MinistryItem[]>([]);
  const [ministryError, setMinistryError] = useState<string | null>(null);
  const [savingMinistry, setSavingMinistry] = useState(false);
  useEffect(() => {
    if (section !== "Members") return;
    setMembersLoading(true);
    setMembersError(null);
    getMembers().then(result => {
      if ("members" in result) {
        setServerMembers(result.members.map((m, i) => ({
          name: `${m.firstName} ${m.lastName}`,
          initials: `${m.firstName[0] ?? ""}${m.lastName[0] ?? ""}`.toUpperCase(),
          id: m.membershipNo,
          ministry: m.ministryNames.join(", ") || "Not assigned",
          joined: new Date(m.joinedOn).toLocaleDateString(),
          status: m.membershipStatus === "active" ? "Active" : m.membershipStatus === "pending" ? "Pending" : "Inactive",
          tone: ["rose", "blue", "gold", "green", "violet"][i % 5],
        })));
      }
    }).catch(err => setMembersError(err instanceof Error ? err.message : "Could not load members."))
      .finally(() => setMembersLoading(false));
  }, [section]);
  useEffect(() => {
    if (section !== "Ministries") return;
    getMinistries().then(result => { if ("ministries" in result) setMinistryRecords(result.ministries); })
      .catch(error => setMinistryError(error instanceof Error ? error.message : "Could not load ministries."));
  }, [section]);
  const editDirectoryMember = async (member: typeof members[number]) => {
    const firstName = window.prompt("Update first name:", member.name.split(" ")[0]);
    if (firstName === null) return;
    const lastName = window.prompt("Update last name:", member.name.split(" ").slice(1).join(" "));
    if (lastName === null) return;
    const statusChoice = window.prompt("Membership status: active, pending, or inactive", member.status.toLowerCase());
    if (statusChoice === null) return;
    const status = statusChoice.trim().toLowerCase();
    if (!["active", "pending", "inactive"].includes(status)) { setMemberActionError("Status must be active, pending, or inactive."); return; }
    try {
      await updateMember({ membershipNo: member.id, firstName, lastName, membershipStatus: status as "active" | "pending" | "inactive" });
      setServerMembers(rows => rows.map(row => row.id === member.id ? { ...row, name: `${firstName} ${lastName}`, initials: `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase(), status: status === "active" ? "Active" : status === "pending" ? "Pending" : "Inactive" } : row));
      setMemberActionError(null);
    } catch (error) { setMemberActionError(error instanceof Error ? error.message : "Could not update member."); }
  };
  const archiveDirectoryMember = async (member: typeof members[number]) => {
    if (!window.confirm(`Archive ${member.name}? They will be removed from the active directory but their record will be retained for audit purposes.`)) return;
    try {
      await archiveMember({ membershipNo: member.id });
      setServerMembers(rows => rows.filter(row => row.id !== member.id));
      setMemberActionError(null);
    } catch (error) { setMemberActionError(error instanceof Error ? error.message : "Could not archive member."); }
  };
  if (section === "Overview") return <Overview onNavigate={onNavigate} />;
  if (section === "Members") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>CHURCH DIRECTORY</div><h2>Members</h2><p>Manage and find people in your church community.</p></div><Button onClick={() => onNavigate("Registration")}><Plus size={16}/> Register member</Button></div><div className={styles.toolbar}><div className={styles.searchBox}><Search size={16}/><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by name, ID or ministry..." /></div></div><section className={styles.panel}><div className={styles.panelHead}><div><h3>All members</h3><p>{membersLoading ? "Loading member records…" : `${serverMembers.length} member record${serverMembers.length === 1 ? "" : "s"} in this branch`}</p></div><Badge variant="outline">Live directory</Badge></div>{membersLoading && <div className={styles.emptyState}>Loading secure member records…</div>}{membersError && <div className={styles.errorNote}>{membersError}</div>}{memberActionError && <div className={styles.errorNote}>{memberActionError}</div>}<MemberTable query={query} records={serverMembers} onEdit={editDirectoryMember} onArchive={archiveDirectoryMember}/></section></>;
  if (section === "Registration") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>GROW YOUR COMMUNITY</div><h2>Member registration</h2><p>Add a new person to the church directory.</p></div><Badge variant="success">SECURE DATABASE</Badge></div><div className={styles.formLayout}><div className={styles.panel}><div className={styles.formStep}><span className={styles.stepActive}>1</span><span>Personal details</span><i/><span className={styles.stepInactive}>2</span><span>Church details</span><i/><span className={styles.stepInactive}>3</span><span>Education & skills</span></div><form className={styles.registrationForm} onSubmit={async e => {e.preventDefault();const formElement=e.currentTarget;setSavingMember(true);setFormError(null);setCreatedMembershipNo(null);const fd=new FormData(e.currentTarget);const ageValue=String(fd.get("ageYears") ?? "").trim();try{const result=await postMember({firstName:String(fd.get("firstName") ?? ""),lastName:String(fd.get("lastName") ?? ""),ageYears:ageValue ? Number(ageValue) : undefined,gender:(String(fd.get("gender") ?? "") || undefined) as "female"|"male"|"non_binary"|"prefer_not_to_say"|undefined,maritalStatus:(String(fd.get("maritalStatus") ?? "") || undefined) as "single"|"married"|"widowed"|"divorced"|"separated"|"prefer_not_to_say"|undefined,email:String(fd.get("email") ?? ""),phone:String(fd.get("phone") ?? ""),residentialArea:String(fd.get("residentialArea") ?? ""),educationLevel:String(fd.get("educationLevel") ?? ""),profession:String(fd.get("profession") ?? ""),areaOfStudy:String(fd.get("areaOfStudy") ?? ""),course:String(fd.get("course") ?? ""),institution:String(fd.get("institution") ?? ""),employmentStatus:String(fd.get("employmentStatus") ?? ""),skills:splitCommaList(fd.get("skills")),educationInterests:splitCommaList(fd.get("educationInterests")),talents:splitCommaList(fd.get("talents")),careerInterests:splitCommaList(fd.get("careerInterests")),contactConsent:fd.get("contactConsent")==="on",guardianConsentStatus:(String(fd.get("guardianConsentStatus") ?? "") || undefined) as "pending"|"granted"|"declined"|undefined});if("member" in result){setCreatedMembershipNo(result.member.membershipNo);formElement.reset();}}catch(err){setFormError(err instanceof Error?err.message:"Could not register member.");}finally{setSavingMember(false);}}}><h3>Personal information</h3><p>Enter the minimum information needed to add a member.</p><div className={styles.formGrid}><label>First name<Input name="firstName" required placeholder="e.g. Grace" /></label><label>Last name<Input name="lastName" required placeholder="e.g. Wanjiku" /></label><label>Age<Input name="ageYears" type="number" min="0" max="120" placeholder="Age in years" /></label><label>Gender<select name="gender" defaultValue=""><option value="">Prefer not to say</option><option value="female">Female</option><option value="male">Male</option><option value="non_binary">Non-binary</option><option value="prefer_not_to_say">Prefer not to say</option></select></label><label>Email address<Input name="email" type="email" placeholder="name@example.com" /></label><label>Phone number<Input name="phone" placeholder="+254 7XX XXX XXX" /></label><label>Marital status<select name="maritalStatus" defaultValue=""><option value="">Not specified</option><option value="single">Single</option><option value="married">Married</option><option value="widowed">Widowed</option><option value="divorced">Divorced</option><option value="separated">Separated</option><option value="prefer_not_to_say">Prefer not to say</option></select></label><label>Guardian consent status (admin verified if under 18)<select name="guardianConsentStatus" defaultValue="pending"><option value="pending">Pending</option><option value="granted">Granted</option><option value="declined">Declined</option></select></label><label className={styles.fullField}>Residential area<Input name="residentialArea" placeholder="Estate, town or area (optional)" /></label><label>Education level<Input name="educationLevel" placeholder="e.g. Secondary, diploma, degree" /></label><label>Profession / occupation<Input name="profession" placeholder="Optional" /></label><label>Area of study<Input name="areaOfStudy" placeholder="Optional" /></label><label>Course / programme<Input name="course" placeholder="Optional" /></label><label>Institution<Input name="institution" placeholder="Optional" /></label><label>Employment status<Input name="employmentStatus" placeholder="Optional" /></label><label className={styles.fullField}>Skills (comma-separated)<Input name="skills" placeholder="e.g. Music, teaching, IT" /></label><label className={styles.fullField}>Education interests (comma-separated)<Input name="educationInterests" placeholder="Optional; youth details require verified guardian consent for minors" /></label><label className={styles.fullField}>Talents (comma-separated)<Input name="talents" placeholder="Optional" /></label><label className={styles.fullField}>Career interests (comma-separated)<Input name="careerInterests" placeholder="Optional" /></label><label className={styles.fullField}><span className={styles.consentLine}><input type="checkbox" name="contactConsent"/> Member has agreed to be contacted using the details provided.</span></label></div><div className={styles.formActions}><span>Only authorized church administrators can save records.</span><Button type="submit" disabled={savingMember}>{savingMember?"Saving securely…":"Register member"} <Check size={15}/></Button></div>{formError && <div className={styles.errorNote}>{formError}</div>}{createdMembershipNo && <div className={styles.successNote}><Check size={16}/> Member registered successfully. Membership ID: <strong>{createdMembershipNo}</strong> <Button size="sm" variant="outline" onClick={() => onNavigate("Members")}>View directory</Button></div>}</form></div><aside className={styles.formAside}><div className={styles.asideIcon}><ShieldCheck size={22}/></div><h3>Member privacy matters</h3><p>Only collect details needed for church administration. Personal contact details and youth information should only be visible to authorized church leaders.</p><div className={styles.asideRule}/><span>Membership ID</span><strong>Generated automatically on registration</strong><small>A unique membership number is assigned when the record is saved.</small></aside></div></>;
  if (section === "Youth Connect") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>NEXT GENERATION</div><h2>Youth Connect</h2><p>Support young people through learning, purpose and community.</p></div><Button onClick={() => setShowForm(v => !v)}><Plus size={16}/> {showForm ? "Close panel" : "Add youth profile"}</Button></div><div className={styles.statsGrid}>{[{label:"Youth members",value:"386",icon:Users},{label:"Education pathways",value:"142",icon:BookOpen},{label:"Career interests",value:"96",icon:BriefcaseBusiness},{label:"Mentorship groups",value:"08",icon:HeartHandshake}].map(x => {const Icon=x.icon;return <article className={styles.statCard} key={x.label}><div className={styles.statTop}><span>{x.label}</span><span className={styles.statIcon}><Icon size={18}/></span></div><div className={styles.statValue}>{x.value}</div><div className={styles.statFoot}><span className={styles.neutral}>Community overview</span></div></article>})}</div>{showForm && <div className={styles.panel}><h3>New youth profile</h3><p className={styles.panelSub}>This is a local demonstration panel. Youth profiles require appropriate consent and restricted access.</p><div className={styles.formGrid}><label>Member name<Input placeholder="Name"/></label><label>Age category<select><option>13–17</option><option>18–24</option><option>25–35</option></select></label></div></div>}<div className={styles.featureGrid}><article className={styles.featureCard}><div className={styles.featureIcon}><BookOpen/></div><h3>Education hub</h3><p>Learning pathways, study support and education opportunities.</p><Badge variant="outline">142 interests recorded</Badge></article><article className={styles.featureCard}><div className={styles.featureIcon}><BriefcaseBusiness/></div><h3>Career hub</h3><p>Explore career interests, skills and professional development.</p><Badge variant="outline">96 interests recorded</Badge></article><article className={styles.featureCard}><div className={styles.featureIcon}><HeartHandshake/></div><h3>Mentorship</h3><p>Structured guidance with approved, screened adult mentors.</p><Badge variant="success">Safeguarding first</Badge></article></div><div className={styles.notice}><ShieldCheck size={18}/><span>Youth privacy is a priority. The live system will restrict sensitive profiles and mentor access by role, with appropriate guardian consent where required.</span></div></>;
  if (section === "Ministries") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>SERVING TOGETHER</div><h2>Ministries & departments</h2><p>Manage teams and participation in your branch.</p></div><Button onClick={() => setShowForm(v => !v)}><Plus size={16}/> {showForm ? "Close form" : "Add ministry"}</Button></div>{showForm && <form className={styles.panel} onSubmit={async e => {e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);setSavingMinistry(true);setMinistryError(null);try{const result=await postMinistry({name:String(fd.get("name") ?? ""),description:String(fd.get("description") ?? "")});if("ministry" in result){setMinistryRecords(rows=>[...rows,{...result.ministry,leaderFirstName:null,leaderLastName:null,memberCount:0}]);form.reset();setShowForm(false);}}catch(error){setMinistryError(error instanceof Error?error.message:"Could not create ministry.");}finally{setSavingMinistry(false);}}}><h3>New ministry</h3><div className={styles.formGrid}><label>Ministry name<Input name="name" required maxLength={100} placeholder="e.g. Worship Team"/></label><label>Description<Input name="description" maxLength={500} placeholder="Purpose or ministry focus (optional)"/></label></div><div className={styles.formActions}><span>Only authorized church leaders can create ministries.</span><Button type="submit" disabled={savingMinistry}>{savingMinistry?"Saving…":"Save ministry"}</Button></div></form>}{ministryError && <div className={styles.errorNote}>{ministryError}</div>}{ministryRecords.length===0 ? <div className={styles.panel}><div className={styles.emptyState}>No ministries have been added to this branch yet.</div></div> : <div className={styles.featureGrid}>{ministryRecords.map(m=><article className={styles.ministryCard} key={m.id}><div className={styles.featureIcon}><Church/></div><div><h3>{m.name}</h3><p>{m.description || (m.leaderFirstName ? `Led by ${m.leaderFirstName} ${m.leaderLastName ?? ""}` : "No ministry leader assigned")}</p></div><strong>{m.memberCount}<small> members</small></strong><Badge variant={m.isActive?"success":"outline"}>{m.isActive?"Active":"Inactive"}</Badge></article>)}</div>}</>;
  if (section === "Events") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>CHURCH CALENDAR</div><h2>Events & attendance</h2><p>Plan gatherings and keep track of participation.</p></div><Button onClick={() => setShowForm(v => !v)}><Plus size={16}/> Create event</Button></div>{showForm && <div className={styles.panel}><h3>New event</h3><div className={styles.formGrid}><label>Event name<Input placeholder="Event title"/></label><label>Date<Input type="date"/></label><label>Start time<Input type="time"/></label><label>Location<Input placeholder="Venue"/></label></div><div className={styles.formActions}><span>Demo only · not saved</span><Button onClick={() => setShowForm(false)}>Close</Button></div></div>}<div className={styles.eventCards}>{events.map(e => <article className={styles.eventCard} key={e.title}><div className={styles.dateTile}><b>{e.day}</b><span>{e.month}</span></div><div className={styles.eventInfo}><Badge variant="outline">Upcoming</Badge><h3>{e.title}</h3><span><Clock3 size={13}/> {e.time}</span><span><MapPin size={13}/> {e.place}</span><small>{e.people}</small></div><button className={styles.iconButton} aria-label="Event options"><MoreHorizontal/></button></article>)}</div></>;
  if (section === "Reports") return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>CHURCH INSIGHTS</div><h2>Reports & analytics</h2><p>Understand membership trends and community engagement.</p></div><Button variant="outline"><Download size={15}/> Export report</Button></div><div className={styles.statsGrid}>{[{label:"Membership growth",value:"8.2%",icon:ArrowUpRight},{label:"Active participation",value:"94.6%",icon:Activity},{label:"Youth engagement",value:"76.4%",icon:GraduationCap},{label:"Ministry involvement",value:"68.1%",icon:HeartHandshake}].map(x => {const Icon=x.icon;return <article className={styles.statCard} key={x.label}><div className={styles.statTop}><span>{x.label}</span><span className={styles.statIcon}><Icon size={18}/></span></div><div className={styles.statValue}>{x.value}</div><div className={styles.statFoot}><span className={styles.neutral}>Sample analytics</span></div></article>})}</div><div className={styles.featureGrid}><article className={styles.featureCard}><FileBarChart/><h3>Membership report</h3><p>Registration, status and demographic summaries.</p><Badge variant="outline">Preview available</Badge></article><article className={styles.featureCard}><CalendarCheck/><h3>Attendance report</h3><p>Event attendance and participation trends.</p><Badge variant="outline">Preview available</Badge></article><article className={styles.featureCard}><GraduationCap/><h3>Youth report</h3><p>Education, skills and youth engagement summaries.</p><Badge variant="outline">Restricted access</Badge></article></div><div className={styles.notice}><Activity size={17}/> All figures shown are fictional demonstration data. PDF and Excel exports will be implemented after database integration.</div></>;
  return <><div className={styles.sectionIntro}><div><div className={styles.eyebrow}>WORKSPACE PREFERENCES</div><h2>Settings</h2><p>Manage church information and access preferences.</p></div></div><div className={styles.settingsGrid}><section className={styles.panel}><h3>Church profile</h3><p className={styles.panelSub}>Basic information for your church workspace.</p><label>Church name<Input defaultValue="Complete Church Connect"/></label><label>Primary branch<Input defaultValue="Main Branch"/></label><label>Tagline<Input defaultValue="One Church. One Community. One Connected Platform."/></label><Button onClick={() => setSaved(true)}>Save demo settings</Button>{saved && <div className={styles.successNote}><Check size={15}/> Settings updated locally for this preview.</div>}</section><section className={styles.panel}><h3>Roles & access</h3><p className={styles.panelSub}>Example access roles for the platform.</p>{["Super administrator","Church administrator","Pastor / church leadership","Youth coordinator","Ministry leader","Church member"].map((r,i)=><div className={styles.roleRow} key={r}><span>{r}</span><Badge variant={i<2?"success":"outline"}>{i<2?"Admin access":"Role-based"}</Badge></div>)}</section></div><div className={styles.notice}><ShieldCheck size={17}/> Secure sign-in, backend-enforced permissions, audit logs and database backups are planned for Stage 2. Do not enter real member information into this demo.</div></>;
}

export default function HomePage() {
  const [active, setActive] = useState<Section>("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const { authState, logout } = useAuth();
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
      <header className={styles.topbar}><div className={styles.topbarLeft}><button className={styles.mobileMenu} onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu/></button><span className={styles.breadcrumb}>Workspace</span><span className={styles.crumbSlash}>/</span><strong>{pageTitle}</strong></div><div className={styles.topbarRight}><div className={styles.globalSearch}><Search size={16}/><input value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} placeholder="Search anything..."/><kbd>⌘ K</kbd></div><button className={styles.notificationButton} aria-label="Notifications"><Bell size={18}/><i/></button><div className={styles.topAvatar}>AD</div>{authState.type === "authenticated" ? <button className={styles.authAction} onClick={() => void logout()}>Sign out</button> : <a className={styles.authAction} href="/login">Sign in</a>}</div></header>
      <div className={styles.pageContent}><SectionContent key={active} section={active} onNavigate={navigate}/><footer className={styles.footer}><span>© 2026 Complete Church Connect</span><span><i/> Demo workspace · Stage 1 preview</span></footer></div>
    </main>
  </div>;
}
