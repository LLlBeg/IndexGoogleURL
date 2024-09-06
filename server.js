const express = require('express');
const puppeteer = require('puppeteer');
const XLSX = require('xlsx');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public')); // Статичні файли

// Головна сторінка з HTML та JavaScript
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Вказівка на ваш HTML-файл
});

// Функція затримки
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Обробка перевірки індексації
app.post('/check', async (req, res) => {
    const { urls } = req.body;
    const results = [];

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (const url of urls) {
        const domain = new URL(url).hostname; // Отримання домену з URL
        await page.goto(`https://www.google.com/search?q=site:${domain}`);

        // Затримка 5 секунд
        await delay(5000); // Використання функції затримки

        let resultStats;
        try {
            resultStats = await page.$eval('#result-stats', el => el.innerText);
        } catch (error) {
            resultStats = 'Не знайдено';
        }

        results.push({ url, resultStats });
    }

    await browser.close();
    res.json(results);
});

// Експорт результатів в Excel
app.post('/export', (req, res) => {
    const data = req.body;

    console.log("Дані для експорту:", data); // Логування даних

    if (!data || !Array.isArray(data) || data.length === 0) {
        return res.status(400).send('Немає даних для експорту');
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Результати');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Disposition', 'attachment; filename=results.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});

app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});