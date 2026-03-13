import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config';
import Usuario from './Usuario';

interface LogAttributes {
  id: number;
  usuario_id: number | null;
  accion: string;
  fecha: Date;
  ip: string | null;
  terminal: string | null;
}

interface LogCreationAttributes extends Optional<LogAttributes, 'id' | 'fecha' | 'usuario_id' | 'ip' | 'terminal'> {}

class Log extends Model<LogAttributes, LogCreationAttributes> implements LogAttributes {
  public id!: number;
  public usuario_id!: number | null;
  public accion!: string;
  public fecha!: Date;
  public ip!: string | null;
  public terminal!: string | null;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Log.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Usuario,
        key: 'id',
      },
    },
    accion: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 255],
      },
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    terminal: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'logs',
    timestamps: false,
    indexes: [
      {
        name: 'idx_usuario_log',
        fields: ['usuario_id'],
      },
      {
        name: 'idx_fecha_log',
        fields: ['fecha'],
      },
    ],
  }
);

// Define associations
Log.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Log, { foreignKey: 'usuario_id', as: 'logs' });

export default Log;
