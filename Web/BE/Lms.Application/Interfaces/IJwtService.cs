using System;
using Lms.Domain.Entities;

namespace Lms.Application.Interfaces;

public interface IJwtService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
}
