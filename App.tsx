
import * as React from 'react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Employee, LayoutType, ChartNode, Language, ProjectData, HeadcountPlanning } from './types';
import { INITIAL_DATA, TEMPLATE_CSV } from './constants';
import { buildTree, parseCSV, parseExcel, generateExcelTemplate, isEmployeeOnVacation, generateUUID } from './utils/helpers';
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
import ConfirmationModal from './components/ConfirmationModal';
import FullscreenFilter from './components/FullscreenFilter';
import Toast, { Notification } from './components/Toast';
import AdminDashboard from './components/AdminDashboard';
import HeadcountManager from './components/HeadcountManager';

import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

const SYSTEM_COLORS = [
  '#1e293b', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#84cc16',
  '#f97316', '#eab308', '#10b981', '#6366f1', '#475569', '#d33149'
];

import ChartDashboard from './components/ChartDashboard';
import { Chart } from './types';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentChart, setCurrentChart] = useState<Chart | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  const [layout, setLayout] = useState<LayoutType>(LayoutType.TECH_CIRCULAR);

  // Persist Zoom and Pan (Namespaced by Chart ID)
  // We initialize with defaults. The actual restoration happens via useEffect when currentChart or employees change.
  const [zoom, setZoom] = useState(0.8);
  const [pan, setPan] = useState({ x: 100, y: 100 });

  const [isPanning, setIsPanning] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Persist zoom/pan changes (namespaced)
  useEffect(() => {
    if (currentChart?.id && !isLoadingData && isZoomRestoredRef.current) {
      localStorage.setItem(`org_zoom_${currentChart.id}`, zoom.toString());
      localStorage.setItem(`org_pan_${currentChart.id}`, JSON.stringify(pan));
    }
  }, [zoom, pan, currentChart?.id, isLoadingData]);

  // Toolbar Visibility Logic
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const hideTimeoutRef = useRef<number | null>(null);
  const forceAutoFitRef = useRef(false);
  const isZoomRestoredRef = useRef(false);

  // Fullscreen Filter Visibility Logic
  const [isFsFilterVisible, setIsFsFilterVisible] = useState(false);
  const fsFilterHideTimeoutRef = useRef<number | null>(null);

  // Intelligence Filters
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [selectionPosition, setSelectionPosition] = useState<{ x: number, y: number } | null>(null);

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'success';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => { },
    variant: 'warning'
  });


  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVacationHighlightEnabled, setIsVacationHighlightEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [language, setLanguage] = useState<Language>('pt');
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default sidebar to closed on mobile/tablet (width < 1024px)
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

  const [userRole, setUserRole] = useState<'admin' | 'user'>('user');
  const [userName, setUserName] = useState<string>(''); // Estado para o nome do usuário
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState(false);
  const [isHeadcountManagerOpen, setIsHeadcountManagerOpen] = useState(false);
  const [canViewHeadcount, setCanViewHeadcount] = useState(false);
  const [headcountData, setHeadcountData] = useState<HeadcountPlanning[]>([]); // New State for Headcount

  const [companyName, setCompanyName] = useState<string>(() => localStorage.getItem('org_company_name') || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [companyLogo, setCompanyLogo] = useState<string>(() => localStorage.getItem('org_company_logo') || '');

  // Metrics Visibility
  const [isMetricsVisible, setIsMetricsVisible] = useState(true);

  // Birthday Highlight Mode
  const [birthdayHighlightMode, setBirthdayHighlightMode] = useState<'off' | 'month' | 'day'>('month');
  const [birthdayAnimationType, setBirthdayAnimationType] = useState<'confetti' | 'fireworks' | 'mixed'>('confetti');
  const [primaryColor, setPrimaryColor] = useState('#00897b');

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
    const depts = Array.from(set).sort() as string[];
    // Add "Sem Departamento" if there are employees without a department
    if (employees.some(e => !e.department) && !depts.includes('Sem Departamento')) {
      depts.push('Sem Departamento');
    }
    return depts;
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
      const d = curr.department || 'Sem Departamento';
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
      const d = curr.department || 'Sem Departamento';
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

  // Effect to set chart name as title when chart is selected
  useEffect(() => {
    if (currentChart) {
      document.title = `${currentChart.name} - ${companyName || 'OrgFlow'}`;
    } else {
      document.title = `${companyName || 'OrgFlow'}`;
    }
  }, [currentChart, companyName]);

  // Effect to sync logo with current chart
  useEffect(() => {
    if (currentChart && currentChart.logo_url) {
      setCompanyLogo(currentChart.logo_url);
    } else if (currentChart && !currentChart.logo_url) {
      setCompanyLogo(''); // Explicitly clear if chart has no logo
    } else {
      // Fallback to global logo if no chart selected (though usually unreachable in chart view)
      const globalLogo = localStorage.getItem('org_company_logo');
      if (globalLogo) setCompanyLogo(globalLogo);
    }
  }, [currentChart]);

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
          .select('full_name, role, is_active, view_headcount_permission, visual_style, company_logo, is_dark_mode, settings, primary_color, organization_id')
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
          if (profile.is_dark_mode !== undefined) {
            setIsDarkMode(!!profile.is_dark_mode);
          }
          if (profile.company_logo) {
            setCompanyLogo(profile.company_logo);
          }
          if (profile.primary_color) {
            setPrimaryColor(profile.primary_color);
          }
          if (profile.settings && typeof profile.settings === 'object') {
            const s = profile.settings as any;
            if (s.birthdayHighlightMode) setBirthdayHighlightMode(s.birthdayHighlightMode);
            if (s.birthdayAnimationType) setBirthdayAnimationType(s.birthdayAnimationType);
            if (s.isVacationHighlightEnabled !== undefined) setIsVacationHighlightEnabled(!!s.isVacationHighlightEnabled);
          }
        } else if (profileError && profileError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error('Error fetching profile:', profileError);
        }

        // 2. Refresh Org Data
        await fetchOrganizationAndEmployees(profile.organization_id);
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

  const fetchOrganizationAndEmployees = async (profileOrgId?: string) => {
    if (!session?.user) return;
    setIsLoadingData(true);
    try {
      // 1. Get Organization
      let orgQuery = supabase
        .from('organizations')
        .select('id, name, logo_url, primary_color');

      if (profileOrgId) {
        orgQuery = orgQuery.eq('id', profileOrgId);
      } else {
        orgQuery = orgQuery.eq('owner_id', session.user.id);
      }

      let { data: orgs, error: orgError } = await orgQuery.single();

      // Fallback para coluna antiga 'logo' se 'logo_url' falhar (opcional, mas bom pra compatibilidade)
      if (orgError) {
        const { data: orgsBackup, error: orgErrorBackup } = await supabase
          .from('organizations')
          .select('id, name, logo, primary_color')
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

      setOrganizationId(orgId);
      if (orgs?.name) setCompanyName(orgs.name);
      if (orgs?.logo_url) setCompanyLogo(orgs.logo_url);

      // SET GLOBAL COLOR PREFERENCE - PRIORITIZE ORGANIZATION COLOR
      if (orgs?.primary_color) {
        setPrimaryColor(orgs.primary_color);
      }

    } catch (error) {
      console.error('Error fetching org:', error);
    } finally {
      // Don't stop loading here if we are going to fetch chart data next?
      // Actually, we stop loading here because we might strictly show dashboard first.
      setIsLoadingData(false);
    }
  };

  const fetchChartEmployees = async (chartId: string) => {
    setIsLoadingData(true);
    try {
      const { data: emps, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('chart_id', chartId) // Filter by Chart ID
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (empError) throw empError;

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
        vacationDays: e.vacation_days,
        chartId: e.chart_id
      }));

      setEmployees(mappedEmps);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showNotification('error', 'Erro ao carregar', 'Falha ao buscar integrantes do organograma.');
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
      const name = e?.name || '';
      const role = e?.role || '';
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = selectedDept === 'all' || (e.department || 'Sem Departamento') === selectedDept;
      const matchesShift = selectedShift === 'all' || e.shift === selectedShift;
      const matchesRole = selectedRole === 'all' || e.role === selectedRole;
      return matchesSearch && matchesDept && matchesShift && matchesRole;
    });
  }, [employees, searchTerm, selectedDept, selectedShift, selectedRole]);

  const tree = useMemo(() => buildTree(filteredEmployees), [filteredEmployees]);

  const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const handleBatchImport = async (data: Employee[]) => {
    if (!organizationId || !session?.user || !currentChart) {
      showNotification('error', 'Erro de Autenticação', 'Você precisa estar logado, em uma organização e com um organograma selecionado para importar.');
      return;
    }

    setIsLoadingData(true);
    try {
      // 0. Filtrar integrantes sem nome (evita importar linhas vazias do Excel)
      const validData = data.filter(emp => emp.name && emp.name.trim() !== '');

      if (validData.length === 0) {
        showNotification('warning', 'Nenhum dado válido', 'Nenhum integrante com nome foi encontrado para importar.');
        return;
      }

      // 1. Mapeamento de IDs (Excel ID -> UUID)
      const idMap = new Map<string, string>();

      // Primeiro pass: Gerar UUIDs para todos e preencher o mapa
      validData.forEach((emp, index) => {
        const newId = generateUUID();
        // Se o emp.id for vazio, usamos o índice para garantir uma chave única no mapa local
        const excelId = String(emp.id || '').trim();
        const lookupKey = excelId || `temp_index_${index}`;
        idMap.set(lookupKey, newId);
      });

      // Segundo pass: Preparar os objetos para o Supabase com os novos IDs e parentIds mapeados
      const employeesToInsert = validData.map((emp, index) => {
        const excelId = String(emp.id || '').trim();
        const lookupKey = excelId || `temp_index_${index}`;
        const newId = idMap.get(lookupKey)!;

        let newParentId = null;
        if (emp.parentId) {
          const parentKey = String(emp.parentId).trim();
          const mappedId = idMap.get(parentKey);
          if (mappedId) {
            newParentId = mappedId;
          } else {
            // Se não está no mapa, pode ser um UUID de um funcionário já existente no banco
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(parentKey);
            if (isUUID) {
              newParentId = emp.parentId;
            }
          }
        }

        // Prevenir auto-referência
        if (newParentId === newId) {
          newParentId = null;
        }

        return {
          id: newId,
          organization_id: organizationId,
          name: emp.name || 'Sem Nome',
          role: emp.role || 'Sem Cargo',
          parent_id: newParentId || null,
          photo_url: emp.photoUrl || null,
          department: emp.department || null,
          shift: emp.shift || 'morning',
          is_active: emp.isActive !== false,
          child_orientation: emp.childOrientation || 'vertical',
          description: emp.description || null,
          birth_date: emp.birthDate || null,
          vacation_start: emp.vacationStart || null,
          vacation_days: emp.vacationDays || null,
          chart_id: currentChart.id
        };
      });

      // 3. Limpar integrantes antigos antes da nova importação para evitar duplicatas e resíduos
      const { error: deleteError } = await supabase
        .from('employees')
        .delete()
        .eq('chart_id', currentChart.id);

      if (deleteError) throw deleteError;

      // 4. Inserir os novos integrantes
      const { error } = await supabase
        .from('employees')
        .insert(employeesToInsert);

      if (error) throw error;

      showNotification('success', 'Importação Concluída', `${data.length} integrantes importados e salvos com sucesso.`);

      // 5. Resetar filtros para garantir que os novos dados apareçam
      setSearchTerm('');
      setSelectedDept('all');
      setSelectedShift('all');
      setSelectedRole('all');

      // 6. Recarregar dados do banco para garantir sincronia total
      // 6. Recarregar dados
      await fetchChartEmployees(currentChart.id);

    } catch (err: any) {
      console.error('Erro na importação em lote:', err);
      showNotification('error', 'Erro na Importação', err.message || 'Falha ao salvar dados no Supabase.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          let data: Employee[] = [];
          if (isExcel) {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            data = parseExcel(arrayBuffer);
          } else {
            const text = e.target?.result as string;
            data = parseCSV(text);
          }

          if (data.length > 0) {
            await handleBatchImport(data);
          }

          event.target.value = '';
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
    if (file && file.size < 5 * 1024 * 1024) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const res = e.target?.result as string;

        try {
          if (currentChart) {
            // Update specific chart logo
            setCurrentChart(prev => prev ? { ...prev, logo_url: res } : null);
            setCompanyLogo(res); // Update UI immediately

            console.log('Salvando logo do organograma:', currentChart.id);
            const { data: updatedChart, error } = await supabase
              .from('charts')
              .update({ logo_url: res })
              .eq('id', currentChart.id)
              .select();

            if (error) throw error;
            if (!updatedChart || updatedChart.length === 0) {
              throw new Error('Permissão negada ou organograma não encontrado (RLS).');
            }

            showNotification('success', 'Logo do Organograma Atualizado', 'O logotipo deste organograma foi salvo com sucesso.');
          } else if (organizationId) {
            // Update global organization logo (fallback)
            setCompanyLogo(res);
            localStorage.setItem('org_company_logo', res);

            console.log('Salvando logo da organização:', organizationId);
            const { error: orgError } = await supabase
              .from('organizations')
              .update({ logo_url: res })
              .eq('id', organizationId);

            if (orgError) throw orgError;

            // Also update profile for consistency
            if (session?.user) {
              await supabase
                .from('profiles')
                .update({ company_logo: res })
                .eq('id', session.user.id);
            }
            showNotification('success', 'Logo da Organização Atualizado', 'O logotipo global foi salvo com sucesso.');
          }
        } catch (err: any) {
          console.error('Erro ao salvar logo:', err);
          showNotification('error', 'Erro ao Salvar', 'Falha ao persistir o logo. Tente novamente.');
        }
      };
      reader.readAsDataURL(file);
    } else {
      showNotification('error', 'Arquivo Inválido', 'Por favor, selecione uma imagem menor que 5MB.');
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

  const handleMoveNode = async (draggedId: string, targetId: string) => {
    // Prevent moving a node to itself
    if (draggedId === targetId) return;

    // Optimistic update
    const previousEmployees = [...employees];
    setEmployees(prev => prev.map(e => e.id === draggedId ? { ...e, parentId: targetId } : e));

    try {
      const { error } = await supabase
        .from('employees')
        .update({ parent_id: targetId })
        .eq('id', draggedId);

      if (error) throw error;
      showNotification('success', 'Hierarquia Atualizada', 'A nova posição do colaborador foi salva com sucesso.');
    } catch (error: any) {
      console.error('Error moving node:', error);
      setEmployees(previousEmployees); // Rollback
      showNotification('error', 'Erro ao Mover', 'Não foi possível salvar a nova hierarquia.');
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
    if (!organizationId || !currentChart) return;

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
          chart_id: currentChart.id,
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

  const handlePrimaryColorChange = async (color: string | null) => {
    const colorToApply = color || '#00897b';
    setPrimaryColor(colorToApply);

    if (session?.user) {
      try {
        // ALWAYS update profile for personal preference/fallback
        const { error } = await supabase
          .from('profiles')
          .update({ primary_color: color })
          .eq('id', session.user.id);

        if (error) throw error;

        // IF ADMIN/OWNER: Update the Global Organization Color
        if (userRole === 'admin' && organizationId) {
          const { error: orgError } = await supabase
            .from('organizations')
            .update({ primary_color: color })
            .eq('id', organizationId);

          if (orgError) console.error('Error updating global org color:', orgError);
          else showNotification('success', 'Cor Global Atualizada', color ? 'A cor foi aplicada para todos os usuários.' : 'A cor padrão foi restaurada.');
        } else {
          showNotification('success', 'Cor Atualizada', 'Sua preferência de cor foi salva.');
        }

      } catch (error) {
        console.error('Erro ao salvar cor primária:', error);
      }
    }
  };

  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    if (e.ctrlKey || e.metaKey) {
      // Toggle selection
      setSelectedNodeIds(prev =>
        prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
      );
      // Update position to the clicked element's client coordinates
      // We use the event directly.
      setSelectionPosition({ x: e.clientX, y: e.clientY });
    } else {
      // Normal click (edit) - clear selection or keep it? 
      // Current behavior is edit on click. Let's keep it but maybe clear selection if clicking without ctrl?
      setSelectedNodeIds([]);
      setSelectionPosition(null);
      const emp = employees.find(e => e.id === nodeId);
      if (emp) setEditingEmployee(emp);
    }
  };

  const areRolesSimilar = (roleA: string, roleB: string) => {
    return roleA.trim().toLowerCase() === roleB.trim().toLowerCase();
  };

  const handleGroupNodes = async () => {
    if (selectedNodeIds.length < 2) {
      showNotification('warning', 'Seleção Insuficiente', 'Selecione pelo menos 2 integrantes para agrupar.');
      return;
    }

    const selectedEmployees = employees.filter(e => selectedNodeIds.includes(e.id));

    // 1. Validate Parent (Siblings only)
    const firstParentId = selectedEmployees[0].parentId;
    const allSameParent = selectedEmployees.every(e => e.parentId === firstParentId);

    if (!allSameParent) {
      showNotification('error', 'Agrupamento Inválido', 'Apenas integrantes do mesmo nível (mesmo superior) podem ser agrupados.');
      return;
    }

    // 2. Validate Roles (Similarity) - SOFT VALIDATION
    const firstRole = selectedEmployees[0].role;
    const allRolesSimilar = selectedEmployees.every(e => areRolesSimilar(e.role, firstRole));

    const proceedWithGrouping = async (groupRoleName: string) => {
      console.log("Iniciando agrupamento...", { groupRoleName, selectedNodeIds, firstParentId });

      // 3. Create Group Node
      const groupNodeId = generateUUID();
      // If roles are similar, use plural if possible, otherwise just "Grupo [Role]"
      // If mixed, use the generic role passed
      const groupName = allRolesSimilar ? `Grupo ${firstRole}s` : `Agrupamento Diversos`;

      const newGroupNode: Employee = {
        id: groupNodeId,
        name: groupName,
        role: groupRoleName,
        parentId: firstParentId,
        department: selectedEmployees[0].department || 'Sem Departamento',
        isActive: true,
        childOrientation: 'vertical',
        photoUrl: '', // No photo for group
      };

      console.log("Novo nó de grupo criado (memória):", newGroupNode);

      // Optimistic Update
      const updatedEmployees = [
        ...employees.map(e => selectedNodeIds.includes(e.id) ? { ...e, parentId: groupNodeId } : e),
        newGroupNode
      ];

      setEmployees(updatedEmployees);
      setSelectedNodeIds([]); // Clear selection
      setSelectionPosition(null);

      // Persist to Supabase
      try {
        console.log("Persistindo no Supabase. OrgID:", organizationId);
        if (!organizationId) throw new Error("Organization ID missing");

        // Insert Group Node FIRST
        const { error: insertError } = await supabase
          .from('employees')
          .insert([{
            id: newGroupNode.id,
            organization_id: organizationId,
            name: newGroupNode.name,
            role: newGroupNode.role,
            parent_id: newGroupNode.parentId,
            department: newGroupNode.department,
            is_active: true,
            child_orientation: 'vertical',
            chart_id: currentChart?.id // Important: Associate group with current chart
          }]);

        if (insertError) {
          console.error("Erro ao inserir grupo:", insertError);
          throw insertError;
        }

        console.log("Grupo inserido com sucesso. Atualizando filhos...");

        // Update Children AFTER parent exists
        const { error: updateError } = await supabase
          .from('employees')
          .update({ parent_id: groupNodeId })
          .in('id', selectedNodeIds);

        if (updateError) {
          console.error("Erro ao atualizar filhos:", updateError);
          throw updateError;
        }

        console.log("Filhos atualizados com sucesso.");
        showNotification('success', 'Grupo Criado', 'Os integrantes foram agrupados com sucesso.');

      } catch (error: any) {
        console.error("Erro CRÍTICO ao agrupar:", error);
        showNotification('error', 'Erro ao Agrupar', `Falha ao salvar: ${error.message || 'Erro desconhecido'}`);
        // Rollback (re-fetch)
        fetchChartEmployees(currentChart?.id || '');
      }
    };

    if (!allRolesSimilar) {
      // Find the distinct roles to show in the message
      const distinctRoles = Array.from(new Set(selectedEmployees.map(e => e.role)));

      setConfirmationModal({
        isOpen: true,
        title: 'Funções Diferentes',
        message: `Você está agrupando funções diferentes (${distinctRoles.join(', ')}). Deseja criar um "Grupo Misto"?`,
        variant: 'warning',
        onConfirm: () => proceedWithGrouping("Grupo Misto")
      });
      return;
    }

    // Direct proceed if roles are similar
    proceedWithGrouping(firstRole);
  };

  const handleUngroupNode = async (groupNode: Employee) => {
    // 1. Identify Children
    const children = employees.filter(e => e.parentId === groupNode.id);

    if (children.length === 0) {
      showNotification('warning', 'Grupo Vazio', 'Este grupo não possui integrantes para desagrupar.');
      return;
    }

    const grandParentId = groupNode.parentId;

    setConfirmationModal({
      isOpen: true,
      title: 'Desagrupar Integrantes',
      message: `Deseja desagrupar "${groupNode.name}"? Os ${children.length} integrantes voltarão para o nível superior.`,
      variant: 'warning',
      onConfirm: async () => {
        // Optimistic Update
        // Move children to grandParent
        const updatedEmployees = employees
          .map(e => e.parentId === groupNode.id ? { ...e, parentId: grandParentId } : e)
          .filter(e => e.id !== groupNode.id); // Remove group node

        setEmployees(updatedEmployees);
        setEditingEmployee(null); // Close modal

        // Persist to Supabase
        try {
          if (!organizationId) throw new Error("Organization ID missing");

          // 1. Update Children to point to GrandParent
          const { error: updateError } = await supabase
            .from('employees')
            .update({ parent_id: grandParentId })
            .eq('parent_id', groupNode.id);

          if (updateError) throw updateError;

          // 2. Delete Group Node
          const { error: deleteError } = await supabase
            .from('employees')
            .delete()
            .eq('id', groupNode.id);

          if (deleteError) throw deleteError;

          showNotification('success', 'Grupo Desfeito', 'Integrantes movidos para o nível superior.');

        } catch (error: any) {
          console.error("Erro ao desagrupar:", error);
          showNotification('error', 'Erro ao Desagrupar', 'Falha ao salvar alterações.');
          fetchChartEmployees(currentChart?.id || '');
        }
      }
    });
  };

  const handleThemeToggle = async () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);

    if (session?.user) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ is_dark_mode: nextMode })
          .eq('id', session.user.id);

        if (error) throw error;
      } catch (error) {
        console.error('Erro ao salvar preferência de tema:', error);
      }
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    if (!session?.user) return;

    // Get current settings first to merge
    const { data: profile } = await supabase
      .from('profiles')
      .select('settings')
      .eq('id', session.user.id)
      .single();

    const currentSettings = profile?.settings || {};
    const updatedSettings = { ...currentSettings, ...newSettings };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ settings: updatedSettings })
        .eq('id', session.user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
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

    // Adjust for sidebar - only on desktop where it's not an overlay
    const isMobile = window.innerWidth < 768;
    const sidebarOffset = (isSidebarOpen && !isFullscreen && !isMobile) ? 312 : 0;

    setIsAnimating(true);
    setZoom(newZoom);
    setPan({
      x: (vW - contentW * newZoom) / 2 + (sidebarOffset / 2),
      y: (vH - contentH * newZoom) / 2
    });
    setTimeout(() => setIsAnimating(false), 500);
  };

  // Automação de enquadramento inicial ao carregar o sistema e ao alterar sidebar
  // SÓ EXECUTA SE NÃO HOUVER ESTADO SALVO (para respeitar a preferência do usuário ao voltar)
  // Restore State or Auto-Fit when Chart Loads or Data Changes
  // Restore State or Auto-Fit when Chart Loads or Data Changes
  // Fetch Headcount Planning Data for FullscreenFilter
  useEffect(() => {
    if (currentChart?.id) {
      const fetchHeadcountData = async () => {
        const { data, error } = await supabase
          .from('headcount_planning')
          .select('*')
          .eq('chart_id', currentChart.id)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          setHeadcountData(data);
        }
      };
      fetchHeadcountData();
    } else {
      setHeadcountData([]);
    }
  }, [currentChart?.id]);

  useEffect(() => {
    // We wait for currentChart to be set. isLoadingData handles the synchronization.
    if (!isLoadingData && currentChart?.id) {
      const zoomKey = `org_zoom_${currentChart.id}`;
      const panKey = `org_pan_${currentChart.id}`;

      const savedZoom = localStorage.getItem(zoomKey);
      const savedPan = localStorage.getItem(panKey);

      // Force auto-fit if requested (e.g. card click) OR no state exists
      if (forceAutoFitRef.current || !savedZoom || !savedPan) {
        forceAutoFitRef.current = false;
        isZoomRestoredRef.current = true; // Allow saving AFTER this auto-fit logic runs

        const timer = setTimeout(() => {
          handleFitToView();
        }, 1000); // 1s timeout to ensure 3rd+ charts render correctly
        return () => clearTimeout(timer);
      } else {
        // Restore saved state
        setZoom(parseFloat(savedZoom));
        setPan(JSON.parse(savedPan));
        isZoomRestoredRef.current = true; // Allow saving now that we restored
      }
    } else if (isLoadingData || !currentChart) {
      isZoomRestoredRef.current = false;
    }
  }, [isLoadingData, currentChart?.id, isSidebarOpen]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[draggable="true"]')) return;
    setIsPanning(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('[draggable="true"]')) return;
    setIsPanning(true);
    const touch = e.touches[0];
    dragStartRef.current = { x: touch.clientX - pan.x, y: touch.clientY - pan.y };
    // Close menus on touch start to focus on navigation
    if (showExportMenu) setShowExportMenu(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPanning) return;
    const touch = e.touches[0];
    setPan({ x: touch.clientX - dragStartRef.current.x, y: touch.clientY - dragStartRef.current.y });
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
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
    return <div className="h-screen w-full flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0f172a]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)]"></div></div>;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''} h-full overflow-hidden select-none font-sans`}>
      <div className="h-screen flex flex-col transition-colors duration-500 bg-[#f0f2f5] dark:bg-[#0f172a] text-slate-800 dark:text-slate-100">
        <Toast notification={notification} onClose={() => setNotification(null)} />

        {!currentChart ? (

          <ChartDashboard
            organizationId={organizationId || ''}
            userRole={userRole}
            onSelectChart={(chartId) => {
              // Reset synchronization refs first
              forceAutoFitRef.current = true;
              isZoomRestoredRef.current = false;
              setIsLoadingData(true); // Bloqueia efeitos secundários IMEDIATAMENTE

              // Reset visual state
              setZoom(0.8);
              setPan({ x: 100, y: 100 });
              setEmployees([]);

              // Fetch Chart Details
              supabase.from('charts').select('*').eq('id', chartId).single().then(({ data }) => {
                if (data) {
                  setCurrentChart(data);
                  fetchChartEmployees(chartId);
                } else {
                  setIsLoadingData(false);
                }
              });
            }}
            onLogout={handleLogout}
            onOpenAdmin={() => setIsAdminDashboardOpen(true)}
            userEmail={session?.user?.email}
            onNotification={showNotification}
            primaryColor={primaryColor}
          />
        ) : (
          <>
            {!isFullscreen && (
              <Navbar
                isSidebarOpen={isSidebarOpen}
                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                isDarkMode={isDarkMode}
                onToggleDarkMode={handleThemeToggle}
                onImportClick={() => {
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    fileInputRef.current.click();
                  }
                }}
                onLogout={handleLogout}
                userEmail={session.user.email}
                userName={userName}
                userRole={userRole}
                onOpenAdmin={() => setIsAdminDashboardOpen(true)}
                t={t}
                onBackToDashboard={() => {
                  setCurrentChart(null);
                  setEmployees([]);
                }}
                companyLogo={currentChart?.logo_url}
                chartName={currentChart?.name}
              />
            )}
            {/* Rest of the UI for Chart View */}
            <div className="flex flex-1 overflow-hidden relative">

              {!isFullscreen && (
                <Sidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  layout={layout}
                  onLayoutChange={handleLayoutChange}
                  birthdayHighlightMode={birthdayHighlightMode}
                  onBirthdayHighlightModeChange={(mode) => {
                    setBirthdayHighlightMode(mode);
                    handleUpdateSettings({ birthdayHighlightMode: mode });
                  }}
                  birthdayAnimationType={birthdayAnimationType}
                  onBirthdayAnimationTypeChange={(type) => {
                    setBirthdayAnimationType(type);
                    handleUpdateSettings({ birthdayAnimationType: type });
                  }}
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
                  onToggleVacationHighlight={() => {
                    const nextValue = !isVacationHighlightEnabled;
                    setIsVacationHighlightEnabled(nextValue);
                    handleUpdateSettings({ isVacationHighlightEnabled: nextValue });
                  }}
                  canViewHeadcount={canViewHeadcount}
                  onOpenHeadcount={() => setIsHeadcountManagerOpen(true)}
                  primaryColor={primaryColor}
                  onPrimaryColorChange={handlePrimaryColorChange}
                  systemColors={SYSTEM_COLORS}
                  userRole={userRole}
                  t={t}
                />
              )}

              <main
                ref={mainRef}
                className={`flex-1 relative overflow-hidden bg-white dark:bg-[#0f172a] ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={() => setIsPanning(false)}
                onMouseLeave={() => setIsPanning(false)}
                onWheel={handleWheel}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {/* Background Grid Pattern - Isolated to prevent chart opacity issues */}
                <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-[0.07] dark:opacity-100" />
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
                    headcountData={headcountData} // Pass Data
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
                    chartName={currentChart?.name}
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
                  onToggleDarkMode={handleThemeToggle}
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
                    <div ref={chartRef} data-chart-container className="p-6 md:p-20 flex flex-col items-center">
                      <div className="text-center mb-8 md:mb-12 select-none flex flex-col items-center">
                        <div className="relative group/logo cursor-pointer mb-4 md:mb-6" onClick={() => !isFullscreen && logoInputRef.current?.click()}>
                          <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
                          {companyLogo ? (
                            <div className="relative inline-flex flex-col items-center">
                              {/* Dynamic Logo Container: no fixed size, adapts to image aspect ratio */}
                              <div className="max-w-[280px] md:max-w-[1024px] max-h-[160px] md:max-h-[512px] w-auto h-auto rounded-2xl md:rounded-3xl overflow-hidden bg-transparent transition-all flex items-center justify-center p-0">
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
                                  <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-[var(--primary-color)] transition-colors duration-300" />
                                </div>
                                <div className="flex flex-col items-center gap-2 z-10">
                                  <span className="text-lg font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">Adicionar Logotipo</span>
                                  <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">Recomendado PNG transparente</span>
                                </div>
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-[var(--primary-color)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                              </div>
                            )
                          )}
                        </div>
                        <div className="relative inline-block mt-2 px-4" onClick={() => !isFullscreen && setIsEditingTitle(true)}>
                          {isEditingTitle ? (
                            <input autoFocus value={companyName} onChange={e => setCompanyName(e.target.value)} onBlur={() => setIsEditingTitle(false)} onKeyDown={e => e.key === 'Enter' && setIsEditingTitle(false)} className="text-3xl md:text-6xl font-black text-center bg-transparent border-b-4 md:border-b-8 border-[var(--primary-color)] outline-none min-w-[280px] md:min-w-[600px]" />
                          ) : (
                            <h2 className="text-3xl md:text-6xl font-black cursor-pointer hover:text-[var(--primary-color)] transition-colors tracking-tight leading-tight text-slate-800 dark:text-slate-100 break-words max-w-[90vw] md:max-w-none">{getDisplayedTitle()}</h2>
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
                            onMoveNode={handleMoveNode}
                            onToggleStatus={handleToggleStatus}
                            language={language}
                            birthdayHighlightMode={birthdayHighlightMode}
                            birthdayAnimationType={birthdayAnimationType}
                            isVacationHighlightEnabled={isVacationHighlightEnabled}
                            onChildOrientationChange={handleChildOrientationChange}
                            selectedNodeIds={selectedNodeIds}
                            onNodeClick={handleNodeClick}
                          />
                        ))}
                      </div>

                      {/* Group Action Button (Contextual) */}
                      {selectedNodeIds.length > 1 && (
                        <div
                          className="fixed z-[9999] animate-in zoom-in-50 fade-in duration-200"
                          style={{
                            left: selectionPosition ? Math.min(window.innerWidth - 300, selectionPosition.x + 20) : '50%', // Mais perto (x + 20) e limite ajustado para botão maior
                            top: selectionPosition ? Math.min(window.innerHeight - 150, selectionPosition.y - 10) : '90%', // Mais perto (y - 10)
                            transform: selectionPosition ? 'none' : 'translateX(-50%)'
                          }}
                        >
                          <button
                            onClick={handleGroupNodes}
                            className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-6 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all font-black uppercase tracking-wider text-xl border-4 border-white ring-4 ring-indigo-500/50"
                          >
                            <Users className="w-10 h-10" />
                            Agrupar ({selectedNodeIds.length})
                          </button>
                        </div>
                      )}
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
                    onUngroup={() => {
                      if (editingEmployee) {
                        const nodeToUngroup = editingEmployee;
                        setEditingEmployee(null); // Close first
                        // Small timeout to allow modal to close animation? No, state change is enough usually.
                        // But to be safe and avoid "flicker" or race conditions in UX:
                        setTimeout(() => handleUngroupNode(nodeToUngroup), 100);
                      }
                    }}
                    canUngroup={!!employees.find(e => e.parentId === editingEmployee.id) && !!currentChart /* Only meaningful check */}
                    // Ensure groups update correctly in multi-chart context
                    key={editingEmployee.id}
                  />
                )}



                <ConfirmationModal
                  isOpen={confirmationModal.isOpen}
                  title={confirmationModal.title}
                  message={confirmationModal.message}
                  onConfirm={confirmationModal.onConfirm}
                  onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                  variant={confirmationModal.variant}
                />



                {isHeadcountManagerOpen && (
                  <HeadcountManager
                    language={language}
                    chartId={currentChart?.id || ''}
                    chartName={currentChart?.name}
                    onClose={() => setIsHeadcountManagerOpen(false)}
                    planningData={headcountData}
                    employees={employees}
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
                            if (currentChart) fetchChartEmployees(currentChart.id);
                          }
                        }} className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-red-600/20">Sim, Remover</button>
                      </div>
                    </div>
                  </div>
                )}

              </main>
            </div>

            <style>{`
          :root {
            --primary-color: ${primaryColor};
          }
          .bg-grid-pattern {
              background-image: radial-gradient(var(--primary-color) 1px, transparent 1px);
              background-size: 40px 40px;
          }
          .dark .bg-grid-pattern { background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px); opacity: 1; }
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
          </>
        )}
      </div>
      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <AdminDashboard
        isOpen={isAdminDashboardOpen}
        onClose={() => setIsAdminDashboardOpen(false)}
        currentUserEmail={session?.user?.email}
        onNotification={showNotification}
        roles={roles}
        departments={departments}
        companyLogo={currentChart ? (currentChart.logo_url ?? null) : companyLogo}
        primaryColor={primaryColor}
        onPrimaryColorChange={handlePrimaryColorChange}
        chartId={currentChart?.id}
        systemColors={SYSTEM_COLORS}
        userRole={userRole}
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
