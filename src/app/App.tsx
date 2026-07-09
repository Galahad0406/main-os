import { useState, useEffect, useRef } from "react"
import {
  LayoutDashboard, Users, CalendarCheck, CreditCard, Award,
  UserCircle, Calendar, FileText, Megaphone, Bell, BarChart2,
  Search, ChevronLeft, ChevronRight, X, Menu, ExternalLink,
  GripVertical, AlertCircle
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  student_code: string; name: string; dob: string;
  category: string; belt: string; attendance_status: string; payment_status: string;
}

interface Widget { id: string; title: string; type: "empty" | "active"; targetMenu: string; }

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_MEMBERS: Member[] = [
  { student_code: "S001", name: "Emma Johnson",   dob: "2015-03-12", category: "AfterSchool", belt: "Yellow", attendance_status: "Present", payment_status: "Paid" },
  { student_code: "S002", name: "Liam Chen",      dob: "2014-07-24", category: "Regular",     belt: "Green",  attendance_status: "Absent",  payment_status: "Unpaid" },
  { student_code: "S003", name: "Sophia Kim",     dob: "2016-11-05", category: "AfterSchool", belt: "White",  attendance_status: "Present", payment_status: "Paid" },
  { student_code: "S004", name: "Noah Martinez",  dob: "2013-08-19", category: "Regular",     belt: "Blue",   attendance_status: "Present", payment_status: "Unpaid" },
  { student_code: "S005", name: "Ava Thompson",   dob: "2015-01-30", category: "AfterSchool", belt: "Orange", attendance_status: "Absent",  payment_status: "Paid" },
  { student_code: "S006", name: "James Park",     dob: "2014-05-22", category: "Regular",     belt: "Red",    attendance_status: "Present", payment_status: "Paid" },
  { student_code: "S007", name: "Mia Anderson",   dob: "2016-09-14", category: "AfterSchool", belt: "Yellow", attendance_status: "Present", payment_status: "Paid" },
  { student_code: "S008", name: "Lucas Wilson",   dob: "2013-12-08", category: "Regular",     belt: "Black",  attendance_status: "Absent",  payment_status: "Unpaid" },
  { student_code: "S009", name: "Isabella Lee",   dob: "2015-06-17", category: "AfterSchool", belt: "Green",  attendance_status: "Present", payment_status: "Paid" },
  { student_code: "S010", name: "Ethan Brown",    dob: "2014-02-28", category: "Regular",     belt: "Blue",   attendance_status: "Present", payment_status: "Unpaid" },
];

// ─── Menu Config ─────────────────────────────────────────────────────────────

const MENUS = [
  { name: "Dashboard",          icon: LayoutDashboard },
  { name: "Student Roster",     icon: Users },
  { name: "Attendance",         icon: CalendarCheck },
  { name: "Tuition & Fees",     icon: CreditCard },
  { name: "Belt Promotion",     icon: Award },
  { name: "Student Profile",    icon: UserCircle },
  { name: "Class Schedule",     icon: Calendar },
  { name: "Consultation Logs",  icon: FileText },
  { name: "Announcements",      icon: Megaphone },
  { name: "Notifications",      icon: Bell },
  { name: "Reports",            icon: BarChart2 },
  { name: "Search",             icon: Search },
];

const BELT_COLORS: Record<string, string> = {
  White: "bg-gray-100 text-gray-600",
  Yellow: "bg-yellow-100 text-yellow-700",
  Orange: "bg-orange-100 text-orange-700",
  Green: "bg-green-100 text-green-700",
  Blue: "bg-blue-100 text-blue-700",
  Red: "bg-red-100 text-red-700",
  Black: "bg-gray-800 text-white",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, color, active, onClick }: {
  label: string; value: string | number; color: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-5 rounded-2xl border transition-all ${
        active ? `${color} border-transparent shadow-sm` : "bg-white border-black/5 hover:border-black/10"
      }`}
    >
      <p className="text-[13px] font-medium text-[#6E6E73] mb-2">{label}</p>
      <p className={`text-[32px] font-bold tracking-tight leading-none ${active ? "" : "text-[#1D1D1F]"}`}>
        {value}
      </p>
    </button>
  );
}

function Badge({ children, variant }: { children: React.ReactNode; variant: "blue" | "orange" | "green" | "red" | "gray" }) {
  const styles = {
    blue:   "bg-[#EBF5FF] text-[#0071E3]",
    orange: "bg-orange-50 text-orange-600",
    green:  "bg-[#F0FFF4] text-[#34C759]",
    red:    "bg-[#FFF1F0] text-[#FF3B30]",
    gray:   "bg-[#F5F5F7] text-[#6E6E73]",
  }[variant];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${styles}`}>
      {children}
    </span>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider px-1 mb-3">{children}</p>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function AppleCalendar({
  currentDate, selectedDateStr, calendarEvents,
  onPrev, onNext, onSelectDate,
}: {
  currentDate: Date; selectedDateStr: string;
  calendarEvents: Record<string, string>;
  onPrev: () => void; onNext: () => void; onSelectDate: (s: string) => void;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = new Date().toISOString().split("T")[0];

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-[#1D1D1F]">
          {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
        </h3>
        <div className="flex gap-1">
          <button onClick={onPrev} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F5F5F7] hover:bg-[#EBEBF0] transition-colors">
            <ChevronLeft className="w-3.5 h-3.5 text-[#1D1D1F]" />
          </button>
          <button onClick={onNext} className="w-7 h-7 flex items-center justify-center rounded-lg bg-[#F5F5F7] hover:bg-[#EBEBF0] transition-colors">
            <ChevronRight className="w-3.5 h-3.5 text-[#1D1D1F]" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 text-center mb-1">
        {DAY_LABELS.map((d, i) => (
          <span key={d} className={`text-[10px] font-semibold ${i === 0 ? "text-[#FF3B30]" : i === 6 ? "text-[#0071E3]" : "text-[#AEAEB2]"}`}>{d}</span>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {blanks.map((_, i) => <div key={`b${i}`} />)}
        {days.map(day => {
          const dayStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isSelected = selectedDateStr === dayStr;
          const isToday = todayStr === dayStr;
          const hasEvent = !!calendarEvents[dayStr];
          const isSun = new Date(year, month, day).getDay() === 0;
          const isSat = new Date(year, month, day).getDay() === 6;

          return (
            <button
              key={day}
              onClick={() => onSelectDate(dayStr)}
              className={`relative flex flex-col items-center justify-center aspect-square rounded-xl text-[13px] font-medium transition-all ${
                isSelected
                  ? "bg-[#0071E3] text-white font-semibold shadow-sm"
                  : isToday
                  ? "bg-[#F5F5F7] text-[#0071E3] font-semibold ring-1 ring-[#0071E3]/20"
                  : "hover:bg-[#F5F5F7] " + (isSun ? "text-[#FF3B30]" : isSat ? "text-[#0071E3]" : "text-[#1D1D1F]")
              }`}
            >
              {day}
              {hasEvent && !isSelected && (
                <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-[#0071E3]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Student Table ────────────────────────────────────────────────────────────

function StudentTable({ data }: { data: Member[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: keyof Member | null; dir: "asc" | "desc" }>({ key: null, dir: "asc" });

  const handleSort = (key: keyof Member) => {
    setSortConfig(prev => ({ key, dir: prev.key === key && prev.dir === "asc" ? "desc" : "asc" }));
  };

  const sorted = [...data]
    .filter(m =>
      !searchTerm ||
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.belt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;
      const av = String(a[sortConfig.key] || "").toLowerCase();
      const bv = String(b[sortConfig.key] || "").toLowerCase();
      return sortConfig.dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const SortIcon = ({ col }: { col: keyof Member }) => (
    <span className={`ml-1 text-[9px] ${sortConfig.key === col ? "text-[#0071E3]" : "text-[#C7C7CC]"}`}>
      {sortConfig.key === col ? (sortConfig.dir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  const COLS: { key: keyof Member; label: string; sortable?: boolean }[] = [
    { key: "name",             label: "Name",           sortable: true },
    { key: "dob",              label: "Date of Birth",  sortable: true },
    { key: "category",         label: "Category",       sortable: true },
    { key: "belt",             label: "Belt",           sortable: true },
    { key: "attendance_status",label: "Attendance",     sortable: true },
    { key: "payment_status",   label: "Tuition",        sortable: true },
  ];

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-black/[0.06] shadow-sm">
      <div className="px-4 py-3 border-b border-[#F2F2F7] flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xs bg-[#F5F5F7] rounded-xl px-3 py-2">
          <Search className="w-3.5 h-3.5 text-[#AEAEB2] flex-shrink-0" />
          <input
            type="text"
            placeholder="Search name, belt, category…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1 text-[13px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-transparent outline-none"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")}>
              <X className="w-3.5 h-3.5 text-[#AEAEB2]" />
            </button>
          )}
        </div>
        <span className="text-[12px] text-[#AEAEB2] ml-auto">{sorted.length} students · click column to sort</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#F2F2F7]">
              {COLS.map(c => (
                <th
                  key={c.key}
                  onClick={() => c.sortable && handleSort(c.key)}
                  className={`px-4 py-3 text-left text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider whitespace-nowrap ${c.sortable ? "cursor-pointer hover:text-[#1D1D1F] select-none" : ""}`}
                >
                  {c.label}{c.sortable && <SortIcon col={c.key} />}
                </th>
              ))}
              <th className="px-4 py-3 text-right text-[11px] font-semibold text-[#6E6E73] uppercase tracking-wider">Contract</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((m, i) => {
              const isPresent = ["present", "출석"].includes(String(m.attendance_status).toLowerCase());
              const isPaid    = ["paid", "완납"].includes(String(m.payment_status).toLowerCase());
              return (
                <tr key={m.student_code} className={`border-b border-[#F2F2F7] last:border-0 hover:bg-[#FAFAFA] transition-colors ${i % 2 === 0 ? "" : ""}`}>
                  <td className="px-4 py-3 text-[14px] font-semibold text-[#1D1D1F]">{m.name}</td>
                  <td className="px-4 py-3 text-[13px] text-[#6E6E73]">{m.dob}</td>
                  <td className="px-4 py-3">
                    <Badge variant={m.category === "AfterSchool" ? "orange" : "blue"}>{m.category}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${BELT_COLORS[m.belt] || "bg-gray-100 text-gray-600"}`}>
                      {m.belt}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isPresent ? "green" : "gray"}>{m.attendance_status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={isPaid ? "green" : "red"}>{m.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => alert(`Opening agreement for: ${m.name}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5F5F7] hover:bg-[#EBEBF0] text-[12px] font-medium text-[#1D1D1F] transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <div className="py-12 text-center text-[14px] text-[#AEAEB2]">No students match your search</div>
        )}
      </div>
    </div>
  );
}

// ─── Placeholder Page ─────────────────────────────────────────────────────────

function PlaceholderPage({ name }: { name: string }) {
  const menuObj = MENUS.find(m => m.name === name);
  const Icon = menuObj?.icon ?? LayoutDashboard;
  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-24">
      <div className="w-16 h-16 rounded-2xl bg-[#EBF5FF] flex items-center justify-center mb-5">
        <Icon className="w-7 h-7 text-[#0071E3]" />
      </div>
      <h2 className="text-[20px] font-semibold text-[#1D1D1F] mb-2">{name}</h2>
      <p className="text-[15px] text-[#6E6E73] max-w-xs">
        This module is ready for implementation and connected to the dashboard shortcut system.
      </p>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState("All");
  const [stats, setStats] = useState({ todayAttendance: 0, totalStudents: 0, unpaidCount: 0 });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split("T")[0]);
  const [calendarEvents, setCalendarEvents] = useState<Record<string, string>>({
    "2026-07-02": "Promotion Test & Parents Day",
    "2026-07-15": "Mid-month Tuition Settling",
  });
  const [memoInput, setMemoInput] = useState("");

  const [widgets, setWidgets] = useState<Widget[]>([
    { id: "slot-1", title: "Empty Slot", type: "empty", targetMenu: "" },
    { id: "slot-2", title: "Empty Slot", type: "empty", targetMenu: "" },
    { id: "slot-3", title: "Empty Slot", type: "empty", targetMenu: "" },
  ]);

  const dragItem = useRef<string | null>(null);

  // Load mock data
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setMembers(MOCK_MEMBERS);
      setFilteredMembers(MOCK_MEMBERS);
      const presentCount = MOCK_MEMBERS.filter(m => ["present", "출석"].includes(m.attendance_status.toLowerCase())).length;
      const unpaidCount = MOCK_MEMBERS.filter(m => ["unpaid", "미납"].includes(m.payment_status.toLowerCase())).length;
      setStats({ totalStudents: MOCK_MEMBERS.length, todayAttendance: presentCount, unpaidCount });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeMenu]);

  useEffect(() => {
    setMemoInput(calendarEvents[selectedDateStr] || "");
  }, [selectedDateStr, calendarEvents]);

  const handleCardClick = (type: string) => {
    setCurrentFilter(type);
    if (type === "Present") {
      setFilteredMembers(members.filter(m => ["present", "출석"].includes(m.attendance_status.toLowerCase())));
    } else if (type === "Unpaid") {
      setFilteredMembers(members.filter(m => ["unpaid", "미납"].includes(m.payment_status.toLowerCase())));
    } else {
      setFilteredMembers(members);
    }
  };

  const saveMemo = () => {
    setCalendarEvents(prev => ({ ...prev, [selectedDateStr]: memoInput }));
  };

  const deleteMemo = () => {
    const updated = { ...calendarEvents };
    delete updated[selectedDateStr];
    setCalendarEvents(updated);
    setMemoInput("");
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const menu = e.dataTransfer.getData("text/plain");
    if (!menu) return;
    setWidgets(prev => prev.map(w => w.id === slotId ? { ...w, title: menu, type: "active", targetMenu: menu } : w));
  };

  const clearSlot = (e: React.MouseEvent, slotId: string) => {
    e.stopPropagation();
    setWidgets(prev => prev.map(w => w.id === slotId ? { ...w, title: "Empty Slot", type: "empty", targetMenu: "" } : w));
  };

  const navigate = (menu: string) => {
    setActiveMenu(menu);
    setIsSidebarOpen(false);
  };

  const today = new Date();
  const todayFormatted = today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "America/New_York" });

  return (
    <div
      className="flex h-screen bg-[#F5F5F7] overflow-hidden"
      style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif" }}
    >
      {/* ── Mobile overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-56 flex flex-col bg-white border-r border-black/[0.06]
        transform transition-transform duration-200 ease-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[#F2F2F7]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0071E3] flex items-center justify-center flex-shrink-0">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1D1D1F] leading-tight">Dynamic After School & Taekwondo</p>
              <p className="text-[10px] text-[#AEAEB2]">Admin OS</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {MENUS.map(({ name, icon: Icon }) => {
            const active = activeMenu === name;
            return (
              <div
                key={name}
                draggable
                onDragStart={e => e.dataTransfer.setData("text/plain", name)}
                onClick={() => navigate(name)}
                className={`
                  group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all select-none
                  ${active ? "bg-[#0071E3] text-white" : "text-[#3A3A3C] hover:bg-[#F5F5F7]"}
                `}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-[#6E6E73] group-hover:text-[#1D1D1F]"}`} />
                <span className="text-[13px] font-medium truncate">{name}</span>
                {active && <div className="ml-auto"><GripVertical className="w-3 h-3 text-white/50" /></div>}
              </div>
            );
          })}
        </nav>

        <div className="px-4 py-3 border-t border-[#F2F2F7]">
          <p className="text-[11px] text-[#AEAEB2]">Drag items to pin shortcuts</p>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* ── Top bar ── */}
        <header className="flex-shrink-0 h-12 bg-white border-b border-black/[0.06] flex items-center px-4 gap-3 z-10">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F5F5F7] transition-colors"
          >
            <Menu className="w-4 h-4 text-[#6E6E73]" />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {(() => { const menuObj = MENUS.find(m => m.name === activeMenu); const Icon = menuObj?.icon ?? LayoutDashboard; return <Icon className="w-4 h-4 text-[#6E6E73] flex-shrink-0" />; })()}
            <h1 className="text-[15px] font-semibold text-[#1D1D1F] truncate">{activeMenu}</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-[#AEAEB2] hidden sm:block">{todayFormatted}</span>
            <div className="w-7 h-7 rounded-full bg-[#0071E3] flex items-center justify-center">
              <span className="text-[11px] font-semibold text-white">DA</span>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-6">

          {/* ══ Dashboard ══ */}
          {activeMenu === "Dashboard" && (
            <div className="space-y-6 max-w-5xl">

              {/* Calendar + Memo */}
              <div>
                <SectionHeader>Calendar & Events</SectionHeader>
                <div className="bg-white rounded-2xl border border-black/[0.06] shadow-sm overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[#F2F2F7]">
                    <div className="md:col-span-3 p-5">
                      <AppleCalendar
                        currentDate={currentDate}
                        selectedDateStr={selectedDateStr}
                        calendarEvents={calendarEvents}
                        onPrev={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                        onNext={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                        onSelectDate={setSelectedDateStr}
                      />
                    </div>
                    <div className="md:col-span-2 p-5 flex flex-col">
                      <div className="mb-3">
                        <p className="text-[11px] font-semibold text-[#0071E3] uppercase tracking-wider mb-1">Selected</p>
                        <p className="text-[17px] font-semibold text-[#1D1D1F]">{selectedDateStr}</p>
                      </div>
                      {Object.keys(calendarEvents).length > 0 && (
                        <div className="mb-3 space-y-1.5">
                          {Object.entries(calendarEvents).filter(([k]) => k.startsWith(selectedDateStr.substring(0, 7))).slice(0, 3).map(([k, v]) => (
                            <div key={k} className="flex items-start gap-2 text-[12px]">
                              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#0071E3] flex-shrink-0" />
                              <span className="text-[#3A3A3C] truncate"><span className="font-medium text-[#6E6E73]">{k.slice(8)}·</span> {v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <textarea
                        value={memoInput}
                        onChange={e => setMemoInput(e.target.value)}
                        placeholder="Add notes for this date…"
                        className="flex-1 min-h-[80px] w-full p-3 text-[13px] text-[#1D1D1F] placeholder-[#AEAEB2] bg-[#F5F5F7] rounded-xl outline-none resize-none focus:bg-white focus:ring-2 focus:ring-[#0071E3]/20 transition"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={saveMemo}
                          className="flex-1 py-2 bg-[#0071E3] hover:bg-[#0077ED] text-white text-[13px] font-semibold rounded-xl transition-colors"
                        >
                          Save
                        </button>
                        <button
                          onClick={deleteMemo}
                          className="px-4 py-2 bg-[#F5F5F7] hover:bg-[#EBEBF0] text-[#6E6E73] text-[13px] font-medium rounded-xl transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div>
                <SectionHeader>Overview</SectionHeader>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    label="Today's Attendance"
                    value={loading ? "—" : `${stats.todayAttendance}`}
                    color="bg-[#EBF5FF] text-[#0071E3] border-[#0071E3]/10"
                    active={currentFilter === "Present"}
                    onClick={() => handleCardClick("Present")}
                  />
                  <StatCard
                    label="Total Active Students"
                    value={loading ? "—" : `${stats.totalStudents}`}
                    color="bg-[#F0FFF4] text-[#1D7A45] border-[#34C759]/10"
                    active={currentFilter === "All"}
                    onClick={() => handleCardClick("All")}
                  />
                  <StatCard
                    label="Unpaid Tuition"
                    value={loading ? "—" : `${stats.unpaidCount}`}
                    color="bg-[#FFF1F0] text-[#FF3B30] border-[#FF3B30]/10"
                    active={currentFilter === "Unpaid"}
                    onClick={() => handleCardClick("Unpaid")}
                  />
                </div>
              </div>

              {/* Pinned Shortcuts */}
              <div>
                <SectionHeader>Pinned Shortcuts — drag menu items to pin</SectionHeader>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {widgets.map(slot => (
                    <div
                      key={slot.id}
                      onDragOver={e => e.preventDefault()}
                      onDrop={e => handleDrop(e, slot.id)}
                      onClick={() => slot.type === "active" && navigate(slot.targetMenu)}
                      className={`
                        rounded-2xl border-2 transition-all h-24 flex items-center justify-center
                        ${slot.type === "empty"
                          ? "border-dashed border-[#D2D2D7] bg-white text-[#AEAEB2]"
                          : "border-[#0071E3]/20 bg-[#EBF5FF] cursor-pointer hover:border-[#0071E3]/40 hover:bg-[#DAEEFF]"}
                      `}
                    >
                      {slot.type === "empty" ? (
                        <p className="text-[12px] font-medium">Drop a menu item here</p>
                      ) : (
                        <div className="w-full px-4 flex flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#0071E3] uppercase tracking-wide bg-[#0071E3]/10 px-2 py-0.5 rounded-full">Pinned</span>
                            <button
                              onClick={e => clearSlot(e, slot.id)}
                              className="text-[#AEAEB2] hover:text-[#FF3B30] transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[14px] font-semibold text-[#1D1D1F] truncate">{slot.title}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Table */}
              <div>
                <div className="flex items-center justify-between mb-3 px-1">
                  <SectionHeader>
                    {currentFilter === "All" ? "All Students" : currentFilter === "Present" ? "Present Today" : "Unpaid Tuition"}
                  </SectionHeader>
                  {!loading && (
                    <span className="text-[12px] text-[#AEAEB2]">{filteredMembers.length} records</span>
                  )}
                </div>
                {loading ? (
                  <div className="bg-white rounded-2xl border border-black/[0.06] p-10 text-center">
                    <div className="w-6 h-6 rounded-full border-2 border-[#0071E3] border-t-transparent animate-spin mx-auto mb-3" />
                    <p className="text-[13px] text-[#AEAEB2]">Loading live data…</p>
                  </div>
                ) : (
                  <StudentTable data={filteredMembers} />
                )}
              </div>
            </div>
          )}

          {/* ══ Student Roster ══ */}
          {activeMenu === "Student Roster" && (
            <div className="max-w-5xl space-y-4">
              <div className="flex items-center justify-between px-1">
                <SectionHeader>Student Roster Management</SectionHeader>
                <Badge variant="blue">{members.length} Students</Badge>
              </div>
              {loading ? (
                <div className="bg-white rounded-2xl border border-black/[0.06] p-10 text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-[#0071E3] border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-[13px] text-[#AEAEB2]">Loading…</p>
                </div>
              ) : (
                <StudentTable data={members} />
              )}
            </div>
          )}

          {/* ══ Fallback ══ */}
          {activeMenu !== "Dashboard" && activeMenu !== "Student Roster" && (
            <PlaceholderPage name={activeMenu} />
          )}

        </main>
      </div>
    </div>
  );
}
