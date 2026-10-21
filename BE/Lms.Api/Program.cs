using System.Text.RegularExpressions;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Lms.Application.Interfaces;
using Lms.Infrastructure.Data;
using Lms.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add DbContext (Microsoft SQL Server)
builder.Services.AddDbContext<LmsDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection") 
                         ?? "Server=localhost;Database=lms_db;Trusted_Connection=True;TrustServerCertificate=True;"));

// 2. Register Services & Interfaces
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddSingleton<ISystemSettingsService, SystemSettingsService>();
builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();

// 3. Configure JWT Authentication
var secretKey = builder.Configuration["JwtSettings:Secret"] ?? "SuperSecretKeyForLmsSystemTokenAuthentication2026!@#";
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "LmsServer",
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "LmsClient",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
    };
});

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("ADMIN"));
    options.AddPolicy("TeacherOnly", policy => policy.RequireRole("TEACHER"));
    options.AddPolicy("StudentOnly", policy => policy.RequireRole("STUDENT"));
});

// 4. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 5. Swagger Configuration with Bearer Security Scheme
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "LMS Web API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Configure HTTP Pipeline
app.UseStaticFiles();
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "LMS Web API v1"));

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Initialize Academic Hierarchy (Departments & Majors) in Database
await InitializeAcademicStructureAsync(app);

app.Run();

static async Task InitializeAcademicStructureAsync(WebApplication webApp)
{
    try
    {
        using var scope = webApp.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<LmsDbContext>();

        // 1. Ensure departments table
        await db.Database.ExecuteSqlRawAsync(@"
            IF OBJECT_ID(N'dbo.departments', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.departments (
                    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    code VARCHAR(50) NOT NULL UNIQUE,
                    name NVARCHAR(200) NOT NULL,
                    dean_name NVARCHAR(150) NULL,
                    email VARCHAR(150) NULL,
                    phone VARCHAR(50) NULL,
                    office_location NVARCHAR(200) NULL,
                    description NVARCHAR(MAX) NULL,
                    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
                );
            END;
        ");

        // 2. Ensure majors table
        await db.Database.ExecuteSqlRawAsync(@"
            IF OBJECT_ID(N'dbo.majors', N'U') IS NULL
            BEGIN
                CREATE TABLE dbo.majors (
                    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                    department_id UNIQUEIDENTIFIER NOT NULL,
                    code VARCHAR(50) NOT NULL UNIQUE,
                    name NVARCHAR(200) NOT NULL,
                    degree_level NVARCHAR(100) NOT NULL DEFAULT N'Đại học Chính quy',
                    total_credits INT NOT NULL DEFAULT 135,
                    duration_years FLOAT NOT NULL DEFAULT 4.0,
                    description NVARCHAR(MAX) NULL,
                    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
                    CONSTRAINT fk_major_department FOREIGN KEY (department_id) REFERENCES dbo.departments(id) ON DELETE CASCADE
                );
            END;
        ");

        // 3. Seed Departments if empty
        if (!await db.Departments.AnyAsync())
        {
            var dFit = new Lms.Domain.Entities.Department
            {
                Id = Guid.Parse("11110000-0000-0000-0000-000000000001"),
                Code = "FIT",
                Name = "Khoa Công nghệ Thông tin",
                DeanName = "PGS. TS. Nguyễn Văn A",
                Email = "fit@lms.edu.vn",
                Phone = "024.3754.7890",
                OfficeLocation = "Nhà A2 - Tầng 3, Khu Hiệu bộ",
                Description = "Đào tạo kỹ sư, cử nhân Công nghệ Thông tin, Kỹ thuật Phần mềm và Trí tuệ Nhân tạo chất lượng cao."
            };

            var dFee = new Lms.Domain.Entities.Department
            {
                Id = Guid.Parse("11110000-0000-0000-0000-000000000002"),
                Code = "FEE",
                Name = "Khoa Điện - Điện tử & Viễn thông",
                DeanName = "TS. Lê Quang Huy",
                Email = "fee@lms.edu.vn",
                Phone = "024.3754.7891",
                OfficeLocation = "Nhà C1 - Tầng 2",
                Description = "Đào tạo các lĩnh vực Viễn thông, Tự động hóa, Vi mạch bán dẫn và Robot thông minh."
            };

            var dFba = new Lms.Domain.Entities.Department
            {
                Id = Guid.Parse("11110000-0000-0000-0000-000000000003"),
                Code = "FBA",
                Name = "Khoa Kinh tế & Quản trị Kinh doanh",
                DeanName = "PGS. TS. Phạm Thu Trang",
                Email = "fba@lms.edu.vn",
                Phone = "024.3754.7892",
                OfficeLocation = "Nhà B1 - Tầng 4",
                Description = "Đào tạo cử nhân Quản trị Kinh doanh số, Thương mại Điện tử và Tài chính Công nghệ (Fintech)."
            };

            var dFlc = new Lms.Domain.Entities.Department
            {
                Id = Guid.Parse("11110000-0000-0000-0000-000000000004"),
                Code = "FLC",
                Name = "Khoa Ngoại ngữ & Hợp tác Quốc tế",
                DeanName = "TS. Đỗ Hoàng Nam",
                Email = "flc@lms.edu.vn",
                Phone = "024.3754.7893",
                OfficeLocation = "Nhà D2 - Tầng 1",
                Description = "Đào tạo cử nhân Ngôn ngữ Anh khoa học kỹ thuật, Ngôn ngữ Nhật thương mại & CNTT."
            };

            db.Departments.AddRange(dFit, dFee, dFba, dFlc);
            await db.SaveChangesAsync();

            // Seed Majors
            var majors = new List<Lms.Domain.Entities.Major>
            {
                new() { Id = Guid.NewGuid(), DepartmentId = dFit.Id, Code = "7480201", Name = "Kỹ thuật Phần mềm", DegreeLevel = "Đại học Chính quy", TotalCredits = 135, DurationYears = 4.0, Description = "Chương trình đào tạo chuyên sâu về kiến trúc phần mềm, web, mobile và DevOps." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFit.Id, Code = "7480101", Name = "Khoa học Máy tính", DegreeLevel = "Đại học Chính quy", TotalCredits = 135, DurationYears = 4.0, Description = "Nghiên cứu cấu trúc dữ liệu thuật toán, xử lý dữ liệu lớn và thuật toán học máy." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFit.Id, Code = "7480108", Name = "Trí tuệ Nhân tạo & Khoa học Dữ liệu", DegreeLevel = "Chất lượng cao", TotalCredits = 140, DurationYears = 4.0, Description = "Đào tạo chuyên gia Deep Learning, Computer Vision, NLP và AI Engineering." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFit.Id, Code = "7480202", Name = "An toàn Thông tin", DegreeLevel = "Đại học Chính quy", TotalCredits = 135, DurationYears = 4.0, Description = "An ninh mạng, bảo mật hệ thống, mật mã học và kiểm thử xâm nhập (PenTest)." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFit.Id, Code = "7480205", Name = "Hệ thống Thông tin Quản lý", DegreeLevel = "Đại học Chính quy", TotalCredits = 130, DurationYears = 4.0, Description = "Phân tích nghiệp vụ (BA), quản trị cơ sở dữ liệu và triển khai ERP." },

                new() { Id = Guid.NewGuid(), DepartmentId = dFee.Id, Code = "7520207", Name = "Kỹ thuật Điện tử - Viễn thông", DegreeLevel = "Kỹ sư", TotalCredits = 145, DurationYears = 4.5, Description = "Mạng 5G/6G, xử lý tín hiệu số và truyền thông quang." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFee.Id, Code = "7520216", Name = "Kỹ thuật Điều khiển & Tự động hóa", DegreeLevel = "Kỹ sư", TotalCredits = 145, DurationYears = 4.5, Description = "Hệ thống điều khiển SCADA, PLC, IoT công nghiệp và tự động hóa nhà máy." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFee.Id, Code = "7520220", Name = "Kỹ thuật Robot & Hệ thống thông minh", DegreeLevel = "Chất lượng cao", TotalCredits = 145, DurationYears = 4.5, Description = "Cơ điện tử, cánh tay robot công nghiệp và phương tiện tự hành (AGV)." },

                new() { Id = Guid.NewGuid(), DepartmentId = dFba.Id, Code = "7340101", Name = "Quản trị Kinh doanh số", DegreeLevel = "Cử nhân", TotalCredits = 128, DurationYears = 4.0, Description = "Khởi nghiệp kinh doanh số, quản trị chuyển đổi số trong doanh nghiệp." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFba.Id, Code = "7340122", Name = "Thương mại Điện tử", DegreeLevel = "Cử nhân", TotalCredits = 130, DurationYears = 4.0, Description = "Kinh doanh đa kênh, digital marketing và phân tích hành vi người tiêu dùng." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFba.Id, Code = "7340205", Name = "Công nghệ Tài chính (Fintech)", DegreeLevel = "Chất lượng cao", TotalCredits = 130, DurationYears = 4.0, Description = "Thanh toán điện tử, công nghệ Blockchain và ngân hàng số." },

                new() { Id = Guid.NewGuid(), DepartmentId = dFlc.Id, Code = "7220201", Name = "Tiếng Anh Khoa học & Công nghệ", DegreeLevel = "Cử nhân", TotalCredits = 125, DurationYears = 4.0, Description = "Biên phiên dịch kỹ thuật công nghệ, tiếng Anh học thuật quốc tế." },
                new() { Id = Guid.NewGuid(), DepartmentId = dFlc.Id, Code = "7220209", Name = "Tiếng Nhật Thương mại & CNTT", DegreeLevel = "Cử nhân", TotalCredits = 128, DurationYears = 4.0, Description = "Tiếng Nhật chuyên ngành phần mềm, chuẩn bị làm việc tại các tập đoàn Nhật Bản (JLPT N2)." }
            };

            db.Majors.AddRange(majors);
            await db.SaveChangesAsync();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine("[ERROR] InitializeAcademicStructureAsync: " + ex.Message);
    }
}
