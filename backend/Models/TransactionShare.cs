using Microsoft.AspNetCore.Mvc;
using backend.Models;         // Adjust if your namespace differs
using backend.Data;           // For AppDbContext
using Microsoft.EntityFrameworkCore;
public class TransactionShare
{
    public int Id { get; set; }

    public int TransactionId { get; set; }
    public Transaction Transaction { get; set; } = null!;

    public int MemberId { get; set; }
    public Member Member { get; set; } = null!;

    public decimal ShareAmount { get; set; } // How much this member owes
}