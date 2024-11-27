import axios from "axios";

class SchoolApi {
    private static readonly baseUrl = "https://open.neis.go.kr/hub/";
    private static readonly apiKey = process.env.NEISKEY;
    private static readonly schoolCode = "7530560";
    private static readonly eduOfficeCode = "J10";

    private static readonly defaultParams = {
        KEY: SchoolApi.apiKey,
        Type: "json",
        ATPT_OFCDC_SC_CODE: SchoolApi.eduOfficeCode,
        SD_SCHUL_CODE: SchoolApi.schoolCode,
    };

    public static async getMeal(date: string): Promise<string> {
        try {
            const url = SchoolApi.baseUrl + "mealServiceDietInfo";
            const params = {
                ...SchoolApi.defaultParams,
                MLSV_YMD: date,
            };

            const response = await axios.get(url, { params });
            const data = response.data;

            if (data.mealServiceDietInfo) {
                const meals = data.mealServiceDietInfo[1].row;
                let result = "";

                for (const meal of meals) {
                    const mealType = meal.MMEAL_SC_NM;
                    const dishes = meal.DDISH_NM.replace(/<br\/>/g, "\n");
                    result += `<${mealType}>\n${dishes}\n\n`;
                }

                result = result.replace(/[0-9./\-*]/g, "");
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
