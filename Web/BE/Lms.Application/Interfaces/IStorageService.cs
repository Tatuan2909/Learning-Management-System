using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Lms.Application.Interfaces;

public interface IStorageService
{
    /// <summary>
    /// Lưu tệp tin từ IFormFile vào thư mục con quy định (ví dụ: "submissions", "documents", "avatars")
    /// Trả về đường dẫn URL tương đối (ví dụ: "/uploads/submissions/xxxx.pdf")
    /// </summary>
    Task<string> SaveFileAsync(IFormFile file, string subFolder);

    /// <summary>
    /// Lưu tệp tin từ Stream nhị phân
    /// </summary>
    Task<string> SaveFileAsync(Stream stream, string fileName, string contentType, string subFolder);

    /// <summary>
    /// Đọc stream tệp tin từ đường dẫn tương đối (dùng cho download an toàn qua API)
    /// </summary>
    Task<(Stream Stream, string ContentType, string FileName)?> GetFileAsync(string relativePath);

    /// <summary>
    /// Xóa tệp tin vật lý hoặc đối tượng trên Cloud Storage
    /// </summary>
    Task<bool> DeleteFileAsync(string relativePath);

    /// <summary>
    /// Lấy đường dẫn URL công khai hoặc URL truy cập
    /// </summary>
    string GetPublicUrl(string relativePath);
}
