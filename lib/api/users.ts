import { User, UserFilters, PaginationMeta } from "@/lib/types/user";

// Mock API function - will be replaced with actual backend call
export async function fetchUsers(
  filters: UserFilters,
  pagination: PaginationMeta
): Promise<{ users: User[]; pagination: PaginationMeta }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Mock data
  const mockUsers: User[] = [
    {
      _id: "1",
      name: "John Doe",
      email: "john@example.com",
      gender: "Male",
      country: "India",
      accountType: "Paid",
      subscriptionType: "Monthly",
      subscriptionEnd: "2025-01-31",
      subscriptionStart: "2024-12-31",
      registeredOn: "2024-10-12",
      createdAt: "2024-10-12T00:00:00.000Z",
      paymentMethod: "Credit Card",
      phone: "+91 9876543210",
      isOnline: true,
    },
    {
      _id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      gender: "Female",
      country: "USA",
      accountType: "Paid",
      subscriptionType: "Yearly",
      subscriptionEnd: "2025-12-31",
      subscriptionStart: "2024-12-31",
      registeredOn: "2024-09-15",
      createdAt: "2024-09-15T00:00:00.000Z",
      paymentMethod: "PayPal",
      phone: "+1 555-1234",
      isOnline: false,
    },
    {
      _id: "3",
      name: "Bob Johnson",
      email: "bob@example.com",
      gender: "Male",
      country: "UK",
      accountType: "Free",
      subscriptionType: "NA",
      registeredOn: "2024-11-20",
      createdAt: "2024-11-20T00:00:00.000Z",
      isOnline: true,
    },
    {
      _id: "4",
      name: "Alice Williams",
      email: "alice@example.com",
      gender: "Female",
      country: "Canada",
      accountType: "Paid",
      subscriptionType: "Monthly",
      subscriptionEnd: "2025-02-15",
      subscriptionStart: "2025-01-15",
      registeredOn: "2024-08-10",
      createdAt: "2024-08-10T00:00:00.000Z",
      paymentMethod: "Debit Card",
      phone: "+1 555-5678",
      isOnline: false,
    },
    {
      _id: "5",
      name: "Charlie Brown",
      email: "charlie@example.com",
      gender: "Other",
      country: "Australia",
      accountType: "Free",
      subscriptionType: "NA",
      registeredOn: "2024-12-01",
      createdAt: "2024-12-01T00:00:00.000Z",
      isOnline: true,
    },
  ];

  // Apply filters
  let filteredUsers = [...mockUsers];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower)
    );
  }

  if (filters.gender && filters.gender !== "all") {
    filteredUsers = filteredUsers.filter((u) => u.gender === filters.gender);
  }

  if (filters.country && filters.country !== "all") {
    filteredUsers = filteredUsers.filter((u) => u.country === filters.country);
  }

  if (filters.accountType && filters.accountType !== "all") {
    filteredUsers = filteredUsers.filter(
      (u) => u.accountType === filters.accountType
    );
  }

  if (filters.subscriptionType && filters.subscriptionType !== "all") {
    filteredUsers = filteredUsers.filter(
      (u) => u.subscriptionType === filters.subscriptionType
    );
  }

  if (filters.dateFrom) {
    filteredUsers = filteredUsers.filter(
      (u) => u.registeredOn && u.registeredOn >= filters.dateFrom!
    );
  }

  if (filters.dateTo) {
    filteredUsers = filteredUsers.filter(
      (u) => u.registeredOn && u.registeredOn <= filters.dateTo!
    );
  }

  // Apply pagination
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = startIndex + pagination.limit;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    pagination: {
      ...pagination,
      total: filteredUsers.length,
      totalPages: Math.ceil(filteredUsers.length / pagination.limit),
    },
  };
}

// Get unique countries from users (for filter dropdown)
export function getCountries(): string[] {
  return ["India", "USA", "UK", "Canada", "Australia", "Germany", "France"];
}

