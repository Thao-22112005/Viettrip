using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VietTrip.CategoryService.Data;
using VietTrip.CategoryService.DTOs;
using VietTrip.CategoryService.Models;

namespace VietTrip.CategoryService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly CategoryDbContext _context;

        public CategoriesController(CategoryDbContext context)
        {
            _context = context;
        }

        // GET: api/categories
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Id)
                .ToListAsync();

            return Ok(categories);
        }

        // GET: api/categories/1
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy danh mục."
                });
            }

            return Ok(category);
        }

        // POST: api/categories
        [HttpPost]
        public async Task<IActionResult> Create(
            CreateCategoryRequest request)
        {
            var name = request.Name.Trim();

            var exists = await _context.Categories
                .AnyAsync(c => c.Name.ToLower() == name.ToLower());

            if (exists)
            {
                return Conflict(new
                {
                    message = "Danh mục đã tồn tại."
                });
            }

            //isActive để phục vụ soft delete nên thêm mặc định là true
            var category = new Category
            {
                Name = name,
                Description = request.Description?.Trim(),
                IsActive = true,
                ImageUrl = request.ImageUrl,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetById),
                new { id = category.Id },
                category
            );
        }

        // PUT: api/categories/1
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
            int id,
            UpdateCategoryRequest request)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy danh mục."
                });
            }

            var name = request.Name.Trim();

            var duplicate = await _context.Categories
                .AnyAsync(c =>
                    c.Id != id &&
                    c.Name.ToLower() == name.ToLower());

            if (duplicate)
            {
                return Conflict(new
                {
                    message = "Tên danh mục đã tồn tại."
                });
            }

            category.Name = name;
            category.Description = request.Description?.Trim();
            category.IsActive = request.IsActive;
            category.ImageUrl = request.ImageUrl;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(category);
        }

        // DELETE: api/categories/1
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new
                {
                    message = "Không tìm thấy danh mục."
                });
            }

            // Soft delete (xóa mềm -> vẫn có thể xem đc trong db)
            category.IsActive = false;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Đã vô hiệu hóa danh mục."
            });
        }
    }
}