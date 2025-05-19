using Microsoft.AspNetCore.Mvc;
using backend.Models;         // Adjust if your namespace differs
using backend.Data;           // For AppDbContext
using Microsoft.EntityFrameworkCore;

namespace backend.Models
{
    public class Group
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
        public List<Member> Members { get; set; } = new();
    }
}