using backend.Models;
using backend.Dtos;

namespace backend.Dtos
{
    public class GroupDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<MemberDto> Members { get; set; } = new List<MemberDto>();
    }

    public class MemberDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        // No Group reference here
    }

    public static class DtoMapper
    {
        public static GroupDto ToDto(Group group)
        {
            return new GroupDto
            {
                Id = group.Id,
                Name = group.Name,
                Members = group.Members?
                .Select(m => new MemberDto
                {
                    Id = m.Id,
                    Name = m.Name
                }).ToList() ?? new List<MemberDto>()
            };
            
        }
        public static TransactionDto ToDto(Transaction t)
        {
#pragma warning disable CS8602 // Dereference of a possibly null reference.
            return new TransactionDto{
                Id = t.Id,
                PayerId = t.PayerId,
                Payer = t.Payer ?? new(),
                Amount = t.Amount,
                divisiontype = t.DivisionType,
                Participants = t.Shares?.Select(p => new TransactionShareDto
                {
                    MemberId = p.MemberId,
                    Share = p.ShareAmount
                }).ToList() ?? new List<TransactionShareDto>()
            };
#pragma warning restore CS8602 // Dereference of a possibly null reference.
        }
            
        public static List<TransactionDto> ToDto(List<Transaction> transactions)
        {
            return transactions.Select(t => ToDto(t)).ToList();
        }
    }
}