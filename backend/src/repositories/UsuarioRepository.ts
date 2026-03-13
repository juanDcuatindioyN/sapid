import Usuario from '../database/models/Usuario';
import bcrypt from 'bcrypt';

interface CreateUsuarioData {
  nombre: string;
  usuario: string;
  password: string;
  rol: 'administrador' | 'funcionario';
  estado?: 'activo' | 'inactivo';
}

interface UpdateUsuarioData {
  nombre?: string;
  usuario?: string;
  password?: string;
  rol?: 'administrador' | 'funcionario';
  estado?: 'activo' | 'inactivo';
}

class UsuarioRepository {
  /**
   * Crea un nuevo usuario con contraseña hasheada
   */
  async create(data: CreateUsuarioData): Promise<Usuario> {
    // Validar longitud de nombre
    if (!data.nombre || data.nombre.trim().length === 0 || data.nombre.length > 100) {
      throw new Error('El nombre debe tener entre 1 y 100 caracteres');
    }

    // Validar longitud y formato de usuario
    if (!data.usuario || data.usuario.length < 3 || data.usuario.length > 50) {
      throw new Error('El usuario debe tener entre 3 y 50 caracteres');
    }

    // Validar formato alfanumérico del usuario
    if (!/^[a-zA-Z0-9_]+$/.test(data.usuario)) {
      throw new Error('El usuario solo puede contener caracteres alfanuméricos y guiones bajos');
    }

    // Validar longitud mínima de contraseña
    if (!data.password || data.password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    // Hash de contraseña con bcrypt (factor 10)
    const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(data.password, bcryptRounds);

    // Crear usuario con contraseña hasheada
    const usuario = await Usuario.create({
      nombre: data.nombre.trim(),
      usuario: data.usuario,
      password: hashedPassword,
      rol: data.rol,
      estado: data.estado || 'activo',
    });

    return usuario;
  }

  /**
   * Busca un usuario por ID
   */
  async findById(id: number): Promise<Usuario | null> {
    return await Usuario.findByPk(id);
  }

  /**
   * Busca un usuario por nombre de usuario
   */
  async findByUsername(username: string): Promise<Usuario | null> {
    return await Usuario.findOne({
      where: { usuario: username },
    });
  }

  /**
   * Obtiene todos los usuarios
   */
  async findAll(): Promise<Usuario[]> {
    return await Usuario.findAll({
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Actualiza un usuario existente
   */
  async update(id: number, data: UpdateUsuarioData): Promise<Usuario> {
    const usuario = await this.findById(id);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Validar nombre si se proporciona
    if (data.nombre !== undefined) {
      if (!data.nombre || data.nombre.trim().length === 0 || data.nombre.length > 100) {
        throw new Error('El nombre debe tener entre 1 y 100 caracteres');
      }
      usuario.nombre = data.nombre.trim();
    }

    // Validar usuario si se proporciona
    if (data.usuario !== undefined) {
      if (data.usuario.length < 3 || data.usuario.length > 50) {
        throw new Error('El usuario debe tener entre 3 y 50 caracteres');
      }
      if (!/^[a-zA-Z0-9_]+$/.test(data.usuario)) {
        throw new Error('El usuario solo puede contener caracteres alfanuméricos y guiones bajos');
      }
      usuario.usuario = data.usuario;
    }

    // Validar y hashear contraseña si se proporciona
    if (data.password !== undefined) {
      if (data.password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres');
      }
      const bcryptRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
      usuario.password = await bcrypt.hash(data.password, bcryptRounds);
    }

    // Actualizar rol si se proporciona
    if (data.rol !== undefined) {
      usuario.rol = data.rol;
    }

    // Actualizar estado si se proporciona
    if (data.estado !== undefined) {
      usuario.estado = data.estado;
    }

    await usuario.save();
    return usuario;
  }

  /**
   * Elimina un usuario (soft delete - cambia estado a inactivo)
   */
  async delete(id: number): Promise<void> {
    const usuario = await this.findById(id);
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Soft delete: cambiar estado a inactivo
    usuario.estado = 'inactivo';
    await usuario.save();
  }

  /**
   * Verifica si una contraseña coincide con el hash almacenado
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

export default new UsuarioRepository();
