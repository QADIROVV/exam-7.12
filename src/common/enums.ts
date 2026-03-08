export enum UserRole {
  JOBSEEKER = 'jobseeker',
  EMPLOYER  = 'employer',
  ADMIN     = 'admin',
}

export enum UserStatus {
  ACTIVE   = 'active',
  INACTIVE = 'inactive',
  BANNED   = 'banned',
}

export enum VacancyStatus {
  DRAFT     = 'draft',
  PUBLISHED = 'published',
  CLOSED    = 'closed',
}

export enum EmploymentType {
  FULL_TIME  = 'full_time',
  PART_TIME  = 'part_time',
  CONTRACT   = 'contract',
  INTERNSHIP = 'internship',
  REMOTE     = 'remote',
  FREELANCE  = 'freelance',
}

export enum ExperienceLevel {
  NO_EXPERIENCE = 'no_experience',
  JUNIOR        = 'junior',
  MIDDLE        = 'middle',
  SENIOR        = 'senior',
  LEAD          = 'lead',
}

export enum Currency {
  UZS = 'UZS',
  USD = 'USD',
  EUR = 'EUR',
}

export enum ResumeStatus {
  DRAFT     = 'draft',
  PUBLISHED = 'published',
  HIDDEN    = 'hidden',
}

export enum ApplicationStatus {
  PENDING  = 'pending',
  VIEWED   = 'viewed',
  INVITED  = 'invited',
  REJECTED = 'rejected',
  HIRED    = 'hired',
}
