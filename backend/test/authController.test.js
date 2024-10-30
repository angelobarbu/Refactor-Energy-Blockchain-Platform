import * as chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server.js';

chai.should();
chai.use(chaiHttp);

describe('Auth Controller', () => {
  describe('/POST register', () => {
    it('it should register a new user', (done) => {
      let user = {
        name: "Test Company",
        email: "testcompany@example.com",
        password: "password123"
      };
      chai.request(server)
          .post('/api/auth/register')
          .send(user)
          .end((err, res) => {
                res.should.have.status(201);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
            done();
          });
    });

    it('it should not register a user with an existing email', (done) => {
      let user = {
        name: "Test Company",
        email: "testcompany@example.com",
        password: "password123"
      };
      chai.request(server)
          .post('/api/auth/register')
          .send(user)
          .end((err, res) => {
                res.should.have.status(400);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Email already in use');
            done();
          });
    });
  });

  describe('/POST login', () => {
    it('it should login an existing user', (done) => {
      let user = {
        email: "testcompany@example.com",
        password: "password123"
      };
      chai.request(server)
          .post('/api/auth/login')
          .send(user)
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('token');
            done();
          });
    });

    it('it should not login with incorrect password', (done) => {
      let user = {
        email: "testcompany@example.com",
        password: "wrongpassword"
      };
      chai.request(server)
          .post('/api/auth/login')
          .send(user)
          .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Invalid email or password');
            done();
          });
    });
  });

  describe('/GET profile', () => {
    let token;

    before((done) => {
      let user = {
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

    it('it should get the user profile', (done) => {
      chai.request(server)
          .get('/api/auth/profile')
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('email').eql('testcompany@example.com');
            done();
          });
    });

    it('it should not get profile with invalid token', (done) => {
      chai.request(server)
          .get('/api/auth/profile')
          .set('Authorization', 'Bearer invalidtoken')
          .end((err, res) => {
                res.should.have.status(401);
                res.body.should.be.a('object');
                res.body.should.have.property('message').eql('Unauthorized');
            done();
          });
    });
  });
});
