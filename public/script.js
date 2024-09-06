document.getElementById('startButton').addEventListener('click', async () => {
  const inputText = document.getElementById('urlInput').value;
  const urls = inputText.split(/[\n]+/).map(url => url.trim()).filter(url => url);
  const resultsDiv = document.getElementById('results');

  resultsDiv.innerHTML = ''; // Очистити результати перед початком

  const response = await fetch('/check', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ urls })
  });

  const results = await response.json();

  results.forEach(result => {
      const row = resultsDiv.insertRow();
      const cellUrl = row.insertCell(0);
      const cellCount = row.insertCell(1);
      cellUrl.textContent = result.url;
      cellCount.textContent = result.resultStats;
  });
});