# 📚 Library Reservation System

A modern, clean React Native (Expo) application for managing library book reservations with Hasura GraphQL backend.

## ✨ Features

- **📖 Book Catalog**: Browse and search available books
- **🔖 Smart Reservations**: Role-based reservation limits (Students: 5 books, Normal users: 3 books)
- **📱 Modern UI**: Clean, responsive design with dark/light theme support
- **🔄 Real-time Updates**: GraphQL-powered data synchronization
- **⚡ Policy Engine**: Extensible reservation rules system

## 🏗️ Architecture

### **Clean Architecture Principles**
- **Presentation Layer**: React Native components and screens
- **Service Layer**: Business logic and GraphQL operations
- **Policy Layer**: Extensible reservation rules (Open/Closed Principle)
- **Data Layer**: Apollo Client and GraphQL integration

### **SOLID Design Patterns**
- ✅ **Single Responsibility**: Each component has one clear purpose
- ✅ **Open/Closed**: Easy to extend with new user types and policies
- ✅ **Liskov Substitution**: Consistent interfaces across implementations
- ✅ **Interface Segregation**: Focused, clean service interfaces
- ✅ **Dependency Inversion**: High-level modules depend on abstractions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- Expo CLI
- Hasura GraphQL instance

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd CaseProject

# Install dependencies
npm install

# Start the development server
npm start
```

### Environment Setup
1. **Hasura Configuration**: Update `lib/apollo-client.ts` with your GraphQL endpoint
2. **Database Schema**: Ensure your Hasura instance has the required tables (books, users, reservations)
3. **Authentication**: Configure user authentication (currently using mock data)

## 📱 App Structure

### **Screens**
- **Books Tab**: Browse available books and make reservations
- **Reservations Tab**: View and manage your reservations
- **Profile Tab**: User information and reservation statistics

### **Components**
- `BookCard`: Individual book display with reservation functionality
- `ReservationCard`: Reservation status and management
- Navigation: Tab-based navigation with Expo Router

### **Services**
- `GraphQLService`: Handles all GraphQL operations
- `ReservationService`: Manages reservation business logic
- `ReservationPolicyService`: Enforces user role-based rules

## 🔧 Configuration

### **GraphQL Endpoint**
Update the Hasura endpoint in `lib/apollo-client.ts`:
```typescript
const HASURA_GRAPHQL_ENDPOINT = 'https://your-hasura-instance.hasura.app/v1/graphql';
```

### **Reservation Policies**
Modify reservation rules in `services/reservation-policy-service.ts`:
```typescript
// Students: 5 books for 14 days
// Normal users: 3 books for 7 days
```

## 📊 Database Schema

### **Required Tables**
```sql
-- Users table
users (id, email, name, user_type, created_at, updated_at)

-- Books table  
books (id, title, author, isbn, available, total_copies, available_copies)

-- Reservations table
reservations (id, user_id, book_id, reserved_at, expires_at, status)
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on all screen sizes
- **Theme Support**: Automatic dark/light mode switching
- **Loading States**: Smooth loading and error handling
- **Pull-to-Refresh**: Easy data refresh
- **Status Indicators**: Clear visual feedback for availability

## 🧪 Testing

```bash
# Run TypeScript compilation check
npx tsc --noEmit

# Run linting
npm run lint

# Start development server
npm start
```

## 🔮 Future Enhancements

- [ ] User authentication and authorization
- [ ] Push notifications for reservation reminders
- [ ] Book search and filtering
- [ ] Reservation history and analytics
- [ ] Admin panel for librarians
- [ ] Offline support with local caching

## 📝 Code Quality

- **TypeScript**: Full type safety throughout the application
- **ESLint**: Code quality and consistency enforcement
- **Clean Code**: Meaningful naming, no magic numbers
- **Documentation**: Comprehensive JSDoc comments

## 🤝 Contributing

1. Follow the established architecture patterns
2. Maintain SOLID principles
3. Add proper TypeScript types
4. Include error handling
5. Test thoroughly before submitting

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ using React Native, Expo, and Hasura GraphQL**
