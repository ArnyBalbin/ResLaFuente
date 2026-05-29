export interface Empresa {
  id: number;
  razonSocial: string;
  ruc: string;
  direccion?: string | null;
  telefono?: string | null;
  tieneCredito: boolean;
  limiteCredito: string;
  creditoUsado: string;
  diaCierre: number;
}

export interface Convenio {
  id: number;
  clienteId: number;
  empresaId: number;
  limiteDiario: string;
  activo: boolean;
  empresa: Empresa;
}

export interface Cliente {
  id: number;
  nombre: string;
  dni?: string | null;
  ruc?: string | null;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  tieneCredito: boolean;
  limiteCredito: string;
  saldoDeuda: string;
  convenios: Convenio[];
}

export interface DetallePedidoCliente {
  id: number;
  cantidad: number;
  precioUnitario: string;
  notas?: string | null;
  producto: { nombre: string };
}

export interface PedidoCliente {
  id: number;
  tipo: string;
  estado: string;
  total: string;
  fecha: string;
  esCredito: boolean;
  mesa?: { numero: string } | null;
  detalles: DetallePedidoCliente[];
}

export interface CrearClienteDto {
  nombre: string;
  dni?: string;
  ruc?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  convenioEmpresaId?: number;
  convenioLimiteDiario?: number;
}
