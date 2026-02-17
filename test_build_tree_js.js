
const buildTree = (employees) => {
    const validEmployees = employees.filter(e => e && e.id && e.name && e.name.trim() !== '');
    const map = new Map();

    validEmployees.forEach(emp => {
        map.set(emp.id, { ...emp, children: [] });
    });

    const roots = [];
    const parentOf = new Map();

    validEmployees.forEach(emp => {
        const childId = emp.id;
        const parentId = emp.parentId;
        const node = map.get(childId);

        if (parentId && map.has(parentId) && parentId !== childId) {
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
                map.get(parentId).children.push(node);
                parentOf.set(childId, parentId);
            } else {
                roots.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    return roots;
};

const employees = [
    { "id": "a0372e9c-7210-4b33-a446-4725bef93056", "name": "AFONSO CELSO MENDES FILHO", "parentId": null, "department": "CFTV", "role": "OPERADOR BMS I" },
    { "id": "0f0dac44-b057-4c38-a14f-a8a4cc51a7bf", "name": "ADAILTON PEREIRA TELES", "parentId": "a0372e9c-7210-4b33-a446-4725bef93056", "department": "CFTV", "role": "OPERADOR BMS I" },
    { "id": "7f02e188-54b1-4bcc-94e9-eabf2223ecb8", "name": "AGUINAIR SANTOS DE OLIVEIRA JUNIOR", "parentId": "a0372e9c-7210-4b33-a446-4725bef93056", "department": "CFTV", "role": "OPERADOR BMS I" },
    { "id": "fef50413-c65c-4d0b-bf35-8dffa3fd8f67", "name": "ANDRE MARTINS DOS SANTOS", "parentId": "7f02e188-54b1-4bcc-94e9-eabf2223ecb8", "department": "JARDINAGEM", "role": "JARDINEIRO I" },
    { "id": "48d5d381-c242-426c-bb0c-cdd7f7004988", "name": "ANDRE SALES MONTEIRO DE CASTRO", "parentId": "0f0dac44-b057-4c38-a14f-a8a4cc51a7bf", "department": "ELÉTRICA", "role": "AUXILIAR ELETRICISTA" }
];

const tree = buildTree(employees);
console.log('Tree Roots:', tree.length);
if (tree.length > 0) {
    console.log('Root 1 Name:', tree[0].name);
    console.log('Root 1 Children:', tree[0].children.length);
}

if (tree.length === 0 && employees.length > 0) {
    console.log('RESULT: FAILED');
} else {
    console.log('RESULT: SUCCESS');
}
