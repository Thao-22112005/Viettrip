using System.Text.Json.Serialization;

namespace VietTrip.DestinationService.Models
{
    public class DestinationHighlight
    {
        public int Id { get; set; }

        public int DestinationId { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Icon { get; set; }

        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        // Navigation
        [JsonIgnore]
        public Destination Destination { get; set; } = null!;
    }
}