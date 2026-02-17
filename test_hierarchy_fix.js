
const HEADER_MAP = {
    'id': 'id',
    'nome completo': 'name', 'name': 'name', 'nome': 'name',
    'cargo': 'role', 'role': 'role', 'função': 'role',
    'id do superior': 'parentId', 'parentid': 'parentId', 'managerid': 'parentId', 'superior': 'parentId', 'id superior': 'parentId', 'chefe': 'parentId',
    'url da foto': 'photoUrl', 'photourl': 'photoUrl', 'photo': 'photoUrl', 'imagem': 'photoUrl',
    'descrição': 'description', 'description': 'description', 'obs': 'description', 'observação': 'description',
    'departamento': 'department', 'department': 'department', 'área': 'department', 'area': 'department', 'setor': 'department',
    'turno': 'shift', 'shift': 'shift', 'período': 'shift',
    'status (ativo)': 'isActive', 'isactive': 'isActive', 'active': 'isActive', 'ativo': 'isActive',
    'data de nascimento': 'birthDate', 'birthdate': 'birthDate', 'nascimento': 'birthDate',
    'início das férias': 'vacationStart', 'vacationstart': 'vacationStart', 'férias': 'vacationStart',
    'dias de férias': 'vacationDays', 'vacationdays': 'vacationDays',
    'layout dos subordinados': 'childOrientation', 'childorientation': 'childOrientation'
};

const normalizeEmployeeData = (rawEmp) => {
    const emp = {};

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
            emp[field] = value;
        }
    });

    return emp;
};

// TEST CASE 1: Column Mapping Collision
const rawEmp = { "ID": "101", "ID do Superior": "100" };
const normalized = normalizeEmployeeData(rawEmp);

console.log('Normalized ID:', normalized.id); // Expected: 101
console.log('Normalized parentId:', normalized.parentId); // Expected: 100

if (normalized.id === "101" && normalized.parentId === "100") {
    console.log('TEST 1 SUCCESS: Mapping collision resolved.');
} else {
    console.log('TEST 1 FAILED: Hierarchy mapping is still broken!');
}

// TEST CASE 2: Alias "Superior"
const rawEmp2 = { "ID": "102", "Superior": "101" };
const normalized2 = normalizeEmployeeData(rawEmp2);
if (normalized2.parentId === "101") {
    console.log('TEST 2 SUCCESS: Alias "Superior" works.');
} else {
    console.log('TEST 2 FAILED: Alias mapping failed.');
}
