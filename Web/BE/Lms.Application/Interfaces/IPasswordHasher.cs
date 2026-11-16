namespace Lms.Application.Interfaces;

public interface IPasswordHasher
{
    string HashPassword(string password);
    bool VerifyPassword(string providedPassword, string storedHash);
}
