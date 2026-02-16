
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Employee, LayoutType, ChartNode, Language, ProjectData } from '../types';
import { INITIAL_DATA, TEMPLATE_CSV } from './constants';
import { buildTree, parseCSV, parseExcel, generateExcelTemplate, isEmployeeOnVacation } from './utils/helpers';
import { TRANSLATIONS } from './utils/translations';
import TreeBranch from './components/TreeBranch';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, ImageRun, TextRun } from 'docx';
import saveAs from 'file-saver';
import {
  Layout, Upload, Download, Search, UserPlus, X, Save, Trash2, ChevronRight,
  AlertTriangle, Moon, Sun, Minus, Plus, Scan, Image as ImageIcon, Globe,
  Move, PenLine, Check, Camera, Printer, FileText, Presentation, FileType,
  ChevronUp, Maximize, Minimize, PanelLeft, RefreshCcw, Briefcase, Clock,
  Filter, Users, Zap, BarChart3, TrendingUp, UserMinus, Ban, Cake, ChevronDown, ToggleRight, ToggleLeft, PartyPopper, Sparkles, Network
} from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Toolbar from './components/Toolbar';
import EmployeeModal from './components/EmployeeModal';
import FullscreenFilter from './components/FullscreenFilter';
import Toast, { Notification } from './components/Toast';
import AdminDashboard from './components/AdminDashboard';
import HeadcountManager from './components/HeadcountManager';

import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [layout, setLayout] = useState<LayoutType>(LayoutType.TECH_CIRCULAR);
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 100, y: 100 });
  const [isPanning, setIsPanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Toolbar Visibility Logic
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);

  // Fullscreen Filter Visibility Logic
  const [isFsFilterVisible, setIsFsFilterVisible] = useState(false);
  const fsFilterHideTimeoutRef = useRef<number | null>(null);

  // Intelligence Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVacationHighlightEnabled, setIsVacationHighlightEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [userName, setUserName] = useState<string>(''); // Estado para o nome do usuário
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isHeadcountManagerOpen, setIsHeadcountManagerOpen] = useState(false);
  const [canViewHeadcount, setCanViewHeadcount] = useState(false);

  const [companyName, setCompanyName] = useState<string>(() => localStorage.getItem('org_company_name') || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>(() => localStorage.getItem('org_company_logo') || '');

  // Metrics Visibility
  const [isMetricsVisible, setIsMetricsVisible] = useState(true);

  // Birthday Highlight Mode
  const [birthdayHighlightMode, setBirthdayHighlightMode] = useState<'off' | 'month' | 'day'>('month');
  const [birthdayAnimationType, setBirthdayAnimationType] = useState<'confetti' | 'fireworks' | 'mixed'>('confetti');

  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (type: Notification['type'], title: string, message?: string) => {
    setNotification({
      id: Math.random().toString(36).substring(7),
      type,
      title,
      message
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const employeePhotoInputRef = useRef<HTMLInputElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  const t = TRANSLATIONS[language];

  // Derived data for filters
  const departments = useMemo(() => {
    const set = new Set(employees.map(e => e.department).filter(Boolean));
    return Array.from(set) as string[];
  }, [employees]);

  const roles = useMemo(() => {
    const set = new Set(employees.map(e => e.role).filter(Boolean));
    return Array.from(set).sort() as string[];
  }, [employees]);

  // Statistics Calculation
  const stats = useMemo(() => {
    const total = employees.length;
    const active = employees.filter(e => e.isActive !== false).length;
    const inactive = total - active;
    const activePercentage = total > 0 ? Math.round((active / total) * 100) : 0;

    const byDept = employees.reduce((acc, curr) => {
      const d = curr.department || 'Geral';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRole = employees.reduce((acc, curr) => {
      const r = curr.role || 'Não Definido';
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byShift = employees.reduce((acc, curr) => {
      const s = curr.shift || 'N/A';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const vacationCount = employees.filter(isEmployeeOnVacation).length;

    const byDeptVacation = employees.filter(isEmployeeOnVacation).reduce((acc, curr) => {
      const d = curr.department || 'Geral';
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byRoleVacation = employees.filter(isEmployeeOnVacation).reduce((acc, curr) => {
      const r = curr.role || 'Não Definido';
      acc[r] = (acc[r] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byShiftVacation = employees.filter(isEmployeeOnVacation).reduce((acc, curr) => {
      const s = curr.shift || 'N/A';
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, active, inactive, activePercentage, byDept, byRole, byShift, vacationCount, byDeptVacation, byRoleVacation, byShiftVacation };
  }, [employees]);

  useEffect(() => {
    if (companyName) {
      localStorage.setItem('org_company_name', companyName);
      document.title = `${companyName} - OrgFlow`;
    }
  }, [companyName]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Data when Session is available
  useEffect(() => {
    const fetchData = async () => {
      if (session?.user) {
        // 1. Check Profile & Role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, role, is_active, view_headcount_permission, visual_style, company_logo') // Buscando visual_style e company_logo
          .eq('id', session.user.id)
          .single();

        if (profile) {
          if (profile.is_active === false) {
            await supabase.auth.signOut();
            showNotification('error', 'Acesso Bloqueado', 'Sua conta foi desativada pelo administrador.');
            return;
          }
          setUserRole(profile.role as 'admin' | 'user' || 'user');
          setUserName(profile.full_name || ''); // Setando o nome
          setCanViewHeadcount(!!profile.view_headcount_permission || profile.role === 'admin');
          if (profile.visual_style) {
            setLayout(profile.visual_style as LayoutType);
          }
          if (profile.company_logo) {
            setCompanyLogo(profile.company_logo);
          }
        } else if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error fetching profile:', profileError);
        }

        // 2. Refresh Org Data
        await fetchOrganizationAndEmployees();
      } else {
        setEmployees([]);
        setOrganizationId(null);
        setCompanyLogo('');
        setCompanyName('');
        setUserRole('user');
      }
    };
    fetchData();
  }, [session]);

  const fetchOrganizationAndEmployees = async () => {
    if (!session?.user) return;
    setIsLoadingData(true);
    try {
      // 1. Get Organization
      let { data: orgs, error: orgError } = await supabase
        .from('organizations')
        .select('id, name, logo_url') // Tenta buscar logo_url
        .eq('owner_id', session.user.id)
        .single();

      // Fallback para coluna antiga 'logo' se 'logo_url' falhar (opcional, mas bom pra compatibilidade)
      if (orgError) {
        const { data: orgsBackup, error: orgErrorBackup } = await supabase
          .from('organizations')
          .select('id, name, logo')
          .eq('owner_id', session.user.id)
          .single();

        if (orgsBackup) {
          orgs = { ...orgsBackup, logo_url: orgsBackup.logo };
          orgError = null;
        }
      }

      if (orgError && orgError.code !== 'PGRST116') {
        console.error('Error fetching org:', orgError);
      }

      let orgId = orgs?.id;

      // If no org, create one (fallback check, though trigger should handle it)
      if (!orgId) {
        const { data: newOrg, error: createError } = await supabase
          .from('organizations')
          .insert([{ name: 'Minha Organização', owner_id: session.user.id }])
          .select()
          .single();
        if (createError) console.error('Error creating org:', createError);
        orgId = newOrg?.id;
      }

      setOrganizationId(orgId);
      if (orgs?.name) setCompanyName(orgs.name);
      if (orgs?.logo_url) setCompanyLogo(orgs.logo_url);

      // 2. Get Employees
      if (orgId) {
        const { data: emps, error: empError } = await supabase
          .from('employees')
          .select('*')
          .eq('organization_id', orgId);

        if (empError) throw empError;

        // Map database fields to app types if necessary (snake_case to camelCase)
        const mappedEmps: Employee[] = (emps || []).map((e: any) => ({
          id: e.id,
          name: e.name,
          role: e.role,
          parentId: e.parent_id,
          photoUrl: e.photo_url,
          department: e.department,
          shift: e.shift,
          isActive: e.is_active,
          childOrientation: e.child_orientation as 'horizontal' | 'vertical',
          description: e.description,
          birthDate: e.birth_date,
          vacationStart: e.vacation_start,
          vacationDays: e.vacation_days
        }));

        // If empty, maybe load initial data? No, start clean.
        setEmployees(mappedEmps);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLayoutChange = async (newLayout: LayoutType) => {
    setLayout(newLayout);
    if (session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ visual_style: newLayout })
          .eq('id', session.user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Erro ao salvar estilo visual:', error);
      }
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };


  // Precise Auto-hide logic (1.5s)
  const startHideTimer = () => {
    if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
    if (showExportMenu) return;

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsToolbarVisible(false);
    }, 1500);
  };

  const showToolbar = () => {
    setIsToolbarVisible(true);
    startHideTimer();
  };

  // Fullscreen Filter Auto-hide logic
  const startFsFilterHideTimer = () => {
    if (fsFilterHideTimeoutRef.current) window.clearTimeout(fsFilterHideTimeoutRef.current);
    fsFilterHideTimeoutRef.current = window.setTimeout(() => {
      setIsFsFilterVisible(false);
    }, 1500);
  };

  const showFsFilter = () => {
    setIsFsFilterVisible(true);
    startFsFilterHideTimer();
  };

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) window.clearTimeout(hideTimeoutRef.current);
      if (fsFilterHideTimeoutRef.current) window.clearTimeout(fsFilterHideTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const handleFullScreenChange = () => {
      const isCurrentlyFull = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFull);
      setTimeout(handleFitToView, 100);
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullScreenChange);
  }, [zoom]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'all' || e.department === selectedDept;
      const matchesShift = selectedShift === 'all' || e.shift === selectedShift;
      const matchesRole = selectedRole === 'all' || e.role === selectedRole;
      return matchesSearch && matchesDept && matchesShift && matchesRole;
    });
  }, [employees, searchTerm, selectedDept, selectedShift, selectedRole]);

  const tree = useMemo(() => buildTree(filteredEmployees), [filteredEmployees]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          let data: Employee[] = [];
          if (isExcel) {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            data = parseExcel(arrayBuffer);
          } else {
            const text = e.target?.result as string;
            data = parseCSV(text);
          }
          setEmployees(data);
          event.target.value = ''; // Reset input to allow re-upload of same file
        } catch (err) {
          console.error(err);
          showNotification('error', 'Erro ao processar arquivo', 'Verifique se o formato do arquivo é válido.');
        }
      };

      if (isExcel) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size < 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const res = e.target?.result as string;

        // Optimistic update
        setCompanyLogo(res);
        localStorage.setItem('org_company_logo', res);

        // Persist to DB
        if (organizationId) {
          try {
            console.log('Tentando salvar logo para org:', organizationId);
            const { error: orgError } = await supabase
              .from('organizations')
              .update({ logo_url: res })
              .eq('id', organizationId);

            if (orgError) {
              console.error('Erro ao atualizar org:', orgError);
              throw orgError;
            }

            // 2. Persist to Profile
            if (session?.user) {
              const { error: profileError } = await supabase
                .from('profiles')
                .update({ company_logo: res })
                .eq('id', session.user.id);

              if (profileError) {
                console.error('Erro ao atualizar perfil:', profileError);
                throw profileError;
              }
            }

            showNotification('success', 'Logo Atualizado', 'O logotipo foi salvo na nuvem com sucesso.');
          } catch (err: any) {
            console.error('Erro ao salvar logo:', err);
            showNotification(
              'error',
              'Falha ao Salvar na Nuvem',
              'Ocorreu um erro ao persistir o logo. Verifique se você rodou o script "fix_logo_persistence.sql" no Supabase.'
            );
          }
        } else {
          console.warn('ID da organização não encontrado ao tentar salvar logo.');
          showNotification('warning', 'Organização não encontrada', 'Não foi possível vincular o logo à sua conta.');
        }
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('warning', 'Imagem muito grande', 'O tamanho máximo permitido é 2MB.');
    }
  };

  const handleEmployeePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.size < 2 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (editingEmployee) setEditingEmployee({ ...editingEmployee, photoUrl: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateEmployee = async (updated: Employee) => {
    // Optimistic update
    setEmployees(prev => prev.map(emp => emp.id === updated.id ? updated : emp));
    setEditingEmployee(null);

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          name: updated.name,
          role: updated.role,
          parent_id: updated.parentId,
          photo_url: updated.photoUrl,
          department: updated.department,
          child_orientation: updated.childOrientation,
          shift: updated.shift,
          description: updated.description,
          birth_date: updated.birthDate || null,
          vacation_start: updated.vacationStart || null,
          vacation_days: updated.vacationDays,
          is_active: updated.isActive
        })
        .eq('id', updated.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating employee:', error);
      showNotification('error', 'Erro ao salvar alterações', error.message || JSON.stringify(error));
      // Revert logic here if needed
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const updated = { ...emp, isActive: emp.isActive === false ? true : false };
    setEmployees(prev => prev.map(e => e.id === emp.id ? updated : e));

    try {
      const { error } = await supabase
        .from('employees')
        .update({ is_active: updated.isActive })
        .eq('id', emp.id);
      if (error) throw error;
    } catch (err) {
      console.error('Error toggling status:', err);
      // Rollback
      setEmployees(prev => prev.map(e => e.id === emp.id ? emp : e));
      showNotification('error', 'Erro ao alterar status', 'Não foi possível atualizar o status do colaborador.');
    }
  };

  const handleAddChild = async (parentId: string | null) => {
    if (!organizationId) return;

    // Prevent multiple root nodes
    const existingRoot = employees.find(e => e.parentId === null);
    if (parentId === null && existingRoot) {
      showNotification(
        'warning',
        'Diretor Já Existente',
        `O colaborador "${existingRoot.name}" já é o diretor principal. Edite-o ou adicione subordinados.`
      );
      // Optional: Focus or highlight existing root?
      return;
    }

    const newEmpTemp: Employee = {
      id: 'temp-' + Date.now(),
      name: 'Novo Colaborador',
      role: 'Cargo',
      parentId: parentId,
      photoUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
      department: 'Departamento',
      shift: 'morning',
      isActive: true,
      birthDate: ''
    };

    // Optimistic UI
    setEmployees(prev => [...prev, newEmpTemp]);

    try {
      const { data, error } = await supabase
        .from('employees')
        .insert([{
          organization_id: organizationId,
          name: newEmpTemp.name,
          role: newEmpTemp.role,
          parent_id: newEmpTemp.parentId,
          photo_url: newEmpTemp.photoUrl,
          department: newEmpTemp.department,
          shift: newEmpTemp.shift,
          is_active: newEmpTemp.isActive,
          birth_date: null
        }])
        .select()
        .single();

      if (error) throw error;

      // Replace temp ID with real ID
      setEmployees(prev => prev.map(e => e.id === newEmpTemp.id ? { ...e, id: data.id } : e));
      setEditingEmployee({ ...newEmpTemp, id: data.id });

    } catch (error) {
      console.error('Error adding employee:', error);
      setEmployees(prev => prev.filter(e => e.id !== newEmpTemp.id)); // Rollback
      showNotification('error', 'Erro ao adicionar', 'Não foi possível adicionar o novo colaborador.');
    }
  };

  const handleChildOrientationChange = async (emp: Employee, orientation?: 'horizontal' | 'vertical') => {
    const newOrientation: 'horizontal' | 'vertical' = orientation || (emp.childOrientation === 'vertical' ? 'horizontal' : 'vertical');
    const updatedEmp = { ...emp, childOrientation: newOrientation };
    await handleUpdateEmployee(updatedEmp);
  };

  const handleFitToView = () => {
    if (!chartRef.current || !mainRef.current) return;
    const vW = mainRef.current.clientWidth;
    const vH = mainRef.current.clientHeight;
    const padding = isFullscreen ? 40 : 80;
    const rect = chartRef.current.getBoundingClientRect();
    const contentW = rect.width / zoom;
    const contentH = rect.height / zoom;
    const scaleX = (vW - padding * 2) / contentW;
    const scaleY = (vH - padding * 2) / contentH;
    const scale = Math.min(scaleX, scaleY);
    const newZoom = Math.min(Math.max(0.1, scale), 2);

    // Adjust for sidebar
    const sidebarOffset = (isSidebarOpen && !isFullscreen) ? 312 : 0; // 288px (w-72) + 24px (left-6)

    setIsAnimating(true);
    setZoom(newZoom);
    setPan({
      x: (vW - contentW * newZoom) / 2 + (sidebarOffset / 2),
      y: (vH - contentH * newZoom) / 2
    });
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Automação de enquadramento inicial ao carregar o sistema e ao alterar sidebar
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFitToView();
    }, 300);
    return () => clearTimeout(timer);
  }, [isSidebarOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[draggable="true"]')) return;
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({ x: e.clientX - dragStartRef.current.x, y: e.clientY - dragStartRef.current.y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    const direction = e.deltaY < 0 ? 1 : -1;
    setZoom(z => Math.min(Math.max(0.1, z + (direction * 0.05)), 4));
  };

  const downloadTemplate = () => {
    try {
      const buffer = generateExcelTemplate();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'orgflow_template.xlsx');
    } catch (e) {
      console.error("Erro ao gerar template Excel:", e);
      showNotification('error', 'Erro ao gerar template', 'Falha ao criar o arquivo Excel.');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mainRef.current?.requestFullscreen().catch(err => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const getDisplayedTitle = () => companyName || t.orgChartTitle;

  const handleExport = async (format: 'png' | 'pdf' | 'word' | 'ppt') => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      await new Promise(r => setTimeout(r, 200));
      const canvas = await html2canvas(chartRef.current!, {
        backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc',
        scale: 2,
        useCORS: true
      });
      const imgData = canvas.toDataURL('image/png');
      const fileName = `${companyName || 'org'}-${new Date().getTime()}`;
      if (format === 'png') {
        const l = document.createElement('a');
        l.download = `${fileName}.png`;
        l.href = imgData;
        l.click();
      }
      else if (format === 'pdf') {
        const pdf = new jsPDF('l', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 10, 10, 277, 190);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (err) { console.error(err); } finally { setIsExporting(false); }
  };

  const handleSaveProject = () => {
    const projectData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      companyName,
      companyLogo,
      employees,
      layout
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    saveAs(blob, `${companyName || 'organograma'}_backup.json`);
    setShowExportMenu(false);
  };

  const handleProjectUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          if (data.employees && Array.isArray(data.employees)) {
            setEmployees(data.employees);
            if (data.companyName) setCompanyName(data.companyName);
            if (data.companyLogo) {
              setCompanyLogo(data.companyLogo);
              localStorage.setItem('org_company_logo', data.companyLogo);
            }
            if (data.layout) setLayout(data.layout);
            showNotification('success', 'Projeto Carregado', 'O arquivo de projeto foi importado com sucesso!');
          } else {
            showNotification('error', 'Arquivo Inválido', 'O arquivo selecionado está corrompido ou inválido.');
          }
        } catch (err) {
          console.error('Erro ao processar arquivo JSON:', err);
          showNotification('error', 'Erro ao Ler Arquivo', 'Certifique-se de que é um JSON válido.');
        }
        event.target.value = '';
      };
      reader.readAsText(file);
    }
  };

  if (loadingSession) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0f172a]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00897b]"></div></div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-full overflow-hidden select-none font-sans`}>
      <div className="h-screen flex flex-col transition-colors duration-500 bg-[#f0f2f5] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">

        {!isFullscreen && (
          <Navbar
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onImportClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
                fileInputRef.current.click();
              }
            }}
            onLogout={handleLogout}
            userEmail={session.user.email}
            userName={userName} // Passando o nome
            userRole={userRole}
            onOpenAdmin={() => setIsAdminDashboardOpen(true)}
            t={t}
          />
        )}

        <div className="flex flex-1 overflow-hidden relative">

          <Toast notification={notification} onClose={() => setNotification(null)} />

          {!isFullscreen && (
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
              layout={layout}
              onLayoutChange={handleLayoutChange}
              birthdayHighlightMode={birthdayHighlightMode}
              onBirthdayHighlightModeChange={setBirthdayHighlightMode}
              birthdayAnimationType={birthdayAnimationType}
              onBirthdayAnimationTypeChange={setBirthdayAnimationType}
              isMetricsVisible={isMetricsVisible}
              onToggleMetricsVisible={() => setIsMetricsVisible(!isMetricsVisible)}
              stats={stats}
              selectedDept={selectedDept}
              onSelectedDeptChange={setSelectedDept}
              selectedRole={selectedRole}
              onSelectedRoleChange={setSelectedRole}
              selectedShift={selectedShift}
              onSelectedShiftChange={setSelectedShift}
              departments={departments}
              roles={roles}
              onDownloadTemplate={downloadTemplate}
              onAddRootNode={() => handleAddChild(null)}
              isVacationHighlightEnabled={isVacationHighlightEnabled}
              onToggleVacationHighlight={() => setIsVacationHighlightEnabled(!isVacationHighlightEnabled)}
              canViewHeadcount={canViewHeadcount}
              onOpenHeadcount={() => setIsHeadcountManagerOpen(true)}
              t={t}
            />
          )}

          <main
            ref={mainRef}
            className={`flex-1 relative overflow-hidden bg-grid-pattern bg-white dark:bg-[#0f172a] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={() => setIsPanning(false)}
            onMouseLeave={() => setIsPanning(false)}
            onWheel={handleWheel}
          >
            {/* Trigger area for Top Filter Bar (Fullscreen only) */}
            {isFullscreen && (
              <div
                className="absolute top-0 left-0 w-full h-16 z-[90] pointer-events-auto"
                onMouseEnter={showFsFilter}
                onMouseMove={showFsFilter}
              />
            )}

            {/* Floating Filter Panel (Fullscreen only) */}
            {isFullscreen && (
              <FullscreenFilter
                isVisible={isFsFilterVisible}
                layout={layout}
                onLayoutChange={handleLayoutChange}
                stats={stats}
                selectedDept={selectedDept}
                onSelectedDeptChange={setSelectedDept}
                selectedRole={selectedRole}
                onSelectedRoleChange={setSelectedRole}
                selectedShift={selectedShift}
                onSelectedShiftChange={setSelectedShift}
                departments={departments}
                roles={roles}
                onMouseEnter={() => { if (fsFilterHideTimeoutRef.current) window.clearTimeout(fsFilterHideTimeoutRef.current); setIsFsFilterVisible(true); }}
                onMouseLeave={startFsFilterHideTimer}
                t={t}
              />
            )}

            <div
              className="absolute bottom-0 left-0 w-full h-20 z-[90] pointer-events-auto"
              onMouseEnter={showToolbar}
              onMouseMove={showToolbar}
            />

            <Toolbar
              zoom={zoom}
              onZoomChange={setZoom}
              onFitToView={handleFitToView}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
              isExporting={isExporting}
              showExportMenu={showExportMenu}
              onToggleExportMenu={setShowExportMenu}
              onExport={handleExport}
              isVisible={isToolbarVisible}
              onInteract={showToolbar}
              isSidebarOpen={isSidebarOpen}
              isDarkMode={isDarkMode}
              onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
              onSaveProject={handleSaveProject}
              onLoadProject={() => { setShowExportMenu(false); jsonInputRef.current?.click(); }}
              t={t}
            />

            {isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="fixed top-4 right-4 p-2 bg-black/10 hover:bg-black/20 dark:bg-white/10 dark:hover:bg-white/20 rounded-full transition-all text-slate-400 dark:text-slate-500 hover:text-red-500 group z-[200]"
                title="Sair da Tela Cheia"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div
              className={`absolute top-0 left-0 pointer-events-none ${isAnimating ? 'transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1)' : ''}`}
              style={{ transform: `translate(${pan.x}px, ${pan.y}px)` }}
            >
              <div
                className={`origin-top-left pointer-events-auto ${isAnimating ? 'transition-all duration-500' : ''}`}
                style={{ transform: `scale(${zoom})` }}
              >
                <div ref={chartRef} data-chart-container className="p-20 flex flex-col items-center">
                  <div className="text-center mb-12 select-none flex flex-col items-center">
                    <div className="relative group/logo cursor-pointer mb-6" onClick={() => !isFullscreen && logoInputRef.current?.click()}>
                      <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                      {companyLogo ? (
                        <div className="relative inline-flex flex-col items-center">
                          {/* Dynamic Logo Container: no fixed size, adapts to image aspect ratio */}
                          <div className="max-w-[1024px] max-h-[512px] w-auto h-auto rounded-3xl overflow-hidden bg-transparent transition-all flex items-center justify-center p-0">
                            <img src={companyLogo} alt="Logo" className="max-w-full max-h-full object-contain m-0 shadow-sm" />
                          </div>
                          {!isFullscreen && (
                            <button onClick={(e) => { e.stopPropagation(); setCompanyLogo(''); localStorage.removeItem('org_company_logo'); }} className="absolute -top-3 -right-3 bg-red-500 text-white p-2.5 rounded-full opacity-0 group-hover/logo:opacity-100 transition-opacity shadow-lg z-20"><Trash2 className="w-5 h-5" /></button>
                          )}
                        </div>
                      ) : (
                        !isFullscreen && (
                          <div className="w-[512px] h-[320px] rounded-[3rem] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-900/40 border border-slate-200 dark:border-slate-700/50 flex flex-col items-center justify-center gap-6 group hover:scale-[1.02] hover:shadow-2xl hover:shadow-slate-200/50 dark:hover:shadow-black/30 transition-all duration-500 cursor-pointer overflow-hidden relative">
                            <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:linear-gradient(0deg,white,transparent)]" />
                            <div className="w-24 h-24 rounded-3xl bg-white dark:bg-slate-800 shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 z-10 relative">
                              <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-[#00897b] transition-colors duration-300" />
                            </div>
                            <div className="flex flex-col items-center gap-2 z-10">
                              <span className="text-lg font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Adicionar Logotipo</span>
                              <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">Recomendado PNG transparente</span>
                            </div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[#00897b] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          </div>
                        )
                      )}
                    </div>
                    <div className="relative inline-block mt-2" onClick={() => !isFullscreen && setIsEditingTitle(true)}>
                      {isEditingTitle ? (
                        <input autoFocus value={companyName} onChange={e => setCompanyName(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)} className="text-6xl font-black text-center bg-transparent border-b-8 border-[#00897b] outline-none min-w-[600px]" />
                      ) : (
                        <h2 className="text-6xl font-black cursor-pointer hover:text-[#00897b] transition-colors tracking-tight leading-tight text-slate-800 dark:text-slate-100">{getDisplayedTitle()}</h2>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-center w-full mt-8">
                    {tree.map(root => (
                      <TreeBranch
                        key={root.id}
                        node={root}
                        layout={layout}
                        onEdit={setEditingEmployee}
                        onDelete={(id) => {
                          const emp = employees.find(e => e.id === id);
                          if (emp) setEmployeeToDelete(emp);
                        }}
                        onAddChild={handleAddChild}
                        onMoveNode={(d, t) => setEmployees(prev => prev.map(e => e.id === d ? { ...e, parentId: t } : e))}
                        onToggleStatus={handleToggleStatus}
                        language={language}
                        birthdayHighlightMode={birthdayHighlightMode}
                        birthdayAnimationType={birthdayAnimationType}
                        isVacationHighlightEnabled={isVacationHighlightEnabled}
                        onChildOrientationChange={handleChildOrientationChange}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {editingEmployee && (
              <EmployeeModal
                employee={editingEmployee}
                onClose={() => setEditingEmployee(null)}
                onUpdate={handleUpdateEmployee}
                onPhotoUpload={handleEmployeePhotoUpload}
                t={t}
                roles={roles}
                departments={departments}
              />
            )}

            <AdminDashboard
              isOpen={isAdminDashboardOpen}
              onClose={() => setIsAdminDashboardOpen(false)}
              currentUserEmail={session?.user?.email}
              onNotification={showNotification}
              roles={roles}
            />

            {isHeadcountManagerOpen && (
              <HeadcountManager
                language={language}
                onClose={() => setIsHeadcountManagerOpen(false)}
              />
            )}

            {employeeToDelete && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in">
                <div className="bg-white dark:bg-[#1e293b] rounded-[2.5rem] shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 border border-white/20">
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle className="w-10 h-10 text-red-600" /></div>
                  <h3 className="text-2xl font-black mb-3">{t.deleteTitle}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">Você tem certeza que deseja remover este colaborador estratégico? Todos os subordinados diretos serão afetados.</p>
                  <div className="flex gap-4">
                    <button onClick={() => setEmployeeToDelete(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 rounded-2xl font-black uppercase text-xs text-slate-600 dark:text-slate-300 transition-colors">Cancelar</button>
                    <button onClick={async () => {
                      if (!employeeToDelete) return;
                      const idToDelete = (employeeToDelete as any).id;
                      setEmployees(prev => prev.filter(e => e.id !== idToDelete));
                      setEmployeeToDelete(null);
                      try {
                        const { error } = await supabase.from('employees').delete().eq('id', idToDelete);
                        if (error) throw error;
                      } catch (err: any) {
                        console.error('Error deleting:', err);
                        alert(`Erro ao remover colaborador: ${err.message || JSON.stringify(err)}`);
                        // Reload data to rollback
                        fetchOrganizationAndEmployees();
                      }
                    }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-600/20">Sim, Remover</button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </div>

        <style>{`
          .bg-grid-pattern {
              background-image: radial-gradient(rgba(0,137,123,0.1) 1px, transparent 1px);
              background-size: 40px 40px;
          }
          .dark .bg-grid-pattern { background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); }
          .cubic-bezier { transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
          .clip-path-hex {
              clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
          }
          .custom-scrollbar::-webkit-scrollbar {
              width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #cbd5e1;
              border-radius: 4px;
          }
          .dark .custom-scrollbar::-webkit-scrollbar-thumb {
              background-color: #475569;
          }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          @keyframes zoom-in-95 { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          @keyframes slide-in-from-top-4 { from { transform: translateY(-1rem); } to { transform: translateY(0); } }
          .animate-in { animation-fill-mode: forwards; animation-duration: 300ms; }
          .fade-in { animation-name: fade-in; }
          .zoom-in-95 { animation-name: zoom-in-95; }
          .slide-in-from-top-4 { animation-name: slide-in-from-top-4; }
        `}</style>
      </div>
      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <input
        type="file"
        accept=".json"
        ref={jsonInputRef}
        onChange={handleProjectUpload}
        className="hidden"
      />
    </div>
  );
};

export default App;
