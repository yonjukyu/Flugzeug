export function GET() {
    return new Response("Hello, world!", {
        headers: {
            "content-type": "text/plain",
        },
    });
}

export function POST() {
    return new Response("Hello, world!", {
        headers: {
            "content-type": "text/plain",
        },
    });
}