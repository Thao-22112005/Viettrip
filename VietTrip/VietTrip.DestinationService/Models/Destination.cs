namespace VietTrip.DestinationService.Models
{
    public class Destination
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string Slug { get; set; } = string.Empty;

        public string? Province { get; set; }

        public string? Region { get; set; }

        public string Country { get; set; } = "Vietnam";

        public string? ShortDescription { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public bool IsActive { get; set; } = true;

        public int SortOrder { get; set; } = 0;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Quan hệ 1 Destination - nhiều Highlight
        public ICollection<DestinationHighlight> Highlights { get; set; }
            = new List<DestinationHighlight>();
    }
}