import { NextResponse } from "next/server";
import OpenAI from "openai";
import SchoolApi from "./getMeal";
import TimetableApi from "./getTimetable";

const openai = new OpenAI({
    apiKey: process.env.GPT_API_KEY,
});

export async function POST(req) {
    try {
        const body = await req.json();
        const { key, prompt, date, grade, className } = body;

        if (!key || !prompt) {
            return NextResponse.json(
                { error: "Key and prompt are required" },
                { status: 400 }
            );
        }

        if (key !== process.env.SECRET_KEY) {
            return NextResponse.json({ error: "Invalid key" }, { status: 403 });
        }

        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const meal = await SchoolApi.getMeal(today);
        const timetable =
            date && grade && className
                ? await TimetableApi.getTimetable(date, grade, className)
                : "";

        const addPrompt =
            `\n 위는 사용자의 프롬프트야 추가적인 기능이 없으면 그냥 일반적인 응답을 반환해\n` +
            `급식 정보:\n${meal}\n\n시간표 정보:\n${timetable}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt + addPrompt }],
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
