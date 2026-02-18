import { read, utils, write } from 'xlsx';
import { Employee, ChartNode } from '../types';

export const buildTree = (employees: Employee[]): ChartNode[] => {
  const validEmployees = employees.filter(e => e && e.id && e.name && e.name.trim() !== '');
  const map = new Map<string, ChartNode>();

  // Primeiro, criamos todos os nós e inicializamos seus filhos
  validEmployees.forEach(emp => {
    map.set(emp.id, { ...emp, children: [] });
  });

  const roots: ChartNode[] = [];
  const parentOf = new Map<string, string>(); // rastro de quem é pai de quem para detectar ciclos

  validEmployees.forEach(emp => {
    const childId = emp.id;
    const parentId = emp.parentId;
    const node = map.get(childId)!;

    if (parentId && map.has(parentId) && parentId !== childId) {
      // Detecção de ciclo: verificar se o novo pai já é um descendente deste nó
      let current = parentId;
      let cycle = false;
      while (current) {
        if (current === childId) {
          cycle = true;
          break;
        }
        current = parentOf.get(current) || '';
      }

      if (!cycle) {
        map.get(parentId)!.children.push(node);
        // Atualizar o rastro
        parentOf.set(childId, parentId);
      } else {
        // Se houver ciclo, tratamos este nó como raiz para que apareça na tela
        roots.push(node);
      }
    } else {
      // Se não tem pai, ou o pai não existe no mapa, é uma raiz
      roots.push(node);
    }
  });

  // Calculate total subordinates recursively
  const calculateSubordinates = (node: ChartNode): number => {
    if (!node.children || node.children.length === 0) {
      node.totalSubordinates = 0;
      return 0;
    }
    let count = node.children.length;
    node.children.forEach(child => {
      count += calculateSubordinates(child);
    });
    node.totalSubordinates = count;
    return count;
  };

  roots.forEach(root => calculateSubordinates(root));

  return roots;
};

// Mapeamento de cabeçalhos (PT/EN) -> Propriedades
const HEADER_MAP: { [key: string]: keyof Employee } = {
  'id': 'id',
  'nome completo': 'name', 'name': 'name', 'nome': 'name',
  'cargo': 'role', 'role': 'role', 'função': 'role',
  'id do superior': 'parentId', 'parentid': 'parentId', 'managerid': 'parentId', 'superior': 'parentId', 'id superior': 'parentId', 'chefe': 'parentId',
  'url da foto': 'photoUrl', 'photourl': 'photoUrl', 'photo': 'photoUrl', 'imagem': 'photoUrl',
  'descrição': 'description', 'description': 'description', 'obs': 'description', 'observação': 'description',
  'departamento': 'department', 'department': 'department', 'área': 'department', 'area': 'department', 'setor': 'department', 'depto': 'department', 'departament': 'department', 'unidade': 'department',
  'turno': 'shift', 'shift': 'shift', 'período': 'shift',
  'status (ativo)': 'isActive', 'isactive': 'isActive', 'active': 'isActive', 'ativo': 'isActive',
  'data de nascimento': 'birthDate', 'birthdate': 'birthDate', 'nascimento': 'birthDate',
  'início das férias': 'vacationStart', 'vacationstart': 'vacationStart', 'férias': 'vacationStart',
  'dias de férias': 'vacationDays', 'vacationdays': 'vacationDays',
  'layout dos subordinados': 'childOrientation', 'childorientation': 'childOrientation'
};

const excelDateToISO = (serial: any): string | undefined => {
  if (!serial) return undefined;

  // Se for um número (serial do Excel)
  if (!isNaN(Number(serial)) && typeof serial !== 'boolean') {
    const date = new Date((Number(serial) - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }

  // Se for uma string de data (YYYY-MM-DD ou DD/MM/YYYY etc)
  try {
    const date = new Date(serial);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error("Erro ao converter data:", serial);
  }

  return undefined;
};

const normalizeEmployeeData = (rawEmp: any): Employee => {
  const emp: any = {};

  Object.keys(rawEmp).forEach(key => {
    const cleanKey = key.trim().toLowerCase();

    // Tenta correspondência exata primeiro
    let foundAlias = HEADER_MAP[cleanKey] ? cleanKey : undefined;

    // Se não encontrar exata, busca a mais longa que esteja contida na chave
    if (!foundAlias) {
      const sortedAliases = Object.keys(HEADER_MAP).sort((a, b) => b.length - a.length);
      foundAlias = sortedAliases.find(alias => cleanKey.includes(alias));
    }

    if (foundAlias) {
      const field = HEADER_MAP[foundAlias];
      let value = rawEmp[key];

      if (value !== undefined && value !== null) {
        // Transformações
        if (field === 'isActive') {
          if (typeof value === 'boolean') {
            // já é bool
          } else {
            const lower = String(value).toLowerCase();
            value = lower === 'sim' || lower === 'true' || lower === '1';
          }
        } else if (field === 'vacationDays') {
          const num = parseInt(String(value));
          value = !isNaN(num) && [10, 15, 20, 30].includes(num) ? num : undefined;
        } else if (field === 'shift') {
          const shiftMap: any = { 'manhã': 'morning', 'tarde': 'afternoon', 'noite': 'night', 'flexível': 'flexible' };
          value = shiftMap[String(value).toLowerCase()] || value; // Aceita valores originais se já estiverem em inglês
        } else if (field === 'childOrientation') {
          const orientation = String(value).toLowerCase();
          value = orientation === 'horizontal' || orientation === 'vertical' ? orientation : undefined;
        } else if (field === 'department') {
          // Normaliza departamento vazio para undefined para cair no fallback unificado
          value = String(value).trim() === '' ? undefined : value;
        } else if (field === 'birthDate' || field === 'vacationStart') {
          value = excelDateToISO(value);
        }

        if (value !== undefined) {
          emp[field] = value;
        }
      }
    }
  });

  if (emp.isActive === undefined) emp.isActive = true;
  if (!emp.id) emp.id = Math.random().toString(36).substr(2, 9);
  if (!emp.name) emp.name = '';
  if (!emp.role) emp.role = '';

  return emp as Employee;
};

export const parseCSV = (text: string): Employee[] => {
  // Basic CSV parser to object array, then normalize
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map(line => {
      const values = line.split(',').map(v => v.trim());
      const rawObj: any = {};
      headers.forEach((h, i) => rawObj[h] = values[i]);
      return normalizeEmployeeData(rawObj);
    });
};

export const parseExcel = (data: ArrayBuffer): Employee[] => {
  const workbook = read(data, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = utils.sheet_to_json(worksheet);

  return jsonData.map((raw: any) => normalizeEmployeeData(raw));
};

export const generateExcelTemplate = (): ArrayBuffer => {
  const headers = [
    "ID", "Nome Completo", "Cargo", "ID do Superior", "Departamento", "Turno", "Data de Nascimento",
    "URL da Foto", "Descrição", "Status (Ativo)", "Início das Férias", "Dias de Férias", "Layout dos Subordinados"
  ];

  const exampleData = [
    {
      "ID": "1", "Nome Completo": "João Silva", "Cargo": "CEO", "ID do Superior": "", "Departamento": "Executivo",
      "Turno": "Flexível", "Data de Nascimento": "1980-05-15", "URL da Foto": "https://picsum.photos/200",
      "Descrição": "Líder visionário", "Status (Ativo)": "Sim", "Início das Férias": "", "Dias de Férias": "", "Layout dos Subordinados": "Vertical"
    },
    {
      "ID": "2", "Nome Completo": "Maria Souza", "Cargo": "Diretora", "ID do Superior": "1", "Departamento": "Operações",
      "Turno": "Manhã", "Data de Nascimento": "1985-10-20", "URL da Foto": "https://picsum.photos/201",
      "Descrição": "Gestão Operacional", "Status (Ativo)": "Sim", "Início das Férias": "", "Dias de Férias": "", "Layout dos Subordinados": "Horizontal"
    }
  ];

  const worksheet = utils.json_to_sheet(exampleData, { header: headers });

  // Auto-width adjustment logic (simple approximation)
  const wscols = headers.map(h => ({ wch: h.length + 5 }));
  worksheet['!cols'] = wscols;

  const workbook = utils.book_new();
  utils.book_append_sheet(workbook, worksheet, "Template");

  // Write to buffer
  const wbout = write(workbook, { bookType: 'xlsx', type: 'array' });
  return wbout;
};

export const isEmployeeOnVacation = (emp: Employee): boolean => {
  if (!emp.vacationStart || !emp.vacationDays) return false;
  const start = new Date(emp.vacationStart);
  const end = new Date(start);
  end.setDate(start.getDate() + emp.vacationDays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today >= start && today <= end;
};
// ... (existing code)

export const generateUUID = (): string => {
  // Use crypto.randomUUID if available (secure contexts)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback for insecure contexts (http) or older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
