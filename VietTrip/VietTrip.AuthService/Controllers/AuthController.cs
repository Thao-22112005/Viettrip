using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Org.BouncyCastle.Crypto.Generators;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using VietTrip.AuthService.Data;
using VietTrip.AuthService.DTOs;
using VietTrip.AuthService.Models;
using VietTrip.AuthService.Services;

namespace VietTrip.AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly PasswordHasher<User> _passwordHasher;
        private readonly EmailService _emailService;
        //JWT
        private readonly IConfiguration _configuration;

        public AuthController(AuthDbContext context, IConfiguration configuration, EmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _emailService = emailService;
            _passwordHasher = new PasswordHasher<User>();
        }


        // đăng ký
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request)
        {
            // Kiểm tra email đã tồn tại
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (existingUser != null)
            {
                return BadRequest(new
                {
                    message = "Email đã được sử dụng."
                });
            }

            // Tạo user mới
            var user = new User
            {
                FullName = request.FullName,
                Email = request.Email,
                IsEmailVerified = false,
                CreatedAt = DateTime.UtcNow
            };

            //mã khóa pass
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.Password
            );

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var otp = new Random().Next(100000, 1000000).ToString();

            var otpCode = new OtpCode
            {
                UserId = user.Id,
                Code = otp,
                Purpose = "Register",
                ExpiresAt = DateTime.UtcNow.AddMinutes(2),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.OtpCodes.Add(otpCode);
            await _context.SaveChangesAsync();

            //gửi OTP qua gmail
            await _emailService.SendEmailAsync(
                user.Email,
                "Mã OTP xác thực tài khoản VietTrip",
                $@"
                    <h2>VietTrip</h2>
                    <p>Xin chào <strong>{user.FullName}</strong>,</p>

                    <p>Mã OTP xác thực tài khoản của bạn là:</p>

                    <h1>{otp}</h1>

                    <p>Mã OTP có hiệu lực trong <strong>2 phút</strong>.</p>

                    <p>Vui lòng không chia sẻ mã này với người khác.</p>

                    <p>Trân trọng,<br/>VietTrip</p>
                "
            );

            return Ok(new
            {
                message = "Đăng ký tài khoản thành công. Vui lòng xác thực OTP.",
                userId = user.Id,
                email = user.Email
            });
        }

        // xác thực mã otp
        [HttpPost("verify-otp")]
        public async Task<IActionResult> VerifyOtp(VerifyOtpRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Email không tồn tại."
                });
            }

            var otp = await _context.OtpCodes
                .Where(o =>
                    o.UserId == user.Id &&
                    o.Purpose == "Register" &&
                    !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null)
            {
                return BadRequest(new
                {
                    message = "OTP không tồn tại hoặc đã được sử dụng."
                });
            }

            if (otp.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "OTP đã hết hạn."
                });
            }

            if (otp.Code != request.Code)
            {
                return BadRequest(new
                {
                    message = "OTP không chính xác."
                });
            }

            user.IsEmailVerified = true;
            user.UpdatedAt = DateTime.UtcNow;

            otp.IsUsed = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xác thực email thành công."
            });
        }

        //gửi lại mã otp
        [HttpPost("resend-otp")]
        public async Task<IActionResult> ResendOtp(ResendOtpRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Email không tồn tại."
                });
            }

            if (user.IsEmailVerified)
            {
                return BadRequest(new
                {
                    message = "Email đã được xác thực."
                });
            }

            // Lấy OTP gần nhất
            var latestOtp = await _context.OtpCodes
                .Where(o =>
                    o.UserId == user.Id &&
                    o.Purpose == "Register")
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            // Kiểm tra cooldown 120 giây
            if (latestOtp != null)
            {
                var secondsPassed =
                    (DateTime.UtcNow - latestOtp.CreatedAt).TotalSeconds;

                if (secondsPassed < 120)
                {
                    var remainingSeconds =
                        (int)Math.Ceiling(120 - secondsPassed);

                    return BadRequest(new
                    {
                        message = $"Vui lòng chờ {remainingSeconds} giây trước khi gửi lại OTP."
                    });
                }
            }

            // Vô hiệu hóa OTP cũ
            if (latestOtp != null && !latestOtp.IsUsed)
            {
                latestOtp.IsUsed = true;
            }

            // Tạo OTP mới
            var otp = new Random()
                .Next(100000, 1000000)
                .ToString();

            var newOtp = new OtpCode
            {
                UserId = user.Id,
                Code = otp,
                Purpose = "Register",
                ExpiresAt = DateTime.UtcNow.AddMinutes(2),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.OtpCodes.Add(newOtp);

            await _context.SaveChangesAsync();

            // Gửi OTP mới qua Gmail
            await _emailService.SendEmailAsync(
                    user.Email,
                    "Mã OTP mới - VietTrip",
                    $@"
                        <h2>VietTrip</h2>

                        <p>Xin chào <strong>{user.FullName}</strong>,</p>

                        <p>Mã OTP mới của bạn là:</p>

                        <h1>{otp}</h1>

                        <p>Mã OTP có hiệu lực trong <strong>2 phút</strong>.</p>

                        <p>Vui lòng không chia sẻ mã này với người khác.</p>

                        <p>Trân trọng,<br/>VietTrip</p>
                    "
            );

            return Ok(new
            {
                message = "OTP mới đã được gửi đến email của bạn."
            });
        }


        // đăng nhập
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request)
        {
            // Tìm user theo email
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Email hoặc mật khẩu không đúng."
                });
            }
            if (!user.IsEmailVerified)
            {
                return BadRequest(new
                {
                    message = "Email chưa được xác thực. Vui lòng xác thực OTP trước khi đăng nhập."
                });
            }

            // Kiểm tra mật khẩu
            var result = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password
            );

            if (result == PasswordVerificationResult.Failed)
            {
                return BadRequest(new
                {
                    message = "Email hoặc mật khẩu không đúng."
                });
            }

            // Tạo JWT
            var token = GenerateJwtToken(user);

            return Ok(new
            {
                message = "Đăng nhập thành công.",
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                role = user.Role,
                token = token
            });
        }

        //jwt
        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.FullName),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!
                )
            );

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256
            );

            var expireMinutes = int.Parse(
                _configuration["Jwt:ExpireMinutes"]!
            );

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }


        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userId, out int id))
            {
                return Unauthorized(new
                {
                    message = "Token không chứa UserId hợp lệ."
                });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng."
                });
            }

            return Ok(new
            {
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                address = user.Address,
                avatarUrl = user.AvatarUrl,
                role = user.Role
            });
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile(
    [FromBody] UpdateProfileRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userId, out int id))
            {
                return Unauthorized(new
                {
                    message = "Token không chứa UserId hợp lệ."
                });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng."
                });
            }

            if (string.IsNullOrWhiteSpace(request.FullName))
            {
                return BadRequest(new
                {
                    message = "Họ và tên không được để trống."
                });
            }

            user.FullName = request.FullName.Trim();

            user.Phone = string.IsNullOrWhiteSpace(request.Phone)
                ? null
                : request.Phone.Trim();

            user.Address = string.IsNullOrWhiteSpace(request.Address)
                ? null
                : request.Address.Trim();

            user.AvatarUrl = string.IsNullOrWhiteSpace(request.AvatarUrl)
                ? user.AvatarUrl
                : request.AvatarUrl.Trim();

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật thông tin cá nhân thành công.",
                userId = user.Id,
                fullName = user.FullName,
                email = user.Email,
                phone = user.Phone,
                address = user.Address,
                avatarUrl = user.AvatarUrl,
                role = user.Role
            });
        }

        // quên mật khẩu
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(
        ForgotPasswordRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Email không tồn tại."
                });
            }

            if (!user.IsEmailVerified)
            {
                return BadRequest(new
                {
                    message = "Email chưa được xác thực."
                });
            }

            // Lấy OTP quên mật khẩu gần nhất
            var latestOtp = await _context.OtpCodes
                .Where(o =>
                    o.UserId == user.Id &&
                    o.Purpose == "ForgotPassword")
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            // Cooldown 120 giây
            if (latestOtp != null)
            {
                var secondsPassed =
                    (DateTime.UtcNow - latestOtp.CreatedAt).TotalSeconds;

                if (secondsPassed < 120)
                {
                    var remainingSeconds =
                        (int)Math.Ceiling(120 - secondsPassed);

                    return BadRequest(new
                    {
                        message =
                            $"Vui lòng chờ {remainingSeconds} giây trước khi gửi lại OTP."
                    });
                }
            }

            // Vô hiệu hóa OTP cũ
            if (latestOtp != null && !latestOtp.IsUsed)
            {
                latestOtp.IsUsed = true;
            }

            // Tạo OTP mới
            var otp = new Random()
                .Next(100000, 1000000)
                .ToString();

            var otpCode = new OtpCode
            {
                UserId = user.Id,
                Code = otp,
                Purpose = "ForgotPassword",
                ExpiresAt = DateTime.UtcNow.AddMinutes(2),
                IsUsed = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.OtpCodes.Add(otpCode);

            await _context.SaveChangesAsync();

            // Gửi OTP qua Gmail
            await _emailService.SendEmailAsync(
                user.Email,
                "Mã OTP đặt lại mật khẩu - VietTrip",
                $@"
                    <h2>VietTrip</h2>

                    <p>Xin chào <strong>{user.FullName}</strong>,</p>

                    <p>Bạn vừa yêu cầu đặt lại mật khẩu.</p>

                    <p>Mã OTP của bạn là:</p>

                    <h1>{otp}</h1>

                    <p>
                        Mã OTP có hiệu lực trong
                        <strong>2 phút</strong>.
                    </p>

                    <p>
                        Nếu bạn không thực hiện yêu cầu này,
                        vui lòng bỏ qua email.
                    </p>

                    <p>Trân trọng,<br/>VietTrip</p>
                "
            );

            return Ok(new
            {
                message = "Mã OTP đặt lại mật khẩu đã được gửi đến email.",
                email = user.Email
            });
        }


        // chỉ để test gmail 
        [HttpPost("test-email")]
        public async Task<IActionResult> TestEmail()
        {
            await _emailService.SendEmailAsync(
                "thaolovely221105@gmail.com",
                "Test email từ VietTrip",
                "<h2>Xin chào!</h2><p>EmailService của VietTrip đang hoạt động.</p>"
            );

            return Ok(new
            {
                message = "Gửi email thành công."
            });
        }

        // xác thực otp khi quên mk 
        [HttpPost("verify-forgot-password")]
        public async Task<IActionResult> VerifyForgotPassword(
        VerifyForgotPasswordRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Email không tồn tại."
                });
            }

            var otp = await _context.OtpCodes
                .Where(o =>
                    o.UserId == user.Id &&
                    o.Purpose == "ForgotPassword" &&
                    !o.IsUsed)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (otp == null)
            {
                return BadRequest(new
                {
                    message = "OTP không tồn tại hoặc đã được sử dụng."
                });
            }

            if (otp.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "OTP đã hết hạn."
                });
            }

            if (otp.Code != request.Code)
            {
                return BadRequest(new
                {
                    message = "OTP không chính xác."
                });
            }

            // OTP hợp lệ
            otp.IsUsed = true;
            otp.IsVerified = true;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xác thực OTP thành công. Bạn có thể đặt lại mật khẩu."
            });
        }

        // reset pass
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword(
        ResetPasswordRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null)
            {
                return BadRequest(new
                {
                    message = "Email không tồn tại."
                });
            }

            var verifiedOtp = await _context.OtpCodes
                .Where(o =>
                    o.UserId == user.Id &&
                    o.Purpose == "ForgotPassword" &&
                    o.IsVerified)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync();

            if (verifiedOtp == null)
            {
                return BadRequest(new
                {
                    message = "Bạn chưa xác thực OTP."
                });
            }

            if (verifiedOtp.ExpiresAt < DateTime.UtcNow)
            {
                return BadRequest(new
                {
                    message = "Phiên đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu OTP mới."
                });
            }

            // Hash mật khẩu mới
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.NewPassword
            );

            user.UpdatedAt = DateTime.UtcNow;

            // Không cho OTP này được sử dụng lại
            verifiedOtp.IsVerified = false;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đặt lại mật khẩu thành công."
            });
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(
    [FromBody] ChangePasswordRequest request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userId, out int id))
            {
                return Unauthorized(new
                {
                    message = "Token không chứa UserId hợp lệ."
                });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng."
                });
            }

            if (string.IsNullOrWhiteSpace(request.CurrentPassword))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập mật khẩu hiện tại."
                });
            }

            if (string.IsNullOrWhiteSpace(request.NewPassword))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập mật khẩu mới."
                });
            }

            if (string.IsNullOrWhiteSpace(request.ConfirmPassword))
            {
                return BadRequest(new
                {
                    message = "Vui lòng nhập lại mật khẩu mới."
                });
            }

            if (request.NewPassword != request.ConfirmPassword)
            {
                return BadRequest(new
                {
                    message = "Mật khẩu mới và xác nhận mật khẩu không khớp."
                });
            }

            if (request.NewPassword.Length < 6)
            {
                return BadRequest(new
                {
                    message = "Mật khẩu mới phải có ít nhất 6 ký tự."
                });
            }

            // Kiểm tra mật khẩu hiện tại
            var passwordResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.CurrentPassword
            );

            if (passwordResult == PasswordVerificationResult.Failed)
            {
                return BadRequest(new
                {
                    message = "Mật khẩu hiện tại không chính xác."
                });
            }

            // Không cho đổi thành mật khẩu cũ
            var samePasswordResult = _passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.NewPassword
            );

            if (samePasswordResult != PasswordVerificationResult.Failed)
            {
                return BadRequest(new
                {
                    message = "Mật khẩu mới phải khác mật khẩu hiện tại."
                });
            }

            // Hash mật khẩu mới
            user.PasswordHash = _passwordHasher.HashPassword(
                user,
                request.NewPassword
            );

            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đổi mật khẩu thành công."
            });
        }

        // =============================
        // ADMIN - USER MANAGEMENT
        // =============================

        [Authorize(Roles = "Admin")]
        [HttpGet("internal/users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .Where(u => u.Role == "User")
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    Role = u.Role,
                    IsEmailVerified = u.IsEmailVerified,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }


        [Authorize(Roles = "Admin")]
        [HttpGet("internal/users/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    Address = u.Address,
                    Role = u.Role,
                    IsEmailVerified = u.IsEmailVerified,
                    Status = u.Status,
                    CreatedAt = u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng."
                });
            }

            return Ok(user);
        }


        [Authorize(Roles = "Admin")]
        [HttpPut("internal/users/{id}/status")]
        public async Task<IActionResult> UpdateUserStatus(
            int id,
            [FromBody] UpdateUserStatusRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy người dùng."
                });
            }

            var allowedStatuses = new[]
            {
        "Active",
        "Locked"
    };

            if (!allowedStatuses.Contains(request.Status))
            {
                return BadRequest(new
                {
                    message = "Trạng thái không hợp lệ. Chỉ chấp nhận Active hoặc Locked."
                });
            }

            user.Status = request.Status;
            user.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.Status == "Locked"
                    ? "Đã khóa tài khoản."
                    : "Đã mở khóa tài khoản.",

                userId = user.Id,
                status = user.Status,
                updatedAt = user.UpdatedAt
            });
        }
    }
}