import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  LogOut, 
  Plus, 
  Minus,
  Save,
  Check,
  Loader2,
  Search,
  ChevronRight,
  ChevronDown,
  Sparkles,
  FileText,
  Printer,
  School,
  CalendarCheck,
  ClipboardList,
  FileCheck,
  ChevronUp,
  Pencil,
  Trash2,
  Download,
  Upload,
  User,
  ShieldCheck,
  Trophy,
  PlusCircle,
  MessageSquare,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, testConnection, handleFirestoreError, OperationType } from './lib/firebase';
import toast, { Toaster } from 'react-hot-toast';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  setDoc,
  serverTimestamp, 
  doc, 
  updateDoc, 
  deleteDoc,
  where,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { cn } from './lib/utils';

import * as XLSX from 'xlsx';

// --- Types ---
interface Student {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  panggilan: string;
  tempatLahir: string;
  tanggalLahir: string;
  jenisKelamin: string;
  agama: string;
  pendidikanSebelumnya: string;
  alamatPesertaDidik: string;
  namaAyah: string;
  namaIbu: string;
  pekerjaanAyah: string;
  pekerjaanIbu: string;
  teleponAyah: string;
  teleponIbu: string;
  alamatAyah: string;
  alamatIbu: string;
  namaWali: string;
  pekerjaanWali: string;
  alamatWali: string;
  teleponWali: string;
  classId: string;
}

interface Subject {
  id: string;
  order: number;
  name: string;
  minA: number;
  minB: number;
  minC: number;
  minD: number;
  tps?: { no: string; description: string }[];
}

interface SchoolInfo {
  id?: string;
  namaSekolah: string;
  npsn: string;
  alamat: string;
  telepon: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  website: string;
  email: string;
  pltKepala: string;
  nipKepala: string;
  guruKelas: string;
  nipGuru: string;
  kelas: string;
  fase: string;
  semester: string;
  tahunAjaran: string;
  tanggalRaporSts: string;
  tanggalRaporSas: string;
  logo?: string;
}

interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  semester: number;
  formativeScore: number;
  summativeScore: number;
  description: string;
  teacherId: string;
}

interface Class {
  id: string;
  name: string;
}

interface Settings {
  descA: string;
  descB: string;
  descC: string;
  descD: string;
}

// --- Components ---

function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    const t = toast.loading('Sedang masuk dengan Google...');
    try {
      await signInWithGoogle();
      toast.success('Berhasil masuk', { id: t });
    } catch (error: any) {
      console.error("Authentication error details:", error);
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup terblokir oleh browser!', { id: t });
        setLoginError('popup-blocked');
      } else if (error.code === 'auth/cancelled-popup-request') {
        toast.dismiss(t);
      } else if (error.code === 'auth/network-request-failed' || error.message?.includes('network-request-failed')) {
        toast.error('Sambungan jaringan Firebase Auth terhambat!', { id: t });
        setLoginError('network-error');
      } else {
        toast.error('Gagal masuk: ' + (error.message || 'Error tidak diketahui'), { id: t });
        setLoginError(error.message || 'Error tidak diketahui');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-white flex overflow-hidden">
      {/* Left Decoration Side */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 relative items-center justify-center overflow-hidden">
        {/* Animated Blobs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-500 rounded-full blur-[120px] opacity-50"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            x: [0, -40, 0],
            y: [0, 60, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-indigo-500 rounded-full blur-[120px] opacity-50"
        />

        {/* Floating Icons */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          {[GraduationCap, BookOpen, Sparkles, Users, FileText].map((Icon, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0.2, 0.5, 0.2],
                scale: [0.8, 1.1, 0.8],
                y: [0, -20, 0],
                x: [0, 10, 0]
              }}
              transition={{ 
                duration: 5 + idx, 
                repeat: Infinity, 
                delay: idx * 0.5 
              }}
              className="absolute text-white/20"
              style={{
                top: `${20 + (idx * 15)}%`,
                left: `${15 + (idx * 18)}%`,
              }}
            >
              <Icon size={48 + (idx * 12)} />
            </motion.div>
          ))}
        </div>

        <div className="relative z-20 text-center px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20 shadow-2xl">
              <GraduationCap size={48} className="text-white" />
            </div>
            <h2 className="text-5xl font-bold text-white mb-6 tracking-tight">Rapor Kurikulum Merdeka</h2>
            <p className="text-blue-100 text-lg max-w-md mx-auto leading-relaxed">
              Membantu guru mengolah nilai lebih cepat, akurat, dan cerdas.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Login Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-50">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-md w-full"
        >
          <div className="lg:hidden mb-12 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Rapor Kurikulum Merdeka</h1>
          </div>

          <div className="bg-blue-600 rounded-3xl shadow-2xl shadow-blue-200/50 p-10 border border-blue-500">
            <h2 className="text-3xl font-bold text-white mb-2">Selamat Datang</h2>
            <p className="text-blue-100 mb-10 text-sm">Masuk untuk mulai mengelola data siswa dan nilai rapor.</p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full flex items-center justify-center gap-3 bg-white text-blue-600 font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin text-blue-600" size={24} />
              ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              {isLoggingIn ? 'Memproses...' : 'Masuk dengan Google'}
            </motion.button>

            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-2xl bg-white border border-red-200 text-xs text-slate-800 space-y-3 shadow-md"
              >
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold text-sm">⚠️</span>
                  <div>
                    <p className="font-extrabold text-red-700">Masalah Autentikasi Terdeteksi</p>
                    {loginError === 'network-error' ? (
                      <p className="mt-1 font-semibold leading-relaxed text-slate-600">
                        Browser Anda memblokir sambungan Firebase Auth di dalam iframe AI Studio. 
                        Silakan buka aplikasi di <strong>Tab Baru</strong> untuk masuk dengan lancar.
                      </p>
                    ) : loginError === 'popup-blocked' ? (
                      <p className="mt-1 font-semibold leading-relaxed text-slate-600">
                        Pop-up masuk Google terblokir. Harap izinkan pop-up di browser Anda, atau buka aplikasi di tab baru.
                      </p>
                    ) : (
                      <p className="mt-1 font-semibold leading-relaxed text-slate-600">
                        Detail: {loginError}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="pt-1 flex gap-2">
                  <a 
                    href={window.location.href} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-200"
                  >
                    Buka Aplikasi di Tab Baru
                  </a>
                </div>
              </motion.div>
            )}

            <div className="mt-8 pt-8 border-t border-white/20">
              <p className="text-center text-xs text-blue-100 mb-4">
                Aplikasi ini hanya dapat diakses oleh guru yang terdaftar.
                <br /> Hubungi admin sekolah untuk akses lebih lanjut.
              </p>
              <div className="flex justify-center">
                <a 
                  href={window.location.href} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold bg-white/10 hover:bg-white/20 text-white transition-all border border-white/10"
                >
                  <Sparkles size={11} /> Buka di Tab Baru (Disarankan)
                </a>
              </div>
            </div>
          </div>
          
          <p className="mt-8 text-center text-slate-900 font-bold text-sm">
            &copy; 2026 - Created By De Rossi
          </p>
        </motion.div>
      </div>
    </div>
  );
}

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  subItems?: { id: string, label: string }[];
}

function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) {
  const { logout, user } = useAuth();
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const menuItems: MenuItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'school', label: 'Data Sekolah', icon: School },
    { id: 'students', label: 'Data Siswa', icon: Users },
    { id: 'subjects', label: 'Data Mata Pelajaran', icon: BookOpen },
    { 
      id: 'input-nilai', 
      label: 'Input Nilai', 
      icon: Pencil,
      subItems: [
        { id: 'grades-subject', label: 'Mata Pelajaran' },
        { id: 'grades-co', label: 'Kokurikuler' },
        { id: 'grades-extra', label: 'Ekstrakurikuler' },
      ]
    },
    { id: 'attendance', label: 'Data Absen', icon: CalendarCheck },
    { id: 'teacher-notes', label: 'Catatan Guru', icon: ClipboardList },
    { 
      id: 'print', 
      label: 'Cetak', 
      icon: Printer,
      subItems: [
        { id: 'print-sampul', label: 'Sampul Rapor' },
        { id: 'print-rapor-sas', label: 'Rapor SAS' },
        { id: 'print-leger-sas', label: 'Leger SAS' },
      ]
    },
  ];

  const handleTabClick = (item: MenuItem) => {
    if (item.subItems) {
      setOpenSubmenu(openSubmenu === item.id ? null : item.id);
    } else {
      setActiveTab(item.id);
      setOpenSubmenu(null);
    }
  };

  const handleLogout = async () => {
    const t = toast.loading('Sedang keluar...');
    try {
      await logout();
      toast.success('Berhasil keluar', { id: t });
    } catch (error) {
      toast.error('Gagal keluar');
    }
  };

  return (
    <div className="w-48 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shrink-0 print:hidden">
      <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="p-1 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/20">
            <GraduationCap className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">Rapor Merdeka</span>
        </div>
        
        <nav className="space-y-0.5">
          {menuItems.map((item) => (
            <div key={item.id} className="space-y-0.5">
              <button
                onClick={() => handleTabClick(item)}
                className={cn(
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl transition-all text-[11px] font-medium group",
                  activeTab === item.id || (item.subItems?.some(s => s.id === activeTab))
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon size={15} className={cn(
                    activeTab === item.id || (item.subItems?.some(s => s.id === activeTab)) ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  {item.label}
                </div>
                {item.subItems && (
                  openSubmenu === item.id ? <ChevronUp size={11} className="text-white/50" /> : <ChevronDown size={11} className="text-slate-500" />
                )}
              </button>
              
              <AnimatePresence>
                {item.subItems && openSubmenu === item.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="pl-2.5 mt-0.5 space-y-0.5 overflow-hidden"
                  >
                    {item.subItems.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => setActiveTab(sub.id)}
                        className={cn(
                          "w-full text-left px-7 py-1.5 rounded-lg text-[10px] transition-all duration-200",
                          activeTab === sub.id 
                            ? "text-white bg-white/10 font-bold" 
                            : "text-slate-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </nav>
      </div>

      <div className="p-3 border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-2 p-1.5 rounded-xl bg-white/5 border border-white/5">
          <img src={user?.photoURL || ''} className="w-7 h-7 rounded-full ring-2 ring-blue-500/30" alt="Avatar" />
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold truncate text-white uppercase tracking-tight">{user?.displayName}</p>
            <p className="text-[8px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 text-[10px] font-semibold text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
        >
          <LogOut size={12} />
          Keluar
        </button>
      </div>
    </div>
  );
}

// --- Tab Views ---

function DashboardView({ students, subjects }: { students: Student[], subjects: Subject[] }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Total Siswa', value: students.length, icon: Users, color: 'text-blue-200', bg: 'bg-blue-600' },
          { label: 'Total Mapel', value: subjects.length, icon: BookOpen, color: 'text-indigo-200', bg: 'bg-indigo-600' },
          { label: 'Rapor Siap', value: 0, icon: FileText, color: 'text-emerald-200', bg: 'bg-emerald-600' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(stat.bg, "p-5 rounded-3xl shadow-lg shadow-slate-200 relative overflow-hidden group")}
          >
            {/* Background Decoration */}
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="relative z-10">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center mb-4 border border-white/10">
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className={cn("text-[10px] font-semibold uppercase tracking-wider mb-0.5", stat.color)}>{stat.label}</p>
              <h3 className="text-2xl font-bold text-white tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Aktivitas Terbaru</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 text-slate-400 italic text-xs">
            Belum ada aktivitas terbaru.
          </div>
        </div>
      </div>
    </div>
  );
}

function StudentView({ students, subjects }: { students: Student[], subjects: Subject[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isConfirmingDeleteAll, setIsConfirmingDeleteAll] = useState(false);
  const [isConfirmingBulkUpload, setIsConfirmingBulkUpload] = useState<File | null>(null);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [activeTab, setActiveTab] = useState<'pribadi' | 'ortu' | 'wali'>('pribadi');
  const [formData, setFormData] = useState<Omit<Student, 'id'>>({
    nis: '',
    nisn: '',
    name: '',
    panggilan: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: 'Laki-laki',
    agama: 'Islam',
    pendidikanSebelumnya: '',
    alamatPesertaDidik: '',
    namaAyah: '',
    namaIbu: '',
    pekerjaanAyah: '',
    pekerjaanIbu: '',
    teleponAyah: '',
    teleponIbu: '',
    alamatAyah: '',
    alamatIbu: '',
    namaWali: '',
    pekerjaanWali: '',
    alamatWali: '',
    teleponWali: '',
    classId: 'default'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      nis: '',
      nisn: '',
      name: '',
      panggilan: '',
      tempatLahir: '',
      tanggalLahir: '',
      jenisKelamin: 'Laki-laki',
      agama: 'Islam',
      pendidikanSebelumnya: '',
      alamatPesertaDidik: '',
      namaAyah: '',
      namaIbu: '',
      pekerjaanAyah: '',
      pekerjaanIbu: '',
      teleponAyah: '',
      teleponIbu: '',
      alamatAyah: '',
      alamatIbu: '',
      namaWali: '',
      pekerjaanWali: '',
      alamatWali: '',
      teleponWali: '',
      classId: 'default'
    });
    setIsAdding(false);
    setEditingId(null);
    setActiveTab('pribadi');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = toast.loading(editingId ? 'Memperbarui data...' : 'Menyimpan data...');
    try {
      if (editingId) {
        await updateDoc(doc(db, 'students', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success('Data siswa diperbarui', { id: t });
      } else {
        await addDoc(collection(db, 'students'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success('Siswa baru berhasil ditambahkan', { id: t });
      }
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan data', { id: t });
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'students');
    }
  };

  const downloadTemplate = () => {
    toast.success('Mendownload template data siswa...');
    const headers = [
      "NIS", "NISN", "NAMA LENGKAP", "NAMA PANGGILAN", "TEMPAT LAHIR", "TANGGAL LAHIR", "JENIS KELAMIN", "AGAMA", "PENDIDIKAN SEBELUMNYA", "ALAMAT PESERTA DIDIK", 
      "NAMA AYAH", "NAMA IBU", "PEKERJAAN AYAH", "PEKERJAAN IBU", "TELEPON AYAH", "TELEPON IBU", "ALAMAT AYAH", "ALAMAT IBU",
      "NAMA WALI", "PEKERJAAN WALI", "ALAMAT WALI", "TELEPON WALI"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template_Siswa");
    XLSX.writeFile(wb, "Template_Data_Siswa.xlsx");
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Use state-based confirmation instead of window.confirm
    setIsConfirmingBulkUpload(file);

    // Clear the input so it can be triggered again even with same file
    if (e.target) e.target.value = '';
  };

  const executeBulkUpload = async (file: File) => {
    setIsConfirmingBulkUpload(null);
    const t = toast.loading('Memproses upload massal...');
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const data = evt.target?.result;
        if (!data) throw new Error("Gagal membaca file");
        
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

        if (jsonData.length < 2) {
          toast.error('File kosong atau format tidak sesuai (minimal harus ada header dan 1 baris data)', { id: t });
          return;
        }

        // Filter out empty rows (check if name is present)
        const validRows = jsonData.slice(1).filter(row => row && (row[2] || row[0] || row[1]));
        
        if (validRows.length === 0) {
          toast.error('Tidak ada data siswa yang valid ditemukan di file Excel', { id: t });
          return;
        }

        const snapshot = await getDocs(collection(db, 'students'));
        const existingIds = snapshot.docs.map(doc => doc.id);

        let batch = writeBatch(db);
        let operationCount = 0;

        // 1. Delete existing students
        for (const id of existingIds) {
          batch.delete(doc(db, 'students', id));
          operationCount++;
          if (operationCount >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            operationCount = 0;
          }
        }

        if (operationCount > 0) {
          await batch.commit();
          batch = writeBatch(db);
          operationCount = 0;
        }

        // Helper to safely get string from cell
        const s = (val: any) => val !== undefined && val !== null ? String(val).trim() : '';

        // 2. Add new students
        for (const row of validRows) {
          const studentRef = doc(collection(db, 'students'));
          batch.set(studentRef, {
            nis: s(row[0]),
            nisn: s(row[1]),
            name: s(row[2]) || 'Tanpa Nama',
            panggilan: s(row[3]),
            tempatLahir: s(row[4]),
            tanggalLahir: s(row[5]),
            jenisKelamin: s(row[6]) || 'Laki-laki',
            agama: s(row[7]) || 'Islam',
            pendidikanSebelumnya: s(row[8]),
            alamatPesertaDidik: s(row[9]),
            namaAyah: s(row[10]),
            namaIbu: s(row[11]),
            pekerjaanAyah: s(row[12]),
            pekerjaanIbu: s(row[13]),
            teleponAyah: s(row[14]),
            teleponIbu: s(row[15]),
            alamatAyah: s(row[16]),
            alamatIbu: s(row[17]),
            namaWali: s(row[18]),
            pekerjaanWali: s(row[19]),
            alamatWali: s(row[20]),
            teleponWali: s(row[21]),
            classId: 'default',
            createdAt: serverTimestamp()
          });
          operationCount++;

          if (operationCount >= 450) {
            await batch.commit();
            batch = writeBatch(db);
            operationCount = 0;
          }
        }

        if (operationCount > 0) {
          await batch.commit();
        }

        toast.success(`Berhasil mengimpor ${validRows.length} siswa`, { id: t });
      } catch (error) {
        console.error("Bulk upload failed:", error);
        toast.error('Gagal memproses upload: ' + (error instanceof Error ? error.message : 'Error tidak diketahui'), { id: t });
      }
    };
    reader.onerror = () => toast.error('Gagal membaca file', { id: t });
    reader.readAsArrayBuffer(file);
  };

  const startEdit = (student: Student) => {
    setFormData({
      nis: student.nis || '',
      nisn: student.nisn || '',
      name: student.name || '',
      panggilan: student.panggilan || '',
      tempatLahir: student.tempatLahir || '',
      tanggalLahir: student.tanggalLahir || '',
      jenisKelamin: student.jenisKelamin || 'Laki-laki',
      agama: student.agama || 'Islam',
      pendidikanSebelumnya: student.pendidikanSebelumnya || '',
      alamatPesertaDidik: student.alamatPesertaDidik || '',
      namaAyah: student.namaAyah || '',
      namaIbu: student.namaIbu || '',
      pekerjaanAyah: student.pekerjaanAyah || '',
      pekerjaanIbu: student.pekerjaanIbu || '',
      teleponAyah: student.teleponAyah || '',
      teleponIbu: student.teleponIbu || '',
      alamatAyah: student.alamatAyah || '',
      alamatIbu: student.alamatIbu || '',
      namaWali: student.namaWali || '',
      pekerjaanWali: student.pekerjaanWali || '',
      alamatWali: student.alamatWali || '',
      teleponWali: student.teleponWali || '',
      classId: student.classId || 'default'
    });
    setEditingId(student.id);
    setIsAdding(true);
  };

  const deleteStudent = async (id: string) => {
    if (confirm('Hapus siswa ini?')) {
      const t = toast.loading('Menghapus siswa...');
      try {
        await deleteDoc(doc(db, 'students', id));
        toast.success('Siswa berhasil dihapus', { id: t });
      } catch (error) {
        toast.error('Gagal menghapus siswa', { id: t });
        handleFirestoreError(error, OperationType.DELETE, 'students');
      }
    }
  };

  const initiateDeleteAll = () => {
    if (!students || students.length === 0) {
      toast.error('Tidak ada data siswa untuk dihapus');
      return;
    }
    setDeleteConfirmInput('');
    setIsConfirmingDeleteAll(true);
  };

  const executeDeleteAll = async () => {
    setIsConfirmingDeleteAll(false);
    const t = toast.loading('Sedang menghapus seluruh data siswa...');
    try {
      const snapshot = await getDocs(collection(db, 'students'));
      const ids = snapshot.docs.map(doc => doc.id);
      
      if (ids.length === 0) {
        toast.success('Database sudah kosong', { id: t });
        return;
      }

      let batch = writeBatch(db);
      let count = 0;
      
      for (const id of ids) {
        batch.delete(doc(db, 'students', id));
        count++;
        if (count >= 450) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }
      
      if (count > 0) {
        await batch.commit();
      }
      toast.success(`Berhasil menghapus ${ids.length} data siswa`, { id: t });
    } catch (error) {
      toast.error('Gagal menghapus data', { id: t });
      console.error("Delete all failed:", error);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm font-sans">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Manajemen Data Siswa</h2>
          <p className="text-xs text-slate-500">Kelola informasi lengkap peserta didik</p>
        </div>
        <div className="flex gap-2">
          <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-0.5">
            <button 
              onClick={downloadTemplate}
              className="px-3 py-1.5 text-slate-600 hover:bg-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1.5"
            >
              <Download size={12} /> Template
            </button>
            <label className="px-3 py-1.5 rounded-lg text-[10px] text-slate-600 hover:bg-white font-bold transition-all flex items-center gap-1.5 cursor-pointer">
              <Upload size={12} /> 
              Upload Massal
              <input type="file" className="hidden" accept=".xlsx,.csv" onChange={handleBulkUpload} />
            </label>
          </div>
          <button 
            onClick={() => { if(isAdding) resetForm(); else setIsAdding(true); }}
            className={cn(
               "px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all shadow-lg",
               isAdding ? "bg-slate-100 text-slate-600 shadow-none" : "bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700"
            )}
          >
            {isAdding ? "Tutup Form" : <><Plus size={14} /> Siswa Baru</>}
          </button>
          
          <button 
            onClick={initiateDeleteAll}
            disabled={students.length === 0}
            className={cn(
              "px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition-all border shadow-sm",
              students.length === 0 
                ? "bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed opacity-50 shadow-none border-dashed" 
                : "bg-red-50 text-red-600 border-red-100 hover:bg-red-100 shadow-red-100/50"
            )}
            title={students.length === 0 ? "Tidak ada data untuk dihapus" : "Hapus Semua Data Siswa"}
          >
            <Trash2 size={14} />
            Hapus Semua
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ height: 0, opacity: 0, scale: 0.95 }}
            animate={{ height: 'auto', opacity: 1, scale: 1 }}
            exit={{ height: 0, opacity: 0, scale: 0.95 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl space-y-8">
              {/* Custom Tabs */}
              <div className="flex gap-2 border-b border-slate-50 pb-2">
                {[
                  { id: 'pribadi', label: 'Identitas Pribadi', icon: User },
                  { id: 'ortu', label: 'Orang Tua', icon: Users },
                  { id: 'wali', label: 'Wali', icon: ShieldCheck }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all",
                      activeTab === tab.id 
                        ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600" 
                        : "text-slate-400 hover:bg-slate-50"
                    )}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'pribadi' && (
                  <>
                    <Field label="NIS" name="nis" value={formData.nis} onChange={handleInputChange} />
                    <Field label="NISN" name="nisn" value={formData.nisn} onChange={handleInputChange} />
                    <Field label="Nama Lengkap" name="name" value={formData.name} onChange={handleInputChange} fullWidth />
                    <Field label="Nama Panggilan" name="panggilan" value={formData.panggilan} onChange={handleInputChange} />
                    <Field label="Tempat Lahir" name="tempatLahir" value={formData.tempatLahir} onChange={handleInputChange} />
                    <Field label="Tanggal Lahir" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleInputChange} type="date" />
                    <Field label="Jenis Kelamin" name="jenisKelamin" value={formData.jenisKelamin} onChange={handleInputChange} type="select" options={['Laki-laki', 'Perempuan']} />
                    <Field label="Agama" name="agama" value={formData.agama} onChange={handleInputChange} />
                    <Field label="Pendidikan Sebelumnya" name="pendidikanSebelumnya" value={formData.pendidikanSebelumnya} onChange={handleInputChange} fullWidth />
                    <Field label="Alamat PD" name="alamatPesertaDidik" value={formData.alamatPesertaDidik} onChange={handleInputChange} fullWidth isTextArea />
                  </>
                )}

                {activeTab === 'ortu' && (
                  <>
                    <h3 className="md:col-span-3 text-sm font-bold text-blue-600 uppercase border-b border-blue-50 pb-2">Informasi Ayah</h3>
                    <Field label="Nama Ayah" name="namaAyah" value={formData.namaAyah} onChange={handleInputChange} />
                    <Field label="Pekerjaan Ayah" name="pekerjaanAyah" value={formData.pekerjaanAyah} onChange={handleInputChange} />
                    <Field label="Telepon Ayah" name="teleponAyah" value={formData.teleponAyah} onChange={handleInputChange} />
                    <Field label="Alamat Ayah" name="alamatAyah" value={formData.alamatAyah} onChange={handleInputChange} fullWidth />
                    
                    <h3 className="md:col-span-3 text-sm font-bold text-pink-600 uppercase border-b border-pink-50 pb-2 mt-4">Informasi Ibu</h3>
                    <Field label="Nama Ibu" name="namaIbu" value={formData.namaIbu} onChange={handleInputChange} />
                    <Field label="Pekerjaan Ibu" name="pekerjaanIbu" value={formData.pekerjaanIbu} onChange={handleInputChange} />
                    <Field label="Telepon Ibu" name="teleponIbu" value={formData.teleponIbu} onChange={handleInputChange} />
                    <Field label="Alamat Ibu" name="alamatIbu" value={formData.alamatIbu} onChange={handleInputChange} fullWidth />
                  </>
                )}

                {activeTab === 'wali' && (
                  <>
                    <Field label="Nama Wali" name="namaWali" value={formData.namaWali} onChange={handleInputChange} />
                    <Field label="Pekerjaan Wali" name="pekerjaanWali" value={formData.pekerjaanWali} onChange={handleInputChange} />
                    <Field label="Telepon Wali" name="teleponWali" value={formData.teleponWali} onChange={handleInputChange} />
                    <Field label="Alamat Wali" name="alamatWali" value={formData.alamatWali} onChange={handleInputChange} fullWidth />
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-slate-50">
                <button type="button" onClick={resetForm} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors">Batal</button>
                <button type="submit" className="px-12 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
                  {editingId ? "Update Data" : "Simpan Data"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto" style={{ maxHeight: '70vh' }}>
          <table className="w-full text-left border-collapse min-w-[1800px]">
            <thead className="sticky top-0 z-10 bg-slate-900">
              <tr className="text-white">
                <th className="px-3 py-2 text-[10px] font-bold uppercase w-10 text-center border border-slate-800">NO</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800">NIS / NISN</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800 text-center">NAMA LENGKAP</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800 text-center">JK</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800">TEMPAT/TGL LAHIR</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800">ALAMAT</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800">NAMA AYAH / IBU</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800">PEKERJAAN AYAH / IBU</th>
                <th className="px-4 py-2 text-[10px] font-bold uppercase border border-slate-800">NAMA / PEKERJAAN WALI</th>
                <th className="px-3 py-2 border border-slate-800 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, idx) => (
                <tr key={s.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-3 py-2 text-[10px] text-center border border-slate-50 text-slate-400 font-bold">{idx + 1}</td>
                  <td className="px-4 py-2 text-[10px] text-slate-600 border border-slate-50 ">{s.nis} / {s.nisn}</td>
                  <td className="px-4 py-2 text-[11px] font-bold uppercase text-slate-900 border border-slate-50 text-left">{s.name}</td>
                  <td className="px-4 py-2 text-[10px] text-center border border-slate-50">
                    <span className={cn(
                      "px-1.5 py-0.5 rounded-lg text-[9px] font-bold uppercase",
                      s.jenisKelamin === 'Laki-laki' ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700"
                    )}>
                      {s.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[10px] text-slate-600 border border-slate-50">{s.tempatLahir}, {s.tanggalLahir}</td>
                  <td className="px-4 py-2 text-[10px] text-slate-500 border border-slate-50 max-w-[150px] truncate">{s.alamatPesertaDidik}</td>
                  <td className="px-4 py-2 text-[10px] text-slate-600 border border-slate-50">
                    <div className="text-blue-700">{s.namaAyah || '-'}</div>
                    <div className="text-pink-700">{s.namaIbu || '-'}</div>
                  </td>
                  <td className="px-4 py-2 text-[10px] text-slate-500 border border-slate-50">
                    <div>{s.pekerjaanAyah || '-'}</div>
                    <div className="italic">{s.pekerjaanIbu || '-'}</div>
                  </td>
                  <td className="px-4 py-2 text-[10px] text-slate-600 border border-slate-50">
                    <div className="font-bold">{s.namaWali || '-'}</div>
                    <div className="text-slate-400">{s.pekerjaanWali || '-'}</div>
                  </td>
                  <td className="px-3 py-2 border border-slate-50 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button 
                        onClick={() => startEdit(s)}
                        className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg transition-all"
                      >
                        <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => deleteStudent(s.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="px-6 py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-slate-300" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Siswa</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                Gunakan tombol "Siswa Baru" atau "Upload Massal" untuk memasukkan data.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Overlay Dialog: Hapus Semua */}
      <AnimatePresence>
        {isConfirmingDeleteAll && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl border border-red-100 shadow-2xl max-w-md w-full p-8 relative overflow-hidden font-sans text-left"
            >
              {/* Top Warning Banner Accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-red-600 animate-pulse" />

              <div className="flex flex-col">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 border border-red-100/80">
                  <Trash2 size={24} />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Peringatan Bahaya Keamanan
                </h3>
                <p className="text-[10px] text-red-600 font-bold bg-red-50 px-2.5 py-1 rounded-full mt-2 border border-red-100 uppercase tracking-wider self-start">
                  HAPUS SELURUH MAHASISWA & RAPOR
                </p>

                <div className="mt-4 text-sm text-slate-600 space-y-3 leading-relaxed">
                  <p className="font-semibold text-slate-800">
                    Anda akan melenyapkan secara permanen <span className="text-red-600 font-extrabold text-lg underline">{students.length} data siswa</span> yang terdaftar.
                  </p>
                  <p className="p-3 bg-red-50/50 rounded-2xl border border-red-100 text-[11px] text-red-900 font-bold">
                    ⚠️ TINDAKAN KHUSUS: Seluruh nilai mata pelajaran, data absensi harian, laporan kegiatan ekstrakurikuler, dan catatan guru juga ikut terhapus selamanya.
                  </p>
                </div>

                {/* Confirm input label */}
                <div className="w-full mt-6 space-y-2">
                  <label className="block text-left text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Ketik <span className="text-red-600 font-black">HAPUS</span> untuk melanjutkan:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmInput}
                    onChange={(e) => setDeleteConfirmInput(e.target.value)}
                    placeholder="Ketik HAPUS..."
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-black tracking-widest text-slate-900 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 uppercase transition-all"
                  />
                </div>

                <div className="flex gap-3 w-full mt-8">
                  <button
                    onClick={() => {
                      setIsConfirmingDeleteAll(false);
                      setDeleteConfirmInput('');
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all text-xs"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => {
                      if (deleteConfirmInput.trim().toUpperCase() === 'HAPUS') {
                        executeDeleteAll();
                        setDeleteConfirmInput('');
                      } else {
                        toast.error('Kata konfirmasi salah. Harap ketik HAPUS dengan huruf besar.');
                      }
                    }}
                    disabled={deleteConfirmInput.trim().toUpperCase() !== 'HAPUS'}
                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold rounded-2xl transition-all text-xs disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-red-200"
                  >
                    Hapus Permanen
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Dynamic Overlay Dialog: Impor Massal */}
      <AnimatePresence>
        {isConfirmingBulkUpload && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl border border-amber-100 shadow-2xl max-w-md w-full p-8 relative overflow-hidden font-sans text-left"
            >
              {/* Top Warning Banner Accent */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-amber-500 animate-pulse" />

              <div className="flex flex-col">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6 border border-amber-100">
                  <FileSpreadsheet size={24} />
                </div>

                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Konfirmasi Impor Massal
                </h3>
                <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-full mt-2 border border-amber-200 uppercase tracking-wider self-start">
                  Unggah Format Template Excel
                </p>

                <div className="mt-4 text-sm text-slate-600 space-y-3 leading-relaxed w-full">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <p className="text-[10px] uppercase text-slate-400 font-extrabold tracking-wider">File Excel Terdeteksi:</p>
                    <p className="font-extrabold text-slate-800 text-xs truncate">{isConfirmingBulkUpload.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">Ukuran file: {(isConfirmingBulkUpload.size / 1024).toFixed(1)} KB</p>
                  </div>

                  <p className="p-3 bg-amber-50/80 rounded-2xl border border-amber-100 text-[11px] text-amber-900 font-bold leading-relaxed">
                    ⚠️ PERINGATAN: Unggah data massal ini akan MENGHAPUS secara permanen seluruh data siswa yang ada saat ini ({students.length} siswa) dan menggantinya dengan isi file excel ini.
                  </p>

                  <ul className="text-[11px] text-slate-500 space-y-1 pl-4 list-disc font-semibold">
                    <li>Gunakan format template resmi yang diunduh.</li>
                    <li>Pastikan baris data minimal berisi 1 siswa valid.</li>
                    <li>Setelah terunggah, data tidak dapat dikembalikan.</li>
                  </ul>
                </div>

                <div className="flex gap-3 w-full mt-8">
                  <button
                    onClick={() => {
                      setIsConfirmingBulkUpload(null);
                    }}
                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl transition-all text-xs"
                  >
                    Batalkan
                  </button>
                  <button
                    onClick={() => {
                      executeBulkUpload(isConfirmingBulkUpload);
                    }}
                    className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold rounded-2xl transition-all text-xs shadow-lg shadow-amber-200"
                  >
                    Mulai Impor
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Field = ({ label, name, value, onChange, type = 'text', options = [], fullWidth = false, isTextArea = false }: any) => (
  <div className={cn("flex flex-col gap-2", fullWidth ? "md:col-span-2 lg:col-span-3" : "")}>
    <label className="text-[13px] font-bold text-slate-900 uppercase tracking-wider ml-1">
      {label}
    </label>
    <div className="flex items-center gap-4 bg-blue-50/50 border border-blue-100 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300 transition-all">
      {type === 'select' ? (
        <div className="flex-1 relative">
          <select
            name={name}
            value={value}
            onChange={onChange}
            className="w-full bg-transparent outline-none text-slate-700 font-bold appearance-none cursor-pointer"
          >
            {options.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400" />
        </div>
      ) : type === 'date' ? (
        <input
          type="date"
          name={name}
          value={value}
          onChange={onChange}
          className="flex-1 bg-transparent outline-none text-slate-700 font-bold cursor-pointer"
        />
      ) : isTextArea ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Masukkan ${label.toLowerCase()}`}
          className="w-full bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-300 min-h-[100px] resize-none"
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={`Masukkan ${label.toLowerCase()}`}
          className="w-full bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-300"
        />
      )}
    </div>
  </div>
);

function GradeView({ 
  students, 
  subjects,
  activeOrder,
  setActiveOrder
}: { 
  students: Student[], 
  subjects: Subject[],
  activeOrder: number,
  setActiveOrder: (o: number) => void
}) {
  const [grades, setGrades] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<Settings>({
    descA: 'menunjukkan pemahaman',
    descB: 'memahami nilai-nilai',
    descC: 'memahami sebagian nilai-nilai',
    descD: 'masih perlu bimbingan/pendampingan'
  });
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const activeSubject = subjects.find(s => s.order === activeOrder);

  // Load Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'kktp'), (doc) => {
      if (doc.exists()) setSettings(doc.data() as Settings);
    }, (error) => {
      console.error("Settings snapshot failed", error);
    });
    return () => unsub();
  }, []);

  // Load Grades for active subject
  useEffect(() => {
    if (!activeSubject?.id) {
      setGrades({});
      return;
    }
    const q = query(collection(db, 'grades'), where('subjectId', '==', activeSubject.id));
    const unsub = onSnapshot(q, (snap) => {
      const gData: Record<string, any> = {};
      snap.docs.forEach(doc => {
        const data = doc.data();
        gData[data.studentId] = { id: doc.id, ...data };
      });
      setGrades(gData);
    }, (error) => {
      console.error("Grades snapshot failed", error);
    });
    return () => unsub();
  }, [activeSubject?.id]);

  const getPredikat = (score: number, subject: Subject | null | undefined) => {
    if (!subject) return "";
    if (score >= subject.minA) return settings.descA;
    if (score >= subject.minB) return settings.descB;
    if (score >= subject.minC) return settings.descC;
    return settings.descD;
  };

  const calculateRow = (studentId: string, currentGrades: any, activeMapping: Record<string, string>) => {
    const sGrades = currentGrades[studentId] || { tpScores: {}, sas: 0 };
    
    // Only count scores for TPs that are currently mapped in the headers
    const mappedTpNumbers = Object.values(activeMapping).filter(Boolean);
    const tpValues = mappedTpNumbers
      .map(tpNo => Number(sGrades.tpScores?.[tpNo]))
      .filter(v => !isNaN(v) && v > 0);
    
    const rataRata = tpValues.length > 0 ? Math.round(tpValues.reduce((a, b) => a + b, 0) / tpValues.length) : 0;
    const sas = Number(sGrades.sas || 0);
    const nilaiRapor = (rataRata > 0 || sas > 0) ? Math.round((rataRata + sas) / ((rataRata > 0 && sas > 0) ? 2 : 1)) : 0;

    let maxVal = -1;
    let minVal = 101;
    let maxTpNo = '';
    let minTpNo = '';

    mappedTpNumbers.forEach(tpNo => {
      const score = Number(sGrades.tpScores?.[tpNo]);
      if (!isNaN(score) && score > 0) {
        if (score > maxVal) { maxVal = score; maxTpNo = tpNo; }
        if (score < minVal) { minVal = score; minTpNo = tpNo; }
      }
    });

    const descMaxTP = activeSubject?.tps?.find(t => t.no === maxTpNo)?.description || '';
    const descMinTP = activeSubject?.tps?.find(t => t.no === minTpNo)?.description || '';

    const predikatMax = maxVal >= 0 ? getPredikat(maxVal, activeSubject) : '';
    const predikatMin = (minVal >= 0 && minVal <= 100) ? getPredikat(minVal, activeSubject) : '';

    const deskripsiMax = descMaxTP ? `Ananda ${predikatMax} dalam ${descMaxTP}.` : '';
    const deskripsiMin = descMinTP ? `Ananda ${predikatMin} dalam ${descMinTP}.` : '';

    return { rataRata, nilaiRapor, deskripsiMax, deskripsiMin };
  };

  const [colMapping, setColMapping] = useState<Record<string, string>>({
    "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "", "7": "", "8": "", "9": "", "10": ""
  });
  const [isSavingMapping, setIsSavingMapping] = useState<boolean | null>(false);
  const [lastSavedMapping, setLastSavedMapping] = useState("");

  // Load Mapping for active subject
  useEffect(() => {
    if (!activeSubject?.id) return;
    
    const defaultMap = { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5", "6": "", "7": "", "8": "", "9": "", "10": "" };
    setColMapping(defaultMap); 
    setLastSavedMapping(""); // Critical: trigger check for auto-save only after load

    const unsub = onSnapshot(doc(db, 'mappings', activeSubject.id), (doc) => {
      if (doc.exists()) {
        const data = doc.data().mapping;
        setColMapping(data);
        setLastSavedMapping(JSON.stringify(data));
      } else {
        setColMapping(defaultMap);
        setLastSavedMapping(JSON.stringify(defaultMap));
      }
    }, (error) => {
      console.error("Mapping snapshot failed", error);
      setColMapping(defaultMap);
      setLastSavedMapping(JSON.stringify(defaultMap));
    });
    return () => unsub();
  }, [activeSubject?.id]);

  // Auto-save mapping when it changes
  useEffect(() => {
    if (!activeSubject?.id) return;
    const currentStr = JSON.stringify(colMapping);
    if (lastSavedMapping && currentStr !== lastSavedMapping) {
      const timeout = setTimeout(async () => {
        try {
          await setDoc(doc(db, 'mappings', activeSubject.id), {
            subjectId: activeSubject.id,
            mapping: colMapping,
            updatedAt: serverTimestamp()
          });
          setLastSavedMapping(currentStr);
        } catch (error) {
          console.error("Auto-save mapping failed", error);
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [colMapping, activeSubject?.id, lastSavedMapping]);

  const handleSaveAll = async () => {
    if (!activeSubject) return;
    setIsSavingMapping(true);
    const t = toast.loading('Menyimpan seluruh data nilai...');
    try {
      const batch = writeBatch(db);
      
      // 1. Save Mapping
      const mappingData = {
        subjectId: activeSubject.id,
        mapping: colMapping,
        updatedAt: serverTimestamp()
      };
      batch.set(doc(db, 'mappings', activeSubject.id), mappingData);

      // 2. Save all current grades for students in the list
      students.forEach(s => {
        const sGrade = grades[s.id] || { tpScores: {}, sas: 0 };
        const { rataRata, nilaiRapor, deskripsiMax, deskripsiMin } = calculateRow(s.id, grades, colMapping);
        
        const sanitizedTpScores: Record<string, number> = {};
        Object.entries(sGrade.tpScores || {}).forEach(([no, val]) => {
          const num = Number(val);
          if (!isNaN(num) && num !== 0) sanitizedTpScores[no] = num;
        });

        const finalData = {
          studentId: s.id,
          subjectId: activeSubject.id,
          tpScores: sanitizedTpScores,
          sas: Number(sGrade.sas) || 0,
          rataRata,
          nilaiRapor,
          deskripsiMax,
          deskripsiMin,
          updatedAt: serverTimestamp()
        };

        if (sGrade.id) {
          batch.update(doc(db, 'grades', sGrade.id), finalData);
        } else {
          const newDocRef = doc(collection(db, 'grades'));
          batch.set(newDocRef, finalData);
        }
      });

      await batch.commit();
      setLastSavedMapping(JSON.stringify(colMapping));
      toast.success('Seluruh nilai berhasil disimpan', { id: t });
    } catch (error) {
      console.error("Save all failed", error);
      toast.error("Gagal menyimpan nilai", { id: t });
    } finally {
      setIsSavingMapping(null);
      setTimeout(() => setIsSavingMapping(false), 2000);
    }
  };

  const handleScoreChange = async (studentId: string, field: string, value: any, tpNo?: string) => {
    if (!activeSubject) return;

    const newGrades = { ...grades };
    if (!newGrades[studentId]) {
      newGrades[studentId] = { studentId, subjectId: activeSubject.id, tpScores: {}, sas: 0 };
    }

    if (tpNo) {
      newGrades[studentId].tpScores = {
        ...(newGrades[studentId].tpScores || {}),
        [tpNo]: value === "" ? "" : Number(value)
      };
    } else {
      newGrades[studentId][field] = value;
    }

    const { rataRata, nilaiRapor, deskripsiMax, deskripsiMin } = calculateRow(studentId, newGrades, colMapping);
    
    // Sanitize data for Firestore
    const sanitizedTpScores: Record<string, number> = {};
    Object.entries(newGrades[studentId].tpScores || {}).forEach(([no, val]) => {
      const num = Number(val);
      if (!isNaN(num) && num !== 0) sanitizedTpScores[no] = num;
    });

    const finalData = {
      studentId,
      subjectId: activeSubject.id,
      tpScores: sanitizedTpScores,
      sas: Number(newGrades[studentId].sas) || 0,
      rataRata,
      nilaiRapor,
      deskripsiMax,
      deskripsiMin,
      updatedAt: serverTimestamp()
    };

    setGrades(newGrades); // Instant UI update

    // Save to Firestore
    setIsSaving(studentId);
    try {
      if (newGrades[studentId].id) {
        await updateDoc(doc(db, 'grades', newGrades[studentId].id), finalData);
      } else {
        const docRef = await addDoc(collection(db, 'grades'), finalData);
        newGrades[studentId].id = docRef.id;
        setGrades({ ...newGrades });
      }
    } catch (error) {
      console.error("Save grade failed", error);
    } finally {
      setIsSaving(null);
    }
  };

  return (
    <div className="space-y-4 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-xl gap-4">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">No. Mapel</label>
            <div className="flex items-center bg-blue-50 border border-blue-100 rounded-xl p-0.5">
              <button 
                onClick={() => setActiveOrder(Math.max(1, activeOrder - 1))}
                className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-white rounded-lg transition-all"
              >
                <Minus size={14} />
              </button>
              <span className="w-8 text-center font-bold text-sm text-slate-900">{activeOrder}</span>
              <button 
                onClick={() => setActiveOrder(Math.min(15, activeOrder + 1))}
                className="w-8 h-8 flex items-center justify-center text-blue-600 hover:bg-white rounded-lg transition-all"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 md:w-64">
            <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest ml-1">Mata Pelajaran</label>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-2 font-bold text-slate-800 shadow-inner text-sm">
              {activeSubject ? activeSubject.name : <span className="text-slate-300 italic text-xs">Belum Didaftarkan</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="flex-1 md:w-24 bg-blue-600 p-2.5 rounded-2xl text-white text-center shadow-lg shadow-blue-200">
            <p className="text-[8px] uppercase font-bold opacity-70">Total Siswa</p>
            <p className="text-xl font-black">{students.length}</p>
          </div>
          <div className="flex-1 md:w-24 bg-emerald-600 p-2.5 rounded-2xl text-white text-center shadow-lg shadow-emerald-200">
            <p className="text-[8px] uppercase font-bold opacity-70">Total TP</p>
            <p className="text-xl font-black">{activeSubject?.tps?.length || 0}</p>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <button 
            onClick={handleSaveAll}
            disabled={isSavingMapping === true}
            className={cn(
              "w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-white shadow-xl transition-all flex items-center justify-center gap-2.5 active:scale-95",
              isSavingMapping === null ? "bg-emerald-500 shadow-emerald-200" : 
              isSavingMapping === true ? "bg-slate-400 cursor-not-allowed" :
              "bg-blue-600 shadow-blue-200 hover:shadow-2xl hover:-translate-y-0.5"
            )}
          >
            {isSavingMapping === true ? (
              <Loader2 className="animate-spin" size={20} />
            ) : isSavingMapping === null ? (
              <Check size={20} />
            ) : (
              <Save size={20} />
            )}
            <div className="text-left">
              <p className="text-[9px] uppercase font-black opacity-70 leading-none mb-0.5">Konfirmasi & Simpan</p>
              <p className="text-sm leading-none">Simpan Semua Data</p>
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border-2 border-slate-900 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1600px]">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th rowSpan={2} className="px-3 py-3 text-[9px] font-bold uppercase text-center w-10 border border-slate-800">NO</th>
                <th rowSpan={2} className="px-4 py-3 text-[9px] font-bold uppercase border border-slate-800 min-w-[120px] text-center">NIS / NISN</th>
                <th rowSpan={2} className="px-4 py-3 text-[9px] font-bold uppercase border border-slate-800 min-w-[200px] text-center">NAMA LENGKAP</th>
                <th colSpan={10} className="px-4 py-2 text-[9px] font-bold uppercase text-center border border-slate-800 bg-blue-800">SUMATIF LINGKUP MATERI (TP)</th>
                <th rowSpan={2} className="px-1 py-3 text-[9px] font-bold uppercase text-center border border-slate-800 bg-indigo-900 w-20">RATA RATA</th>
                <th rowSpan={2} className="px-1 py-3 text-[9px] font-bold uppercase text-center border border-slate-800 bg-pink-900 w-20">SAS</th>
                <th rowSpan={2} className="px-1 py-3 text-[9px] font-bold uppercase text-center border border-slate-800 bg-emerald-900 w-20">NILAI RAPOR</th>
                <th colSpan={2} className="px-4 py-2 text-[9px] font-bold uppercase text-center border border-slate-800 bg-slate-800">DESKRIPSI CAPAIAN KOMPETENSI</th>
              </tr>
              <tr className="bg-slate-800 text-white">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(no => (
                  <th key={no} className="p-0 border border-slate-700 w-18 relative">
                    <select 
                      value={colMapping[String(no)] || ""}
                      onChange={(e) => setColMapping(prev => ({ ...prev, [String(no)]: e.target.value }))}
                      className="w-full bg-slate-700 text-white text-[10px] font-bold text-center py-1.5 h-full appearance-none outline-none focus:bg-blue-600 transition-colors cursor-pointer"
                    >
                      <option key="off" value="">Off</option>
                      {activeSubject?.tps?.map((tp, tIdx) => (
                        <option key={`${tp.no}-${tIdx}`} value={tp.no}>{tp.no}</option>
                      ))}
                    </select>
                  </th>
                ))}
                <th key="static-tertinggi" className="px-4 py-1.5 text-[9px] font-bold text-center border border-slate-700 min-w-[400px]">TERTINGGI</th>
                <th key="static-terendah" className="px-4 py-1.5 text-[9px] font-bold text-center border border-slate-700 min-w-[400px]">TERENDAH</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((s, idx) => {
                const sGrade = grades[s.id] || { tpScores: {}, sas: 0 };
                const { rataRata, nilaiRapor, deskripsiMax, deskripsiMin } = calculateRow(s.id, grades, colMapping);

                return (
                  <tr key={s.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td key="col-no" className="px-3 py-2 text-[10px] text-center border border-slate-200 text-slate-400 font-bold bg-slate-50/50">{idx + 1}</td>
                    <td key="col-nis" className="px-4 py-2 text-[10px] text-slate-500 border border-slate-200 font-mono text-center">{s.nis} / {s.nisn}</td>
                    <td key="col-name" className="px-4 py-2 text-[11px] font-bold uppercase text-slate-900 border border-slate-200 text-left">{s.name}</td>
                    
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((no, colIdx) => {
                      const tpNo = colMapping[String(no)];
                      return (
                        <td key={`tp-${colIdx}`} className={cn("p-0 border border-slate-200 w-18", !tpNo && "bg-slate-100/30")}>
                          <input 
                            type="number"
                            disabled={!tpNo}
                            placeholder={tpNo ? `${tpNo}` : ""}
                            value={tpNo ? (sGrade.tpScores?.[tpNo] || "") : ""}
                            onChange={(e) => handleScoreChange(s.id, 'tpScores', e.target.value, tpNo)}
                            className={cn(
                              "w-full h-9 text-center font-bold text-slate-700 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-all text-xs",
                              !tpNo && "cursor-not-allowed placeholder:opacity-0"
                            )}
                          />
                        </td>
                      );
                    })}

                    <td key="col-rata" className="px-1 py-2 text-xs text-center border border-slate-200 bg-indigo-50 font-black text-indigo-700 w-16">
                      {rataRata}
                    </td>

                    <td key="col-sas" className="p-0 border border-slate-200 bg-pink-50/10 w-18">
                      <input 
                        type="number"
                        value={sGrade.sas || ''}
                        onChange={(e) => handleScoreChange(s.id, 'sas', e.target.value)}
                        className="w-full h-9 text-center font-bold text-pink-700 bg-transparent outline-none focus:bg-white focus:ring-1 focus:ring-pink-500 transition-all text-xs"
                      />
                    </td>

                    <td key="col-rapor" className="px-1 py-1 text-xs text-center border border-slate-200 bg-emerald-50 font-black text-emerald-700 w-16">
                      {nilaiRapor}
                    </td>

                    <td key="col-desc-max" className="px-3 py-2 text-[9px] text-slate-600 border border-slate-200 bg-slate-50/20 max-w-[600px] leading-relaxed italic align-top">
                      {deskripsiMax && (
                        <div className="flex items-start gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                          <span>{deskripsiMax}</span>
                        </div>
                      )}
                    </td>
                    <td key="col-desc-min" className="px-3 py-2 text-[9px] text-slate-600 border border-slate-200 bg-slate-100/20 max-w-[600px] leading-relaxed italic align-top">
                      {deskripsiMin && (
                        <div className="flex items-start gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1 shrink-0" />
                          <span>{deskripsiMin}</span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {students.length === 0 && (
            <div className="px-6 py-20 text-center bg-slate-50">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Users className="text-slate-200" size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Belum Ada Data Siswa</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mt-1">
                Silakan input data siswa terlebih dahulu di menu Data Siswa.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SubjectView({ subjects }: { subjects: Subject[] }) {
  const [activeOrder, setActiveOrder] = useState(1);
  const [settings, setSettings] = useState<Settings>({
    descA: 'Menunjukkan penguasaan materi yang sangat baik',
    descB: 'Menunjukkan penguasaan materi yang baik',
    descC: 'Menunjukkan penguasaan materi yang cukup',
    descD: 'Perlu bimbingan dalam penguasaan materi'
  });
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [formData, setFormData] = useState<Omit<Subject, 'id'>>({
    order: 1,
    name: '',
    minA: 0,
    minB: 0,
    minC: 0,
    minD: 0,
    tps: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load Settings
  useEffect(() => {
    const q = doc(db, 'settings', 'kktp');
    const unsub = onSnapshot(q, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      }
    }, (error) => {
      console.error("SubjectView settings snapshot failed", error);
    });
    return () => unsub();
  }, []);

  // Load data when activeOrder changes
  useEffect(() => {
    const existingSubject = subjects.find(s => s.order === activeOrder);
    if (existingSubject) {
      setFormData({
        order: existingSubject.order,
        name: existingSubject.name || '',
        minA: existingSubject.minA || 0,
        minB: existingSubject.minB || 0,
        minC: existingSubject.minC || 0,
        minD: existingSubject.minD || 0,
        tps: existingSubject.tps || []
      });
      setEditingId(existingSubject.id);
    } else {
      setFormData({
        order: activeOrder,
        name: '',
        minA: 0,
        minB: 0,
        minC: 0,
        minD: 0,
        tps: []
      });
      setEditingId(null);
    }
  }, [activeOrder, subjects]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'name' ? value : Number(value) 
    }));
  };

  const handleTPChange = (index: number, field: 'no' | 'description', value: string) => {
    const newTPs = [...(formData.tps || [])];
    newTPs[index] = { ...newTPs[index], [field]: value };
    setFormData(prev => ({ ...prev, tps: newTPs }));
  };

  const addTPRow = () => {
    setFormData(prev => ({ 
      ...prev, 
      tps: [...(prev.tps || []), { no: '', description: '' }] 
    }));
  };

  const removeTPRow = (index: number) => {
    const newTPs = [...(formData.tps || [])];
    newTPs.splice(index, 1);
    setFormData(prev => ({ ...prev, tps: newTPs }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    const t = toast.loading('Menyimpan mata pelajaran...');
    try {
      if (editingId) {
        await updateDoc(doc(db, 'subjects', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success('Mata pelajaran diperbarui', { id: t });
      } else {
        await addDoc(collection(db, 'subjects'), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success('Mata pelajaran ditambahkan', { id: t });
      }
    } catch (error) {
      toast.error('Gagal menyimpan mata pelajaran', { id: t });
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'subjects');
    } finally {
      setIsSaving(false);
    }
  };

  const ubahUrut = (delta: number) => {
    const newVal = Math.max(1, Math.min(15, activeOrder + delta));
    setActiveOrder(newVal);
  };

  const handleSettingsSave = async () => {
    const t = toast.loading('Menyimpan pengaturan kriteria...');
    try {
      await setDoc(doc(db, 'settings', 'kktp'), settings);
      setIsEditingSettings(false);
      toast.success('Pengaturan kriteria disimpan', { id: t });
    } catch (error) {
      toast.error('Gagal menyimpan pengaturan', { id: t });
      handleFirestoreError(error, OperationType.WRITE, 'settings/kktp');
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Pengaturan Mata Pelajaran</h2>
          <p className="text-xs text-slate-500">Sesuaikan urutan, KKM, dan Tujuan Pembelajaran</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2 text-xs"
          >
            <Pencil size={14} />
            Edit Deskripsi Global
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 text-xs"
          >
            {isSaving ? <div className="animate-spin rounded-full h-3 w-3 border-2 border-white/30 border-t-white" /> : <FileText size={14} />}
            Simpan Data Mapel
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isEditingSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-blue-600 p-5 rounded-2xl text-white space-y-4 shadow-xl shadow-blue-200 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-md font-bold">Edit Deskripsi Kriteria (Global)</h3>
                <button onClick={() => setIsEditingSettings(false)} className="p-1.5 hover:bg-white/10 rounded-lg">
                  <Minus size={16} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['A', 'B', 'C', 'D'].map((grade) => (
                  <div key={grade} className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase opacity-70">Deskripsi Nilai {grade}</label>
                    <input 
                      value={(settings as any)[`desc${grade}`]}
                      onChange={(e) => setSettings(prev => ({ ...prev, [`desc${grade}`]: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-xl p-2.5 text-xs text-white outline-none focus:bg-white/20"
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleSettingsSave}
                  className="px-6 py-2 text-xs bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors"
                >
                  Simpan Deskripsi
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xl space-y-6">
        {/* Spinner & Name */}
        <div className="flex flex-col md:flex-row gap-6 items-end border-b border-slate-50 pb-5">
          <div className="w-full md:w-auto">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-1.5 block">No. Urut</label>
            <div className="flex items-center bg-blue-50/50 border border-blue-200 rounded-xl p-0.5 shadow-sm">
              <button 
                type="button"
                onClick={() => ubahUrut(-1)}
                className="w-12 h-12 flex items-center justify-center text-blue-600 hover:bg-white rounded-xl transition-all"
              >
                <Minus size={20} />
              </button>
              <input 
                type="text" 
                readOnly 
                value={activeOrder} 
                className="w-16 bg-transparent text-center font-bold text-xl text-slate-900 outline-none" 
              />
              <button 
                type="button"
                onClick={() => ubahUrut(1)}
                className="w-12 h-12 flex items-center justify-center text-blue-600 hover:bg-white rounded-xl transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 w-full">
            <label className="text-[13px] font-bold text-blue-600 uppercase tracking-wider ml-1 mb-2 block">Nama Mata Pelajaran</label>
            <div className="flex items-center bg-white border border-slate-200 rounded-2xl p-4 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all shadow-sm">
              <input
                required
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Contoh: Pendidikan Pancasila"
                className="w-full bg-transparent outline-none text-slate-900 font-bold placeholder:text-slate-300 text-lg"
              />
            </div>
          </div>
        </div>

        {/* KKM Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ClipboardList size={16} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Kriteria Ketercapaian (KKM)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['A', 'B', 'C', 'D'].map((grade) => (
              <div key={grade} className="p-4 bg-slate-50 border border-slate-100 rounded-3xl group transition-all hover:shadow-md hover:bg-white">
                <div className="grid grid-cols-4 gap-4 items-end">
                  <div className="col-span-1">
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Nilai {grade}</label>
                    <input
                      type="number"
                      name={`min${grade}`}
                      value={(formData as any)[`min${grade}`]}
                      onChange={handleInputChange}
                      placeholder="0-100"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-slate-900 font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-[11px] font-bold text-slate-500 mb-1 block">Deskripsi kriteria</label>
                    <input
                      type="text"
                      readOnly
                      value={(settings as any)[`desc${grade}`]}
                      placeholder="Kriteria kualifikasi nilai..."
                      className="w-full bg-white/50 border border-slate-100 rounded-xl p-3 text-slate-400 font-medium text-sm outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TP Section */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <FileCheck size={16} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-sm">Daftar Tujuan Pembelajaran (TP)</h3>
            </div>
            <button 
              onClick={addTPRow}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-lg shadow-emerald-100"
            >
              <Plus size={14} />
              Tambah TP
            </button>
          </div>

          <div className="overflow-hidden border border-slate-100 rounded-3xl shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50">
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider w-32 border-r border-slate-100 text-center">No. TP</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Deskripsi Tujuan Pembelajaran</th>
                  <th className="px-4 py-4 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(formData.tps || []).map((tp, idx) => (
                  <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 border-r border-slate-100">
                      <input 
                        type="text" 
                        value={tp.no}
                        onChange={(e) => handleTPChange(idx, 'no', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-center font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="3.1.1"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="text" 
                        value={tp.description}
                        onChange={(e) => handleTPChange(idx, 'description', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 font-medium outline-none focus:ring-2 focus:ring-blue-500/20"
                        placeholder="Tuliskan deskripsi TP di sini..."
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => removeTPRow(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <LogOut size={16} className="rotate-90" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(formData.tps || []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                      Tidak ada Tujuan Pembelajaran untuk mata pelajaran ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchoolView({ info }: { info: SchoolInfo | null }) {
  const [formData, setFormData] = useState<SchoolInfo>({
    namaSekolah: '',
    npsn: '',
    alamat: '',
    telepon: '',
    kelurahan: '',
    kecamatan: '',
    kabupaten: '',
    provinsi: '',
    website: '',
    email: '',
    pltKepala: '',
    nipKepala: '',
    guruKelas: '',
    nipGuru: '',
    kelas: '',
    fase: '',
    semester: 'Ganjil',
    tahunAjaran: '',
    tanggalRaporSts: '',
    tanggalRaporSas: '',
    logo: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (info) {
      setFormData(info);
      setLogoPreview(info.logo || null);
    }
  }, [info]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes('png')) {
      alert('Hanya diperbolehkan format PNG');
      return;
    }

    if (file.size > 500000) {
      alert('Ukuran file terlalu besar. Maksimal 500KB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (evt) => {
      const base64 = evt.target?.result as string;
      setLogoPreview(base64);
      setFormData(prev => ({ ...prev, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const formatDateToIndonesian = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // Try parsing manual dd/mm/yy
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return formatIndonesianDate(d);
      }
      return dateStr;
    }
    return formatIndonesianDate(date);
  };

  const formatIndonesianDate = (date: Date) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleSave = async () => {
    setIsSaving(true);
    const t = toast.loading('Menyimpan data sekolah...');
    try {
      if (info?.id) {
        await setDoc(doc(db, 'school_info', info.id), formData);
      } else {
        await addDoc(collection(db, 'school_info'), formData);
      }
      toast.success('Data sekolah berhasil disimpan', { id: t });
    } catch (error) {
      toast.error('Gagal menyimpan data sekolah', { id: t });
      handleFirestoreError(error, OperationType.WRITE, 'school_info');
    } finally {
      setIsSaving(false);
    }
  };

  const fields = [
    { label: 'Nama Sekolah', name: 'namaSekolah' },
    { label: 'NPSN', name: 'npsn' },
    { label: 'Alamat', name: 'alamat' },
    { label: 'Telepon', name: 'telepon' },
    { label: 'Kelurahan', name: 'kelurahan' },
    { label: 'Kecamatan', name: 'kecamatan' },
    { label: 'Kabupaten', name: 'kabupaten' },
    { label: 'Provinsi', name: 'provinsi' },
    { label: 'Website', name: 'website' },
    { label: 'Email', name: 'email' },
    { label: 'Kepala Sekolah', name: 'pltKepala' },
    { label: 'NIP.', name: 'nipKepala' },
    { label: 'Guru Kelas', name: 'guruKelas' },
    { label: 'NIP.', name: 'nipGuru' },
    { label: 'Kelas', name: 'kelas' },
    { label: 'Fase', name: 'fase' },
    { label: 'Semester', name: 'semester', type: 'select', options: ['Ganjil', 'Genap'] },
    { label: 'Tahun Ajaran', name: 'tahunAjaran' },
    { label: 'Tanggal Rapor STS/ATS', name: 'tanggalRaporSts', type: 'date' },
    { label: 'Tanggal Rapor SAS/SAT', name: 'tanggalRaporSas', type: 'date' },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/50">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Data Sekolah</h2>
          <p className="text-xs text-slate-500 mt-0.5">Lengkapi informasi identitas sekolah di sini.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50"
        >
          {isSaving ? "Menyimpan..." : <><Plus size={16} /> Simpan Perubahan</>}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 mb-8">
        <div className="flex-shrink-0">
          <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider mb-2 block">Logo Sekolah (PNG)</label>
          <div className="relative group">
            <div className={cn(
              "w-48 h-48 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all",
              logoPreview ? "border-blue-600 bg-white" : "bg-slate-50 hover:bg-slate-100 hover:border-blue-300"
            )}>
              {logoPreview ? (
                <img src={logoPreview} className="w-full h-full object-contain p-4" alt="School Logo" />
              ) : (
                <div className="text-center p-4">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-[10px] text-slate-400 font-medium">Klik atau drop logo PNG di sini</p>
                </div>
              )}
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                accept="image/png" 
                onChange={handleLogoUpload}
              />
            </div>
            {logoPreview && (
              <button 
                onClick={() => { setLogoPreview(null); setFormData(prev => ({ ...prev, logo: '' })); }}
                className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </div>
        
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {fields.slice(0, 10).map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider ml-1">
                {field.label}
              </label>
              <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300 transition-all">
                <input
                  type="text"
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  className="w-full bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-300"
                />
                <span className="text-blue-200 font-bold">:</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {fields.slice(10).map((field) => (
          <div key={field.name} className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-900 uppercase tracking-wider ml-1">
              {field.label}
            </label>
            <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 rounded-xl p-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-300 transition-all">
              {field.type === 'select' ? (
                <div className="flex-1 relative">
                  <select
                    name={field.name}
                    value={(formData as any)[field.name]}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-slate-700 font-bold appearance-none cursor-pointer"
                  >
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-blue-400" />
                </div>
              ) : field.type === 'date' ? (
                <div className="flex-1 flex items-center gap-2 group relative">
                  <input
                    type="text"
                    name={field.name}
                    value={formatDateToIndonesian((formData as any)[field.name])}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData(prev => ({ ...prev, [field.name]: val }));
                    }}
                    placeholder="dd/mm/yyyy"
                    className="flex-1 bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-300"
                  />
                  <div className="relative">
                    <CalendarCheck size={18} className="text-blue-600 cursor-pointer hover:scale-110 transition-transform" />
                    <input 
                      type="date"
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, [field.name]: e.target.value }));
                      }}
                    />
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  name={field.name}
                  value={(formData as any)[field.name]}
                  onChange={handleChange}
                  placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  className="w-full bg-transparent outline-none text-slate-700 font-bold placeholder:text-slate-300"
                />
              )}
              <span className="text-blue-200 font-bold">:</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Main App Shell ---


function KokurikulerView({ students }: { students: Student[] }) {
  const [kokurikulerData, setKokurikulerData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  const dimensiMap = [
    "Keimanan & Ketakwaan",
    "Kewargaan",
    "Penalaran Kritis",
    "Kreativitas",
    "Kolaborasi",
    "Kemandirian",
    "Kesehatan",
    "Komunikasi"
  ];

  const dimensiDeskripsiMap: Record<number, string> = {
    0: "beriman dan bertakwa kepada Tuhan YME",
    1: "kewargaan",
    2: "berpikir kritis",
    3: "berkreasi",
    4: "berkolaborasi",
    5: "kemandirian",
    6: "menjaga kesehatan",
    7: "berkomunikasi"
  };

  const skorToPredikat: Record<string, number> = {
    "Sangat baik": 4,
    "Baik": 3,
    "Cukup baik": 2,
    "Masih perlu berlatih": 1
  };

  const options = ['', 'Sangat baik', 'Baik', 'Cukup baik', 'Masih perlu berlatih'];

  useEffect(() => {
    const q = query(collection(db, 'kokurikuler'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Record<string, any> = {};
      snap.docs.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setKokurikulerData(data);
    }, (error) => {
      console.error("Kokurikuler snapshot failed", error);
    });
    return () => unsub();
  }, []);

  const generateDeskripsi = (studentId: string, kegiatan: string, scores: Record<string, string>) => {
    if (!kegiatan.trim()) return "";

    const student = students.find(s => s.id === studentId);
    const panggilan = student?.panggilan || student?.name.split(' ')[0] || "Siswa";

    const topScores: any[] = [];
    Object.entries(scores).forEach(([idx, val]) => {
      if (val && skorToPredikat[val]) {
        topScores.push({
          skor: skorToPredikat[val],
          predikat: val.toLowerCase(),
          dimensi: dimensiDeskripsiMap[Number(idx)]
        });
      }
    });

    if (topScores.length === 0) return "";

    topScores.sort((a, b) => b.skor - a.skor);

    let kalimat = `Ananda ${panggilan} ${topScores[0].predikat} dalam ${topScores[0].dimensi}`;
    if (topScores.length >= 2) {
      kalimat += ` dan ${topScores[1].predikat} dalam ${topScores[1].dimensi}`;
    }
    kalimat += ` dalam kegiatan ${kegiatan}.`;

    return kalimat;
  };

  const handleChange = (studentId: string, field: string, value: any, dimIdx?: number) => {
    const newData = { ...kokurikulerData };
    if (!newData[studentId]) {
      newData[studentId] = { studentId, kegiatan: '', scores: {}, deskripsi: '' };
    }

    if (dimIdx !== undefined) {
      newData[studentId].scores = {
        ...newData[studentId].scores,
        [dimIdx]: value
      };
    } else {
      newData[studentId][field] = value;
    }

    // Auto generate description
    newData[studentId].deskripsi = generateDeskripsi(
      studentId, 
      newData[studentId].kegiatan, 
      newData[studentId].scores
    );

    setKokurikulerData(newData);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const t = toast.loading('Menyimpan penilaian kokurikuler...');
    try {
      const batch = writeBatch(db);
      Object.entries(kokurikulerData).forEach(([studentId, data]) => {
        const ref = doc(db, 'kokurikuler', studentId);
        // Ensure we only send the fields validated by security rules
        batch.set(ref, {
          studentId: data.studentId || studentId,
          kegiatan: data.kegiatan,
          scores: data.scores,
          deskripsi: data.deskripsi,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast.success('Nilai kokurikuler disimpan', { id: t });
    } catch (error) {
      toast.error('Gagal menyimpan nilai kokurikuler', { id: t });
      handleFirestoreError(error, OperationType.WRITE, 'kokurikuler');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ClipboardList className="text-blue-600" />
            Penilaian Kokurikuler
          </h2>
          <p className="text-xs text-slate-500 mt-1">Delapan Dimensi Profil Lulusan</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-8 py-3 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Semua Data
        </button>
      </div>

      <div className="bg-white rounded-3xl border-2 border-red-600 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-white text-slate-900 border-b-2 border-red-600">
                <th rowSpan={2} className="px-3 py-4 text-[10px] font-bold uppercase text-center w-12 border border-red-600">No</th>
                <th rowSpan={2} className="px-4 py-4 text-[10px] font-bold uppercase border border-red-600 min-w-[180px] text-center">Nama Siswa</th>
                <th rowSpan={2} className="px-4 py-4 text-[10px] font-bold uppercase border border-red-600 min-w-[150px]">Jenis Kegiatan</th>
                <th colSpan={8} className="px-4 py-2 text-[10px] font-bold uppercase text-center border border-red-600">Dimensi Profil Pelajar Pancasila</th>
                <th rowSpan={2} className="px-4 py-4 text-[10px] font-bold uppercase border border-red-600 min-w-[300px]">Deskripsi Kokurikuler</th>
              </tr>
              <tr className="bg-white text-slate-700 font-bold text-center">
                {dimensiMap.map((dim, idx) => (
                  <th key={idx} className="px-1 py-3 text-[8px] font-bold text-center border border-red-600 w-24">
                    {dim}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-red-400">
              {students.map((s, idx) => {
                const data = kokurikulerData[s.id] || { kegiatan: '', scores: {}, deskripsi: '' };
                return (
                  <tr key={s.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-3 py-3 text-[11px] text-center border border-red-400 font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 text-[11px] font-bold border border-red-400 uppercase text-slate-900 text-left">{s.name}</td>
                    <td className="px-2 py-3 border border-red-400">
                      <input 
                        type="text"
                        placeholder="Isi kegiatan..."
                        value={data.kegiatan}
                        onChange={(e) => handleChange(s.id, 'kegiatan', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-[11px] font-medium outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all"
                      />
                    </td>
                    {dimensiMap.map((_, dIdx) => (
                      <td key={dIdx} className="px-1 py-3 border border-red-400">
                        <select 
                          value={data.scores?.[dIdx] || ''}
                          onChange={(e) => handleChange(s.id, 'scores', e.target.value, dIdx)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 text-[10px] text-center font-bold outline-none focus:ring-2 focus:ring-red-500/20 focus:bg-white transition-all cursor-pointer"
                        >
                          {options.map(opt => (
                            <option key={opt} value={opt}>{opt || '-'}</option>
                          ))}
                        </select>
                      </td>
                    ))}
                    <td className="px-4 py-3 border border-red-400">
                      <textarea 
                        readOnly
                        rows={2}
                        value={data.deskripsi}
                        className="w-full bg-slate-50 border-none text-[10px] leading-relaxed text-slate-600 italic resize-none outline-none"
                        placeholder="Deskripsi akan terisi otomatis..."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 italic text-sm">Belum ada data siswa.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EkstrakurikulerView({ students }: { students: Student[] }) {
  const [availableEkstra, setAvailableEkstra] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [currentActivities, setCurrentActivities] = useState<{ekstraId: string, description: string}[]>(
    Array(10).fill({ ekstraId: '', description: '' })
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingEkstra, setIsAddingEkstra] = useState(false);
  const [newEkstraName, setNewEkstraName] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'ekstra_list'));
    const unsub = onSnapshot(q, (snap) => {
      setAvailableEkstra(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedStudentId) {
      setCurrentActivities(Array(10).fill({ ekstraId: '', description: '' }));
      return;
    }

    const unsub = onSnapshot(doc(db, 'ekstrakurikuler', selectedStudentId), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const activities = [...data.activities];
        // Fill up to 10
        while (activities.length < 10) {
          activities.push({ ekstraId: '', description: '' });
        }
        setCurrentActivities(activities);
      } else {
        setCurrentActivities(Array(10).fill({ ekstraId: '', description: '' }));
      }
    });

    return () => unsub();
  }, [selectedStudentId]);

  const handleActivityChange = (idx: number, field: string, value: string) => {
    const newActivities = [...currentActivities];
    newActivities[idx] = { ...newActivities[idx], [field]: value };
    setCurrentActivities(newActivities);
  };

  const handleSave = async () => {
    if (!selectedStudentId) return;
    setIsSaving(true);
    const t = toast.loading('Menyimpan penilaian ekstrakurikuler...');
    try {
      const filteredActivities = currentActivities.filter(a => a.ekstraId !== "");
      await setDoc(doc(db, 'ekstrakurikuler', selectedStudentId), {
        studentId: selectedStudentId,
        activities: filteredActivities,
        updatedAt: serverTimestamp()
      });
      toast.success('Nilai ekstrakurikuler disimpan', { id: t });
    } catch (error) {
      toast.error('Gagal menyimpan nilai ekstrakurikuler', { id: t });
      handleFirestoreError(error, OperationType.WRITE, `ekstrakurikuler/${selectedStudentId}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEkstraName = async () => {
    if (!newEkstraName.trim()) return;
    const t = toast.loading('Menambahkan ekstrakurikuler...');
    try {
      await addDoc(collection(db, 'ekstra_list'), {
        name: newEkstraName.trim(),
        createdAt: serverTimestamp()
      });
      setNewEkstraName('');
      setIsAddingEkstra(false);
      toast.success('Ekstrakurikuler berhasil ditambahkan', { id: t });
    } catch (error) {
      toast.error('Gagal menambahkan ekstrakurikuler', { id: t });
      handleFirestoreError(error, OperationType.CREATE, 'extra_list');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Trophy className="text-blue-600" />
            Penilaian Ekstrakurikuler
          </h2>
          <p className="text-xs text-slate-500 mt-1">Laporan kegiatan pengembangan diri siswa.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsAddingEkstra(true)}
            className="px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-2xl font-bold hover:bg-blue-50 transition-all flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Daftarkan Nama Ekstra
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || !selectedStudentId}
            className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Simpan
          </button>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-100">
          <div className="max-w-xs">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Pilih Siswa</label>
            <select 
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
            >
              <option value="">-- Pilih Siswa --</option>
              {students.map((s, idx) => (
                <option key={s.id} value={s.id}>{idx + 1}. {s.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-blue-400">
            <thead>
              <tr className="bg-blue-50/50 text-blue-900 border-b border-blue-400">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-center w-20 border border-blue-400">No</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase border border-blue-400 min-w-[200px]">Nama Ekstra</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase border border-blue-400">Deskripsi Kegiatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-400">
              {currentActivities.map((activity, idx) => (
                <tr key={idx} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-6 py-4 text-[11px] text-center font-bold text-slate-400 border border-blue-400">{idx + 1}</td>
                  <td className="px-6 py-3 border border-blue-400">
                    <select 
                      value={activity.ekstraId}
                      onChange={(e) => handleActivityChange(idx, 'ekstraId', e.target.value)}
                      className="w-full bg-slate-50 border border-blue-100 rounded-lg px-3 py-2 text-[11px] font-bold text-blue-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all cursor-pointer"
                    >
                      <option value="">-- Pilih Ekstra --</option>
                      {availableEkstra.map((e: any) => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-3 border border-blue-400">
                    <input 
                      type="text"
                      placeholder="Tulis deskripsi kegiatan..."
                      value={activity.description}
                      onChange={(e) => handleActivityChange(idx, 'description', e.target.value)}
                      className="w-full bg-slate-50 border border-blue-100 rounded-lg px-4 py-2 text-[11px] font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Adding Ekstra Name */}
      <AnimatePresence>
        {isAddingEkstra && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100"
            >
              <div className="p-8">
                <h3 className="text-xl font-bold text-slate-900 mb-2">Daftarkan Nama Ekstra Baru</h3>
                <p className="text-[10px] text-slate-500 mb-6 uppercase tracking-widest font-bold">Pengaturan Master Data</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 block">Nama Ekstrakurikuler</label>
                    <input 
                      autoFocus
                      placeholder="Contoh: Pramuka, Robotik, Tari..."
                      value={newEkstraName}
                      onChange={(e) => setNewEkstraName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddEkstraName()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button 
                    onClick={() => setIsAddingEkstra(false)}
                    className="flex-1 px-4 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleAddEkstraName}
                    disabled={!newEkstraName.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    Simpan
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AttendanceView({ students }: { students: Student[] }) {
  const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'attendance'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Record<string, any> = {};
      snap.docs.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setAttendanceData(data);
    }, (error) => {
      console.error("Attendance snapshot failed", error);
    });
    return () => unsub();
  }, []);

  const handleChange = (studentId: string, field: string, value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, sakit: '', izin: '', alpha: '' }),
        [field]: value
      }
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const t = toast.loading('Menyimpan data presensi...');
    try {
      const batch = writeBatch(db);
      Object.entries(attendanceData).forEach(([studentId, data]) => {
        const ref = doc(db, 'attendance', studentId);
        // Ensure we only send the fields validated by security rules
        batch.set(ref, {
          studentId: data.studentId || studentId,
          sakit: data.sakit,
          izin: data.izin,
          alpha: data.alpha,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast.success('Presensi berhasil disimpan', { id: t });
    } catch (error) {
      toast.error('Gagal menyimpan presensi', { id: t });
      handleFirestoreError(error, OperationType.WRITE, 'attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <ClipboardList className="text-emerald-600" />
            Data Presensi Siswa
          </h2>
          <p className="text-xs text-slate-500 mt-1">Laporan ketidakhadiran siswa dalam satu semester.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Semua Data
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-emerald-400">
            <thead>
              <tr className="bg-emerald-50/50 text-emerald-900 border-b-2 border-emerald-500">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-center w-20 border border-emerald-400">No</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase border border-emerald-400 text-center">Nama Siswa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-center w-32 border border-emerald-400">Sakit</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-center w-32 border border-emerald-400">Izin</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-center w-32 border border-emerald-400">Tanpa Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-400">
              {students.map((s, idx) => {
                const data = attendanceData[s.id] || { sakit: '', izin: '', alpha: '' };
                return (
                  <tr key={s.id} className="hover:bg-emerald-50/20 transition-colors">
                    <td className="px-6 py-4 text-[11px] text-center font-bold text-slate-400 border border-emerald-400">{idx + 1}</td>
                    <td className="px-6 py-4 text-[11px] font-bold uppercase text-slate-900 border border-emerald-400 text-left">{s.name}</td>
                    <td className="px-4 py-3 border border-emerald-400">
                      <input 
                        type="text"
                        value={data.sakit}
                        onChange={(e) => handleChange(s.id, 'sakit', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-center font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                        placeholder="-"
                      />
                    </td>
                    <td className="px-4 py-3 border border-emerald-400">
                      <input 
                        type="text"
                        value={data.izin}
                        onChange={(e) => handleChange(s.id, 'izin', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-center font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                        placeholder="-"
                      />
                    </td>
                    <td className="px-4 py-3 border border-emerald-400">
                      <input 
                        type="text"
                        value={data.alpha}
                        onChange={(e) => handleChange(s.id, 'alpha', e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[11px] text-center font-bold text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all"
                        placeholder="-"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="py-20 text-center text-slate-400 italic text-sm">
              Belum ada data siswa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TeacherNotesView({ students }: { students: Student[] }) {
  const [notesData, setNotesData] = useState<Record<string, any>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'teacher_notes'));
    const unsub = onSnapshot(q, (snap) => {
      const data: Record<string, any> = {};
      snap.docs.forEach(doc => {
        data[doc.id] = doc.data();
      });
      setNotesData(data);
    }, (error) => {
      console.error("Teacher notes snapshot failed", error);
    });
    return () => unsub();
  }, []);

  const handleChange = (studentId: string, value: string) => {
    setNotesData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || { studentId, note: '' }),
        note: value
      }
    }));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    const t = toast.loading('Menyimpan catatan guru...');
    try {
      const batch = writeBatch(db);
      Object.entries(notesData).forEach(([studentId, data]) => {
        const ref = doc(db, 'teacher_notes', studentId);
        // Ensure we only send the fields validated by security rules
        batch.set(ref, {
          studentId: data.studentId || studentId,
          note: data.note,
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
      toast.success('Catatan guru berhasil disimpan', { id: t });
    } catch (error) {
      toast.error('Gagal menyimpan catatan', { id: t });
      handleFirestoreError(error, OperationType.WRITE, 'teacher_notes');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <MessageSquare className="text-indigo-600" />
            Catatan Wali Kelas
          </h2>
          <p className="text-xs text-slate-500 mt-1">Berikan catatan perkembangan dan motivasi untuk setiap siswa.</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={isSaving}
          className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
          Simpan Semua Catatan
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse border border-indigo-400">
            <thead>
              <tr className="bg-indigo-50/50 text-indigo-900 border-b-2 border-indigo-500">
                <th className="px-6 py-4 text-[10px] font-bold uppercase text-center w-20 border border-indigo-400">No</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase border border-indigo-400 text-center">Nama Siswa</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase border border-indigo-400 text-center">Catatan Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-400">
              {students.map((s, idx) => {
                const data = notesData[s.id] || { note: '' };
                return (
                  <tr key={s.id} className="hover:bg-indigo-50/20 transition-colors">
                    <td className="px-6 py-4 text-[11px] text-center font-bold text-slate-400 border border-indigo-400">{idx + 1}</td>
                    <td className="px-6 py-4 text-[11px] font-bold uppercase text-slate-900 border border-indigo-400 text-left">{s.name}</td>
                    <td className="px-4 py-3 border border-indigo-400">
                      <textarea 
                        value={data.note}
                        onChange={(e) => handleChange(s.id, e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[11px] font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all resize-none"
                        placeholder="Tulis catatan di sini..."
                        rows={2}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {students.length === 0 && (
            <div className="py-20 text-center text-slate-400 italic text-sm">
              Belum ada data siswa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SampulRaporView({ students, schoolInfo }: { students: Student[], schoolInfo: SchoolInfo | null }) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [pageType, setPageType] = useState<'cover' | 'school_info' | 'identity' | 'all'>('all');
  const [theme, setTheme] = useState<'navy' | 'green' | 'maroon' | 'mono'>('mono');

  // get current student object
  const student = students.find(s => s.id === selectedStudentId) || students[0];

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const handlePrint = () => {
    window.print();
  };

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md text-center max-w-xl mx-auto my-12 font-sans">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Users size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800">Tidak Ada Data Siswa</h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Silakan isi data siswa terlebih dahulu di menu <strong>Data Siswa</strong> sebelum mencetak Sampul Rapor.
        </p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  // Cover themes config for display preview
  const themeStyles = {
    navy: {
      bg: 'bg-[#1e293b]',
      text: 'text-amber-100',
      border: 'border-amber-400',
      boxBorder: 'border-amber-400/80',
      labelBg: 'bg-[#0f172a]/60',
      boxText: 'text-white',
    },
    green: {
      bg: 'bg-[#064e3b]',
      text: 'text-amber-100',
      border: 'border-amber-400',
      boxBorder: 'border-amber-400/50',
      labelBg: 'bg-[#022c22]/60',
      boxText: 'text-white',
    },
    maroon: {
      bg: 'bg-[#5c0620]',
      text: 'text-amber-100',
      border: 'border-amber-400',
      boxBorder: 'border-amber-400/50',
      labelBg: 'bg-[#3c0211]/60',
      boxText: 'text-white',
    },
    mono: {
      bg: 'bg-white',
      text: 'text-slate-900',
      border: 'border-slate-800',
      boxBorder: 'border-slate-300',
      labelBg: 'bg-slate-50',
      boxText: 'text-slate-900',
    }
  };

  const currentStyle = themeStyles[theme];

  // Helper to determine school level and abbreviation
  const getSchoolType = () => {
    const name = (schoolInfo?.namaSekolah || '').toUpperCase();
    if (name.includes('SMP') || name.includes('MTS')) {
      return { level: 'SEKOLAH MENENGAH PERTAMA', abbr: 'SMP' };
    }
    if (name.includes('SMA') || name.includes('SMK') || name.includes('MA')) {
      return { level: 'SEKOLAH MENENGAH ATAS', abbr: 'SMA' };
    }
    return { level: 'SEKOLAH DASAR', abbr: 'SD' };
  };

  const schoolType = getSchoolType();

  const formatDateToIndonesian = (dateStr: string) => {
    if (!dateStr) return '........................';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return formatIndonesianDate(d);
      }
      return dateStr;
    }
    return formatIndonesianDate(date);
  };

  const formatIndonesianDate = (date: Date) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Unified Header component for Page 1 & Page 2
  const PageHeader = () => (
    <div className="flex flex-col items-center text-center space-y-1.5">
      <h1 className="text-xl md:text-2xl font-black tracking-[0.12em] uppercase leading-snug">
        Laporan
      </h1>
      <h2 className="text-sm md:text-base font-extrabold tracking-[0.08em] uppercase max-w-[500px] leading-relaxed">
        Hasil Pencapaian Kompetensi Peserta Didik
      </h2>
      <h3 className="text-md md:text-lg font-black tracking-widest uppercase">
        {schoolType.level}
      </h3>
      <h4 className="text-md font-extrabold tracking-widest uppercase">
        ( {schoolType.abbr} )
      </h4>
    </div>
  );

  // Tut Wuri Handayani high-quality vector rendering
  const TutWuriLogo = () => (
    <svg className="w-28 h-28 my-4 filter drop-shadow" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#01a1e4" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="47" stroke="#000000" strokeWidth="0.5" />
      {/* Outer wings */}
      <path d="M50 15 C45 35, 23 58, 23 68 C23 75, 30 78, 50 78 C70 78, 77 75, 77 68 C77 58, 55 35, 50 15 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="1" />
      {/* Outer text path background circle */}
      <circle cx="50" cy="51" r="33" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Center flame/triangle */}
      <path d="M50 25 L70 65 L60 65 L50 37 L40 65 L30 65 Z" fill="#fbb03b" />
      <path d="M50 32 L63 58 L50 42 L37 58 Z" fill="#ffffff" />
      {/* Book base */}
      <path d="M26 67 C35 72, 65 72, 74 67 C65 62, 35 62, 26 67 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="1" />
      <path d="M31 67 C40 69, 60 69, 69 67 Z" fill="#ffffff" />
      {/* Core torch flame */}
      <path d="M50 40 L53 50 L47 50 Z" fill="#e11d48" />
    </svg>
  );

  // Renders individual Page 1: COVER
  const RenderPage1Cover = () => (
    <div 
      className={`page-container w-[210mm] min-h-[297mm] p-[20mm] ${theme === 'mono' ? 'bg-white' : currentStyle.bg} ${theme === 'mono' ? 'text-slate-900' : currentStyle.text} border-8 ${currentStyle.border} shadow-2xl relative flex flex-col justify-between items-center font-serif overflow-hidden print:shadow-none print:border-8 print:border-black print:text-black print:bg-white print:w-full print:min-h-0 print:p-[15mm]`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Decorative inner frames */}
      <div className={`absolute inset-4 border-2 ${theme === 'mono' ? 'border-slate-800' : currentStyle.border} pointer-events-none print:border-black`} />
      <div className={`absolute inset-5 border border-dashed ${theme === 'mono' ? 'border-slate-400' : currentStyle.border} opacity-50 pointer-events-none print:border-slate-400`} />

      {/* Page Header */}
      <div className="w-full mt-6 z-10">
        <PageHeader />
      </div>

      {/* Tut Wuri Handayani Center Logo */}
      <div className="flex flex-col items-center justify-center my-6 z-10">
        {schoolInfo?.logo ? (
          <img 
            src={schoolInfo.logo} 
            alt="Logo Sekolah" 
            className="w-28 h-28 object-contain my-4 filter drop-shadow" 
            referrerPolicy="no-referrer"
          />
        ) : (
          <TutWuriLogo />
        )}
      </div>

      {/* Name and NIS/NISN Box Block */}
      <div className="w-full max-w-[135mm] z-10 flex flex-col space-y-5 font-sans tracking-wide">
        {/* Box Name */}
        <div className={`w-full border-2 ${theme === 'mono' ? 'border-slate-900' : currentStyle.border} rounded-xl overflow-hidden print:border-black`}>
          <div className={`${theme === 'mono' ? 'bg-slate-50' : currentStyle.labelBg} py-2 text-center text-[11px] font-bold uppercase tracking-widest border-b border-inherit print:bg-transparent print:border-black`}>
            Nama Peserta Didik
          </div>
          <div className={`py-4 text-center text-lg font-black tracking-wide uppercase ${theme === 'mono' ? 'text-slate-900' : currentStyle.boxText} print:text-black`}>
            {student.name || '-'}
          </div>
        </div>

        {/* Box NIS / NISN */}
        <div className={`w-full border-2 ${theme === 'mono' ? 'border-slate-900' : currentStyle.border} rounded-xl overflow-hidden print:border-black`}>
          <div className={`${theme === 'mono' ? 'bg-slate-50' : currentStyle.labelBg} py-2 text-center text-[11px] font-bold uppercase tracking-widest border-b border-inherit print:bg-transparent print:border-black`}>
            NIS / NISN
          </div>
          <div className={`py-3 text-center text-md font-bold tracking-widest ${theme === 'mono' ? 'text-slate-800' : currentStyle.boxText} print:text-black`}>
            {student.nis || '-'} / {student.nisn || '-'}
          </div>
        </div>
      </div>

      {/* Ministry Info at Bottom */}
      <div className="flex flex-col items-center text-center mt-auto mb-4 z-10 space-y-1.5 uppercase font-sans tracking-[0.1em]">
        <h3 className="text-xs font-black">
          Kementerian Pendidikan dan Kebudayaan
        </h3>
        <h4 className="text-xs font-black tracking-[0.15em]">
          Republik Indonesia
        </h4>
      </div>
    </div>
  );

  // Renders individual Page 2: INFORMASI SEKOLAH
  const RenderPage2SchoolInfo = () => (
    <div 
      className="page-container w-[210mm] min-h-[297mm] p-[25mm] bg-white text-slate-900 border border-slate-200 shadow-2xl relative flex flex-col justify-between overflow-hidden font-serif print:shadow-none print:border-none print:w-full print:min-h-0 print:p-[15mm]"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="w-full mt-4 z-10 text-slate-900 font-serif">
        <PageHeader />
      </div>

      {/* Main Parameters Table */}
      <div className="w-full my-auto py-[10mm] z-10 px-4 font-sans text-xs leading-relaxed">
        <table className="w-full text-xs text-left border-collapse table-fixed">
          <tbody>
            <tr className="align-baseline">
              <td className="w-[180px] font-bold py-3 pr-2">Nama Sekolah</td>
              <td className="w-4 py-3">:</td>
              <td className="font-bold uppercase py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.namaSekolah || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">NPSN</td>
              <td className="py-3">:</td>
              <td className="font-semibold py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.npsn || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">Alamat Sekolah</td>
              <td className="py-3">:</td>
              <td className="py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.alamat || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">Nomor Telepon</td>
              <td className="py-3">:</td>
              <td className="py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.telepon || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">Kelurahan/Desa</td>
              <td className="py-3">:</td>
              <td className="py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.kelurahan || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">Kecamatan</td>
              <td className="py-3">:</td>
              <td className="py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.kecamatan || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">Kota/Kabupaten</td>
              <td className="py-3">:</td>
              <td className="py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.kabupaten || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">Provinsi</td>
              <td className="py-3">:</td>
              <td className="py-3 border-b border-dashed border-slate-300">
                {schoolInfo?.provinsi || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">Website</td>
              <td className="py-3">:</td>
              <td className="text-blue-600 font-medium py-3 border-b border-dashed border-slate-300 print:text-black">
                {schoolInfo?.website || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td className="font-bold py-3 pr-2">E-mail</td>
              <td className="py-3">:</td>
              <td className="text-blue-600 font-medium py-3 border-b border-dashed border-slate-300 print:text-black">
                {schoolInfo?.email || '-'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Decorative Bottom Spacing */}
      <div className="w-full text-center text-[10px] text-slate-400 font-sans print:text-black uppercase">
        Rapor Kurikulum Merdeka - {schoolInfo?.namaSekolah}
      </div>
    </div>
  );

  // Renders individual Page 3: IDENTITAS PESERTA DIDIK
  const RenderPage3Identity = () => (
    <div 
      className="page-container w-[210mm] min-h-[297mm] p-[25mm] bg-white text-slate-900 border border-slate-200 shadow-2xl relative flex flex-col justify-between overflow-hidden font-serif print:shadow-none print:border-none print:w-full print:min-h-0 print:p-[15mm]"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Header */}
      <div className="text-center space-y-1.5 mb-6">
        <h1 className="text-lg font-black tracking-wider uppercase">
          Identitas Peserta Didik
        </h1>
        <div className="w-full h-0.5 bg-slate-900" />
      </div>

      {/* Detailed Grid Table */}
      <div className="space-y-2 font-sans text-xs leading-relaxed flex-1">
        <table className="w-full text-xs text-left border-collapse table-fixed">
          <tbody>
            {/* a. Nama */}
            <tr className="align-baseline">
              <td className="w-8 font-semibold py-1.5 text-left">a.</td>
              <td className="w-[180px] font-semibold py-1.5">Nama Peserta Didik</td>
              <td className="w-4 py-1.5">:</td>
              <td className="font-bold uppercase py-1.5 border-b border-dashed border-slate-300">{student.name || '-'}</td>
            </tr>

            {/* b. Nomor Induk */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">b.</td>
              <td className="font-semibold py-1.5">Nomor Induk</td>
              <td className="py-1.5">:</td>
              <td className="font-semibold py-1.5 border-b border-dashed border-slate-300">{student.nis || '-'} / {student.nisn || '-'}</td>
            </tr>

            {/* c. Tempat Tanggal Lahir */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">c.</td>
              <td className="font-semibold py-1.5">Tempat, Tanggal Lahir</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 border-b border-dashed border-slate-300 uppercase">
                {student.tempatLahir || '-'}, {student.tanggalLahir || '-'}
              </td>
            </tr>

            {/* d. Jenis Kelamin */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">d.</td>
              <td className="font-semibold py-1.5">Jenis Kelamin</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 border-b border-dashed border-slate-300">{student.jenisKelamin || '-'}</td>
            </tr>

            {/* e. Agama */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">e.</td>
              <td className="font-semibold py-1.5">Agama</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 border-b border-dashed border-slate-300">{student.agama || '-'}</td>
            </tr>

            {/* f. Pendidikan Sebelumnya */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">f.</td>
              <td className="font-semibold py-1.5">Pendidikan Sebelumnya</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 border-b border-dashed border-slate-300">{student.pendidikanSebelumnya || '-'}</td>
            </tr>

            {/* g. Alamat */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">g.</td>
              <td className="font-semibold py-1.5">Alamat Peserta Didik</td>
              <td className="py-1.5">:</td>
              <td className="py-1.5 border-b border-dashed border-slate-300 text-slate-800 leading-normal">
                {student.alamatPesertaDidik || '-'}
              </td>
            </tr>

            {/* h. Orang Tua */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">h.</td>
              <td className="font-semibold py-1.5" colSpan={3}>Nama Orang Tua</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">1). Ayah</td>
              <td className="py-1">:</td>
              <td className="font-semibold border-b border-dashed border-slate-300 py-1 uppercase text-xs">{student.namaAyah || '-'}</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">2). Ibu</td>
              <td className="py-1">:</td>
              <td className="font-semibold border-b border-dashed border-slate-300 py-1 uppercase text-xs">{student.namaIbu || '-'}</td>
            </tr>

            {/* i. Pekerjaan */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">i.</td>
              <td className="font-semibold py-1.5" colSpan={3}>Pekerjaan Orang Tua</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">1). Ayah</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1">{student.pekerjaanAyah || '-'}</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">2). Ibu</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1">{student.pekerjaanIbu || '-'}</td>
            </tr>

            {/* j. Domisili */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">j.</td>
              <td className="font-semibold py-1.5" colSpan={3}>Domisili Orang Tua</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">1). Jalan</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1 text-xs">
                {student.alamatAyah || student.alamatIbu || student.alamatPesertaDidik || '-'}
              </td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">2). Kelurahan/Desa</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1 text-xs uppercase">{schoolInfo?.kelurahan || '-'}</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">3). Kecamatan</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1 text-xs uppercase">{schoolInfo?.kecamatan || '-'}</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">4). Kabupaten/Kota</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1 text-xs uppercase">{schoolInfo?.kabupaten || '-'}</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">5). Provinsi</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1 text-xs uppercase">{schoolInfo?.provinsi || '-'}</td>
            </tr>

            {/* k. Wali */}
            <tr className="align-baseline">
              <td className="font-semibold py-1.5 text-left">k.</td>
              <td className="font-semibold py-1.5" colSpan={3}>Wali Peserta Didik</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">1). Nama</td>
              <td className="py-1">:</td>
              <td className="font-semibold border-b border-dashed border-slate-300 py-1 uppercase text-xs">{student.namaWali || '-'}</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">2). Pekerjaan</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1">{student.pekerjaanWali || '-'}</td>
            </tr>
            <tr className="align-baseline">
              <td></td>
              <td className="pl-4 font-medium py-1">3). Alamat</td>
              <td className="py-1">:</td>
              <td className="font-medium border-b border-dashed border-slate-300 py-1 text-xs">{student.alamatWali || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Photo & Signature Section */}
      <div className="mt-12 grid grid-cols-2 text-xs font-sans items-end">
        {/* Left column: Photo frame */}
        <div className="flex flex-col justify-end">
          <div className="w-[30mm] h-[40mm] border border-slate-400 border-dashed flex flex-col items-center justify-center text-slate-450 text-[10px] text-center p-2 uppercase bg-slate-50 relative">
            <span className="font-bold">PAS FOTO</span>
            <span className="mt-1 text-[9px] text-slate-400">3 x 4 CM</span>
            <div className="absolute inset-1.5 border border-dashed border-slate-200 pointer-events-none" />
          </div>
        </div>
        
        {/* Right column: Principal's signature */}
        <div className="flex flex-col items-start pl-8 space-y-12">
          <div>
            <p className="normal-case">{(schoolInfo?.kabupaten || 'SITUBONDO').toUpperCase()}, {formatDateToIndonesian(schoolInfo?.tanggalRaporSas || '')}</p>
            <p className="font-semibold mt-0.5">Kepala {schoolInfo?.namaSekolah || 'Sekolah'}</p>
          </div>
          
          <div className="pt-2">
            <p className="font-bold underline uppercase tracking-wide decoration-1">{schoolInfo?.pltKepala || '..............................................'}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">NIP. {schoolInfo?.nipKepala || '..............................................'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Control panel - hidden during print */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between print:hidden font-sans">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Pilih Siswa</label>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-semibold rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({s.nisn || s.nis || 'No ID'})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Jenis Halaman</label>
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setPageType('cover')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pageType === 'cover' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Halaman 1 (Sampul)
              </button>
              <button
                type="button"
                onClick={() => setPageType('school_info')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pageType === 'school_info' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Halaman 2 (Sekolah)
              </button>
              <button
                type="button"
                onClick={() => setPageType('identity')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pageType === 'identity' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Halaman 3 (Identitas)
              </button>
              <button
                type="button"
                onClick={() => setPageType('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  pageType === 'all' ? 'bg-blue-600 text-white shadow-sm' : 'text-blue-600 hover:text-blue-800'
                }`}
              >
                Cetak Semua (1-3)
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <Printer size={15} /> Cetak Sekarang
        </button>
      </div>

      {/* Main Print Container */}
      <div className="flex flex-col items-center justify-center w-full gap-8 print:gap-0 print:p-0">
        {pageType === 'cover' && <RenderPage1Cover />}
        {pageType === 'school_info' && <RenderPage2SchoolInfo />}
        {pageType === 'identity' && <RenderPage3Identity />}
        
        {pageType === 'all' && (
          <div className="space-y-8 print:space-y-0 w-full flex flex-col items-center">
            {/* Page 1 with indicator for screen preview */}
            <div className="relative group w-full flex justify-center">
              <span className="absolute -left-16 top-4 bg-slate-800 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider print:hidden shadow">Halaman 1</span>
              <RenderPage1Cover />
            </div>
            {/* Form Page break */}
            <div className="page-break print:block print:h-0 print:m-0" style={{ pageBreakAfter: 'always', breakAfter: 'page' }} />
            
            {/* Page 2 */}
            <div className="relative group w-full flex justify-center">
              <span className="absolute -left-16 top-4 bg-slate-800 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider print:hidden shadow">Halaman 2</span>
              <RenderPage2SchoolInfo />
            </div>
            {/* Form Page break */}
            <div className="page-break print:block print:h-0 print:m-0" style={{ pageBreakAfter: 'always', breakAfter: 'page' }} />

            {/* Page 3 */}
            <div className="relative group w-full flex justify-center">
              <span className="absolute -left-16 top-4 bg-slate-800 text-white text-[10px] px-2 py-1 rounded font-bold uppercase tracking-wider print:hidden shadow">Halaman 3</span>
              <RenderPage3Identity />
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          /* Force A4 Page Size & Layout settings */
          @page {
            size: A4;
            margin: 0;
          }
          html, body, #root, main {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }
          /* Absolute suppression of all surrounding elements container and margins */
          .page-container {
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-shadow: none !important;
            border-width: 0 !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            transform: none !important;
            zoom: normal !important;
            background-color: white !important;
            color: black !important;
            overflow: hidden !important;
          }
          .page-container:last-of-type {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          /* Ensure Cover Page has double border on print */
          .page-container.border-8 {
            border: 4px double black !important;
          }
          /* Hide non-printable widgets */
          .print\\:hidden {
            display: none !important;
          }
          .page-break {
            display: block !important;
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>
    </div>
  );
}

function PrintRaporView({ 
  students, 
  schoolInfo, 
  subjects, 
  type 
}: { 
  students: Student[]; 
  schoolInfo: SchoolInfo | null; 
  subjects: Subject[]; 
  type: 'sts' | 'sas';
}) {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentGrades, setStudentGrades] = useState<Record<string, any>>({});
  const [mappings, setMappings] = useState<Record<string, any>>({});
  const [settings, setSettings] = useState<Settings | null>(null);
  const [kokurikuler, setKokurikuler] = useState<any>(null);
  const [ekstrakurikuler, setEkstrakurikuler] = useState<any>(null);
  const [extraList, setExtraList] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any>(null);
  const [teacherNotes, setTeacherNotes] = useState<any>(null);
  
  // Year-end decision (only relevant for type === 'sas' and semester === 'GENAP')
  const [decisionText, setDecisionText] = useState<string>('');
  const [customDecision, setCustomDecision] = useState<boolean>(false);

  // Get current student object
  const student = students.find(s => s.id === selectedStudentId) || students[0];

  useEffect(() => {
    if (students.length > 0 && !selectedStudentId) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  // Load decision defaults automatically when student or schoolInfo changes
  useEffect(() => {
    if (schoolInfo && student && !customDecision) {
      const kelasStr = (schoolInfo.kelas || '').trim();
      if (kelasStr.length > 0) {
        // Implement left(kelasStr, 1) logic
        const firstChar = kelasStr.charAt(0);
        let classNum = parseInt(firstChar, 10);
        
        // Robust fallback: if first character is not a number, check if there is a number anywhere in the string
        if (isNaN(classNum)) {
          // Check roman numerals first
          const upper = kelasStr.toUpperCase();
          if (upper.startsWith('VI')) classNum = 6;
          else if (upper.startsWith('IV')) classNum = 4;
          else if (upper.startsWith('V')) classNum = 5;
          else if (upper.startsWith('III')) classNum = 3;
          else if (upper.startsWith('II')) classNum = 2;
          else if (upper.startsWith('I')) classNum = 1;
          else {
            const matchNum = kelasStr.match(/\d+/);
            if (matchNum) {
              classNum = parseInt(matchNum[0], 10);
            }
          }
        }

        if (!isNaN(classNum)) {
          if (classNum === 6) {
            setDecisionText('LULUS');
          } else {
            setDecisionText(`Naik ke Kelas ${classNum + 1}`);
          }
        } else {
          setDecisionText('........................');
        }
      } else {
        setDecisionText('........................');
      }
    }
  }, [schoolInfo, student, customDecision]);

  useEffect(() => {
    if (!selectedStudentId) return;

    // Load KKTP Settings
    const unsubSettings = onSnapshot(doc(db, 'settings', 'kktp'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as Settings);
      }
    });

    // Load grades for this student
    const qGrades = query(collection(db, 'grades'), where('studentId', '==', selectedStudentId));
    const unsubGrades = onSnapshot(qGrades, (snap) => {
      const data: Record<string, any> = {};
      snap.docs.forEach(docSnap => {
        const g = docSnap.data();
        data[g.subjectId] = g;
      });
      setStudentGrades(data);
    }, (error) => {
      console.error("Print view grades snapshot failed", error);
    });

    // Load mappings
    const qMappings = query(collection(db, 'mappings'));
    const unsubMappings = onSnapshot(qMappings, (snap) => {
      const data: Record<string, any> = {};
      snap.docs.forEach(docSnap => {
        data[docSnap.id] = docSnap.data().mapping;
      });
      setMappings(data);
    });

    // Load P5 kokurikuler
    const unsubCo = onSnapshot(doc(db, 'kokurikuler', selectedStudentId), (docSnap) => {
      if (docSnap.exists()) {
        setKokurikuler(docSnap.data());
      } else {
        setKokurikuler(null);
      }
    });

    // Load extra curricular activities
    const unsubExtra = onSnapshot(doc(db, 'ekstrakurikuler', selectedStudentId), (docSnap) => {
      if (docSnap.exists()) {
        setEkstrakurikuler(docSnap.data());
      } else {
        setEkstrakurikuler(null);
      }
    });

    // Load extra list (for mapping names)
    const qExtraList = query(collection(db, 'ekstra_list'));
    const unsubExtraList = onSnapshot(qExtraList, (snap) => {
      const list = snap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setExtraList(list);
    });

    // Load attendance
    const unsubAttendance = onSnapshot(doc(db, 'attendance', selectedStudentId), (docSnap) => {
      if (docSnap.exists()) {
        setAttendance(docSnap.data());
      } else {
        setAttendance(null);
      }
    });

    // Load teacher notes
    const unsubNotes = onSnapshot(doc(db, 'teacher_notes', selectedStudentId), (docSnap) => {
      if (docSnap.exists()) {
        setTeacherNotes(docSnap.data());
      } else {
        setTeacherNotes(null);
      }
    });

    return () => {
      unsubSettings();
      unsubGrades();
      unsubMappings();
      unsubCo();
      unsubExtra();
      unsubExtraList();
      unsubAttendance();
      unsubNotes();
    };
  }, [selectedStudentId]);

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md text-center max-w-xl mx-auto my-12">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
          <Users size={28} />
        </div>
        <h3 className="text-base font-bold text-slate-800">Tidak Ada Data Siswa</h3>
        <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
          Silakan isi data siswa terlebih dahulu di menu <strong>Data Siswa</strong> sebelum mencetak rapor.
        </p>
      </div>
    );
  }

  if (!student) {
    return null;
  }

  const getPredikat = (score: number, subject: Subject) => {
    if (!subject) return "";
    if (score >= subject.minA) return settings?.descA || 'Sangat baik';
    if (score >= subject.minB) return settings?.descB || 'Baik';
    if (score >= subject.minC) return settings?.descC || 'Cukup baik';
    return settings?.descD || 'Masih perlu berlatih';
  };

  const calculateSubjectGrade = (subj: Subject) => {
    const sGrades = studentGrades[subj.id] || { tpScores: {}, sas: 0 };
    const activeMapping = mappings[subj.id] || { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5" };
    
    const mappedTpNumbers = Object.values(activeMapping).filter(Boolean);
    const tpValues = mappedTpNumbers
      .map(tpNo => Number((sGrades.tpScores as any)?.[tpNo as string]))
      .filter(v => !isNaN(v) && v > 0);
    
    const rataRata = tpValues.length > 0 ? Math.round(tpValues.reduce((a, b) => a + b, 0) / tpValues.length) : 0;
    const sas = Number(sGrades.sas || 0);
    
    // Final score choice
    const nilaiRapor = (rataRata > 0 || sas > 0) ? Math.round((rataRata + sas) / ((rataRata > 0 && sas > 0) ? 2 : 1)) : 0;
    const scoreToUse = type === 'sas' ? nilaiRapor : rataRata;

    let maxVal = -1;
    let minVal = 101;
    let maxTpNo = '';
    let minTpNo = '';

    mappedTpNumbers.forEach(tpNo => {
      const score = Number((sGrades.tpScores as any)?.[tpNo as string]);
      if (!isNaN(score) && score > 0) {
        if (score > maxVal) { maxVal = score; maxTpNo = tpNo as string; }
        if (score < minVal) { minVal = score; minTpNo = tpNo as string; }
      }
    });

    const descMaxTP = subj.tps?.find(t => t.no === maxTpNo)?.description || '';
    const descMinTP = subj.tps?.find(t => t.no === minTpNo)?.description || '';

    const predikatMax = maxVal >= 0 ? getPredikat(maxVal, subj) : '';
    const predikatMin = (minVal >= 0 && minVal <= 100) ? getPredikat(minVal, subj) : '';

    const deskripsiMax = descMaxTP ? `Ananda ${predikatMax} dalam ${descMaxTP}.` : '';
    const deskripsiMin = descMinTP ? `Ananda ${predikatMin} dalam ${descMinTP}.` : '';

    return { 
      nilaiAkhir: scoreToUse, 
      deskripsiMax, 
      deskripsiMin 
    };
  };

  const formatDateToIndonesian = (dateStr: string) => {
    if (!dateStr) return '........................';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        let year = parseInt(parts[2]);
        if (year < 100) year += 2000;
        const d = new Date(year, month, day);
        if (!isNaN(d.getTime())) return formatIndonesianDate(d);
      }
      return dateStr;
    }
    return formatIndonesianDate(date);
  };

  const formatIndonesianDate = (date: Date) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getEkstraName = (id: string) => {
    return extraList.find(e => e.id === id)?.name || id;
  };

  const handlePrint = () => {
    window.print();
  };

  const orderedSubjects = [...subjects].sort((a, b) => a.order - b.order);
  const ekstraRows = (ekstrakurikuler?.activities || []).filter((a: any) => a.ekstraId);

  const TutWuriLogo = () => (
    <svg className="w-14 h-14 object-contain filter drop-shadow print:w-16 print:h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="46" fill="#01a1e4" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="47" stroke="#000000" strokeWidth="0.5" />
      <path d="M50 15 C45 35, 23 58, 23 68 C23 75, 30 78, 50 78 C70 78, 77 75, 77 68 C77 58, 55 35, 50 15 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="1" />
      <circle cx="50" cy="51" r="33" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M50 25 L70 65 L60 65 L50 37 L40 65 L30 65 Z" fill="#fbb03b" />
      <path d="M50 32 L63 58 L50 42 L37 58 Z" fill="#ffffff" />
      <path d="M26 67 C35 72, 65 72, 74 67 C65 62, 35 62, 26 67 Z" fill="#fbbf24" stroke="#1e293b" strokeWidth="1" />
      <path d="M31 67 C40 69, 60 69, 69 67 Z" fill="#ffffff" />
      <path d="M50 40 L53 50 L47 50 Z" fill="#e11d48" />
    </svg>
  );

  const isSemesterGenap = (schoolInfo?.semester || '').toUpperCase() === 'GENAP';
  const semesterTitle = type === 'sas' 
    ? (isSemesterGenap ? 'SUMATIF AKHIR TAHUN' : 'SUMATIF AKHIR SEMESTER')
    : 'SUMATIF TENGAH SEMESTER';

  return (
    <div className="w-full flex flex-col items-center gap-6 pb-20">
      {/* Control Panel (Screen-only, Hidden on Print) */}
      <div className="w-full max-w-4xl bg-white rounded-3xl p-6 border border-slate-100 shadow-md flex flex-wrap items-center justify-between gap-4 print:hidden print-btn-panel">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[200px]">
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Pilih Peserta Didik</label>
            <div className="relative">
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.nis})
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {isSemesterGenap && type === 'sas' && (
            <div className="min-w-[250px]">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Keputusan Kenaikan / Kelulusan</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={decisionText}
                  onChange={(e) => {
                    setDecisionText(e.target.value);
                    setCustomDecision(true);
                  }}
                  placeholder="E.g. Naik ke kelas 2"
                  className="bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    setCustomDecision(false);
                  }}
                  className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2   py-1 rounded-lg transition-all"
                  title="Reset otomatis"
                >
                  Auto
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-200"
        >
          <Printer size={15} /> Cetak Rapor
        </button>
      </div>

      {/* Main A4 sheets wrapper */}
      <div className="flex flex-col items-center gap-8 w-full print:gap-0 print:p-0">
        
        {/* ================= PAGE 1 ================= */}
        <div className="print-sheet max-w-[210mm] w-full min-h-[297mm] p-[15mm] border border-slate-200 bg-white shadow-xl relative flex flex-col font-serif overflow-hidden print:shadow-none print:border-none print:p-[15mm] print:break-after-page print:w-full">
          
          {/* Header */}
          <div className="flex items-center gap-4 border-b-2 border-black pb-3 mb-4">
            <div className="w-16 h-16 shrink-0 flex items-center justify-center">
              {schoolInfo?.logo ? (
                <img 
                  src={schoolInfo.logo} 
                  alt="School Logo" 
                  className="w-16 h-16 object-contain" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <TutWuriLogo />
              )}
            </div>
            <div className="flex-1 text-center pr-12">
              <h1 className="text-[14px] font-black tracking-wide uppercase leading-tight">
                Laporan Hasil Belajar
              </h1>
              <h2 className="text-[14px] font-black tracking-wide uppercase leading-tight mt-0.5">
                {semesterTitle}
              </h2>
              <h3 className="text-[13px] font-extrabold uppercase mt-0.5">
                ( Rapor )
              </h3>
            </div>
          </div>

          {/* Student metadata box */}
          <div className="grid grid-cols-2 gap-4 py-2 font-medium mb-4 text-[11px] leading-relaxed">
            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 inline-block shrink-0">Nama Peserta didik</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="font-bold uppercase flex-1">{student?.name}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block shrink-0">NIS / NISN</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="flex-1">{student?.nis || '-'} / {student?.nisn || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block shrink-0">Sekolah</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="flex-1">{schoolInfo?.namaSekolah || '-'}</span>
              </div>
              <div className="flex align-baseline">
                <span className="w-32 inline-block shrink-0">Alamat</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="flex-1 leading-normal text-[10px]">{schoolInfo?.alamat || '-'}</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex">
                <span className="w-32 inline-block shrink-0">Kelas</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="flex-1">{schoolInfo?.kelas || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block shrink-0">Fase</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="flex-1">{schoolInfo?.fase || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block shrink-0">Semester</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="font-bold uppercase flex-1">{schoolInfo?.semester || '-'}</span>
              </div>
              <div className="flex">
                <span className="w-32 inline-block shrink-0">Tahun Pelajaran</span>
                <span className="mr-2 shrink-0">:</span>
                <span className="flex-1">{schoolInfo?.tahunAjaran || '-'}</span>
              </div>
            </div>
          </div>

          {/* Main Grades Table */}
          <div className="flex-1">
            <table className="w-full border-collapse border border-black text-[11px]">
              <thead>
                <tr className="bg-slate-100/80 font-bold">
                  <th className="border border-black px-2 py-1.5 print:py-1 text-center w-8 text-[11px] print:text-[10px]">No</th>
                  <th className="border border-black px-3 py-1.5 print:py-1 print:px-2 text-left w-[24%] text-[11px] print:text-[10px]">Mata Pelajaran</th>
                  <th className="border border-black px-2 py-1.5 print:py-1 text-center w-20 text-[11px] print:text-[10px]">Nilai Akhir</th>
                  <th className="border border-black px-3 py-1.5 print:py-1 print:px-2 text-center text-[11px] print:text-[10px]">Capaian Kompetensi</th>
                </tr>
              </thead>
              <tbody>
                {orderedSubjects.length > 0 ? (
                  orderedSubjects.map((subj, index) => {
                    const { nilaiAkhir, deskripsiMax, deskripsiMin } = calculateSubjectGrade(subj);
                    const hasDesc = deskripsiMax || deskripsiMin;

                    return (
                      <tr key={subj.id} className="align-top">
                        <td className="border border-black px-2 py-1.5 print:py-0.5 text-center font-medium print:text-[10px]">{index + 1}</td>
                        <td className="border border-black px-3 py-1.5 print:py-0.5 print:px-2 text-left font-medium leading-normal print:text-[10px]">{subj.name}</td>
                        <td className="border border-black px-2 py-1.5 print:py-0.5 text-center font-bold text-[12px] print:text-[11px]">
                          {nilaiAkhir > 0 ? nilaiAkhir : '-'}
                        </td>
                        <td className="border border-black px-3 py-1.5 print:py-0.5 print:px-2 text-left text-[10px] print:text-[9px] leading-snug pb-2.5 print:pb-0.5 font-normal">
                          {hasDesc ? (
                            <div className="space-y-1 print:space-y-0.5">
                              {deskripsiMax && <p>{deskripsiMax}</p>}
                              {deskripsiMin && deskripsiMin !== deskripsiMax && <p>{deskripsiMin}</p>}
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="border border-black px-3 py-6 text-center text-slate-400 italic">
                      Belum ada data mata pelajaran.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Kokurikuler P5 (Printed conditionally for SAS) sebagai tabel mandiri berjarak */}
            {type === 'sas' && (
              <div className="mt-3 print:mt-1.5">
                <table className="w-full border-collapse border border-black text-[11px] print:text-[10px]">
                  <thead>
                    <tr className="bg-slate-100/80 font-bold border-b border-black">
                      <th className="border border-black px-3 py-1.5 print:py-1 text-center uppercase tracking-wider text-[11px] print:text-[10px]">
                        Kokurikuler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="align-top">
                      <td className="border border-black px-3 py-2 print:py-1 print:px-2 text-left text-[10px] print:text-[9px] leading-normal pb-3 print:pb-1 font-normal">
                        {kokurikuler?.deskripsi ? (
                          <div className="space-y-1 print:space-y-0.5">
                            {kokurikuler.kegiatan && <p className="font-semibold">Kegiatan: {kokurikuler.kegiatan}</p>}
                            <p className="leading-relaxed">{kokurikuler.deskripsi}</p>
                          </div>
                        ) : (
                          <p className="text-slate-450 italic">Belum ada penilaian kokurikuler.</p>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Extra-curricular Block */}
            {type === 'sas' && (
              <div className="mt-3 print:mt-1.5">
                <table className="w-full border-collapse border border-black text-[11px] print:text-[10px] table-fixed">
                  <thead>
                    <tr className="bg-slate-100/80 font-bold">
                      <th className="border border-black px-2 py-1 text-center w-8 print:py-0.5">NO</th>
                      <th className="border border-black px-3 py-1 text-center w-48 print:px-2 print:py-0.5">EKSTRAKURIKULER</th>
                      <th className="border border-black px-3 py-1 text-center print:px-2 print:py-0.5">KETERANGAN</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ekstraRows.length > 0 ? (
                      ekstraRows.map((act: any, idx: number) => (
                        <tr key={idx} className="align-top">
                          <td className="border border-black px-2 py-1.5 print:py-0.5 text-center font-medium">{idx + 1}</td>
                          <td className="border border-black px-3 py-1.5 print:py-0.5 print:px-2 text-left font-medium leading-normal">{getEkstraName(act.ekstraId)}</td>
                          <td className="border border-black px-3 py-1.5 print:py-0.5 print:px-2 text-left text-[10px] print:text-[9px] leading-normal pb-2.5 print:pb-0.5 font-normal">
                            {act.description || '-'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="border border-black px-3 py-2 print:py-1 text-center text-slate-400 italic font-normal print:text-[9px]">
                          Tidak ada kegiatan ekstrakurikuler yang diikuti.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="text-[9px] text-slate-400 text-right mt-1 print:hidden">
            Halaman 1
          </div>
        </div>

        {/* ================= PAGE 2 ================= */}
        {type === 'sas' && (
          <div className="print-sheet max-w-[210mm] w-full min-h-[297mm] p-[15mm] border border-slate-200 bg-white shadow-xl relative flex flex-col justify-start font-serif overflow-hidden print:shadow-none print:border-none print:p-[15mm] print:break-before-page print:w-full">
            <div className="space-y-4">
              {/* Header Page 2 */}
              <div className="flex items-center gap-4 border-b border-slate-300 pb-2 mb-4 print:border-black">
                <h1 className="text-[11px] font-bold text-slate-700 tracking-wide uppercase print:text-black">
                  Rapor Hasil Belajar - {student?.name}
                </h1>
                <div className="ml-auto text-[10px] text-slate-400 font-medium">
                  {schoolInfo?.namaSekolah} / Kelas {schoolInfo?.kelas}
                </div>
              </div>

              {/* Attendance and Teacher's Note inside grid layout */}
              <div className="grid grid-cols-2 gap-4 w-full text-[11px]">
                {/* Ketidakhadiran Table */}
                <div>
                  <table className="w-full border-collapse border border-black">
                    <thead>
                      <tr className="bg-slate-100/80 font-bold">
                        <th colSpan={2} className="border border-black py-1.5 text-center tracking-wider uppercase text-[10px]">
                          Ketidakhadiran
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black px-3 py-1.5 w-1/2">Sakit</td>
                        <td className="border border-black px-3 py-1.5 font-bold">: {attendance?.sakit ? `${attendance.sakit} Hari` : '- Hari'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-3 py-1.5">Izin</td>
                        <td className="border border-black px-3 py-1.5 font-bold">: {attendance?.izin ? `${attendance.izin} Hari` : '- Hari'}</td>
                      </tr>
                      <tr>
                        <td className="border border-black px-3 py-1.5">Tanpa Keterangan (Alpa)</td>
                        <td className="border border-black px-3 py-1.5 font-bold">: {attendance?.alpha ? `${attendance.alpha} Hari` : '- Hari'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Catatan Pendidik */}
                <div>
                  <table className="w-full border-collapse border border-black h-full">
                    <thead>
                      <tr className="bg-slate-100/80 font-bold">
                        <th className="border border-black py-1.5 text-center tracking-wider uppercase text-[10px]">
                          Catatan Pendidik
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-black p-3 h-24 align-top text-[10px] leading-relaxed font-normal">
                          {teacherNotes?.note || '....................................................................................................'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Keputusan Panel (Printed on Semester Genap) */}
              {isSemesterGenap && (
                <div className="border border-black p-3 text-[11px] w-full leading-relaxed mt-3 rounded-none">
                  <p className="font-bold mb-1">Keputusan :</p>
                  <p>Berdasarkan ketercapaian kompetensi pada semester ke-1 dan ke-2 Peserta didik ditetapkan *)</p>
                  <p className="font-bold my-1.5 flex flex-wrap items-baseline">
                    {decisionText === 'LULUS' ? (
                      <>
                        <span className="shrink-0">
                          <span className="underline">Lulus</span> / <span className="line-through text-slate-500 font-normal">Tidak Lulus</span> : &nbsp;
                        </span>
                        <span className="underline decoration-dashed font-black tracking-wide px-1.5 uppercase text-[12px]">
                          LULUS
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="shrink-0">
                          <span className="underline">Naik Kelas</span> / <span className="line-through text-slate-500 font-normal">Tinggal Kelas</span> : &nbsp;
                        </span>
                        <span className="underline decoration-dashed font-black tracking-wide px-1.5 uppercase text-[12px]">
                          {decisionText}
                        </span>
                      </>
                    )}
                  </p>
                  <p className="text-[9px] text-slate-500 italic mt-0.5 font-normal">*) Coret yang tidak perlu</p>
                </div>
              )}
            </div>

            {/* Signatures block */}
            <div className="flex flex-col gap-4 pt-4 w-full text-[11px] leading-relaxed mt-4 font-serif">
              
              {/* Row 1: Wali Murid (Left) & Guru Kelas (Right) */}
              <div className="flex justify-between w-full">
                
                {/* Left side: Wali Murid */}
                <div className="flex flex-col justify-between h-28 w-1/3 text-center">
                  <div>
                    <span className="block h-4"></span> {/* Spacer to align with date on right */}
                    <p className="font-semibold text-center">Wali Murid</p>
                  </div>
                  <div>
                    <p className="font-bold text-center">......................................</p>
                  </div>
                </div>

                {/* Right side: Date + Guru Kelas */}
                <div className="flex flex-col justify-between h-28 w-1/3 text-center">
                  <div>
                    <p className="normal-case text-center">
                      {(schoolInfo?.kabupaten || 'SITUBONDO').toUpperCase()},{' '}
                      {formatDateToIndonesian(schoolInfo?.tanggalRaporSas || '')}
                    </p>
                    <p className="font-semibold text-center">Guru Kelas {schoolInfo?.kelas || ''}</p>
                  </div>
                  <div>
                    <p className="font-black underline uppercase text-[11px] leading-tight text-center font-bold">
                      {schoolInfo?.guruKelas || '......................................'}
                    </p>
                    <p className="text-[9.5px] text-slate-500 leading-none mt-1 text-center">
                      {schoolInfo?.nipGuru ? `NIP. ${schoolInfo.nipGuru}` : 'NIP. .........................'}
                    </p>
                  </div>
                </div>

              </div>

              {/* Row 2: Mengetahui, Kepala Sekolah (Center) */}
              <div className="flex justify-center w-full mt-4">
                <div className="flex flex-col justify-between h-28 w-1/3 text-center">
                  <div>
                    <p className="text-center">Mengetahui,</p>
                    <p className="font-bold text-center">Kepala {schoolInfo?.namaSekolah || 'Sekolah'}</p>
                  </div>
                  <div>
                    <p className="font-black underline uppercase text-[11px] leading-tight text-center font-bold">
                      {schoolInfo?.pltKepala || '......................................'}
                    </p>
                    <p className="text-[9.5px] text-slate-500 leading-none mt-1 text-center">
                      {schoolInfo?.nipKepala ? `NIP. ${schoolInfo.nipKepala}` : 'NIP. .........................'}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="text-[9px] text-slate-400 text-right mt-4 print:hidden">
              Halaman 2
            </div>
          </div>
        )}

      </div>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          html, body, #root, main {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }
          .print-sheet {
            display: flex !important;
            flex-direction: column !important;
            position: relative !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-shadow: none !important;
            border-width: 0 !important;
            margin: 0 !important;
            padding: 15mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            transform: none !important;
            zoom: normal !important;
            background-color: white !important;
            color: black !important;
            overflow: hidden !important;
          }
          .print-sheet:last-child {
            /* prevent extra blank page */
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          .print-btn-panel {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function PrintLegerView({
  students,
  schoolInfo,
  subjects,
  type = 'sas',
}: {
  students: Student[];
  schoolInfo: SchoolInfo | null;
  subjects: Subject[];
  type?: 'sas' | 'sts';
}) {
  const [grades, setGrades] = useState<any[]>([]);
  const [mappings, setMappings] = useState<Record<string, any>>({});
  const [loadingGrades, setLoadingGrades] = useState(true);
  const [loadingMappings, setLoadingMappings] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'grades'));
    return onSnapshot(q, (snap) => {
      setGrades(snap.docs.map(d => d.data()));
      setLoadingGrades(false);
    }, (err) => {
      console.error(err);
      setLoadingGrades(false);
    });
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'mappings'));
    return onSnapshot(q, (snap) => {
      const data: Record<string, any> = {};
      snap.docs.forEach(docSnap => {
        data[docSnap.id] = docSnap.data().mapping;
      });
      setMappings(data);
      setLoadingMappings(false);
    }, (err) => {
      console.error(err);
      setLoadingMappings(false);
    });
  }, []);

  const formatDateToIndonesian = (dateStr: string) => {
    if (!dateStr) return '...................';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '...................';
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return '...................';
    }
  };

  if (loadingGrades || loadingMappings) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const orderedSubjects = [...subjects].sort((a, b) => a.order - b.order);

  const getScore = (studentId: string, subj: Subject) => {
    const sGrade = grades.find(g => g.studentId === studentId && g.subjectId === subj.id) || { tpScores: {}, sas: 0 };
    const activeMapping = mappings[subj.id] || { "1": "1", "2": "2", "3": "3", "4": "4", "5": "5" };
    
    const mappedTpNumbers = Object.values(activeMapping).filter(Boolean);
    const tpValues = mappedTpNumbers
      .map(tpNo => Number((sGrade.tpScores as any)?.[tpNo as string]))
      .filter(v => !isNaN(v) && v > 0);
    
    const rataRata = tpValues.length > 0 ? Math.round(tpValues.reduce((a, b) => a + b, 0) / tpValues.length) : 0;
    const sas = Number(sGrade.sas || 0);
    
    const nilaiRapor = (rataRata > 0 || sas > 0) ? Math.round((rataRata + sas) / ((rataRata > 0 && sas > 0) ? 2 : 1)) : 0;
    return type === 'sas' ? nilaiRapor : rataRata;
  };

  const studentScores = students.map((s) => {
    const scores: Record<string, number> = {};
    let total = 0;
    let count = 0;
    orderedSubjects.forEach(subj => {
      const score = getScore(s.id, subj);
      scores[subj.id] = score;
      if (score > 0) {
        total += score;
        count++;
      }
    });
    const avg = count > 0 ? Math.round(total / count) : 0;
    return {
      student: s,
      scores,
      total,
      avg,
    };
  });

  // Implement unique sequential ranking based on the Excel formula:
  // RANK(O7;$O$7:$O$36;0) + COUNTIF($O$7:O7;O7) - 1
  const rankingMap: Record<string, number> = {};
  const allTotals = studentScores.map(x => x.total > 0 ? x.total : null);

  studentScores.forEach((item, i) => {
    if (item.total <= 0) {
      return;
    }
    
    // RANK: count how many students have total score strictly greater than current student's total, plus 1.
    const rankEq = allTotals.filter((score): score is number => score !== null && score > item.total).length + 1;
    
    // COUNTIF up to index i: count occurrences of current student's total up to index i (inclusive).
    const countIf = allTotals.slice(0, i + 1).filter(score => score === item.total).length;
    
    // Formula: RANK + COUNTIF - 1
    const finalRank = rankEq + countIf - 1;
    
    rankingMap[item.student.id] = finalRank;
  });

  const isSemesterGenap = (schoolInfo?.semester || '').toUpperCase() === 'GENAP';
  const titleMain = type === 'sas'
    ? (isSemesterGenap 
        ? 'DAFTAR KUMPULAN NILAI RAPOR SUMATIF AKHIR TAHUN' 
        : 'DAFTAR KUMPULAN NILAI RAPOR SUMATIF AKHIR SEMESTER')
    : 'DAFTAR KUMPULAN NILAI RAPOR SUMATIF TENGAH SEMESTER';

  const dateToUse = type === 'sas' ? (schoolInfo?.tanggalRaporSas || '') : (schoolInfo?.tanggalRaporSts || '');
  const reportDate = dateToUse ? formatDateToIndonesian(dateToUse) : '...................';
  const schoolKab = (schoolInfo?.kabupaten || 'SITUBONDO').toUpperCase();

  return (
    <div className="space-y-4">
      {/* Control panel - hidden during print */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap gap-4 items-center justify-between print:hidden font-sans">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Printer size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 font-sans">Cetak Leger {type.toUpperCase()} ({schoolInfo?.semester || 'Ganjil'})</h3>
            <p className="text-slate-500 text-[10px] mt-0.5 font-sans">Optimalkan halaman ini untuk dicetak lanskap. Ekspor ke PDF atau Cetak dengan mudah.</p>
          </div>
        </div>
        
        <div className="flex gap-2 font-sans">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-blue-200"
          >
            <Printer size={15} /> Cetak Leger
          </button>
        </div>
      </div>

      {/* Landscape Information Alert */}
      <div className="bg-amber-50/70 border border-amber-200/60 p-3.5 rounded-xl flex items-start gap-2.5 text-amber-800 text-[11px] leading-relaxed print:hidden font-sans">
        <AlertTriangle size={15} className="shrink-0 text-amber-600 mt-0.5" />
        <div>
          <strong className="font-semibold block">Panduan Pengaturan Cetak:</strong>
          Saat jendela pencetakan browser Anda terbuka, pastikan untuk mengubah orientasi tata letak menjadi <span className="underline font-bold">Lanskap/Landscape</span> dan sesuaikan konfigurasi margin (pilih "Kustom/Custom" atau "Minimum") agar tabel muat sempurna dalam satu halaman landscape.
        </div>
      </div>

      {/* Margins layer wrap */}
      <div className="w-full overflow-x-auto bg-white rounded-3xl p-6 lg:p-8 border border-slate-100 shadow-xl shadow-slate-200/30 print:shadow-none print:border-none print:p-0 print:bg-white">
        
        {/* Printable Section sheet */}
        <div className="print-leger-sheet w-full font-serif text-slate-900 mx-auto" style={{ maxWidth: '297mm' }}>
          
          {/* Header */}
          <div className="text-center mb-6 leading-tight select-none">
            <h1 className="text-sm font-bold tracking-wider">{titleMain}</h1>
            <p className="text-xs font-bold uppercase mt-1">KELAS {schoolInfo?.kelas || '-'} - FASE {schoolInfo?.fase || 'C'}</p>
            <p className="text-xs font-bold uppercase mt-0.5">TAHUN AJARAN {schoolInfo?.tahunAjaran || '-'}</p>
          </div>

          {/* Table container with black borders */}
          <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse border border-black text-[9px] leading-tight font-serif print:text-[8px] print:leading-normal">
              <thead>
                <tr className="bg-slate-200/90 font-bold text-center border-b border-black">
                  <th className="border border-black px-1.5 py-3 w-[3%] text-center uppercase min-w-[25px]">NO</th>
                  <th className="border border-black px-1.5 py-3 w-[10%] text-center uppercase min-w-[70px]">NISN</th>
                  <th className="border border-black px-2 py-3 w-[22%] text-center uppercase min-w-[150px]">NAMA</th>
                  
                  {/* Subjects Headers */}
                  {orderedSubjects.map((subj, sIdx) => {
                    const headerColors = [
                      'bg-rose-100/80',
                      'bg-orange-100/80',
                      'bg-amber-100/80',
                      'bg-yellow-100/80',
                      'bg-emerald-100/80',
                      'bg-teal-100/80',
                      'bg-sky-100/80',
                      'bg-blue-100/80',
                      'bg-indigo-100/80',
                      'bg-purple-100/80',
                      'bg-fuchsia-100/80',
                      'bg-pink-100/80',
                    ];
                    const chosenBg = headerColors[sIdx % headerColors.length];
                    return (
                      <th 
                        key={subj.id} 
                        className={cn(
                          "border border-black px-0.5 py-1 text-center text-[7.5px] print:text-[6.5px] font-bold tracking-tight leading-tight uppercase min-w-[45px] print:min-w-[38px] max-w-[70px] h-20 align-middle",
                          chosenBg
                        )}
                      >
                        <div className="line-clamp-4 leading-normal">{subj.name}</div>
                      </th>
                    );
                  })}

                  <th className="border border-black px-1.5 py-2 w-[5%] text-center uppercase bg-cyan-100/90 min-w-[45px]">JUMLAH</th>
                  <th className="border border-black px-1.5 py-2 w-[5%] text-center uppercase bg-cyan-100/90 min-w-[45px]">Rata-Rata</th>
                  <th className="border border-black px-1.5 py-2 w-[5%] text-center uppercase bg-yellow-100/90 min-w-[45px]">Ranking</th>
                </tr>
              </thead>
              <tbody>
                {studentScores.length > 0 ? (
                  studentScores.map((item, index) => {
                    return (
                      <tr 
                        key={item.student.id} 
                        className={cn(
                          "hover:bg-slate-50 border-b border-black text-center h-8 align-middle",
                          index % 2 === 1 ? "bg-slate-50/50" : ""
                        )}
                      >
                        <td className="border border-black px-1 py-1 text-center font-normal">{index + 1}</td>
                        <td className="border border-black px-1 py-1 text-center font-mono font-normal tracking-tight">{item.student.nisn || item.student.nis || '-'}</td>
                        <td className="border border-black px-2 py-1 text-left font-bold uppercase truncate max-w-[160px] tracking-wide">{item.student.name}</td>
                        
                        {/* Subject Scores cell */}
                        {orderedSubjects.map(subj => {
                          const val = item.scores[subj.id];
                          return (
                            <td 
                              key={subj.id} 
                              className={cn(
                                "border border-black px-1 py-0.5 text-center font-semibold text-[10px]",
                                val === 0 ? "text-slate-300 font-normal" : ""
                              )}
                            >
                              {val > 0 ? val : '-'}
                            </td>
                          );
                        })}

                        <td className="border border-black px-1 py-0.5 text-center font-black text-[10px] bg-cyan-50/80">{item.total > 0 ? item.total : '-'}</td>
                        <td className="border border-black px-1 py-0.5 text-center font-bold text-[10px] bg-cyan-50/80">{item.avg > 0 ? item.avg : '-'}</td>
                        <td className="border border-black px-1 py-0.5 text-center font-black text-[10.5px] text-amber-900 bg-amber-50/60">{item.total > 0 ? rankingMap[item.student.id] : '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td 
                      colSpan={3 + orderedSubjects.length + 3} 
                      className="border border-black p-8 text-center text-slate-400 font-medium italic"
                    >
                      Belum ada siswa yang terdaftar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Signatures block */}
          <div className="grid grid-cols-2 pt-8 w-full text-[10.5px] leading-normal font-sans tracking-wide">
            
            {/* Left side: Mengetahui, Kepala Sekolah */}
            <div className="flex flex-col justify-between h-24 text-center w-2/3 mx-auto">
              <div>
                <p className="text-center font-normal">Mengetahui,</p>
                <p className="font-bold text-center">Kepala {schoolInfo?.namaSekolah || 'Sekolah'}</p>
              </div>
              <div className="mt-8">
                <p className="font-bold underline uppercase text-[10.5px] leading-tight text-center">
                  {schoolInfo?.pltKepala || '......................................'}
                </p>
                <p className="text-[9.5px] text-slate-500 leading-none mt-1 text-center">
                  {schoolInfo?.nipKepala ? `NIP. ${schoolInfo.nipKepala}` : 'NIP. .........................'}
                </p>
              </div>
            </div>

            {/* Right side: Rapor Date + Guru Kelas */}
            <div className="flex flex-col justify-between h-24 text-center w-2/3 mx-auto">
              <div>
                <p className="normal-case text-center font-normal">
                  {schoolKab}, {reportDate}
                </p>
                <p className="font-bold text-center">Guru Kelas {schoolInfo?.kelas || ''}</p>
              </div>
              <div className="mt-8">
                <p className="font-bold underline uppercase text-[10.5px] leading-tight text-center">
                  {schoolInfo?.guruKelas || '......................................'}
                </p>
                <p className="text-[9.5px] text-slate-500 leading-none mt-1 text-center">
                  {schoolInfo?.nipGuru ? `NIP. ${schoolInfo.nipGuru}` : 'NIP. .........................'}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
      
      {/* Landscape Printing Styles - only appended when this view is rendered */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 6mm 8mm 6mm 8mm;
          }
          html, body, #root, main {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
          }
          /* Absolute print width settings for landscape */
          .print-leger-sheet {
            width: 100% !important;
            max-width: 100% !important;
            border-width: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background-color: white !important;
            color: black !important;
          }
          /* Suppress all sidebar headers, menus, wrapping tags */
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .bg-slate-50 {
            background-color: white !important;
          }
          /* Ensure headers can wrap nicely */
          .vertical-header th {
            font-size: 7.5px !important;
          }
          th, td {
            background-color: transparent;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Explicit colors for printing cells */
          thead tr th {
            background-color: #f1f5f9 !important; /* bg-slate-100 equivalent */
          }
          thead tr th.bg-rose-100\\/80 { background-color: #ffd1d7 !important; }
          thead tr th.bg-orange-100\\/80 { background-color: #ffe0b2 !important; }
          thead tr th.bg-amber-100\\/80 { background-color: #ffecb3 !important; }
          thead tr th.bg-yellow-100\\/80 { background-color: #fff9c4 !important; }
          thead tr th.bg-emerald-100\\/80 { background-color: #c8e6c9 !important; }
          thead tr th.bg-teal-100\\/80 { background-color: #b2dfdb !important; }
          thead tr th.bg-sky-100\\/80 { background-color: #e0f7fa !important; }
          thead tr th.bg-blue-100\\/80 { background-color: #bbdefb !important; }
          thead tr th.bg-indigo-100\\/80 { background-color: #c5cae9 !important; }
          thead tr th.bg-purple-100\\/80 { background-color: #e1bee7 !important; }
          thead tr th.bg-fuchsia-100\\/80 { background-color: #f8bbd0 !important; }
          thead tr th.bg-pink-100\\/80 { background-color: #f8bbd0 !important; }

          thead tr th.bg-cyan-100\\/90 { background-color: #b2ebf2 !important; }
          thead tr th.bg-yellow-100\\/90 { background-color: #fff59d !important; }

          tbody tr td.bg-cyan-50\\/80 { background-color: #e0f7fa !important; }
          tbody tr td.bg-amber-50\\/60 { background-color: #fffde7 !important; }
        }
      `}</style>
    </div>
  );
}

function EmptyView({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <FileText size={32} />
      </div>
      <h3 className="text-lg font-semibold text-slate-600">Halaman {title}</h3>
      <p className="text-sm">Fitur ini sedang dalam tahap pengembangan.</p>
    </div>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeGradeSubjectOrder, setActiveGradeSubjectOrder] = useState(1);
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);

  useEffect(() => {
    if (user) {
      setActiveTab('dashboard');
    }
  }, [user]);

  useEffect(() => {
    testConnection();
  }, []);

  useEffect(() => {
    if (!user) return;

    const qStudents = query(collection(db, 'students'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
    }, (error) => {
      console.error("Root students snapshot failed", error);
    });

    const qSubjects = query(collection(db, 'subjects'));
    const unsubSubjects = onSnapshot(qSubjects, (snap) => {
      setSubjects(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Subject)));
    }, (error) => {
      console.error("Root subjects snapshot failed", error);
    });

    const qSchool = query(collection(db, 'school_info'));
    const unsubSchool = onSnapshot(qSchool, (snap) => {
      if (!snap.empty) {
        setSchoolInfo({ id: snap.docs[0].id, ...snap.docs[0].data() } as SchoolInfo);
      }
    }, (error) => {
      console.error("Root school_info snapshot failed", error);
    });

    return () => {
      unsubStudents();
      unsubSubjects();
      unsubSchool();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const getBreadcrumbLabel = (id: string) => {
    const labels: Record<string, string> = {
      'dashboard': 'Dashboard',
      'school': 'Data Sekolah',
      'students': 'Data Siswa',
      'subjects': 'Data Mata Pelajaran',
      'grades-subject': 'Nilai Mapel',
      'grades-co': 'Nilai Kokurikuler',
      'grades-extra': 'Nilai Ekstrakurikuler',
      'attendance': 'Data Absen',
      'teacher-notes': 'Catatan Guru',
      'print-sampul': 'Cetak Sampul Rapor',
      'print-rapor-sts': 'Cetak Rapor STS',
      'print-leger-sts': 'Cetak Leger STS',
      'print-rapor-sas': 'Cetak Rapor SAS',
      'print-leger-sas': 'Cetak Leger SAS',
    };
    return labels[id] || id;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex print:bg-white print:block">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 overflow-y-auto relative print:overflow-visible print:p-0">
        {/* Modern Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 blur-[120px] rounded-full pointer-events-none -z-10 print:hidden" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-100/30 blur-[100px] rounded-full pointer-events-none -z-10 print:hidden" />
        
        <div className="p-3 lg:px-4 lg:py-3 print:p-0">
          <header className="mb-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 print:hidden">
            <div>
              <nav className="flex items-center gap-1.5 text-[8px] font-medium text-slate-400 mb-0.5">
                <span>Rapor Merdeka</span>
                <ChevronRight size={9} />
                <span className="text-blue-600 font-bold">{getBreadcrumbLabel(activeTab)}</span>
              </nav>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Halo, {user.displayName?.split(' ')[0]}
              </h1>
              <p className="text-slate-500 text-[10px]">Kelola data pendidikan sekolah secara efisien.</p>
            </div>
            
            <div className="flex gap-2">
              <div className="bg-white/70 backdrop-blur-md border border-slate-200 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <Search className="text-slate-400" size={14} />
                <input 
                  placeholder="Cari..." 
                  className="bg-transparent border-none outline-none text-[10px] w-32 text-slate-600 placeholder:text-slate-400"
                />
              </div>
              <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center shadow-sm relative cursor-pointer hover:bg-slate-50">
                <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-white" />
                <CalendarCheck size={14} className="text-slate-500" />
              </div>
            </div>
          </header>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {activeTab === 'dashboard' && <DashboardView students={students} subjects={subjects} />}
              {activeTab === 'school' && <SchoolView info={schoolInfo} />}
              {activeTab === 'students' && <StudentView students={students} subjects={subjects} />}
              {activeTab === 'subjects' && <SubjectView subjects={subjects} />}
              {activeTab === 'grades-subject' && (
                <GradeView 
                  students={students} 
                  subjects={subjects} 
                  activeOrder={activeGradeSubjectOrder}
                  setActiveOrder={setActiveGradeSubjectOrder}
                />
              )}
              {activeTab === 'grades-co' && <KokurikulerView students={students} />}
              {activeTab === 'grades-extra' && <EkstrakurikulerView students={students} />}
              {activeTab === 'attendance' && <AttendanceView students={students} />}
              {activeTab === 'teacher-notes' && <TeacherNotesView students={students} />}
              {activeTab === 'print-sampul' && <SampulRaporView students={students} schoolInfo={schoolInfo} />}
              {activeTab === 'print-rapor-sas' && (
                <PrintRaporView students={students} schoolInfo={schoolInfo} subjects={subjects} type="sas" />
              )}
              {activeTab === 'print-rapor-sts' && (
                <PrintRaporView students={students} schoolInfo={schoolInfo} subjects={subjects} type="sts" />
              )}
              {activeTab === 'print-leger-sas' && (
                <PrintLegerView students={students} schoolInfo={schoolInfo} subjects={subjects} type="sas" />
              )}
              {activeTab === 'print-leger-sts' && (
                <PrintLegerView students={students} schoolInfo={schoolInfo} subjects={subjects} type="sts" />
              )}
              {activeTab.startsWith('print') && 
               activeTab !== 'print-sampul' && 
               activeTab !== 'print-rapor-sas' && 
               activeTab !== 'print-rapor-sts' && 
               activeTab !== 'print-leger-sas' && 
               activeTab !== 'print-leger-sts' && (
                <EmptyView title={getBreadcrumbLabel(activeTab)} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <AppContent />
    </AuthProvider>
  );
}
