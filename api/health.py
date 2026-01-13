#!/usr/bin/env python3
"""Health check endpoint for Vercel."""

import json
import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))


def handler(req):
    """Health check handler."""
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json'},
        'body': json.dumps({
            'status': 'healthy',
            'service': 'AWS Compliance Checker',
            'version': '2.0'
        })
    }

