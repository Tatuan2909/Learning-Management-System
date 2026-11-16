using Lms.Application.Interfaces;

namespace Lms.Infrastructure.Services;

public class PasswordHasher : IPasswordHasher
{
    public string HashPassword(string password)
    {
        if (string.IsNullOrEmpty(password))
            throw new ArgumentNullException(nameof(password), "Password cannot be null or empty.");

        return BCrypt.Net.BCrypt.EnhancedHashPassword(password, workFactor: 11);
    }

    public bool VerifyPassword(string providedPassword, string storedHash)
    {
        if (string.IsNullOrEmpty(providedPassword) || string.IsNullOrEmpty(storedHash))
            return false;

        // BCrypt hash strings start with $2a$, $2b$, or $2y$
        if (storedHash.StartsWith("$2"))
        {
            try
            {
                return BCrypt.Net.BCrypt.EnhancedVerify(providedPassword, storedHash);
            }
            catch
            {
                return false;
            }
        }

        // Fallback for legacy plain-text seed passwords (enables seamless migration)
        return string.Equals(providedPassword, storedHash, StringComparison.Ordinal);
    }
}
