using backend.Models; 

namespace backend.Dtos
{
    public class TransactionDto{
    public int Id {get; set; }
    public int? PayerId { get; set; }
    public Member Payer { get; set; } = new();
    public decimal Amount { get; set; }
    public DivisionType? divisiontype { get; set; }
    public List<TransactionShareDto> Participants{get;set;} = new();
    }
}