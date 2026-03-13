import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config';

interface UsuarioAttributes {
  id: number;
  nombre: string;
  usuario: string;
  password: string;
  rol: 'administrador' | 'funcionario';
  estado: 'activo' | 'inactivo';
  created_at: Date;
}

interface UsuarioCreationAttributes extends Optional<UsuarioAttributes, 'id' | 'estado' | 'created_at'> {}

class Usuario extends Model<UsuarioAttributes, UsuarioCreationAttributes> implements UsuarioAttributes {
  public id!: number;
  public nombre!: string;
  public usuario!: string;
  public password!: string;
  public rol!: 'administrador' | 'funcionario';
  public estado!: 'activo' | 'inactivo';
  public created_at!: Date;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 100],
      },
    },
    usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [3, 50],
        is: /^[a-zA-Z0-9_]+$/,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    rol: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['administrador', 'funcionario']],
      },
    },
    estado: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'activo',
      validate: {
        isIn: [['activo', 'inactivo']],
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'usuarios',
    timestamps: false,
  }
);

export default Usuario;
