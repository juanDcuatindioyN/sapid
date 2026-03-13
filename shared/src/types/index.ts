// Shared types for SAPID system

export type UserRole = 'administrador' | 'funcionario';
export type UserStatus = 'activo' | 'inactivo';
export type Especie = 'bovino' | 'porcino';
export type Sexo = 'H' | 'M';
export type TipoPesaje = 'medios' | 'lotes';

export interface Usuario {
  id: number;
  nombre: string;
  usuario: string;
  rol: UserRole;
  estado: UserStatus;
  created_at: Date;
}

export interface PesajeMetadata {
  codigo: string;
  especie: Especie;
  sexo: Sexo;
  tipoPesaje: TipoPesaje;
}

export interface WeightCapture {
  peso: number;
  timestamp: Date;
}

export interface PesajeRecord {
  id: number;
  codigo: string;
  especie: Especie;
  sexo: Sexo;
  tipoPesaje: TipoPesaje;
  pesoTotal: number;
  fecha: Date;
  usuarioId: number;
  detalles: WeightCapture[];
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    nombre: string;
    rol: UserRole;
  };
  error?: string;
}

export interface UserPayload {
  id: number;
  nombre: string;
  rol: UserRole;
  iat: number;
  exp: number;
}
