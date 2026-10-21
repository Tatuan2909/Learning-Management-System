namespace Lms.Application.Interfaces;

public interface ISystemSettingsService
{
    bool IsMaintenanceMode { get; set; }
    string MaintenanceMessage { get; set; }
}
