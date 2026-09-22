using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using Lms.Application.DTOs;

namespace Lms.Application.Interfaces;

public interface IDashboardService
{
    Task<List<UpcomingDeadlineDto>> GetUpcomingDeadlinesAsync(Guid studentId);
}

public interface IQuizService
{
    Task<QuizDetailDto?> GetQuizDetailAsync(Guid quizId);
    Task<SubmitQuizResponse> SubmitQuizAsync(SubmitQuizRequest request);
}
