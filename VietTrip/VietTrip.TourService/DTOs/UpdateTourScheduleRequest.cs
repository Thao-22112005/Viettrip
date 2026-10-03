using System.ComponentModel.DataAnnotations;

namespace VietTrip.TourService.DTOs
{
    public class UpdateTourScheduleRequest
    {
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        [Range(0, 10000)]
        public int AvailableSlots { get; set; }

        public bool IsActive { get; set; } = true;
    }
}