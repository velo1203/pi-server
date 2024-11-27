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
        const formattedDate = dateString.replace(/-/g, "");
        const meal = await SchoolApi.getMeal(formattedDate);
        const timetableText = JSON.stringify(timetable);
        const addPrompt =
            `\n 위는 사용자의 프롬프트야 추가적인 기능이 없으면 그냥 일반적인 응답을 반환해
        하지만 아래에 내가 정보를 줄거야, 아래의 정보가 필요한 명령은 내가 주는 정보를 활용해서 해, 예를들어 급식은 내가 주는 급식 정보를 활용하여 말하면 됨\n 그리고 뉴라인 없이 순수 글자로만 작성해` +
            `\n오늘 날짜: ${dateString} (${weekday})` +
            `\n급식: ${meal}` +
            `\n시간표: ${timetableText}`;

        if (key !== process.env.SECRET_KEY) {
            return NextResponse.json({ error: "Invalid key" }, { status: 403 });
        }

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
