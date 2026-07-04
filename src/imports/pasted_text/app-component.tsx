import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('📊 Dashboard');
  
  // Data & Stats State
  const [stats, setStats] = useState({ todayAttendance: 0, totalStudents: 0, unpaidCount: 0 });
  const [members, setMembers] = useState([]); 
  const [filteredMembers, setFilteredMembers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('All'); 

  // --- [Feature 1] iOS Style Calendar & Event Memo State ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [calendarEvents, setCalendarEvents] = useState({
    '2026-07-02': '🔥 Promotion Test & Parents Day',
    '2026-07-15': '💳 Mid-month Tuition Settling'
  });
  const [memoInput, setMemoInput] = useState('');

  // --- [Feature 2] Drag & Drop Widget Slots with Clickable Navigation ---
  const [widgets, setWidgets] = useState([
    { id: 'slot-1', title: 'Empty Slot (Drag Here)', type: 'empty', targetMenu: '' },
    { id: 'slot-2', title: 'Empty Slot (Drag Here)', type: 'empty', targetMenu: '' },
    { id: 'slot-3', title: 'Empty Slot (Drag Here)', type: 'empty', targetMenu: '' }
  ]);

  // --- [Feature 3] Excel-style Sorting/Filter State ---
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch Live Data from Supabase
  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('members').select('*');
      if (error) throw error;
      
      if (data) {
        setMembers(data);
        setFilteredMembers(data); 
        
        setStats({
          totalStudents: data.length,
          todayAttendance: data.filter(m => {
            const status = String(m.attendance_status || '').trim().toLowerCase();
            return status === 'present' || status === '출석';
          }).length,
          unpaidCount: data.filter(m => {
            const status = String(m.payment_status || '').trim().toLowerCase();
            return status === 'unpaid' || status === '미납';
          }).length
        });
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeMenu]);

  // Sync Calendar Memo
  useEffect(() => {
    setMemoInput(calendarEvents[selectedDateStr] || '');
  }, [selectedDateStr, calendarEvents]);

  // --- Calendar Logic ---
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const saveMemo = () => {
    setCalendarEvents(prev => ({ ...prev, [selectedDateStr]: memoInput }));
    alert('Calendar memo saved successfully.');
  };

  const deleteMemo = () => {
    const updated = { ...calendarEvents };
    delete updated[selectedDateStr];
    setCalendarEvents(updated);
    setMemoInput('');
    alert('Calendar memo deleted.');
  };

  // --- Drag & Drop Widget Logic ---
  const handleDragStart = (e, menuName) => {
    e.dataTransfer.setData('text/plain', menuName);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e, slotId) => {
    e.preventDefault();
    const droppedMenuName = e.dataTransfer.getData('text/plain');
    setWidgets(prev => prev.map(widget => 
      widget.id === slotId ? { ...widget, title: droppedMenuName, type: 'active', targetMenu: droppedMenuName } : widget
    ));
  };

  const clearSlot = (e, slotId) => {
    e.stopPropagation(); // Prevent trigger activeMenu navigation when clicking 'Clear'
    setWidgets(prev => prev.map(widget => 
      widget.id === slotId ? { ...widget, title: 'Empty Slot (Drag Here)', type: 'empty', targetMenu: '' } : widget
    ));
  };

  // Quick Stat Cards Filter
  const handleCardClick = (type) => {
    setCurrentFilter(type);
    if (type === 'Present') {
      setFilteredMembers(members.filter(m => {
        const status = String(m.attendance_status || '').trim().toLowerCase();
        return status === 'present' || status === '출석';
      }));
    } else if (type === 'Unpaid') {
      setFilteredMembers(members.filter(m => {
        const status = String(m.payment_status || '').trim().toLowerCase();
        return status === 'unpaid' || status === '미납';
      }));
    } else {
      setFilteredMembers(members);
    }
  };

  // --- Excel-style Columns Sort & Search ---
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedAndFilteredData = (dataList) => {
    let result = [...dataList];

    if (searchTerm) {
      result = result.filter(m => 
        String(m.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(m.belt).toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(m.category).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (sortConfig.key) {
      result.sort((a, b) => {
        let valA = a[sortConfig.key] ? String(a[sortConfig.key]).toLowerCase() : '';
        let valB = b[sortConfig.key] ? String(b[sortConfig.key]).toLowerCase() : '';
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  };

  const openContractPDF = (studentName) => {
    alert(`[PDF Viewer] Opening agreement for: ${studentName}`);
  };

  const menus = [
    '📊 Dashboard', '👥 Student Roster', '📅 Attendance', '💳 Tuition & Fees', 
    '🥋 Belt Promotion', '📸 Student Profile', '📆 Class Schedule', 
    '📝 Consultation Logs', '📢 Announcements', '🔔 Notifications', '📈 Reports', '🔍 Search'
  ];

  const renderStudentTable = (rawList) => {
    const sortedData = getSortedAndFilteredData(rawList);
    const renderSortArrow = (key) => {
      if (sortConfig.key !== key) return ' ↕';
      return sortConfig.direction === 'asc' ? ' 🔼' : ' 🔽';
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Real-time Search */}
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <input 
            type="text" 
            placeholder="🔍 Real-time Search (Name, Belt, Category)..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md p-2 text-sm border border-gray-200 rounded-xl bg-white"
          />
          <span className="text-xs text-gray-400">Click column headers to sort Ascending / Descending.</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-xs font-bold border-b border-gray-200 uppercase tracking-wider">
                <th onClick={() => handleSort('name')} className="p-4 cursor-pointer hover:bg-gray-200">Name{renderSortArrow('name')}</th>
                <th onClick={() => handleSort('dob')} className="p-4 cursor-pointer hover:bg-gray-200">DOB{renderSortArrow('dob')}</th>
                <th onClick={() => handleSort('category')} className="p-4 cursor-pointer hover:bg-gray-200">Category{renderSortArrow('category')}</th>
                <th onClick={() => handleSort('belt')} className="p-4 cursor-pointer hover:bg-gray-200">Belt{renderSortArrow('belt')}</th>
                <th onClick={() => handleSort('attendance_status')} className="p-4 cursor-pointer hover:bg-gray-200">Attendance{renderSortArrow('attendance_status')}</th>
                <th onClick={() => handleSort('payment_status')} className="p-4 cursor-pointer hover:bg-gray-200">Tuition Status{renderSortArrow('payment_status')}</th>
                <th className="p-4 text-right">Contract</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {sortedData.map((member) => (
                <tr key={member.student_code} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold text-gray-900">{member.name}</td>
                  <td className="p-4 text-gray-500">{member.dob}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${member.category === 'AfterSchool' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                      {member.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">🥋 {member.belt || 'White'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${String(member.attendance_status || '').toLowerCase() === 'present' || member.attendance_status === '출석' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {member.attendance_status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${String(member.payment_status || '').toLowerCase() === 'paid' || member.payment_status === '완납' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                      {member.payment_status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openContractPDF(member.name)}
                      className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      📄 View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayIndex = getFirstDayOfMonth(currentDate);
  const blankDays = Array(firstDayIndex).fill(null);
  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-slate-800 text-white flex flex-col`}>
        <div className="p-5 text-xl font-bold border-b border-slate-700 bg-slate-900">
          <span>🥋 Dynamic HQ OS</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menus.map((menu) => (
            <div
              key={menu}
              draggable
              onDragStart={(e) => handleDragStart(e, menu)}
              onClick={() => setActiveMenu(menu)}
              className={`p-3 rounded-lg cursor-grab active:cursor-grabbing transition-colors text-left ${activeMenu === menu ? 'bg-blue-600 text-white' : 'hover:bg-slate-700 text-gray-300'}`}
            >
              ☰ {menu}
            </div>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
          <h1 className="text-xl font-bold text-gray-800">{activeMenu}</h1>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          
          {/* 1. Dashboard View */}
          {activeMenu === '📊 Dashboard' && (
            <div className="space-y-6">

              {/* iOS Style Calendar Component */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="md:col-span-2 border-r border-gray-100 pr-0 md:pr-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 text-base">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div className="flex gap-2">
                      <button onClick={handlePrevMonth} className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm">◀</button>
                      <button onClick={handleNextMonth} className="p-1 px-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-sm">▶</button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-400 mb-2">
                    <span className="text-red-500">SUN</span><span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span className="text-blue-500">SAT</span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1 text-center text-sm">
                    {blankDays.map((_, i) => <div key={`b-${i}`} className="p-2"></div>)}
                    {calendarDays.map((day) => {
                      const dayStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = selectedDateStr === dayStr;
                      const hasEvent = !!calendarEvents[dayStr];
                      
                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDateStr(dayStr)}
                          className={`p-2 rounded-xl cursor-pointer relative font-medium transition-all ${isSelected ? 'bg-orange-500 text-white font-bold shadow-sm' : 'hover:bg-gray-100 text-gray-800'}`}
                        >
                          {day}
                          {hasEvent && !isSelected && (
                            <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-orange-500 rounded-full"></span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Memo Dashboard */}
                <div className="flex flex-col justify-between pl-0 md:pl-2">
                  <div>
                    <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Selected Date</span>
                    <p className="text-lg font-bold text-gray-900 mb-3">{selectedDateStr}</p>
                    <textarea
                      value={memoInput}
                      onChange={(e) => setMemoInput(e.target.value)}
                      placeholder="Enter schedules, academy events, or custom notes for this day."
                      className="w-full h-28 p-3 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white resize-none"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={saveMemo} className="flex-1 text-xs bg-orange-500 hover:bg-orange-600 text-white p-2.5 rounded-xl font-bold transition-colors">Save</button>
                    <button onClick={deleteMemo} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-500 p-2.5 rounded-xl font-bold transition-colors">Delete</button>
                  </div>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div 
                  onClick={() => handleCardClick('Present')} 
                  className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all ${currentFilter === 'Present' ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-100'}`}
                >
                  <p className="text-sm text-gray-500 font-medium">Today's Attendance</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">{stats.todayAttendance} Students</p>
                </div>
                
                <div 
                  onClick={() => handleCardClick('All')} 
                  className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all ${currentFilter === 'All' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-100'}`}
                >
                  <p className="text-sm text-gray-500 font-medium">Total Active Students</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalStudents} Students</p>
                </div>
                
                <div 
                  onClick={() => handleCardClick('Unpaid')} 
                  className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all ${currentFilter === 'Unpaid' ? 'bg-red-50 border-red-500' : 'bg-white border-gray-100'}`}
                >
                  <p className="text-sm text-gray-500 font-medium">Unpaid Tuition</p>
                  <p className="text-3xl font-bold text-red-500 mt-2">{stats.unpaidCount} Cases</p>
                </div>
              </div>

              {/* [Feature 2] Updated Clickable Custom Widget Slots */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">🛠️ CUSTOM PINNED SHORTCUT SLOTS (Click widget to open function)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {widgets.map((slot) => (
                    <div
                      key={slot.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, slot.id)}
                      onClick={() => slot.type === 'active' && setActiveMenu(slot.targetMenu)}
                      className={`p-6 rounded-2xl border-2 border-dashed transition-all flex flex-col justify-between items-center text-center ${slot.type === 'empty' ? 'border-gray-200 bg-gray-50 text-gray-400 h-28' : 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-900 h-28 shadow-sm cursor-pointer hover:scale-[1.02] border-solid'}`}
                    >
                      {slot.type === 'empty' ? (
                        <span className="text-xs font-medium my-auto">{slot.title}</span>
                      ) : (
                        <div className="w-full flex flex-col h-full justify-between">
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Active Link</span>
                            <button onClick={(e) => clearSlot(e, slot.id)} className="text-gray-400 hover:text-red-500 font-bold text-xs bg-white/80 p-1 rounded-md shadow-2xs">✕ Clear</button>
                          </div>
                          <p className="text-sm font-black text-slate-800 mb-1 truncate text-left w-full pl-1">⚡ Go to {slot.title.split(' ').slice(1).join(' ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Student Table Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider px-1">Filtered View: {currentFilter} List</h3>
                {loading ? <div className="p-6 text-gray-500">Loading live data...</div> : renderStudentTable(filteredMembers)}
              </div>
            </div>
          )}

          {/* 2. Student Roster View */}
          {activeMenu === '👥 Student Roster' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className="text-lg font-bold text-gray-700">Student Roster Management</h2>
                <span className="text-sm bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full">Total: {members.length}</span>
              </div>
              {loading ? <div className="p-6 text-gray-500">Loading...</div> : renderStudentTable(members)}
            </div>
          )}

          {/* Fallback View for other screens */}
          {!['📊 Dashboard', '👥 Student Roster'].includes(activeMenu) && (
            <div className="bg-white p-8 rounded-2xl shadow-sm text-center text-gray-500">
              <p className="text-lg font-semibold text-slate-700 mb-2">{activeMenu} Page</p>
              <p className="text-sm text-gray-400">This feature module is connected to the dashboard shortcut and ready for implementation.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;