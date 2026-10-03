namespace VietTrip.DestinationService.DTOs
{
    public class UpdateDestinationHighlightRequest
    {
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? Icon { get; set; }

        public int SortOrder { get; set; } = 0;

        public bool IsActive { get; set; }
    }
}