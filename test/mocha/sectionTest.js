const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const dbSetup = require('../data/restore');
const fixtures = require('./fixtures.js');
const baseUrl = "/api/sections/";

const config = require('../../server/config');
const nconf = config.nconf;
const port = nconf.get('testPort');
const host = `http://localhost:${port}`;

chai.use(chaiHttp);

describe('Section CRUD operations', function() {
  this.timeout('17s');
  before( async function () {
    await dbSetup.prepTestDb();
  });
  /** GET **/
  describe('/GET sections', () => {
    it('should get all sections', done => {
      chai.request(host)
      .get(baseUrl)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys('sections');
        expect(res.body.sections).to.be.a('array');
        expect(res.body.sections[0].name).to.eql('Drexel University');
        done();
      });
    });
  });
  describe('/GET section by ID', () => {
    it('should get Drexel University section', done => {
      chai.request(host)
      .get(baseUrl + fixtures.section._id)
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body).to.have.all.keys('section');
        expect(res.body.section).to.be.a('object');
        expect(res.body.section.name).to.eql('Drexel University');
        done();
      });
    });
  });

  /** POST **/
  describe('/POST section', () => {
    it('should post a new section', done => {
      chai.request(host)
      .post(baseUrl)
      .send({section: fixtures.section.validSection})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('name', 'problems', 'students', 'teachers');
        expect(res.body.section.name).to.eql(fixtures.section.validSection.name);
        done();
      });
    });
  });
  //
  /** PUT name**/
  describe('/PUT update section name', () => {
    it('should change the section name to phils class', done => {
      let url = baseUrl + fixtures.section._id;
      chai.request(host)
      .put(url)
      .send({section: {name: 'phils class'}})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('name', 'problems', 'students', 'teachers');
        expect(res.body.section.name).to.eql('phils class');
        done();
      });
    });
  });

  /** Add teachers **/
  describe('add teacher to section', () => {
    it('should add one teacher to the section', done => {
      let url = baseUrl + 'addTeacher/' + fixtures.section._id;
      chai.request(host)
      .put(url)
      .send({teacherId: '52964659e4bad7087700014c'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('name', 'problems', 'students', 'teachers');
        expect(res.body.section.teachers).to.contain('52964659e4bad7087700014c');
        done();
      });
    });
  });

  /** Remove teachers **/
  describe('remove teacher from section', () => {
    let url = baseUrl + 'removeTeacher/' + fixtures.section._id;
    it('should return an empty array', done => {
      chai.request(host)
      .put(url)
      .send({teacherId: fixtures.teacher._id})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('name', 'problems', 'students', 'teachers');
        expect(res.body.section.teachers).to.not.contain(fixtures.teacher._id);
        done();
      });
    });
  });

  describe('addStudent to section', () => {
    it('should add one student to the section', done => {
      let url = baseUrl + 'addStudent/' + fixtures.section._id;
      chai.request(host)
      .put(url)
      .send({studentName: 'bill'})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('name', 'problems', 'students', 'teachers');
        expect(res.body.section.students).to.contain('bill');
        done();
      });
    });
  });

  /** Remove teachers **/
  describe('remove student from section', () => {
    let url = baseUrl + 'removeStudent/' + fixtures.section._id;
    it('should return an empty array', done => {
      chai.request(host)
      .put(url)
      .send({studentName: fixtures.student.name})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('name', 'problems', 'students', 'teachers');
        expect(res.body.section.students).to.not.contain(fixtures.student.name);
        done();
      });
    });
  });

  describe('add problem to section', () => {
    it('should add one problem to the section', done => {
      let url = baseUrl + 'addProblem/' + fixtures.section._id;
      chai.request(host)
      .put(url)
      .send({problemId: fixtures.problem._id})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('name', 'problems', 'students', 'teachers');
        expect(res.body.section.problems).to.contain(fixtures.problem._id);
        done();
      });
    });
  });

  /** Remove teachers **/
  describe('remove problem from section', () => {
    let url = baseUrl + 'removeProblem/' + fixtures.section._id;
    it('should return an empty array', done => {
      chai.request(host)
      .put(url)
      .send({problemId: fixtures.problem._id})
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.body.section).to.have.any.keys('sectionId', 'name', 'problems', 'students', 'teachers');
        expect(res.body.section.problems).to.not.contain(fixtures.problem._id);
        done();
      });
    });
  });
});
