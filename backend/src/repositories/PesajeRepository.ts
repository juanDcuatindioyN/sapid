import { Transaction } from 'sequelize';
import { Pesaje, PesajeDetalle, Usuario } from '../database/models';

interface PesajeCreateData {
  codigo: string;
  especie: 'bovino' | 'porcino';
  sexo: 'H' | 'M';
  tipo_pesaje: 'medios' | 'lotes';
  peso_total: number;
  usuario_id: number;
}

interface PesajeDetalleData {
  peso: number;
}

interface PesajeFilters {
  startDate?: Date;
  endDate?: Date;
  usuario_id?: number;
  especie?: 'bovino' | 'porcino';
  limit?: number;
  offset?: number;
}

class PesajeRepository {
  /**
   * Create a new pesaje record
   */
  async create(data: PesajeCreateData, transaction?: Transaction): Promise<Pesaje> {
    return await Pesaje.create(data, { transaction });
  }

  /**
   * Find pesaje by ID with optional details
   */
  async findById(id: number, includeDetails = false): Promise<Pesaje | null> {
    const include = includeDetails
      ? [
          { model: PesajeDetalle, as: 'detalles' },
          { model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] },
        ]
      : [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] }];

    return await Pesaje.findByPk(id, { include });
  }

  /**
   * Find all pesajes with optional filters
   */
  async findAll(filters: PesajeFilters = {}): Promise<{ rows: Pesaje[]; count: number }> {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.fecha = {};
      if (filters.startDate) where.fecha.$gte = filters.startDate;
      if (filters.endDate) where.fecha.$lte = filters.endDate;
    }

    if (filters.usuario_id) {
      where.usuario_id = filters.usuario_id;
    }

    if (filters.especie) {
      where.especie = filters.especie;
    }

    const { rows, count } = await Pesaje.findAndCountAll({
      where,
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] }],
      order: [['fecha', 'DESC']],
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    });

    return { rows, count };
  }

  /**
   * Find pesajes by date range
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Pesaje[]> {
    return await Pesaje.findAll({
      where: {
        fecha: {
          $gte: startDate,
          $lte: endDate,
        },
      },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] }],
      order: [['fecha', 'DESC']],
    });
  }

  /**
   * Find pesajes by usuario
   */
  async findByUsuario(usuario_id: number): Promise<Pesaje[]> {
    return await Pesaje.findAll({
      where: { usuario_id },
      include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'usuario'] }],
      order: [['fecha', 'DESC']],
    });
  }

  /**
   * Update pesaje
   */
  async update(id: number, data: Partial<PesajeCreateData>, transaction?: Transaction): Promise<Pesaje | null> {
    const pesaje = await Pesaje.findByPk(id);
    if (!pesaje) return null;

    await pesaje.update(data, { transaction });
    return pesaje;
  }

  /**
   * Delete pesaje (soft delete by marking as inactive or hard delete)
   */
  async delete(id: number, transaction?: Transaction): Promise<boolean> {
    const pesaje = await Pesaje.findByPk(id);
    if (!pesaje) return false;

    await pesaje.destroy({ transaction });
    return true;
  }

  /**
   * Create pesaje with details in a single transaction
   */
  async createWithDetails(
    pesajeData: PesajeCreateData,
    detalles: PesajeDetalleData[],
    transaction?: Transaction
  ): Promise<Pesaje> {
    const useTransaction = transaction || (await Pesaje.sequelize!.transaction());

    try {
      // Create pesaje
      const pesaje = await this.create(pesajeData, useTransaction);

      // Create details
      const detallesWithPesajeId = detalles.map((detalle) => ({
        ...detalle,
        pesaje_id: pesaje.id,
      }));

      await PesajeDetalle.bulkCreate(detallesWithPesajeId, { transaction: useTransaction });

      // Commit transaction if we created it
      if (!transaction) {
        await useTransaction.commit();
      }

      // Return pesaje with details
      return (await this.findById(pesaje.id, true))!;
    } catch (error) {
      // Rollback transaction if we created it
      if (!transaction) {
        await useTransaction.rollback();
      }
      throw error;
    }
  }
}

export default new PesajeRepository();
