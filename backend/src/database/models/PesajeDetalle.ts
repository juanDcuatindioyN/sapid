import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config';
import Pesaje from './Pesaje';

interface PesajeDetalleAttributes {
  id: number;
  pesaje_id: number;
  peso: number;
  fecha: Date;
}

interface PesajeDetalleCreationAttributes extends Optional<PesajeDetalleAttributes, 'id' | 'fecha'> {}

class PesajeDetalle extends Model<PesajeDetalleAttributes, PesajeDetalleCreationAttributes> implements PesajeDetalleAttributes {
  public id!: number;
  public pesaje_id!: number;
  public peso!: number;
  public fecha!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

PesajeDetalle.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    pesaje_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Pesaje,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    peso: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'pesajes_detalle',
    timestamps: false,
    indexes: [
      {
        name: 'idx_pesaje',
        fields: ['pesaje_id'],
      },
    ],
  }
);

// Define associations
PesajeDetalle.belongsTo(Pesaje, { foreignKey: 'pesaje_id', as: 'pesaje' });
Pesaje.hasMany(PesajeDetalle, { foreignKey: 'pesaje_id', as: 'detalles' });

export default PesajeDetalle;
