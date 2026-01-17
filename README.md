# Centify Case Study - Senior Full Stack Developer

## Overview

Build a simplified version of Centify, a commission management and sales performance tracking platform. This case study should take approximately **6 hours** to complete and demonstrate full-stack development capabilities.

## Product Context

Centify helps sales organizations:

- Track deals and sales performance
- Create incentive plans (commission structures) for sales reps
- Calculate commissions based on deals and incentive plans
- Monitor earnings and payouts
- Manage sales team members

## Scope & Requirements

### Core Features to Implement

#### 1. **Deals Management** (2 hours)

**Backend:**

- REST API endpoints for CRUD operations on deals
- Store deal information: name, value (revenue amount), close date
- Support multi-tenancy (organization scoping)
- Support splitting deal value between multiple owners:
  - Each deal can have multiple owners
  - Each owner has a split percentage (e.g., 60% of the deal value)
  - Sum of all split percentages for a deal must equal 100%
- Basic validation:
  - At least one owner required per deal
  - Split percentages must sum to exactly 1.0 (100%)
  - Each split percentage must be between 0 and 1
- Error handling

**Frontend:**

- Deals list page with table view
- Create/Edit deal form (modal or separate page)
- Deal split management:
  - Add/remove multiple owners per deal
  - Set split percentage for each owner
  - Visual indicator showing total split percentage (must equal 100%)
  - Display all owners and their percentages
- Display: Deal name, value, close date, owners (with percentages)
- Basic filtering by owner
- Responsive design

#### 2. **Employees Management** (0.5 hours)

**Backend:**

- REST API endpoints for listing employees
- Store employee information: first name, last name, email
- Support multi-tenancy (organization scoping)
- Simple GET endpoint (no CRUD needed for case study)

**Frontend:**

- Employee dropdown/select in deal form
- Display employee name in deals table

#### 3. **Incentives Management** (2.5 hours)

**Backend:**

- REST API endpoints for CRUD operations on incentives
- Store incentive information:
  - Name, description
  - Type: `DEAL_PARTICIPATION` (only this type for simplicity)
  - Base commission percentage (e.g., 10%)
  - Start date, end date (optional)
  - Status: `ACTIVE`, `DRAFT`, or `INACTIVE`
- Support multi-tenancy (organization scoping)
- Link incentives to multiple employees (beneficiaries who are eligible for commission)
- Basic validation:
  - End date must be after start date (if provided)
  - Commission percentage must be between 0 and 1
  - At least one beneficiary (employee) must be assigned

**Frontend:**

- Incentives list page
- Create/Edit incentive form with:
  - Basic details (name, description, dates, status)
  - Commission percentage input
  - Multi-select for beneficiaries (employees)
- Display: Incentive name, commission %, date range, status, beneficiary count
- Link incentives to employees

#### 4. **Earnings Calculation** (1 hour)

**Backend:**

- Calculate earnings for each employee based on deals and active incentives
- Endpoint: `GET /api/org/:orgId/earnings`
- Logic:
  - For each deal with a close date within an active incentive's date range
  - For each owner of the deal:
    - If the owner is a beneficiary of the incentive
    - Calculate earnings: `deal.value × owner's split percentage × incentive commission percentage`
    - This accounts for the owner's share of the deal
  - Sum all earnings per employee per incentive
- Return: Employee ID, employee name, incentive ID, incentive name, total earnings, deal count, total deal value

**Frontend:**

- Earnings dashboard/table
- Display: Employee name, incentive name, total earnings, deal count, total revenue
- Format currency properly
- Group by employee or incentive (toggle or tabs)

### Technical Requirements

#### Backend Stack

- **Framework**: Express.js or Fastify
- **Database**: PostgreSQL with Prisma ORM (or TypeORM/Sequelize)
- **Language**: TypeScript
- **Validation**: Zod or similar
- **API**: RESTful endpoints with JSON responses

#### Frontend Stack

- **Framework**: React with TypeScript
- **UI Library**: Tailwind CSS (or similar utility-first CSS)
- **State Management**: React Query / TanStack Query (or Context API)
- **Table Component**: TanStack Table (or similar)
- **HTTP Client**: Axios or fetch
- **Build Tool**: Vite or Create React App

#### Database Design

You are responsible for designing the database schema. Consider:

- Multi-tenancy support (organizations)
- Relationships between entities (deals, employees, incentives)
- Many-to-many relationships (deals ↔ employees with splits, incentives ↔ employees)
- Data integrity constraints
- Appropriate indexes for query performance
- Timestamps for audit trails

### Deliverables

1. **Working Application**

   - Backend API running locally
   - Frontend application running locally
   - Database with seed data:
     - At least 3-4 employees
     - 8-12 deals (with various owners and split percentages, some deals with multiple owners)
     - 2-3 active incentives (with different beneficiaries and commission rates)

2. **Code Quality**

   - Clean, readable code
   - TypeScript types properly defined
   - Basic error handling
   - Consistent code style

3. **Documentation**
   - README with setup instructions
   - API endpoint documentation (can be inline comments or simple markdown)
   - Brief explanation of architectural decisions
   - Database schema documentation (explain your design choices)

### Evaluation Criteria

1. **Functionality** (40%)

   - All core features implemented and working
   - Data flows correctly between frontend and backend
   - Earnings calculations are accurate (accounting for deal splits)
   - Incentive-to-employee relationships work correctly
   - Deal splits are properly validated and calculated

2. **Code Quality** (30%)

   - Clean, maintainable code
   - Proper TypeScript usage
   - Error handling
   - Code organization
   - Database schema design and relationships properly modeled

3. **User Experience** (20%)

   - Intuitive UI
   - Responsive design
   - Good visual feedback
   - Clear display of commission calculations

4. **Technical Decisions** (10%)
   - Appropriate technology choices
   - Database schema design (especially many-to-many relationships and data integrity)
   - API design
   - Calculation logic correctness

### Out of Scope (Don't Implement)

- CRM integrations (HubSpot, Salesforce, etc.)
- Complex commission calculations (tiers, accelerators, etc.)
- Multiple incentive types (only DEAL_PARTICIPATION)
- Clawbacks and adjustments
- Targets/quotas
- Advanced filtering/search
- Pagination (can use simple lists)
- Real-time updates
- File uploads
- Email notifications
- Authentication (assume organizationId is passed as a parameter or header)
- Payout management
- Commission adjustments/rules

### Getting Started

1. Set up project structure (monorepo or separate repos)
2. Initialize database and run migrations
3. Create seed data (employees, deals with splits, incentives with beneficiaries)
4. Build backend API endpoints
5. Build frontend pages
6. Implement deal split management UI
7. Implement earnings calculation (accounting for splits)
8. Test end-to-end flow (create incentive → assign beneficiaries → create deals with splits → view earnings)
9. Write documentation

### Bonus Points (Optional)

- Unit tests for critical logic (earnings calculation)
- Docker setup for easy running
- Basic data validation on frontend
- Loading states and error messages
- Date formatting and currency formatting
- Visual representation of earnings (charts or graphs)
- Filter earnings by incentive or employee
