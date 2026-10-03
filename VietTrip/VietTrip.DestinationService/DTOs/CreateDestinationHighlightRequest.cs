namespace VietTrip.DestinationService.DTOs
{
    public class CreateDestinationHighlightRequest
    {
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Icon { get; set; }

        public int SortOrder { get; set; } = 0;
    }
}