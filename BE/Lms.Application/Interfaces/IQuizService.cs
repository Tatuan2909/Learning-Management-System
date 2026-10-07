using System;
using System.Threading.Tasks;
using Lms.Application.DTOs;

namespace Lms.Application.Interfaces;

public interface IQuizService
{
    Task<QuizDetailDto?> GetQuizDetailAsync(Guid quizId);
    Task<SubmitQuizResponse> SubmitQuizAsync(SubmitQuizRequest request);
}
