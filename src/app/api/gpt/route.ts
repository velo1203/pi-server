import { NextResponse } from "next/server";
import OpenAI from "openai";
import SchoolApi from "./getMeal";
import timetable from "./timetable.json";

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

        const today = new Date();
        const dateString = today.toISOString().split("T")[0];
        const days = [
            "일요일",
            "월요일",
            "화요일",
            "수요일",
            "목요일",
            "금요일",
            "토요일",
        ];
        const weekday = days[today.getDay()];

        let addContext = "";
        const lowerPrompt = prompt.toLowerCase();

        if (lowerPrompt.includes("급식") || lowerPrompt.includes("meal")) {
            const meal = await SchoolApi.getMeal(dateString);
            addContext += `\n오늘 날짜: ${dateString} (${weekday})`;
            addContext += `\n급식: ${meal}`;
        }

        if (
            lowerPrompt.includes("시간표") ||
            lowerPrompt.includes("timetable")
        ) {
            const todaySchedule = timetable.timetable[weekday];

            if (todaySchedule) {
                addContext += `\n시간표: ${JSON.stringify(todaySchedule)}`;
            } else {
                addContext += `\n시간표: 오늘은 등록된 시간표가 없습니다.`;
            }
        }

        const finalPrompt = addContext
            ? `${prompt}\n\n추가 정보:\n${addContext}`
            : prompt;

        const response = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [{ role: "user", content: finalPrompt }],
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
