const TOUR_API_KEY = process.env.TOUR_API_KEY;
const BASE_URL = "https://apis.data.go.kr/B551011/KorService2/areaBasedList2";

export interface Attraction {
  title: string;
  addr1: string;
  firstimage?: string;
}

export const areaCodes: { [key: string]: string } = {
  "서울": "1",
  "인천": "2",
  "대전": "3",
  "대구": "4",
  "광주": "5",
  "부산": "6",
  "울산": "7",
  "세종": "8",
  "경기도": "31",
  "강원도": "32",
  "충청북도": "33",
  "충청남도": "34",
  "경상북도": "35",
  "경상남도": "36",
  "전라북도": "37",
  "전라남도": "38",
  "제주도": "39",
};

export const fetchAttractions = async (areaCode: string): Promise<Attraction[]> => {
  // Use the key from environment or a fallback
  const key = (!TOUR_API_KEY || TOUR_API_KEY === "MY_TOUR_API_KEY") 
    ? "a33fb1a9fa9bc0cde042711ad018c6ffbcf44847a0f8a69ffa3dc842bc492bfb" 
    : TOUR_API_KEY;

  try {
    const params = new URLSearchParams({
      serviceKey: key,
      numOfRows: "10",
      pageNo: "1",
      MobileOS: "ETC",
      MobileApp: "TopographyHelper",
      _type: "json",
      areaCode: areaCode,
      contentTypeId: "12", // Tourist attraction
    });

    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error("Failed to fetch from TourAPI");

    const data = await response.json();
    const items = data.response?.body?.items?.item;

    if (!items || (Array.isArray(items) && items.length === 0)) {
      console.warn("No items returned from TourAPI. Using mock data.");
      return getMockData(areaCode);
    }

    const itemList = Array.isArray(items) ? items : [items];

    return itemList.map((item: any) => ({
      title: item.title,
      addr1: item.addr1,
      firstimage: item.firstimage,
    }));
  } catch (error) {
    console.error("Error fetching from TourAPI:", error);
    return getMockData(areaCode);
  }
};

const getMockData = (areaCode: string): Attraction[] => {
  const mockData: { [key: string]: Attraction[] } = {
    "1": [ // 서울
      { title: "경복궁", addr1: "서울특별시 종로구 사직로 161" },
      { title: "남산서울타워", addr1: "서울특별시 용산구 남산공원길 105" },
      { title: "북촌한옥마을", addr1: "서울특별시 종로구 계동길 37" },
    ],
    "2": [ // 인천
      { title: "송도 센트럴파크", addr1: "인천광역시 연수구 컨벤시아대로 160" },
      { title: "차이나타운", addr1: "인천광역시 중구 차이나타운로26번길 12-17" },
      { title: "월미도", addr1: "인천광역시 중구 월미문화로 36" },
    ],
    "3": [ // 대전
      { title: "엑스포과학공원", addr1: "대전광역시 유성구 대덕대로 480" },
      { title: "계족산 황톳길", addr1: "대전광역시 대덕구 장동 산 59" },
      { title: "한밭수목원", addr1: "대전광역시 서구 둔산대로 169" },
    ],
    "4": [ // 대구
      { title: "이월드", addr1: "대구광역시 달서구 두류공원로 200" },
      { title: "김광석 다시그리기 길", addr1: "대구광역시 중구 달구벌대로 2238" },
      { title: "팔공산 케이블카", addr1: "대구광역시 동구 팔공산로185길 20" },
    ],
    "5": [ // 광주
      { title: "국립아시아문화전당", addr1: "광주광역시 동구 문화전당로 38" },
      { title: "무등산 국립공원", addr1: "광주광역시 동구 무등로 1550" },
      { title: "양림동 역사문화마을", addr1: "광주광역시 남구 양림동" },
    ],
    "6": [ // 부산
      { title: "해운대 해수욕장", addr1: "부산광역시 해운대구 해운대해변로 264" },
      { title: "감천문화마을", addr1: "부산광역시 사하구 감내2로 203" },
      { title: "광안리 해수욕장", addr1: "부산광역시 수영구 광안해변로 219" },
    ],
    "7": [ // 울산
      { title: "태화강 국가정원", addr1: "울산광역시 중구 태화강국가정원길 154" },
      { title: "대왕암공원", addr1: "울산광역시 동구 등대로 140" },
      { title: "간절곶", addr1: "울산광역시 울주군 서생면 간절곶1길 39-2" },
    ],
    "8": [ // 세종
      { title: "세종호수공원", addr1: "세종특별자치시 다솜로 216" },
      { title: "국립세종수목원", addr1: "세종특별자치시 수목원로 136" },
      { title: "베어트리파크", addr1: "세종특별자치시 전동면 신송로 217" },
    ],
    "31": [ // 경기
      { title: "에버랜드", addr1: "경기도 용인시 처인구 포곡읍 에버랜드로 199" },
      { title: "수원화성", addr1: "경기도 수원시 팔달구 정조로 825" },
      { title: "아침고요수목원", addr1: "경기도 가평군 상면 수목원로 432" },
    ],
    "32": [ // 강원
      { title: "설악산국립공원", addr1: "강원도 속초시 설악산로 833" },
      { title: "경포해변", addr1: "강원도 강릉시 창해로 514" },
      { title: "남이섬", addr1: "강원도 춘천시 남산면 남이섬길 1" },
    ],
    "33": [ // 충북
      { title: "청남대", addr1: "충청북도 청주시 상당구 문의면 청남대길 646" },
      { title: "단양 고수동굴", addr1: "충청북도 단양군 단양읍 고수동굴길 8" },
      { title: "속리산 국립공원", addr1: "충청북도 보은군 속리산면 법주사로 84" },
    ],
    "34": [ // 충남
      { title: "공주 무령왕릉", addr1: "충청남도 공주시 왕릉로 37" },
      { title: "부여 낙화암", addr1: "충청남도 부여군 부여읍 성왕로 247-9" },
      { title: "안면도 꽃지해수욕장", addr1: "충청남도 태안군 안면읍 승언리" },
    ],
    "35": [ // 경북
      { title: "경주 불국사", addr1: "경상북도 경주시 불국로 385" },
      { title: "안동 하회마을", addr1: "경상북도 안동시 풍천면 하회종가길 2-1" },
      { title: "포항 호미곶", addr1: "경상북도 포항시 남구 호미곶면 해맞이로 150번길 20" },
    ],
    "36": [ // 경남
      { title: "통영 미륵산 케이블카", addr1: "경상남도 통영시 발개로 205" },
      { title: "거제 바람의 언덕", addr1: "경상남도 거제시 남부면 갈곶리 산14-47" },
      { title: "진주성", addr1: "경상남도 진주시 남강로 626" },
    ],
    "37": [ // 전북
      { title: "전주 한옥마을", addr1: "전라북도 전주시 완산구 기린대로 99" },
      { title: "내장산 국립공원", addr1: "전라북도 정읍시 내장산로 1207" },
      { title: "군산 근대역사박물관", addr1: "전라북도 군산시 해망로 240" },
    ],
    "38": [ // 전남
      { title: "순천만 국가정원", addr1: "전라남도 순천시 국가정원1호길 47" },
      { title: "여수 오동도", addr1: "전라남도 여수시 오동도로 242" },
      { title: "담양 죽녹원", addr1: "전라남도 담양군 담양읍 죽녹원로 119" },
    ],
    "39": [ // 제주
      { title: "성산일출봉", addr1: "제주특별자치도 서귀포시 성산읍 일출로 284-12" },
      { title: "만장굴", addr1: "제주특별자치도 제주시 구좌읍 만장굴길 182" },
      { title: "한라산국립공원", addr1: "제주특별자치도 제주시 1100로 2070-61" },
    ],
  };

  return mockData[areaCode] || [
    { title: "해당 지역의 명소", addr1: "지역의 중심지" },
    { title: "해당 지역의 공원", addr1: "지역의 쉼터" },
    { title: "해당 지역의 문화재", addr1: "지역의 역사적 장소" },
  ];
};
