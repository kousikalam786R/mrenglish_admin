export interface User {
  _id: string;
  email: string;
  name: string;
  bio?: string;
  age?: number;
  gender?: "Male" | "Female" | "Other" | "Prefer not to say";
  country?: string;
  nativeLanguage?: string;
  englishLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  preferredLanguage?: string;
  interests?: string[];
  profilePic?: string;
  profilePicThumbnail?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
  lastLoginAt?: string;
  createdAt?: string;
  registeredOn?: string; // Registration date
  notificationsEnabled?: boolean;
  phone?: string;
  // Subscription details
  accountType?: "Free" | "Paid";
  subscriptionType?: "Monthly" | "Yearly" | "NA";
  subscriptionEnd?: string; // Subscription end date
  subscriptionStart?: string; // Subscription start date
  paymentMethod?: string;
  // Legacy field for backward compatibility
  subscriptionStatus?: "paid" | "free";
  // Institute student (when managed by an institute)
  instituteId?: string;
}

export interface UserFilters {
  gender?: string;
  country?: string;
  accountType?: "Free" | "Paid" | "all";
  subscriptionType?: "Monthly" | "Yearly" | "all";
  subscriptionStatus?: "paid" | "free" | "all"; // Legacy
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationMeta;
}

