using Microsoft.AspNetCore.Mvc;
using backend.Models;         // Adjust if your namespace differs
using backend.Data;           // For AppDbContext
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    public enum DivisionType
    {
        Equal,
        Percentage,
        Shares
    }
    public class Transaction
    {
        public int Id { get; set; }
        public int GroupId { get; set; }
        public Group? Group { get; set; }
        public decimal Amount { get; set; }
        public List<Member> Participants { get; set; } = new();
        public int? PayerId { get; set; }
        public Member? Payer { get; set; }
        public DivisionType? DivisionType { get; set; }
        public List<TransactionShare> Shares { get; set; } = new();
    }
}