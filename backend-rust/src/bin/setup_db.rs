use libsql::Builder;
use std::env;
use dotenvy::dotenv;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenv().ok();

    let url = env::var("TURSO_DATABASE_URL").expect("TURSO_DATABASE_URL must be set");
    let token = env::var("TURSO_AUTH_TOKEN").expect("TURSO_AUTH_TOKEN must be set");

    println!("Connecting to Turso at {}...", url);

    let db = Builder::new_remote(url, token)
        .build()
        .await?;

    let conn = db.connect()?;

    println!("Reading schema file...");
    let schema = std::fs::read_to_string("../turso_schema.sql")?;

    println!("Applying schema...");
    // LibSQL batch execution
    conn.execute_batch(&schema).await?;

    println!("Schema applied successfully!");

    Ok(())
}
