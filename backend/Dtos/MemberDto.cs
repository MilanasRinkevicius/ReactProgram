namespace backend.DTOs
{
    public class AddMemberDto
    {
        public string Name { get; set; } = string.Empty;
    }

    public class MemberBalanceDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal Balance { get; set; }
    }
}