import * as path from 'path';

/**
 * Where uploaded files (school logos, etc.) live on disk.
 *
 * Set the UPLOADS_DIR env var to a Railway Volume mount path (e.g.
 * /data/uploads) so files survive redeploys. Without a volume attached,
 * this defaults to a path inside the container's own filesystem, which is
 * wiped every time the container redeploys — fine for testing, not for
 * production use.
 */
export const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');
