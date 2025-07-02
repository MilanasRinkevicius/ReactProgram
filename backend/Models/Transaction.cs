namespace backend.Models
{
    public class Transaction
    {
        public int Id { get; set; }
        // The amount of the transaction
        public decimal Amount { get; set; } = 0.0m;

        // The membersID who paid the transaction
        public int PayerId { get; set; }
        // The member who paid the transaction
        public Member Payer { get; set; } = new Member();
        public string PayerName { get; set; } = "";// <-- Add this

        //the membersID who received the transaction
        public List<int> RecipientIds { get; set; } = new List<int>();
        // The members who received the transaction
        public List<Member> Recipients { get; set; } = new List<Member>();

        // The groupId of the group the transaction belongs to
        public int GroupId { get; set; }
    }   
}