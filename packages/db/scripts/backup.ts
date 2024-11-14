import { exec } from "node:child_process";
import { format } from "date-fns";

const backupDatabase = () => {
  const date = format(new Date(), "yyyy-MM-dd-HH-mm");
  const filename = `backup-${date}.sql`;
  const connectionString = process.env.POSTGRES_URL_NON_POOLING;

  if (!connectionString) {
    throw new Error("Database connection string not found");
  }

  const command = `pg_dump "${connectionString}" > "${filename}"`;

  exec(command, (error, _stdout, _stderr) => {
    if (error) {
      console.error(`Backup failed: ${error}`);
      return;
    }
    console.log(`Database backed up to ${filename}`);
  });
};

if (require.main === module) {
  backupDatabase();
}
