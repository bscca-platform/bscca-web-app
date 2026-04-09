use libsql::Builder;
use std::env;
use anyhow::Result;

pub struct Database {
    pub client: libsql::Connection,
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
        
        let client = db.connect()?;
        
        Ok(Self { client })
    }
}
