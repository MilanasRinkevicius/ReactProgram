namespace backend.Models
{
    public class Member
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        // The amount the member owes or is owed in the group
        public decimal Balance { get; set; } = 0.0m;
        // The groupid of the group the member belongs to
        public int GroupId { get; set; }
        // IsPayer indicates if the member is the payer of the group
        public bool IsPayer { get; set; } = false;
        public bool IsActive { get; set; } = true;
    }
}