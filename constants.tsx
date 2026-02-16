
import { Employee } from './types';

// Helper to get current month for demo purposes
const currentMonth = new Date().getMonth() + 1;
const monthStr = currentMonth.toString().padStart(2, '0');

export const INITIAL_DATA: Employee[] = [
  {
    id: '1',
    name: 'Alexandre Silva',
    role: 'CEO & Founder',
    parentId: null,
    photoUrl: 'https://picsum.photos/id/64/200/200',
    description: 'Visionário líder com 15 anos de experiência.',
    department: 'Executivo',
    shift: 'flexible',
    birthDate: `1980-${monthStr}-15` // Dynamically set to current month for demo
  },
  {
    id: '2',
    name: 'Mariana Costa',
    role: 'CTO',
    parentId: '1',
    photoUrl: 'https://picsum.photos/id/65/200/200',
    description: 'Especialista em arquitetura escalável.',
    department: 'Tecnologia',
    shift: 'morning',
    birthDate: '1988-03-22'
  },
  {
    id: '3',
    name: 'Roberto Júnior',
    role: 'CFO',
    parentId: '1',
    photoUrl: 'https://picsum.photos/id/91/200/200',
    description: 'Gestão estratégica financeira.',
    department: 'Financeiro',
    shift: 'morning',
    birthDate: '1975-11-05'
  },
  {
    id: '4',
    name: 'Ana Beatriz',
    role: 'VP de Produto',
    parentId: '1',
    photoUrl: 'https://picsum.photos/id/103/200/200',
    description: 'Focada na experiência do usuário.',
    department: 'Produto',
    shift: 'afternoon',
    birthDate: '1992-07-18'
  },
  {
    id: '5',
    name: 'Carlos Mendes',
    role: 'Gerente de Engenharia',
    parentId: '2',
    photoUrl: 'https://picsum.photos/id/129/200/200',
    department: 'Tecnologia',
    shift: 'morning',
    birthDate: '1985-01-30'
  },
  {
    id: '6',
    name: 'Juliana Paes',
    role: 'Desenvolvedora Sênior',
    parentId: '5',
    photoUrl: 'https://picsum.photos/id/177/200/200',
    department: 'Tecnologia',
    shift: 'night',
    birthDate: `1995-${monthStr}-01` // Another birthday this month
  }
];

export const TEMPLATE_CSV = `ID,Nome Completo,Cargo,ID do Superior,Departamento,Turno,Data de Nascimento,URL da Foto,Descrição,Status (Ativo),Início das Férias,Dias de Férias,Layout dos Subordinados
1,João Silva,CEO,,Executivo,Flexível,1980-05-15,https://picsum.photos/200,Líder visionário,Sim,,,Vertical
2,Maria Souza,Diretora de Operações,1,Operações,Manhã,1985-10-20,https://picsum.photos/201,Especialista em processos,Sim,,,Horizontal
3,Pedro Lima,Gerente de Vendas,2,Vendas,Tarde,1990-12-05,https://picsum.photos/202,Focado em resultados,Sim,,,Vertical
4,Ana Costa,Analista Sênior,2,Vendas,Manhã,1995-03-15,,Em licença maternidade,Não,,,
5,Carlos Pereira,Desenvolvedor,2,Tecnologia,Noite,1998-07-20,,Férias em breve,Sim,2024-12-01,15,Horizontal`;
