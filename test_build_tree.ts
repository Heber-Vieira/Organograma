
import { buildTree } from './utils/helpers';

const employees = [
    { "id": "a0372e9c-7210-4b33-a446-4725bef93056", "name": "AFONSO CELSO MENDES FILHO", "parentId": null, "department": "CFTV", "role": "OPERADOR BMS I" },
    { "id": "0f0dac44-b057-4c38-a14f-a8a4cc51a7bf", "name": "ADAILTON PEREIRA TELES", "parentId": "a0372e9c-7210-4b33-a446-4725bef93056", "department": "CFTV", "role": "OPERADOR BMS I" },
    { "id": "7f02e188-54b1-4bcc-94e9-eabf2223ecb8", "name": "AGUINAIR SANTOS DE OLIVEIRA JUNIOR", "parentId": "a0372e9c-7210-4b33-a446-4725bef93056", "department": "CFTV", "role": "OPERADOR BMS I" },
    { "id": "fef50413-c65c-4d0b-bf35-8dffa3fd8f67", "name": "ANDRE MARTINS DOS SANTOS", "parentId": "7f02e188-54b1-4bcc-94e9-eabf2223ecb8", "department": "JARDINAGEM", "role": "JARDINEIRO I" },
    { "id": "48d5d381-c242-426c-bb0c-cdd7f7004988", "name": "ANDRE SALES MONTEIRO DE CASTRO", "parentId": "0f0dac44-b057-4c38-a14f-a8a4cc51a7bf", "department": "ELÉTRICA", "role": "AUXILIAR ELETRICISTA" }
];

const tree = buildTree(employees);
console.log('Tree Roots:', tree.length);
console.log('Tree Structure:', JSON.stringify(tree, null, 2));

if (tree.length === 0 && employees.length > 0) {
    console.error('FAILED: Tree is empty but employees exist!');
} else {
    console.log('SUCCESS: Tree generated.');
}
