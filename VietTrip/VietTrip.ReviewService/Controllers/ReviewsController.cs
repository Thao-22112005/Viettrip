using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.ReviewService.Data;
using VietTrip.ReviewService.DTOs;
using VietTrip.ReviewService.Models;
using VietTrip.ReviewService.Services;

namespace VietTrip.ReviewService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewDbContext _context;
        private readonly IBookingServiceClient _bookingServiceClient;

        public ReviewsController(
            ReviewDbContext context,
            IBookingServiceClient bookingServiceClient)
        {
            _context = context;
            _bookingServiceClient = bookingServiceClient;
        }

        // GET: api/Reviews
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var reviews = await _context.Reviews
                .Where(r => r.IsActive)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.Id == id &&
                    r.IsActive);

            if (review == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đánh giá."
                });
            }

            return Ok(review);
        }

        // GET: api/Reviews/tour/1
        [HttpGet("tour/{tourId}")]
        public async Task<IActionResult> GetByTourId(int tourId)
        {
            var reviews = await _context.Reviews
                .Where(r =>
                    r.TourId == tourId &&
                    r.IsActive)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // GET: api/Reviews/user/1
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetByUserId(int userId)
        {
            var reviews = await _context.Reviews
                .Where(r =>
                    r.UserId == userId &&
                    r.IsActive)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // POST: api/Reviews
        [HttpPost]
        public async Task<IActionResult> Create(
            [FromBody] CreateReviewRequest request)
        {
            // 1. Kiểm tra Booking
            var booking = await _bookingServiceClient
                .GetBookingReviewInfoAsync(request.BookingId);

            if (booking == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy booking."
                });
            }

            // 2. Kiểm tra User có đúng người đặt booking không
            if (booking.UserId != request.UserId)
            {
                return BadRequest(new
                {
                    message = "User không khớp với booking."
                });
            }

            // 3. Kiểm tra Tour có đúng với booking không
            if (booking.TourId != request.TourId)
            {
                return BadRequest(new
                {
                    message = "Tour không khớp với booking."
                });
            }

            // 4. Chỉ booking đã hoàn thành mới được đánh giá
            if (booking.Status != "Completed")
            {
                return BadRequest(new
                {
                    message = "Chỉ có thể đánh giá sau khi booking đã hoàn thành."
                });
            }

            // 5. Kiểm tra đã đánh giá booking này chưa
            var existingReview = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.UserId == request.UserId &&
                    r.BookingId == request.BookingId);

            if (existingReview != null)
            {
                return Conflict(new
                {
                    message = "Booking này đã được đánh giá.",
                    reviewId = existingReview.Id
                });
            }

            // 6. Tạo Review
            var review = new Review
            {
                UserId = request.UserId,
                TourId = request.TourId,
                BookingId = request.BookingId,
                Rating = request.Rating,
                Comment = request.Comment,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Reviews.Add(review);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = review.Id },
                review
            );
        }

        // PUT: api/Reviews/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            [FromBody] UpdateReviewRequest request)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r =>
                    r.Id == id &&
                    r.IsActive);

            if (review == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đánh giá."
                });
            }

            review.Rating = request.Rating;
            review.Comment = request.Comment;
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Cập nhật đánh giá thành công.",
                review.Id,
                review.UserId,
                review.TourId,
                review.BookingId,
                review.Rating,
                review.Comment,
                review.UpdatedAt
            });
        }

        // DELETE: api/Reviews/1
        // DELETE: api/Reviews/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đánh giá."
                });
            }

            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Xóa đánh giá thành công."
            });
        }

        // GET: api/Reviews/tour-summary
        [HttpGet("tour-summary")]
        public async Task<IActionResult> GetTourReviewSummary()
        {
            var summaries = await _context.Reviews
                .Where(r => r.IsActive)
                .GroupBy(r => r.TourId)
                .Select(g => new TourReviewSummaryResponse
                {
                    TourId = g.Key,
                    AverageRating = Math.Round(g.Average(r => r.Rating), 1),
                    ReviewCount = g.Count()
                })
                .OrderBy(x => x.TourId)
                .ToListAsync();

            return Ok(summaries);
        }

        // GET: api/Reviews/admin
        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public async Task<IActionResult> GetAllForAdmin()
        {
            var reviews = await _context.Reviews
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return Ok(reviews);
        }

        // PUT: api/Reviews/1/visibility
        [Authorize(Roles = "Admin")]
        [HttpPut("{id}/visibility")]
        public async Task<IActionResult> UpdateVisibility(
            int id,
            [FromBody] UpdateReviewVisibilityRequest request)
        {
            var review = await _context.Reviews
                .FirstOrDefaultAsync(r => r.Id == id);

            if (review == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy đánh giá."
                });
            }

            review.IsActive = request.IsActive;
            review.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = request.IsActive
                    ? "Đã hiển thị đánh giá."
                    : "Đã ẩn đánh giá.",

                reviewId = review.Id,
                isActive = review.IsActive,
                updatedAt = review.UpdatedAt
            });
        }
    }
}