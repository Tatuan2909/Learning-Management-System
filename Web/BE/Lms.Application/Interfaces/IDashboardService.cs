using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Lms.Application.DTOs;

namespace Lms.Application.Interfaces;

public interface IDashboardService
{
    Task<List<UpcomingDeadlineDto>> GetUpcomingDeadlinesAsync(Guid studentId);
}
