const userModel = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false
      },
      company: {
        type: DataTypes.STRING,
        allowNull: true
      }
    });
  
    return User;
  };
  
  export default userModel;
  