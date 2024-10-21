document.addEventListener("DOMContentLoaded", function () {
	getErinTime(document.getElementById("erinTime"));
	const locations = {
		"상인 네루": "티르코네일", "상인 누누": "던바튼", "상인 메루": "이멘마하", "상인 라누": "반호르", "상인 베루": "탈틴", "상인 에루": "타라",
		"상인 아루": "카브", "상인 피루": "벨바스트", "상인 세누": "스카하", "테일로": "켈라", "켄": "필리아", "리나": "코르", "카디": "발레스", 
		"귀넥": "카루", "얼리": "오아시스", "모락": "칼리다", "데위": "페라(자르딘)"
	};

	const setDefinitions = {
		    작물셋: ["튼튼한 달걀 주머니", "튼튼한 감자 주머니", "튼튼한 옥수수 주머니", "튼튼한 밀 주머니", "튼튼한 보리 주머니"],
		    방직셋: ["튼튼한 양털 주머니", "튼튼한 거미줄 주머니", "튼튼한 가는 실뭉치 주머니", "튼튼한 굵은 실뭉치 주머니"],
		    가죽셋: ["튼튼한 저가형 가죽 주머니", "튼튼한 일반 가죽 주머니", "튼튼한 고급 가죽 주머니", "튼튼한 최고급 가죽 주머니"],
		    옷감셋: ["튼튼한 저가형 옷감 주머니", "튼튼한 일반 옷감 주머니", "튼튼한 고급 옷감 주머니", "튼튼한 최고급 옷감 주머니"],
		    실크셋: ["튼튼한 저가형 실크 주머니", "튼튼한 일반 실크 주머니", "튼튼한 고급 실크 주머니", "튼튼한 최고급 실크 주머니", "튼튼한 꽃바구니"]
		};
	
	let pouchOrder = [];
		

	const server_ch = { "류트": 42, "하프": 24, "울프": 15, "만돌린": 15 };
	
	//이후 svg 제작 이미지로 수정 예정
	const jumoney_url = "https://api.na.mabibase.com/assets/item/icon/";
	const jumoney_key = [
	  "5110005",
	  "5110006",
	  "5110007",
	  "5110008",
	  "5110009",
	  "5110010",
	  "2041",
	  "2042",
	  "2043",
	  "5110014",
	  "5110015",
	  "5110016",
	  "5110017",
	  "5110018",
	  "5110019",
	  "5110020",
	  "5110021",
	  "5110022",
	  "5110023",
	  "5110024",
	  "5110025",
	  "5110044",
	];
	
	let dataCache = {};
	let nextResetTime = null;  // 전역 리셋 시간
	let API_KEY = "";

	// 초기 설정
	//getNpcData();
	
	window.onload = function () {
		const localApiKey = localStorage.getItem("apiKey");		
		const localServer = localStorage.getItem("server");
		const localChannel = localStorage.getItem("channel");
		const localNpc = localStorage.getItem("npc");
		
		if (localServer) 
		  document.getElementById("server").value = localServer;
		
		if (localChannel)
		  document.getElementById("ch").value = localChannel;
		
		if (localNpc)
		  document.getElementById("npc_nm").value = localNpc;		  
		
		setChannel(); //localServer 설정 한 후에		
		prevNextCh();
		
		//초기 리스트 바로 생성을 막기 위해 setChannel 이후 앱키 설정
		if (localApiKey) {
		  document.getElementById("apiKey").value = localApiKey;
		  API_KEY = localApiKey;
		}
		
	};

	function getLocatioin() {
		const npc_nm = document.getElementById("npc_nm").value;
		return npc_nm === "all" ? Object.keys(locations) : [npc_nm];
	}

	function setChannel() {
		const chSelect = document.getElementById("ch");
		const serverSelect = document.getElementById("server").value;
		const maxCh = server_ch[serverSelect];
		

		chSelect.innerHTML = "";
		
		for (let i = 1; i <= maxCh; i++) {
			if (i === 11) continue;
			let option = document.createElement('option');
			option.value = i;
			option.text = `${i}채`;
			chSelect.appendChild(option);
		}
				
		if(API_KEY != "") chSelect.dispatchEvent(new Event('change'));
	}

	async function getNpcData() {
		if(API_KEY == "") {
			alert("API KEY를 입력해주세요");
			return false;
		}
		
		const server_name = document.getElementById("server").value;
		const channel = document.getElementById("ch").value;
		const locations = getLocatioin();

		document.getElementById("tables").innerHTML = "";
		
		if( isResetNeeded() ) {
			console.log("캐시된 데이터 삭제");
			dataCache = {};
		}

		let shouldStop = false; // 호출 중단 여부를 결정하는 플래그 변수
		const fetchPromises = locations.map(async (npc) => {
			if (shouldStop) return null; // 중단 플래그가 true이면 요청하지 않음
			
			const result = await fetchNpcData(npc, server_name, channel);

	        if (result.error) {
	            console.warn(`Error: ${result.error.name}: ${result.error.message}`);
	            displayErrorMessage(npc, result.error.message);
	            shouldStop = true; // 에러 발생 시 중단 플래그 설정
	            return null;
	        }
	        
	        return { data: result, npc };			
		});

		const results = await Promise.all(fetchPromises);
		
		results.forEach(result => {
			if (result && result.npc && result.data.length > 0) {
				getJumoney(result.data, result.npc);
			} else {
				// 호출 단계에서 에러.	
			}
		});
		
		document.querySelectorAll('.item_nm').forEach(elem => {
			elem.addEventListener('click', () => {
				const parent = elem.parentElement; // 부모 요소 찾기
				const locationNm = parent.querySelector('.location_nm'); // .location_nm 요소 찾기
				
				if (locationNm) {
					locationNm.classList.toggle('hidden'); // locationNm 요소에 hidden 클래스 토글
				}
			});
		});
		
		/*
		document.querySelectorAll('.area-capture').forEach(elem => {
			elem.addEventListener('click', () => {
				const captureArea = elem.parentElement;
				copyToClipboard(captureArea);
			});
		});
		*/
		/* 
		//개별 채널링 아직
		document.querySelectorAll('.btnSearch').forEach(elem => {
			elem.addEventListener('click', () => {
				const color = { "color_01" : elem.getAttribute("data-info1"), "color_02": elem.getAttribute("data-info2")};
				searchMatchingPouches(elem, color);
			});
		});
		*/

		//document.getElementById("checkSet").addEventListener("click", checkSet);	
		document.getElementById("checkSet").addEventListener("click", () => { checkSetAllServers(false);});
		document.getElementById("checkAllServers").addEventListener("click", () => { checkSetAllServers(true);});
		
		// 요소 선택
	    //const openModalButton = document.querySelector('.open-modal');
	    //const modalOverlay = document.querySelector('.modal-overlay');
	    //const closeModalButton = document.querySelector('.close-button');
	    /*
	    const modal = document.getElementById("capture_modal");
	    // 모달 열기
	    document.querySelector(".btnOpenCapture").addEventListener('click', () => {
	    	modal.style.display = 'flex'; // 모달을 표시
	    });

	    // 모달 닫기
	    document.querySelector('.close-button').addEventListener('click', () => {
	    	modal.style.display = 'none'; // 모달을 숨김
	    });
		*/
	    // 모달 외부 클릭 시 닫기
	    /*
	    modalOverlay.addEventListener('click', (event) => {
	        if (event.target === modalOverlay) { // 배경 클릭 시에만 닫힘
	            modalOverlay.style.display = 'none';
	        }
	    });
	    */
		
	}

	function getUrlColor(colors){
		const urlColor = Object.values(colors).slice(0, 3);
	    return urlColor.map(color => '0x' + color.slice(1).toLowerCase()).join('%2C');
	}
	
	function getJumoney(data, npc) {	
		if (data.length < 1 && data.error) {
			alert(data.error.name + "\n" + data.error.message);
			console.warn(`No shop data for NPC: ${npc}`);
			return null;
		}
		
		const items = data;
		
		let table = `<div class="location-area"><h2 class="area-capture">${locations[npc]}</h2><div class="container">`;
		let count = 0;
		const max_cnt = 6; //한 열 최대 수
		const location_nm = locations[npc];

		items.forEach((key, index) => {
			const url = key.image_url;
			const item_nm = key.item_display_name;
			const color = extractItemColorsFromUrl(url);
			//if (count % max_cnt === 0) table += "<tr>";
			//캡쳐용 마을 이름 숨기기
			pouchOrder[count] = item_nm;
			table += `<div class="item"><h3 class="location_nm hidden">${location_nm}</h3>`;
			table += `<button class="btnOpenCapture" data-info1="${color.color_01}" data-info2="${color.color_02}" style="display:none;"></button>`;
			table += `<img src="${url}" alt="${item_nm}" class="api-img"><img src="${jumoney_url}${jumoney_key[index]}?colors=${getUrlColor(color)}" class="mabibase-img" onerror="this.src='./cute.png'"><label class="item_nm">${item_nm}</label>${setColorLabel(color)}</div>`;
			count++;
			//if (count % max_cnt === 0) table += "</tr>";
		});

		table += "</div></div>";
		document.getElementById("tables").insertAdjacentHTML('beforeend', table);
		document.getElementById("loading").style.display = "none";
		document.getElementById("tables").style.display = "block";
	}

	function extractItemColorsFromUrl(url) {
		try {
			const urlParams = new URL(url).searchParams;
			const itemColorEncoded = urlParams.get('item_color');
			if (!itemColorEncoded) return null;
			const itemColorDecoded = decodeURIComponent(itemColorEncoded);
			return JSON.parse(itemColorDecoded);
		} catch (error) {
			console.warn('Error extracting item colors:', error);
			return null;
		}
	}

	function setColorLabel(color) {
		if (!color) return '';
		let result = '<div class="color-info">';
		for (let i = 1; i <= 3; i++) {
			const cur_color = color["color_0" + i];
			result += `<p><span class="color_rect" style="background:${cur_color};"></span><label class="hex">${cur_color}</label><label class="rgb">${hexToRgbString(cur_color)}</label></p>`;
		}
		result += "</div>";
		return result;
	}

	function hexToRgbString(hex) {
		const rgb = hexToRgb(hex);
		return `${rgb.r} ${rgb.g} ${rgb.b}`;
	}

	function hexToRgb(hex) {
		const r = parseInt(hex.slice(1, 3), 16);
		const g = parseInt(hex.slice(3, 5), 16);
		const b = parseInt(hex.slice(5, 7), 16);
		return { r, g, b };
	}
	
	// 서버 변경 시 채널 목록 재설정
	document.getElementById("server").addEventListener("change", function() {
		const server = this.value; // 선택한 서버 가져오기
		localStorage.setItem("server", server); // 로컬 스토리지에 저장
	  	setChannel();
	});
	
	document.getElementById("npc_nm").addEventListener("change", function() {
		const npc = this.value; // 선택한 서버 가져오기
	  	localStorage.setItem("npc", npc); // 로컬 스토리지에 저장
		getNpcData();
	});
	
	document.getElementById("ch").addEventListener("change", getNpcData);	
	document.getElementById("setApiKey").addEventListener("click", function() {
		API_KEY = document.getElementById("apiKey").value;
		getNpcData();
	});
	
	// API 키 입력 필드에 이벤트 리스너 추가
	document.getElementById("apiKey").addEventListener("input", function() {
	  const apiKey = this.value; // 입력값 가져오기
	  localStorage.setItem("apiKey", apiKey); // 로컬 스토리지에 저장
	});

	// 채널 입력 필드에 이벤트 리스너 추가
	document.getElementById("ch").addEventListener("change", function() {
	  const channel = this.value; // 입력값 가져오기
	  localStorage.setItem("channel", channel); // 로컬 스토리지에 저장
	});	


	// 채널 전환 버튼
	function prevNextCh() {
		const selectBox = document.getElementById('ch');
		const prevButton = document.getElementById('prev');
		const nextButton = document.getElementById('next');

		prevButton.addEventListener('click', function () {
			selectBox.selectedIndex = selectBox.selectedIndex === 0 ? selectBox.options.length - 1 : selectBox.selectedIndex - 1;
			selectBox.dispatchEvent(new Event('change'));
		});

		nextButton.addEventListener('click', function () {
			selectBox.selectedIndex = selectBox.selectedIndex === selectBox.options.length - 1 ? 0 : selectBox.selectedIndex + 1;
			selectBox.dispatchEvent(new Event('change'));
		});
	}	
	
	//해당 지역 전체 채널링 - 단독이랑도 섞으면
	async function checkSetAllServers(all) {
	    const npc = document.getElementById("npc_nm").value;
	    const items = document.querySelectorAll('.item:not(.nomatch-addItem)');
	    if (npc === "all") return alert("특정 지역을 선택하세요.");
	    else if(items.length < 1)  return alert("지역 주머니 리스트 생성 후 다시 시도해주세요.");
	    
		let servers = [document.getElementById("server").value];
	    if(all) servers = Object.keys(server_ch);  // 모든 서버 목록 가져오기

	    let groupedItems = {};  // 색상별로 주머니를 그룹화
	
	    // 각 서버와 채널에서 주머니 데이터 수집
	    for (const server of servers) {
	        const maxCh = server_ch[server];
	
	        for (let ch = 1; ch <= maxCh; ch++) {
	            if (ch === 11) continue;  // 11채널 제외
	
	            const data = await fetchNpcData(npc, server, ch);  // 서버-채널 주머니 데이터 가져오기
	            data.forEach(item => {
	                const colors = extractItemColor(item.image_url);  // 주머니의 색상 추출
	                let colorKey = Object.values(colors);
					colorKey.splice(2, 1); //color_03 제외 4~5는 같은 색상 공유 인 것 확인, 3제외한 컬러를 키값으로 지정.
					colorKey = colorKey.join("-");

	                // 색상 키로 주머니 정보 초기화
	                if (!groupedItems[colorKey]) groupedItems[colorKey] = {};
	
	                if (!groupedItems[colorKey][item.item_display_name]) 
	                    groupedItems[colorKey][item.item_display_name] = { color_03: colors.color_03, servers: {} };

	                if (!groupedItems[colorKey][item.item_display_name].servers[server]) 
	                    groupedItems[colorKey][item.item_display_name].servers[server] = [];
	
	                // 채널 번호 추가
	                if (!groupedItems[colorKey][item.item_display_name].servers[server].includes(ch)) {
	                    groupedItems[colorKey][item.item_display_name].servers[server].push(ch);
	                }
	            });
	        }
	    }
	    
	    displaySets(groupedItems);  // 기존 displaySets 함수로 결과 표시
	}
	
	function sortGroupedItems(groupedItems) {
	    const sortedItems = {};

	    // 미리 정의한 순서에 따라 정렬
	    pouchOrder.forEach(itemName => {
	        for (const colorKey in groupedItems) {
	            if (groupedItems[colorKey][itemName]) {
	                if (!sortedItems[colorKey]) sortedItems[colorKey] = {};
	                sortedItems[colorKey][itemName] = groupedItems[colorKey][itemName];
	            }
	        }
	    });

	    return sortedItems;
	}
	
	function checkSetCompletion(itemGroup) {
	    const completedSets = {}; // 세트별 완성 여부 저장
	
	    Object.entries(setDefinitions).forEach(([setName, items]) => {
	        const itemNames = Object.keys(itemGroup); // 현재 그룹의 아이템 목록
	        const hasAllItems = items.every(item => itemNames.includes(item)); // 모든 아이템 포함 여부
	
	        if (setName === "방직셋") {
	            const hasWool = itemNames.includes("튼튼한 양털 주머니");
	            const hasOtherItems = ["튼튼한 거미줄 주머니", "튼튼한 가는 실뭉치 주머니", "튼튼한 굵은 실뭉치 주머니"]
	                .every(item => itemNames.includes(item));
	
	            // 방직셋 판별: 양털 없이 나머지 방직 아이템이 모두 있으면 '유사 방직셋'
	            if (hasAllItems) {
	                completedSets[setName] = `${setName}`;
	            } else if (hasOtherItems && !hasWool) {
	                completedSets[setName] = "유사 방직";
	            } else {
	                completedSets[setName] = null;
	            }
	
	        } else if (setName === "실크셋") {
	            const hasFlowerBasket = itemNames.includes("튼튼한 꽃바구니");
	            const silkItems = items.filter(item => item !== "튼튼한 꽃바구니"); // 꽃바구니 제외
	
	            const hasSilkItems = silkItems.every(item => itemNames.includes(item));
	
	            // 실크셋+: 모든 실크 아이템과 꽃바구니가 있을 때
	            // 실크셋: 모든 실크 아이템이 있고 꽃바구니가 없을 때
	            if (hasSilkItems) {
	                completedSets[setName] = hasFlowerBasket ? "실크셋+" : "실크셋";
	            } else {
	                completedSets[setName] = null;
	            }
	
	        } else {
	            // 다른 세트는 모든 아이템이 있을 경우만 완성으로 처리
	            completedSets[setName] = hasAllItems ? `${setName}` : null;
	        }
	    });
	
	    return completedSets;
	}
	
   	function displaySets(groupedItems) {
   	    const sortedItems = sortGroupedItems(groupedItems);
   	    const items = document.querySelectorAll('.item:not(.nomatch-addItem)');
   	    const container = document.querySelectorAll(".container")[0];
   	 	const processedColors = new Set(); // 처리된 색상 키를 추적

   	    document.querySelectorAll(".channel-info").forEach(element => element.remove());
   	 	document.querySelectorAll(".nomatch-addItem").forEach(element => element.remove());

   	    items.forEach((item, index) => {
   	        const imageUrl = item.querySelector(".api-img").src;
   	        const itemColors = extractItemColor(imageUrl);
   	        let colorKey = Object.values(itemColors);
   	        colorKey.splice(2, 1);
   	        colorKey = colorKey.join("-");

   	        const matchedItemGroup = sortedItems[colorKey];

   	        if (matchedItemGroup) {
   	            const channelInfoDiv = createChannelInfoDiv(matchedItemGroup);   	      
   	            items[index].appendChild(channelInfoDiv);
   	        	processedColors.add(colorKey); // 처리된 색상 키 추적
   	        }
   	    });
   	    
   		// 매칭되지 않은 색상 그룹을 새로 생성하여 .container에 추가
   	    Object.entries(sortedItems).forEach(([colorKey, itemGroup]) => {
   	        if (!processedColors.has(colorKey)) { 
				const newItem = createNewItem(colorKey, itemGroup);
   	            container.appendChild(newItem); // .container에 새 항목 추가
   	        }
   	    });
   	}	
   	
	// 채널 정보 DIV 생성 함수
	function createChannelInfoDiv(itemGroup) {
	    const channelInfoDiv = document.createElement("div");
	    channelInfoDiv.classList.add("channel-info");
	    channelInfoDiv.innerHTML = `<h4>채널링 정보</h4>`;
	    
	    const setInfo = checkSetCompletion(itemGroup);
	    
	    let setInfoText = Object.entries(setInfo)
	        .filter(([, status]) => status) // null이 아닌 값만 남김
	        .map(([setName, status]) => `<span class="setComplete ${setName}">${status}</span>`) // 세트명과 상태 결합
	        .join(", "); // 콤마로 구분
	
	    channelInfoDiv.innerHTML += `<p class="set-info">${setInfoText}</p>`;

	    Object.entries(itemGroup).forEach(([itemName, { color_03, servers }]) => {
	        let itemInfo = `<p><label class="info-jumoney-name">${itemName}</label>`;
	        itemInfo += `<span class="color-03" style="display:none" color-data="${color_03}"></span>`;
	        
	        Object.entries(servers).forEach(([server, chList]) => {
	            itemInfo += `<span class="info-channel all-server"><label class="server-mark ${server}"></label>${chList.join(", ")}</span>`;
	        });
	
	        itemInfo += "</p>";
	        channelInfoDiv.innerHTML += itemInfo;
	    });
	
	    return channelInfoDiv;
	}	
	
	// 새로운 팔레트 항목 생성 함수
	function createNewItem(colorKey, itemGroup) {
	    const newItem = document.createElement("div");
	    newItem.classList.add("item", "nomatch-addItem");
	
	    const colorArr = colorKey.split('-').splice(0, 2); //a,b 파트만 뒤에는 더미컬러
	    newItem.innerHTML = `
	        <div class="color-info">
	            ${colorArr.map(color => `
	                <p>
	                    <span class="color_rect" style="background:${color};"></span>
	                    <label class="hex">${color}</label>
	                    <label class="rgb">${hexToRgbString(color)}</label>
	                </p>`).join('')}
	        </div>`;
	
	    const channelInfoDiv = createChannelInfoDiv(itemGroup);
	    newItem.appendChild(channelInfoDiv);
	
	    return newItem;
	}
	
    async function fetchNpcData(npc, server, channel) {
    	const cacheKey = `${npc}_${server}_${channel}`; // 중복 호출을 피하기 위한 캐시키 생성 //호출 횟수 아껴야함...ㅠㅠ
        const url = `https://open.api.nexon.com/mabinogi/v1/npcshop/list?npc_name=${npc}&server_name=${server}&channel=${channel}`;
    	
    	//리셋 시간되면 무조건 캐시 초기화 밑 tables 초기화
    	if(isResetNeeded()){
			document.getElementById("tables").innerHTML = "";
			dataCache = {};
		}
    	
    	// 리셋 시간이 지나지 않았고 캐시가 존재하면 재사용
        if (dataCache[cacheKey] && !isResetNeeded()) {
			//간혹 리셋 되었는데 캐시된 데이터 사용한다는 로그가 뜨며 리스트 생성 안하는 증상 방지
			if( dataCache[cacheKey] ) { //데이터가 없다면 다시 불러오기
	            console.log(`캐시된 데이터 사용: ${cacheKey}`);
	            return dataCache[cacheKey];
            }
        }
    	
        console.log(`API 호출: ${cacheKey}`);
        
        try {
            const response = await fetch(url, { headers: { "x-nxopen-api-key": API_KEY } });
            const data = await response.json();
            checkSync(data.date_inquire); // 서버시간 동기화
            
            if (!response.ok || !data.shop) {
            	console.error(data.error.name + ": " + data.error.message);
            	document.getElementById("loading").style.display = "none";
            	document.getElementById("results").innerHTML = data.error.name + "<br/>" + data.error.message;
            	return data;
            }else{
				document.getElementById("results").innerHTML = "";	
			}
            
            //리셋 시간 변경 됐을 경우만 저장
            if (!nextResetTime || new Date(data.date_shop_next_update) > nextResetTime ) {
                nextResetTime = new Date(data.date_shop_next_update);
                setTime(nextResetTime);
                console.log(`다음 리셋 시간 갱신: ${nextResetTime}`);
            }
            
        	// 주머니 데이터 추출 및 캐시에 저장
            const items = data.shop.filter(shop => shop.tab_name === "주머니").flatMap(shop => shop.item);
            dataCache[cacheKey] = items;  // 캐시에 저장
            return items;
            
        } catch (error) {
            console.error("데이터 로드 오류:", error);
            return error;
        }
    }

	function extractItemColor(url) {
		const params = new URL(url).searchParams;
		return JSON.parse(decodeURIComponent(params.get("item_color") || "{}"));
	}
	
	//리셋 시간 체크
	function isResetNeeded() {
	    const now = new Date();
	    let result  = false;
	    	    
	    if(nextResetTime == null) result = true;
	    else if ( now >= nextResetTime ) result = true;
	  		
	    return result;
	}
	
	function setTime(nextResetTime) {
		const resetTime = convertToKST(nextResetTime);
		
        document.getElementById("today").innerText = resetTime.date;
        document.getElementById("lastCallTime").innerText = convertToKST(new Date().toISOString()).time;
        document.getElementById("time").innerText = resetTime.time;
	}
	
	
	// 한국 시간으로 리셋 시간 표시
	function convertToKST(isoDate) {
	    const date = new Date(isoDate).toLocaleString('ko-KR', {
	        timeZone: 'Asia/Seoul',
	        year: 'numeric',
	        month: '2-digit',
	        day: '2-digit',
	        hour: '2-digit',
	        minute: '2-digit',
	        hour12: true
	    });
	    
	    // 날짜와 시간-분을 분리
    	const parts = date.split(' ');
	
    	const datePart = parts.slice(0, 3).join('-').replace(/\./g, '').trim(); // "YYYY-MM-DD"
    	const timePart = `${parts[3]} ${parts[4]}`.trim(); // "오전 05:08" 형식

	    return { 
	        date: datePart,
	        time: timePart
	    };
	}
	
});

