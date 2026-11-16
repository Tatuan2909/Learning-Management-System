const sql = require('child_process');

// We will check and repair all corrupted Vietnamese text across lms_db
console.log("Checking and fixing encoding in lms_db...");
