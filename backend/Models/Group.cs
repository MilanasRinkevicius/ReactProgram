namespace backend
{
    using backend.Models;
    public class Group
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        //Payer is the member who pays for the group
        public Member Payer { get; set; } = new Member();
        //Members is a list of users who are members of the group
        public List<Member> Members { get; set; } = new List<Member>();
        //Transactions is a list of transactions that are part of the group
        public List<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}