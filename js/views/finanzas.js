import { setHeader } from '../util.js';
import { soonCard } from './soon.js';

export async function render(root) {
  setHeader('Mis finanzas', 'Gastos, ahorro e inversión');
  root.innerHTML = soonCard(3, 'Tu calculadora personal', [
    'Ingresos y gastos mensuales por categoría, con gráficos',
    'Presupuesto por categoría con avisos',
    'Calculadora de interés compuesto: nominal frente a real (con inflación)',
    'Simulador de inflación y fondo de emergencia',
    'Objetivos de ahorro con barra de progreso',
    'Exportar todo a CSV o Excel',
  ]);
}
