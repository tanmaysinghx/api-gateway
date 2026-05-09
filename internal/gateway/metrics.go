package gateway

import (
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	// HttpRequestsTotal tracks total requests by endpoint path, HTTP method, and response status
	HttpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "ts_gateway_requests_total",
			Help: "Total number of HTTP requests processed by TS API Gateway",
		},
		[]string{"path", "method", "status"},
	)

	// HttpRequestDuration tracks request latency
	HttpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "ts_gateway_request_duration_seconds",
			Help:    "Request latency histograms in seconds",
			Buckets: []float64{0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1.0, 2.5, 5.0, 10.0},
		},
		[]string{"path", "method", "status"},
	)

	// HttpActiveConnections tracks active concurrent sessions
	HttpActiveConnections = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "ts_gateway_active_connections",
			Help: "Current active concurrent connections processed by TS API Gateway",
		},
	)
)

// MetricsMiddleware tracks ingress request counts, response latency, and active sessions.
func MetricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Increment active connections
		HttpActiveConnections.Inc()
		defer HttpActiveConnections.Dec()

		start := time.Now()

		// Intercept the status code from ResponseWriter
		lrw := &loggingResponseWriter{ResponseWriter: w, statusCode: http.StatusOK}

		// Process request
		next.ServeHTTP(lrw, r)

		duration := time.Since(start).Seconds()
		status := strconv.Itoa(lrw.statusCode)

		// Record metrics
		// We use a simplified path mapping for labels to prevent high-cardinality issues
		pathLabel := getSimplifiedPath(r.URL.Path)

		HttpRequestsTotal.WithLabelValues(pathLabel, r.Method, status).Inc()
		HttpRequestDuration.WithLabelValues(pathLabel, r.Method, status).Observe(duration)
	})
}

// loggingResponseWriter is a helper to intercept status codes
type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (lrw *loggingResponseWriter) WriteHeader(code int) {
	lrw.statusCode = code
	lrw.ResponseWriter.WriteHeader(code)
}

func (lrw *loggingResponseWriter) Write(b []byte) (int, error) {
	return lrw.ResponseWriter.Write(b)
}

// getSimplifiedPath collapses dynamic IDs to prevent label blowup
func getSimplifiedPath(path string) string {
	if path == "/" {
		return "/"
	}
	if path == "/metrics" {
		return "/metrics"
	}
	if path == "/admin" || path == "/admin/" {
		return "/admin"
	}
	// Simple boundary prefix logic
	for _, prefix := range []string{"/api/auth", "/api/users", "/api/inventory", "/admin/api"} {
		if path == prefix || (len(path) > len(prefix) && path[len(prefix)] == '/') {
			return prefix + "/*"
		}
	}
	return "other"
}
