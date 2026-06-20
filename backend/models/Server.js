module.exports = (sequelize, DataTypes) => {
  const Server = sequelize.define('Server', {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    game: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('offline', 'online', 'starting', 'stopping'),
      defaultValue: 'offline',
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
    },
    port: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },
  }, {
    tableName: 'servers',
    timestamps: true,
  });

  Server.associate = (models) => {
    Server.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Server;
};