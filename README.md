# ReactProgram
# 💸 Group Expense Tracker

This application was created as a practical assignment and is designed to help users track shared group expenses, 
split amounts among members, and calculate each member’s balance. It is ideal for friend groups, trips, or joint projects.

---

## 📦 Project Structure

- **Frontend**: React + TypeScript / HTML + CSS
- **Backend**: ASP.NET Core + InMemory DB
- **API**: RESTful
- **UI**: Simple, clean, and intuitive interface design

---

## ✅ Features

### **Group Management**:
- Create a new group
- Display existing groups
- Delete a group
- Calculate group balance

### **Group Member Management**:
- Add a new member to a group
- Delete a group member (only if their balance is not below 0)
- Display group members
- Calculate each member's balance

### **Transaction Logging**:
- Add a new transaction (expense or income)
- Choose who paid
- Select how expenses are split (equally, by percentage, or manually)
- Improved logic:
  - Payer does not pay for themselves
  - Total share cannot exceed 100% or the full amount
  - Dynamic total summary display
  - Automatic recalculation of balances
  - Accurate debt logic: who owes whom and how much

---

## 🛠️ Technologies Used

- **Frontend**: HTML, CSS, JavaScript, React
- **Backend**: ASP.NET Core
- **Data Storage**: InMemory DB / LocalStorage

---

## 🚀 Installation / Usage

### Backend (.NET):
```bash
cd backend
dotnet run
```

### Frontend (React):
```bash
cd frontend
npm install
npm start
```

Or simply:
1. Clone the project:
```bash
git clone https://github.com/username/project.git
```

2. Open `index.html` in your browser (if using pure JS)

3. Use the interface to create groups, add members, and track expenses.

⚠️ If some features do not work, check your browser's Developer Console for errors.

---

## ⚠️ Known Issues

- No data persistence between server restarts (InMemory DB)
- User authentication not implemented
- Some balance features still under development
- Display bugs after multiple transactions (e.g., wrong ID reference)

---

## 👤 Author

**Milanas Rinkevičius**  
📧 milanas.rinkevicius@ktu.edu / milanasrink@gmail.com
