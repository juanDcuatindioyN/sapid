import { Log, Usuario } from '../database/models';

interface LogEntry {
  usuario_id?: number | null;
  accion: string;
  ip?: string | null;
  terminal?: string | null;
}

interface LogFilters {
  usuario_id?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

class LogRepository {
  /**
   * Create a new log entry
   */
  async log(entry: LogEntry): Promise<Log> {
    // Validate required fields
    if (!entry.accion || entry.accion.trim().length === 0) {
      throw new Error('Acción es requerida para el log');
    }

    return await Log.create({
      usuario_id: entry.usuario_id || null,
      accion: entry.accion,
      ip: entry.ip || null,
      terminal: entry.terminal || null,
      fecha: new Date(),
    });
  }

  /**
   * Find logs by usuario
   */
  async findByUsuario(usuario_id: number, limit = 100, offset = 0): Promise<{ rows: Log[]; count: number }> {
    const { rows, count } = await Log.findAndCountAll({
      where: { usuario_id },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] }],
      order: [['fecha', 'DESC']],
      limit,
      offset,
    });

    return { rows, count };
  }

  /**
   * Find logs by date range
   */
  async findByDateRange(startDate: Date, endDate: Date, limit = 100, offset = 0): Promise<{ rows: Log[]; count: number }> {
    const { rows, count } = await Log.findAndCountAll({
      where: {
        fecha: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] }],
      order: [['fecha', 'DESC']],
      limit,
      offset,
    });

    return { rows, count };
  }

  /**
   * Find all logs with optional filters
   */
  async findAll(filters: LogFilters = {}): Promise<{ rows: Log[]; count: number }> {
    const where: any = {};

    if (filters.usuario_id) {
      where.usuario_id = filters.usuario_id;
    }

    if (filters.startDate || filters.endDate) {
      where.fecha = {};
      if (filters.startDate) where.fecha.$gte = filters.startDate;
      if (filters.endDate) where.fecha.$lte = filters.endDate;
    }

    const { rows, count } = await Log.findAndCountAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] }],
      order: [['fecha', 'DESC']],
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    });

    return { rows, count };
  }

  /**
   * Export logs to CSV format
   */
  async exportToCSV(filters: LogFilters = {}): Promise<string> {
    const { rows } = await this.findAll({ ...filters, limit: 10000 }); // Max 10k records for export

    // CSV header
    const header = 'ID,Fecha,Usuario ID,Usuario,Acción,IP,Terminal\n';

    // CSV rows
    const csvRows = rows.map((log) => {
      const usuario = (log as any).usuario;
      return [
        log.id,
        log.fecha.toISOString(),
        log.usuario_id || '',
        usuario ? usuario.usuario : '',
        `"${log.accion.replace(/"/g, '""')}"`, // Escape quotes
        log.ip || '',
        log.terminal || '',
      ].join(',');
    });

    return header + csvRows.join('\n');
  }
}

export default new LogRepository();
