const bcrypt = require("bcryptjs");

const testPassword = "Test@123";
const fixedWorkFactor = 12;

// Generate salt and hash the password
const salt = bcrypt.genSaltSync(fixedWorkFactor);
const hashedPassword = bcrypt.hashSync(testPassword + salt, fixedWorkFactor);

// Verify if the password is correctly hashed
const isMatch = bcrypt.compareSync(testPassword + salt, hashedPassword);

console.log(`Fixed Work Factor Used: ${fixedWorkFactor}`);
console.log(`Password Verified: ${isMatch ? " Success" : "Failed"}`);
