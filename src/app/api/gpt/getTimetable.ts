import axios from "axios";

class TimetableApi {
    private static readonly baseUrl = "https://open.neis.go.kr/hub/";
    private static readonly apiKey = process.env.NEISKEY;
    private static readonly schoolCode = "7430310"; // 한국 디지털 미디어 고등학교
    private static readonly eduOfficeCode = "J10"; // 경기교육청 코드

    private static readonly defaultParams = {
        KEY: TimetableApi.apiKey,
        Type: "json",
        ATPT_OFCDC_SC_CODE: TimetableApi.eduOfficeCode,
        SD_SCHUL_CODE: TimetableApi.schoolCode,
    };

    public static async getTimetable(
        date: string,
        grade: string,
        className: string
    ): Promise<string> {
        try {
            const url = TimetableApi.baseUrl + "hisTimetable";
            const params = {
                ...TimetableApi.defaultParams,
                ALL_TI_YMD: date, // 시간표 날짜
                GRADE: grade, // 학년
                CLASS_NM: className, // 학급명
            };

            const response = await axios.get(url, { params });
            const data = response.data;

            if (data.hisTimetable) {
                const timetable = data.hisTimetable[1].row;
                let result = `날짜: ${date}\n학년: ${grade}\n학급: ${className}\n\n`;

                for (const period of timetable) {
                    const periodNumber = period.PERIO; // 교시
                    const subject = period.ITRT_CNTNT; // 수업 내용
                    result += `${periodNumber}교시: ${subject}\n`;
                }

                return result.trim();
            } else {
                return "해당 날짜의 시간표를 찾을 수 없습니다.";
            }
        } catch (error) {
            console.error(error);
            return "시간표 정보를 가져올 수 없습니다.";
        }
    }
}

export default TimetableApi;
