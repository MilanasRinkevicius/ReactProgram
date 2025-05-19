using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/groups/{groupId}/members")]
    public class MembersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MembersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: /groups/{groupId}/members

        [HttpPost]
        public async Task<IActionResult> AddMember([FromRoute] int groupId, [FromBody] AddMemberDto newMember)
        {
            if (string.IsNullOrWhiteSpace(newMember.Name))
                return BadRequest("Name is required");

            var groupExists = await _context.Groups.AnyAsync(g => g.Id == groupId);
            if (!groupExists)
                return NotFound("Group not found");

            var member = new Member
            {
                Name = newMember.Name,
                GroupId = groupId // This links the member to the group
            };

            _context.Members.Add(member);
            await _context.SaveChangesAsync();

            return Ok(member); // Optional: return MemberDto instead
        }
        [HttpGet("{memberId}")]
        public IActionResult GetMember(int groupId, int memberId)
        {
            var member = _context.Members
                .FirstOrDefault(m => m.GroupId == groupId && m.Id == memberId);

            if (member == null)
                return NotFound();

            return Ok(member);
        }
        
        [HttpDelete("{memberId}")]
        public IActionResult DeleteMember(int groupId, int memberId)
        {
            var member = _context.Members
                .FirstOrDefault(m => m.GroupId == groupId && m.Id == memberId);

            if (member == null)
                return NotFound();

            _context.Members.Remove(member);
            _context.SaveChanges();

            return NoContent();
        }

        // GET: /groups/{groupId}/members
        [HttpGet]
        public async Task<ActionResult<IEnumerable<MemberBalanceDto>>> GetMembersWithBalance([FromRoute] int groupId)
        {
            var members = await _context.Members
                .Where(m => m.GroupId == groupId)
                .ToListAsync();

            var transactions = await _context.Transactions
                .Where(t => t.GroupId == groupId)
                .ToListAsync();

            var result = members.Select(m => new MemberBalanceDto
            {
                Id = m.Id,
                Name = m.Name,
                Balance = transactions
                    .Where(t => t.Id == m.Id)
                    .Sum(t => t.Amount)
            });

            return Ok(result);
        }
    }
}