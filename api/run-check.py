#!/usr/bin/env python3
"""Vercel serverless function for running compliance checks."""

import json
import logging
import os
import sys
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from aws_connector import AWSConnector
from enhanced_executor import EnhancedExecutor
from multi_framework_reporter import MultiFrameworkReporter

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_framework_mappings():
    """Load framework mapping configurations."""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Load framework mappings
    mappings_path = os.path.join(base_dir, "security_checks", "mappings", "frameworks.json")
    with open(mappings_path, "r") as f:
        framework_mappings = json.load(f)
    
    # Load NIST 800-53 mappings
    nist_53_path = os.path.join(base_dir, "mappings", "nist_800_53_mappings.json")
    with open(nist_53_path, "r") as f:
        nist_800_53_mappings = json.load(f)
    
    # Load NIST 800-171 mappings
    nist_171_path = os.path.join(base_dir, "mappings", "nist_800_171_mappings.json")
    with open(nist_171_path, "r") as f:
        nist_800_171_mappings = json.load(f)
    
    return framework_mappings, nist_800_53_mappings, nist_800_171_mappings


def handler(req):
    """Vercel serverless function handler."""
    try:
        # Handle Vercel request object
        method = req.method if hasattr(req, 'method') else req.get('method', 'GET')
        body = req.body if hasattr(req, 'body') else req.get('body', '{}')
        
        # Parse request body
        if method == 'GET':
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'message': 'AWS Compliance Checker API',
                    'usage': 'POST JSON with AWS credentials and options',
                    'example': {
                        'access_key': 'AKIAIOSFODNN7EXAMPLE',
                        'secret_key': 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
                        'session_token': 'optional',
                        'region': 'us-east-1',
                        'format': 'json',
                        'checks': [],
                        'skip_checks': [],
                        'severity': None,
                        'all_regions': True,
                        'workers': 10
                    }
                })
            }
        
        if method != 'POST':
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'error': 'Method not allowed. Use POST.'})
            }
        
        # Parse request body
        try:
            if isinstance(body, str):
                body = json.loads(body) if body else {}
            elif not isinstance(body, dict):
                body = {}
        except (json.JSONDecodeError, AttributeError):
            body = {}
        
        # Get AWS credentials from body or environment variables
        access_key = body.get('access_key') or os.environ.get('AWS_ACCESS_KEY_ID')
        secret_key = body.get('secret_key') or os.environ.get('AWS_SECRET_ACCESS_KEY')
        session_token = body.get('session_token') or os.environ.get('AWS_SESSION_TOKEN')
        
        if not access_key or not secret_key:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': 'Missing AWS credentials. Provide access_key and secret_key in request body or set environment variables.'
                })
            }
        
        # Get configuration options
        region = body.get('region', 'us-east-1')
        format_type = body.get('format', 'json')
        checks = body.get('checks', [])
        skip_checks = body.get('skip_checks', [])
        severity = body.get('severity')
        all_regions = body.get('all_regions', True)
        workers = body.get('workers', 10)
        parallel = body.get('parallel', True)
        
        # Initialize AWS connector
        try:
            aws_connector = AWSConnector(
                access_key=access_key,
                secret_key=secret_key,
                session_token=session_token,
                region=region
            )
            logger.info(f"Connected to AWS account: {aws_connector.account_id}")
        except Exception as e:
            logger.error(f"Failed to connect to AWS: {e}")
            return {
                'statusCode': 500,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({
                    'error': f'Failed to connect to AWS: {str(e)}'
                })
            }
        
        # Determine regions to check
        if all_regions:
            regions = aws_connector.get_all_regions()
            logger.info(f"Checking all {len(regions)} regions")
        else:
            regions = [region]
            logger.info(f"Checking single region: {region}")
        
        # Initialize executor
        executor = EnhancedExecutor(
            aws_connector=aws_connector,
            max_workers=workers if parallel else 1,
            progress_bar=False  # Disable progress bar for API
        )
        
        # Execute checks
        start_time = datetime.now(timezone.utc)
        logger.info("Executing security checks...")
        
        results = executor.execute_all_checks(
            regions=regions,
            skip_checks=skip_checks if skip_checks else None,
            specific_checks=checks if checks else None,
            min_severity=severity
        )
        
        execution_time = (datetime.now(timezone.utc) - start_time).total_seconds()
        logger.info(f"Completed {len(results)} checks in {execution_time:.1f} seconds")
        
        # Load framework mappings
        framework_mappings, nist_800_53_mappings, nist_800_171_mappings = load_framework_mappings()
        
        # Generate reports based on format
        reporter = MultiFrameworkReporter(
            results=results,
            framework_mappings=framework_mappings,
            nist_800_53_mappings=nist_800_53_mappings,
            nist_800_171_mappings=nist_800_171_mappings
        )
        
        # Calculate statistics
        total_checks = len(results)
        failed_checks = sum(1 for r in results if r['status'] == 'FAIL')
        error_checks = sum(1 for r in results if r['status'] == 'ERROR')
        passed_checks = total_checks - failed_checks - error_checks
        
        # Prepare response based on format
        response_data = {
            'account_id': aws_connector.account_id,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'execution_time_seconds': execution_time,
            'summary': {
                'total_checks': total_checks,
                'passed': passed_checks,
                'failed': failed_checks,
                'errors': error_checks,
                'pass_percentage': (passed_checks / total_checks * 100) if total_checks > 0 else 0
            },
            'results': results
        }
        
        # Add format-specific data
        if format_type == 'csv' or format_type == 'all':
            # Generate CSV report in memory
            csv_report = reporter.generate_enhanced_csv_report_string()
            response_data['csv_report'] = csv_report
        
        if format_type == 'nist-53' or format_type == 'all':
            nist_53_report = reporter.generate_nist_800_53_report_string()
            response_data['nist_800_53_report'] = nist_53_report
        
        if format_type == 'nist-171' or format_type == 'all':
            nist_171_report = reporter.generate_nist_800_171_report_string()
            response_data['nist_800_171_report'] = nist_171_report
        
        if format_type == 'multi-framework' or format_type == 'all':
            cross_framework = reporter.generate_cross_framework_matrix_string()
            response_data['cross_framework_matrix'] = cross_framework
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps(response_data, default=str)
        }
        
    except Exception as e:
        logger.error(f"Error processing request: {e}", exc_info=True)
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({
                'error': 'Internal server error',
                'message': str(e)
            })
        }

