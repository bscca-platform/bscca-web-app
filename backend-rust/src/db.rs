use libsql::Builder;
use std::env;
use anyhow::Result;

pub struct Database {
    db: libsql::Database,
}

impl Database {
    pub async fn init() -> Result<Self> {
        let url = env::var("TURSO_DATABASE_URL")
            .expect("TURSO_DATABASE_URL must be set");
        let token = env::var("TURSO_AUTH_TOKEN")
            .expect("TURSO_AUTH_TOKEN must be set");

        let db = Builder::new_remote(url, token)
            .build()
            .await?;

        // Verify connectivity on startup
        let _test = db.connect()?;

        Ok(Self { db })
    }

    /// Create a fresh connection for each request to avoid
    /// Hrana "generation mismatch" errors on concurrent access.
    pub fn conn(&self) -> Result<libsql::Connection> {
        Ok(self.db.connect()?)
    }
}
