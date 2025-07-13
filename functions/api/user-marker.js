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

// GET /api/user-marker - Check if user has a marker
export async function onRequestGet(context) {
    const { request, env } = context;
    
    try {
        const clientIP = request.headers.get('CF-Connecting-IP') || 
                        request.headers.get('X-Forwarded-For') || 
                        request.headers.get('X-Real-IP') || 
                        'unknown';
        
        const salt = env.IP_HASH_SALT;
        const ipHash = await hashIP(clientIP, salt);
        
        const existing = await env.DB.prepare(
            "SELECT id FROM markers WHERE ip_hash = ?"
        ).bind(ipHash).first();
        
        return new Response(JSON.stringify({ hasMarker: !!existing }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

// OPTIONS /api/user-marker - Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
