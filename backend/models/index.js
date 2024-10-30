import { Sequelize } from 'sequelize';
import userModel from './user.js';
import transactionModel from './transaction.js';

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

const User = userModel(sequelize, Sequelize.DataTypes);
const Transaction = transactionModel(sequelize, Sequelize.DataTypes);

User.hasMany(Transaction, { foreignKey: 'buyerId', as: 'buyerTransactions' });
User.hasMany(Transaction, { foreignKey: 'sellerId', as: 'sellerTransactions' });
Transaction.belongsTo(User, { as: 'buyer', foreignKey: 'buyerId' });
Transaction.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });

const db = {
  User,
  Transaction,
  sequelize,
  Sequelize
};

export { User, Transaction }; // Named export for User and Transaction models
export default db; // Default export for db object
