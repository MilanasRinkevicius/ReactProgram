using System;
using System.Collections.Generic;
using backend.Dtos;

namespace backend.Dtos
{
    
    public class TransactionCreateDto
    {
        public int Id {get; set; }
        public int PayerId { get; set; }
        public decimal Amount { get; set; }
        public List<TransactionShareDto> Participants { get; set; } = new();
    }
}
