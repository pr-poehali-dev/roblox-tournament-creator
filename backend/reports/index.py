'''
Business: Player reports and feedback system
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with reports data
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        user_id = body_data.get('user_id')
        reported_player = body_data.get('reported_player', '').strip()
        report_type = body_data.get('report_type', '').strip()
        description = body_data.get('description', '').strip()
        
        if not all([user_id, reported_player, report_type, description]):
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'All fields are required'})
            }
        
        cur.execute('''
            INSERT INTO player_reports 
            (reporter_user_id, reported_player_name, report_type, description)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at
        ''', (user_id, reported_player, report_type, description))
        
        row = cur.fetchone()
        conn.commit()
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'success': True,
                'report_id': row[0],
                'message': 'Report submitted successfully'
            })
        }
    
    if method == 'GET':
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        
        if user_id:
            cur.execute('''
                SELECT id, reported_player_name, report_type, description, status, created_at
                FROM player_reports
                WHERE reporter_user_id = %s
                ORDER BY created_at DESC
            ''', (user_id,))
        else:
            cur.execute('''
                SELECT id, reported_player_name, report_type, description, status, created_at
                FROM player_reports
                ORDER BY created_at DESC
                LIMIT 50
            ''')
        
        rows = cur.fetchall()
        reports = []
        
        for row in rows:
            reports.append({
                'id': row[0],
                'reported_player': row[1],
                'type': row[2],
                'description': row[3],
                'status': row[4],
                'created_at': row[5].isoformat()
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'reports': reports})
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }
