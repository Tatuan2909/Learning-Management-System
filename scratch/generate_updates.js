const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Reading schema.sql with UTF-8 encoding...");
const schemaText = fs.readFileSync(path.join(__dirname, '..', 'schema.sql'), 'utf-8');

// Parse INSERT statements and convert them to UPDATE statements
const sqlStatements = [];

// 1. Parse departments
const deptRegex = /\('([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*N'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*N'([^']*)',\s*N'([^']*)'/g;
let m;
while ((m = deptRegex.exec(schemaText)) !== null) {
  const [_, id, code, name, dean, email, phone, location, desc] = m;
  sqlStatements.push(`UPDATE dbo.departments SET name = N'${name.replace(/'/g, "''")}', dean_name = N'${dean.replace(/'/g, "''")}', office_location = N'${location.replace(/'/g, "''")}', description = N'${desc.replace(/'/g, "''")}' WHERE id = '${id}';`);
}

// 2. Parse majors
const majorRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*N'([^']*)',\s*(\d+),\s*([0-9.]+),\s*N'([^']*)'/g;
while ((m = majorRegex.exec(schemaText)) !== null) {
  const [_, id, deptId, code, name, degree, credits, duration, desc] = m;
  sqlStatements.push(`UPDATE dbo.majors SET name = N'${name.replace(/'/g, "''")}', degree_level = N'${degree.replace(/'/g, "''")}', description = N'${desc.replace(/'/g, "''")}' WHERE id = '${id}';`);
}

// 3. Parse users full_name
const userRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*'([^']*)',\s*'([^']*)'/g;
while ((m = userRegex.exec(schemaText)) !== null) {
  const [_, id, email, pass, fullName, phone, role] = m;
  sqlStatements.push(`UPDATE dbo.users SET full_name = N'${fullName.replace(/'/g, "''")}' WHERE id = '${id}';`);
}

// 4. Parse teacher_profiles
const teacherProfRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*N'([^']*)'/g;
while ((m = teacherProfRegex.exec(schemaText)) !== null) {
  const [_, id, userId, code, dept, title] = m;
  sqlStatements.push(`UPDATE dbo.teacher_profiles SET department = N'${dept.replace(/'/g, "''")}', academic_title = N'${title.replace(/'/g, "''")}' WHERE id = '${id}';`);
}

// 5. Parse student_profiles
const studentProfRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*N'([^']*)'/g;
while ((m = studentProfRegex.exec(schemaText)) !== null) {
  const [_, id, userId, code, cohort, major, adminClass] = m;
  sqlStatements.push(`UPDATE dbo.student_profiles SET major = N'${major.replace(/'/g, "''")}', administrative_class = N'${adminClass.replace(/'/g, "''")}' WHERE id = '${id}';`);
}

// 6. Parse courses
const courseRegex = /\('([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*N'([^']*)'/g;
while ((m = courseRegex.exec(schemaText)) !== null) {
  const [_, id, code, title, desc] = m;
  sqlStatements.push(`UPDATE dbo.courses SET title = N'${title.replace(/'/g, "''")}', description = N'${desc.replace(/'/g, "''")}' WHERE id = '${id}';`);
}

// 7. Parse course_sections
const sectionRegex = /\('([^']+)',\s*'([^']+)',\s*N'([^']*)'/g;
while ((m = sectionRegex.exec(schemaText)) !== null) {
  const [_, id, courseId, title] = m;
  // Make sure this is a section UUID
  if (id.startsWith('bbbbbbbb-')) {
    sqlStatements.push(`UPDATE dbo.course_sections SET title = N'${title.replace(/'/g, "''")}' WHERE id = '${id}';`);
  }
}

// 8. Parse lessons
const lessonRegex = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*(\d+),\s*'([^']+)',\s*(NULL|'[^']*'),\s*(NULL|'[^']*'),\s*(NULL|N'[^']*')/g;
while ((m = lessonRegex.exec(schemaText)) !== null) {
  const [_, id, courseId, sectionId, title, orderIndex, contentType, subtitleRaw, urlRaw, bodyRaw] = m;
  if (id.startsWith('55555555-')) {
    const subtitleVal = subtitleRaw === 'NULL' ? 'NULL' : `N${subtitleRaw}`;
    const bodyVal = bodyRaw === 'NULL' ? 'NULL' : bodyRaw; // already has N'...'
    sqlStatements.push(`UPDATE dbo.lessons SET title = N'${title.replace(/'/g, "''")}', subtitle = ${subtitleVal}, body_markdown = ${bodyVal} WHERE id = '${id}';`);
  }
}

// 9. Parse quizzes
const quizRegex = /\('([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*N'([^']*)'/g;
while ((m = quizRegex.exec(schemaText)) !== null) {
  const [_, id, lessonId, title, desc] = m;
  if (id.startsWith('77770000-')) {
    sqlStatements.push(`UPDATE dbo.quizzes SET title = N'${title.replace(/'/g, "''")}', description = N'${desc.replace(/'/g, "''")}' WHERE id = '${id}';`);
  }
}

// 10. Parse quiz_questions
const questionRegex = /\('([^']+)',\s*'([^']+)',\s*N'([^']*)',\s*'([^']+)',\s*([0-9.]+),\s*(\d+),\s*(NULL|N'[^']*')/g;
while ((m = questionRegex.exec(schemaText)) !== null) {
  const [_, id, quizId, qText, qType, points, orderIdx, explanationRaw] = m;
  if (id.startsWith('66660000-')) {
    sqlStatements.push(`UPDATE dbo.quiz_questions SET question_text = N'${qText.replace(/'/g, "''")}', explanation = ${explanationRaw} WHERE id = '${id}';`);
  }
}

// 11. Parse quiz_options
const optionRegex = /\(NEWID\(\),\s*'([^']+)',\s*N'([^']*)',\s*(\d+),\s*(NULL|N'[^']*')\)/g;
// Since quiz_options use NEWID(), we can match by question_id and order or clear and re-insert quiz_options from schema.sql!

console.log(`Generated ${sqlStatements.length} UPDATE statements for text fields.`);

const sqlFile = path.join(__dirname, 'update_clean_utf8.sql');
fs.writeFileSync(sqlFile, "USE [lms_db];\nGO\n" + sqlStatements.join("\nGO\n") + "\nGO\n", 'utf-8');
console.log(`Saved update script to ${sqlFile}`);
