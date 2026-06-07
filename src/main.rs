mod ai;



#[tokio::main]
async fn main() {
    ai::ai().await;
}