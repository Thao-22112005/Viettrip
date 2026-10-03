using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VietTrip.TourService.Models
{
    public class TourSchedule
    {
        public int Id { get; set; }

        public int TourId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        [Range(0, 10000)]
        public int AvailableSlots { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        [JsonIgnore]
        public Tour Tour { get; set; } = null!;
    }
}