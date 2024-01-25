const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;

chai.use(chaiHttp);

describe("Login and Access Control Test", () => {
  it('should redirect to "http://localhost:8080/login when going to / if the user is not logged in"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .get("/")
      .redirects(0)
      .then((accessRes) => {
        expect(accessRes).to.have.status(302);
      });
  });

  it('should redirect to "http://localhost:8080/login when going to /urls/new if the user is not logged in"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .get("/urls/new")
      .redirects(0)
      .then((accessRes) => {
        expect(accessRes).to.have.status(302);
      });
  });

  it('should return 401 when going to /urls/:id if the user is not logged in"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .get("/urls/b6UTxQ")
      .then((accessRes) => {
        expect(accessRes).to.have.status(401);
      });
  });

  it('should return 400 status code for a non-existent URL to "http://localhost:8080/urls/ab123c"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "a@a.com", password: "1234" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/ab123c").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(400);
        });
      });
  });

  it('should return 403 status code for unauthorized access to "http://localhost:8080/urls/b6UTxQ"', () => {
    const agent = chai.request.agent("http://localhost:8080");

    // Step 1: Login with valid credentials
    return agent
      .post("/login")
      .send({ email: "a@a.com", password: "1234" })
      .then((loginRes) => {
        // Step 2: Make a GET request to a protected resource
        return agent.get("/urls/b6UTxQ").then((accessRes) => {
          // Step 3: Expect the status code to be 403
          expect(accessRes).to.have.status(403);
        });
      });
  });  
});