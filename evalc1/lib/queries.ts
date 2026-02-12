import { pool } from './db';

export interface BookRow {
  id: number;
  title: string;
  author: string;
  category: string;
  total_loans: string;
  rank_position: string;
}

export interface OverdueRow {
  member_id: number;
  member_name: string;
  loan_id: number;
  title: string;
  due_at: Date;
  days_overdue: number;
  suggested_fine: number;
}

export interface FineRow {
  month: string;
  total_fines: number;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  payment_rate: number;
}

export interface MemberActivityRow {
  id: number;
  name: string;
  email: string;
  member_type: string;
  total_loans: number;
  overdue_loans: number;
  overdue_rate: number;
  status: string;
}

export interface InventoryRow {
  category: string;
  total_copies: number;
  available: number;
  on_loan: number;
  lost: number;
  availability_percent: number;
  health_status: string;
}

export async function getBooksData(page: number, search?: string) {
  const limit = 2;
  const validPage = Math.max(1, page);
  const offset = (validPage - 1) * limit;
  const safeSearch = search?.trim() || '';

  let query = 'SELECT * FROM vw_most_borrowed_books';
  let countQuery = 'SELECT COUNT(*) FROM vw_most_borrowed_books';
  
  const params: any[] = [];

  if (safeSearch) {
    const searchPattern = `%${safeSearch}%`;
    const filter = ` WHERE title ILIKE $1 OR author ILIKE $2`;
    query += filter;
    countQuery += filter;
    params.push(searchPattern, searchPattern);
  }

  const nextIdx = params.length + 1;
  query += ` ORDER BY rank_position LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`;
  params.push(limit, offset);

  const result = await pool.query<BookRow>(query, params);
  const countResult = await pool.query(countQuery, safeSearch ? [params[0], params[1]] : []);
  const total = parseInt(countResult.rows[0].count);

  console.log('DEBUG getBooksData:', { total, rows: result.rows.length, totalPages: Math.ceil(total / limit) });

  return { rows: result.rows, total, limit };
}

export async function getOverdueData(page: number, minDays?: string) {
  const limit = 2;
  const validPage = Math.max(1, page);
  const offset = (validPage - 1) * limit;
  const days = parseInt(minDays || '0') || 0;
  
  let query = 'SELECT * FROM vw_overdue_loans';
  let countQuery = 'SELECT COUNT(*) FROM vw_overdue_loans';
  const params: any[] = [];
  
  if (days > 0) {
    query += ` WHERE days_overdue >= $1`;
    countQuery += ` WHERE days_overdue >= $1`;
    params.push(days);
  }
  
  const nextIdx = params.length + 1;
  query += ` ORDER BY days_overdue DESC LIMIT $${nextIdx} OFFSET $${nextIdx + 1}`;
  params.push(limit, offset);
  
  const result = await pool.query<OverdueRow>(query, params);
  const countResult = await pool.query(countQuery, days > 0 ? [days] : []);
  const total = parseInt(countResult.rows[0].count);
  
  return { rows: result.rows, total, limit };
}

export async function getFinesData(month?: string) {
  let query = 'SELECT * FROM vw_fines_summary';
  const params: string[] = [];
  
  if (month) {
    query += ' WHERE month = $1';
    params.push(month);
  }
  
  query += ' ORDER BY month DESC';
  
  const result = await pool.query<FineRow>(query, params);
  return result.rows;
}

export async function getMemberActivity() {
  const result = await pool.query<MemberActivityRow>('SELECT * FROM vw_member_activity');
  return result.rows;
}

export async function getInventoryHealth() {
  const result = await pool.query<InventoryRow>('SELECT * FROM vw_inventory_health');
  return result.rows;
}