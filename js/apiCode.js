const ApiErrorCode = {
	"OPENAPI00001"	: 	["Internal Server Error", "서버 내부 오류"],
	"OPENAPI00002"	:	["Forbidden","권한이 없는 경우"],
	"OPENAPI00003"	:	["Bad Request","유효하지 않은 식별자"],
	"OPENAPI00004"	:	["Bad Request","파라미터 누락 또는 유효하지 않음"],
	"OPENAPI00005"	:	["Bad Request","유효하지 않은 API KEY"],
	"OPENAPI00006"	:	["Bad Request","유효하지 않은 게임 또는 API PATH"],
	"OPENAPI00007"	:	["Too Many Requests ","API 호출량 초과"],
	"OPENAPI00009"	:	["Bad Request","데이터 준비 중"],
	"OPENAPI00010"	:	["Bad Request","게임 점검 중"],
	"OPENAPI00011"	:	["Service Unavailable","API 점검 중"],
	"Hey Nexon..."	:	["Nexon didn't work🤔", "받은 데이터에 상품 리스트가 없습니다"]
};

function getErrorMessage(code) {
	return ApiErrorCode[code];
}