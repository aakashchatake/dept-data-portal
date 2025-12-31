import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ChevronLeft,
  School,
  Trophy,
  Users,
  Briefcase,
  Building,
  Calendar,
  Camera,
  FileText,
  Star,
  CheckCircle,
  Menu,
  X,
  UploadCloud,
  LayoutDashboard,
  Eye,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken,
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

// --- Firebase Configuration & Init ---
let firebaseConfig, app, auth, db, appId;

try {
  firebaseConfig = JSON.parse(__firebase_config);
  // Check if config has valid values (not demo values)
  if (firebaseConfig.apiKey === 'demo-api-key' || !firebaseConfig.projectId || firebaseConfig.projectId === 'demo-project') {
    throw new Error('Firebase config not properly set up');
  }
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
} catch (error) {
  console.warn('Firebase not configured properly. Running in demo mode:', error.message);
  // Set up mock objects for demo mode
  firebaseConfig = null;
  app = null;
  auth = null;
  db = null;
  appId = 'demo-app-id';
}

// --- Components ---

const SectionHeader = ({ title, icon: Icon, description }) => (
  <div className="mb-6 border-b pb-4 border-slate-200">
    <div className="flex items-center gap-2 mb-1">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    </div>
    {description && <p className="text-slate-500 ml-12">{description}</p>}
  </div>
);

const InputField = ({ label, value, onChange, type = "text", placeholder, options, className = "" }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    {type === 'select' ? (
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
      >
        <option value="">Select...</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px]"
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    )}
  </div>
);



// --- Initial State ---

const initialData = {
  departmentDetails: {
    deptName: '', hodName: '', facultyCount: '', 
    studentsFY: '', studentsSY: '', studentsTY: '',
    submissionDate: ''
  },
  academicResults: {
    fy: { percent: '', pass: '', total: '' },
    sy: { percent: '', pass: '', total: '' },
    ty: { percent: '', pass: '', total: '' }
  },
  toppers: [],
  studentAchievements: [],
  staffAchievements: [],
  guestLectures: [],
  industrialVisits: [],
  workshops: [],
  mous: [],
  trainings: [],
  placements: [],
  higherEd: [],
  events: [],
  photos: [
    { id: 1, event: '', date: '', filename: '', file: '', checks: [] },
    { id: 2, event: '', date: '', filename: '', file: '', checks: [] },
    { id: 3, event: '', date: '', filename: '', file: '', checks: [] },
    { id: 4, event: '', date: '', filename: '', file: '', checks: [] },
    { id: 5, event: '', date: '', filename: '', file: '', checks: [] },
  ],
  highlights: ['', '', '', '']
};

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [data, setData] = useState(initialData);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);
  const [submittedReports, setSubmittedReports] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('idle'); // idle, submitting, success, error
  const [isAdminView, setIsAdminView] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showAdminPrompt, setShowAdminPrompt] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // 1. Auth Setup
  useEffect(() => {
    if (!auth) {
      console.log('Firebase not available - running in offline mode');
      setUser({ uid: 'demo-user', isAnonymous: true });
      return;
    }
    
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth failed:', error);
        // Set demo user for offline mode
        setUser({ uid: 'demo-user', isAnonymous: true });
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // 2. Load Local Draft
  useEffect(() => {
    const saved = localStorage.getItem('deptReportData_Draft');
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local draft", e);
      }
    }
  }, []);

  // 3. Save Local Draft (Auto-save)
  useEffect(() => {
    localStorage.setItem('deptReportData_Draft', JSON.stringify(data));
  }, [data]);

  // 4. Fetch All Reports (For Admin View)
  useEffect(() => {
    if (!user || !db) {
      // In demo mode, load from localStorage
      const demoReports = localStorage.getItem('demo-reports');
      if (demoReports) {
        try {
          setSubmittedReports(JSON.parse(demoReports));
        } catch (e) {
          console.error('Failed to load demo reports:', e);
        }
      }
      return;
    }
    
    // We use a public collection so the admin (you) can see what departments submit
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'dept_reports_2025'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reports = [];
      snapshot.forEach((doc) => {
        reports.push({ id: doc.id, ...doc.data() });
      });
      setSubmittedReports(reports);
    }, (error) => {
      console.error("Error fetching reports:", error);
    });

    return () => unsubscribe();
  }, [user]);

  // --- Actions ---

  const handleCloudSubmit = async () => {
    if (!user) {
      alert("Authenticating... please wait a moment and try again.");
      return;
    }
    if (!data.departmentDetails.deptName) {
      alert("Please enter a Department Name in Basic Details before submitting.");
      setActiveTab(0);
      return;
    }

    setSubmitStatus('submitting');
    try {
      if (!db) {
        // Demo mode - save to localStorage
        const demoReports = JSON.parse(localStorage.getItem('demo-reports') || '[]');
        const docId = data.departmentDetails.deptName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'unknown_dept';
        
        const newReport = {
          id: docId,
          ...data,
          submittedAt: new Date().toISOString(),
          submittedBy: user.uid
        };
        
        // Check if report already exists
        const existingIndex = demoReports.findIndex(r => r.id === docId);
        if (existingIndex >= 0) {
          demoReports[existingIndex] = newReport;
        } else {
          demoReports.push(newReport);
        }
        
        localStorage.setItem('demo-reports', JSON.stringify(demoReports));
        setSubmittedReports(demoReports);
      } else {
        // Firebase mode
        const docId = data.departmentDetails.deptName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'unknown_dept';
        
        const reportRef = doc(db, 'artifacts', appId, 'public', 'data', 'dept_reports_2025', docId);
        
        await setDoc(reportRef, {
          ...data,
          submittedAt: new Date().toISOString(),
          submittedBy: user.uid
        });
      }
      
      setSubmitStatus('success');
      setTimeout(() => setSubmitStatus('idle'), 3000);
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitStatus('error');
    }
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${data.departmentDetails.deptName || 'dept'}_report.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // --- Field Updaters ---

  const updateField = (section, field, value) => {
    setData(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value }
    }));
  };

  const updateArrayItem = (section, index, field, value) => {
    setData(prev => {
      const newArray = [...prev[section]];
      newArray[index] = { ...newArray[index], [field]: value };
      return { ...prev, [section]: newArray };
    });
  };

  const addArrayItem = (section, newItem) => {
    setData(prev => ({
      ...prev,
      [section]: [...prev[section], newItem]
    }));
  };

  const removeArrayItem = (section, index) => {
    setData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const sections = [
    { id: 'basics', title: 'Basic Details', icon: School },
    { id: 'results', title: 'Academic Results', icon: FileText },
    { id: 'student_ach', title: 'Student Achievements', icon: Trophy },
    { id: 'staff_ach', title: 'Staff Achievements', icon: Star },
    { id: 'lectures', title: 'Guest Lectures', icon: Users },
    { id: 'visits', title: 'Industrial Visits', icon: Building },
    { id: 'workshops', title: 'Workshops & Seminars', icon: Calendar },
    { id: 'mous', title: 'MoUs', icon: Briefcase },
    { id: 'tpo', title: 'TPO / Placements', icon: Briefcase },
    { id: 'events', title: 'Events & Activities', icon: Camera },
    { id: 'photos', title: 'Best Photographs', icon: Camera },
    { id: 'highlights', title: 'Special Highlights', icon: CheckCircle },
  ];



  const renderContent = () => {
    switch(activeTab) {
      case 0: // Basics
        return (
          <div className="space-y-6">
            <SectionHeader title="Department Basic Details" icon={School} description="General information about the department for the academic year." />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="Department Name" value={data.departmentDetails.deptName} onChange={(v) => updateField('departmentDetails', 'deptName', v)} placeholder="e.g. Computer Engineering" />
              <InputField label="HOD Name" value={data.departmentDetails.hodName} onChange={(v) => updateField('departmentDetails', 'hodName', v)} />
              <InputField label="Submission Date" type="date" value={data.departmentDetails.submissionDate} onChange={(v) => updateField('departmentDetails', 'submissionDate', v)} />
              <InputField label="Total Faculty Count" type="number" value={data.departmentDetails.facultyCount} onChange={(v) => updateField('departmentDetails', 'facultyCount', v)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
              <InputField label="Total Students (FY)" type="number" value={data.departmentDetails.studentsFY} onChange={(v) => updateField('departmentDetails', 'studentsFY', v)} />
              <InputField label="Total Students (SY)" type="number" value={data.departmentDetails.studentsSY} onChange={(v) => updateField('departmentDetails', 'studentsSY', v)} />
              <InputField label="Total Students (TY)" type="number" value={data.departmentDetails.studentsTY} onChange={(v) => updateField('departmentDetails', 'studentsTY', v)} />
            </div>
          </div>
        );

      case 1: // Results
        return (
          <div className="space-y-8">
            <SectionHeader title="Academic Results" icon={FileText} description="As per MSBTE pattern." />
            
            <div className="bg-slate-50 p-4 rounded-lg border">
              <h3 className="font-bold text-lg mb-4 text-slate-700">Result Percentage</h3>
              <div className="grid gap-4">
                {['fy', 'sy', 'ty'].map((yr, idx) => {
                   const labels = ['FY (I Sem)', 'SY (III Sem)', 'TY (V Sem)'];
                   return (
                    <div key={yr} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div className="font-semibold pb-2 text-slate-600">{labels[idx]}</div>
                      <InputField label="Percentage" value={data.academicResults[yr].percent} onChange={(v) => setData({...data, academicResults: {...data.academicResults, [yr]: {...data.academicResults[yr], percent: v}}})} />
                      <InputField label="Pass Count" value={data.academicResults[yr].pass} onChange={(v) => setData({...data, academicResults: {...data.academicResults, [yr]: {...data.academicResults[yr], pass: v}}})} />
                      <InputField label="Total Count" value={data.academicResults[yr].total} onChange={(v) => setData({...data, academicResults: {...data.academicResults, [yr]: {...data.academicResults[yr], total: v}}})} />
                    </div>
                   );
                })}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-slate-700">Toppers Details</h3>
                <button onClick={() => addArrayItem('toppers', {name: '', class: '', percentage: '', rank: ''})} className="flex items-center gap-1 text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
                  <Plus size={16} /> Add Topper
                </button>
              </div>
              <div className="space-y-3">
                {data.toppers.map((item, idx) => (
                  <div key={idx} className="flex gap-3 items-end bg-white p-3 border rounded shadow-sm">
                    <InputField className="flex-1" label="Name" value={item.name} onChange={(v) => updateArrayItem('toppers', idx, 'name', v)} />
                    <InputField className="w-24" label="Class" value={item.class} onChange={(v) => updateArrayItem('toppers', idx, 'class', v)} />
                    <InputField className="w-24" label="%" value={item.percentage} onChange={(v) => updateArrayItem('toppers', idx, 'percentage', v)} />
                    <InputField className="w-24" label="Rank" value={item.rank} onChange={(v) => updateArrayItem('toppers', idx, 'rank', v)} />
                    <button onClick={() => removeArrayItem('toppers', idx)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 2: // Student Achievements
        return (
          <div className="space-y-6">
            <SectionHeader title="Student Achievements" icon={Trophy} description="Paper presentations, Projects, Sports, Cultural." />
            <button onClick={() => addArrayItem('studentAchievements', {name: '', class: '', event: '', level: 'College', award: '', date: '', proof: []})} className="w-full py-3 border-2 border-dashed border-blue-300 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 flex justify-center items-center gap-2">
              <Plus size={20} /> Add New Achievement
            </button>
            <div className="space-y-6">
              {data.studentAchievements.map((item, idx) => (
                <div key={idx} className="bg-white p-6 border rounded-xl shadow-sm relative">
                  <button onClick={() => removeArrayItem('studentAchievements', idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 size={20} /></button>
                  <h4 className="font-bold text-slate-800 mb-4">Achievement #{idx + 1}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Student Name(s)" value={item.name} onChange={(v) => updateArrayItem('studentAchievements', idx, 'name', v)} />
                    <InputField label="Class" value={item.class} onChange={(v) => updateArrayItem('studentAchievements', idx, 'class', v)} />
                    <InputField label="Event / Competition" value={item.event} onChange={(v) => updateArrayItem('studentAchievements', idx, 'event', v)} />
                    <InputField label="Position / Award" value={item.award} onChange={(v) => updateArrayItem('studentAchievements', idx, 'award', v)} />
                    <InputField label="Date" type="date" value={item.date} onChange={(v) => updateArrayItem('studentAchievements', idx, 'date', v)} />
                    <InputField label="Level" type="select" options={['College','District','State','National','International']} value={item.level} onChange={(v) => updateArrayItem('studentAchievements', idx, 'level', v)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3: return (<div className="space-y-6"><SectionHeader title="Staff Achievements" icon={Star} /><button onClick={() => addArrayItem('staffAchievements', {name: '', type: 'FDP', title: '', body: '', date: ''})} className="btn-add"><Plus size={18}/> Add Staff Achievement</button>{data.staffAchievements.map((item, idx) => (<div key={idx} className="card-item"><button onClick={() => removeArrayItem('staffAchievements', idx)} className="card-delete"><Trash2 size={18}/></button><div className="grid md:grid-cols-2 gap-4"><InputField label="Name" value={item.name} onChange={(v)=>updateArrayItem('staffAchievements',idx,'name',v)}/><InputField label="Type" value={item.type} onChange={(v)=>updateArrayItem('staffAchievements',idx,'type',v)}/><InputField label="Title" value={item.title} onChange={(v)=>updateArrayItem('staffAchievements',idx,'title',v)}/></div></div>))}</div>);
      case 4: return (<div className="space-y-6"><SectionHeader title="Guest Lectures" icon={Users} /><button onClick={() => addArrayItem('guestLectures', {topic: '', person: ''})} className="btn-add"><Plus size={18}/> Add Lecture</button>{data.guestLectures.map((item, idx) => (<div key={idx} className="card-item"><button onClick={() => removeArrayItem('guestLectures', idx)} className="card-delete"><Trash2/></button><InputField label="Topic" value={item.topic} onChange={(v)=>updateArrayItem('guestLectures',idx,'topic',v)}/></div>))}</div>);
      case 5: return (<div className="space-y-6"><SectionHeader title="Industrial Visits" icon={Building} /><button onClick={() => addArrayItem('industrialVisits', {industry: '', location: ''})} className="btn-add"><Plus size={18}/> Add Visit</button>{data.industrialVisits.map((item, idx) => (<div key={idx} className="card-item"><button onClick={() => removeArrayItem('industrialVisits', idx)} className="card-delete"><Trash2/></button><InputField label="Industry" value={item.industry} onChange={(v)=>updateArrayItem('industrialVisits',idx,'industry',v)}/></div>))}</div>);
      case 6: return (<div className="space-y-6"><SectionHeader title="Workshops" icon={Calendar} /><button onClick={() => addArrayItem('workshops', {title: ''})} className="btn-add"><Plus size={18}/> Add Workshop</button>{data.workshops.map((item, idx) => (<div key={idx} className="card-item"><button onClick={() => removeArrayItem('workshops', idx)} className="card-delete"><Trash2/></button><InputField label="Title" value={item.title} onChange={(v)=>updateArrayItem('workshops',idx,'title',v)}/></div>))}</div>);
      case 7: return (<div className="space-y-6"><SectionHeader title="MoUs" icon={Briefcase} /><button onClick={() => addArrayItem('mous', {org: ''})} className="btn-add"><Plus size={18}/> Add MoU</button>{data.mous.map((item, idx) => (<div key={idx} className="card-item"><button onClick={() => removeArrayItem('mous', idx)} className="card-delete"><Trash2/></button><InputField label="Org" value={item.org} onChange={(v)=>updateArrayItem('mous',idx,'org',v)}/></div>))}</div>);
      case 8: return (<div className="space-y-6"><SectionHeader title="Placements" icon={Briefcase} /><button onClick={() => addArrayItem('placements', {company: '', count: ''})} className="btn-add"><Plus size={18}/> Add Placement</button>{data.placements.map((item, idx) => (<div key={idx} className="card-item"><button onClick={() => removeArrayItem('placements', idx)} className="card-delete"><Trash2/></button><InputField label="Company" value={item.company} onChange={(v)=>updateArrayItem('placements',idx,'company',v)}/></div>))}</div>);
      case 9: return (<div className="space-y-6"><SectionHeader title="Events" icon={Camera} /><button onClick={() => addArrayItem('events', {name: ''})} className="btn-add"><Plus size={18}/> Add Event</button>{data.events.map((item, idx) => (<div key={idx} className="card-item"><button onClick={() => removeArrayItem('events', idx)} className="card-delete"><Trash2/></button><InputField label="Name" value={item.name} onChange={(v)=>updateArrayItem('events',idx,'name',v)}/></div>))}</div>);
      case 10: return (
        <div className="space-y-6">
          <SectionHeader title="Photographs" icon={Camera} description="Upload photos and provide event details." />
          {data.photos.map((item, idx) => (
            <div key={idx} className="card-item">
              <h4 className="font-bold mb-4">Photo {idx+1}</h4>
              <div className="space-y-4">
                {/* Photo Upload Section */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Upload Photo</label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center bg-slate-50 hover:bg-slate-100 transition cursor-pointer relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            updateArrayItem('photos', idx, 'file', event.target?.result);
                            updateArrayItem('photos', idx, 'filename', file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                    <div className="pointer-events-none">
                      {item.file ? (
                        <div className="space-y-2">
                          <div className="text-2xl">✓</div>
                          <div className="text-sm font-semibold text-green-600">{item.filename}</div>
                          <div className="text-xs text-slate-500">Click to change</div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Camera size={32} className="mx-auto text-slate-400" />
                          <div className="text-sm font-semibold text-slate-600">Click to upload photo</div>
                          <div className="text-xs text-slate-500">or drag and drop</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* Photo Preview */}
                {item.file && (
                  <div className="mt-4">
                    <img src={item.file} alt={`Photo ${idx+1}`} className="w-full max-h-64 object-contain rounded-lg border border-slate-200" />
                    <button
                      onClick={() => {
                        updateArrayItem('photos', idx, 'file', '');
                        updateArrayItem('photos', idx, 'filename', '');
                      }}
                      className="mt-2 text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      ✕ Remove Photo
                    </button>
                  </div>
                )}
                {/* Event Details */}
                <InputField label="Event / Description" value={item.event} onChange={(v)=>updateArrayItem('photos',idx,'event',v)} placeholder="e.g. Annual Sports Day 2024" />
                <InputField label="Date" type="date" value={item.date} onChange={(v)=>updateArrayItem('photos',idx,'date',v)} />
              </div>
            </div>
          ))}
        </div>
      );

      case 11: // Highlights
        return (
          <div className="space-y-6">
            <SectionHeader title="Special Highlights" icon={CheckCircle} description="Unique or remarkable achievements." />
            {data.highlights.map((text, idx) => (
              <InputField key={idx} type="textarea" label={`Highlight ${idx + 1}`} value={text} onChange={(v) => {
                const newH = [...data.highlights];
                newH[idx] = v;
                setData({...data, highlights: newH});
              }} />
            ))}
            
            <div className="mt-12 p-8 bg-slate-900 text-white rounded-xl text-center shadow-xl">
              <h3 className="text-2xl font-bold mb-2">Submission Ready</h3>
              <p className="text-slate-300 mb-6 max-w-md mx-auto">
                Once you click submit, your data will be sent to the central department database.
              </p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button 
                  onClick={handleCloudSubmit} 
                  disabled={submitStatus === 'submitting'}
                  className={`
                    ${submitStatus === 'success' ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'} 
                    text-white font-bold py-3 px-8 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-105 disabled:opacity-50 disabled:scale-100
                  `}
                >
                  {submitStatus === 'submitting' ? <RefreshCw className="animate-spin"/> : submitStatus === 'success' ? <CheckCircle /> : <UploadCloud size={24} />} 
                  {submitStatus === 'submitting' ? 'Saving...' : submitStatus === 'success' ? 'Submitted!' : 'Submit Annual Report'}
                </button>
                
                <button onClick={handleExport} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-full shadow-lg flex items-center justify-center gap-2">
                  <Download size={20} /> Backup JSON
                </button>
              </div>
              {submitStatus === 'success' && <p className="mt-4 text-green-400 font-medium animate-pulse">Data received by admin successfully!</p>}
              {submitStatus === 'error' && <p className="mt-4 text-red-400 font-medium">Error saving data. Please check connection.</p>}
            </div>
          </div>
        );

      default: return null;
    }
  };

  const renderAdminView = () => (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Admin Dashboard</h2>
          <p className="text-slate-500">View and manage submitted department reports.</p>
        </div>
        <button onClick={() => setIsAdminView(false)} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 flex items-center gap-2">
           <ArrowLeft size={16}/> Back to Entry Form
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List of Submissions */}
        <div className="md:col-span-1 bg-white rounded-xl shadow-sm border p-4 h-[600px] overflow-y-auto">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider mb-4">Received Reports</h3>
          {submittedReports.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <UploadCloud size={40} className="mx-auto mb-2 opacity-50"/>
              <p>No reports received yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {submittedReports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${selectedReport?.id === report.id ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <div className="font-bold text-slate-800">{report.departmentDetails?.deptName || 'Unnamed Dept'}</div>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <Calendar size={12}/> {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'Unknown Date'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    HOD: {report.departmentDetails?.hodName || '-'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Detail View */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border p-6 h-[600px] overflow-y-auto">
          {selectedReport ? (
            <div className="space-y-6">
               <div className="border-b pb-4">
                  <h2 className="text-2xl font-bold text-slate-800">{selectedReport.departmentDetails?.deptName}</h2>
                  <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                    <div><span className="text-slate-500">HOD:</span> <span className="font-semibold">{selectedReport.departmentDetails?.hodName}</span></div>
                    <div><span className="text-slate-500">Faculty:</span> <span className="font-semibold">{selectedReport.departmentDetails?.facultyCount}</span></div>
                    <div><span className="text-slate-500">Students (Total):</span> <span className="font-semibold">
                      {Number(selectedReport.departmentDetails?.studentsFY || 0) + Number(selectedReport.departmentDetails?.studentsSY || 0) + Number(selectedReport.departmentDetails?.studentsTY || 0)}
                    </span></div>
                  </div>
               </div>
               
               {/* Quick Stats */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50 p-3 rounded border">
                    <div className="text-xs text-slate-500">Achievements</div>
                    <div className="font-bold text-xl">{selectedReport.studentAchievements?.length || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border">
                    <div className="text-xs text-slate-500">Events</div>
                    <div className="font-bold text-xl">{selectedReport.events?.length || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border">
                    <div className="text-xs text-slate-500">Placements</div>
                    <div className="font-bold text-xl">{selectedReport.placements?.length || 0}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded border">
                     <div className="text-xs text-slate-500">Photos Metadata</div>
                     <div className="font-bold text-xl">{selectedReport.photos?.filter(p => p.event).length || 0}</div>
                  </div>
               </div>

               {/* Raw Data Preview for verification */}
               <div className="mt-8">
                  <h4 className="font-bold text-slate-700 mb-2">Raw Data (JSON)</h4>
                  <pre className="bg-slate-900 text-slate-200 p-4 rounded-lg overflow-x-auto text-xs">
                    {JSON.stringify(selectedReport, null, 2)}
                  </pre>
               </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <Eye size={48} className="mb-4 opacity-30" />
               <p>Select a report from the list to view details.</p>
            </div>
          )}
        </div>
      </div>
      
      <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-500">
        Powered by <a href="https://chatakeinnoworks.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">Chatake Innoworks</a> • © {new Date().getFullYear()} All rights reserved
      </footer>
    </div>
  );

  if (isAdminView) {
    return (
      <div className="flex flex-col h-screen bg-slate-100 font-sans overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {renderAdminView()}
        </div>
        <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-500">
          Powered by <a href="https://chatakeinnoworks.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">Chatake Innoworks</a> • © {new Date().getFullYear()} All rights reserved
        </footer>
      </div>
    );
  }

  // Admin Password Prompt
  if (showAdminPrompt) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">Admin Dashboard</h3>
          <p className="text-slate-600 mb-6">Enter admin password to access reports.</p>
          <input 
            type="password" 
            placeholder="Admin Password"
            value={adminPasswordInput}
            onChange={(e) => setAdminPasswordInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                if (adminPasswordInput === 'admin2025') {
                  setIsAdminView(true);
                  setShowAdminPrompt(false);
                } else {
                  alert('Incorrect password');
                  setAdminPasswordInput('');
                }
              }
            }}
            className="w-full px-4 py-2 border rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-3">
            <button onClick={() => { 
              if (adminPasswordInput === 'admin2025') {
                setIsAdminView(true);
                setShowAdminPrompt(false);
              } else {
                alert('Incorrect password');
                setAdminPasswordInput('');
              }
            }} className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700">
              Access
            </button>
            <button onClick={() => setShowAdminPrompt(false)} className="flex-1 bg-slate-200 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-300">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Demo Mode Banner */}
      {!db && (
        <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium border-b border-yellow-600">
          ⚠️ Demo Mode: Firebase not configured. Data will be saved locally only.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar Overlay */}
      {!isSidebarOpen && (
         <button onClick={() => setSidebarOpen(true)} className="fixed bottom-4 right-4 z-50 p-4 bg-blue-600 text-white rounded-full shadow-lg md:hidden">
            <Menu />
         </button>
      )}

      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-40 w-72 bg-white border-r border-slate-200 h-full transition-transform duration-300 flex flex-col shadow-xl md:shadow-none`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h1 className="font-bold text-xl text-blue-900">Dept. Data Portal</h1>
            <p className="text-xs text-slate-400">Annual Report 2024-25</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400"><X /></button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isActive = activeTab === index;
            return (
              <button
                key={section.id}
                onClick={() => { setActiveTab(index); if(window.innerWidth < 768) setSidebarOpen(false); }}
                className={`w-full text-left px-6 py-3 flex items-center gap-3 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon size={18} className={isActive ? 'text-blue-600' : 'text-slate-400'} />
                <span className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}>{section.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-20 shadow-sm relative">
          <h2 className="font-semibold text-slate-700 hidden md:block">{sections[activeTab].title}</h2>
          <div className="flex gap-2 ml-auto items-center">
             <button onClick={() => { setAdminPasswordInput(''); setShowAdminPrompt(true); }} className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 text-sm font-medium mr-4">
                <LayoutDashboard size={16} /> Admin
             </button>
             <button onClick={() => setActiveTab(Math.max(0, activeTab - 1))} disabled={activeTab === 0} className="p-2 rounded hover:bg-slate-100 disabled:opacity-30"><ChevronLeft /></button>
             <button onClick={() => setActiveTab(Math.min(sections.length - 1, activeTab + 1))} disabled={activeTab === sections.length - 1} className="p-2 rounded hover:bg-slate-100 disabled:opacity-30"><ChevronRight /></button>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20">
          <div className="max-w-4xl mx-auto bg-white min-h-[500px] rounded-xl shadow-sm border p-6 md:p-10">
            {renderContent()}
          </div>
        </main>
        
        <footer className="bg-white border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-500 shrink-0">
          Powered by <a href="https://chatakeinnoworks.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">Chatake Innoworks</a> • © {new Date().getFullYear()} All rights reserved
        </footer>
      </div>
      
      </div>
      
      <style>{`
        .btn-add { width: 100%; padding: 12px; border: 2px dashed #cbd5e1; color: #64748b; font-weight: 600; border-radius: 8px; display: flex; justify-content: center; align-items: center; gap: 8px; transition: all 0.2s; }
        .btn-add:hover { background: #f1f5f9; color: #3b82f6; border-color: #93c5fd; }
        .card-item { background: #fff; padding: 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); position: relative; margin-bottom: 1rem; }
        .card-delete { position: absolute; top: 1rem; right: 1rem; color: #cbd5e1; }
        .card-delete:hover { color: #ef4444; }
      `}</style>
    </div>
  );
}