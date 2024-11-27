import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { key, prompt } = body;

        if (!key || !prompt) {
            return NextResponse.json(
                { error: "Key and prompt are required" },
                { status: 400 }
            );
        }

        if (key !== process.env.SECRET_KEY) {
            return NextResponse.json({ error: "Invalid key" }, { status: 403 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 5000,
        });

        const result = response.choices[0]?.message?.content.trim();
        return NextResponse.json({ result });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
