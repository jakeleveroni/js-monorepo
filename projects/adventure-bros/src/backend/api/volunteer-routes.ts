import { sql } from "bun"

async function createVolunteerRequest(req: Request): Promise<Response> {
    
    const body = await req.json().catch((err) => {
        console.error('unable to parse body', err);
        return undefined;
    })

    if (!body) {
        return Response.json({
            error: 'unable to process request'
        }, { status: 400 })
    }

    if (!validateVolunteerRequest(body)) {
        return Response.json({
            error: 'Malformed response object'
        }, { status: 400 })
    }

    try {
        await sql`insert into submissions ${sql(body)}`
    } catch (err) {
        return Response.json({
            error: 'Unable to persist volunteer request',
            message: err
        }, { status: 500 })
    }

    return Response.json({
        message: 'request submitted',
    });
}

export default {
    createVolunteerRequest
}

export type CreateVolunteerRequest = {
    name: string,
    phone: string,
    description: string,
}


// biome-ignore lint/suspicious/noExplicitAny: can use actual validation lib or more robust checking at some point
function validateVolunteerRequest(val: any): CreateVolunteerRequest | false {
    if (val.name && val.phone && val.description) {
        return val as CreateVolunteerRequest
    }

    return false
}