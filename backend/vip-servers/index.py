'''
Business: Manage free VIP Roblox servers
Args: event - dict with httpMethod, body, queryStringParameters
      context - object with attributes: request_id, function_name
Returns: HTTP response dict with VIP servers data
'''

import json
import os
import psycopg2
import re
from typing import Dict, Any
import urllib.request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
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
                v.id, v.game_name, v.server_url, v.online_players, 
                v.max_players, v.created_at,
                u.first_name, u.last_name, u.username, u.roblox_username
            FROM vip_servers v
            LEFT JOIN users u ON v.creator_user_id = u.id
            ORDER BY v.created_at DESC
        ''')
        
        rows = cur.fetchall()
        servers = []
        
        for row in rows:
            creator_name = row[9] if row[9] else f"{row[6]} {row[7]}" if row[6] else "Unknown"
            servers.append({
                'id': row[0],
                'game_name': row[1],
                'server_url': row[2],
                'online_players': row[3],
                'max_players': row[4],
                'created_at': row[5].isoformat(),
                'creator_name': creator_name
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'servers': servers})
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        
        game_name = body_data.get('game_name', '').strip()
        server_url = body_data.get('server_url', '').strip()
        user_id = body_data.get('user_id')
        
        if not all([game_name, server_url]):
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Game name and server URL are required'})
            }
        
        if 'roblox.com' not in server_url:
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Invalid Roblox server URL'})
            }
        
        online_players = 0
        max_players = 50
        
        place_id_match = re.search(r'/games/(\d+)', server_url)
        if place_id_match:
            place_id = place_id_match.group(1)
            try:
                req = urllib.request.Request(
                    f'https://games.roblox.com/v1/games?universeIds={place_id}',
                    headers={'User-Agent': 'Mozilla/5.0'}
                )
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json.loads(response.read())
                    if data.get('data') and len(data['data']) > 0:
                        game_data = data['data'][0]
                        online_players = game_data.get('playing', 0)
                        max_players = game_data.get('maxPlayers', 50)
            except:
                pass
        
        cur.execute('''
            INSERT INTO vip_servers 
            (game_name, server_url, creator_user_id, online_players, max_players)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, created_at
        ''', (game_name, server_url, user_id, online_players, max_players))
        
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
                'server_id': row[0],
                'online_players': online_players,
                'max_players': max_players
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
