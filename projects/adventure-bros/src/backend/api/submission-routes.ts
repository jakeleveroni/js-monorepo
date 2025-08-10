import { sql } from "bun"

async function createHelpRequest(req: Request): Promise<Response> {
    
    const body = await req.json().catch((err) => {
        console.error('unable to parse body');
        return undefined;
    })

    if (!body) {
        return Response.json({
            error: 'unable to process request'
        }, { status: 400 })
    }

    if (!validateSubmission(body)) {
        return Response.json({
            error: 'Malformed response object'
        }, { status: 400 })
    }

    try {
        await sql`insert into submissions ${sql(body)}`
    } catch (err) {
        return Response.json({
            error: 'Unable to persist submission',
            message: err
        }, { status: 500 })
    }

    return Response.json({
        message: 'request submitted',
    });
}

export default {
    createHelpRequest
}

export type CreateSubmissionRequest = {
    name: string,
    phone: string,
    req_start_date?: string,
    req_end_date?: string,
    description: string,
}


// biome-ignore lint/suspicious/noExplicitAny: can use actual validation lib or more robust checking at some point
function validateSubmission(val: any): CreateSubmissionRequest | false {
    if (val.name && val.phone && val.description) {
        return val as CreateSubmissionRequest
    }

    return false
}