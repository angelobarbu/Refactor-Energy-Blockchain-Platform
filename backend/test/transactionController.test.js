import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';
import jwt from 'jsonwebtoken';
import { Transaction } from '../models/index.js'; // Import Transaction model

chai.use(chaiHttp);

let token;

describe('Transaction Controller', () => {
  before((done) => {
    const user = {
      email: "testcompany@example.com",
      password: "password123"
    };
    chai.request(server)
        .post('/api/auth/login')
        .send(user)
        .end((err, res) => {
          token = res.body.token;
          done();
        });
  });

  describe('/POST transaction', () => {
    it('it should create a new buy transaction', (done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('id');
                res.body.should.have.property('state').eql('Listed');
            done();
          });
    });

    it('it should create a new sell transaction', (done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: false
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('id');
                res.body.should.have.property('state').eql('Listed');
            done();
          });
    });
  });

  describe('/GET transaction/:id', () => {
    let transactionId;

    before((done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                transactionId = res.body.id;
                done();
          });
    });

    it('it should GET a transaction by the given id', (done) => {
      chai.request(server)
          .get(`/api/transactions/${transactionId}`)
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('id').eql(transactionId);
            done();
          });
    });

    it('it should return 404 for non-existent transaction', (done) => {
      chai.request(server)
          .get('/api/transactions/9999')
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('Transaction not found');
            done();
          });
    });
  });

  describe('/POST /api/transactions/:id/offers', () => {
    let transactionId;

    before((done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                transactionId = res.body.id;
                done();
          });
    });

    it('it should add an offer to the transaction', (done) => {
      const offer = {
        price: "0.9",
        quantity: 100
      };
      chai.request(server)
          .post(`/api/transactions/${transactionId}/offers`)
          .set('Authorization', `Bearer ${token}`)
          .send(offer)
          .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('offers');
                res.body.offers.length.should.be.eql(1);
            done();
          });
    });

    it('it should not add an offer to a non-existent transaction', (done) => {
      const offer = {
        price: "0.9",
        quantity: 100
      };
      chai.request(server)
          .post('/api/transactions/9999/offers')
          .set('Authorization', `Bearer ${token}`)
          .send(offer)
          .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('Transaction not found');
            done();
          });
    });
  });

  describe('/POST /api/transactions/:id/accept', () => {
    let transactionId;

    before((done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                transactionId = res.body.id;
                const offer = {
                  price: "0.9",
                  quantity: 100
                };
                chai.request(server)
                    .post(`/api/transactions/${transactionId}/offers`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(offer)
                    .end(() => {
                      done();
                    });
          });
    });

    it('it should accept an offer', (done) => {
      chai.request(server)
          .post(`/api/transactions/${transactionId}/accept`)
          .set('Authorization', `Bearer ${token}`)
          .send({ offerIndex: 0, value: web3.utils.toWei("0.9", "ether") })
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('state').eql('Accepted');
            done();
          });
    });

    it('it should not accept an offer for non-existent transaction', (done) => {
      chai.request(server)
          .post('/api/transactions/9999/accept')
          .set('Authorization', `Bearer ${token}`)
          .send({ offerIndex: 0, value: web3.utils.toWei("0.9", "ether") })
          .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('Transaction not found');
            done();
          });
    });
  });

  describe('/PUT /api/transactions/:id/state', () => {
    let transactionId;

    before((done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                transactionId = res.body.id;
                const offer = {
                  price: "0.9",
                  quantity: 100
                };
                chai.request(server)
                    .post(`/api/transactions/${transactionId}/offers`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(offer)
                    .end(() => {
                      chai.request(server)
                          .post(`/api/transactions/${transactionId}/accept`)
                          .set('Authorization', `Bearer ${token}`)
                          .send({ offerIndex: 0, value: web3.utils.toWei("0.9", "ether") })
                          .end(() => {
                            done();
                          });
                    });
          });
    });

    it('it should update the state of the transaction', (done) => {
      chai.request(server)
          .put(`/api/transactions/${transactionId}/state`)
          .set('Authorization', `Bearer ${token}`)
          .send({ state: "Dispatched" })
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('state').eql('Dispatched');
            done();
          });
    });

    it('it should not update the state of a non-existent transaction', (done) => {
      chai.request(server)
          .put('/api/transactions/9999/state')
          .set('Authorization', `Bearer ${token}`)
          .send({ state: "Dispatched" })
          .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('Transaction not found');
            done();
          });
    });
  });

  describe('/POST /api/transactions/:id/trace', () => {
    let transactionId;

    before((done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                transactionId = res.body.id;
                const offer = {
                  price: "0.9",
                  quantity: 100
                };
                chai.request(server)
                    .post(`/api/transactions/${transactionId}/offers`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(offer)
                    .end(() => {
                      chai.request(server)
                          .post(`/api/transactions/${transactionId}/accept`)
                          .set('Authorization', `Bearer ${token}`)
                          .send({ offerIndex: 0, value: web3.utils.toWei("0.9", "ether") })
                          .end(() => {
                            done();
                          });
                    });
          });
    });

    it('it should add a trace point to the transaction', (done) => {
      chai.request(server)
          .post(`/api/transactions/${transactionId}/trace`)
          .set('Authorization', `Bearer ${token}`)
          .send({ tracePoint: 12345 })
          .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('tracePoints');
                res.body.tracePoints.length.should.be.eql(1);
            done();
          });
    });

    it('it should not add a trace point to a non-existent transaction', (done) => {
      chai.request(server)
          .post('/api/transactions/9999/trace')
          .set('Authorization', `Bearer ${token}`)
          .send({ tracePoint: 12345 })
          .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('Transaction not found');
            done();
          });
    });
  });

  describe('/PUT /api/transactions/:id/expire', () => {
    let transactionId;

    before((done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: true,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                transactionId = res.body.id;
                const offer = {
                  price: "0.9",
                  quantity: 100
                };
                chai.request(server)
                    .post(`/api/transactions/${transactionId}/offers`)
                    .set('Authorization', `Bearer ${token}`)
                    .send(offer)
                    .end(() => {
                      done();
                    });
          });
    });

    it('it should expire the transaction and auto-accept the best offer', (done) => {
      // Move forward in time to pass the deadline
      time.increase(3601).then(() => {
        chai.request(server)
            .put(`/api/transactions/${transactionId}/expire`)
            .set('Authorization', `Bearer ${token}`)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('state').eql('Accepted');
              done();
            });
      });
    });

    it('it should not expire a non-existent transaction', (done) => {
      chai.request(server)
          .put('/api/transactions/9999/expire')
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('Transaction not found');
            done();
          });
    });
  });

  describe('/PUT /api/transactions/:id/unlist', () => {
    let transactionId;

    before((done) => {
      const transaction = {
        price: "1",
        quantity: 100,
        resource: "Electricity",
        deadline: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
        autoAcceptBestOffer: false,
        isBuyTransaction: true
      };
      chai.request(server)
          .post('/api/transactions')
          .set('Authorization', `Bearer ${token}`)
          .send(transaction)
          .end((err, res) => {
                transactionId = res.body.id;
                done();
          });
    });

    it('it should unlist the transaction', (done) => {
      chai.request(server)
          .put(`/api/transactions/${transactionId}/unlist`)
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('state').eql('Unlisted');
            done();
          });
    });

    it('it should not unlist a non-existent transaction', (done) => {
      chai.request(server)
          .put('/api/transactions/9999/unlist')
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
                res.should.have.status(404);
                res.body.should.have.property('message').eql('Transaction not found');
            done();
          });
    });
  });
});
