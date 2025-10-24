package server

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"go.uber.org/zap"
)

// WebhookPayload represents the data sent to the webhook
type WebhookPayload struct {
	OneTimeLink       string `json:"one_time_link"`
	DeliveryManager   string `json:"delivery_manager"`
	Timestamp         string `json:"timestamp"`
	ExpirationSeconds int32  `json:"expiration_seconds"`
	ClientIP          string `json:"client_ip"`
	SecretID          string `json:"secret_id"`
}

// SendWebhook sends the webhook payload with retry logic
func (y *Server) SendWebhook(payload WebhookPayload) error {
	if y.WebhookURL == "" {
		return fmt.Errorf("webhook URL not configured")
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal webhook payload: %w", err)
	}

	// Retry logic: 3 attempts with exponential backoff
	maxRetries := 3
	baseDelay := time.Second

	for attempt := 1; attempt <= maxRetries; attempt++ {
		client := &http.Client{
			Timeout: 30 * time.Second,
		}

		req, err := http.NewRequest("POST", y.WebhookURL, bytes.NewBuffer(jsonData))
		if err != nil {
			return fmt.Errorf("failed to create webhook request: %w", err)
		}

		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("User-Agent", "yopass-webhook/1.0")

		resp, err := client.Do(req)
		if err != nil {
			y.Logger.Warn("Webhook request failed",
				zap.Int("attempt", attempt),
				zap.Error(err),
				zap.String("webhook_url", y.WebhookURL),
			)
			
			if attempt == maxRetries {
				return fmt.Errorf("webhook failed after %d attempts: %w", maxRetries, err)
			}
			
			// Exponential backoff
			delay := time.Duration(attempt) * baseDelay
			time.Sleep(delay)
			continue
		}

		defer resp.Body.Close()

		// Read response body for logging
		body, _ := io.ReadAll(resp.Body)

		if resp.StatusCode >= 200 && resp.StatusCode < 300 {
			y.Logger.Info("Webhook delivered successfully",
				zap.Int("attempt", attempt),
				zap.Int("status_code", resp.StatusCode),
				zap.String("delivery_manager", payload.DeliveryManager),
				zap.String("secret_id", payload.SecretID),
			)
			return nil
		}

		y.Logger.Warn("Webhook returned error status",
			zap.Int("attempt", attempt),
			zap.Int("status_code", resp.StatusCode),
			zap.String("response_body", string(body)),
			zap.String("webhook_url", y.WebhookURL),
		)

		if attempt == maxRetries {
			return fmt.Errorf("webhook failed with status %d after %d attempts: %s", 
				resp.StatusCode, maxRetries, string(body))
		}

		// Exponential backoff
		delay := time.Duration(attempt) * baseDelay
		time.Sleep(delay)
	}

	return fmt.Errorf("webhook failed after %d attempts", maxRetries)
}

