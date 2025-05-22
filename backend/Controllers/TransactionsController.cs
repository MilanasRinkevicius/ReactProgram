using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Dtos;
using System.Text;

[ApiController]
[Route("api/groups/{groupId}/transactions")]
public class TransactionsController : ControllerBase
{
    private readonly AppDbContext _context;

    public TransactionsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost]
    public async Task<IActionResult> CreateTransaction(int groupId, [FromBody] TransactionCreateDto dto)
    {
        try
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .Include(g => g.Transactions)
                    .ThenInclude(t => t.Shares)
                    .ThenInclude(t => t.Member)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
                return NotFound("Group not found.");

            if (!group.Members.Any(m => m.Id == dto.PayerId))
                return BadRequest("Payer is not in the group.");

            var participants = dto.Participants
                .Where(p => p.MemberId != dto.PayerId && group.Members.Any(m => m.Id == p.MemberId))
                .ToList();

            if (participants.Count == 0)
                return BadRequest("No valid participants.");

            var transaction = new Transaction
            {
                PayerId = dto.PayerId,
                //Payer = dto.Payer,
                Amount = dto.Amount,
                DivisionType = dto.divisiontype ?? DivisionType.Equal,
                Shares = new List<TransactionShare>()
            };

            switch (dto.divisiontype)
            {
                case DivisionType.Equal:
                    if (participants.Count == 0)
                        return BadRequest("No participants provided.");

                    decimal equalAmount = dto.Amount / participants.Count;
                    foreach (var p in participants)
                    {
                        transaction.Shares.Add(new TransactionShare
                        {
                            MemberId = p.MemberId,
                            ShareAmount = equalAmount
                        });
                    }
                    break;

                case DivisionType.Percentage:
                    decimal totalPercentage = participants.Sum(p => p.Share);
                    if (totalPercentage != 100)
                        return BadRequest("Total percentage must equal 100.");

                    foreach (var p in participants)
                    {
                        transaction.Shares.Add(new TransactionShare
                        {
                            MemberId = p.MemberId,
                            ShareAmount = dto.Amount * ((decimal)p.Share / 100)
                        });
                    }
                    break;

                case DivisionType.Shares:
                    decimal totalShares = participants.Sum(p => p.Share);
                    if (totalShares == 0)
                        return BadRequest("Total shares cannot be 0.");

                    foreach (var p in participants)
                    {
                        transaction.Shares.Add(new TransactionShare
                        {
                            MemberId = p.MemberId,
                            ShareAmount = dto.Amount * ((decimal)p.Share / (decimal)totalShares)
                        });
                    }
                    break;

                default:
                    return BadRequest("Invalid division type.");
            }

            group.Transactions.Add(transaction);
            await _context.SaveChangesAsync();
            // Reload transaction with payer info
            var savedTransaction = await _context.Transactions
                .Include(t => t.Payer)
                .FirstOrDefaultAsync(t => t.Id == transaction.Id);

            // Map to DTO (implement ToDto if not present)
            var transactionDto = new TransactionDto
            {
                Id = savedTransaction.Id,
                PayerId = savedTransaction.PayerId,
                Payer = savedTransaction.Payer, // or just set PayerName if that's what your frontend expects
                Amount = savedTransaction.Amount,
                divisiontype = savedTransaction.DivisionType,
                Participants = savedTransaction.Shares.Select(s => new TransactionShareDto
                {
                    MemberId = s.MemberId,
                    Share = s.ShareAmount
                }).ToList()
            };
            Console.WriteLine($"[INFO] Transaction created: {transactionDto.Id} - {transactionDto.Amount} - {transactionDto.Payer.Name}");
            return Ok(transactionDto);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] {ex.Message}");
            return StatusCode(500, "Server error.");
        }
    }

    [HttpPost("preview")]
    public async Task<IActionResult> PreviewTransaction(int groupId, [FromBody] TransactionCreateDto dto)
    {
        try
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == groupId);

            if (group == null)
                return NotFound("Group not found.");

            var participants = dto.Participants
                .Where(p => p.MemberId != dto.PayerId && group.Members.Any(m => m.Id == p.MemberId))
                .ToList();

            if (participants.Count == 0)
                return BadRequest("No valid participants.");

            List<object> result = new();

            switch (dto.divisiontype)
            {
                case DivisionType.Equal:
                    if (participants.Count == 0)
                        return BadRequest("No participants provided.");

                    decimal equalAmount = dto.Amount / participants.Count;
                    result = participants
                        .Select(p => new { p.MemberId, Share = equalAmount })
                        .Cast<object>()
                        .ToList();
                    break;

                case DivisionType.Percentage:
                    decimal totalPercentage = participants.Sum(p => p.Share);
                    if (totalPercentage != 100)
                        return BadRequest("Total percentage must equal 100.");

                    result = participants
                        .Select(p => new
                        {
                            p.MemberId,
                            Share = dto.Amount * ((decimal)p.Share / 100)
                        })
                        .Cast<object>()
                        .ToList();
                    break;

                case DivisionType.Shares:
                    decimal totalShares = participants.Sum(p => p.Share);
                    if (totalShares == 0)
                        return BadRequest("Total shares cannot be 0.");

                    result = participants
                        .Select(p => new
                        {
                            p.MemberId,
                            Share = dto.Amount * ((decimal)p.Share / (decimal)totalShares)
                        })
                        .Cast<object>()
                        .ToList();
                    break;

                default:
                    return BadRequest("Invalid division type.");
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[ERROR] {ex.Message}");
            return StatusCode(500, "Server error.");
        }
    }
}
