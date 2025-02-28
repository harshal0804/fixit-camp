const User = require("../models/User");

const checkExistingUser = async (fields) => {
  const existingUser = await User.findOne({
    $or: Object.entries(fields).map(([key, value]) => ({ [key]: value })),
  });

  if (existingUser) {
    for (const [key, value] of Object.entries(fields)) {
      if (existingUser[key] === value) {
        return {
          exists: true,
          field: key,
          message: `${
            key.charAt(0).toUpperCase() + key.slice(1)
          } already registered`,
        };
      }
    }
  }

  return { exists: false };
};

module.exports = { checkExistingUser };
