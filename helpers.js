// Given an email will find the user with the associated email if present
function getUserByEmail (obj, email) {
  let user = null;

  for (let id in obj) {
    if (obj[id].email === email) {
      user = id;
      return user;
    }
  };

  return undefined;
};

module.exports = { getUserByEmail };