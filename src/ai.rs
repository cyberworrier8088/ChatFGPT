///////////////////////////////////////////////////////////////////////////////////////
// ai.rs
///////////////////////////////////////////////////////////////////////////////////////

// this is made for fun.
// this using hack club api
/// Chat fake GPP

//  enjoy My code :)





use axum::{
    extract::Json,
    http::StatusCode,
    response::IntoResponse,
    routing::post,
    Router,
};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tower_http::services::ServeDir;

#[derive(Deserialize)]
struct ChatRequest {
    message: String,
    api_key: String,
    model: String,
    mode: String,
}

#[derive(Serialize)]
struct ChatResponse {
    response: String,
    image_url: String,
}

async fn chat(Json(req): Json<ChatRequest>) -> impl IntoResponse {
    let client = reqwest::Client::new();

    // IMAGE MODE (Replicate)
    if req.mode == "image" {
        let response = match client
            .post("https://ai.hackclub.com/proxy/v1/replicate/models/retro-diffusion/rd-plus/predictions")
            .bearer_auth(&req.api_key)
            .header("Prefer", "wait")
            .json(&json!({
                "input": {
                    "style": "classic",
                    "width": 128,
                    "height": 128,
                    "prompt": req.message,
                    "tile_x": false,
                    "tile_y": false,
                    "strength": 0.8,
                    "remove_bg": false,
                    "num_images": 1,
                    "bypass_prompt_expansion": false
                }
            }))
            .send()
            .await
        {
            Ok(resp) => resp,
            Err(e) => {
                eprintln!("Image API request failed: {e}");
                return (
                    StatusCode::BAD_GATEWAY,
                    Json(ChatResponse {
                        response: format!("Failed to reach image API: {e}"),
                        image_url: String::new(),
                    }),
                );
            }
        };

        let body: Value = match response.json().await {
            Ok(json) => json,
            Err(e) => {
                eprintln!("Failed to parse image API response: {e}");
                return (
                    StatusCode::BAD_GATEWAY,
                    Json(ChatResponse {
                        response: format!("Invalid response from image API: {e}"),
                        image_url: String::new(),
                    }),
                );
            }
        };

        println!("{:#}", body);

        let image_url = body["output"][0]
            .as_str()
            .unwrap_or("")
            .to_string();

        return (
            StatusCode::OK,
            Json(ChatResponse {
                response: "Image generated!".to_string(),
                image_url,
            }),
        );
    }

    // CHAT MODE (Hack Club AI)
    let response = match client
        .post("https://ai.hackclub.com/proxy/v1/chat/completions")
        .bearer_auth(&req.api_key)
        .json(&json!({
            "model": req.model,
            "messages": [
                {
                    "role": "user",
                    "content": req.message
                }
            ]
        }))
        .send()
        .await
    {
        Ok(resp) => resp,
        Err(e) => {
            eprintln!("Chat API request failed: {e}");
            return (
                StatusCode::BAD_GATEWAY,
                Json(ChatResponse {
                    response: format!("Failed to reach chat API: {e}"),
                    image_url: String::new(),
                }),
            );
        }
    };

    println!("Status: {}", response.status());

    let body: Value = match response.json().await {
        Ok(json) => json,
        Err(e) => {
            return (
                StatusCode::BAD_GATEWAY,
                Json(ChatResponse {
                    response: format!("Invalid response from chat API: {e}"),
                    image_url: String::new(),
                }),
            );
        }
    };

    let answer = body["choices"][0]["message"]["content"]
        .as_str()
        .unwrap_or("No response")
        .to_string();

    (
        StatusCode::OK,
        Json(ChatResponse {
            response: answer,
            image_url: String::new(),
        }),
    )
}

pub async fn ai() {
    let app = Router::new()
        .route("/chat", post(chat))
        .fallback_service(ServeDir::new("static"));

    // this for publc Deploying
    let port = std::env::var("PORT").unwrap_or("3000".to_string());
    
    let listener = tokio::net::TcpListener::bind(
        format!("0.0.0.0:{}", port)
    )
.await
.unwrap();

    println!("Server running at working");

    axum::serve(listener, app).await.unwrap();
}