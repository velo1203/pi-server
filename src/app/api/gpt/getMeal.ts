import axios from "axios";

class SchoolApi {
    private static readonly baseUrl = "https://api.디미고급식.com/meal/";

    public static async getMeal(date: string): Promise<string> {
        try {
            const url = `${SchoolApi.baseUrl}${date}`;
            const response = await axios.get(url);
            const data = response.data;

            if (data) {
                const { breakfast, lunch, dinner } = data;

                let result = "급식 섹션\n";
                if (breakfast) {
                    result += `<아침>\n${breakfast
                        .replace(/[0-9./\-*]/g, "")
                        .trim()}\n\n`;
                }
                if (lunch) {
                    result += `<점심>\n${lunch
                        .replace(/[0-9./\-*]/g, "")
                        .trim()}\n\n`;
                }
                if (dinner) {
                    result += `<저녁>\n${dinner
                        .replace(/[0-9./\-*]/g, "")
                        .trim()}\n\n`;
                } // This is the part that is different from the original code

                return result.trim();
            } else {
                return "오늘은 급식이 없습니다.";
            }
        } catch {
            return "급식 정보를 가져올 수 없습니다.";
        }
    }
}

export default SchoolApi;
