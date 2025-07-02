using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/group/{groupId}/transaction")]
    public class TransactionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/group/{groupId}/transaction
        [HttpPost]
        public async Task<IActionResult> AddTransaction(int groupId, [FromBody] TransactionDto dto)
        {
            // Validate payer
            var payer = await _context.Members.FindAsync(dto.PayerId);
            if (payer == null || payer.GroupId != groupId)
                return BadRequest("Invalid payer.");

            // Validate recipients
            var recipients = _context.Members.Where(m => dto.RecipientIds.Contains(m.Id) && m.GroupId == groupId).ToList();
            if (recipients.Count != dto.RecipientIds.Count)
                return BadRequest("Invalid recipients.");

            // Remove payer from recipients if present
            recipients = recipients.Where(r => r.Id != payer.Id).ToList();

            // Calculate splits
            Dictionary<int, decimal> splits = new();
            if (dto.SplitType == "equal")
            {
                if (recipients.Count == 0)
                    return BadRequest("No recipients to split with.");
                var perPerson = Math.Round(dto.Amount / recipients.Count, 2);
                foreach (var r in recipients)
                    splits[r.Id] = perPerson;
            }
            else if (dto.SplitType == "percentage")
            {
                if (dto.Percentages == null || dto.Percentages.Count != recipients.Count)
                    return BadRequest("Percentages required.");
                for (int i = 0; i < recipients.Count; i++)
                    splits[recipients[i].Id] = Math.Round(dto.Amount * dto.Percentages[i] / 100m, 2);
            }
            else if (dto.SplitType == "dynamic")
            {
                if (dto.Amounts == null || dto.Amounts.Count != recipients.Count)
                    return BadRequest("Amounts required.");
                for (int i = 0; i < recipients.Count; i++)
                    splits[recipients[i].Id] = dto.Amounts[i];
            }
            else
            {
                return BadRequest("Invalid split type.");
            }

            // Save transaction
            var transaction = new Transaction
            {
                Amount = dto.Amount,
                PayerId = dto.PayerId,
                PayerName = payer?.Name, // <-- Save the name
                GroupId = groupId,
                RecipientIds = recipients.Select(r => r.Id).ToList(),
                // Optionally save splits as JSON or another table
            };
            _context.Transactions.Add(transaction);

            // Update balances
            foreach (var r in recipients)
            {
                r.Balance -= splits[r.Id];
            }
            //payer.Balance -= dto.Amount; // Payer pays the full amount

            await _context.SaveChangesAsync();
            return Ok(transaction);
        }

        // GET: api/group/{groupId}/transaction
        [HttpGet]
        public IActionResult GetTransactions(int groupId)
        {
            var transactions = _context.Transactions
                .Where(t => t.GroupId == groupId)
                .ToList();
            return Ok(transactions);
        }
    }

    // DTO for transaction creation
    public class TransactionDto
    {
        public int PayerId { get; set; }
        public decimal Amount { get; set; }
        public List<int> RecipientIds { get; set; } = new();
        public string SplitType { get; set; } = "equal"; // "equal", "percentage", "dynamic"
        public List<decimal>? Percentages { get; set; }
        public List<decimal>? Amounts { get; set; }
    }
}