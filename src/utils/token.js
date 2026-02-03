const { v4: uuidv4 } = require("uuid");

const generateRandomToken = () => uuidv4();

module.exports = { generateRandomToken };
