using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using backend.Dtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/groups/{groupId}/transactions")]
    public class TransactionsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionsController(AppDbContext context) => _context = context;

        [HttpPost("/api/groups/{groupId}/transactions")]
        public async Task<IActionResult> CreateTransaction(int groupId, [FromBody] TransactionCreateDto dto)
        {
            try
            {
                Console.WriteLine($"[DEBUG] POST group {groupId}, payer: {dto.PayerId}, amount: {dto.Amount}");

                var group = await _context.Groups
                    .Include(g => g.Members)
                    .FirstOrDefaultAsync(g => g.Id == groupId);

                if (group == null)
                    return NotFound($"Group with ID {groupId} not found.");

                var payer = group.Members.FirstOrDefault(m => m.Id == dto.PayerId);
                if (payer == null)
                    return BadRequest($"Payer with ID {dto.PayerId} not found in group.");

                var transaction = new Transaction
                {
                    GroupId = groupId,
                    Payer = payer,
                    Amount = dto.Amount,
                    Participants = group.Members
                        .Where(m => dto.Participants.Any(p => p.MemberId == m.Id))
                        .ToList(),
                    Shares = dto.Participants.Select(p => new TransactionShare
                    {
                        MemberId = p.MemberId,
                        ShareAmount = p.Share
                    }).ToList()
                };

                _context.Transactions.Add(transaction);
                await _context.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR] {ex.Message}");
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }
        [HttpGet]
        public IActionResult GetTransactions(int groupId)
        {
            try
            {
                var group = _context.Groups
                .Include(g => g.Transactions)
                .ThenInclude(t => t.Shares)
                .FirstOrDefault(g => g.Id == groupId);

                if (group == null)
                    return NotFound($"Group with id {groupId} not found");

                var dto = DtoMapper.ToDto(group.Transactions.ToList());
                return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Server error: {ex.Message}");
            }
        }
    }
}
