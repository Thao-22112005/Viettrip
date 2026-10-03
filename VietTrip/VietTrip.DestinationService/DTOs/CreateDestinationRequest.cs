namespace VietTrip.DestinationService.DTOs
{
    public class CreateDestinationRequest
    {
        public string Name { get; set; } = string.Empty;

        public string? Slug { get; set; }

        public string? Province { get; set; }

        public string? Region { get; set; }

        public string? Country { get; set; }

        public string? ShortDescription { get; set; }

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        public int SortOrder { get; set; } = 0;
    }
}