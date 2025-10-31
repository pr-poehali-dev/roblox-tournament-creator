'''
Business: Telegram authentication for tournament platform
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with user data or error
'''

import json
import os
import psycopg2
from typing import Dict, Any
from hashlib import sha256
import hmac

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
    telegram_data = body_data.get('telegram_data', {})
    
    telegram_id = telegram_data.get('id')
    if not telegram_id:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Telegram ID required'})
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    if bot_token and not verify_telegram_auth(telegram_data, bot_token):
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Invalid authentication'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    username = telegram_data.get('username', '')
    first_name = telegram_data.get('first_name', '')
    last_name = telegram_data.get('last_name', '')
    photo_url = telegram_data.get('photo_url', '')
    
    cur.execute('''
        INSERT INTO users (telegram_id, username, first_name, last_name, photo_url, last_login)
        VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
        ON CONFLICT (telegram_id) 
        DO UPDATE SET 
            username = EXCLUDED.username,
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            photo_url = EXCLUDED.photo_url,
            last_login = CURRENT_TIMESTAMP
        RETURNING id, telegram_id, username, first_name, last_name, photo_url, wins, losses, rating, team_name
    ''', (telegram_id, username, first_name, last_name, photo_url))
    
    user_row = cur.fetchone()
    conn.commit()
    
    user_data = {
        'id': user_row[0],
        'telegram_id': user_row[1],
        'username': user_row[2],
        'first_name': user_row[3],
        'last_name': user_row[4],
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

def verify_telegram_auth(auth_data: Dict[str, Any], bot_token: str) -> bool:
    check_hash = auth_data.get('hash')
    if not check_hash:
        return False
    
    data_check_arr = []
    for key, value in sorted(auth_data.items()):
        if key != 'hash':
            data_check_arr.append(f'{key}={value}')
    
    data_check_string = '\n'.join(data_check_arr)
    secret_key = sha256(bot_token.encode()).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), sha256).hexdigest()
    
    return calculated_hash == check_hash
