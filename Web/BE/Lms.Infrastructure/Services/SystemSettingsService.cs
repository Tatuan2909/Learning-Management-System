using Lms.Application.Interfaces;

namespace Lms.Infrastructure.Services;

public class SystemSettingsService : ISystemSettingsService
{
    public bool IsMaintenanceMode { get; set; } = false;
    public string MaintenanceMessage { get; set; } = "Hệ thống đang trong chế độ bảo trì định kỳ để nâng cấp cơ sở dữ liệu. Sinh viên và Giảng viên tạm thời không thể đăng nhập. Vui lòng quay lại sau.";
}
