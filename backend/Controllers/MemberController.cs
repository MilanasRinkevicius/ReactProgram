using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/group/{groupId}/member")]
    public class MemberController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MemberController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/group/{groupId}/member
        [HttpPost]
        public async Task<IActionResult> AddMember(int groupId, [FromBody] Member member)
        {
            if (string.IsNullOrWhiteSpace(member.Name))
                return BadRequest("Name is required.");

            member.GroupId = groupId; // Ensure correct group assignment
            _context.Members.Add(member);
            await _context.SaveChangesAsync();
            return Ok(member);
        }

        // GET: api/group/{groupId}/member
        [HttpGet]
        public async Task<IActionResult> GetMembersByGroup(int groupId)
        {
            var members = _context.Members
                .Where(m => m.GroupId == groupId && m.IsActive)
                .ToList();
            return Ok(members);
        }

        // GET: api/group/{groupId}/member/all
        [HttpGet("all")]
        public async Task<IActionResult> GetAllMembersByGroup(int groupId)
        {
            var members = _context.Members
                .Where(m => m.GroupId == groupId)
                .ToList();
            return Ok(members);
        }

        // DELETE: api/group/{groupId}/member/{memberId}
        [HttpDelete("{memberId}")]
        public async Task<IActionResult> DeleteMember(int groupId, int memberId)
        {
            var member = await _context.Members.FindAsync(memberId);
            if (member == null || member.GroupId != groupId)
                return NotFound();

            member.IsActive = false; // Soft delete
            await _context.SaveChangesAsync();
            return NoContent();
        }

        // PATCH: api/group/{groupId}/member/{memberId}/settle
        [HttpPatch("{memberId}/settle")]
        public async Task<IActionResult> SettleMember(int groupId, int memberId)
        {
            var member = await _context.Members.FindAsync(memberId);
            if (member == null || member.GroupId != groupId)
                return NotFound();

            member.Balance = 0;
            await _context.SaveChangesAsync();
            return Ok(member);
        }
    }
}