use axum::{
    extract::Json,
    response::IntoResponse,
    routing::post,
    Router,
};

use serde::{Deserialize, Serialize};
use tower_http::services::ServeDir;
use serde_json::Value;

#[derive(Deserialize)]
struct ChatRequest {
    message: String,
    api_key: String,
}

#[derive(Serialize)]
struct ChatResponse {
    response: String,
}

#[derive(Serialize)]
struct Message {
    role: String,
    content: String,
}

#[derive(Serialize)]
struct ApiRequest {
    model: String,
    messages: Vec<Message>,
}

async fn chat(Json(req): Json<ChatRequest>) -> impl IntoResponse {
    let client = reqwest::Client::new();

    let body = ApiRequest {
        model: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free".to_string(),
        messages: vec![Message {
            role: "user".to_string(),
            content: req.message,
        }],
    };

    let response = client
        .post("https://ai.hackclub.com/proxy/v1/chat/completions")
        .bearer_auth(&req.api_key)
        .json(&body)
        .send()
        .await
        .unwrap();

    let body: Value = response.json().await.unwrap();

    let answer = body["choices"][0]["message"]["content"].as_str().unwrap_or("No reponse").to_string();



    Json(ChatResponse {
        response: answer,
    })
}

pub async fn ai() {
    let app = Router::new()
        .route("/chat", post(chat))
        .fallback_service(ServeDir::new("static"));

    let listener = tokio::net::TcpListener::bind("127.0.0.1:3000")
        .await
        .unwrap();

    println!("Server running at http://127.0.0.1:3000");

    axum::serve(listener, app).await.unwrap();
}