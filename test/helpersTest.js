const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com")
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined when given a non-existent email', () => {
    const user = getUserByEmail(testUsers, "user3@example.com")
    const expectedUserID = undefined

    assert.strictEqual(user, expectedUserID);
  });
});