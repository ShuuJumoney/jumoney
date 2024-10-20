/*
async function copyToClipboard(captureArea) {
	console.log("click");
	console.log(captureArea);
	if(!captureArea) return false;
	try {
		console.log(captureArea);
		const canvas = await html2canvas(captureArea, {
			useCORS: true, // CORS 설정으로 외부 이미지 허용
			logging: true, // 디버깅 로그 확인 가능
			backgroundColor: null // 투명 배경 유지 (필요시)
		}); // div를 캔버스로 렌더링
		canvas.toBlob(async (blob) => {
		const item = new ClipboardItem({ 'image/png': blob });
		await navigator.clipboard.write([item]); // 클립보드에 이미지 복사
		alert('이미지가 클립보드에 복사되었습니다!');
	});
	} catch (error) {
		console.error('이미지 복사 실패:', error);
		alert('이미지를 복사하는데 실패했습니다.');
	}
}
*/

/*
async function copyToClipboard(captureArea) {
  console.log("click");
  console.log(captureArea);
  if (!captureArea) return false;

  // 1. Canvas 생성 및 크기 설정
  const canvas = document.createElement('canvas');
  const rect = captureArea.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  const context = canvas.getContext('2d');

  // 2. 배경색 채우기 (투명 배경 방지)
  const bgColor = getComputedStyle(captureArea).backgroundColor || 'white';
  context.fillStyle = bgColor;
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 3. 이미지 및 텍스트 렌더링
  const promises = Array.from(captureArea.children).map((child) => {
	console.log(child);
    return new Promise((resolve, reject) => {
      if (child.tagName === 'IMG') {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // CORS 문제 해결 시도
        console.log(child.src);
        img.src = child.src;

        img.onload = () => {
          context.drawImage(img, 0, 0, child.width, child.height); // 이미지 위치 조정
          resolve();
        };

        img.onerror = (err) => {
          console.error('이미지 로드 실패:', err);
          reject(err);
        };
      } else if (child.tagName === 'H1' || child.tagName === 'P') {
        const style = getComputedStyle(child);
        context.font = `${style.fontSize} ${style.fontFamily}`;
        context.fillStyle = style.color;
        const yPos = child.tagName === 'H1' ? 30 : 100;
        context.fillText(child.innerText, 10, yPos);
        resolve();
      } else {
        resolve(); // 이미지나 텍스트가 아닐 경우 건너뜀
      }
    });
  });

  // 4. 모든 요소가 렌더링된 후 클립보드에 복사
  try {
    await Promise.all(promises);
    canvas.toBlob(async (blob) => {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      alert('이미지가 클립보드에 복사되었습니다!');
    }, 'image/png');
  } catch (error) {
    console.error('복사 실패:', error);
    alert('클립보드 복사에 실패했습니다.');
  }
}
*/
/*
async function copyToClipboard(captureArea) {
  const canvas = document.createElement('canvas');
  const rect = captureArea.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  const context = canvas.getContext('2d');

  // 캔버스 배경 설정
  context.fillStyle = getComputedStyle(captureArea).backgroundColor || 'white';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 재귀적으로 모든 img 태그 찾기
  function findImages(element) {
    const images = [];
    const children = element.children;

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      if (child.tagName === 'IMG') {
        images.push(child);
      }
      // 자식 노드가 더 있다면 재귀적으로 탐색
      images.push(...findImages(child));
    }

    return images;
  }

  // 이미지 태그 찾기
  const images = findImages(captureArea);

  // 이미지 로드 및 렌더링 프로미스 배열
  const promises = images.map((img) => {
    return new Promise((resolve, reject) => {
      const loadedImage = new Image();
      loadedImage.crossOrigin = 'anonymous'; // CORS 문제 해결 시도
      loadedImage.src = img.src;

      loadedImage.onload = () => {
        const imgRect = img.getBoundingClientRect();
        context.drawImage(
          loadedImage,
          imgRect.left - rect.left,
          imgRect.top - rect.top,
          imgRect.width,
          imgRect.height
        );
        resolve();
      };

      loadedImage.onerror = (err) => {
        console.error('이미지 로드 실패:', err);
        reject(err);
      };
    });
  });

  try {
    // 모든 이미지 로딩 후 캡처
    await Promise.all(promises);
    canvas.toBlob(async (blob) => {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      alert('이미지가 클립보드에 복사되었습니다!');
    }, 'image/png');
  } catch (error) {
    console.error('복사 실패:', error);
    alert('클립보드 복사에 실패했습니다.');
  }
}
*/

function convertImageToDataURL(img) {
  const tempCanvas = document.createElement('canvas');
  const context = tempCanvas.getContext('2d');
  tempCanvas.width = img.width;
  tempCanvas.height = img.height;

  context.drawImage(img, 0, 0);
  // 이미지가 CORS에 걸리면 toDataURL이 실패할 수 있습니다.
  try {
    return tempCanvas.toDataURL('image/png');
  } catch (error) {
    console.error('이미지를 Data URL로 변환할 수 없습니다:', error);
    return null;
  }
}

async function copyToClipboard(captureArea) {
  const canvas = document.createElement('canvas');
  const rect = captureArea.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  const context = canvas.getContext('2d');

  const images = Array.from(captureArea.getElementsByTagName('img'));

  const promises = images.map((img) => {
    return new Promise((resolve, reject) => {
      const dataURL = convertImageToDataURL(img);
      if (dataURL) {
        const loadedImage = new Image();
        loadedImage.src = dataURL;

        loadedImage.onload = () => {
          const imgRect = img.getBoundingClientRect();
          context.drawImage(
            loadedImage,
            imgRect.left - rect.left,
            imgRect.top - rect.top,
            imgRect.width,
            imgRect.height
          );
          resolve();
        };

        loadedImage.onerror = (err) => {
          console.error('이미지 로드 실패:', err);
          reject(err);
        };
      } else {
        reject('CORS 문제로 이미지를 가져올 수 없습니다.');
      }
    });
  });

  try {
    await Promise.all(promises);
    canvas.toBlob(async (blob) => {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      alert('이미지가 클립보드에 복사되었습니다!');
    }, 'image/png');
  } catch (error) {
    console.error('복사 실패:', error);
    alert('클립보드 복사에 실패했습니다.');
  }
}
