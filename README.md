# Aequo
### Systematic Labor Law Analytics and Automated Legal Documentation

Aequo is a high-performance SaaS engine designed to eliminate manual calculation errors and technical ambiguity during labor conciliations. It transforms raw employment data into structured technical evidence, providing legal professionals with a unified interface to generate, manage, and export comparative reports between dismissal and resignation scenarios.

---

## Value Proposition

In the legal sector, technical precision is the primary source of authority. Aequo reduces the time required for complex labor liquidations by 80%, shifting the focus from arithmetic verification to strategic negotiation. The platform ensures that every calculation is backed by visible legal foundations and presented through a professional corporate identity.

* **High-fidelity comparison** of severance vs. settlement scenarios.
* **Dynamic branding engine** for custom logos, typography, and color schemes.
* **Cloud-based vault** for case persistence, search, and duplication.
* **Automatic legal validation** with integrated statutory references.

---

## Technical Infrastructure

The platform is built on a resilient, type-safe stack designed for data integrity and rapid execution:

* **Frontend**: Next.js 14 (App Router) utilizing TypeScript and Tailwind CSS for a minimalist, high-density UI.
* **Backend**: Supabase for PostgreSQL relational management, secure authentication, and object storage.
* **Document Engine**: Client-side rendering via jsPDF and html2canvas for instant, high-fidelity PDF generation.
* **Deployment**: Vercel infrastructure for global edge delivery and continuous integration.

---

## Architecture and Design Patterns

Aequo implements Clean Architecture to decouple legal logic from infrastructure details, ensuring the system remains adaptable to changing labor regulations.

1. **Domain Layer**: Contains the core labor law logic, calculation entities, and statutory rules.
2. **Application Layer**: Orchestrates use cases such as report generation and record management.
3. **Infrastructure Layer**: Handles external integrations including Supabase adapters and PDF services.
4. **Presentation Layer**: A reactive UI built with Atomic Design principles and a strict "Dark Mode" aesthetic.

### Logic Strategy
The system utilizes the **Strategy Pattern** to execute different calculation algorithms based on contract types, specific jurisdictions, or evolving labor codes without modifying the core codebase.

---

## Getting Started

This is a **Next.js** project bootstrapped with `create-next-app`. First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev


Open http://localhost:3000 with your browser to see the result. You can start editing the page by modifying app/page.tsx. The page auto-updates as you edit the file. This project uses next/font to automatically optimize and load Geist, a new font family for Vercel.