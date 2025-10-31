'''
Business: Roblox authentication integration
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with user data
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
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    roblox_data = body_data.get('roblox_data', {})
    
    roblox_id = roblox_data.get('id')
    roblox_username = roblox_data.get('name', '')
    roblox_display_name = roblox_data.get('displayName', '')
    
    if not roblox_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Roblox ID required'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    avatar_url = f'https://www.roblox.com/headshot-thumbnail/image?userId={roblox_id}&width=150&height=150&format=png'
    
    cur.execute('SELECT id FROM users WHERE roblox_id = %s', (roblox_id,))
    existing = cur.fetchone()
    
    if existing:
        cur.execute('''
            UPDATE users 
            SET roblox_username = %s, first_name = %s, username = %s, photo_url = %s, last_login = CURRENT_TIMESTAMP
            WHERE roblox_id = %s
            RETURNING id, roblox_id, roblox_username, first_name, username, photo_url, wins, losses, rating, team_name
        ''', (roblox_username, roblox_display_name or roblox_username, roblox_username, avatar_url, roblox_id))
    else:
        cur.execute('''
            INSERT INTO users (roblox_id, roblox_username, first_name, last_name, username, photo_url, telegram_id)
            VALUES (%s, %s, %s, '', %s, %s, NULL)
            RETURNING id, roblox_id, roblox_username, first_name, username, photo_url, wins, losses, rating, team_name
        ''', (roblox_id, roblox_username, roblox_display_name or roblox_username, roblox_username, avatar_url))
    
    user_row = cur.fetchone()
    conn.commit()
    
    user_data = {
        'id': user_row[0],
        'roblox_id': user_row[1],
        'roblox_username': user_row[2],
        'first_name': user_row[3],
        'username': user_row[4],
        'photo_url': user_row[5],
        'wins': user_row[6],
        'losses': user_row[7],
        'rating': user_row[8],
        'team_name': user_row[9]
    }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'user': user_data
        })
    }