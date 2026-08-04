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
