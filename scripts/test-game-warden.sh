#!/bin/bash

# Game Warden API Testing Script
# This script helps you test your Game Warden APIs with different scenarios

set -e

# Configuration
API_BASE_URL="${API_BASE_URL:-http://localhost:3000}"
JWT_TOKEN="${JWT_TOKEN:-}"
LOG_LEVEL="${LOG_LEVEL:-info}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if JWT token is provided
check_token() {
    if [ -z "$JWT_TOKEN" ]; then
        log_error "JWT_TOKEN environment variable is not set"
        log_info "Please set it with: export JWT_TOKEN='your-jwt-token-here'"
        exit 1
    fi
}

# Test function with response validation
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local headers=$5
    local data=$6

    log_info "Testing: $description"
    log_info "Endpoint: $method $endpoint"

    # Build curl command
    local curl_cmd="curl -s -w '\nHTTP_STATUS:%{http_code}\n' -X $method"
    curl_cmd="$curl_cmd '$API_BASE_URL$endpoint'"
    
    if [ ! -z "$headers" ]; then
        curl_cmd="$curl_cmd $headers"
    fi
    
    if [ ! -z "$data" ]; then
        curl_cmd="$curl_cmd -d '$data'"
    fi

    # Execute curl command
    local response=$(eval $curl_cmd)
    local http_status=$(echo "$response" | grep "HTTP_STATUS:" | cut -d':' -f2)
    local body=$(echo "$response" | sed '/HTTP_STATUS:/d')

    # Check if status matches expected
    if [ "$http_status" = "$expected_status" ]; then
        log_success "✓ Status $http_status (expected $expected_status)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    else
        log_error "✗ Status $http_status (expected $expected_status)"
        echo "$body" | jq . 2>/dev/null || echo "$body"
    fi

    echo ""
}

# Test public endpoints (no authentication required)
test_public_endpoints() {
    log_info "=== Testing Public Endpoints ==="
    
    test_endpoint "GET" "/auth/game-warden/public-info" "200" \
        "Public endpoint - no authentication required" \
        "-H 'Content-Type: application/json'"
}

# Test protected endpoints (authentication required)
test_protected_endpoints() {
    log_info "=== Testing Protected Endpoints ==="
    
    # Check if token is available
    check_token
    
    test_endpoint "GET" "/auth/game-warden/profile" "200" \
        "Profile endpoint - requires authentication" \
        "-H 'Authorization: Bearer $JWT_TOKEN' -H 'Content-Type: application/json'"
    
    test_endpoint "GET" "/auth/game-warden/groups" "200" \
        "Groups endpoint - requires developers or engineers group" \
        "-H 'Authorization: Bearer $JWT_TOKEN' -H 'Content-Type: application/json'"
    
    test_endpoint "GET" "/auth/game-warden/admin-only" "200" \
        "Admin-only endpoint - requires admin role" \
        "-H 'Authorization: Bearer $JWT_TOKEN' -H 'Content-Type: application/json'"
    
    test_endpoint "GET" "/auth/game-warden/customer-groups" "200" \
        "Customer groups endpoint - requires customers group" \
        "-H 'Authorization: Bearer $JWT_TOKEN' -H 'Content-Type: application/json'"
}

# Test token validation endpoint
test_token_validation() {
    log_info "=== Testing Token Validation ==="
    
    check_token
    
    # Test with the same token
    test_endpoint "POST" "/auth/game-warden/validate-token" "200" \
        "Token validation - validate current token" \
        "-H 'Authorization: Bearer $JWT_TOKEN' -H 'Content-Type: application/json'" \
        '{"token": "'$JWT_TOKEN'"}'
    
    # Test with invalid token
    test_endpoint "POST" "/auth/game-warden/validate-token" "200" \
        "Token validation - validate invalid token" \
        "-H 'Authorization: Bearer $JWT_TOKEN' -H 'Content-Type: application/json'" \
        '{"token": "invalid-token"}'
}

# Test error scenarios
test_error_scenarios() {
    log_info "=== Testing Error Scenarios ==="
    
    # Test without Authorization header
    test_endpoint "GET" "/auth/game-warden/profile" "401" \
        "Profile endpoint - no Authorization header" \
        "-H 'Content-Type: application/json'"
    
    # Test with invalid token
    test_endpoint "GET" "/auth/game-warden/profile" "401" \
        "Profile endpoint - invalid token" \
        "-H 'Authorization: Bearer invalid-token' -H 'Content-Type: application/json'"
    
    # Test with malformed Authorization header
    test_endpoint "GET" "/auth/game-warden/profile" "401" \
        "Profile endpoint - malformed Authorization header" \
        "-H 'Authorization: invalid-format' -H 'Content-Type: application/json'"
}

# Test JWT token structure
analyze_jwt_token() {
    log_info "=== Analyzing JWT Token ==="
    
    if [ -z "$JWT_TOKEN" ]; then
        log_warning "No JWT token provided for analysis"
        return
    fi
    
    # Check if jq is available
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed. Install it to analyze JWT tokens."
        return
    fi
    
    # Decode JWT payload (second part)
    local payload=$(echo "$JWT_TOKEN" | cut -d'.' -f2)
    
    # Add padding if needed
    local padding=$((4 - ${#payload} % 4))
    if [ $padding -ne 4 ]; then
        payload="${payload}$(printf '=%.0s' $(seq 1 $padding))"
    fi
    
    # Decode and pretty print
    log_info "JWT Token Payload:"
    echo "$payload" | base64 -d 2>/dev/null | jq . 2>/dev/null || {
        log_error "Failed to decode JWT payload"
        echo "Raw payload: $payload"
    }
    
    echo ""
}

# Health check
health_check() {
    log_info "=== Health Check ==="
    
    # Test if API is running
    local health_response=$(curl -s -w "%{http_code}" "$API_BASE_URL/health" -o /dev/null)
    
    if [ "$health_response" = "200" ]; then
        log_success "✓ API is running and healthy"
    else
        log_error "✗ API health check failed (status: $health_response)"
        exit 1
    fi
    
    echo ""
}

# Main function
main() {
    log_info "Starting Game Warden API Tests"
    log_info "API Base URL: $API_BASE_URL"
    log_info "Log Level: $LOG_LEVEL"
    
    if [ ! -z "$JWT_TOKEN" ]; then
        log_info "JWT Token: ${JWT_TOKEN:0:20}..."
    else
        log_warning "No JWT token provided - some tests will be skipped"
    fi
    
    echo ""
    
    # Run tests
    health_check
    test_public_endpoints
    test_protected_endpoints
    test_token_validation
    test_error_scenarios
    analyze_jwt_token
    
    log_success "All tests completed!"
}

# Help function
show_help() {
    echo "Game Warden API Testing Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -u, --url URL       Set API base URL (default: http://localhost:3000)"
    echo "  -t, --token TOKEN   Set JWT token"
    echo "  -l, --log LEVEL     Set log level (default: info)"
    echo ""
    echo "Environment Variables:"
    echo "  API_BASE_URL        API base URL"
    echo "  JWT_TOKEN           JWT token for authentication"
    echo "  LOG_LEVEL           Log level (info, debug, warn, error)"
    echo ""
    echo "Examples:"
    echo "  $0"
    echo "  $0 -u http://localhost:3000 -t 'your-jwt-token'"
    echo "  JWT_TOKEN='your-token' $0"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -u|--url)
            API_BASE_URL="$2"
            shift 2
            ;;
        -t|--token)
            JWT_TOKEN="$2"
            shift 2
            ;;
        -l|--log)
            LOG_LEVEL="$2"
            shift 2
            ;;
        *)
            log_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Run main function
main 