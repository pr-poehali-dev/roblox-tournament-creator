'''
Business: Create and manage Roblox tournaments
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with tournaments data
'''

import json
import os
import psycopg2
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(database_url)
    cur = conn.cursor()
    
    if method == 'GET':
        cur.execute('''
            SELECT 
                t.id, t.name, t.game_name, t.roblox_server_url, 
                t.max_players, t.prize_robux, t.current_players, 
                t.status, t.start_date, t.created_at,
                u.first_name, u.last_name, u.username
            FROM tournaments t
            LEFT JOIN users u ON t.creator_user_id = u.id
            ORDER BY t.created_at DESC
        ''')
        
        rows = cur.fetchall()
        tournaments = []
        
        for row in rows:
            tournaments.append({
                'id': row[0],
                'name': row[1],
                'game': row[2],
                'robloxServerUrl': row[3],
                'maxPlayers': row[4],
                'prize': row[5],
                'players': row[6],
                'status': row[7],
                'startDate': row[8].isoformat() if row[8] else None,
                'createdAt': row[9].isoformat(),
                'creator': {
                    'first_name': row[10],
                    'last_name': row[11],
                    'username': row[12]
                }
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'tournaments': tournaments})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        name = body_data.get('name', '').strip()
        game_name = body_data.get('game_name', '').strip()
        roblox_server_url = body_data.get('roblox_server_url', '').strip()
        max_players = body_data.get('max_players')
        prize_robux = body_data.get('prize_robux')
        user_id = body_data.get('user_id')
        start_date = body_data.get('start_date')
        
        if not all([name, game_name, roblox_server_url, max_players, prize_robux]):
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
        
        if max_players < 2 or max_players > 1000:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Max players must be between 2 and 1000'})
            }
        
        cur.execute('''
            INSERT INTO tournaments 
            (name, game_name, roblox_server_url, max_players, prize_robux, creator_user_id, start_date)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, name, game_name, roblox_server_url, max_players, prize_robux, current_players, status, created_at
        ''', (name, game_name, roblox_server_url, max_players, prize_robux, user_id, start_date))
        
        row = cur.fetchone()
        conn.commit()
        
        tournament = {
            'id': row[0],
            'name': row[1],
            'game': row[2],
            'robloxServerUrl': row[3],
            'maxPlayers': row[4],
            'prize': row[5],
            'players': row[6],
            'status': row[7],
            'createdAt': row[8].isoformat()
        }
        
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
                'tournament': tournament
            })
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
