const { execSync } = require('child_process');

const query = `
SELECT 'courses' as tbl, count(*) as cnt FROM dbo.courses WHERE title LIKE '%?%'
UNION ALL SELECT 'users', count(*) FROM dbo.users WHERE full_name LIKE '%?%'
UNION ALL SELECT 'departments', count(*) FROM dbo.departments WHERE name LIKE '%?%'
UNION ALL SELECT 'majors', count(*) FROM dbo.majors WHERE name LIKE '%?%'
UNION ALL SELECT 'teacher_profiles', count(*) FROM dbo.teacher_profiles WHERE academic_title LIKE '%?%'
UNION ALL SELECT 'student_profiles', count(*) FROM dbo.student_profiles WHERE major LIKE '%?%'
UNION ALL SELECT 'lessons', count(*) FROM dbo.lessons WHERE title LIKE '%?%' OR subtitle LIKE '%?%'
UNION ALL SELECT 'quizzes', count(*) FROM dbo.quizzes WHERE title LIKE '%?%'
UNION ALL SELECT 'quiz_questions', count(*) FROM dbo.quiz_questions WHERE question_text LIKE '%?%'
UNION ALL SELECT 'quiz_options', count(*) FROM dbo.quiz_options WHERE option_text LIKE '%?%'
UNION ALL SELECT 'assignments', count(*) FROM dbo.assignments WHERE title LIKE '%?%'
UNION ALL SELECT 'announcements', count(*) FROM dbo.announcements WHERE title LIKE '%?%'
UNION ALL SELECT 'question_banks', count(*) FROM dbo.question_banks WHERE question_text LIKE '%?%'
`;

const res = execSync(`sqlcmd -S ACXSAB -d lms_db -E -C -f 65001 -Q "${query.replace(/\n/g, ' ')}"`, { encoding: 'utf-8' });
console.log(res);
