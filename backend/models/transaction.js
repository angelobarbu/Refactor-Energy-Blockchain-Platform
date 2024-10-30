const transactionModel = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      buyerId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      sellerId: {
        type: DataTypes.UUID,
        allowNull: true
      },
      price: DataTypes.DECIMAL,
      quantity: DataTypes.INTEGER,
      resource: DataTypes.STRING,
      state: {
        type: DataTypes.ENUM,
        values: ['Listed', 'Bidding', 'OfferMade', 'Accepted', 'Dispatched', 'InTransit', 'Delivered', 'PickedUp', 'Completed', 'Unlisted', 'Expired']
      },
      tracePoints: DataTypes.ARRAY(DataTypes.INTEGER),
      deadline: DataTypes.DATE
    });
  
    Transaction.associate = function(models) {
      Transaction.belongsTo(models.User, { as: 'buyer', foreignKey: 'buyerId' });
      Transaction.belongsTo(models.User, { as: 'seller', foreignKey: 'sellerId' });
    };
  
    return Transaction;
  };
  
  export default transactionModel;
  