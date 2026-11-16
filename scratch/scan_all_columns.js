const { execSync } = require('child_process');

const script = `
DECLARE @sql NVARCHAR(MAX) = N'';
SELECT @sql += N'SELECT ''' + TABLE_SCHEMA + '.' + TABLE_NAME + '.' + COLUMN_NAME + ''' AS col, COUNT(*) AS cnt FROM [' + TABLE_SCHEMA + '].[' + TABLE_NAME + '] WHERE [' + COLUMN_NAME + '] LIKE ''%?%'' HAVING COUNT(*) > 0 UNION ALL '
FROM INFORMATION_SCHEMA.COLUMNS
WHERE DATA_TYPE IN ('nvarchar', 'varchar', 'text', 'ntext')
  AND TABLE_NAME NOT LIKE '__EFMigrationsHistory';

IF LEN(@sql) > 10
BEGIN
    SET @sql = LEFT(@sql, LEN(@sql) - 10);
    EXEC sp_executesql @sql;
END
`;

try {
  const res = execSync(`sqlcmd -S ACXSAB -d lms_db -E -C -f 65001 -Q "${script.replace(/\r?\n/g, ' ')}"`, { encoding: 'utf-8' });
  console.log(res);
} catch (e) {
  console.error(e.message);
}
