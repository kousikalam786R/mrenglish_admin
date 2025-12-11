"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserFilters } from "@/lib/types/user";
import { Search, X } from "lucide-react";
import { getCountries } from "@/lib/api/users";

interface UserFiltersProps {
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onReset: () => void;
}

export function UserFiltersComponent({
  filters,
  onFiltersChange,
  onReset,
}: UserFiltersProps) {
  const countries = getCountries();

  const updateFilter = (key: keyof UserFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.gender ||
    filters.country ||
    filters.accountType !== "all" ||
    filters.subscriptionType !== "all" ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.search;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={filters.search || ""}
                onChange={(e) => updateFilter("search", e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Gender Filter */}
          <div>
            <Select
              value={filters.gender || "all"}
              onChange={(e) => updateFilter("gender", e.target.value)}
            >
              <option value="all">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </Select>
          </div>

          {/* Country Filter */}
          <div>
            <Select
              value={filters.country || "all"}
              onChange={(e) => updateFilter("country", e.target.value)}
            >
              <option value="all">All Countries</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </Select>
          </div>

          {/* Account Type Filter */}
          <div>
            <Select
              value={filters.accountType || "all"}
              onChange={(e) =>
                updateFilter("accountType", e.target.value as any)
              }
            >
              <option value="all">All Types</option>
              <option value="Free">Free</option>
              <option value="Paid">Paid</option>
            </Select>
          </div>

          {/* Subscription Type Filter */}
          <div>
            <Select
              value={filters.subscriptionType || "all"}
              onChange={(e) =>
                updateFilter("subscriptionType", e.target.value as any)
              }
            >
              <option value="all">All Subscriptions</option>
              <option value="Monthly">Monthly</option>
              <option value="Yearly">Yearly</option>
              <option value="NA">NA</option>
            </Select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Registration Date From
            </label>
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) => updateFilter("dateFrom", e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">
              Registration Date To
            </label>
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) => updateFilter("dateTo", e.target.value)}
            />
          </div>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <Button variant="outline" size="sm" onClick={onReset}>
              <X className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
