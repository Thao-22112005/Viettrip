using System.ComponentModel.DataAnnotations;

namespace VietTrip.TourService.DTOs
{
    public class CreateTourScheduleRequest
    {
        [Range(1, int.MaxValue)]
        public int TourId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        [Range(1, 10000)]
        public int AvailableSlots { get; set; }
    }
}