using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Lms.Application.Interfaces;

namespace Lms.Infrastructure.Services;

public class LocalStorageService : IStorageService
{
    private readonly string _baseUploadPath;

    public LocalStorageService(IWebHostEnvironment? env = null)
    {
        var root = env?.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        _baseUploadPath = Path.Combine(root, "uploads");
        if (!Directory.Exists(_baseUploadPath))
        {
            Directory.CreateDirectory(_baseUploadPath);
        }
    }

    public async Task<string> SaveFileAsync(IFormFile file, string subFolder)
    {
        if (file == null || file.Length == 0)
            throw new ArgumentException("Tệp tin tải lên rỗng hoặc không hợp lệ.", nameof(file));

        var folder = Path.Combine(_baseUploadPath, subFolder);
        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }

        var ext = Path.GetExtension(file.FileName);
        var safeFileName = $"{Guid.NewGuid():N}{ext}";
        var physicalPath = Path.Combine(folder, safeFileName);

        await using (var fileStream = new FileStream(physicalPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await file.CopyToAsync(fileStream);
        }

        return $"/uploads/{subFolder.Trim('/', '\\')}/{safeFileName}";
    }

    public async Task<string> SaveFileAsync(Stream stream, string fileName, string contentType, string subFolder)
    {
        if (stream == null || stream.Length == 0)
            throw new ArgumentException("Luồng dữ liệu tệp tin rỗng.", nameof(stream));

        var folder = Path.Combine(_baseUploadPath, subFolder);
        if (!Directory.Exists(folder))
        {
            Directory.CreateDirectory(folder);
        }

        var ext = Path.GetExtension(fileName);
        var safeFileName = $"{Guid.NewGuid():N}{ext}";
        var physicalPath = Path.Combine(folder, safeFileName);

        await using (var fileStream = new FileStream(physicalPath, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            await stream.CopyToAsync(fileStream);
        }

        return $"/uploads/{subFolder.Trim('/', '\\')}/{safeFileName}";
    }

    public Task<(Stream Stream, string ContentType, string FileName)?> GetFileAsync(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return Task.FromResult<(Stream Stream, string ContentType, string FileName)?>(null);

        var cleanPath = relativePath.Replace('\\', '/').TrimStart('/');
        if (cleanPath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
        {
            cleanPath = cleanPath.Substring("uploads/".Length);
        }

        var physicalPath = Path.Combine(_baseUploadPath, cleanPath.Replace('/', Path.DirectorySeparatorChar));
        if (!File.Exists(physicalPath))
        {
            return Task.FromResult<(Stream Stream, string ContentType, string FileName)?>(null);
        }

        var ext = Path.GetExtension(physicalPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".pdf" => "application/pdf",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".doc" => "application/msword",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".xls" => "application/vnd.ms-excel",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".zip" => "application/zip",
            ".rar" => "application/x-rar-compressed",
            ".png" => "image/png",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".txt" => "text/plain; charset=utf-8",
            _ => "application/octet-stream"
        };

        Stream stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);
        var fileName = Path.GetFileName(physicalPath);

        return Task.FromResult<(Stream Stream, string ContentType, string FileName)?>((stream, contentType, fileName));
    }

    public Task<bool> DeleteFileAsync(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return Task.FromResult(false);

        try
        {
            var cleanPath = relativePath.Replace('\\', '/').TrimStart('/');
            if (cleanPath.StartsWith("uploads/", StringComparison.OrdinalIgnoreCase))
            {
                cleanPath = cleanPath.Substring("uploads/".Length);
            }

            var physicalPath = Path.Combine(_baseUploadPath, cleanPath.Replace('/', Path.DirectorySeparatorChar));
            if (File.Exists(physicalPath))
            {
                File.Delete(physicalPath);
                return Task.FromResult(true);
            }
        }
        catch
        {
            // Ignore error on file delete
        }

        return Task.FromResult(false);
    }

    public string GetPublicUrl(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath)) return string.Empty;
        var normalized = relativePath.Replace('\\', '/');
        if (!normalized.StartsWith("/")) normalized = "/" + normalized;
        return normalized;
    }
}
