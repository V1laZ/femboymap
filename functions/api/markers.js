async function hashIP(ip, salt) {
    if (!salt) {
        throw new Error('Salt is required for hashing');
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// GET /api/markers - Get all markers
export async function onRequestGet(context) {
    const { env } = context;

    try {
        const { results } = await env.DB.prepare(
            "SELECT id, latitude, longitude FROM markers"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Database error:', error);
        return new Response(JSON.stringify({ error: 'Database error' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

// POST /api/markers - Add a new marker
export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const body = await request.json();
        const { latitude, longitude } = body;

        if (!latitude || !longitude) {
            return new Response(JSON.stringify({ error: 'Latitude and longitude are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return new Response(JSON.stringify({ error: 'Invalid coordinates' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const clientIP = request.headers.get('CF-Connecting-IP') ||
            request.headers.get('X-Forwarded-For') ||
            request.headers.get('X-Real-IP') ||
            'unknown';

        const salt = env.IP_HASH_SALT;
        const ipHash = await hashIP(clientIP, salt);

        const bannedIP = await env.DB.prepare(
            "SELECT id FROM banned_ips WHERE ip_hash = ?"
        ).bind(ipHash).first();

        if (bannedIP) {
            return new Response(JSON.stringify({ error: 'You are not allowed to place markers on this map.' }), {
                status: 403,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const existing = await env.DB.prepare(
            "SELECT id FROM markers WHERE ip_hash = ?"
        ).bind(ipHash).first();

        if (existing) {
            return new Response(JSON.stringify({ error: 'You already have a marker on the map. Remove it first to add a new one.' }), {
                status: 409,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        await env.DB.prepare(
            "INSERT INTO markers (ip_hash, latitude, longitude) VALUES (?, ?, ?)"
        ).bind(ipHash, latitude, longitude).run();

        return new Response(JSON.stringify({ success: true, message: 'Marker added successfully' }), {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error adding marker:', error);
        return new Response(JSON.stringify({ error: 'Failed to add marker' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

// DELETE /api/markers - Remove user's marker
export async function onRequestDelete(context) {
    const { request, env } = context;

    try {
        const clientIP = request.headers.get('CF-Connecting-IP') ||
            request.headers.get('X-Forwarded-For') ||
            request.headers.get('X-Real-IP') ||
            'unknown';

        const salt = env.IP_HASH_SALT;
        const ipHash = await hashIP(clientIP, salt);

        const result = await env.DB.prepare(
            "DELETE FROM markers WHERE ip_hash = ?"
        ).bind(ipHash).run();

        if (result.changes === 0) {
            return new Response(JSON.stringify({ error: 'No marker found to remove' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        return new Response(JSON.stringify({ success: true, message: 'Marker removed successfully' }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('Error removing marker:', error);
        return new Response(JSON.stringify({ error: 'Failed to remove marker' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
}

// OPTIONS /api/markers - Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
