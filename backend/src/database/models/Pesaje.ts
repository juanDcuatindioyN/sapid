import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config';
import Usuario from './Usuario';

interface PesajeAttributes {
  id: number;
  codigo: string;
  especie: 'bovino' | 'porcino';
  sexo: 'H' | 'M';
  tipo_pesaje: 'medios' | 'lotes';
  peso_total: number;
  fecha: Date;
  usuario_id: number;
}

interface PesajeCreationAttributes extends Optional<PesajeAttributes, 'id' | 'fecha'> {}

class Pesaje extends Model<PesajeAttributes, PesajeCreationAttributes> implements PesajeAttributes {
  public id!: number;
  public codigo!: string;
  public especie!: 'bovino' | 'porcino';
  public sexo!: 'H' | 'M';
  public tipo_pesaje!: 'medios' | 'lotes';
  public peso_total!: number;
  public fecha!: Date;
  public usuario_id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Pesaje.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50],
      },
    },
    especie: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['bovino', 'porcino']],
      },
    },
    sexo: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      validate: {
        isIn: [['H', 'M']],
      },
    },
    tipo_pesaje: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['medios', 'lotes']],
      },
    },
    peso_total: {
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
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Usuario,
        key: 'id',
      },
    },
  },
  {
    sequelize,
    tableName: 'pesajes',
    timestamps: false,
    indexes: [
      {
        name: 'idx_fecha',
        fields: ['fecha'],
      },
      {
        name: 'idx_usuario',
        fields: ['usuario_id'],
      },
      {
        name: 'idx_codigo',
        fields: ['codigo'],
      },
    ],
  }
);

// Define associations
Pesaje.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Pesaje, { foreignKey: 'usuario_id', as: 'pesajes' });

export default Pesaje;
