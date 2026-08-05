import { randomBytes } from "node:crypto";
import { pool } from "../db/pool.js";
import { HttpError } from "../middleware/httpError.js";

function generateProductKey() {
  const block = () => randomBytes(3).toString("hex").toUpperCase();
  return `GS-${block()}-${block()}-${block()}-${block()}`;
}

export async function createCustomer(name: string, contactEmail?: string, contactPhone?: string) {
  const result = await pool.query(
    `INSERT INTO customers (name, contact_email, contact_phone)
     VALUES ($1, $2, $3)
     RETURNING id, name, contact_email, contact_phone, created_at`,
    [name, contactEmail || null, contactPhone || null]
  );
  return result.rows[0];
}

export async function generateLicense(params: {
  customerId: number;
  productName: string;
  maxMachines: number;
  validDays: number;
}) {
  const customer = await pool.query("SELECT id FROM customers WHERE id = $1", [params.customerId]);
  if (!customer.rowCount) {
    throw new HttpError(404, "Customer not found");
  }

  const licenseKey = generateProductKey();
  const result = await pool.query(
    `INSERT INTO licenses (customer_id, product_name, license_key, status, max_machines, expires_at)
     VALUES ($1, $2, $3, 'active', $4, NOW() + ($5 || ' days')::interval)
     RETURNING id, customer_id, product_name, license_key, status, max_machines, expires_at, created_at`,
    [params.customerId, params.productName, licenseKey, params.maxMachines, String(params.validDays)]
  );

  return result.rows[0];
}

export async function validateActivation(params: {
  licenseKey: string;
  machineId: string;
  appVersion?: string;
}) {
  const licenseResult = await pool.query(
    `SELECT l.id,
            l.license_key,
            l.status,
            l.max_machines,
            l.expires_at,
            c.name AS customer_name
     FROM licenses l
     INNER JOIN customers c ON c.id = l.customer_id
     WHERE l.license_key = $1`,
    [params.licenseKey]
  );

  if (!licenseResult.rowCount) {
    return { ok: false, allowed: false, reason: "License key not found" };
  }

  const license = licenseResult.rows[0];

  if (license.status !== "active") {
    return { ok: true, allowed: false, reason: `License is ${license.status}` };
  }

  if (license.expires_at && new Date(license.expires_at).getTime() < Date.now()) {
    return { ok: true, allowed: false, reason: "License expired" };
  }

  const existingActivation = await pool.query(
    `SELECT id
     FROM license_activations
     WHERE license_id = $1 AND machine_id = $2`,
    [license.id, params.machineId]
  );

  if (!existingActivation.rowCount) {
    const machineCount = await pool.query(
      `SELECT COUNT(*)::int AS count
       FROM license_activations
       WHERE license_id = $1 AND is_active = true`,
      [license.id]
    );

    if (machineCount.rows[0].count >= license.max_machines) {
      return {
        ok: true,
        allowed: false,
        reason: "Machine activation limit reached"
      };
    }

    await pool.query(
      `INSERT INTO license_activations (license_id, machine_id, app_version)
       VALUES ($1, $2, $3)`,
      [license.id, params.machineId, params.appVersion || null]
    );
  } else {
    await pool.query(
      `UPDATE license_activations
       SET is_active = true,
           app_version = COALESCE($3, app_version),
           last_seen_at = NOW()
       WHERE license_id = $1 AND machine_id = $2`,
      [license.id, params.machineId, params.appVersion || null]
    );
  }

  return {
    ok: true,
    allowed: true,
    reason: "License is valid",
    customerName: license.customer_name,
    checkAgainAfterMinutes: 1440
  };
}

export async function listCustomers() {
  const result = await pool.query(
    `SELECT id, name, contact_email, contact_phone, created_at
     FROM customers ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getCustomerById(id: number) {
  const result = await pool.query(
    `SELECT id, name, contact_email, contact_phone, created_at FROM customers WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function listLicenses() {
  const result = await pool.query(
    `SELECT l.id, l.license_key, l.product_name, l.status, l.max_machines,
            l.expires_at, l.created_at, c.name AS customer_name, c.id AS customer_id,
            COALESCE(a.active_count, 0)::int AS active_machine_count
     FROM licenses l
     INNER JOIN customers c ON c.id = l.customer_id
     LEFT JOIN (
       SELECT license_id, COUNT(*) AS active_count
       FROM license_activations WHERE is_active = true GROUP BY license_id
     ) a ON a.license_id = l.id
     ORDER BY l.created_at DESC`
  );
  return result.rows;
}

export async function getLicenseWithActivations(id: number) {
  const licResult = await pool.query(
    `SELECT l.id, l.license_key, l.product_name, l.status, l.max_machines,
            l.expires_at, l.created_at, l.updated_at, c.name AS customer_name, c.id AS customer_id
     FROM licenses l
     INNER JOIN customers c ON c.id = l.customer_id
     WHERE l.id = $1`,
    [id]
  );
  if (!licResult.rowCount) return null;

  const activations = await pool.query(
    `SELECT id, machine_id, app_version, is_active, first_activated_at, last_seen_at
     FROM license_activations WHERE license_id = $1 ORDER BY last_seen_at DESC`,
    [id]
  );
  return { ...licResult.rows[0], activations: activations.rows };
}

export async function updateLicenseStatus(id: number, status: string) {
  const allowed = ["active", "suspended", "cancelled"];
  if (!allowed.includes(status)) throw new HttpError(400, "Invalid status value");

  const result = await pool.query(
    `UPDATE licenses SET status = $1, updated_at = NOW() WHERE id = $2
     RETURNING id, license_key, status, updated_at`,
    [status, id]
  );
  if (!result.rowCount) throw new HttpError(404, "License not found");
  return result.rows[0];
}

export async function deleteCustomer(id: number) {
  const result = await pool.query(`DELETE FROM customers WHERE id = $1 RETURNING id`, [id]);
  if (!result.rowCount) throw new HttpError(404, "Customer not found");
}

export async function deleteLicense(id: number) {
  const result = await pool.query(`DELETE FROM licenses WHERE id = $1 RETURNING id`, [id]);
  if (!result.rowCount) throw new HttpError(404, "License not found");
}

export async function getDashboardStats() {
  const [custResult, licResult, actResult] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS total FROM customers`),
    pool.query(`SELECT status, COUNT(*)::int AS total FROM licenses GROUP BY status`),
    pool.query(`SELECT COUNT(*)::int AS total FROM license_activations WHERE is_active = true`)
  ]);

  const byStatus: Record<string, number> = {};
  for (const row of licResult.rows) byStatus[row.status as string] = row.total as number;

  return {
    totalCustomers: custResult.rows[0].total as number,
    totalLicenses: licResult.rows.reduce((s: number, r) => s + (r.total as number), 0),
    activeLicenses: byStatus["active"] ?? 0,
    suspendedLicenses: byStatus["suspended"] ?? 0,
    expiredLicenses: byStatus["expired"] ?? 0,
    cancelledLicenses: byStatus["cancelled"] ?? 0,
    totalActiveMachines: actResult.rows[0].total as number
  };
}

export async function getLicenseStatus(licenseKey: string) {
  const result = await pool.query(
    `SELECT l.id,
            l.license_key,
            l.status,
            l.product_name,
            l.max_machines,
            l.expires_at,
            l.created_at,
            c.name AS customer_name,
            COALESCE(a.active_count, 0)::int AS active_machine_count
     FROM licenses l
     INNER JOIN customers c ON c.id = l.customer_id
     LEFT JOIN (
       SELECT license_id, COUNT(*) AS active_count
       FROM license_activations
       WHERE is_active = true
       GROUP BY license_id
     ) a ON a.license_id = l.id
     WHERE l.license_key = $1`,
    [licenseKey]
  );

  if (!result.rowCount) {
    throw new HttpError(404, "License not found");
  }

  return result.rows[0];
}
