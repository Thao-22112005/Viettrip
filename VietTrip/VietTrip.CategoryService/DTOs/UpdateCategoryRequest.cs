using System.ComponentModel.DataAnnotations;

namespace VietTrip.CategoryService.DTOs
{
    public class UpdateCategoryRequest
    {
        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Description { get; set; }

        public bool IsActive { get; set; } = true;

        [MaxLength(500)]
        public string? ImageUrl { get; set; }
    }
}