using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GroupController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GroupController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] Group group)
        {
            if (string.IsNullOrWhiteSpace(group.Title))
                return BadRequest("Title is required.");

            // Ensure defaults for optional properties
            if (group.Payer == null)
                group.Payer = new Member();
            if (group.Members == null)
                group.Members = new List<Member>();
            if (group.Transactions == null)
                group.Transactions = new List<Transaction>();

            _context.Groups.Add(group);
            await _context.SaveChangesAsync();
            return Ok(group);
        }
        [HttpGet]
        public async Task<IActionResult> GetGroups()
        {
            var groups = await _context.Groups.ToListAsync();
            return Ok(groups);
        }
    }
}