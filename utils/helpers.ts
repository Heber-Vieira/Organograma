import { read, utils, write } from 'xlsx';
import { Employee, ChartNode } from '../../types';

export const buildTree = (employees: Employee[]): ChartNode[] => {
  const validEmployees = employees.filter(e => e && e.id && e.name && e.name.trim() !== '');
  const map = new Map<string, ChartNode>();
  const roots: ChartNode[] = [];

  validEmployees.forEach(emp => {
    map.set(emp.id, { ...emp, children: [] });
  });

  validEmployees.forEach(emp => {
    const node = map.get(emp.id)!;
    if (emp.parentId && map.has(emp.parentId)) {
      map.get(emp.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
};

// Mapeamento de cabeçalhos (PT/EN) -> Propriedades
const HEADER_MAP: { [key: string]: keyof Employee } = {
  'id': 'id',
  'nome completo': 'name', 'name': 'name',
  'cargo': 'role', 'role': 'role',
  'id do superior': 'parentId', 'parentid': 'parentId', 'managerid': 'parentId',
  'url da foto': 'photoUrl', 'photourl': 'photoUrl', 'photo': 'photoUrl',
  'descrição': 'description', 'description': 'description',
  'departamento': 'department', 'department': 'department',
  'turno': 'shift', 'shift': 'shift',
  'status (ativo)': 'isActive', 'isactive': 'isActive', 'active': 'isActive',
  'data de nascimento': 'birthDate', 'birthdate': 'birthDate',
  'início das férias': 'vacationStart', 'vacationstart': 'vacationStart',
  'dias de férias': 'vacationDays', 'vacationdays': 'vacationDays',
  'layout dos subordinados': 'childOrientation', 'childorientation': 'childOrientation'
};

const normalizeEmployeeData = (rawEmp: any): Employee => {
  const emp: any = {};

  Object.keys(rawEmp).forEach(key => {
    const cleanKey = key.trim().toLowerCase();
    const mappedKey = HEADER_MAP[cleanKey] || Object.keys(HEADER_MAP).find(k => cleanKey.includes(k));

    if (mappedKey) {
      let value = rawEmp[key];

      if (value !== undefined && value !== '' && value !== null) {
        // Transformações
        if (mappedKey === 'isActive') {
          if (typeof value === 'boolean') {
            // já é bool
          } else {
            const lower = String(value).toLowerCase();
            value = lower === 'sim' || lower === 'true' || lower === '1';
          }
        } else if (mappedKey === 'vacationDays') {
          const num = parseInt(String(value));
          value = !isNaN(num) && [10, 15, 20, 30].includes(num) ? num : undefined;
        } else if (mappedKey === 'shift') {
          const shiftMap: any = { 'manhã': 'morning', 'tarde': 'afternoon', 'noite': 'night', 'flexível': 'flexible' };
          value = shiftMap[String(value).toLowerCase()] || value; // Aceita valores originais se já estiverem em inglês
        } else if (mappedKey === 'childOrientation') {
          const orientation = String(value).toLowerCase();
          value = orientation === 'horizontal' || orientation === 'vertical' ? orientation : undefined;
        } else if (mappedKey === 'birthDate' || mappedKey === 'vacationStart') {
          // Excel serial date number handling logic would go here if needed, but assuming ISO string or simple date string for now
          // If strictly number (Excel date), could convert. For now, trust string/default.
        }

        if (value !== undefined) {
          emp[mappedKey] = value;
        }
      }
    }
  });

  if (emp.isActive === undefined) emp.isActive = true;
  if (!emp.id) emp.id = Math.random().toString(36).substr(2, 9);

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
